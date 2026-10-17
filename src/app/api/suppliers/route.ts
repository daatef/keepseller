import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getPrismaForTenant } from '@/lib/prisma-tenant';

async function getTenantPrisma(session: any) {
  const schema = session?.user?.tenantSchema;
  if (!schema) throw new Error('Unauthorized');
  return getPrismaForTenant(schema);
}

export async function GET() {
  try {
    const session = await auth();
    const prisma = await getTenantPrisma(session);

    const suppliers = await prisma.supplier.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(suppliers);
  } catch (err: any) {
    console.error('GET /api/suppliers error:', err);
    const status = err.message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json({ error: err.message || 'Error fetching suppliers' }, { status });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const prisma = await getTenantPrisma(session);

    const body = await req.json();
    if (!body.name) return NextResponse.json({ error: 'Name required' }, { status: 400 });

    const supplier = await prisma.supplier.create({
      data: {
        name: body.name,
        phone: body.phone || '',
        email: body.email || '',
        address: body.address || '',
      },
    });

    return NextResponse.json(supplier);
  } catch (err: any) {
    console.error('POST /api/suppliers error:', err);
    const status = err.message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json({ error: err.message || 'Error creating supplier' }, { status });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    const prisma = await getTenantPrisma(session);

    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    await prisma.supplier.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('DELETE /api/suppliers error:', err);
    const status = err.message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json({ error: err.message || 'Error deleting supplier' }, { status });
  }
}