import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import AdminLayout from "./src/layouts/AdminLayout";
import Dashboard from "./src/pages/dashboard";
import Customers from "./src/pages/customers/customer";
import CreateCustomer from "./src/pages/customers/CreateCustomer";
import Signin from "./src/pages/auth/Signin";

const Placeholder = () => (
  <div className="panel placeholder">
    <h2>Coming soon</h2>
    <p>This section is ready for your content.</p>
  </div>
);

const ProtectedLayout = () => {
  const location = useLocation();
  const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
  return token ? <AdminLayout /> : <Navigate to="/signin" replace state={{ from: location.pathname }} />;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signin" element={<Signin />} />
        <Route element={<ProtectedLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="customers" element={<Customers />} />
          <Route path="customers/add" element={<CreateCustomer />} />
          <Route path="*" element={<Placeholder />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
