import RoleGuard from "@/components/RoleGuard";

export default function OffersLayout({ children }: { children: React.ReactNode }) {
  return <RoleGuard>{children}</RoleGuard>;
}
