import React, { useState } from 'react';
import { trpc } from '../../utils/trpc';

const FILTERS = [
  { key: undefined, label: 'All' },
  { key: 'BOOKED', label: 'Booked' },
  { key: 'CONFIRMED', label: 'Confirmed' },
  { key: 'COMPLETED', label: 'Completed' },
  { key: 'CANCELLED', label: 'Cancelled' },
  { key: 'NO_SHOW', label: 'No-show' },
] as const;

function statusBadgeClasses(status: string) {
  switch (status) {
    case 'CONFIRMED': return 'bg-blue-100 text-[#1034A6]';
    case 'COMPLETED': return 'bg-green-100 text-green-700';
    case 'NO_SHOW': return 'bg-red-100 text-red-700';
    case 'CANCELLED': return 'bg-gray-200 text-gray-600';
    default: return 'bg-yellow-100 text-yellow-800';
  }
}

export const Consultations: React.FC = () => {
  const [filter, setFilter] = useState<typeof FILTERS[number]['key']>(undefined);
  const { data: consultations, isLoading } = trpc.consultation.getAll.useQuery({ status: filter });

  return (
    <div>
      <h1 className="text-lg font-semibold text-gray-900">Consultations</h1>
      <p className="text-xs text-gray-500 mt-1 mb-5">Manage all appointment records and track statuses</p>

      <div className="flex gap-2 mb-4 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f.label}
            onClick={() => setFilter(f.key)}
            className={`text-xs font-medium px-3 py-1.5 rounded-md border ${
              filter === f.key
                ? 'bg-[#1034A6] text-white border-transparent'
                : 'bg-transparent text-gray-500 border-gray-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-400 text-center py-10">Loading...</p>
      ) : !consultations || consultations.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl">
          <i className="fa fa-comments text-3xl text-gray-300 block mb-3" />
          <p className="text-sm text-gray-500">No consultation records yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {consultations.map((c) => (
            <div key={c.id} className="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-4 shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-[#1034A6] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {c.client.nameOrCompany.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">{c.client.nameOrCompany}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {c.service.name} · {c.location} · {new Date(c.scheduledTime).toLocaleString('en-KE')}
                </p>
              </div>
              <span className={`text-[10px] font-bold px-2 py-1 rounded ${statusBadgeClasses(c.status)}`}>
                {c.status.replace('_', '-')}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
