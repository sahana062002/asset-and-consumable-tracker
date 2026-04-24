import { DataTable } from "../ui/DataTable";
import { EmptyState } from "../ui/EmptyState";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  MapPin,
  Building2,
  Layers,
  AlignJustify,
  Box,
  Package,
} from "lucide-react";

interface LocationDetailsPageUIProps {
  location: any;
  assets: any[];
  isLoading: boolean;
  onNavigateBack: () => void;
  onAssetClick: (id: number) => void;
}

const LEVEL_CONFIG = {
  campus: { icon: MapPin, color: "text-stone-500", bg: "bg-stone-500/10" },
  building: {
    icon: Building2,
    color: "text-indigo-500",
    bg: "bg-indigo-500/10",
  },
  floor: { icon: Layers, color: "text-blue-500", bg: "bg-blue-500/10" },
  room: {
    icon: AlignJustify,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  shelf: { icon: Box, color: "text-orange-500", bg: "bg-orange-500/10" },
};

export default function LocationDetailsPageUI({
  location,
  assets,
  isLoading,
  onNavigateBack,
  onAssetClick,
}: LocationDetailsPageUIProps) {
  const config =
    LEVEL_CONFIG[location?.level as keyof typeof LEVEL_CONFIG] ||
    LEVEL_CONFIG.shelf;
  const Icon = config.icon;

  const columns = [
    {
      header: "Asset Code",
      accessor: (row: any) => (
        <span className="font-mono font-bold text-xs">{row.assetCode}</span>
      ),
    },
    { header: "Name", accessor: "name" as keyof any },
    {
      header: "Type",
      accessor: (row: any) => (
        <Badge
          variant="outline"
          className={
            row.type === "consumable"
              ? "text-orange-600 border-orange-200 bg-orange-50"
              : "text-blue-600 border-blue-200 bg-blue-50"
          }
        >
          {row.type}
        </Badge>
      ),
    },
    {
      header: "Status",
      accessor: (row: any) => (
        <Badge
          className={
            row.status === "active" ? "bg-emerald-500" : "bg-destructive"
          }
        >
          {row.status}
        </Badge>
      ),
    },
    {
      header: "Actions",
      accessor: (row: any) => (
        <Button variant="ghost" size="sm" onClick={() => onAssetClick(row.id)}>
          View
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onNavigateBack}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={16} className="mr-2" /> Back
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
            <div className="p-6 border-b bg-muted/20 flex flex-col items-center text-center">
              <div className={`p-4 rounded-full ${config.bg} mb-4`}>
                <Icon size={32} className={config.color} />
              </div>
              <h2 className="text-2xl font-bold">{location?.name}</h2>
              <Badge
                variant="secondary"
                className="mt-2 uppercase tracking-widest"
              >
                {location?.level}
              </Badge>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Full Path
                </Label>
                <p className="text-sm font-medium mt-1 p-2 bg-muted/50 rounded border">
                  {location?.path}
                </p>
              </div>
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-sm text-muted-foreground">
                  Assets Hosted
                </span>
                <span className="font-bold">{assets?.length || 0}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-muted/10 flex items-center justify-between">
              <h3 className="font-bold flex items-center">
                <Package size={18} className="mr-2 text-primary" /> Nested
                Assets
              </h3>
              <Badge variant="outline">{assets?.length || 0} Nodes</Badge>
            </div>
            <div className="p-4">
              {assets?.length > 0 ? (
                <DataTable
                  data={assets || []}
                  columns={columns}
                  isLoading={isLoading}
                />
              ) : (
                <EmptyState
                  icon={<Package size={24} />}
                  title="No Assets Found"
                  description="This physical location is currently empty. Assets might be in transit or assigned elsewhere."
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
