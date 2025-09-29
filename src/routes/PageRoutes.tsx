import  { type JSX } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/auth/Login";
import Dashboard from "../pages/Dashboard/dashboard";
import DashboardHome from "../pages/Dashboard/DashboardHome";
import { setAuthToken } from "../api/apiClient";
import AddMenuPage from "../pages/menu/AddMenuPage";
import ShowMenuPage from "../pages/menu/ShowMenuPage";
import AddSubMenuPage from "../pages/SubMenu/AddSubMenuPage";
import ShowSubMenuPage from "../pages/SubMenu/ShowSubMenuPage";
import AddCompanyPage from "../pages/Company/AddCompanyPage";
import ShowCompanyPage from "../pages/Company/ShowCompanyPage";
import AddRolePage from "../pages/Role/AddRolePage";
import ShowRolePage from "../pages/Role/ShowRolePage";
import AddDepartmentPage from "../pages/Department/AddDepartmentPage";
import ShowDepartmentPage from "../pages/Department/ShowDepartmentPage";
import AddUserPage from "../pages/User/AddUserPage";
import ShowUserPage from "../pages/User/ShowUserPage";
import AddCandidatePage from "../pages/Candidate/AddCandidatePage";
import ShowCandidatePage from "../pages/Candidate/ShowCandidatePage";
import AddTicketPage from "../pages/Ticket/AddTicketPage";
import ShowTicketPage from "../pages/Ticket/ShowTicketPage";

// ProtectedRoute wrapper
const ProtectedRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const token = sessionStorage.getItem("token");

  if (!token) {
    return <Navigate to="/" replace />;
  }

  // ✅ Always refresh OpenAPI token with Bearer prefix
  setAuthToken(token);

  return children;
};

const PageRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public route */}
      <Route path="/" element={<Login />} />

      {/* Protected dashboard routes */}
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      >
        {/* Default dashboard home */}
        <Route index element={<DashboardHome />} />
        
        {/* Menu routes */}
        <Route path="menu-list/add" element={<AddMenuPage />} />
        <Route path="menu-list/show" element={<ShowMenuPage />} />
        
        {/* Sub Menu routes (placeholder for now) */}
        <Route path="sub-menu-list/add" element={<AddSubMenuPage />} />
        <Route path="sub-menu-list/show" element={<ShowSubMenuPage />} />
        
        {/* User routes (placeholder for now) */}
        <Route path="user/add" element={<AddUserPage />} />
        <Route path="user/show" element={<ShowUserPage />} />
        
        {/* Company routes (placeholder for now) */}
        <Route path="company/add" element={<AddCompanyPage/>} />
        <Route path="company/show" element={<ShowCompanyPage /> } />
        
        {/* Role routes (placeholder for now) */}
        <Route path="role/add" element={<AddRolePage />} />
        <Route path="role/show" element={<ShowRolePage />} />
        
        {/* Department routes (placeholder for now) */}
        <Route path="department/add" element={<AddDepartmentPage />} />
        <Route path="department/show" element={<ShowDepartmentPage />} />

        {/* Candidate routes (placeholder for now) */}
        <Route path="candidate/add" element={<AddCandidatePage />} />
        <Route path="candidate/show" element={<ShowCandidatePage />} />

        {/* Ticket routes (placeholder for now) */}
        <Route path="ticket/add" element={<AddTicketPage />} />
        <Route path="ticket/show" element={<ShowTicketPage />} />

      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default PageRoutes;