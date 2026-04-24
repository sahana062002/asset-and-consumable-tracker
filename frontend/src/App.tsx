import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { useAuthStore } from "./store/authStore";
import { LoadingSpinner } from "./components/ui/LoadingSpinner";
import { router } from "./routes";

export default function App() {
  const { initialize, isLoading } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return <RouterProvider router={router} />;
}
