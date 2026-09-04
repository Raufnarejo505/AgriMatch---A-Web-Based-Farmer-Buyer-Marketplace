export type Role = "farmer" | "buyer" | "admin";
export type SignupRole = Exclude<Role, "admin">;
export type UserStatus = "active" | "suspended";

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  phone: string | null;
  location: string | null;
  status: UserStatus;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export type Quality = "A" | "B" | "C";
export type ListingStatus = "open" | "closed";
export type RequirementStatus = "open" | "closed";

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
}

export interface Listing {
  id: number;
  farmer_id: number;
  crop: string;
  quantity: number;
  unit: string;
  quality: Quality;
  price_per_unit: number;
  location: string;
  description: string | null;
  status: ListingStatus;
  created_at: string;
}

export interface Requirement {
  id: number;
  buyer_id: number;
  crop: string;
  quantity: number;
  unit: string;
  min_price: number;
  max_price: number;
  delivery_area: string;
  status: RequirementStatus;
  created_at: string;
}

export type ListingInput = Omit<Listing, "id" | "farmer_id" | "status" | "created_at">;
export type RequirementInput = Omit<Requirement, "id" | "buyer_id" | "status" | "created_at">;

export type OfferStatus = "pending" | "accepted" | "rejected" | "countered";
export type OrderStatus = "pending" | "confirmed" | "ready" | "completed" | "cancelled";

export interface Conversation {
  id: number;
  farmer_id: number;
  buyer_id: number;
  listing_id: number | null;
  requirement_id: number | null;
  counterpart_name: string;
  crop: string;
  unit: string;
  reference_price: number | null;
  created_at: string;
}

export interface Message {
  id: number;
  conversation_id: number;
  sender_id: number;
  sender_name: string;
  body: string;
  created_at: string;
}

export interface Offer {
  id: number;
  conversation_id: number;
  from_user_id: number;
  from_user_name: string;
  price_per_unit: number;
  quantity: number;
  status: OfferStatus;
  parent_offer_id: number | null;
  crop: string;
  unit: string;
  counterpart_name: string;
  created_at: string;
}

export interface OrderStatusHistory {
  id: number;
  status: OrderStatus;
  changed_at: string;
}

export interface Order {
  id: number;
  offer_id: number;
  farmer_id: number;
  buyer_id: number;
  crop: string;
  quantity: number;
  price_per_unit: number;
  status: OrderStatus;
  created_at: string;
  farmer_name: string;
  buyer_name: string;
  history: OrderStatusHistory[];
}

export interface AdminStats {
  users: number;
  farmers: number;
  buyers: number;
  suspended: number;
  listings: number;
  requirements: number;
  orders: number;
  pending_orders: number;
}
