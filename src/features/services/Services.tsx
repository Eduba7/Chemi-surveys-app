import React from 'react';
import { trpc } from '../../utils/trpc';

const ICONS: Record<string, string> = {
  'border-outer': 'fa-square-o',
  'trending-up': 'fa-line-chart',
  satellite: 'fa-wifi',
  'map-2': 'fa-map-o',
  building: 'fa-building',
  database: 'fa-database',
};

export const Services: React.FC = () => {
  const { data: services, isLoading } = trpc.service.getAll.useQuery();

  return (
    <div>
      <h1 className="text-lg font-semibold text-gray-900">Services</h1>
      <p className="text-xs text-gray-500 mt-1 mb-5">
        Survey and mapping services offered by Chemi Consultants
      </p>

      {isLoading ? (
        <p className="text-sm text-gray-400 text-center py-10">Loading services...</p>
      ) : (
        <div className="space-y-3">
          {(services || []).map((s) => (
            <div key={s.id} className="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-4 shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-[#1034A6]/10 flex items-center justify-center text-[#1034A6] flex-shrink-0">
                <i className={`fa ${ICONS[s.iconKey || ''] || 'fa-cog'}`} />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{s.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
