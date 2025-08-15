import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { dbForTenant } from '@/lib/db-tenant';
const db = new PrismaClient();

export async function GET(req: NextRequest) {
    const tenantId = req.headers.get('x-tenant-id') ?? 'demo';
  const db = dbForTenant(tenantId);
  const model = db.appointment;
const list = await db.appointment.findMany();
  return NextResponse.json(list);
}

export async function POST(req: NextRequest) {
    const tenantId = req.headers.get('x-tenant-id') ?? 'demo';
  const db = dbForTenant(tenantId);
  const model = db.appointment;
const body = await req.json();
  const created = await db.appointment.create({ data: body });
  return NextResponse.json(created, { status: 201 });
}

