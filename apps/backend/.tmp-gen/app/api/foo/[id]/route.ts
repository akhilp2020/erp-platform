import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();

const model = db.foo;

export async function GET(_: NextRequest, { params }: { params: { id: string }}) {
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

