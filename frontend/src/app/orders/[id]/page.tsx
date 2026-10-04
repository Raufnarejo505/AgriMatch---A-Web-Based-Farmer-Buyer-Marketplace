"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

import Badge from "@/components/Badge";
import Button from "@/components/Button";
import Card from "@/components/Card";
import DashboardShell from "@/components/DashboardShell";
import { ErrorMessage, Loading } from "@/components/States";
import { ApiError, api } from "@/lib/api";
import { getUser } from "@/lib/auth";
import { ORDER_LABELS, ORDER_NEXT, ORDER_TONES } from "@/lib/orderStatus";
import type { Order, OrderStatus } from "@/types";

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const orderId = Number(params.id);
  const me = getUser();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setOrder(await api.get<Order>(`/api/orders/${orderId}`));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load order");
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    void load();
  }, [load, reloadKey]);

  async function update(status: OrderStatus) {
    if (status === "cancelled" && !window.confirm("Cancel this order?")) return;
    setUpdating(true);
    setError("");
    try {
      setOrder(await api.patch<Order>(`/api/orders/${orderId}/status`, { status }));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to update order");
    } finally {
      setUpdating(false);
    }
  }

  const role = me?.role;
  if (!role) return <Loading label="Loading order..." />;

  const canUpdate = me?.role === "farmer" && order?.farmer_id === me?.id;

  return (
    <DashboardShell role={role} title={`Order #${orderId}`}>
      <div className="space-y-4">
        {error && <ErrorMessage message={error} onRetry={() => setReloadKey((key) => key + 1)} />}
        {loading || !order ? (
          <Loading />
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            <Card title="Summary" className="md:col-span-2">
              <dl className="grid gap-3 text-sm sm:grid-cols-3">
                <div>
                  <dt className="text-gray-500">Crop</dt>
                  <dd className="font-medium text-gray-900">{order.crop}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Quantity</dt>
                  <dd className="font-medium text-gray-900">{order.quantity}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Price per unit</dt>
                  <dd className="font-medium text-gray-900">Rs {order.price_per_unit}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Total</dt>
                  <dd className="font-medium text-gray-900">
                    Rs {(order.quantity * order.price_per_unit).toFixed(2)}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500">Farmer</dt>
                  <dd className="font-medium text-gray-900">{order.farmer_name}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Buyer</dt>
                  <dd className="font-medium text-gray-900">{order.buyer_name}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Status</dt>
                  <dd>
                    <Badge tone={ORDER_TONES[order.status]}>{ORDER_LABELS[order.status]}</Badge>
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500">Created</dt>
                  <dd className="text-gray-900">{new Date(order.created_at).toLocaleString()}</dd>
                </div>
              </dl>
              <div className="mt-5 flex flex-wrap items-center gap-2">
                {canUpdate &&
                  ORDER_NEXT[order.status].map((next) => (
                    <Button
                      key={next}
                      variant={next === "cancelled" ? "danger" : "primary"}
                      disabled={updating}
                      onClick={() => update(next)}
                    >
                      {next === "cancelled" ? "Cancel order" : `Mark ${ORDER_LABELS[next].toLowerCase()}`}
                    </Button>
                  ))}
                <Link href="/orders" className="text-sm font-medium text-green-700 hover:underline">
                  Back to orders
                </Link>
              </div>
            </Card>
            <Card title="Status timeline">
              <ol className="space-y-4">
                {order.history.map((entry) => (
                  <li key={entry.id} className="flex gap-3">
                    <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-green-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{ORDER_LABELS[entry.status]}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(entry.changed_at).toLocaleString()}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </Card>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
