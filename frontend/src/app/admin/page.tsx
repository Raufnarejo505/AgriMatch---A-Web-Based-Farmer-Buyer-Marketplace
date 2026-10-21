"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

import Badge from "@/components/Badge";
import Button from "@/components/Button";
import Card from "@/components/Card";
import DashboardShell from "@/components/DashboardShell";
import { ErrorMessage, Loading } from "@/components/States";
import Table, { type Column } from "@/components/Table";
import { ApiError, api } from "@/lib/api";
import { ORDER_LABELS, ORDER_TONES } from "@/lib/orderStatus";
import type { AdminStats, Listing, Order, Requirement, User } from "@/types";

type Tab = "users" | "listings" | "requirements" | "orders";

const TABS: { id: Tab; label: string }[] = [
  { id: "users", label: "Users" },
  { id: "listings", label: "Listings" },
  { id: "requirements", label: "Requirements" },
  { id: "orders", label: "Orders" },
];

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [tab, setTab] = useState<Tab>("users");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [statsData, usersData, listingsData, requirementsData, ordersData] = await Promise.all([
        api.get<AdminStats>("/api/admin/stats"),
        api.get<User[]>("/api/admin/users"),
        api.get<Listing[]>("/api/admin/listings"),
        api.get<Requirement[]>("/api/admin/requirements"),
        api.get<Order[]>("/api/admin/orders"),
      ]);
      setStats(statsData);
      setUsers(usersData);
      setListings(listingsData);
      setRequirements(requirementsData);
      setOrders(ordersData);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load admin data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function run(action: () => Promise<unknown>, confirmText?: string) {
    if (confirmText && !window.confirm(confirmText)) return;
    setError("");
    try {
      await action();
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Action failed");
    }
  }

  function toggleUser(user: User) {
    return run(() =>
      api.patch(`/api/admin/users/${user.id}/status`, {
        status: user.status === "active" ? "suspended" : "active",
      }),
    );
  }

  function deleteUser(user: User) {
    return run(() => api.del(`/api/admin/users/${user.id}`), `Delete ${user.name}?`);
  }

  function deleteListing(listing: Listing) {
    return run(
      () => api.del(`/api/admin/listings/${listing.id}`),
      `Delete the ${listing.crop} listing?`,
    );
  }

  function deleteRequirement(requirement: Requirement) {
    return run(
      () => api.del(`/api/admin/requirements/${requirement.id}`),
      `Delete the ${requirement.crop} requirement?`,
    );
  }

  const statCards = stats
    ? [
        { label: "Users", value: stats.users },
        { label: "Farmers", value: stats.farmers },
        { label: "Buyers", value: stats.buyers },
        { label: "Suspended", value: stats.suspended },
        { label: "Listings", value: stats.listings },
        { label: "Requirements", value: stats.requirements },
        { label: "Orders", value: stats.orders },
        { label: "Pending orders", value: stats.pending_orders },
      ]
    : [];

  const userColumns: Column<User>[] = [
    {
      key: "name",
      header: "User",
      render: (user) => (
        <div>
          <p className="font-medium text-gray-900">{user.name}</p>
          <p className="text-xs text-gray-500">{user.email}</p>
        </div>
      ),
    },
    { key: "role", header: "Role", render: (user) => <span className="capitalize">{user.role}</span> },
    {
      key: "status",
      header: "Status",
      render: (user) => (
        <Badge tone={user.status === "active" ? "green" : "red"}>{user.status}</Badge>
      ),
    },
    {
      key: "created",
      header: "Joined",
      render: (user) => new Date(user.created_at).toLocaleDateString(),
    },
    {
      key: "actions",
      header: "Actions",
      render: (user) => (
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" className="px-2 py-1 text-xs" onClick={() => toggleUser(user)}>
            {user.status === "active" ? "Suspend" : "Activate"}
          </Button>
          <Button variant="danger" className="px-2 py-1 text-xs" onClick={() => deleteUser(user)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const listingColumns: Column<Listing>[] = [
    {
      key: "crop",
      header: "Crop",
      render: (listing) => <span className="font-medium text-gray-900">{listing.crop}</span>,
    },
    { key: "farmer", header: "Farmer", render: (listing) => `#${listing.farmer_id}` },
    {
      key: "quantity",
      header: "Quantity",
      render: (listing) => `${listing.quantity} ${listing.unit}`,
    },
    {
      key: "price",
      header: "Price",
      render: (listing) => `Rs ${listing.price_per_unit} / ${listing.unit}`,
    },
    { key: "location", header: "Location", render: (listing) => listing.location },
    {
      key: "status",
      header: "Status",
      render: (listing) => (
        <Badge tone={listing.status === "open" ? "green" : "gray"}>{listing.status}</Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (listing) => (
        <Button variant="danger" className="px-2 py-1 text-xs" onClick={() => deleteListing(listing)}>
          Delete
        </Button>
      ),
    },
  ];

  const requirementColumns: Column<Requirement>[] = [
    {
      key: "crop",
      header: "Crop",
      render: (requirement) => <span className="font-medium text-gray-900">{requirement.crop}</span>,
    },
    { key: "buyer", header: "Buyer", render: (requirement) => `#${requirement.buyer_id}` },
    {
      key: "quantity",
      header: "Quantity",
      render: (requirement) => `${requirement.quantity} ${requirement.unit}`,
    },
    {
      key: "price",
      header: "Budget",
      render: (requirement) =>
        `Rs ${requirement.min_price} - ${requirement.max_price} / ${requirement.unit}`,
    },
    { key: "delivery_area", header: "Delivery area", render: (requirement) => requirement.delivery_area },
    {
      key: "status",
      header: "Status",
      render: (requirement) => (
        <Badge tone={requirement.status === "open" ? "green" : "gray"}>{requirement.status}</Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (requirement) => (
        <Button
          variant="danger"
          className="px-2 py-1 text-xs"
          onClick={() => deleteRequirement(requirement)}
        >
          Delete
        </Button>
      ),
    },
  ];

  const orderColumns: Column<Order>[] = [
    {
      key: "id",
      header: "Order",
      render: (order) => <span className="font-medium text-gray-900">#{order.id}</span>,
    },
    { key: "crop", header: "Crop", render: (order) => order.crop },
    { key: "farmer", header: "Farmer", render: (order) => order.farmer_name },
    { key: "buyer", header: "Buyer", render: (order) => order.buyer_name },
    {
      key: "total",
      header: "Total",
      render: (order) => `Rs ${(order.quantity * order.price_per_unit).toFixed(2)}`,
    },
    {
      key: "status",
      header: "Status",
      render: (order) => (
        <Badge tone={ORDER_TONES[order.status]}>{ORDER_LABELS[order.status]}</Badge>
      ),
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

  return (
    <DashboardShell role="admin" title="Admin dashboard">
      <div className="space-y-4">
        {error && <ErrorMessage message={error} onRetry={load} />}
        {loading ? (
          <Loading />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {statCards.map((card) => (
                <Card key={card.label}>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    {card.label}
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-green-700">{card.value}</p>
                </Card>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {TABS.map((item) => (
                <Button
                  key={item.id}
                  variant={tab === item.id ? "primary" : "secondary"}
                  className="px-3 py-1.5 text-xs"
                  onClick={() => setTab(item.id)}
                >
                  {item.label}
                </Button>
              ))}
            </div>
            {tab === "users" && (
              <Card title="Users">
                <Table columns={userColumns} rows={users} rowKey={(user) => user.id} empty="No users yet" />
              </Card>
            )}
            {tab === "listings" && (
              <Card title="Listings">
                <Table
                  columns={listingColumns}
                  rows={listings}
                  rowKey={(listing) => listing.id}
                  empty="No listings yet"
                />
              </Card>
            )}
            {tab === "requirements" && (
              <Card title="Requirements">
                <Table
                  columns={requirementColumns}
                  rows={requirements}
                  rowKey={(requirement) => requirement.id}
                  empty="No requirements yet"
                />
              </Card>
            )}
            {tab === "orders" && (
              <Card title="Orders">
                <Table
                  columns={orderColumns}
                  rows={orders}
                  rowKey={(order) => order.id}
                  empty="No orders yet"
                />
              </Card>
            )}
          </>
        )}
      </div>
    </DashboardShell>
  );
}
