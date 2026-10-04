"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

import Card from "@/components/Card";
import DashboardShell from "@/components/DashboardShell";
import { ErrorMessage, Loading } from "@/components/States";
import Table, { type Column } from "@/components/Table";
import { ApiError, api } from "@/lib/api";
import { getUser } from "@/lib/auth";
import type { Conversation } from "@/types";

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const role = getUser()?.role;

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setConversations(await api.get<Conversation[]>("/api/conversations"));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load conversations");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const columns: Column<Conversation>[] = [
    {
      key: "crop",
      header: "Crop",
      render: (conversation) => <span className="font-medium text-gray-900">{conversation.crop}</span>,
    },
    { key: "counterpart", header: "With", render: (conversation) => conversation.counterpart_name },
    {
      key: "reference",
      header: "Reference price",
      render: (conversation) =>
        conversation.reference_price === null
          ? "-"
          : `Rs ${conversation.reference_price} / ${conversation.unit}`,
    },
    {
      key: "created",
      header: "Started",
      render: (conversation) => new Date(conversation.created_at).toLocaleDateString(),
    },
    {
      key: "actions",
      header: "",
      render: (conversation) => (
        <Link
          href={`/conversations/${conversation.id}`}
          className="font-medium text-green-700 hover:underline"
        >
          Open chat
        </Link>
      ),
    },
  ];

  if (!role) return <Loading label="Loading chats..." />;

  return (
    <DashboardShell role={role} title="Chats">
      <div className="space-y-4">
        {error && <ErrorMessage message={error} onRetry={load} />}
        <Card title="Conversations">
          {loading ? (
            <Loading />
          ) : (
            <Table
              columns={columns}
              rows={conversations}
              rowKey={(conversation) => conversation.id}
              empty="No conversations yet"
            />
          )}
        </Card>
      </div>
    </DashboardShell>
  );
}
