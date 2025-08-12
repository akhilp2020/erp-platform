import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

// GET /api/reports/tax?year=2025&month=8   (1-12)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const year = Number(searchParams.get('year') || new Date().getFullYear());
  const month = Number(searchParams.get('month') || (new Date().getMonth() + 1));
  const start = new Date(year, month - 1, 1);
  const end   = new Date(year, month, 1);

  const rows = await db.ledger.findMany({
    where: { createdAt: { gte: start, lt: end } },
    orderBy: { createdAt: 'asc' }
  });

  const sales = rows.filter(r => r.kind === 'sale')
    .reduce((s, r) => s + Number(r.amount), 0);
  const taxes = rows.filter(r => r.kind === 'tax')
    .reduce((s, r) => s + Number(r.amount), 0);
  const tips  = rows.filter(r => r.kind === 'tip')
    .reduce((s, r) => s + Number(r.amount), 0);

  const csv = [
    'date,kind,amount,refType,refId,note',
    ...rows.map(r =>
      `${r.createdAt.toISOString()},${r.kind},${r.amount},${r.refType ?? ''},${r.refId ?? ''},"${(r.note ?? '').replace(/"/g,'""')}"`
    ),
    '',
    `Summary,,`,
    `Sales,${sales.toFixed(2)}`,
    `Tax,${taxes.toFixed(2)}`,
    `Tips,${tips.toFixed(2)}`
  ].join('\n');

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="tax_${year}_${month}.csv"`
    }
  });
}
