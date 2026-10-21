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
import type { Conversation, Listing, Page } from "@/types";

const PAGE_SIZE = 9;

export default function BrowseListingsPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<SearchFilters>(emptyFilters);
  const [applied, setApplied] = useState<SearchFilters>(emptyFilters);
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Page<Listing> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    api
      .get<Page<Listing>>(
        `/api/listings${queryString({ ...applied, status: "open", page, size: PAGE_SIZE })}`,
      )
      .then((result) => {
        if (active) setData(result);
      })
      .catch((err) => {
        if (active) setError(err instanceof ApiError ? err.message : "Failed to load listings");
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

  async function contact(listing: Listing) {
    setError("");
    try {
      const conversation = await api.post<Conversation>("/api/conversations", { listing_id: listing.id });
      router.push(`/conversations/${conversation.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to start conversation");
    }
  }

  return (
    <DashboardShell role="buyer" title="Browse crops">
      <div className="space-y-4">
        <FilterBar
          values={filters}
          onChange={setFilters}
          onApply={apply}
          onReset={reset}
          showQuality
        />
        {error && <ErrorMessage message={error} onRetry={() => setApplied({ ...applied })} />}
        {loading ? (
          <Loading />
        ) : data && data.items.length > 0 ? (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {data.items.map((listing) => (
                <Card key={listing.id}>
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="text-base font-semibold text-gray-900">{listing.crop}</h2>
                    <Badge tone="amber">Grade {listing.quality}</Badge>
                  </div>
                  <dl className="mt-3 space-y-1 text-sm text-gray-600">
                    <div className="flex justify-between gap-2">
                      <dt>Quantity</dt>
                      <dd className="font-medium text-gray-900">
                        {listing.quantity} {listing.unit}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt>Price</dt>
                      <dd className="font-medium text-gray-900">
                        Rs {listing.price_per_unit} / {listing.unit}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt>Location</dt>
                      <dd className="text-gray-900">{listing.location}</dd>
                    </div>
                  </dl>
                  {listing.description && (
                    <p className="mt-3 line-clamp-2 text-sm text-gray-500">{listing.description}</p>
                  )}
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <p className="text-xs text-gray-400">
                      Listed {new Date(listing.created_at).toLocaleDateString()}
                    </p>
                    <Button variant="secondary" className="px-2 py-1 text-xs" onClick={() => contact(listing)}>
                      Message farmer
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
            <Pagination page={page} size={PAGE_SIZE} total={data.total} onPage={setPage} />
          </>
        ) : (
          <EmptyState title="No listings found" description="Try adjusting or resetting your filters." />
        )}
      </div>
    </DashboardShell>
  );
}
