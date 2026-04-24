import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { assetsApi } from "../../../api/assets";
import { ROUTES } from "../../../constants/routes";
import { LoadingSpinner } from "../../../components/ui/LoadingSpinner";
import AssetDetailsPageUI from "../../../components/asset/AssetDetailsPage";

export default function AssetDetailsPageContainer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [asset, setAsset] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const fetchAsset = useCallback(async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      setIsError(false);
      const response = await assetsApi.getOne(id);
      setAsset(response.data);
    } catch (err: any) {
      console.error("Error fetching asset:", err);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAsset();
  }, [fetchAsset]);

  if (isLoading && !asset) return <LoadingSpinner />;

  return (
    <AssetDetailsPageUI
      asset={asset}
      isLoading={isLoading}
      isError={isError}
      onNavigateBack={() => navigate(ROUTES.ASSET)}
    />
  );
}
