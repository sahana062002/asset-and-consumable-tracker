import { Link, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { Package, LogOut, ScanLine, KeyRound, ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ChangePasswordDialog } from "@/components/auth/ChangePasswordDialog";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

export default function UserLayout() {
  const { user, logout } = useAuthStore();

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col">
      <header className="h-16 border-b bg-card flex items-center justify-between px-4 sm:px-6 sticky top-0 z-10 shadow-sm">
        <div className="flex-1 flex items-center">
          <Link to="/scan" className="group flex items-center">
            <img 
              src="/asset-tracker-logo.png" 
              className="h-9 w-9 group-hover:scale-110 transition-transform duration-300" 
              alt="logo" 
              onError={(e) => {
                e.currentTarget.src = "https://cdn-icons-png.flaticon.com/512/3081/3081840.png";
              }}
            />
            <span className="ml-2 font-bold text-sm hidden sm:inline-block tracking-tight">AssetTrack Scanner</span>
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2 h-10 px-2 hover:bg-muted group">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs uppercase">
                  {user?.name.charAt(0)}
                </div>
                <div className="hidden md:flex flex-col items-start text-left mr-1">
                  <span className="text-xs font-semibold leading-none">{user?.name}</span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">{user?.role}</span>
                </div>
                <ChevronDown size={14} className="text-muted-foreground group-hover:text-foreground transition-colors" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 mt-1">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.name}</p>
                  <p className="text-xs leading-none text-muted-foreground capitalize">
                    {user?.role} Account
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <ChangePasswordDialog 
                trigger={
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <KeyRound size={16} className="mr-2" /> Change Password
                  </DropdownMenuItem>
                }
              />
              <ConfirmDialog
                title="Sign Out?"
                description="Are you sure you want to end your scanning session?"
                onConfirm={() => logout()}
                confirmText="Sign Out"
                variant="destructive"
                trigger={
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                    <LogOut size={16} className="mr-2" /> Sign Out
                  </DropdownMenuItem>
                }
              />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      

      <main className="flex-1 w-full max-w-[1200px] mx-auto p-4 sm:p-6 pb-32 md:pb-8">
        <Outlet />
      </main>
    </div>
  );
}
