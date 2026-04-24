import { useState } from "react";
import { PageHeader } from "../ui/PageHeader";
import { DataTable } from "../ui/DataTable";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { EmptyState } from "../ui/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Map,
  Building2,
  Layers,
  AlignJustify,
  Box,
  Edit,
  Trash2,
  Plus,
  ChevronRight,
  ChevronDown,
  Eye,
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

const LEVEL_CONFIG = {
  campus: { icon: Map, color: "text-stone-500", bg: "bg-stone-500/10" },
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

interface LocationsPageUIProps {
  view: "tree" | "flat";
  setView: (view: "tree" | "flat") => void;
  treeData: any;
  flatData: any;
  isLoading: boolean;
  dialogOpen: boolean;
  editingLocation: any;
  closeDialog: () => void;
  openCreate: () => void;
  openEdit: (node: any) => void;
  openAddChild: (parentNode: any) => void;
  onDelete: (id: number) => void;
  register: any;
  handleSubmit: any;
  onSubmit: (data: any) => void;
  errors: any;
  control: any;
  isSubmitting: boolean;
  selectedLevel: string;
  validParents: any[];
  isAddingChild: boolean;
  onView: (id: number) => void;
}

function LocationTreeNode({ node, onEdit, onDelete, onAddChild, onView }: any) {
  const [expanded, setExpanded] = useState(false);
  const config =
    LEVEL_CONFIG[node.level as keyof typeof LEVEL_CONFIG] || LEVEL_CONFIG.shelf;
  const Icon = config.icon;

  return (
    <div className="ml-4 mt-2">
      <div className="flex items-center p-2 rounded-md hover:bg-muted/60 group transition-colors border border-transparent">
        <button
          className="w-6 h-6 flex items-center justify-center mr-1 text-muted-foreground hover:text-foreground"
          onClick={() => setExpanded(!expanded)}
        >
          {node.children?.length > 0 ? (
            expanded ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronRight size={16} />
            )
          ) : (
            <span className="w-4 h-4" />
          )}
        </button>

        <div className={`p-1.5 rounded-md ${config.bg} mr-3`}>
          <Icon size={16} className={config.color} />
        </div>

        <span className="font-semibold mr-3">{node.name}</span>
        <Badge
          variant="secondary"
          className="text-[10px] uppercase tracking-wider mr-auto"
        >
          {node.level}
        </Badge>

        <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-1 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => onView(node.id)}
          >
            <Eye
              size={14}
              className="text-muted-foreground hover:text-foreground"
            />
          </Button>
          {node.level !== "shelf" && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs px-2"
              onClick={() => onAddChild(node)}
            >
              <Plus size={14} className="mr-1" /> Child
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => onEdit(node)}
          >
            <Edit
              size={14}
              className="text-muted-foreground hover:text-foreground"
            />
          </Button>
          <ConfirmDialog
            title="Delete Location"
            description={`Are you sure you want to delete ${node.name}? This action cannot be undone.`}
            onConfirm={() => onDelete(node.id)}
            variant="destructive"
            trigger={
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-destructive/10 text-destructive"
              >
                <Trash2 size={14} />
              </Button>
            }
          />
        </div>
      </div>

      {expanded && node.children?.length > 0 && (
        <div className="border-l-2 border-border ml-3 pl-2 mt-1">
          {node.children.map((child: any) => (
            <LocationTreeNode
              key={child.id}
              node={child}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddChild={onAddChild}
              onView={onView}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function LocationsPageUI({
  view,
  setView,
  treeData,
  flatData,
  isLoading,
  dialogOpen,
  editingLocation,
  closeDialog,
  openCreate,
  openEdit,
  openAddChild,
  onDelete,
  register,
  handleSubmit,
  onSubmit,
  errors,
  control,
  isSubmitting,
  selectedLevel,
  validParents,
  isAddingChild,
  onView,
}: LocationsPageUIProps) {
  const columns = [
    { header: "Full Path", accessor: "path" as keyof any },
    {
      header: "Level",
      accessor: (row: any) => (
        <Badge variant="outline" className="uppercase">
          {row.level}
        </Badge>
      ),
    },
    {
      header: "Actions",
      accessor: (row: any) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreVertical size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => onView(row.id)}>
              <Eye size={14} className="mr-2" /> View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openEdit(row)}>
              <Edit size={14} className="mr-2" /> Edit Location
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openAddChild(row)}>
              <Plus size={14} className="mr-2" /> Add Sub-area
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <ConfirmDialog
              title="Delete Location"
              description={`Are you sure you want to delete this location?`}
              onConfirm={() => onDelete(row.id)}
              variant="destructive"
              trigger={
                <DropdownMenuItem 
                  className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                  onSelect={(e) => e.preventDefault()}
                >
                  <Trash2 size={14} className="mr-2" /> Delete
                </DropdownMenuItem>
              }
            />
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Location Hierarchy"
        subtitle="Manage campuses, physical buildings, sub-floors, specific rooms, and individual storage shelves."
        action={
          <Button onClick={openCreate} className="shadow-md">
            <Plus size={16} className="mr-2" />
            Add Location
          </Button>
        }
      />

      <div className="mb-4 flex space-x-2 border-b border-border pb-px">
        <button
          onClick={() => setView("tree")}
          className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${view === "tree" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
        >
          Interactive Tree
        </button>
        <button
          onClick={() => setView("flat")}
          className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${view === "flat" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
        >
          Flat Browser
        </button>
      </div>

      <div className="bg-card rounded-lg border border-border mt-4">
        {isLoading && (view === "flat" || treeData?.length === 0) ? (
          <div className="p-12 flex justify-center items-center text-muted-foreground">
            Synchronizing Map Ecosystem...
          </div>
        ) : view === "tree" ? (
          <div className="p-4 md:p-6 min-h-[400px]">
            {treeData?.length === 0 ? (
              <EmptyState
                icon={<Map size={24} />}
                title="No Ecosystem"
                description="Start building your physical infrastructure map by creating a Master Campus."
                action={<Button onClick={openCreate}>Create Campus</Button>}
              />
            ) : (
              <div>
                {treeData?.map((node: any) => (
                  <LocationTreeNode
                    key={node.id}
                    node={node}
                    onEdit={openEdit}
                    onDelete={onDelete}
                    onAddChild={openAddChild}
                    onView={onView}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="p-4">
            <DataTable data={flatData || []} columns={columns} isLoading={isLoading} />
          </div>
        )}
      </div>

      {dialogOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={closeDialog}
        >
          <div
            className="bg-card w-full max-w-md rounded-xl shadow-xl border overflow-hidden zoom-in-95 animate-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">
                {editingLocation ? "Edit Location" : "Build New Location"}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Configure physical storage boundaries in real space.
              </p>
            </div>

            <div className="p-6">
              <form
                id="hook-form"
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    {...register("name")}
                    placeholder="e.g. Science Block C"
                    className={errors.name ? "border-destructive" : ""}
                  />
                  {errors.name && (
                    <p className="text-xs text-destructive">
                      {errors.name.message as string}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className={isAddingChild ? "opacity-50" : ""}>Security / Hierarchy Level</Label>
                  <Controller
                    name="level"
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isAddingChild}
                      >
                        <SelectTrigger className="h-10 w-full bg-background">
                          <SelectValue placeholder="Select Level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="campus">Campus 🏛️</SelectItem>
                          <SelectItem value="building">Building 🏢</SelectItem>
                          <SelectItem value="floor">Floor 🏗️</SelectItem>
                          <SelectItem value="room">Room 🚪</SelectItem>
                          <SelectItem value="shelf">Shelf 📦</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                {selectedLevel !== "campus" && (
                  <div className="space-y-2">
                    <Label className={isAddingChild ? "opacity-50" : ""}>Master Parent Map</Label>
                    <Controller
                      name="parentId"
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value?.toString()}
                          disabled={isAddingChild}
                        >
                          <SelectTrigger className="h-10 w-full bg-background">
                            <SelectValue placeholder="-- Select Parent Element --" />
                          </SelectTrigger>
                          <SelectContent className="max-w-[calc(100vw-2rem)] sm:max-w-[400px]">
                            {validParents?.map((p: any) => (
                              <SelectItem 
                                key={p.id} 
                                value={String(p.id)}
                                className="whitespace-normal break-all"
                              >
                                {p.path}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.parentId && (
                      <p className="text-xs text-destructive">
                        {errors.parentId.message as string}
                      </p>
                    )}
                  </div>
                )}
              </form>
            </div>

            <div className="p-6 bg-muted/30 border-t flex justify-end space-x-2">
              <Button variant="outline" onClick={closeDialog} type="button">
                Cancel
              </Button>
              <Button form="hook-form" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Confirm"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
