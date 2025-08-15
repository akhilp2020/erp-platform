'use client';
import { useEffect, useState } from 'react';

export default function Page() {
  const [rows, setRows] = useState<any[]>([]);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetch('/api/staff').then(r => r.json()).then(setRows).catch(e => setError(String(e)));
  }, []);

  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <main className="p-6">
      <h1 className="text-xl font-semibold mb-4">Staff List (Staff)</h1>
      <a className="underline text-blue-600" href="/staff/new">+ New</a>
      <table className="mt-4 border">
        <thead><tr>
          <th className="border px-2 py-1 text-left">id</th><th className="border px-2 py-1 text-left">name</th><th className="border px-2 py-1 text-left">role</th><th className="border px-2 py-1 text-left">tenantId</th>
          <th className="border px-2 py-1">Actions</th>
        </tr></thead>
        <tbody>
        {rows.map((r) => (
          <tr key={r.id} className="border">
            <td className="border px-2 py-1">{String(r['id'] ?? '')}</td><td className="border px-2 py-1">{String(r['name'] ?? '')}</td><td className="border px-2 py-1">{String(r['role'] ?? '')}</td><td className="border px-2 py-1">{String(r['tenantId'] ?? '')}</td>
            <td className="border px-2 py-1"><a className="underline" href={`//${r.id}`}>edit</a></td>
          </tr>
        ))}
        </tbody>
      </table>
    </main>
  );
}

