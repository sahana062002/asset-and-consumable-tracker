import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { locationsApi } from "../../../api/locations";
import { ROUTES } from "../../../constants/routes";
import { useToast } from "../../../hooks/useToast";
import LocationsPageUI from "../../../components/location/LocationsPage";

const LEVELS = ["campus", "building", "floor", "room", "shelf"] as const;

const locationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  level: z.enum(LEVELS),
  parentId: z.string().optional().nullable(),
});

export default function LocationsPageContainer() {
  const navigate = useNavigate();
  const [view, setView] = useState<"tree" | "flat">("tree");
  const [treeData, setTreeData] = useState<any[]>([]);
  const [flatData, setFlatData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<any>(null);
  const [isAddingChild, setIsAddingChild] = useState(false);

  const { success, error } = useToast();

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [treeRes, flatRes] = await Promise.all([
        locationsApi.getTree(),
        locationsApi.getFlat()
      ]);
      setTreeData(treeRes.data);
      setFlatData(flatRes.data);
    } catch (err: any) {
      console.error("Error fetching locations:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(locationSchema),
    defaultValues: { name: "", level: "campus", parentId: "" },
  });

  const selectedLevel = watch("level");

  const validParents = flatData?.filter((l: any) => {
    const targetIdx = LEVELS.indexOf(selectedLevel as any);
    const parentIdx = LEVELS.indexOf(l.level);
    return parentIdx < targetIdx;
  });

  const onSubmit = async (data: any) => {
    try {
      if (editingLocation) {
        await locationsApi.update(editingLocation.id, {
          ...data,
          parentId: (data.parentId && data.parentId !== "") ? Number(data.parentId) : null,
        });
        success("Location updated successfully");
      } else {
        await locationsApi.create({
          ...data,
          parentId: (data.parentId && data.parentId !== "") ? Number(data.parentId) : null,
        });
        success("Location added successfully");
      }
      fetchData();
      closeDialog();
    } catch (err: any) {
      error(editingLocation ? "Failed to update" : "Failed to create", err.response?.data?.message);
    }
  };

  const onDelete = async (id: number) => {
    try {
      await locationsApi.remove(id);
      success("Location deleted successfully");
      fetchData();
    } catch (err: any) {
      error("Delete failed", err.response?.data?.message);
    }
  };

  const openAddChild = (parentNode: any) => {
    setEditingLocation(null);
    setIsAddingChild(true);
    const parentIdx = LEVELS.indexOf(parentNode.level);
    const childLevel = LEVELS[parentIdx + 1];
    reset({ name: "", level: childLevel, parentId: String(parentNode.id) });
    setDialogOpen(true);
  };

  const openEdit = (node: any) => {
    setEditingLocation(node);
    setIsAddingChild(false);
    reset({
      name: node.name,
      level: node.level,
      parentId: node.parentId ? String(node.parentId) : "",
    });
    setDialogOpen(true);
  };

  const openCreate = () => {
    setEditingLocation(null);
    setIsAddingChild(false);
    reset({ name: "", level: "campus", parentId: "" });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingLocation(null);
  };

  return (
    <LocationsPageUI
      view={view}
      setView={setView}
      treeData={treeData}
      flatData={flatData}
      isLoading={isLoading}
      dialogOpen={dialogOpen}
      editingLocation={editingLocation}
      closeDialog={closeDialog}
      openCreate={openCreate}
      openEdit={openEdit}
      openAddChild={openAddChild}
      onDelete={onDelete}
      register={register}
      handleSubmit={handleSubmit}
      onSubmit={onSubmit}
      errors={errors}
      control={control}
      isSubmitting={isSubmitting}
      selectedLevel={selectedLevel}
      validParents={validParents}
      isAddingChild={isAddingChild}
      onView={(id: number) => navigate(ROUTES.LOCATION_DETAILS(id))}
    />
  );
}
