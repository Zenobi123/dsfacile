
import { ChartContainer } from "@/components/ui/chart";
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface RevenueChartProps {
  timeRange: "daily" | "weekly" | "monthly" | "yearly";
}

const RevenueChart = ({ timeRange }: RevenueChartProps) => {
  // Dans une application réelle, ces données viendraient d'une API
  // Les données sont adaptées en fonction de la plage de temps sélectionnée
  const getChartData = () => {
    switch (timeRange) {
      case "daily":
        return [
          { name: "00h", abonnements: 45000, services: 12000 },
          { name: "04h", abonnements: 52000, services: 15000 },
          { name: "08h", abonnements: 78000, services: 22000 },
          { name: "12h", abonnements: 110000, services: 38000 },
          { name: "16h", abonnements: 125000, services: 42000 },
          { name: "20h", abonnements: 95000, services: 28000 },
        ];
      case "weekly":
        return [
          { name: "Lun", abonnements: 325000, services: 72000 },
          { name: "Mar", abonnements: 345000, services: 85000 },
          { name: "Mer", abonnements: 378000, services: 92000 },
          { name: "Jeu", abonnements: 410000, services: 98000 },
          { name: "Ven", abonnements: 425000, services: 112000 },
          { name: "Sam", abonnements: 295000, services: 68000 },
          { name: "Dim", abonnements: 215000, services: 45000 },
        ];
      case "yearly":
        return [
          { name: "Jan", abonnements: 1625000, services: 372000 },
          { name: "Fév", abonnements: 1745000, services: 385000 },
          { name: "Mar", abonnements: 1878000, services: 392000 },
          { name: "Avr", abonnements: 1910000, services: 398000 },
          { name: "Mai", abonnements: 1925000, services: 412000 },
          { name: "Juin", abonnements: 2025000, services: 432000 },
          { name: "Juil", abonnements: 2115000, services: 445000 },
          { name: "Aoû", abonnements: 2045000, services: 422000 },
          { name: "Sep", abonnements: 2145000, services: 458000 },
          { name: "Oct", abonnements: 2225000, services: 485000 },
          { name: "Nov", abonnements: 2345000, services: 515000 },
          { name: "Déc", abonnements: 2425000, services: 528000 },
        ];
      case "monthly":
      default:
        return [
          { name: "Sem 1", abonnements: 425000, services: 92000 },
          { name: "Sem 2", abonnements: 485000, services: 105000 },
          { name: "Sem 3", abonnements: 512000, services: 118000 },
          { name: "Sem 4", abonnements: 565000, services: 142000 },
        ];
    }
  };

  const data = getChartData();
  
  const formatMontant = (value: number) => {
    return `${value.toLocaleString()} FCFA`;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="h-80">
        <ChartContainer
          config={{
            abonnements: {
              label: "Abonnements",
              color: "#22577A" // primary
            },
            services: {
              label: "Services",
              color: "#57CC99" // accent
            }
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="name" 
                tick={{ fill: "#6B7280" }}
                axisLine={{ stroke: "#E5E7EB" }}
                tickLine={{ stroke: "#E5E7EB" }}
              />
              <YAxis 
                tickFormatter={(value) => `${(value / 1000)}k`}
                tick={{ fill: "#6B7280" }}
                axisLine={{ stroke: "#E5E7EB" }}
                tickLine={{ stroke: "#E5E7EB" }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="abonnements"
                stroke="#22577A"
                strokeWidth={2}
                activeDot={{ r: 8 }}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="services"
                stroke="#57CC99"
                strokeWidth={2}
                activeDot={{ r: 8 }}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </div>
  );
};

// Composant pour personnaliser le tooltip
interface TooltipPayloadItem {
  value: number | string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 shadow-md rounded-md">
        <p className="font-semibold">{label}</p>
        <p className="text-primary">
          Abonnements: {Number(payload[0].value).toLocaleString()} FCFA
        </p>
        <p className="text-accent">
          Services: {Number(payload[1].value).toLocaleString()} FCFA
        </p>
        <p className="font-medium mt-1">
          Total: {(Number(payload[0].value) + Number(payload[1].value)).toLocaleString()} FCFA
        </p>
      </div>
    );
  }

  return null;
};

export default RevenueChart;
