'use client';
import { useEffect, useState } from 'react';

export default function Page() {
  const [rows, setRows] = useState<any[]>([]);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetch('/api/appointment').then(r => r.json()).then(setRows).catch(e => setError(String(e)));
  }, []);

  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <main className="p-6">
      <h1 className="text-xl font-semibold mb-4">Appointment List (Appointment)</h1>
      <a className="underline text-blue-600" href="/appointment/new">+ New</a>
      <table className="mt-4 border">
        <thead><tr>
          <th className="border px-2 py-1 text-left">id</th><th className="border px-2 py-1 text-left">customerId</th><th className="border px-2 py-1 text-left">staffId</th><th className="border px-2 py-1 text-left">serviceId</th>
          <th className="border px-2 py-1">Actions</th>
        </tr></thead>
        <tbody>
        {rows.map((r) => (
          <tr key={r.id} className="border">
            <td className="border px-2 py-1">{String(r['id'] ?? '')}</td><td className="border px-2 py-1">{String(r['customerId'] ?? '')}</td><td className="border px-2 py-1">{String(r['staffId'] ?? '')}</td><td className="border px-2 py-1">{String(r['serviceId'] ?? '')}</td>
            <td className="border px-2 py-1"><a className="underline" href={`//${r.id}`}>edit</a></td>
          </tr>
        ))}
        </tbody>
      </table>
    </main>
  );
}

