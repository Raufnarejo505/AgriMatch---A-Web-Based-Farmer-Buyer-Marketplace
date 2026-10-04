import RoleGuard from "@/components/RoleGuard";

export default function ConversationsLayout({ children }: { children: React.ReactNode }) {
  return <RoleGuard>{children}</RoleGuard>;
}
