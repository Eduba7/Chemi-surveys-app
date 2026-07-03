import React from 'react';

export const ContactUs: React.FC = () => {
  return (
    <div>
      <h1 className="text-lg font-semibold text-gray-900">Contact Us</h1>
      <p className="text-xs text-gray-500 mt-1 mb-5">
        Reach out for consultations, project inquiries, or survey bookings
      </p>

      <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm mb-4">
        <p className="text-xs text-gray-400 font-medium mb-1">Office address</p>
        <p className="text-sm font-medium text-gray-900">
          KIGIO PLAZA, 4th Floor — Room K482, Thika Town, Kiambu County, Kenya
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
          <p className="text-xs text-gray-400 font-medium mb-1">Primary contact</p>
          <p className="text-sm font-medium text-gray-900">John Muiruri Gachemi</p>
          <p className="text-xs text-gray-500 mt-1">0703 676 856</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
          <p className="text-xs text-gray-400 font-medium mb-1">Email</p>
          <p className="text-sm font-medium text-gray-900">johnmuiruri68@gmail.com</p>
        </div>
      </div>

      {/* Google Maps placeholder — replace `src` with an embed URL using
          your Google Maps API key, centered on Thika / KIGIO PLAZA */}
      <div className="bg-gray-100 border border-gray-200 rounded-xl h-40 flex items-center justify-center">
        <div className="text-center text-gray-400">
          <i className="fa fa-map-marker text-3xl text-[#39FF14] block mb-2" />
          <p className="text-xs font-semibold text-gray-600">Thika, Kiambu County</p>
          <p className="text-[11px] mt-0.5">KIGIO PLAZA · Room K482</p>
          <p className="text-[10px] mt-2 text-gray-400">
            Google Maps embed goes here (requires API key)
          </p>
        </div>
      </div>
    </div>
  );
};
