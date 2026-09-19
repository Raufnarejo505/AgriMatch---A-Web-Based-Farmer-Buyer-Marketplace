"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Badge from "@/components/Badge";
import Button from "@/components/Button";
import Card from "@/components/Card";
import DashboardShell from "@/components/DashboardShell";
import FilterBar from "@/components/FilterBar";
import Pagination from "@/components/Pagination";
import { EmptyState, ErrorMessage, Loading } from "@/components/States";
import { ApiError, api, queryString } from "@/lib/api";
import { emptyFilters, type SearchFilters } from "@/lib/filters";
import type { Conversation, Page, Requirement } from "@/types";

const PAGE_SIZE = 9;

export default function BrowseRequirementsPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<SearchFilters>(emptyFilters);
  const [applied, setApplied] = useState<SearchFilters>(emptyFilters);
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Page<Requirement> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    api
      .get<Page<Requirement>>(
        `/api/requirements${queryString({ ...applied, status: "open", page, size: PAGE_SIZE })}`,
      )
      .then((result) => {
        if (active) setData(result);
      })
      .catch((err) => {
        if (active) setError(err instanceof ApiError ? err.message : "Failed to load requirements");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [applied, page]);

  function apply() {
    setPage(1);
    setApplied({ ...filters });
  }

  function reset() {
    setFilters(emptyFilters);
    setPage(1);
    setApplied({ ...emptyFilters });
  }

  async function contact(requirement: Requirement) {
    setError("");
    try {
      const conversation = await api.post<Conversation>("/api/conversations", {
        requirement_id: requirement.id,
      });
      router.push(`/conversations/${conversation.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to start conversation");
    }
  }

  return (
    <DashboardShell role="farmer" title="Browse requirements">
      <div className="space-y-4">
        <FilterBar
          values={filters}
          onChange={setFilters}
          onApply={apply}
          onReset={reset}
          locationLabel="Delivery area"
        />
        {error && <ErrorMessage message={error} onRetry={() => setApplied({ ...applied })} />}
        {loading ? (
          <Loading />
        ) : data && data.items.length > 0 ? (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {data.items.map((requirement) => (
                <Card key={requirement.id}>
                  <h2 className="text-base font-semibold text-gray-900">{requirement.crop}</h2>
                  <dl className="mt-3 space-y-1 text-sm text-gray-600">
                    <div className="flex justify-between gap-2">
                      <dt>Quantity</dt>
                      <dd className="font-medium text-gray-900">
                        {requirement.quantity} {requirement.unit}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt>Budget</dt>
                      <dd className="font-medium text-gray-900">
                        Rs {requirement.min_price} - {requirement.max_price} / {requirement.unit}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt>Delivery area</dt>
                      <dd className="text-gray-900">{requirement.delivery_area}</dd>
                    </div>
                  </dl>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <Badge tone="green">open</Badge>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-gray-400">
                        Posted {new Date(requirement.created_at).toLocaleDateString()}
                      </p>
                      <Button
                        variant="secondary"
                        className="px-2 py-1 text-xs"
                        onClick={() => contact(requirement)}
                      >
                        Message buyer
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            <Pagination page={page} size={PAGE_SIZE} total={data.total} onPage={setPage} />
          </>
        ) : (
          <EmptyState title="No requirements found" description="Try adjusting or resetting your filters." />
        )}
      </div>
    </DashboardShell>
  );
}
