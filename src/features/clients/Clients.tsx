import React, { useState } from 'react';
import { trpc } from '../../utils/trpc';

export const Clients: React.FC = () => {
  const utils = trpc.useUtils();
  const { data: clients, isLoading } = trpc.clients.getAll.useQuery();

  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    nameOrCompany: '',
    logoUrl: '',
    phone: '',
    email: '',
    notes: '',
  });

  const createClient = trpc.clients.create.useMutation({
    onSuccess: () => {
      utils.clients.getAll.invalidate();
      setModalOpen(false);
      setForm({ nameOrCompany: '', logoUrl: '', phone: '', email: '', notes: '' });
    },
  });

  const deleteClient = trpc.clients.delete.useMutation({
    onSuccess: () => utils.clients.getAll.invalidate(),
  });

  const filtered = (clients || []).filter((c) =>
    c.nameOrCompany.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h1 className="text-lg font-semibold text-gray-900">Client Directory</h1>
      <p className="text-xs text-gray-500 mt-1 mb-5">
        Add the brand logo and full name of clients Surveyor John Muiruri Gachemi has
        previously worked with. This directory starts empty — there is no preloaded
        client data.
      </p>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Search clients..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-gray-200 rounded-lg text-sm px-3 py-2 outline-none focus:ring-2 focus:ring-[#1034A6]/30"
        />
        <button
          onClick={() => setModalOpen(true)}
          className="bg-[#1034A6] text-[#39FF14] text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 whitespace-nowrap"
        >
          <i className="fa fa-plus" /> Add Client
        </button>
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-400 text-center py-10">Loading clients...</p>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl">
          <i className="fa fa-users text-3xl text-gray-300 block mb-3" />
          <p className="text-sm text-gray-500">
            No clients added yet.<br />Click "Add Client" to build your directory.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((c) => (
            <div key={c.id} className="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 rounded-lg bg-[#1034A6] flex items-center justify-center text-white font-bold overflow-hidden flex-shrink-0">
                {c.logoUrl ? (
                  <img src={c.logoUrl} alt={`${c.nameOrCompany} logo`} className="w-full h-full object-contain bg-white" />
                ) : (
                  c.nameOrCompany.charAt(0).toUpperCase()
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">{c.nameOrCompany}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {[c.phone, c.email].filter(Boolean).join(' · ') || 'No contact info added'}
                </p>
              </div>
              <button
                onClick={() => deleteClient.mutate({ id: c.id })}
                className="w-8 h-8 rounded-md bg-gray-100 hover:bg-red-100 text-gray-500 hover:text-red-600 flex items-center justify-center"
                aria-label={`Remove ${c.nameOrCompany}`}
              >
                <i className="fa fa-trash text-xs" />
              </button>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-sm p-5">
            <h3 className="text-sm font-bold text-gray-800 mb-3">Add client</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 font-medium block mb-1">Client / company name</label>
                <input
                  className="w-full border border-gray-200 rounded-md text-xs px-2 py-2"
                  placeholder="e.g. Greenfields Developers"
                  value={form.nameOrCompany}
                  onChange={(e) => setForm({ ...form, nameOrCompany: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium block mb-1">Logo URL</label>
                <input
                  className="w-full border border-gray-200 rounded-md text-xs px-2 py-2"
                  placeholder="https://... (or upload via Supabase Storage)"
                  value={form.logoUrl}
                  onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
                />
                <p className="text-[10px] text-gray-400 mt-1">
                  In production, swap this for a file-upload field that pushes to Supabase
                  Storage and stores the returned URL here.
                </p>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium block mb-1">Phone</label>
                <input
                  className="w-full border border-gray-200 rounded-md text-xs px-2 py-2"
                  placeholder="0700 000 000"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium block mb-1">Email</label>
                <input
                  className="w-full border border-gray-200 rounded-md text-xs px-2 py-2"
                  placeholder="contact@client.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setModalOpen(false)} className="flex-1 border border-gray-200 rounded-md text-xs py-2 text-gray-600">
                Cancel
              </button>
              <button
                onClick={() => form.nameOrCompany && createClient.mutate(form)}
                className="flex-1 bg-[#39FF14] text-[#0f172a] rounded-md text-xs font-bold py-2"
              >
                Save client
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
