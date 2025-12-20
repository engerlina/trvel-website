import { prisma } from '@/lib/db';
import OrdersTable from './OrdersTable';

async function getOrders(search?: string, status?: string) {
  const where: any = {};

  if (search) {
    where.OR = [
      { order_number: { contains: search, mode: 'insensitive' } },
      { customer: { email: { contains: search, mode: 'insensitive' } } },
      { customer: { name: { contains: search, mode: 'insensitive' } } },
      { destination_name: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (status === 'pending') {
    where.AND = [
      { status: 'paid' },
      {
        OR: [
          { esim_qr_code: null },
          { confirmation_email_sent: false },
        ],
      },
    ];
  } else if (status === 'complete') {
    where.AND = [
      { status: 'paid' },
      { esim_qr_code: { not: null } },
      { confirmation_email_sent: true },
    ];
  }

  return prisma.order.findMany({
    take: 100,
    orderBy: { createdAt: 'desc' },
    include: { customer: true },
    where,
  });
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string }>;
}) {
  const { search, status } = await searchParams;
  const orders = await getOrders(search, status);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="text-gray-500 mt-1">Manage customer orders and eSIM provisioning</p>
      </div>

      <OrdersTable orders={orders} initialSearch={search} initialStatus={status} />
    </div>
  );
}
