
import { useState, ReactNode, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Users, BarChart3, CreditCard, FileText, 
  Settings, Bell, Home, Menu, X, LogOut 
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const isMobile = useIsMobile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    setIsSidebarOpen(!isMobile);
  }, [isMobile]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Overlay mobile */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-10"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`bg-primary text-white w-64 fixed h-full transition-all duration-300 ease-in-out z-20 ${
          isSidebarOpen ? "left-0" : "-left-64"
        }`}
      >
        <div className="p-4 flex justify-between items-center border-b border-primary-dark">
          <Link to="/admin" className="text-xl font-bold">DSF<span className="text-accent">acile</span> Admin</Link>
          <button onClick={toggleSidebar} aria-label="Fermer le menu">
            <X size={24} />
          </button>
        </div>
        
        <nav className="mt-6">
          <ul className="space-y-2 px-4">
            <li>
              <Link to="/admin" className="flex items-center gap-3 py-2 px-4 rounded-md bg-primary-dark hover:bg-primary-darker transition-colors">
                <BarChart3 size={20} />
                <span>Tableau de bord</span>
              </Link>
            </li>
            <li>
              <Link to="/admin/users" className="flex items-center gap-3 py-2 px-4 rounded-md hover:bg-primary-dark transition-colors">
                <Users size={20} />
                <span>Utilisateurs</span>
              </Link>
            </li>
            <li>
              <Link to="/admin/subscriptions" className="flex items-center gap-3 py-2 px-4 rounded-md hover:bg-primary-dark transition-colors">
                <CreditCard size={20} />
                <span>Abonnements</span>
              </Link>
            </li>
            <li>
              <Link to="/admin/rules" className="flex items-center gap-3 py-2 px-4 rounded-md hover:bg-primary-dark transition-colors">
                <FileText size={20} />
                <span>Règles fiscales</span>
              </Link>
            </li>
            <li>
              <Link to="/admin/monitoring" className="flex items-center gap-3 py-2 px-4 rounded-md hover:bg-primary-dark transition-colors">
                <Settings size={20} />
                <span>Monitoring</span>
              </Link>
            </li>
          </ul>
        </nav>
        
        <div className="absolute bottom-0 w-full p-4 border-t border-primary-dark">
          <Link to="/" className="flex items-center gap-3 py-2 px-4 rounded-md hover:bg-primary-dark transition-colors">
            <Home size={20} />
            <span>Retour au site</span>
          </Link>
          <Link to="/logout" className="flex items-center gap-3 py-2 px-4 rounded-md hover:bg-primary-dark transition-colors">
            <LogOut size={20} />
            <span>Déconnexion</span>
          </Link>
        </div>
      </aside>
      
      {/* Main content */}
      <div className={`flex-1 transition-all duration-300 min-w-0 ${
        isSidebarOpen && !isMobile ? "ml-64" : "ml-0"
      }`}>
        {/* Header */}
        <header className="bg-white shadow-sm py-4 px-4 sm:px-6 flex justify-between items-center">
          <button onClick={toggleSidebar} aria-label="Ouvrir le menu">
            <Menu size={24} />
          </button>
          
          <div className="flex items-center space-x-4">
            <button className="relative">
              <Bell size={24} />
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">3</span>
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
                A
              </div>
              <span className="hidden md:block">Admin</span>
            </div>
          </div>
        </header>
        
        {/* Content */}
        <main>
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
