import Card from "@/components/Card";
import DashboardShell from "@/components/DashboardShell";
import { EmptyState } from "@/components/States";

export default function FarmerDashboardPage() {
  return (
    <DashboardShell role="farmer" title="Farmer dashboard">
      <div className="grid gap-4 md:grid-cols-3">
        <Card title="My listings">
          <EmptyState title="No listings yet" description="Create a crop listing to start receiving offers." />
        </Card>
        <Card title="Buyer requirements">
          <EmptyState title="No requirements yet" description="Browse what buyers are looking for." />
        </Card>
        <Card title="Orders">
          <EmptyState title="No orders yet" description="Accepted offers will appear here." />
        </Card>
      </div>
    </DashboardShell>
  );
}
