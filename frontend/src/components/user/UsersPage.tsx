import { PageHeader } from "../ui/PageHeader";
import { DataTable } from "../ui/DataTable";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  UserPlus,
  Shield,
  User as UserIcon,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  MoreVertical,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Controller } from "react-hook-form";

interface UsersPageUIProps {
  users: any[];
  isLoading: boolean;
  currentUser: any;
  dialogState: "create" | "edit" | null;
  activeUser: any;
  showPwd: boolean;
  setShowPwd: (show: boolean) => void;
  closeDialog: () => void;
  openCreate: () => void;
  openEdit: (u: any) => void;
  onDelete: (id: number) => void;

  // Create/Edit Form
  register: any;
  handleSubmit: any;
  onSubmit: (data: any) => void;
  errors: any;
  control: any;
  isSubmitting: boolean;
  onView: (id: number) => void;
}

export default function UsersPageUI({
  users,
  isLoading,
  currentUser,
  dialogState,
  activeUser,
  showPwd,
  setShowPwd,
  closeDialog,
  openCreate,
  openEdit,
  onDelete,
  register,
  handleSubmit,
  onSubmit,
  errors,
  control,
  isSubmitting,
  onView,
}: UsersPageUIProps) {
  const columns = [
    {
      header: "Identity",
      accessor: (row: any) => (
        <div className="flex flex-col">
          <span className="font-semibold">{row.name}</span>
          <span className="text-xs text-muted-foreground">{row.email}</span>
        </div>
      ),
    },
    {
      header: "Clearance Role",
      accessor: (row: any) => (
        <Badge
          variant={row.role === "admin" ? "default" : "secondary"}
          className={
            row.role === "admin"
              ? "bg-purple-600 hover:bg-purple-700 text-white"
              : "bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200"
          }
        >
          {row.role === "admin" ? (
            <Shield size={12} className="mr-1" />
          ) : (
            <UserIcon size={12} className="mr-1" />
          )}
          {row.role}
        </Badge>
      ),
    },
    {
      header: "Account Status",
      accessor: (row: any) => (
        <Badge
          variant="outline"
          className={
            row.isActive
              ? "text-emerald-600 border-emerald-600"
              : "text-red-500 border-red-500"
          }
        >
          {row.isActive ? "Active" : "Suspended"}
        </Badge>
      ),
    },
    {
      header: "Joined Timeline",
      accessor: (row: any) => (
        <span className="text-sm">
          {new Date(row.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: "Access Management",
      accessor: (row: any) => (
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onView(row.id)}
            title="View Profile"
          >
            <Eye
              size={16}
              className="text-muted-foreground hover:text-foreground"
            />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openEdit(row)}
            title="Edit Configuration"
          >
            <Edit
              size={16}
              className="text-muted-foreground hover:text-foreground"
            />
          </Button>
                <ConfirmDialog
                  title="Suspend User Privileges"
                  description={`Are you sure you want to lock ${row.name} out of their account?`}
                  onConfirm={() => onDelete(row.id)}
                  variant="destructive"
                  trigger={
              <Button
                variant="ghost"
                size="sm"
                disabled={row.id === currentUser?.id}
                title="Suspend User"
              >
                <Trash2
                  size={16}
                  className={
                    row.id === currentUser?.id
                      ? "opacity-30"
                      : "text-destructive"
                  }
                />
              </Button>
                  }
                />
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Fleet User Management"
        subtitle="Administer organizational employee authentications, security roles, and deep application access tiers."
        action={
          <Button
            onClick={openCreate}
            className="shadow-lg hover:shadow-xl transition-all"
          >
            <UserPlus size={18} className="mr-2" />
            Provision Account
          </Button>
        }
      />

      <DataTable data={users || []} columns={columns} isLoading={isLoading} />

      {dialogState && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-4"
          onClick={closeDialog}
        >
          <div
            className="bg-card w-full max-w-md rounded-2xl shadow-2xl border overflow-hidden zoom-in-95 animate-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b bg-muted/10">
              <h2 className="text-2xl font-bold tracking-tight">
                {dialogState === "create"
                  ? "Provision Identity"
                  : "Modify Clearance"}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Configure parameters safely.
              </p>
            </div>

            <div className="p-6">
              <form
                id="user-form"
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label>Legal Full Name</Label>
                  <Input {...register("name")} placeholder="John Doe" />
                  {errors.name && (
                    <p className="text-xs text-destructive">
                      {errors.name.message as string}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Corp Email Address</Label>
                  <Input
                    {...register("email")}
                    type="email"
                    placeholder="email@company.com"
                  />
                  {errors.email && (
                    <p className="text-xs text-destructive">
                      {errors.email.message as string}
                    </p>
                  )}
                </div>

                {dialogState === "create" && (
                  <div className="space-y-2 relative">
                    <Label>Initial Password Security</Label>
                    <div className="relative">
                      <Input
                        {...register("password")}
                        type={showPwd ? "text" : "password"}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPwd(!showPwd)}
                        className="absolute right-3 top-2 text-muted-foreground"
                      >
                        {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-xs text-destructive">
                        {errors.password.message as string}
                      </p>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <Label>System Role Configuration</Label>
                  <Controller
                    name="role"
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger className="h-10 w-full bg-background">
                          <SelectValue placeholder="Select Role" />
                        </SelectTrigger>
                        <SelectContent className="max-w-[calc(100vw-2rem)] sm:max-w-[400px]">
                          <SelectItem value="user">Floor Employee (User)</SelectItem>
                          <SelectItem value="admin">System Architect (Admin)</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                {dialogState === "edit" &&
                  activeUser?.id !== currentUser?.id && (
                    <div className="flex items-center space-x-2 pt-2 border-t mt-4 border-border">
                      <input
                        type="checkbox"
                        id="active"
                        {...register("isActive")}
                        className="w-4 h-4 rounded text-primary"
                        defaultChecked={activeUser?.isActive}
                      />
                      <Label
                        htmlFor="active"
                        className="font-semibold text-foreground cursor-pointer"
                      >
                        Account Operating Live
                      </Label>
                    </div>
                  )}
              </form>
            </div>

            <div className="p-6 bg-muted/40 border-t flex justify-end space-x-3 rounded-b-2xl">
              <Button variant="ghost" onClick={closeDialog} type="button">
                Escape
              </Button>
              <Button
                form="user-form"
                type="submit"
                disabled={isSubmitting}
                className="shadow-md font-semibold"
              >
                Integrate Node
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
