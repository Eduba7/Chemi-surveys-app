import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface ReportConsultation {
  clientName: string;
  serviceName: string;
  location: string;
  scheduledTime: string | Date;
  status: string;
}

export interface ReportClient {
  nameOrCompany: string;
  phone?: string | null;
  email?: string | null;
}

export interface ReportStats {
  totalTasks: number;
  completed: number;
  confirmed: number;
  booked: number;
  cancelled: number;
  noShow: number;
  completionRate: number | null;
  activeClients: number;
  totalUpcoming: number;
}

export interface ReportData {
  monthLabel: string; // e.g. "June 2026"
  stats: ReportStats;
  fieldTasks: ReportConsultation[]; // tasks within the selected month
  upcomingTasks: ReportConsultation[]; // tasks after the selected month
  clients: ReportClient[];
}

const BLUE: [number, number, number] = [16, 52, 166]; // #1034A6
const NEON: [number, number, number] = [57, 255, 20]; // #39FF14 (used sparingly, dark text needed on it)
const DARK_TEXT: [number, number, number] = [15, 23, 42];
const GRAY: [number, number, number] = [100, 116, 139];

const STATUS_COLORS: Record<string, [number, number, number]> = {
  CONFIRMED: [219, 234, 254],
  COMPLETED: [220, 252, 231],
  BOOKED: [254, 249, 195],
  CANCELLED: [226, 232, 240],
  NO_SHOW: [254, 226, 226],
};
const STATUS_TEXT_COLORS: Record<string, [number, number, number]> = {
  CONFIRMED: [16, 52, 166],
  COMPLETED: [21, 128, 61],
  BOOKED: [133, 77, 14],
  CANCELLED: [71, 85, 105],
  NO_SHOW: [185, 28, 28],
};

function formatDateTime(value: string | Date) {
  const d = new Date(value);
  return d.toLocaleString('en-KE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function statusLabel(status: string) {
  return status.replace('_', '-').toLowerCase().replace(/^./, (c) => c.toUpperCase());
}

function addFooter(doc: jsPDF) {
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFontSize(8);
    doc.setTextColor(...GRAY);
    doc.text(
      `Chemi Surveys & Mapping Consultants — Field Report`,
      14,
      pageHeight - 8
    );
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - 14, pageHeight - 8, {
      align: 'right',
    });
  }
}

function addLetterhead(doc: jsPDF, monthLabel: string, letterheadDataUrl?: string | null) {
  const pageWidth = doc.internal.pageSize.getWidth();
  // New letterhead layout: left logo block, centered firm name, right contact block
  const margin = 14;

  // If an exact letterhead image is provided, embed it and keep minimal text overlay
  if (letterheadDataUrl) {
    try {
      const imgWidth = pageWidth - margin * 2;
      const imgHeight = 42; // approximate height for the image
      doc.addImage(letterheadDataUrl, 'JPEG', margin, 8, imgWidth, imgHeight);
      // small title below image
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...DARK_TEXT);
      doc.text(`Monthly Field Report — ${monthLabel}`, margin, 8 + imgHeight + 6);
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...GRAY);
      doc.text(
        `Generated on ${new Date().toLocaleString('en-KE', { dateStyle: 'long', timeStyle: 'short' })}`,
        margin,
        8 + imgHeight + 12
      );
      return 8 + imgHeight + 16;
    } catch (e) {
      // fall back to drawn text header below
    }
  }

  // Left vertical accent bar
  doc.setFillColor(...BLUE);
  doc.rect(margin - 4, 8, 6, 34, 'F');

  // Firm name (prominent, centered-left)
  doc.setTextColor(...BLUE);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('CHEMI SURVEYS & MAPPING CONSULTANTS', margin + 6, 16);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...GRAY);
  doc.text('Precision Land Surveying & Spatial Data Services', margin + 6, 22);

  // Right-aligned contact block
  doc.setFontSize(9);
  doc.setTextColor(...DARK_TEXT);
  doc.text('Surveyor John Muiruri Gachemi', pageWidth - margin, 14, { align: 'right' });
  doc.setFontSize(8);
  doc.setTextColor(...GRAY);
  doc.text('johnmuiruri68@gmail.com • 0703 676 856', pageWidth - margin, 19, { align: 'right' });
  doc.text('KIGIO PLAZA, 4th Floor, Room K482 — Thika, Kiambu County, Kenya', pageWidth - margin, 24, { align: 'right' });

  // Thin divider
  doc.setDrawColor(...BLUE);
  doc.setLineWidth(0.6);
  doc.line(margin, 30, pageWidth - margin, 30);

  // Report title below letterhead
  doc.setTextColor(...DARK_TEXT);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(`Monthly Field Report — ${monthLabel}`, margin, 38);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...GRAY);
  doc.text(
    `Generated on ${new Date().toLocaleString('en-KE', { dateStyle: 'long', timeStyle: 'short' })}`,
    margin,
    44
  );

  return 54; // y cursor after letterhead
}

