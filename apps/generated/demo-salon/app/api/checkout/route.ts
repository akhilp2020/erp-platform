import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { calcTax } from '@/lib/tax-adapter';

const db = new PrismaClient();

// Request body shape:
// {
//   "refType": "Appointment",     // optional context
//   "refId":   "appt_123",        // optional
//   "items": [ { "name": "Haircut", "amount": 65.00 } ],
//   "tip": 10.00,                 // optional
//   "zip": "94086"                // optional
// }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const items = Array.isArray(body?.items) ? body.items : [];
    const subtotal = round2(items.reduce((s, it) => s + Number(it.amount || 0), 0));
    const tip = round2(Number(body?.tip || 0));
    const { rate, tax } = calcTax({ subtotal, zip: body?.zip });

    const total = round2(subtotal + tax + tip);

    // Write ledger rows in a transaction
    const rows = await db.$transaction(async (tx) => {
      const created: any[] = [];
      // sale
      if (subtotal > 0) {
        created.push(await tx.ledger.create({
          data: {
            kind: 'sale', amount: subtotal, refType: body?.refType || null, refId: body?.refId || null,
            note: (items.map((i: any) => i.name).filter(Boolean).join(', ')) || null
          }
        }));
      }
      // tax
      if (tax > 0) {
        created.push(await tx.ledger.create({
          data: { kind: 'tax', amount: tax, refType: body?.refType || null, refId: body?.refId || null }
        }));
      }
      // tip
      if (tip > 0) {
        created.push(await tx.ledger.create({
          data: { kind: 'tip', amount: tip, refType: body?.refType || null, refId: body?.refId || null }
        }));
      }
      return created;
    });

    return NextResponse.json({
      ok: true,
      summary: { subtotal, tax, tip, rate, total },
      ledger: rows
    }, { status: 201 });

  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? 'server_error' }, { status: 500 });
  }
}

function round2(n: number) { return Math.round(n * 100) / 100; }
