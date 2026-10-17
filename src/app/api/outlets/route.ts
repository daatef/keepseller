import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getPrismaForTenant } from '@/lib/prisma-tenant';

// GET: Fetch all outlets
export async function GET() {
  const session = await auth();

  if (!session || !session.user?.tenantSchema) {
    return NextResponse.json({ error: 'Unauthorized or tenant schema missing' }, { status: 401 });
  }

  try {
    const prisma = await getPrismaForTenant(session.user.tenantSchema);

    const outlets = await prisma.outlet.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(outlets);
  } catch (err) {
    console.error('❌ Error fetching outlets:', err);
    return NextResponse.json({ error: 'Failed to fetch outlets' }, { status: 500 });
  }
}

// POST: Create a new outlet
export async function POST(req: Request) {
  const session = await auth();

  if (!session || !session.user?.tenantSchema) {
    return NextResponse.json({ error: 'Unauthorized or tenant schema missing' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, location } = body;

    if (!name || name.trim() === '') {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const prisma = await getPrismaForTenant(session.user.tenantSchema);

    const newOutlet = await prisma.outlet.create({
      data: {
        name,
        location,
      },
    });

    return NextResponse.json(newOutlet, { status: 201 });
  } catch (err) {
    console.error('❌ Error creating outlet:', err);
    return NextResponse.json({ error: 'Failed to create outlet' }, { status: 500 });
  }
}
