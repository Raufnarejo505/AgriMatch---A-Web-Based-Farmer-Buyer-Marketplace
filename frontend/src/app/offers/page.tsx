"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

import Badge, { type BadgeTone } from "@/components/Badge";
import Card from "@/components/Card";
import DashboardShell from "@/components/DashboardShell";
import { ErrorMessage, Loading } from "@/components/States";
import Table, { type Column } from "@/components/Table";
import { ApiError, api } from "@/lib/api";
import { getUser } from "@/lib/auth";
import type { Offer, OfferStatus } from "@/types";

const TONES: Record<OfferStatus, BadgeTone> = {
  pending: "amber",
  accepted: "green",
  rejected: "red",
  countered: "gray",
};

export default function OffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const role = getUser()?.role;

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setOffers(await api.get<Offer[]>("/api/offers/mine"));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load offers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const columns: Column<Offer>[] = [
    {
      key: "crop",
      header: "Crop",
      render: (offer) => <span className="font-medium text-gray-900">{offer.crop}</span>,
    },
    { key: "counterpart", header: "With", render: (offer) => offer.counterpart_name },
    {
      key: "price",
      header: "Price",
      render: (offer) => `Rs ${offer.price_per_unit} / ${offer.unit}`,
    },
    {
      key: "quantity",
      header: "Quantity",
      render: (offer) => `${offer.quantity} ${offer.unit}`,
    },
    {
      key: "status",
      header: "Status",
      render: (offer) => <Badge tone={TONES[offer.status]}>{offer.status}</Badge>,
    },
    {
      key: "created",
      header: "Created",
      render: (offer) => new Date(offer.created_at).toLocaleDateString(),
    },
    {
      key: "actions",
      header: "",
      render: (offer) => (
        <Link
          href={`/conversations/${offer.conversation_id}`}
          className="font-medium text-green-700 hover:underline"
        >
          Open chat
        </Link>
      ),
    },
  ];

  if (!role) return <Loading label="Loading offers..." />;

  return (
    <DashboardShell role={role} title="Offers">
      <div className="space-y-4">
        {error && <ErrorMessage message={error} onRetry={load} />}
        <Card title="My offers">
          {loading ? (
            <Loading />
          ) : (
            <Table columns={columns} rows={offers} rowKey={(offer) => offer.id} empty="No offers yet" />
          )}
        </Card>
      </div>
    </DashboardShell>
  );
}
