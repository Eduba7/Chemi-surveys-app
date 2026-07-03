import React, { useMemo, useState } from 'react';
import { trpc } from '../../utils/trpc';
import { generateFieldReportPdf } from '../../utils/generateFieldReportPdf';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function StatPreviewCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
      <p className="text-[10px] font-medium text-gray-500">{label}</p>
      <p className="text-xl font-bold text-[#1034A6] mt-1">{value}</p>
    </div>
  );
}

function statusBadgeClasses(status: string) {
  switch (status) {
    case 'CONFIRMED': return 'bg-blue-100 text-[#1034A6]';
    case 'COMPLETED': return 'bg-green-100 text-green-700';
    case 'NO_SHOW': return 'bg-red-100 text-red-700';
    case 'CANCELLED': return 'bg-gray-200 text-gray-600';
    default: return 'bg-yellow-100 text-yellow-800';
  }
}

export const Reports: React.FC = () => {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth()); // 0-indexed, defaults to current month
  const [year, setYear] = useState(now.getFullYear());
  const [generating, setGenerating] = useState(false);

  const { data: allConsultations, isLoading: loadingConsultations } =
    trpc.consultation.getAll.useQuery({});
  const { data: clients, isLoading: loadingClients } = trpc.clients.getAll.useQuery();

  const monthLabel = `${MONTH_NAMES[month]} ${year}`;

  const { fieldTasks, upcomingTasks, stats } = useMemo(() => {
    const all = allConsultations || [];

    const inSelectedMonth = all.filter((c) => {
      const d = new Date(c.scheduledTime);
      return d.getMonth() === month && d.getFullYear() === year;
    });

    const afterSelectedMonth = all.filter((c) => {
      const d = new Date(c.scheduledTime);
      return (
        d.getFullYear() > year ||
        (d.getFullYear() === year && d.getMonth() > month)
      );
    });

    const completed = inSelectedMonth.filter((c) => c.status === 'COMPLETED').length;
    const confirmed = inSelectedMonth.filter((c) => c.status === 'CONFIRMED').length;
    const booked = inSelectedMonth.filter((c) => c.status === 'BOOKED').length;
    const cancelled = inSelectedMonth.filter((c) => c.status === 'CANCELLED').length;
    const noShow = inSelectedMonth.filter((c) => c.status === 'NO_SHOW').length;
    const total = inSelectedMonth.length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : null;

    return {
      fieldTasks: inSelectedMonth,
      upcomingTasks: afterSelectedMonth,
      stats: {
        totalTasks: total,
        completed,
        confirmed,
        booked,
        cancelled,
        noShow,
        completionRate,
        activeClients: clients?.length || 0,
        totalUpcoming: afterSelectedMonth.length,
      },
    };
  }, [allConsultations, clients, month, year]);

  function handleGenerate() {
    setGenerating(true);
    (async () => {
      try {
        await generateFieldReportPdf({
        monthLabel,
        stats,
        fieldTasks: fieldTasks.map((t) => ({
          clientName: t.client.nameOrCompany,
          serviceName: t.service.name,
          location: t.location || '—',
          scheduledTime: t.scheduledTime,
          status: t.status,
        })),
        upcomingTasks: upcomingTasks.map((t) => ({
          clientName: t.client.nameOrCompany,
          serviceName: t.service.name,
          location: t.location || '—',
          scheduledTime: t.scheduledTime,
          status: t.status,
        })),
        clients: (clients || []).map((c) => ({
          nameOrCompany: c.nameOrCompany,
          phone: c.phone,
          email: c.email,
        })),
        });
      } finally {
        setGenerating(false);
      }
    })();
  }

  const isLoading = loadingConsultations || loadingClients;
  const yearOptions = [now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1];

  return (
    <div className="max-w-3xl">
      <h1 className="text-lg font-semibold text-gray-900">Reports</h1>
      <p className="text-xs text-gray-500 mt-1 mb-5">
        Generate a printable monthly field report — firm letterhead, summary
        stats, field tasks, upcoming tasks, and your client directory, all in
        one PDF. No server round-trip; the file downloads instantly to your
        device.
      </p>

      {/* Month & year picker */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4 sm:p-5 mb-5">
        <p className="text-xs font-semibold text-gray-700 mb-3">Report period</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="flex-1 border border-gray-200 rounded-lg text-sm px-3 py-2.5 outline-none focus:ring-2 focus:ring-[#1034A6]/30"
          >
            {MONTH_NAMES.map((m, i) => (
              <option key={m} value={i}>{m}</option>
            ))}
          </select>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="w-full sm:w-32 border border-gray-200 rounded-lg text-sm px-3 py-2.5 outline-none focus:ring-2 focus:ring-[#1034A6]/30"
          >
            {yearOptions.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Live stat preview */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4 sm:p-5 mb-5">
        <p className="text-xs font-semibold text-gray-700 mb-3">
          Live preview — {monthLabel}
        </p>
        {isLoading ? (
          <p className="text-sm text-gray-400 text-center py-6">Loading report data...</p>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
              <StatPreviewCard label="Total tasks" value={stats.totalTasks} />
              <StatPreviewCard label="Completed" value={stats.completed} />
              <StatPreviewCard label="Confirmed" value={stats.confirmed} />
              <StatPreviewCard label="Booked" value={stats.booked} />
              <StatPreviewCard label="Cancelled" value={stats.cancelled} />
              <StatPreviewCard label="No-shows" value={stats.noShow} />
              <StatPreviewCard
                label="Completion rate"
                value={stats.completionRate === null ? '—' : `${stats.completionRate}%`}
              />
              <StatPreviewCard label="Active clients" value={stats.activeClients} />
            </div>

            <p className="text-[11px] text-gray-500 mb-2">
              {fieldTasks.length} field task{fieldTasks.length === 1 ? '' : 's'} this
              month · {upcomingTasks.length} upcoming beyond this month ·{' '}
              {clients?.length || 0} client{(clients?.length || 0) === 1 ? '' : 's'} in directory
            </p>

            {fieldTasks.length > 0 && (
              <div className="overflow-x-auto -mx-1">
                <table className="w-full text-xs min-w-[480px]">
                  <thead>
                    <tr className="text-left text-gray-400 border-b border-gray-100">
                      <th className="py-1.5 px-1 font-medium">Date</th>
                      <th className="py-1.5 px-1 font-medium">Client</th>
                      <th className="py-1.5 px-1 font-medium">Service</th>
                      <th className="py-1.5 px-1 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fieldTasks.slice(0, 5).map((t) => (
                      <tr key={t.id} className="border-b border-gray-50">
                        <td className="py-1.5 px-1 text-gray-600 whitespace-nowrap">
                          {new Date(t.scheduledTime).toLocaleDateString('en-KE', { day: '2-digit', month: 'short' })}
                        </td>
                        <td className="py-1.5 px-1 text-gray-800 font-medium">{t.client.nameOrCompany}</td>
                        <td className="py-1.5 px-1 text-gray-600">{t.service.name}</td>
                        <td className="py-1.5 px-1">
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${statusBadgeClasses(t.status)}`}>
                            {t.status.replace('_', '-')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {fieldTasks.length > 5 && (
                  <p className="text-[10px] text-gray-400 mt-1.5">
                    +{fieldTasks.length - 5} more task{fieldTasks.length - 5 === 1 ? '' : 's'} included in the full PDF
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Generate button */}
      <button
        onClick={handleGenerate}
        disabled={isLoading || generating}
        className="w-full sm:w-auto bg-[#39FF14] text-[#0f172a] font-bold text-sm px-6 py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60 shadow-sm hover:brightness-95 transition"
      >
        <i className="fa fa-file-pdf-o" />
        {generating ? 'Generating PDF...' : 'Generate PDF'}
      </button>
      <p className="text-[11px] text-gray-400 mt-2">
        Downloads instantly as{' '}
        <span className="font-mono">CSMC_Field_Report_{MONTH_NAMES[month]}_{year}.pdf</span>{' '}
        — generated entirely on your device, no server upload required.
      </p>
    </div>
  );
};
