import OrderDashboardClient from "@/components/admin/dashboard/OrderDashboardClient";

export const dynamic = "force-dynamic";

export default function AdminOrdersPage() {
  return (
    <div className="space-y-6">
      <div className="bg-background border border-border p-6 rounded-lg shadow-sm">
        <h1 className="text-2xl font-heading font-bold text-primary">Order Management Center</h1>
        <p className="text-sm font-sans text-muted-foreground mt-1">
          Track sales graphs, update shipping parameters, and execute multi-select archival procedures.
        </p>
      </div>

      <OrderDashboardClient />
    </div>
  );
}