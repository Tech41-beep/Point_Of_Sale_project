import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import AdminLayout from "./src/layouts/AdminLayout";
import Dashboard from "./src/pages/dashboard";
import Customers from "./src/pages/customers/customer";
import CreateCustomer from "./src/pages/customers/CreateCustomer";
import SignIn from "./src/pages/auth/Signin";
import EditCustomer from "./src/pages/customers/EditCustomer";
import Suppliers from "./src/pages/suppliers/Supplier";
import CreateSupplier from "./src/pages/suppliers/CreateSupplier";
import EditSupplier from "./src/pages/suppliers/EditSupplier";
import Category from "./src/pages/category/Category";
import CreateCategory from "./src/pages/category/createCategory";
import EditCategory from "./src/pages/category/EditCategory";
import Products from "./src/pages/Products/Product";
import EditProduct from "./src/pages/Products/EditProduct";
import CreateProduct from "./src/pages/Products/CreateProduct";
import Protect from "./src/components/Protect";
import AuthRedirect from "./src/components/AuthRedirect";
import Purchase from "./src/pages/Purchase/Purchase";
import CreatePurchase from "./src/pages/Purchase/CreatePurchase";
import EditPurchase from "./src/pages/Purchase/EditPurchase";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Sale from "./src/pages/Sale/ListSale";
import Invoice from "./src/pages/Sale/Invoice";
import POS from "./src/pages/Sale/POS";
import User from "./src/pages/User/user.jsx";
import CreateUser from "./src/pages/User/CreateUser.jsx";
import EditUser from "./src/pages/User/EditUser.jsx";
import SaleReport from "./src/pages/Reports/SaleReport.jsx";
import StockReport from "./src/pages/Reports/StockReport.jsx";
import Setting from "./src/components/setting.jsx";
const Placeholder = () => (
  <div className="panel placeholder">
    <h2>Coming soon</h2>
    <p>This section is ready for your content.</p>
  </div>
);

//ProtectedLayout component to handle authentication and redirection
const ProtectedLayout = () => {
  const location = useLocation();
  const token =
    localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
  const storedUser =
    localStorage.getItem("currentUser") ||
    sessionStorage.getItem("currentUser");
  let user = null;

  try {
    user = storedUser ? JSON.parse(storedUser) : null;
  } catch {
    localStorage.removeItem("currentUser");
    sessionStorage.removeItem("currentUser");
  }

  return token && user ? (
    <AdminLayout />
  ) : (
    <Navigate to="/signin" replace state={{ from: location.pathname }} />
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/signin"
          element={
            <AuthRedirect>
              <Signin />
            </AuthRedirect>
          }
        />

        <Route element={<ProtectedLayout />}>
          <Route index element={<Dashboard />} />

          <Route element={<Protect allowedRoles={["super_admin", "admin"]} />}>
            <Route path="customers" element={<Customers />} />
            <Route path="customers/add" element={<CreateCustomer />} />
            <Route path="customers/edit/:id" element={<EditCustomer />} />

            <Route path="suppliers" element={<Suppliers />} />
            <Route path="suppliers/add" element={<CreateSupplier />} />
            <Route path="suppliers/edit/:id" element={<EditSupplier />} />

            <Route path="categories" element={<Category />} />
            <Route path="categories/add" element={<CreateCategory />} />
            <Route path="categories/edit/:id" element={<EditCategory />} />

            <Route path="products" element={<Products />} />
            <Route path="products/add" element={<CreateProduct />} />
            <Route path="products/edit/:id" element={<EditProduct />} />

            <Route path="purchases" element={<Purchase />} />
            <Route path="purchases/add" element={<CreatePurchase />} />
            <Route path="purchases/edit/:id" element={<EditPurchase />} />

            <Route path="sales" element={<Sale />} />
            <Route path="reports/sales" element={<SaleReport />} />
            <Route path="reports/stock" element={<StockReport />} />
          </Route>

          <Route element={<Protect allowedRoles={["super_admin", "admin", "cashier"]} />}>
            <Route path="sales/pos" element={<POS />} />
            <Route path="sales/history" element={<Sale />} />
            <Route path="invoice" element={<Invoice />} />
          </Route>

          <Route element={<Protect allowedRoles={["super_admin"]} />}>
            <Route path="users" element={<User />} />
            <Route path="users/add" element={<CreateUser />} />
            <Route path="users/edit/:id" element={<EditUser />} />
          </Route>

          <Route path="settings" element={<Setting />} />

          <Route path="*" element={<Placeholder />} />
        </Route>
      </Routes>
      <ToastContainer position="top-center" autoClose={4500} />
    </BrowserRouter>
  );
}
