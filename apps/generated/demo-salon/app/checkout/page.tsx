'use client';
import { useState } from 'react';

export default function CheckoutPage() {
  const [items, setItems] = useState([{ name: 'Haircut', amount: 65 }]);
  const [tip, setTip] = useState(10);
  const [zip, setZip] = useState('');
  const [result, setResult] = useState<any>(null);
  const [err, setErr] = useState<string>('');

  function updateAmount(i: number, v: string) {
    const next = [...items];
    next[i].amount = Number(v || 0);
    setItems(next);
  }

  function updateName(i: number, v: string) {
    const next = [...items];
    next[i].name = v;
    setItems(next);
  }

  function addItem() {
    setItems([...items, { name: '', amount: 0 }]);
  }

  async function runCheckout() {
    setErr('');
    setResult(null);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, tip: Number(tip || 0), zip })
      });
      const out = await res.json();
      if (!res.ok) throw new Error(out?.error || 'failed');
      setResult(out);
    } catch (e: any) {
      setErr(e.message);
    }
  }

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Checkout</h1>

      <div className="space-y-3">
        {items.map((it, idx) => (
          <div key={idx} className="flex gap-2">
            <input className="border rounded px-2 py-1 w-64" placeholder="Item name"
                   value={it.name} onChange={e => updateName(idx, e.target.value)} />
            <input className="border rounded px-2 py-1 w-32" placeholder="Amount"
                   value={String(it.amount)} onChange={e => updateAmount(idx, e.target.value)} />
          </div>
        ))}
        <button className="bg-gray-200 rounded px-3 py-1" onClick={addItem}>+ Add item</button>

        <div className="flex gap-3 items-center">
          <label>Tip ($)</label>
          <input className="border rounded px-2 py-1 w-24" value={String(tip)} onChange={e => setTip(e.target.value)} />
          <label htmlFor="zip">ZIP (optional)</label>
<input id="zip" name="zip" className="border rounded px-2 py-1 w-28" value={zip} onChange={e => setZip(e.target.value)} />
        </div>

        <button className="bg-black text-white rounded px-4 py-2" onClick={runCheckout}>Compute & Save</button>

        {err && <div className="text-red-600">{err}</div>}
        {result && (
          <div className="mt-4">
            <div><b>Subtotal:</b> ${result.summary.subtotal.toFixed(2)}</div>
            <div><b>Tax ({(result.summary.rate*100).toFixed(2)}%):</b> ${result.summary.tax.toFixed(2)}</div>
            <div><b>Tip:</b> ${result.summary.tip.toFixed(2)}</div>
            <div><b>Total:</b> ${result.summary.total.toFixed(2)}</div>
          </div>
        )}
      </div>
    </main>
  );
}
