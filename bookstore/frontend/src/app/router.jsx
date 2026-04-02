import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import ProtectedRoute from "../auth/ProtectedRoute";
import AdminRoute from "../auth/AdminRoute";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import BookDetailsPage from "../pages/BookDetailsPage";
import ReaderPage from "../pages/ReaderPage";
import SubscriptionPage from "../pages/SubscriptionPage";
import MyLibrary from "../pages/MyLibrary";
import AdminLayout from "../pages/admin/AdminLayout";
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import AdminBooksPage from "../pages/admin/AdminBooksPage";
import AdminOrdersPage from "../pages/admin/AdminOrdersPage";
import AdminUsersPage from "../pages/admin/AdminUsersPage";
import AdminPaymentsPage from "../pages/admin/AdminPaymentsPage";
import AdminRouteError from "../components/admin/AdminRouteError";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
      { path: "books/:bookId", element: <BookDetailsPage /> },
      {
        path: "library",
        element: (
          <ProtectedRoute>
            <MyLibrary />
          </ProtectedRoute>
        ),
      },
      {
        path: "reader/:bookId",
        element: (
          <ProtectedRoute>
            <ReaderPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "subscription",
        element: (
          <ProtectedRoute>
            <SubscriptionPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: "/admin",
    errorElement: <AdminRouteError />,
    element: (
      <AdminRoute>
        <AdminLayout />
      </AdminRoute>
    ),
    children: [
      { index: true, element: <AdminDashboardPage /> },
      { path: "books", element: <AdminBooksPage /> },
      { path: "orders", element: <AdminOrdersPage /> },
      { path: "users", element: <AdminUsersPage /> },
      { path: "payments", element: <AdminPaymentsPage /> },
    ],
  },
]);

export default router;
