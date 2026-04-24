import { createBrowserRouter, Navigate } from "react-router-dom";

// Layouts
import AdminLayout from "../layouts/AdminLayout";
import UserLayout from "../layouts/UserLayout";

// Pages
import LoginPage from "../pages/auth/login";
import DashboardPage from "../pages/admin/dashboard";
import AssetsPage from "../pages/admin/asset";
import AssetDetailPage from "../pages/admin/asset/[id]";
import LocationsPage from "../pages/admin/location";
import LocationDetailPage from "../pages/admin/location/[id]";
import UsersPage from "../pages/admin/users";
import UserDetailPage from "../pages/admin/users/[id]";
import ScanPage from "../pages/user/scan";
import AssetDetailUserPage from "../pages/user/asset/[id]";

import { AuthRoute, ProtectedRoute } from "./RouteWrappers";
import { ROUTES } from "../constants/routes";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <ProtectedRoute />,
    children: [
      {
        index: true,
        element: <Navigate to={ROUTES.DASHBOARD} replace />,
      },
      {
        // Admin Branch
        element: <ProtectedRoute allowedRoles={["admin"]} />,
        children: [
          {
            element: <AdminLayout />,
            children: [
              {
                path: ROUTES.DASHBOARD,
                element: <DashboardPage />,
              },
              {
                path: "asset",
                children: [
                  { index: true, element: <AssetsPage /> },
                  { path: ":id", element: <AssetDetailPage /> },
                ],
              },
              {
                path: "location",
                children: [
                  { index: true, element: <LocationsPage /> },
                  { path: ":id", element: <LocationDetailPage /> },
                ],
              },
              {
                path: "users",
                children: [
                  { index: true, element: <UsersPage /> },
                  { path: ":id", element: <UserDetailPage /> },
                ],
              },
              {
                path: ROUTES.ADMIN_SCAN.substring(1),
                children: [
                   { index: true, element: <ScanPage /> },
                   { path: "asset/:assetCode", element: <AssetDetailUserPage /> }
                ]
              }
            ],
          },
        ],
      },
      {
        // User/Common Branch (Scan Interface)
        path: ROUTES.SCAN,
        element: <ProtectedRoute allowedRoles={["user", "admin"]} />,
        children: [
          {
            element: <UserLayout />,
            children: [
              { index: true, element: <ScanPage /> },
              { path: "asset/:assetCode", element: <AssetDetailUserPage /> },
            ],
          },
        ],
      },
    ],
  },
  {
    path: ROUTES.LOGIN,
    element: <AuthRoute />,
    children: [
      {
        index: true,
        element: <LoginPage />,
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
