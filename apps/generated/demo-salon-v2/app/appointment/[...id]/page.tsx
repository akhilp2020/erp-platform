'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function Page() {
  const router = useRouter() as any;
  const params = useParams() as any;
  const id = params?.id?.[0]; // '/new' or '/:id'
  const isNew = id === 'new';

  const [form, setForm] = useState<any>({ customerId: "", staffId: "", serviceId: "", status: "", tenantId: "",  });
  const [loaded, setLoaded] = useState(!isNew);

  useEffect(() => {
    if (!isNew) {
      fetch(`/api/appointment/${id}`).then(r => r.json()).then(setForm).then(() => setLoaded(true));
    }
  }, [id, isNew]);

  async function onSubmit(e: any) {
    e.preventDefault();
    if (isNew) {
      await fetch('/api/appointment', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    } else {
      await fetch(`/api/appointment/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    }
    router.push('/appointment');
  }

  if (!isNew && !loaded) return <div className="p-6">Loading…</div>;

  return (
    <main className="p-6">
      <h1 className="text-xl font-semibold mb-4">Appointment – {isNew ? 'New' : 'Edit'}</h1>
      <form onSubmit={onSubmit} className="grid gap-3 max-w-xl">
        <label className="grid gap-1">
          <span className="text-sm font-medium">customerId</span>
          <input className="border rounded px-2 py-1" value={form['customerId'] ?? ''} onChange={e => setForm({ ...form, 'customerId': e.target.value })} />
        </label>
        <label className="grid gap-1">
          <span className="text-sm font-medium">staffId</span>
          <input className="border rounded px-2 py-1" value={form['staffId'] ?? ''} onChange={e => setForm({ ...form, 'staffId': e.target.value })} />
        </label>
        <label className="grid gap-1">
          <span className="text-sm font-medium">serviceId</span>
          <input className="border rounded px-2 py-1" value={form['serviceId'] ?? ''} onChange={e => setForm({ ...form, 'serviceId': e.target.value })} />
        </label>
        <label className="grid gap-1">
          <span className="text-sm font-medium">status</span>
          <input className="border rounded px-2 py-1" value={form['status'] ?? ''} onChange={e => setForm({ ...form, 'status': e.target.value })} />
        </label>
        <label className="grid gap-1">
          <span className="text-sm font-medium">tenantId</span>
          <input className="border rounded px-2 py-1" value={form['tenantId'] ?? ''} onChange={e => setForm({ ...form, 'tenantId': e.target.value })} />
        </label>
        <button className="bg-black text-white px-4 py-2 rounded w-fit" type="submit">Save</button>
      </form>
    </main>
  );
}

