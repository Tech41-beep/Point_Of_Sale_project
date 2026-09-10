import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import api from "../api";

import {
  FaShoppingCart,
  FaCashRegister,
  FaReceipt,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";


const cashierItems = [
  ["/", "grid", "Dashboard"],
  ["/sales/pos", "box", "POS"],
  ["/sales/history", "chart", "Sales History"],
    ["/orders", "receipt", "Customer Orders"],

  
];
const userItems = [

  ["/shop", "box", "Shop"],
  ["/shop/orders", "receipt", "View Orders"],
  ["/settings", "layers", "Profile"],
 
 

];
const navItems = [
    ["/", "grid", "Dashboard"],
    ["/customers", "users", "Customers"],
  ["/suppliers", "truck", "Suppliers"],
  ["/categories", "grid", "Categories"],


  ["/purchases", "bag", "Purchases"],
  ["/products", "box", "Products"],


   ["/users", "chart", "Users"],

];
const paths = {
  grid: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </>
  ),
  bag: (
    <>
      <path d="M6 8h12l1 13H5L6 8Z" />
      <path d="M9 9V6a3 3 0 0 1 6 0v3" />
    </>
  ),
  box: (
    <>
      <path d="m21 8-9 5-9-5 9-5 9 5Z" />
      <path d="m3 8 9 5 9-5v9l-9 5-9-5V8Z" />
    </>
  ),
  layers: (
    <>
      <path d="m12 2 9 5-9 5-9-5 9-5Z" />
      <path d="m3 12 9 5 9-5M3 17l9 5 9-5" />
    </>
  ),
  users: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
  truck: (
    <>
      <path d="M3 6h11v11H3zM14 10h4l3 3v4h-7z" />
      <circle cx="7" cy="19" r="2" />
      <circle cx="18" cy="19" r="2" />
    </>
  ),
  chart: (
    <>
      <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
    </>
  ),
  receipt: (
    <>
      <path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z" />
      <path d="M9 8h6M9 12h6" />
    </>
  ),
};
const Icon = ({ name }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    {paths[name]}
  </svg>
);




export default function Sidebar({ open, onClose, onOpenChatbot }) {
  const navigate = useNavigate();
  const [signingOut, setSigningOut] = useState(false);
  const [saleMenuOpen, setSaleMenuOpen] = useState(false);
  const [reportMenuOpen, setReportMenuOpen] = useState(false);
  const storedUser =
    localStorage.getItem("currentUser") ||
    sessionStorage.getItem("currentUser");
  let currentUser = null;

  try {
    currentUser = storedUser ? JSON.parse(storedUser) : null;
  } catch {
    currentUser = null;
  }

  const isCashier = currentUser?.role === "cashier";
  const isShopper = currentUser?.role === "user";
  const visibleItems = isShopper
    ? userItems
    : isCashier
      ? cashierItems
      : [...navItems, ["/orders", "receipt", "Customer Orders"]];

  const closeOnMobile = () => {
    if (window.matchMedia("(max-width: 760px)").matches) onClose();
  };
  const handleLogout = async () => {
    if (signingOut) return;
    setSigningOut(true);

    localStorage.removeItem("authToken");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("token");
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("currentUser");
    sessionStorage.removeItem("token");

    try {
      await api.post("/auth/logout");
    } catch {
      // The local session is already removed, even if the API is unavailable.
    } finally {
      navigate("/signin", { replace: true });
    }
  };

  return (
    <>
      <div
        className={`sidebar-overlay ${open ? "is-visible" : ""}`}
        onClick={onClose}
      />
      <aside className={`sidebar ${open ? "is-open" : "is-hidden"}`}>
        <div className="brand">
          <span className="brand__mark">P</span>
          <span className="brand__name">
            Pay<span>Point</span>
          </span>
        </div>
        <p className="nav-label">Workspace</p>

          <nav className="side-nav">
  {visibleItems.map(([to, icon, label]) => (
    <NavLink
      key={to}
      to={to}
      end={to === "/"}
      onClick={closeOnMobile}
    >
      <Icon name={icon} />
      <span>{label}</span>
    </NavLink>
  ))}

  {!isCashier && !isShopper && (
    <>
  <button
    type="button"
    className="sales-menu-button"
    onClick={() => setSaleMenuOpen((current) => !current)}
    aria-expanded={saleMenuOpen}
  >
    <FaShoppingCart />
    <span>Sales</span>

    {saleMenuOpen ? <FaChevronUp /> : <FaChevronDown />}
  </button>

  {saleMenuOpen && (
    <ul className="sales-submenu">
      <NavLink to="/sales" onClick={closeOnMobile}>
        <FaCashRegister />
        <span>List Sale</span>
      </NavLink>

      <NavLink to="/sales/history" onClick={closeOnMobile}>
        <FaReceipt />
        <span>Sales History</span>
      </NavLink>

        <NavLink to="/sales/pos" onClick={closeOnMobile}>
        <FaCashRegister />
        <span>POS Page</span>
      </NavLink>
    </ul>
  )}


 <button
    type="button"
    className="sales-menu-button"
    onClick={() => setReportMenuOpen((current) => !current)}
    aria-expanded={reportMenuOpen}
  >
    <FaShoppingCart />
    <span>Report</span>

    {reportMenuOpen ? <FaChevronUp /> : <FaChevronDown />}
  </button>

  {reportMenuOpen && (
    <ul className="sales-submenu">
      <NavLink to="/reports/sales" onClick={closeOnMobile}>
        <FaCashRegister />
        <span>Sale Report</span>
      </NavLink>

      <NavLink to="/reports/stock" onClick={closeOnMobile}>
        <FaReceipt />
        <span>Stock Report</span>
      </NavLink>
          </ul>
  )}
    </>
  )}
</nav>

        <div className="sidebar__bottom">
          {!isShopper && <NavLink to="/settings">
            <Icon name="layers" />
            <span>{isCashier ? "Profile" : "Settings"}</span>
          </NavLink>}
          <div className="help-card">
            <strong>Need help?</strong>
            <span>{isShopper ? "Ask about products or orders" : "Check our documentation"}</span>

           <button
             type="button"
             onClick={() => {
               closeOnMobile();
               onOpenChatbot();
             }}
           >
             Go to help center
           </button>
          </div>
          <button className="logout" onClick={handleLogout} disabled={signingOut}>
            <span>↪</span> {signingOut ? "Signing out…" : "Sign out"}
          </button>
        </div>
      </aside>
    </>
  );
}
