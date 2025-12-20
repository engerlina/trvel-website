'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Order {
  id: number;
  order_number: string;
  stripe_session_id: string | null;
  destination_name: string;
  plan_name: string | null;
  duration: number;
  amount_cents: number;
  currency: string;
  status: string;
  esim_iccid: string | null;
  esim_qr_code: string | null;
  esim_status: string | null;
  confirmation_email_sent: boolean;
  createdAt: Date;
  customer: {
    id: number;
    email: string;
    name: string | null;
  };
}

interface OrdersTableProps {
  orders: Order[];
  initialSearch?: string;
  initialStatus?: string;
}

export default function OrdersTable({ orders, initialSearch, initialStatus }: OrdersTableProps) {
  const router = useRouter();
  const [search, setSearch] = useState(initialSearch || '');
  const [status, setStatus] = useState(initialStatus || '');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionResult, setActionResult] = useState<{ orderId: string; success: boolean; message: string } | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (status) params.set('status', status);
    router.push(`/admin/orders?${params.toString()}`);
  };

  const handleAction = async (sessionId: string, action: 'retry' | 'resend') => {
    setActionLoading(sessionId);
    setActionResult(null);

    try {
      const response = await fetch('/api/admin/order-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, action }),
      });

      const data = await response.json();

      if (!response.ok) {
        setActionResult({ orderId: sessionId, success: false, message: data.error || 'Action failed' });
      } else {
        setActionResult({ orderId: sessionId, success: true, message: data.message || 'Action completed' });
        router.refresh();
      }
    } catch {
      setActionResult({ orderId: sessionId, success: false, message: 'Network error' });
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <form onSubmit={handleSearch} className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search orders, customers, destinations..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="pending">Needs Attention</option>
            <option value="complete">Complete</option>
          </select>
          <button
            type="submit"
            className="px-6 py-2 bg-teal-500 text-white rounded-lg font-medium hover:bg-teal-600 transition-colors"
          >
            Search
          </button>
        </div>
      </form>

      {/* Action Result Toast */}
      {actionResult && (
        <div className={`p-4 rounded-lg ${actionResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {actionResult.message}
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Destination</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">eSIM</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span className="font-mono text-sm text-gray-900">{order.order_number}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-900">{order.customer.name || 'N/A'}</div>
                    <div className="text-xs text-gray-500">{order.customer.email}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">{order.destination_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {order.plan_name || `${order.duration}-day`}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {order.currency} {(order.amount_cents / 100).toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    {order.esim_qr_code ? (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        Provisioned
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-800">
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {order.confirmation_email_sent ? (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        Sent
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-800">
                        Not Sent
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {!order.esim_qr_code && order.stripe_session_id && (
                        <button
                          onClick={() => handleAction(order.stripe_session_id!, 'retry')}
                          disabled={actionLoading === order.stripe_session_id}
                          className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                        >
                          {actionLoading === order.stripe_session_id ? '...' : 'Provision'}
                        </button>
                      )}
                      {order.esim_qr_code && order.stripe_session_id && (
                        <button
                          onClick={() => handleAction(order.stripe_session_id!, 'resend')}
                          disabled={actionLoading === order.stripe_session_id}
                          className="px-2 py-1 text-xs bg-teal-500 text-white rounded hover:bg-teal-600 disabled:opacity-50"
                        >
                          {actionLoading === order.stripe_session_id ? '...' : 'Resend'}
                        </button>
                      )}
                      <button
                        onClick={() => {
                          const qr = order.esim_qr_code;
                          if (qr) {
                            window.open(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qr)}`, '_blank');
                          } else {
                            alert('No QR code available');
                          }
                        }}
                        className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                      >
                        QR
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {orders.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No orders found
          </div>
        )}
      </div>
    </div>
  );
}
