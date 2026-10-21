"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import Badge, { type BadgeTone } from "@/components/Badge";
import Button from "@/components/Button";
import Card from "@/components/Card";
import DashboardShell from "@/components/DashboardShell";
import Input from "@/components/Input";
import { ErrorMessage, Loading } from "@/components/States";
import { ApiError, api } from "@/lib/api";
import { getUser } from "@/lib/auth";
import { connectConversation, sendChatMessage } from "@/lib/ws";
import type { Conversation, Message, Offer, OfferStatus, Order } from "@/types";

const OFFER_TONES: Record<OfferStatus, BadgeTone> = {
  pending: "amber",
  accepted: "green",
  rejected: "red",
  countered: "gray",
};

export default function ChatPage({ params }: { params: { id: string } }) {
  const conversationId = Number(params.id);
  const router = useRouter();
  const me = getUser();

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [draft, setDraft] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [counterFor, setCounterFor] = useState<Offer | null>(null);
  const [counterPrice, setCounterPrice] = useState("");
  const [counterQuantity, setCounterQuantity] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  const loadOffers = useCallback(async () => {
    setOffers(await api.get<Offer[]>(`/api/offers?conversation_id=${conversationId}`));
  }, [conversationId]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    Promise.all([
      api.get<Conversation>(`/api/conversations/${conversationId}`),
      api.get<Message[]>(`/api/conversations/${conversationId}/messages`),
      api.get<Offer[]>(`/api/offers?conversation_id=${conversationId}`),
    ])
      .then(([chat, history, offerList]) => {
        if (!active) return;
        setConversation(chat);
        setMessages(history);
        setOffers(offerList);
        setPrice(String(chat.reference_price ?? ""));
      })
      .catch((err) => {
        if (active) setError(err instanceof ApiError ? err.message : "Failed to load conversation");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [conversationId, reloadKey]);

  useEffect(() => {
    const socket = connectConversation(conversationId, (event) => {
      if (event.type === "message") {
        setMessages((previous) =>
          previous.some((message) => message.id === event.data.id) ? previous : [...previous, event.data],
        );
      } else {
        void loadOffers().catch(() => setError("Failed to refresh offers"));
      }
    });
    socketRef.current = socket;
    return () => {
      socket?.close();
      socketRef.current = null;
    };
  }, [conversationId, loadOffers]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const body = draft.trim();
    if (!body) return;
    if (!sendChatMessage(socketRef.current, body)) {
      setError("Chat connection is not open. Reload the page and try again.");
      return;
    }
    setDraft("");
  }

  async function submitOffer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      await api.post<Offer>("/api/offers", {
        conversation_id: conversationId,
        price_per_unit: Number(price),
        quantity: Number(quantity),
      });
      setQuantity("");
      await loadOffers();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to send offer");
    } finally {
      setBusy(false);
    }
  }

  async function decide(offer: Offer, action: "accept" | "reject") {
    setError("");
    setBusy(true);
    try {
      if (action === "accept") {
        const order = await api.post<Order>(`/api/offers/${offer.id}/accept`);
        await loadOffers();
        router.push(`/orders/${order.id}`);
      } else {
        await api.post(`/api/offers/${offer.id}/reject`);
        await loadOffers();
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to update offer");
    } finally {
      setBusy(false);
    }
  }

  function openCounter(offer: Offer) {
    setCounterFor(offer);
    setCounterPrice(String(offer.price_per_unit));
    setCounterQuantity(String(offer.quantity));
  }

  async function submitCounter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!counterFor) return;
    setError("");
    setBusy(true);
    try {
      await api.post(`/api/offers/${counterFor.id}/counter`, {
        price_per_unit: Number(counterPrice),
        quantity: Number(counterQuantity),
      });
      setCounterFor(null);
      setCounterPrice("");
      setCounterQuantity("");
      await loadOffers();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to counter offer");
    } finally {
      setBusy(false);
    }
  }

  const role = me?.role;
  if (!role) return <Loading label="Loading chat..." />;

  return (
    <DashboardShell role={role} title={conversation ? `Chat · ${conversation.crop}` : "Chat"}>
      <div className="space-y-4">
        {error && <ErrorMessage message={error} onRetry={() => setReloadKey((key) => key + 1)} />}
        {loading ? (
          <Loading />
        ) : (
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Card
                title={conversation?.counterpart_name ?? "Conversation"}
                description={
                  conversation
                    ? `Reference: Rs ${conversation.reference_price ?? "-"} / ${conversation.unit}`
                    : undefined
                }
              >
                <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
                  {messages.length === 0 ? (
                    <p className="py-6 text-center text-sm text-gray-500">No messages yet. Say hello.</p>
                  ) : (
                    messages.map((message) => {
                      const mine = message.sender_id === me?.id;
                      return (
                        <div key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                          <div
                            className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                              mine ? "bg-green-600 text-white" : "bg-gray-100 text-gray-900"
                            }`}
                          >
                            {!mine && (
                              <p className="mb-1 text-xs font-medium text-gray-500">{message.sender_name}</p>
                            )}
                            <p className="whitespace-pre-wrap break-words">{message.body}</p>
                            <p
                              className={`mt-1 text-right text-[10px] ${
                                mine ? "text-green-100" : "text-gray-500"
                              }`}
                            >
                              {new Date(message.created_at).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={bottomRef} />
                </div>
                <form onSubmit={sendMessage} className="mt-4 flex items-start gap-2">
                  <Input
                    name="message"
                    placeholder="Write a message..."
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                  />
                  <Button type="submit" disabled={!draft.trim()}>
                    Send
                  </Button>
                </form>
              </Card>
            </div>
            <div className="space-y-4">
              <Card title="Offers">
                {offers.length === 0 ? (
                  <p className="text-sm text-gray-500">No offers yet.</p>
                ) : (
                  <ul className="space-y-3">
                    {offers.map((offer) => (
                      <li key={offer.id} className="rounded-md border border-gray-200 p-3 text-sm">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium text-gray-900">
                            Rs {offer.price_per_unit} / {offer.unit}
                          </span>
                          <Badge tone={OFFER_TONES[offer.status]}>{offer.status}</Badge>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                          {offer.quantity} {offer.unit} · from {offer.from_user_name}
                        </p>
                        {offer.status === "pending" && offer.from_user_id !== me?.id && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            <Button
                              className="px-2 py-1 text-xs"
                              disabled={busy}
                              onClick={() => decide(offer, "accept")}
                            >
                              Accept
                            </Button>
                            <Button
                              variant="secondary"
                              className="px-2 py-1 text-xs"
                              disabled={busy}
                              onClick={() => decide(offer, "reject")}
                            >
                              Reject
                            </Button>
                            <Button
                              variant="ghost"
                              className="px-2 py-1 text-xs"
                              disabled={busy}
                              onClick={() => openCounter(offer)}
                            >
                              Counter
                            </Button>
                          </div>
                        )}
                        {counterFor?.id === offer.id && (
                          <form onSubmit={submitCounter} className="mt-3 space-y-2">
                            <div className="grid grid-cols-2 gap-2">
                              <Input
                                label="Price"
                                name="counter_price"
                                type="number"
                                min="0.01"
                                step="any"
                                required
                                value={counterPrice}
                                onChange={(event) => setCounterPrice(event.target.value)}
                              />
                              <Input
                                label="Quantity"
                                name="counter_quantity"
                                type="number"
                                min="0.01"
                                step="any"
                                required
                                value={counterQuantity}
                                onChange={(event) => setCounterQuantity(event.target.value)}
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button type="submit" className="px-2 py-1 text-xs" disabled={busy}>
                                Send counter
                              </Button>
                              <Button
                                type="button"
                                variant="secondary"
                                className="px-2 py-1 text-xs"
                                onClick={() => setCounterFor(null)}
                              >
                                Cancel
                              </Button>
                            </div>
                          </form>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
              <Card title="Make an offer">
                <form onSubmit={submitOffer} className="space-y-3">
                  <Input
                    label={`Price per ${conversation?.unit ?? "unit"}`}
                    name="price_per_unit"
                    type="number"
                    min="0.01"
                    step="any"
                    required
                    value={price}
                    onChange={(event) => setPrice(event.target.value)}
                  />
                  <Input
                    label={`Quantity (${conversation?.unit ?? "unit"})`}
                    name="quantity"
                    type="number"
                    min="0.01"
                    step="any"
                    required
                    value={quantity}
                    onChange={(event) => setQuantity(event.target.value)}
                  />
                  <Button type="submit" className="w-full" disabled={busy}>
                    Send offer
                  </Button>
                </form>
              </Card>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
