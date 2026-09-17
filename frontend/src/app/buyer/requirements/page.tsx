"use client";

import { useCallback, useEffect, useState } from "react";

import Badge from "@/components/Badge";
import Button from "@/components/Button";
import Card from "@/components/Card";
import DashboardShell from "@/components/DashboardShell";
import RequirementForm from "@/components/RequirementForm";
import { ErrorMessage, Loading } from "@/components/States";
import Table, { type Column } from "@/components/Table";
import { ApiError, api } from "@/lib/api";
import type { Requirement } from "@/types";

export default function BuyerRequirementsPage() {
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Requirement | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setRequirements(await api.get<Requirement[]>("/api/requirements/mine"));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load requirements");
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

  function openEdit(requirement: Requirement) {
    setEditing(requirement);
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

  async function remove(requirement: Requirement) {
    if (!window.confirm(`Delete the ${requirement.crop} requirement?`)) return;
    setError("");
    try {
      await api.del(`/api/requirements/${requirement.id}`);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to delete requirement");
    }
  }

  async function toggleStatus(requirement: Requirement) {
    setError("");
    try {
      await api.patch(`/api/requirements/${requirement.id}`, {
        status: requirement.status === "open" ? "closed" : "open",
      });
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to update requirement");
    }
  }

  const columns: Column<Requirement>[] = [
    {
      key: "crop",
      header: "Crop",
      render: (requirement) => <span className="font-medium text-gray-900">{requirement.crop}</span>,
    },
    {
      key: "quantity",
      header: "Quantity",
      render: (requirement) => `${requirement.quantity} ${requirement.unit}`,
    },
    {
      key: "price",
      header: "Price range",
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
      header: "Actions",
      render: (requirement) => (
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" className="px-2 py-1 text-xs" onClick={() => openEdit(requirement)}>
            Edit
          </Button>
          <Button variant="ghost" className="px-2 py-1 text-xs" onClick={() => toggleStatus(requirement)}>
            {requirement.status === "open" ? "Close" : "Reopen"}
          </Button>
          <Button variant="danger" className="px-2 py-1 text-xs" onClick={() => remove(requirement)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DashboardShell role="buyer" title="My requirements">
      <div className="space-y-4">
        {error && <ErrorMessage message={error} onRetry={load} />}
        {formOpen ? (
          <Card title={editing ? "Edit requirement" : "New requirement"}>
            <RequirementForm initial={editing ?? undefined} onSaved={saved} onCancel={closeForm} />
          </Card>
        ) : (
          <div className="flex justify-end">
            <Button onClick={openCreate}>New requirement</Button>
          </div>
        )}
        <Card
          title="All requirements"
          description={`${requirements.length} requirement${requirements.length === 1 ? "" : "s"}`}
        >
          {loading ? (
            <Loading />
          ) : (
            <Table
              columns={columns}
              rows={requirements}
              rowKey={(requirement) => requirement.id}
              empty="No requirements yet"
            />
          )}
        </Card>
      </div>
    </DashboardShell>
  );
}
