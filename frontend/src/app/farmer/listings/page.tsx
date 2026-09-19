"use client";

import { useCallback, useEffect, useState } from "react";

import Badge from "@/components/Badge";
import Button from "@/components/Button";
import Card from "@/components/Card";
import DashboardShell from "@/components/DashboardShell";
import ListingForm from "@/components/ListingForm";
import { ErrorMessage, Loading } from "@/components/States";
import Table, { type Column } from "@/components/Table";
import { ApiError, api } from "@/lib/api";
import type { Listing } from "@/types";

export default function FarmerListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Listing | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setListings(await api.get<Listing[]>("/api/listings/mine"));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load listings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(listing: Listing) {
    setEditing(listing);
    setFormOpen(true);
  }

  function closeForm() {
    setEditing(null);
    setFormOpen(false);
  }

  async function saved() {
    closeForm();
    await load();
  }

  async function remove(listing: Listing) {
    if (!window.confirm(`Delete the ${listing.crop} listing?`)) return;
    setError("");
    try {
      await api.del(`/api/listings/${listing.id}`);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to delete listing");
    }
  }

  async function toggleStatus(listing: Listing) {
    setError("");
    try {
      await api.patch(`/api/listings/${listing.id}`, {
        status: listing.status === "open" ? "closed" : "open",
      });
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to update listing");
    }
  }

  const columns: Column<Listing>[] = [
    {
      key: "crop",
      header: "Crop",
      render: (listing) => <span className="font-medium text-gray-900">{listing.crop}</span>,
    },
    {
      key: "quantity",
      header: "Quantity",
      render: (listing) => `${listing.quantity} ${listing.unit}`,
    },
    { key: "quality", header: "Grade", render: (listing) => `Grade ${listing.quality}` },
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
      header: "Actions",
      render: (listing) => (
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" className="px-2 py-1 text-xs" onClick={() => openEdit(listing)}>
            Edit
          </Button>
          <Button variant="ghost" className="px-2 py-1 text-xs" onClick={() => toggleStatus(listing)}>
            {listing.status === "open" ? "Close" : "Reopen"}
          </Button>
          <Button variant="danger" className="px-2 py-1 text-xs" onClick={() => remove(listing)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DashboardShell role="farmer" title="My listings">
      <div className="space-y-4">
        {error && <ErrorMessage message={error} onRetry={load} />}
        {formOpen ? (
          <Card title={editing ? "Edit listing" : "New listing"}>
            <ListingForm initial={editing ?? undefined} onSaved={saved} onCancel={closeForm} />
          </Card>
        ) : (
          <div className="flex justify-end">
            <Button onClick={openCreate}>New listing</Button>
          </div>
        )}
        <Card
          title="All listings"
          description={`${listings.length} listing${listings.length === 1 ? "" : "s"}`}
        >
          {loading ? (
            <Loading />
          ) : (
            <Table columns={columns} rows={listings} rowKey={(listing) => listing.id} empty="No listings yet" />
          )}
        </Card>
      </div>
    </DashboardShell>
  );
}
