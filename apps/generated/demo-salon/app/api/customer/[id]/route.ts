import { NextRequest, NextResponse } from 'next/server';
import { dbForTenant } from '@/lib/db-tenant';

const model = db.customer;

export async function GET(_: NextRequest, { params }: { params: { id: string }}) {
// BEGIN ANSIBLE TENANT DB GET ID
const tenantId = req.headers.get('x-tenant-id') || 'demo';
const db = dbForTenant(tenantId);
// END ANSIBLE TENANT DB GET ID
  const row = await model.findUnique({ where: { id: params.id } });
  if (!row) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  return NextResponse.json(row);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string }}) {
  const body = await req.json();
  const upd = await model.update({ where: { id: params.id }, data: body });
  return NextResponse.json(upd);
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string }}) {
  await model.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}

