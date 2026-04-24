import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { assetsApi } from "../../../api/assets";
import { ROUTES } from "../../../constants/routes";
import { locationsApi } from "../../../api/locations";
import { useToast } from "../../../hooks/useToast";
import AssetsPageUI from "../../../components/asset/AssetsPage";

const assetSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    type: z.enum(["fixed", "consumable"]),
    location_id: z.string().min(1, "Location required"),
    quantity: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.type === "consumable" &&
      (!data.quantity || Number(data.quantity) <= 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Positive quantity is required for consumables",
        path: ["quantity"],
      });
    }
  });

export default function AssetsPageContainer() {
  const navigate = useNavigate();
  const [assets, setAssets] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [successAsset, setSuccessAsset] = useState<any>(null);

  const { success, error } = useToast();

  const fetchAssets = useCallback(async () => {
    try {
      setIsLoading(true);
      const params: any = {};
      if (search) params.search = search;
      if (typeFilter !== "all") params.type = typeFilter;
      if (statusFilter !== "all") params.status = statusFilter;
      
      const response = await assetsApi.list(params);
      setAssets(response.data);
    } catch (err: any) {
      console.error("Error fetching assets:", err);
    } finally {
      setIsLoading(false);
    }
  }, [search, typeFilter, statusFilter]);

  const fetchLocations = useCallback(async () => {
    try {
      const response = await locationsApi.getFlat();
      setLocations(response.data);
    } catch (err: any) {
      console.error("Error fetching locations:", err);
    }
  }, []);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(assetSchema),
    defaultValues: { name: "", type: "fixed", location_id: "", quantity: "" },
  });

  const selectedType = watch("type");

  const onSubmit = async (data: any) => {
    try {
      const response = await assetsApi.create({
        ...data,
        location_id: Number(data.location_id),
        quantity: data.quantity ? Number(data.quantity) : undefined,
      });
      success(
        "Asset generated dynamically",
        "Physical tags actively synchronized.",
      );
      setSuccessAsset(response.data);
      fetchAssets();
    } catch (err: any) {
      error("Failed Initialization", err.response?.data?.message);
    }
  };

  const onDelete = async (id: number) => {
    try {
      await assetsApi.delete(id);
      success("Asset safely demolished.", "All data references severed.");
      fetchAssets();
    } catch (err: any) {
      error("Failed Configuration", err.response?.data?.message);
    }
  };

  const openCreate = () => {
    reset({ name: "", type: "fixed", location_id: "", quantity: "" });
    setSuccessAsset(null);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
  };

  return (
    <AssetsPageUI
      assets={assets}
      locations={locations}
      isLoading={isLoading}
      search={search}
      setSearch={setSearch}
      typeFilter={typeFilter}
      setTypeFilter={setTypeFilter}
      statusFilter={statusFilter}
      setStatusFilter={setStatusFilter}
      dialogOpen={dialogOpen}
      successAsset={successAsset}
      closeDialog={closeDialog}
      openCreate={openCreate}
      register={register}
      handleSubmit={handleSubmit}
      onSubmit={onSubmit}
      errors={errors}
      control={control}
      isSubmitting={isSubmitting}
      selectedType={selectedType}
      onDelete={onDelete}
      onView={(id: number) => navigate(ROUTES.ASSET_DETAILS(id))}
    />
  );
}
