
import { useState } from "react";
import { AlertTriangle, Bell, CheckCircle, Clock, Info, X } from "lucide-react";

interface Alert {
  id: string;
  type: "info" | "warning" | "error" | "success";
  message: string;
  timestamp: string;
  isRead: boolean;
}

const AlertsList = () => {
  // Dans une application réelle, ces données viendraient d'une API
  const initialAlerts: Alert[] = [
    {
      id: "alert-1",
      type: "warning",
      message: "5 utilisateurs en attente d'approbation depuis plus de 48 heures",
      timestamp: "Il y a 2 heures",
      isRead: false
    },
    {
      id: "alert-2",
      type: "error",
      message: "Échec de la synchronisation des taux d'imposition - Vérifiez la connexion API",
      timestamp: "Il y a 5 heures",
      isRead: false
    },
    {
      id: "alert-3",
      type: "info",
      message: "Maintenance planifiée du système - Dimanche 28 avril 2025, 02:00-04:00",
      timestamp: "Il y a 1 jour",
      isRead: true
    },
    {
      id: "alert-4",
      type: "success",
      message: "Mise à jour des règles fiscales 2025 déployée avec succès",
      timestamp: "Il y a 2 jours",
      isRead: true
    },
    {
      id: "alert-5",
      type: "info",
      message: "Rappel: Formation des administrateurs prévue le 30 avril 2025",
      timestamp: "Il y a 3 jours",
      isRead: true
    }
  ];

  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts);
  const [filterType, setFilterType] = useState<string>("all");

  const getIconByType = (type: string) => {
    switch (type) {
      case "warning": return <AlertTriangle className="text-amber-500" size={20} />;
      case "error": return <X className="text-red-500" size={20} />;
      case "success": return <CheckCircle className="text-green-500" size={20} />;
      case "info": default: return <Info className="text-blue-500" size={20} />;
    }
  };

  const getBgColorByType = (type: string) => {
    switch (type) {
      case "warning": return "bg-amber-50";
      case "error": return "bg-red-50";
      case "success": return "bg-green-50";
      case "info": default: return "bg-blue-50";
    }
  };

  const markAsRead = (id: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, isRead: true } : alert
    ));
  };

  const deleteAlert = (id: string) => {
    setAlerts(alerts.filter(alert => alert.id !== id));
  };

  const markAllAsRead = () => {
    setAlerts(alerts.map(alert => ({ ...alert, isRead: true })));
  };

  const filteredAlerts = filterType === "all" 
    ? alerts 
    : alerts.filter(alert => alert.type === filterType);

  const unreadCount = alerts.filter(alert => !alert.isRead).length;

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="flex justify-between items-center p-4 border-b">
        <div className="flex items-center gap-2">
          <Bell size={18} />
          <h3 className="font-medium">Alertes et notifications</h3>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
              {unreadCount} non lues
            </span>
          )}
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={markAllAsRead}
            className="text-sm text-primary hover:underline"
          >
            Tout marquer comme lu
          </button>
          
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="text-sm border rounded px-2 py-1"
          >
            <option value="all">Tous</option>
            <option value="info">Info</option>
            <option value="warning">Avertissement</option>
            <option value="error">Erreur</option>
            <option value="success">Succès</option>
          </select>
        </div>
      </div>

      <div className="divide-y">
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map((alert) => (
            <div 
              key={alert.id} 
              className={`p-4 ${!alert.isRead ? getBgColorByType(alert.type) : ''} flex items-start gap-3`}
            >
              <div className="mt-1">
                {getIconByType(alert.type)}
              </div>
              <div className="flex-1">
                <div className="flex justify-between">
                  <p className={`${!alert.isRead ? 'font-medium' : ''}`}>{alert.message}</p>
                  <div className="flex gap-2 ml-4">
                    {!alert.isRead && (
                      <button 
                        onClick={() => markAsRead(alert.id)}
                        className="text-gray-500 hover:text-primary"
                        title="Marquer comme lu"
                      >
                        <CheckCircle size={16} />
                      </button>
                    )}
                    <button 
                      onClick={() => deleteAlert(alert.id)}
                      className="text-gray-500 hover:text-red-500"
                      title="Supprimer"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <Clock size={14} className="mr-1" />
                  {alert.timestamp}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-6 text-center text-gray-500">
            Aucune alerte correspondant aux critères
          </div>
        )}
      </div>
      
      {alerts.length > 5 && (
        <div className="p-3 text-center border-t">
          <button className="text-primary hover:underline text-sm">
            Voir toutes les alertes
          </button>
        </div>
      )}
    </div>
  );
};

export default AlertsList;
