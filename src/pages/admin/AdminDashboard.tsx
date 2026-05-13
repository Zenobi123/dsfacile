
import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import DashboardStats from "@/components/admin/dashboard/DashboardStats";
import RevenueChart from "@/components/admin/dashboard/RevenueChart";
import AlertsList from "@/components/admin/dashboard/AlertsList";

const AdminDashboard = () => {
  const [timeRange, setTimeRange] = useState<"daily" | "weekly" | "monthly" | "yearly">("monthly");
  
  return (
    <AdminLayout>
      <div className="p-4 sm:p-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6">Tableau de bord d'administration</h1>
        
        {/* Statistiques générales */}
        <DashboardStats />
        
        {/* Graphique des revenus */}
        <div className="mt-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <h2 className="text-xl font-semibold">Évolution des revenus</h2>
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => setTimeRange("daily")}
                className={`px-3 py-1 rounded ${timeRange === "daily" ? "bg-primary text-white" : "bg-gray-100"}`}
              >
                Jour
              </button>
              <button 
                onClick={() => setTimeRange("weekly")}
                className={`px-3 py-1 rounded ${timeRange === "weekly" ? "bg-primary text-white" : "bg-gray-100"}`}
              >
                Semaine
              </button>
              <button 
                onClick={() => setTimeRange("monthly")}
                className={`px-3 py-1 rounded ${timeRange === "monthly" ? "bg-primary text-white" : "bg-gray-100"}`}
              >
                Mois
              </button>
              <button 
                onClick={() => setTimeRange("yearly")}
                className={`px-3 py-1 rounded ${timeRange === "yearly" ? "bg-primary text-white" : "bg-gray-100"}`}
              >
                Année
              </button>
            </div>
          </div>
          <RevenueChart timeRange={timeRange} />
        </div>
        
        {/* Alertes système */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Alertes système</h2>
          <AlertsList />
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
