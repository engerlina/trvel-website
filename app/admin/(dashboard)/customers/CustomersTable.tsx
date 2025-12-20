'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Order {
  id: number;
  order_number: string;
  destination_name: string;
  amount_cents: number;
  currency: string;
  status: string;
  createdAt: Date;
}

interface Customer {
  id: number;
  email: string;
  name: string | null;
  stripe_customer_id: string | null;
  createdAt: Date;
  orders: Order[];
  _count: {
    orders: number;
  };
}

interface CustomersTableProps {
  customers: Customer[];
  initialSearch?: string;
}

export default function CustomersTable({ customers, initialSearch }: CustomersTableProps) {
  const router = useRouter();
  const [search, setSearch] = useState(initialSearch || '');
  const [expandedCustomer, setExpandedCustomer] = useState<number | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    router.push(`/admin/customers?${params.toString()}`);
  };

  const totalSpent = (orders: Order[]) => {
    const total = orders.reduce((sum, order) => {
      if (order.status === 'paid') {
        return sum + order.amount_cents;
      }
      return sum;
    }, 0);
    return total;
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <form onSubmit={handleSearch} className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by email or name..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2 bg-teal-500 text-white rounded-lg font-medium hover:bg-teal-600 transition-colors"
          >
            Search
          </button>
        </div>
      </form>

      {/* Customers Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orders</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Spent</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {customers.map((customer) => (
                <>
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{customer.name || 'N/A'}</div>
                      <div className="text-sm text-gray-500">{customer.email}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {customer._count.orders}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      ${(totalSpent(customer.orders) / 100).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(customer.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setExpandedCustomer(expandedCustomer === customer.id ? null : customer.id)}
                          className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                        >
                          {expandedCustomer === customer.id ? 'Hide' : 'Orders'}
                        </button>
                        <Link
                          href={`/admin/orders?search=${encodeURIComponent(customer.email)}`}
                          className="px-3 py-1 text-xs bg-teal-500 text-white rounded hover:bg-teal-600"
                        >
                          View All
                        </Link>
                      </div>
                    </td>
                  </tr>
                  {expandedCustomer === customer.id && customer.orders.length > 0 && (
                    <tr>
                      <td colSpan={5} className="bg-gray-50 px-6 py-4">
                        <div className="text-sm">
                          <h4 className="font-medium text-gray-900 mb-2">Recent Orders</h4>
                          <div className="space-y-2">
                            {customer.orders.map((order) => (
                              <div key={order.id} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200">
                                <div>
                                  <span className="font-mono text-sm text-gray-900">{order.order_number}</span>
                                  <span className="mx-2 text-gray-300">•</span>
                                  <span className="text-gray-600">{order.destination_name}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                  <span className="text-gray-900">
                                    {order.currency} {(order.amount_cents / 100).toFixed(2)}
                                  </span>
                                  <span className={`px-2 py-1 text-xs rounded-full ${
                                    order.status === 'paid'
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-gray-100 text-gray-800'
                                  }`}>
                                    {order.status}
                                  </span>
                                  <span className="text-gray-500 text-sm">
                                    {new Date(order.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
        {customers.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No customers found
          </div>
        )}
      </div>
    </div>
  );
}
