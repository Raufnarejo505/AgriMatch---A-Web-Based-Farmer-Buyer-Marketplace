"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

import Badge from "@/components/Badge";
import Card from "@/components/Card";
import DashboardShell from "@/components/DashboardShell";
import { ErrorMessage, Loading } from "@/components/States";
import Table, { type Column } from "@/components/Table";
import { ApiError, api } from "@/lib/api";
import { getUser } from "@/lib/auth";
import { ORDER_TONES } from "@/lib/orderStatus";
import type { Order } from "@/types";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const user = getUser();
  const role = user?.role;

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setOrders(await api.get<Order[]>("/api/orders"));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function counterparty(order: Order): string {
    if (user?.role === "admin") return `${order.farmer_name} / ${order.buyer_name}`;
    return user?.id === order.buyer_id ? order.farmer_name : order.buyer_name;
  }

  const columns: Column<Order>[] = [
    {
      key: "id",
      header: "Order",
      render: (order) => <span className="font-medium text-gray-900">#{order.id}</span>,
    },
    { key: "crop", header: "Crop", render: (order) => order.crop },
    {
      key: "quantity",
      header: "Quantity",
      render: (order) => order.quantity,
    },
    {
      key: "price",
      header: "Price",
      render: (order) => `Rs ${order.price_per_unit}`,
    },
    {
      key: "total",
      header: "Total",
      render: (order) => `Rs ${(order.quantity * order.price_per_unit).toFixed(2)}`,
    },
    { key: "counterparty", header: "With", render: (order) => counterparty(order) },
    {
      key: "status",
      header: "Status",
      render: (order) => <Badge tone={ORDER_TONES[order.status]}>{order.status}</Badge>,
    },
    {
      key: "created",
      header: "Created",
      render: (order) => new Date(order.created_at).toLocaleDateString(),
    },
    {
      key: "actions",
      header: "",
      render: (order) => (
        <Link href={`/orders/${order.id}`} className="font-medium text-green-700 hover:underline">
          View
        </Link>
      ),
    },
  ];

  if (!role) return <Loading label="Loading orders..." />;

  return (
    <DashboardShell role={role} title="Orders">
      <div className="space-y-4">
        {error && <ErrorMessage message={error} onRetry={load} />}
        <Card title="My orders">
          {loading ? (
            <Loading />
          ) : (
            <Table columns={columns} rows={orders} rowKey={(order) => order.id} empty="No orders yet" />
          )}
        </Card>
      </div>
    </DashboardShell>
  );
}
