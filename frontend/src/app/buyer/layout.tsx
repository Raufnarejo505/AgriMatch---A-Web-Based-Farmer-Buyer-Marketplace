import RoleGuard from "@/components/RoleGuard";

export default function BuyerLayout({ children }: { children: React.ReactNode }) {
  return <RoleGuard role="buyer">{children}</RoleGuard>;
}
