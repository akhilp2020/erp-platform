import { NextRequest, NextResponse } from 'next/server';
import { dbForTenant } from '@/lib/db-tenant';

export async function GET(req: NextRequest) {
  const tenantId = req.headers.get('x-tenant-id') || 'demo';
  const db = dbForTenant(tenantId);
  const rows = await db.staff.findMany({ orderBy: { id: 'desc' } });
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const tenantId = req.headers.get('x-tenant-id') || 'demo';
  const db = dbForTenant(tenantId);
  const body = await req.json();
  const created = await db.staff.create({ data: body });
  return NextResponse.json(created, { status: 201 });
}
