import React from 'react';
import fieldHero from '../../assets/field-survey-hero.jpg';

export const Home: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">
          Welcome to Chemi Surveys &amp; Mapping Consultants
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Precision land surveying and spatial data services in Thika, Kenya
        </p>
      </div>

      {/* Hero photo — actual GNSS rover field photo provided by the surveyor */}
      <div className="relative rounded-xl overflow-hidden h-64 md:h-80 shadow-md">
        <img
          src={fieldHero}
          alt="GNSS survey rover and field equipment set up on site"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent flex flex-col justify-end p-5">
          <h2 className="text-[#39FF14] text-lg font-bold">
            Professional Surveyors at Work
          </h2>
          <p className="text-gray-200 text-sm mt-1">
            GNSS field survey equipment in operation — Thika, Kenya
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-base font-semibold text-[#1034A6] mb-2">Who we are</h3>
        <p className="text-sm text-gray-600 leading-relaxed">
          Chemi Surveys &amp; Mapping Consultants is a Thika-based land surveying
          firm founded in 2019 by Surveyor John Muiruri Gachemi, a graduate of
          the Technical University of Kenya (TUK). We specialise in boundary
          surveys, topographic mapping, GPS/GNSS positioning, and cadastral
          work — combining modern survey-grade GNSS equipment with rigorous
          field practice to deliver accurate, legally compliant results for
          individuals, developers, and institutions across Kiambu County and
          beyond.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
          <p className="text-xs text-gray-500 font-medium">Founded</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">2019</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
          <p className="text-xs text-gray-500 font-medium">Based in</p>
          <p className="text-lg font-semibold text-gray-900 mt-1">Thika, Kenya</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
          <p className="text-xs text-gray-500 font-medium">Core team</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">3</p>
        </div>
      </div>
    </div>
  );
};
