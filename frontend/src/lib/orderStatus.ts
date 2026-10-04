import type { BadgeTone } from "@/components/Badge";
import type { OrderStatus } from "@/types";

export const ORDER_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  ready: "Ready for pickup",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const ORDER_TONES: Record<OrderStatus, BadgeTone> = {
  pending: "amber",
  confirmed: "green",
  ready: "green",
  completed: "gray",
  cancelled: "red",
};

export const ORDER_NEXT: Record<OrderStatus, OrderStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["ready", "cancelled"],
  ready: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};
