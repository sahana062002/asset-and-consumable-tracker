import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usersApi } from "../../../api/users";
import { ROUTES } from "../../../constants/routes";
import { LoadingSpinner } from "../../../components/ui/LoadingSpinner";
import UserDetailsPageUI from "../../../components/user/UserDetailsPage";

export default function UserDetailsPageContainer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchUser = useCallback(async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const response = await usersApi.getOne(id);
      setUserData(response.data);
    } catch (err: any) {
      console.error("Error fetching user:", err);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  if (isLoading && !userData) return <LoadingSpinner />;

  return (
    <UserDetailsPageUI
      userData={userData}
      isLoading={isLoading}
      onNavigateBack={() => navigate(ROUTES.USERS)}
    />
  );
}
