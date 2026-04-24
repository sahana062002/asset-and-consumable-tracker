import { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { assetsApi } from "../../../api/assets";
import { locationsApi } from "../../../api/locations";
import { LoadingSpinner } from "../../../components/ui/LoadingSpinner";
import DashboardPageUI from "../../../components/DashboardPage";

export default function DashboardPageContainer() {
  const navigate = useNavigate();
  const [selectedLocationIds, setSelectedLocationIds] = useState<number[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [locationTree, setLocationTree] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [assetsRes, treeRes] = await Promise.all([
        assetsApi.list(),
        locationsApi.getTree()
      ]);
      setAssets(assetsRes.data);
      setLocationTree(treeRes.data);
    } catch (err: any) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleSelectLocations = (ids: number[]) => {
    setSelectedLocationIds((prev) => Array.from(new Set([...prev, ...ids])));
  };

  const handleDeselectLocations = (idsToRemove: number[]) => {
    setSelectedLocationIds((prev) =>
      prev.filter((id) => !idsToRemove.includes(id)),
    );
  };

  const handleClearSelection = () => setSelectedLocationIds([]);

  // KPIs
  const stats = useMemo(
    () => ({
      totalAssets: assets.length,
      activeFixed: assets.filter(
        (a: any) => a.type === "fixed" && a.status === "active",
      ).length,
      activeConsumable: assets.filter(
        (a: any) => a.type === "consumable" && a.status === "active",
      ).length,
      disposedAssets: assets.filter((a: any) => a.status === "disposed").length,
    }),
    [assets],
  );

  // Rendered Matrix filter
  const visibleAssets = useMemo(() => {
    if (selectedLocationIds.length === 0) return assets;
    return assets.filter((a: any) =>
      selectedLocationIds.includes(a.locationId),
    );
  }, [assets, selectedLocationIds]);

  if (isLoading && assets.length === 0) return <LoadingSpinner />;

  return (
    <DashboardPageUI
      assets={assets}
      locationTree={locationTree}
      selectedLocationIds={selectedLocationIds}
      visibleAssets={visibleAssets}
      onNavigate={navigate}
      onSelectLocations={handleSelectLocations}
      onDeselectLocations={handleDeselectLocations}
      onClearSelection={handleClearSelection}
      stats={stats}
    />
  );
}
