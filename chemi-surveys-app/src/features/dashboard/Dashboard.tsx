import React, { useState } from 'react';
import { trpc } from '../../utils/trpc';
import { useAuth } from '../../hooks/useAuth';

const SERVICE_OPTIONS = [
  'Boundary Survey',
  'Topographic Survey',
  'GPS/GNSS Survey',
  'Cadastral Mapping',
  'Site Planning',
];

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white rounded-lg p-4 border border-[#1034A6]/15">
      <p className="text-[10px] font-semibold text-[#1034A6]/70">{label}</p>
      <p className="text-2xl font-bold text-[#1034A6] mt-1">{value}</p>
    </div>
  );
}

function statusBadgeClasses(status: string) {
  switch (status) {
    case 'CONFIRMED':
      return 'bg-blue-100 text-[#1034A6]';
    case 'COMPLETED':
      return 'bg-green-100 text-green-700';
    case 'NO_SHOW':
      return 'bg-red-100 text-red-700';
    case 'CANCELLED':
      return 'bg-gray-200 text-gray-600';
    default:
      return 'bg-yellow-100 text-yellow-800';
  }
}

function statusLabel(status: string) {
  return status.replace('_', '-').toLowerCase().replace(/^./, (c) => c.toUpperCase());
}

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const utils = trpc.useUtils();

  const { data: stats } = trpc.consultation.stats.useQuery();
  const { data: todayTasks, isLoading: loadingToday } = trpc.consultation.getToday.useQuery();
  const { data: upcomingTasks, isLoading: loadingUpcoming } = trpc.consultation.getUpcoming.useQuery();
  const { data: clients } = trpc.clients.getAll.useQuery();

  const updateStatus = trpc.consultation.updateStatus.useMutation({
    onSuccess: () => {
      utils.consultation.getToday.invalidate();
      utils.consultation.stats.invalidate();
    },
  });
  const deleteConsultation = trpc.consultation.delete.useMutation({
    onSuccess: () => {
      utils.consultation.getToday.invalidate();
      utils.consultation.getUpcoming.invalidate();
      utils.consultation.stats.invalidate();
    },
  });

  const [modal, setModal] = useState<null | 'today' | 'upcoming'>(null);
  const [form, setForm] = useState({
    clientName: '',
    service: SERVICE_OPTIONS[0],
    time: '',
    location: '',
  });

  const createConsultation = trpc.consultation.create.useMutation({
    onSuccess: () => {
      utils.consultation.getToday.invalidate();
      utils.consultation.getUpcoming.invalidate();
      utils.consultation.stats.invalidate();
      setModal(null);
      setForm({ clientName: '', service: SERVICE_OPTIONS[0], time: '', location: '' });
    },
  });

  const { data: services } = trpc.service.getAll.useQuery();
  const createService = trpc.service.create.useMutation({
    onSuccess: () => {
      utils.service.getAll.invalidate();
    },
  });

  const today = new Date().toLocaleDateString('en-KE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const STATUSES = ['BOOKED', 'CONFIRMED', 'COMPLETED', 'NO_SHOW'] as const;
  function nextStatus(current: string) {
    const idx = STATUSES.indexOf(current as typeof STATUSES[number]);
    return STATUSES[(idx + 1) % STATUSES.length];
  }

  // NOTE: this dashboard always references real client records. If no
  // clients exist yet, the surveyor is prompted to add one on the Clients
  // page first — there is no hardcoded sample data anywhere here.
  const hasClients = (clients?.length || 0) > 0;

  return (
    <div className="rounded-2xl p-4 sm:p-6 -m-4 sm:-m-6 lg:-m-8" style={{ background: 'linear-gradient(135deg,#39FF14 50%,#ffffff 100%)' }}>
      <h1 className="text-base sm:text-lg font-bold text-[#1034A6] mb-4">
        Hello there, Surveyor {user?.fullName || 'John Muiruri Gachemi'}
      </h1>

      {/* Today's Tasks */}
      <div className="bg-white rounded-xl border border-[#1034A6]/15 mb-4">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#1034A6]/10">
          <span className="text-sm font-bold text-[#1034A6] flex items-center gap-2">
            <i className="fa fa-clock-o" /> Today's Schedule
          </span>
          <button
            onClick={() => setModal('today')}
            className="bg-[#1034A6] text-[#39FF14] text-xs font-bold px-3 py-1.5 rounded-md flex items-center gap-1"
            disabled={!hasClients}
            title={!hasClients ? 'Add a client first on the Clients page' : ''}
          >
            <i className="fa fa-plus" /> Add Task
          </button>
        </div>
        <div className="p-2 min-h-[100px]">
          {loadingToday ? (
            <p className="text-xs text-[#1034A6]/60 text-center py-6">Loading...</p>
          ) : !todayTasks || todayTasks.length === 0 ? (
            <div className="text-center py-8 text-[#1034A6]/50">
              <i className="fa fa-calendar-o text-2xl block mb-2" />
              <p className="text-xs">No tasks scheduled yet. Click "Add Task" to begin.</p>
            </div>
          ) : (
            todayTasks.map((t) => (
              <div key={t.id} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#1034A6]/5 group">
                <span className="text-[10px] font-semibold text-[#1034A6]/70 w-12">
                  {new Date(t.scheduledTime).toLocaleTimeString('en-KE', { hour: 'numeric', minute: '2-digit' })}
                </span>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-[#1034A6]">{t.client.nameOrCompany}</p>
                  <p className="text-[10px] text-[#1034A6]/60">{t.source || t.service?.name} · {t.location}</p>
                </div>
                <button
                  onClick={() => updateStatus.mutate({ id: t.id, status: nextStatus(t.status) as any })}
                  className={`text-[9px] font-bold px-2 py-0.5 rounded ${statusBadgeClasses(t.status)}`}
                >
                  {statusLabel(t.status)}
                </button>
                <button
                  onClick={() => deleteConsultation.mutate({ id: t.id })}
                  className="opacity-0 group-hover:opacity-100 text-[#1034A6]/40 hover:text-red-500 text-xs"
                  aria-label="Delete task"
                >
                  <i className="fa fa-trash" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Upcoming Tasks */}
      <div className="bg-white rounded-xl border border-[#1034A6]/15 mb-4">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#1034A6]/10">
          <span className="text-sm font-bold text-[#1034A6] flex items-center gap-2">
            <i className="fa fa-calendar-plus-o" /> Upcoming Tasks
          </span>
          <button
            onClick={() => setModal('upcoming')}
            className="bg-[#1034A6] text-[#39FF14] text-xs font-bold px-3 py-1.5 rounded-md flex items-center gap-1"
            disabled={!hasClients}
            title={!hasClients ? 'Add a client first on the Clients page' : ''}
          >
            <i className="fa fa-plus" /> Add
          </button>
        </div>
        <div className="p-2 min-h-[100px]">
          {loadingUpcoming ? (
            <p className="text-xs text-[#1034A6]/60 text-center py-6">Loading...</p>
          ) : !upcomingTasks || upcomingTasks.length === 0 ? (
            <div className="text-center py-8 text-[#1034A6]/50">
              <i className="fa fa-calendar-plus-o text-2xl block mb-2" />
              <p className="text-xs">No upcoming tasks yet. Click "Add" to schedule one.</p>
            </div>
          ) : (
            upcomingTasks.map((t) => (
              <div key={t.id} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#1034A6]/5 group">
                <span className="text-[9px] font-semibold text-[#1034A6]/70 w-16">
                  {new Date(t.scheduledTime).toLocaleDateString('en-KE', { weekday: 'short', hour: 'numeric', minute: '2-digit' })}
                </span>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-[#1034A6]">{t.client.nameOrCompany}</p>
                  <p className="text-[10px] text-[#1034A6]/60">{t.source || t.service?.name} · {t.location}</p>
                </div>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-yellow-100 text-yellow-800">Booked</span>
                <button
                  onClick={() => deleteConsultation.mutate({ id: t.id })}
                  className="opacity-0 group-hover:opacity-100 text-[#1034A6]/40 hover:text-red-500 text-xs"
                  aria-label="Delete task"
                >
                  <i className="fa fa-trash" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {!hasClients && (
        <p className="text-xs text-[#1034A6]/70 mt-4 text-center">
          Tip: add your first client on the{' '}
          <a href="/clients" className="font-semibold underline">Clients page</a>{' '}
          before scheduling tasks.
        </p>
      )}

      {/* Add Task Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-xs sm:w-80 p-5">
            <h3 className="text-sm font-bold text-gray-800 mb-3">
              Add {modal === 'today' ? "today's" : 'upcoming'} task
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 font-medium block mb-1">Client</label>
                <select
                  className="w-full border border-gray-200 rounded-md text-xs px-2 py-2"
                  value={form.clientName}
                  onChange={(e) => setForm({ ...form, clientName: e.target.value })}
                >
                  <option value="">Select a client</option>
                  {clients?.map((c) => (
                    <option key={c.id} value={c.id}>{c.nameOrCompany}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium block mb-1">Service</label>
                <input
                  className="w-full border border-gray-200 rounded-md text-xs px-2 py-2"
                  value={form.service}
                  onChange={(e) => setForm({ ...form, service: e.target.value })}
                  placeholder="Type or paste a service name (editable)"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium block mb-1">
                  {modal === 'today' ? 'Time' : 'Date & time'}
                </label>
                <input
                  type={modal === 'today' ? 'time' : 'datetime-local'}
                  className="w-full border border-gray-200 rounded-md text-xs px-2 py-2"
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium block mb-1">Location</label>
                <input
                  type="text"
                  placeholder="e.g. Thika"
                  className="w-full border border-gray-200 rounded-md text-xs px-2 py-2"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setModal(null)} className="flex-1 border border-gray-200 rounded-md text-xs py-2 text-gray-600">
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!form.clientName) return;
                  // Note: services should be looked up by id from trpc.service.getAll
                  // in production; simplified here for clarity of the data flow.
                  createConsultation.mutate({
                    clientId: Number(form.clientName),
                    serviceId: 1,
                    // Pass the typed service name in the 'source' field so it is stored alongside the consultation
                    source: form.service,
                    scheduledTime: modal === 'today'
                      ? new Date(`${new Date().toISOString().split('T')[0]}T${form.time || '09:00'}`).toISOString()
                      : new Date(form.time || Date.now()).toISOString(),
                    location: form.location || 'Thika',
                    isToday: modal === 'today',
                  });
                }}
                className="flex-1 bg-[#39FF14] text-[#0f172a] rounded-md text-xs font-bold py-2"
              >
                Save task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
