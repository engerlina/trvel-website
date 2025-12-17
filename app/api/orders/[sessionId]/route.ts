import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;

  if (!sessionId) {
    return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: { stripe_session_id: sessionId },
    select: {
      order_number: true,
      destination_name: true,
      plan_name: true,
      duration: true,
      amount_cents: true,
      currency: true,
      esim_qr_code: true,
      esim_status: true,
      status: true,
    },
  });

  if (!order) {
    return NextResponse.json({ order: null, status: 'pending' });
  }

  return NextResponse.json({
    order,
    status: order.esim_qr_code ? 'ready' : 'processing',
  });
}
