import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { locationsApi } from "../../../api/locations";
import { assetsApi } from "../../../api/assets";
import { ROUTES } from "../../../constants/routes";
import { LoadingSpinner } from "../../../components/ui/LoadingSpinner";
import LocationDetailsPageUI from "../../../components/location/LocationDetailsPage";

export default function LocationDetailsPageContainer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [location, setLocation] = useState<any>(null);
  const [assets, setAssets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = useCallback(async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const [locRes, assetsRes] = await Promise.all([
        locationsApi.getOne(Number(id)),
        assetsApi.list({ location_id: id })
      ]);
      setLocation(locRes.data);
      setAssets(assetsRes.data);
    } catch (err: any) {
      console.error("Error fetching location data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isLoading && !location) return <LoadingSpinner />;

  return (
    <LocationDetailsPageUI
      location={location}
      assets={assets}
      isLoading={isLoading}
      onNavigateBack={() => navigate(ROUTES.LOCATION)}
      onAssetClick={(assetId: number) => navigate(ROUTES.ASSET_DETAILS(assetId))}
    />
  );
}
