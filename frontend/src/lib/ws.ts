import type { Message, Offer } from "@/types";

import { getToken } from "./auth";

export const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8000";

export type ConversationEvent =
  | { type: "message"; data: Message }
  | { type: "offer"; data: Offer };

export function connectConversation(
  conversationId: number,
  onEvent: (event: ConversationEvent) => void,
): WebSocket | null {
  const token = getToken();
  if (!token) return null;

  const socket = new WebSocket(`${WS_URL}/ws/${conversationId}?token=${encodeURIComponent(token)}`);
  socket.onmessage = (event) => {
    try {
      onEvent(JSON.parse(event.data as string) as ConversationEvent);
    } catch {
      // ignore malformed frames
    }
  };
  return socket;
}

export function sendChatMessage(socket: WebSocket | null, body: string): boolean {
  if (!socket || socket.readyState !== WebSocket.OPEN) return false;
  socket.send(JSON.stringify({ type: "message", body }));
  return true;
}
