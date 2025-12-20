import { prisma } from '@/lib/db';
import CustomersTable from './CustomersTable';

async function getCustomers(search?: string) {
  const where = search
    ? {
        OR: [
          { email: { contains: search, mode: 'insensitive' as const } },
          { name: { contains: search, mode: 'insensitive' as const } },
        ],
      }
    : {};

  return prisma.customer.findMany({
    take: 100,
    orderBy: { createdAt: 'desc' },
    where,
    include: {
      orders: {
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
      _count: {
        select: { orders: true },
      },
    },
  });
}

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const { search } = await searchParams;
  const customers = await getCustomers(search);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
        <p className="text-gray-500 mt-1">View and manage customer accounts</p>
      </div>

      <CustomersTable customers={customers} initialSearch={search} />
    </div>
  );
}
