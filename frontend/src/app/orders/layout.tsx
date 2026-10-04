import RoleGuard from "@/components/RoleGuard";

export default function OrdersLayout({ children }: { children: React.ReactNode }) {
  return <RoleGuard>{children}</RoleGuard>;
}
