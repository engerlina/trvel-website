import { prisma } from '@/lib/db';

async function getStats() {
  const [totalOrders, totalCustomers, recentOrders, pendingEsims] = await Promise.all([
    prisma.order.count(),
    prisma.customer.count(),
    prisma.order.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        },
      },
    }),
    prisma.order.count({
      where: {
        OR: [
          { esim_qr_code: null },
          { confirmation_email_sent: false },
        ],
        status: 'paid',
      },
    }),
  ]);

  const revenueResult = await prisma.order.aggregate({
    _sum: { amount_cents: true },
    where: { status: 'paid' },
  });

  return {
    totalOrders,
    totalCustomers,
    recentOrders,
    pendingEsims,
    totalRevenue: revenueResult._sum?.amount_cents || 0,
  };
}

async function getRecentOrders() {
  return prisma.order.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    include: { customer: true },
  });
}

export default async function AdminDashboardPage() {
  const stats = await getStats();
  const recentOrders = await getRecentOrders();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Overview of your eSIM business</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          icon="🛒"
          color="bg-blue-500"
        />
        <StatCard
          title="Total Customers"
          value={stats.totalCustomers}
          icon="👥"
          color="bg-green-500"
        />
        <StatCard
          title="Orders (7 days)"
          value={stats.recentOrders}
          icon="📈"
          color="bg-purple-500"
        />
        <StatCard
          title="Pending eSIMs"
          value={stats.pendingEsims}
          icon="⚠️"
          color="bg-amber-500"
          alert={stats.pendingEsims > 0}
        />
      </div>

      {/* Revenue Card */}
      <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl p-6 text-white">
        <p className="text-teal-100 text-sm">Total Revenue</p>
        <p className="text-3xl font-bold mt-1">
          ${(stats.totalRevenue / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </p>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Destination
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-mono text-sm text-gray-900">{order.order_number}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm text-gray-900">{order.customer.name || 'N/A'}</div>
                      <div className="text-sm text-gray-500">{order.customer.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.destination_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <OrderStatusBadge
                      status={order.status}
                      hasQrCode={!!order.esim_qr_code}
                      emailSent={order.confirmation_email_sent}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.currency} {(order.amount_cents / 100).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
  alert = false,
}: {
  title: string;
  value: number;
  icon: string;
  color: string;
  alert?: boolean;
}) {
  return (
    <div className={`bg-white rounded-xl p-6 shadow-sm border ${alert ? 'border-amber-300' : 'border-gray-200'}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center text-2xl`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function OrderStatusBadge({
  status,
  hasQrCode,
  emailSent,
}: {
  status: string;
  hasQrCode: boolean;
  emailSent: boolean;
}) {
  if (status === 'paid' && hasQrCode && emailSent) {
    return (
      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
        Complete
      </span>
    );
  }
  if (status === 'paid' && (!hasQrCode || !emailSent)) {
    return (
      <span className="px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-800">
        Needs Attention
      </span>
    );
  }
  if (status === 'pending') {
    return (
      <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
        Pending
      </span>
    );
  }
  return (
    <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
      {status}
    </span>
  );
}
