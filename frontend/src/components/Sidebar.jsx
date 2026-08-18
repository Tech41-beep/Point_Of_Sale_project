import { NavLink } from "react-router-dom";

const navItems = [
  ["/", "grid", "Dashboard"],
  ["/sales", "bag", "Sales"],
  ["/products", "box", "Products"],
  ["/inventory", "layers", "Inventory"],
  ["/customers", "users", "Customers"],
  ["/suppliers", "truck", "Suppliers"],
  ["/reports", "chart", "Reports"],
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
};

const Icon = ({ name }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    {paths[name]}
  </svg>
);

export default function Sidebar({ open, onClose }) {
  const closeOnMobile = () => {
    if (window.matchMedia("(max-width: 760px)").matches) onClose();
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
          {navItems.map(([to, icon, label]) => (
            <NavLink key={to} to={to} end={to === "/"} onClick={closeOnMobile}>
              <Icon name={icon} />
              <span>{label}</span>
              {label === "Sales" && <em>12</em>}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar__bottom">
          <NavLink to="/settings">
            <Icon name="layers" />
            <span>Settings</span>
          </NavLink>
          <div className="help-card">
            <strong>Need help?</strong>
            <span>Check our documentation</span>
            <button>Go to help center</button>
          </div>
          <button className="logout">
            <span>↪</span> Log out
          </button>
        </div>
      </aside>
    </>
  );
}