function addStatBoxes(doc: jsPDF, startY: number, stats: ReportStats) {
  const boxes = [
    { label: 'Total tasks', value: String(stats.totalTasks) },
    { label: 'Completed', value: String(stats.completed) },
    { label: 'Confirmed', value: String(stats.confirmed) },
    { label: 'Booked', value: String(stats.booked) },
    { label: 'Cancelled', value: String(stats.cancelled) },
    { label: 'No-shows', value: String(stats.noShow) },
    {
      label: 'Completion rate',
      value: stats.completionRate === null ? '—' : `${stats.completionRate}%`,
    },
    { label: 'Active clients', value: String(stats.activeClients) },
  ];

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  const gap = 4;
  const cols = 4;
  const boxWidth = (pageWidth - margin * 2 - gap * (cols - 1)) / cols;
  const boxHeight = 20;

  boxes.forEach((box, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = margin + col * (boxWidth + gap);
    const y = startY + row * (boxHeight + gap);

    doc.setFillColor(245, 247, 250);
    doc.setDrawColor(...BLUE);
    doc.roundedRect(x, y, boxWidth, boxHeight, 2, 2, 'FD');

    doc.setTextColor(...GRAY);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.text(box.label, x + 4, y + 7);

    doc.setTextColor(...BLUE);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(box.value, x + 4, y + 16);
  });

  const rows = Math.ceil(boxes.length / cols);
  return startY + rows * (boxHeight + gap) + 6;
}

function addSectionTitle(doc: jsPDF, y: number, title: string) {
  doc.setTextColor(...BLUE);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 14, y);
  doc.setDrawColor(...BLUE);
  doc.setLineWidth(0.4);
  doc.line(14, y + 1.5, doc.internal.pageSize.getWidth() - 14, y + 1.5);
  return y + 7;
}

export async function generateFieldReportPdf(data: ReportData) {
  // Attempt to fetch the exact letterhead image from the public folder
  let letterheadDataUrl: string | null = null;
  try {
    const url = encodeURI('/chemi letterhead_page-0001.jpg');
    const resp = await fetch(url);
    if (resp.ok) {
      const blob = await resp.blob();
      letterheadDataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    }
  } catch (e) {
    // ignore and use text header fallback
  }

  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  let y = addLetterhead(doc, data.monthLabel, letterheadDataUrl);
  y = addStatBoxes(doc, y, data.stats);

  // --- Field tasks table (this month) ---
  y = addSectionTitle(doc, y + 2, `Field Tasks — ${data.monthLabel}`);

  if (data.fieldTasks.length === 0) {
    doc.setFontSize(9);
    doc.setTextColor(...GRAY);
    doc.setFont('helvetica', 'italic');
    doc.text('No field tasks recorded for this month.', 14, y + 4);
    y += 12;
  } else {
    autoTable(doc, {
      startY: y,
      margin: { left: 14, right: 14 },
      head: [['Date & time', 'Client', 'Service', 'Location', 'Status']],
      body: data.fieldTasks.map((t) => [
        formatDateTime(t.scheduledTime),
        t.clientName,
        t.serviceName,
        t.location,
        statusLabel(t.status),
      ]),
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: BLUE, textColor: [255, 255, 255], fontStyle: 'bold' },
      didParseCell: (hookData) => {
        if (hookData.section === 'body' && hookData.column.index === 4) {
          const rawStatus = data.fieldTasks[hookData.row.index]?.status || 'BOOKED';
          const bg = STATUS_COLORS[rawStatus] || STATUS_COLORS.BOOKED;
          const fg = STATUS_TEXT_COLORS[rawStatus] || STATUS_TEXT_COLORS.BOOKED;
          hookData.cell.styles.fillColor = bg;
          hookData.cell.styles.textColor = fg;
          hookData.cell.styles.fontStyle = 'bold';
        }
      },
    });
    // @ts-ignore - jspdf-autotable extends doc with lastAutoTable
    y = (doc as any).lastAutoTable.finalY + 10;
  }

  // --- Upcoming tasks table ---
  if (y > 250) {
    doc.addPage();
    y = 16;
  }
  y = addSectionTitle(doc, y, 'Upcoming Tasks (beyond this month)');

  if (data.upcomingTasks.length === 0) {
    doc.setFontSize(9);
    doc.setTextColor(...GRAY);
    doc.setFont('helvetica', 'italic');
    doc.text('No upcoming tasks scheduled beyond this month.', 14, y + 4);
    y += 12;
  } else {
    autoTable(doc, {
      startY: y,
      margin: { left: 14, right: 14 },
      head: [['Date & time', 'Client', 'Service', 'Location']],
      body: data.upcomingTasks.map((t) => [
        formatDateTime(t.scheduledTime),
        t.clientName,
        t.serviceName,
        t.location,
      ]),
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: BLUE, textColor: [255, 255, 255], fontStyle: 'bold' },
    });
    // @ts-ignore
    y = (doc as any).lastAutoTable.finalY + 10;
  }

  // --- Client directory ---
  if (y > 250) {
    doc.addPage();
    y = 16;
  }
  y = addSectionTitle(doc, y, 'Client Directory');

  if (data.clients.length === 0) {
    doc.setFontSize(9);
    doc.setTextColor(...GRAY);
    doc.setFont('helvetica', 'italic');
    doc.text('No clients on record yet.', 14, y + 4);
  } else {
    autoTable(doc, {
      startY: y,
      margin: { left: 14, right: 14 },
      head: [['Client / company name', 'Phone', 'Email']],
      body: data.clients.map((c) => [
        c.nameOrCompany,
        c.phone || '—',
        c.email || '—',
      ]),
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: BLUE, textColor: [255, 255, 255], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });
  }

  addFooter(doc);

  const fileMonth = data.monthLabel.replace(' ', '_');
  doc.save(`CSMC_Field_Report_${fileMonth}.pdf`);
}
