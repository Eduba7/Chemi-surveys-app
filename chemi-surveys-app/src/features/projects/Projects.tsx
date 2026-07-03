import React, { useState } from 'react';
import { trpc } from '../../utils/trpc';

export const Projects: React.FC = () => {
  const utils = trpc.useUtils();
  const { data: grid, isLoading } = trpc.project.getGrid.useQuery();

  const [editingSlot, setEditingSlot] = useState<number | null>(null);
  const [form, setForm] = useState({ projectTitle: '', completionDate: '', imageUrl: '' });

  const upsertSlot = trpc.project.upsertSlot.useMutation({
    onSuccess: () => {
      utils.project.getGrid.invalidate();
      setEditingSlot(null);
      setForm({ projectTitle: '', completionDate: '', imageUrl: '' });
    },
  });

  const clearSlot = trpc.project.clearSlot.useMutation({
    onSuccess: () => utils.project.getGrid.invalidate(),
  });

  function openSlot(index: number) {
    const existing = grid?.[index];
    setForm({
      projectTitle: existing?.projectTitle || '',
      completionDate: existing?.completionDate
        ? new Date(existing.completionDate).toISOString().split('T')[0]
        : '',
      imageUrl: existing?.imageUrl || '',
    });
    setEditingSlot(index);
  }

  return (
    <div>
      <h1 className="text-lg font-semibold text-gray-900">My Projects</h1>
      <p className="text-xs text-gray-500 mt-1 mb-5">
        Add the projects Surveyor John Muiruri Gachemi has completed — 12 editable
        slots. This grid starts completely empty; no sample projects are preloaded.
      </p>

      {isLoading ? (
        <p className="text-sm text-gray-400 text-center py-10">Loading projects...</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {(grid || Array.from({ length: 12 }, () => null)).map((project, i) => (
            <div key={i} className="relative">
              {project ? (
                <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:border-[#39FF14] transition-colors cursor-pointer">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      clearSlot.mutate({ slotIndex: i });
                    }}
                    className="absolute top-1.5 right-1.5 z-10 w-5 h-5 rounded bg-slate-900/70 text-[#39FF14] flex items-center justify-center"
                    aria-label="Remove project"
                  >
                    <i className="fa fa-times text-[10px]" />
                  </button>
                  <div onClick={() => openSlot(i)} className="h-20 bg-gradient-to-br from-[#1034A6] to-blue-950 flex items-center justify-center overflow-hidden">
                    {project.imageUrl ? (
                      <img src={project.imageUrl} alt={project.projectTitle} className="w-full h-full object-cover" />
                    ) : (
                      <i className="fa fa-map text-[#39FF14] text-2xl" />
                    )}
                  </div>
                  <div onClick={() => openSlot(i)} className="p-2.5">
                    <p className="text-sm font-semibold text-gray-900 leading-snug">{project.projectTitle}</p>
                    <p className="text-sm text-gray-400 mt-1">
                      {project.completionDate
                        ? new Date(project.completionDate).toLocaleDateString('en-KE', { month: 'short', year: 'numeric' })
                        : 'Date TBD'}
                    </p>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => openSlot(i)}
                  className="w-full h-full min-h-[112px] border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center text-gray-300 hover:border-[#39FF14] hover:text-[#39FF14] transition-colors"
                  aria-label={`Add project to slot ${i + 1}`}
                >
                  <i className="fa fa-plus text-lg" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {editingSlot !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-sm p-5">
            <h3 className="text-sm font-bold text-gray-800 mb-3">
              Project — slot {editingSlot + 1}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 font-medium block mb-1">Project title</label>
                <input
                  className="w-full border border-gray-200 rounded-md text-xs px-2 py-2"
                  placeholder="e.g. Thika Boundary Survey — Phase 1"
                  value={form.projectTitle}
                  onChange={(e) => setForm({ ...form, projectTitle: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium block mb-1">Completion date</label>
                <input
                  type="date"
                  className="w-full border border-gray-200 rounded-md text-xs px-2 py-2"
                  value={form.completionDate}
                  onChange={(e) => setForm({ ...form, completionDate: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium block mb-1">Image URL</label>
                <input
                  className="w-full border border-gray-200 rounded-md text-xs px-2 py-2"
                  placeholder="https://... (Supabase Storage URL)"
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setEditingSlot(null)} className="flex-1 border border-gray-200 rounded-md text-xs py-2 text-gray-600">
                Cancel
              </button>
              <button
                onClick={() =>
                  form.projectTitle &&
                  upsertSlot.mutate({
                    slotIndex: editingSlot,
                    projectTitle: form.projectTitle,
                    completionDate: form.completionDate || undefined,
                    imageUrl: form.imageUrl || undefined,
                  })
                }
                className="flex-1 bg-[#39FF14] text-[#0f172a] rounded-md text-xs font-bold py-2"
              >
                Save project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
