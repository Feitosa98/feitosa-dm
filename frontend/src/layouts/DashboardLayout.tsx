import React from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { Users, Server, HardDrive, Shield, LayoutDashboard, Settings, Menu, LogOut, Monitor, Globe, History, Save, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/authStore";
import { useTheme } from "@/components/ThemeProvider";
import { InactivityTimer } from "@/components/InactivityTimer";

export function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { theme, setTheme } = useTheme();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    { name: "Usuários", path: "/users", icon: Users },
    { name: "Grupos", path: "/groups", icon: Shield },
    { name: "Computadores", path: "/computers", icon: Monitor },
    { name: "OUs", path: "/ous", icon: Server },
    { name: "DNS", path: "/dns", icon: Globe },
    { name: "Compartilhamentos", path: "/shares", icon: HardDrive },
    { name: "Backup", path: "/backup", icon: Save },
    { name: "Auditoria", path: "/audit", icon: History },
    { name: "Configurações", path: "/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card flex flex-col transition-all duration-300">
        <div className="p-6 border-b flex items-center gap-3">
          <Server className="h-6 w-6 text-primary" />
          <h1 className="font-bold text-lg">Feitosa AD</h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={`w-full justify-start gap-3 ${isActive ? 'font-semibold' : ''}`}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Button>
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-xs font-semibold text-primary">{user?.name?.charAt(0) || "U"}</span>
              </div>
              <div>
                <p className="text-sm font-medium">{user?.name || "Usuário"}</p>
                <p className="text-xs text-muted-foreground">{user?.role === 'admin' ? 'Administrador' : 'Operador'}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout} title="Sair">
              <LogOut className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b bg-card flex items-center px-6 justify-between shrink-0">
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-4 ml-auto">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              title="Alternar Tema"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <span className="text-sm text-muted-foreground border-l pl-4">Samba AD DC 4.19</span>
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" title="Online" />
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6 flex-1 overflow-auto bg-muted/30">
          <InactivityTimer />
          <Outlet />
        </div>
      </main>
    </div>
  );
}
