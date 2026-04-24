import { useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PageHeader } from "../ui/PageHeader";
import { DataTable } from "../ui/DataTable";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { StatusBadge } from "../ui/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  PackageSearch,
  Download,
  Plus,
  Eye,
  Trash2,
  Printer,
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
import { barcodeUtils } from "../../lib/barcode";
import { ROUTES } from "../../constants/routes";

interface AssetsPageUIProps {
  // Data
  assets: any[];
  locations: any[];
  isLoading: boolean;

  // Filters
  search: string;
  setSearch: (val: string) => void;
  typeFilter: string;
  setTypeFilter: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;

  // Dialog state
  dialogOpen: boolean;
  successAsset: any;
  closeDialog: () => void;
  openCreate: () => void;

  // Form / Mutation
  register: any;
  handleSubmit: any;
  onSubmit: (data: any) => void;
  errors: any;
  control: any;
  isSubmitting: boolean;
  selectedType: string;

  // Actions
  onDelete: (id: number) => void;
  onView: (id: number) => void;
}

function SuccessDialog({ asset, onClose, onReset }: any) {
  const svgRef = useRef<SVGSVGElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (asset && svgRef.current) {
      barcodeUtils.renderToNode(svgRef.current, asset.assetCode);
    }
  }, [asset]);

  if (!asset) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-card w-full max-w-md rounded-2xl shadow-2xl border overflow-hidden zoom-in-95 animate-in">
        <div className="p-8 text-center border-b bg-muted/10">
          <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
            <PackageSearch className="text-emerald-600 w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Asset Initialized!
          </h2>
          <p className="text-muted-foreground mt-2">
            Physical code generated and safely loaded.
          </p>
        </div>

        <div className="p-8 flex flex-col items-center border-b">
          <svg ref={svgRef} className="w-full h-auto max-w-[280px]" />
          <p className="font-semibold text-lg mt-4">{asset.name}</p>
          <p className="text-muted-foreground font-mono bg-muted px-2 py-1 rounded text-sm mt-1">
            {asset.assetCode}
          </p>
        </div>

        <div className="p-4 bg-muted/30 grid gap-2 sm:grid-cols-2">
          <Button
            variant="outline"
            className="w-full flex items-center justify-center"
            onClick={() => barcodeUtils.print(asset.assetCode)}
          >
            <Printer size={16} className="mr-2" /> Print Map
          </Button>
          <Button
            variant="outline"
            className="w-full flex items-center justify-center"
            onClick={() =>
              barcodeUtils.downloadAsPNG(
                asset.assetCode,
                `barcode-${asset.assetCode}`,
              )
            }
          >
            <Download size={16} className="mr-2" /> Download
          </Button>
          <Button
            variant="secondary"
            className="w-full mt-2 sm:col-span-1"
            onClick={onReset}
          >
            Create Another
          </Button>
          <Button
            className="w-full mt-2 sm:col-span-1 border border-border"
            onClick={() => navigate(ROUTES.ASSET_DETAILS(asset.id))}
          >
            <Eye size={16} className="mr-2" /> Open Detail
          </Button>
          <div className="sm:col-span-2 pt-2">
            <Button
              variant="ghost"
              className="w-full text-muted-foreground hover:text-foreground"
              onClick={onClose}
            >
              Close Interface
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AssetsPageUI({
  assets,
  locations,
  isLoading,
  search,
  setSearch,
  typeFilter,
  setTypeFilter,
  statusFilter,
  setStatusFilter,
  dialogOpen,
  successAsset,
  closeDialog,
  openCreate,
  register,
  handleSubmit,
  onSubmit,
  errors,
  control,
  isSubmitting,
  selectedType,
  onDelete,
  onView,
}: AssetsPageUIProps) {
  const columns = [
    {
      header: "Barcode",
      accessor: (row: any) => (
        <span className="font-mono text-xs px-2 py-1 bg-muted rounded border border-border/50 shadow-sm">
          {row.assetCode}
        </span>
      ),
    },
    {
      header: "Asset Name",
      accessor: "name" as keyof any,
    },
    {
      header: "Type",
      accessor: (row: any) => <StatusBadge type={row.type} />,
    },
    {
      header: "Status",
      accessor: (row: any) => <StatusBadge status={row.status} />,
    },
    {
      header: "Location",
      accessor: (row: any) => (
        <span
          className="text-sm text-muted-foreground block truncate max-w-[200px]"
          title={row.locationPath}
        >
          {row.locationPath}
        </span>
      ),
    },
    {
      header: "Quantity",
      accessor: (row: any) => {
        if (row.type !== "consumable")
          return <span className="text-muted-foreground italic">—</span>;
        const pct = row.initialQuantity
          ? Math.max(
              0,
              Math.min(100, (row.quantity / row.initialQuantity) * 100),
            )
          : 0;
        return (
          <div className="flex items-center space-x-3 w-full max-w-[240px]">
            <span className="text-[11px] font-bold tabular-nums whitespace-nowrap min-w-[65px]">
              {row.quantity} / {row.initialQuantity}
            </span>
            <div className="h-2 flex-1 bg-secondary rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${pct < 20 ? "bg-destructive shadow-[0_0_8px_rgba(239,68,68,0.5)]" : pct < 50 ? "bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.3)]" : "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]"}`}
                style={{ width: `${pct}%` }}
              ></div>
            </div>
          </div>
        );
      },
    },
     {
      header: "Actions",
      accessor: (row: any) => (
        <div className="flex items-center space-x-1">
          <button
            onClick={() => onView(row.id)}
            className="p-2 cursor-pointer bg-transparent hover:bg-muted/50 rounded-md transition-colors text-primary border border-transparent hover:border-border"
          >
            <Eye size={16} />
          </button>
          {row.status === "active" && (
            <ConfirmDialog
              title="Dismantle Asset Entry?"
              description={`Are you declaring ${row.assetCode} fully offline? Data will securely detach.`}
              onConfirm={() => onDelete(row.id)}
              variant="destructive"
              trigger={
                <button className="p-2 cursor-pointer bg-transparent hover:bg-destructive/10 rounded-md transition-colors text-destructive border border-transparent hover:border-destructive/20 ml-1">
                  <Trash2 size={16} />
                </button>
              }
            />
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Assets Management"
        subtitle="Manage globally deployed infrastructure equipment dynamically using secure barcodes."
        action={
          <Button
            onClick={openCreate}
            className="shadow-lg h-10 hover:scale-105 transition-transform duration-200"
          >
            <Plus size={18} className="mr-2" /> Generate Asset
          </Button>
        }
      />

      <div className="bg-card rounded-lg border border-border p-4 mb-6 shadow-sm overflow-hidden mt-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">
              Search Asset
            </Label>
            <Input
              placeholder="Search identifiers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 focus-visible:ring-primary shadow-inner"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">
              Asset Type
            </Label>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="h-9 w-full bg-background">
                <SelectValue placeholder="Select Module" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="fixed">Fixed Assets</SelectItem>
                <SelectItem value="consumable">Consumables</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">
              Asset Status
            </Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9 w-full bg-background">
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="disposed">Disposed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <DataTable data={assets} columns={columns} isLoading={isLoading} />

      {dialogOpen && !successAsset && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in"
          onClick={closeDialog}
        >
          <div
            className="bg-card w-full max-w-md rounded-2xl shadow-xl border overflow-hidden zoom-in-95 animate-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b bg-muted/10">
              <h2 className="text-2xl font-bold tracking-tight">
                Add Details
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Bind a new physical component strictly to a local map.
              </p>
            </div>

            <div className="p-6">
              <form
                id="asset-form"
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-5"
              >
                <div className="space-y-2">
                  <Label>Reference Name</Label>
                  <Input
                    {...register("name")}
                    placeholder="e.g. Dell Monitor P2419H"
                    className={errors.name ? "border-destructive" : ""}
                  />
                  {errors.name && (
                    <p className="text-xs font-semibold text-destructive">
                      {errors.name.message as string}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Modality</Label>
                  <div className="flex space-x-4 pt-1">
                    <label className="flex items-center space-x-2 cursor-pointer font-medium text-sm border px-3 py-2 rounded-md hover:bg-muted/30 transition-colors">
                      <input
                        type="radio"
                        value="fixed"
                        {...register("type")}
                        className="text-primary w-4 h-4"
                      />
                      <span>Fixed Structure</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer font-medium text-sm border px-3 py-2 rounded-md hover:bg-muted/30 transition-colors">
                      <input
                        type="radio"
                        value="consumable"
                        {...register("type")}
                        className="text-primary w-4 h-4"
                      />
                      <span>Liquid / Pack</span>
                    </label>
                  </div>
                </div>

                {selectedType === "consumable" && (
                  <div className="space-y-2 animate-in slide-in-from-top-2">
                    <Label>Base Volume / Initial Quantity</Label>
                    <Input
                      type="number"
                      {...register("quantity")}
                      placeholder="0"
                      className={errors.quantity ? "border-destructive" : ""}
                    />
                    {errors.quantity && (
                      <p className="text-xs font-semibold text-destructive">
                        {errors.quantity.message as string}
                      </p>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <Controller
                    name="location_id"
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value?.toString()}
                      >
                        <SelectTrigger className="h-10 w-full bg-background">
                          <SelectValue placeholder="-- Interface Coordinates --" />
                        </SelectTrigger>
                        <SelectContent className="max-w-[calc(100vw-2rem)] sm:max-w-[400px]">
                          {locations?.map((loc: any) => (
                            <SelectItem 
                              key={loc.id} 
                              value={loc.id.toString()}
                              className="whitespace-normal break-all"
                            >
                              {loc.path}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.location_id && (
                    <p className="text-xs font-semibold text-destructive">
                      {errors.location_id.message as string}
                    </p>
                  )}
                </div>
              </form>
            </div>

            <div className="p-6 bg-muted/40 border-t flex justify-end space-x-3 rounded-b-2xl">
              <Button variant="ghost" onClick={closeDialog} type="button">
                Abort
              </Button>
              <Button
                form="asset-form"
                type="submit"
                disabled={isSubmitting}
                className="shadow"
              >
                {isSubmitting ? "Syncing Map..." : "Fabricate Mapping"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {successAsset && (
        <SuccessDialog
          asset={successAsset}
          onClose={closeDialog}
          onReset={openCreate}
        />
      )}
    </>
  );
}
