'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function Page() {
  const router = useRouter() as any;
  const params = useParams() as any;
  const id = params?.id?.[0]; // '/new' or '/:id'
  const isNew = id === 'new';

  const [form, setForm] = useState<any>({ name: "", email: "", phone: "",  });
  const [loaded, setLoaded] = useState(!isNew);

  useEffect(() => {
    if (!isNew) {
      fetch(`/api/customer/${id}`).then(r => r.json()).then(setForm).then(() => setLoaded(true));
    }
  }, [id, isNew]);

  async function onSubmit(e: any) {
    e.preventDefault();
    if (isNew) {
      await fetch('/api/customer', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    } else {
      await fetch(`/api/customer/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    }
    router.push('/customer');
  }

  if (!isNew && !loaded) return <div className="p-6">Loading…</div>;

  return (
    <main className="p-6">
      <h1 className="text-xl font-semibold mb-4">Customer – {isNew ? 'New' : 'Edit'}</h1>
      <form onSubmit={onSubmit} className="grid gap-3 max-w-xl">
        <label className="grid gap-1">
          <span className="text-sm font-medium">name</span>
          <input className="border rounded px-2 py-1" value={form['name'] ?? ''} onChange={e => setForm({ ...form, 'name': e.target.value })} />
        </label>
        <label className="grid gap-1">
          <span className="text-sm font-medium">email</span>
          <input className="border rounded px-2 py-1" value={form['email'] ?? ''} onChange={e => setForm({ ...form, 'email': e.target.value })} />
        </label>
        <label className="grid gap-1">
          <span className="text-sm font-medium">phone</span>
          <input className="border rounded px-2 py-1" value={form['phone'] ?? ''} onChange={e => setForm({ ...form, 'phone': e.target.value })} />
        </label>
        <button className="bg-black text-white px-4 py-2 rounded w-fit" type="submit">Save</button>
      </form>
    </main>
  );
}

