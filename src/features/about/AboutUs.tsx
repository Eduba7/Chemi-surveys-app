import React from 'react';
import { trpc } from '../../utils/trpc';

export const AboutUs: React.FC = () => {
  const { data: staff } = trpc.auth.staffDirectory.useQuery();

  return (
    <div>
      <h1 className="text-lg font-semibold text-gray-900 mb-4">About Us</h1>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-5">
        <h2 className="text-base font-semibold text-[#1034A6] mb-2">
          Chemi Surveys &amp; Mapping Consultants
        </h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          Founded in 2019 by Surveyor John Muiruri Gachemi — a proud alumnus of the
          Technical University of Kenya (TUK) — Chemi Surveys &amp; Mapping Consultants
          is a precision land surveying and spatial data firm headquartered in Thika,
          Kiambu County, Kenya. From cadastral boundary surveys to topographic mapping
          and GPS/GNSS fieldwork, we deliver accurate, professional, and legally
          compliant surveying solutions for individuals, developers, institutions, and
          government entities across the region.
        </p>
        <p className="text-sm text-gray-600 leading-relaxed mt-3">
          Our team of certified land surveyors and field technicians combines modern
          GNSS technology, GIS software, and rigorous data verification to ensure every
          boundary peg, contour line, and parcel map meets the standards of the Survey
          of Kenya and relevant county authorities.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {(staff || []).map((s) => (
          <div key={s.id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
            <p className="text-sm font-semibold text-gray-900">{s.fullName}</p>
            <p className="text-xs text-[#39FF14] font-semibold bg-[#1034A6] inline-block px-1.5 rounded mt-1">
              {s.jobTitle}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              <i className="fa fa-phone mr-1.5" /> {s.phone}
            </p>
          </div>
        ))}
        <div className="bg-blue-50/50 border border-dashed border-blue-200 rounded-xl p-4 flex flex-col items-center justify-center text-center">
          <p className="text-sm font-semibold text-gray-400">Open position</p>
          <p className="text-xs text-gray-400 mt-1">GIS Technician — join our growing team</p>
        </div>
      </div>
    </div>
  );
};
