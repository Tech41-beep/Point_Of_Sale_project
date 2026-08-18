import { BrowserRouter, Route, Routes } from "react-router-dom";
import AdminLayout from "./src/layouts/AdminLayout";
import Dashboard from "./src/pages/dashboard";
import Customers from "./src/pages/customers/customer";
import CreateCustomer from "./src/pages/customers/CreateCustomer";
import SignIn from "./src/pages/Auth/SignIn";

const Placeholder = () => (
  <div className="panel placeholder">
    <h2>Coming soon</h2>
    <p>This section is ready for your content.</p>
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="signin" element={<SignIn />} />
        <Route element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="customers" element={<Customers />} />
          <Route path="customers/add" element={<CreateCustomer />} />
          <Route path="*" element={<Placeholder />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
