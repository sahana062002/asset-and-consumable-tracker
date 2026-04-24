import { Outlet, NavLink } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import {
  Package,
  LayoutDashboard,
  MapPin,
  Users,
  LogOut,
  Menu,
  ScanLine,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ChangePasswordDialog } from "@/components/auth/ChangePasswordDialog";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

export default function AdminLayout() {
  const { user, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <LayoutDashboard size={20} />,
    },
    { name: "Assets", path: "/dashboard/assets", icon: <Package size={20} /> },
    {
      name: "Locations",
      path: "/dashboard/locations",
      icon: <MapPin size={20} />,
    },
    { name: "Users", path: "/dashboard/users", icon: <Users size={20} /> },
    {
      name: "Scan",
      path: "/dashboard/scan",
      icon: <ScanLine size={20} />,
    },
  ];

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col md:flex-row">
      <aside className="hidden md:flex flex-col w-64 border-r bg-card h-screen sticky top-0 shadow-sm">
        <div className="h-16 flex items-center px-6 border-b">
          <Package className="w-6 h-6 text-primary mr-2" />
          <span className="font-bold text-lg">AssetTrack Pro</span>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`
              }
              end={item.path === "/dashboard"}
            >
              {item.icon}
              <span className="ml-3">{item.name}</span>
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t">
          <div className="flex items-center mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold mr-3 uppercase">
              {user?.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate text-foreground">
                {user?.name}
              </p>
              <p className="text-xs text-muted-foreground truncate uppercase tracking-wider">
                {user?.role}
              </p>
            </div>
          </div>
          <ChangePasswordDialog />
          <ConfirmDialog
            title="Exit System Workspace?"
            description="Are you sure you want to end your active session?  "
            onConfirm={() => logout()}
            confirmText="Exit Workspace"
            variant="destructive"
            trigger={
              <Button
                variant="outline"
                className="w-full justify-start text-muted-foreground mt-2"
              >
                <LogOut size={18} className="mr-2" /> Logout
              </Button>
            }
          />
        </div>
      </aside>

      <div className="md:hidden h-16 border-b bg-card flex items-center justify-between px-4 sticky top-0 z-10 w-full shadow-sm">
        <div className="flex items-center">
          <Package className="w-6 h-6 text-primary mr-2" />
          <span className="font-bold text-lg">AssetTrack Pro</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <Menu size={24} />
        </Button>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-card border-b px-4 py-4 absolute top-16 w-full z-10 shadow-lg">
          <nav className="space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 text-sm font-medium rounded-md ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground"
                  }`
                }
                end={item.path === "/dashboard"}
              >
                {item.icon}
                <span className="ml-3">{item.name}</span>
              </NavLink>
            ))}
            <ChangePasswordDialog />
            <ConfirmDialog
              title="Exit System Workspace?"
              description="Are you sure you want to end your active session?"
              onConfirm={() => logout()}
              confirmText="Exit Workspace"
              variant="destructive"
              trigger={
                <Button
                  variant="ghost"
                  className="w-full justify-start mt-2 border border-border"
                >
                  <LogOut size={18} className="mr-2" /> Logout
                </Button>
              }
            />
          </nav>
        </div>
      )}

      <main className="flex-1 overflow-y-auto w-full">
        <div className="p-4 md:p-8 max-w-[1200px] mx-auto w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
