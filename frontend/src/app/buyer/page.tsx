import Card from "@/components/Card";
import DashboardShell from "@/components/DashboardShell";
import { EmptyState } from "@/components/States";

export default function BuyerDashboardPage() {
  return (
    <DashboardShell role="buyer" title="Buyer dashboard">
      <div className="grid gap-4 md:grid-cols-3">
        <Card title="My requirements">
          <EmptyState title="No requirements yet" description="Post a requirement to find matching crops." />
        </Card>
        <Card title="Browse listings">
          <EmptyState title="No listings yet" description="Search crops listed by farmers." />
        </Card>
        <Card title="Orders">
          <EmptyState title="No orders yet" description="Accepted offers will appear here." />
        </Card>
      </div>
    </DashboardShell>
  );
}
