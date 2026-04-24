import { Outlet } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { Package, LogOut, ScanLine, KeyRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ChangePasswordDialog } from "@/components/auth/ChangePasswordDialog";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

export default function UserLayout() {
  const { user, logout } = useAuthStore();

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col">
      <header className="h-16 border-b bg-card flex items-center justify-between px-4 sm:px-6 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center">
          <Package className="w-6 h-6 text-primary mr-2" />
          <span className="font-bold text-lg md:text-xl text-foreground">
            Mobile Scanner
          </span>
        </div>
        <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-4">
          <div className="hidden sm:block text-right mr-2">
            <p className="text-sm font-medium">{user?.name}</p>
            <p className="text-xs text-muted-foreground capitalize">
              {user?.role}
            </p>
          </div>
          <ChangePasswordDialog
            trigger={
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
              >
                <KeyRound size={18} className="md:mr-2" />
                <span className="hidden md:inline">Password</span>
              </Button>
            }
          />
          <ConfirmDialog
            title=" Logout?"
            description="Exit the scanner workspace? Unsaved scan data might be lost."
            onConfirm={() => logout()}
            confirmText="Exit"
            variant="destructive"
            trigger={
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut size={18} className="md:mr-2" />
                <span className="hidden md:inline">Sign Out</span>
              </Button>
            }
          />
        </div>
      </header>

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20 sm:hidden w-[90%] max-w-[320px]">
        <Button
          size="lg"
          className="w-full rounded-2xl shadow-xl px-6 py-6 h-auto text-md flex items-center justify-center space-x-3"
        >
          <ScanLine size={24} />
          <span className="font-semibold text-lg hover:scale-105 transition-transform">
            Tap to Scan QR Code
          </span>
        </Button>
      </div>

      <main className="flex-1 w-full max-w-lg mx-auto p-4 sm:p-6 pb-32">
        <Outlet />
      </main>
    </div>
  );
}
