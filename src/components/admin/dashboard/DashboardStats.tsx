
import { Users, FileCheck, Building, Activity } from "lucide-react";

const DashboardStats = () => {
  // Dans une application réelle, ces données viendraient d'une API
  const stats = [
    {
      title: "Utilisateurs",
      value: "1,247",
      change: "+12.5%",
      trend: "up",
      details: [
        { label: "Actifs", value: "876" },
        { label: "En attente", value: "24" },
        { label: "Inactifs", value: "347" }
      ],
      icon: Users
    },
    {
      title: "DSF générées",
      value: "3,856",
      change: "+23.7%",
      trend: "up",
      details: [
        { label: "Ce mois", value: "642" },
        { label: "Mois dernier", value: "519" }
      ],
      icon: FileCheck
    },
    {
      title: "Entreprises",
      value: "724",
      change: "+8.2%",
      trend: "up",
      details: [
        { label: "Nouvelles", value: "58" },
        { label: "Actives", value: "698" }
      ],
      icon: Building
    },
    {
      title: "Revenus mensuels",
      value: "2,345,000 FCFA",
      change: "+5.3%",
      trend: "up",
      details: [
        { label: "Abonnements", value: "1,987,500 FCFA" },
        { label: "Services", value: "357,500 FCFA" }
      ],
      icon: Activity
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-500 text-sm">{stat.title}</p>
              <h3 className="text-2xl font-bold">{stat.value}</h3>
            </div>
            <div className={`p-3 rounded-full ${
              stat.trend === "up" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
            }`}>
              <stat.icon size={20} />
            </div>
          </div>
          
          <div className="flex items-center mb-4">
            <span className={
              stat.trend === "up" ? "text-green-600" : "text-red-600"
            }>
              {stat.change}
            </span>
            <span className="text-gray-500 text-sm ml-2">depuis le mois dernier</span>
          </div>
          
          <div className="space-y-2 mt-3">
            {stat.details.map((detail, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span className="text-gray-500">{detail.label}</span>
                <span className="font-medium">{detail.value}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardStats;
