import { ReactNode, useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  Users,
  Folder,
  LogOut,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
} from "lucide-react";

interface AdminLayoutProps {
  children: ReactNode;
}

const navLinks = [
  { href: "/adminchapelero", label: "Usuários", icon: Users },
  { href: "/adminchapelero/projects", label: "Projetos", icon: Folder },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [pathname, setLocation] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (user && user.role !== "admin") {
      setLocation("/dashboard");
    } else if (!user) {
      setLocation("/auth");
    }
  }, [user, setLocation]);

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      setLocation("/auth");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const initials = user?.email?.charAt(0).toUpperCase() ?? "A";

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">

      {/* ── Desktop Sidebar ── */}
      <aside
        className={`hidden md:flex flex-col flex-shrink-0 bg-slate-950 text-slate-100 transition-all duration-300 ease-in-out ${
          collapsed ? "w-16" : "w-56"
        }`}
      >
        {/* Brand */}
        <div className={`flex items-center h-16 px-4 border-b border-slate-800 ${collapsed ? "justify-center" : "gap-3"}`}>
          {!collapsed && (
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center flex-shrink-0">
                <LayoutDashboard className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-sm text-white truncate">Admin Fottufy</span>
            </div>
          )}
          {collapsed && (
            <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center">
              <LayoutDashboard className="h-4 w-4 text-white" />
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <button
                key={link.href}
                onClick={() => setLocation(link.href)}
                title={collapsed ? link.label : undefined}
                className={`w-full flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-violet-600 text-white shadow-sm"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                } ${collapsed ? "justify-center" : "gap-3"}`}
              >
                <link.icon className="h-4 w-4 flex-shrink-0" />
                {!collapsed && <span className="truncate">{link.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* User + Logout */}
        <div className="px-2 pb-4 border-t border-slate-800 pt-4 space-y-1">
          {!collapsed && (
            <div className="flex items-center gap-2 px-3 py-2 mb-1">
              <div className="w-7 h-7 rounded-full bg-violet-700 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                {initials}
              </div>
              <p className="text-xs text-slate-400 truncate flex-1">{user?.email}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            title={collapsed ? "Sair" : undefined}
            className={`w-full flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-red-950 hover:text-red-400 transition-all duration-150 ${collapsed ? "justify-center" : "gap-3"}`}
          >
            <LogOut className="h-4 w-4 flex-shrink-0" />
            {!collapsed && <span>Sair</span>}
          </button>
        </div>

        {/* Collapse toggle */}
        <div className="border-t border-slate-800 p-2 flex justify-end">
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="p-1.5 rounded-md text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
            title={collapsed ? "Expandir menu" : "Recolher menu"}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>
      </aside>

      {/* ── Mobile Bottom Bar ── */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-slate-950 border-t border-slate-800 safe-area-bottom">
        <div className="flex items-center justify-around px-2 py-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <button
                key={`mob-${link.href}`}
                onClick={() => setLocation(link.href)}
                className={`flex flex-col items-center gap-0.5 px-4 py-2 rounded-lg transition-colors ${
                  isActive ? "text-violet-400" : "text-slate-500"
                }`}
              >
                <link.icon className="h-5 w-5" />
                <span className="text-[10px] font-medium">{link.label}</span>
              </button>
            );
          })}
          <button
            onClick={handleLogout}
            className="flex flex-col items-center gap-0.5 px-4 py-2 rounded-lg text-slate-500 hover:text-red-400 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span className="text-[10px] font-medium">Sair</span>
          </button>
        </div>
      </div>

      {/* ── Main Content ── */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
        {children}
      </main>
    </div>
  );
}
