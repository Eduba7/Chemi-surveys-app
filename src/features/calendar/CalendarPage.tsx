import React from 'react';
import { trpc } from '../../utils/trpc';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS = Array.from({ length: 10 }, (_, i) => i + 8); // 8am - 5pm

export const CalendarPage: React.FC = () => {
  const { data: consultations } = trpc.consultation.getAll.useQuery({});

  function eventFor(dayIndex: number, hour: number) {
    return (consultations || []).find((c) => {
      const d = new Date(c.scheduledTime);
      return d.getDay() === dayIndex && d.getHours() === hour;
    });
  }

  return (
    <div>
      <h1 className="text-lg font-semibold text-gray-900">Interactive Calendar</h1>
      <p className="text-xs text-gray-500 mt-1 mb-2">Click any cell to add an appointment</p>
      <p className="text-[11px] text-gray-400 mb-3 sm:hidden">
        <i className="fa fa-arrows-h mr-1" /> Swipe sideways to see the full week
      </p>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden overflow-x-auto">
        <div className="grid grid-cols-8 text-[10px] min-w-[560px]">
          <div className="bg-gray-50 border-b border-gray-200" />
          {DAYS.map((d) => (
            <div key={d} className="bg-gray-50 border-b border-gray-200 text-center font-semibold text-gray-600 py-2">
              {d}
            </div>
          ))}

          {HOURS.map((h) => (
            <React.Fragment key={h}>
              <div className="bg-gray-50 border-r border-gray-100 text-right pr-2 py-2 text-gray-400">
                {h}:00
              </div>
              {DAYS.map((_, dayIndex) => {
                const event = eventFor(dayIndex, h);
                return (
                  <button
                    key={dayIndex}
                    onClick={() => alert(`Booking slot selected: ${DAYS[dayIndex]} at ${h}:00. Use Add Task on the Dashboard to record it.`)}
                    className="border border-gray-50 hover:bg-blue-50 min-h-[34px] p-0.5 text-left"
                  >
                    {event && (
                      <div className="bg-[#1034A6] text-white text-[9px] rounded px-1 py-0.5 truncate">
                        {event.client.nameOrCompany}
                      </div>
                    )}
                  </button>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};
