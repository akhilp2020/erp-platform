'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function Page() {
  const router = useRouter() as any;
  const params = useParams() as any;
  const id = params?.id?.[0]; // '/new' or '/:id'
  const isNew = id === 'new';

  const [form, setForm] = useState<any>({ name: "",  });
  const [loaded, setLoaded] = useState(!isNew);

  useEffect(() => {
    if (!isNew) {
      fetch(`/api/foo/${id}`).then(r => r.json()).then(setForm).then(() => setLoaded(true));
    }
  }, [id, isNew]);

  async function onSubmit(e: any) {
    e.preventDefault();
    if (isNew) {
      await fetch('/api/foo', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    } else {
      await fetch(`/api/foo/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    }
    router.push('/foo');
  }

  if (!isNew && !loaded) return <div className="p-6">Loading…</div>;

  return (
    <main className="p-6">
      <h1 className="text-xl font-semibold mb-4">Foo – {isNew ? 'New' : 'Edit'}</h1>
      <form onSubmit={onSubmit} className="grid gap-3 max-w-xl">
        <label className="grid gap-1">
          <span className="text-sm font-medium">name</span>
          <input className="border rounded px-2 py-1" value={form['name'] ?? ''} onChange={e => setForm({ ...form, 'name': e.target.value })} />
        </label>
        <button className="bg-black text-white px-4 py-2 rounded w-fit" type="submit">Save</button>
      </form>
    </main>
  );
}

