import Card from "@/components/Card";
import DashboardShell from "@/components/DashboardShell";
import { EmptyState } from "@/components/States";

export default function AdminDashboardPage() {
  return (
    <DashboardShell role="admin" title="Admin dashboard">
      <div className="grid gap-4 md:grid-cols-3">
        <Card title="Users">
          <EmptyState title="No users yet" description="Registered farmers and buyers will appear here." />
        </Card>
        <Card title="Marketplace">
          <EmptyState title="No listings yet" description="Listings and requirements across the platform." />
        </Card>
        <Card title="Orders">
          <EmptyState title="No orders yet" description="All orders across the platform." />
        </Card>
      </div>
    </DashboardShell>
  );
}
