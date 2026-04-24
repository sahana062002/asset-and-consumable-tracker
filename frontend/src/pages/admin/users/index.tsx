import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { usersApi } from "../../../api/users";
import { ROUTES } from "../../../constants/routes";
import { useAuthStore } from "../../../store/authStore";
import { useToast } from "../../../hooks/useToast";
import { LoadingSpinner } from "../../../components/ui/LoadingSpinner";
import UsersPageUI from "../../../components/user/UsersPage";

const userSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Minimum 6 characters").optional(),
  role: z.enum(["admin", "user"]),
  isActive: z.boolean().optional(),
});

export default function UsersPageContainer() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const { success, error } = useToast();
  
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dialogState, setDialogState] = useState<"create" | "edit" | null>(null);
  const [activeUser, setActiveUser] = useState<any>(null);
  const [showPwd, setShowPwd] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await usersApi.list();
      setUsers(response.data);
    } catch (err: any) {
      console.error("Error fetching users:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "user",
      isActive: true,
    },
  });

  const onSubmit = async (data: any) => {
    try {
      if (dialogState === "edit") {
        const payload: any = {
          name: data.name,
          email: data.email,
          role: data.role,
          isActive: data.isActive,
        };
        await usersApi.update(activeUser.id, payload);
        success("Metadata updated.");
      } else {
        await usersApi.create(data);
        success("User provisioned effectively.");
      }
      fetchUsers();
      closeDialog();
    } catch (err: any) {
      error("Failed", err.response?.data?.message);
    }
  };

  const onDelete = async (id: number) => {
    try {
      await usersApi.remove(id);
      success("User suspended safely.");
      fetchUsers();
    } catch (err: any) {
      error("Failed", err.response?.data?.message);
    }
  };

  const openCreate = () => {
    setActiveUser(null);
    reset({ name: "", email: "", password: "", role: "user", isActive: true });
    setDialogState("create");
  };

  const openEdit = (u: any) => {
    setActiveUser(u);
    reset({
      name: u.name,
      email: u.email,
      role: u.role,
      isActive: u.isActive,
      password: "",
    });
    setDialogState("edit");
  };

  const closeDialog = () => {
    setDialogState(null);
    setTimeout(() => setActiveUser(null), 200);
  };

  if (isLoading && users.length === 0) return <LoadingSpinner />;

  return (
    <UsersPageUI
      users={users}
      isLoading={isLoading}
      currentUser={currentUser}
      dialogState={dialogState}
      activeUser={activeUser}
      showPwd={showPwd}
      setShowPwd={setShowPwd}
      closeDialog={closeDialog}
      openCreate={openCreate}
      openEdit={openEdit}
      onDelete={onDelete}
      register={register}
      handleSubmit={handleSubmit}
      onSubmit={onSubmit}
      errors={errors}
      control={control}
      isSubmitting={isSubmitting}
      onView={(id: number) => navigate(ROUTES.USER_DETAILS(id))}
    />
  );
}
