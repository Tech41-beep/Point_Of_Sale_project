import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../api";
import { useCurrentUser } from "../auth/hooks/use.current";

const defaults = {
  storeName: "",
  currency: "USD",
  taxRate: 10,
  defaultPaymentMethod: "cash",
  allowDiscount: true,
  maxDiscount: 20,
  allowNegativeStock: false,
  lowStockThreshold: 10,
  autoPrintReceipt: true,
  receiptFooter: "",
};

const tabs = [
  { id: "profile", name: "Profile", icon: "ME" },
  { id: "store", name: "Store", icon: "ST" },
  { id: "pos", name: "POS", icon: "PO" },
  { id: "inventory", name: "Inventory", icon: "IN" },
  { id: "receipt", name: "Receipt", icon: "RE" },
];

const sections = {
  store: ["storeName", "currency", "taxRate"],
  pos: ["defaultPaymentMethod", "allowDiscount", "maxDiscount"],
  inventory: ["allowNegativeStock", "lowStockThreshold"],
  receipt: ["autoPrintReceipt", "receiptFooter"],
};

const labels = {
  storeName: "Store name",
  currency: "Currency code",
  taxRate: "Tax rate (%)",
  defaultPaymentMethod: "Default payment method",
  allowDiscount: "Allow discounts",
  maxDiscount: "Maximum discount (%)",
  allowNegativeStock: "Allow negative stock",
  lowStockThreshold: "Low-stock threshold",
  autoPrintReceipt: "Automatically print receipts",
  receiptFooter: "Receipt footer",
};

const numericFields = new Set(["taxRate", "maxDiscount", "lowStockThreshold"]);
const booleanFields = new Set(["allowDiscount", "allowNegativeStock", "autoPrintReceipt"]);

export default function Setting() {
  const [activeTab, setActiveTab] = useState("profile");
  const [form, setForm] = useState(defaults);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const {
    user,
    getCurrentUser,
    isLoading: profileLoading,
    error: profileError,
  } = useCurrentUser();
  const canManageStore = ["super_admin", "admin"].includes(user?.role);
  const visibleTabs = canManageStore ? tabs : tabs.filter((tab) => tab.id === "profile");

  useEffect(() => {
    getCurrentUser().catch(() => {
      // The profile error is rendered in the page.
    });
  }, [getCurrentUser]);

  useEffect(() => {
    if (!canManageStore || activeTab === "profile") return undefined;

    let active = true;
    const loadSettings = async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/settings");
        if (active) setForm({ ...defaults, ...data.data });
      } catch (requestError) {
        if (active) setError(requestError.response?.data?.message || "Unable to load settings.");
      } finally {
        if (active) setLoading(false);
      }
    };
    loadSettings();
    return () => { active = false; };
  }, [activeTab, canManageStore]);

  const updateField = ({ target }) => {
    const { name, type, value, checked } = target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : numericFields.has(name) ? Number(value) : value,
    }));
    setError("");
  };

  const saveSettings = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = Object.fromEntries(Object.keys(defaults).map((field) => [field, form[field]]));
      const { data } = await api.put("/settings", payload);
      setForm({ ...defaults, ...data.data });
      toast.success("Settings saved successfully.");
    } catch (requestError) {
      const message = requestError.response?.data?.message || "Unable to save settings.";
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const renderField = (field) => {
    if (booleanFields.has(field)) {
      return (
        <label key={field} className="flex items-center justify-between gap-4 rounded-lg border border-gray-200 p-4">
          <span className="font-medium text-gray-700">{labels[field]}</span>
          <input name={field} type="checkbox" checked={form[field]} onChange={updateField} className="h-5 w-5" />
        </label>
      );
    }

    if (field === "defaultPaymentMethod") {
      return (
        <label key={field} className="block">
          <span className="mb-2 block font-medium text-gray-700">{labels[field]}</span>
          <select name={field} value={form[field]} onChange={updateField} className="w-full rounded-lg border border-gray-300 px-3 py-2">
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="qr">QR payment</option>
          </select>
        </label>
      );
    }

    return (
      <label key={field} className="block">
        <span className="mb-2 block font-medium text-gray-700">{labels[field]}</span>
        {field === "receiptFooter" ? (
          <textarea name={field} value={form[field]} onChange={updateField} maxLength={500} rows={4} className="w-full rounded-lg border border-gray-300 px-3 py-2" />
        ) : (
          <input
            name={field}
            type={numericFields.has(field) ? "number" : "text"}
            value={form[field]}
            onChange={updateField}
            min={numericFields.has(field) ? 0 : undefined}
            max={["taxRate", "maxDiscount"].includes(field) ? 100 : undefined}
            maxLength={field === "currency" ? 3 : undefined}
            required={field === "storeName"}
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
          />
        )}
      </label>
    );
  };

  const renderProfile = () => {
    if (profileLoading && !user) return <p className="text-gray-500">Loading profile...</p>;
    if (profileError) return <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-red-700">{profileError}</p>;

    const initials = user?.name
      ?.split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join("") || "U";

    return (
      <div className="grid gap-6">
        <div className="flex items-center gap-4 rounded-xl bg-blue-50 p-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-xl font-bold text-white">{initials}</div>
          <div>
            <h3 className="text-xl font-semibold text-gray-800">{user?.name || "Unknown user"}</h3>
            <p className="capitalize text-gray-500">{user?.role?.replace("_", " ") || "User"}</p>
          </div>
        </div>
        <dl className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-gray-200 p-4">
            <dt className="text-sm text-gray-500">User name</dt>
            <dd className="mt-1 font-medium text-gray-800">{user?.name || "Not available"}</dd>
          </div>
          <div className="rounded-lg border border-gray-200 p-4">
            <dt className="text-sm text-gray-500">Email address</dt>
            <dd className="mt-1 break-all font-medium text-gray-800">{user?.email || "Not available"}</dd>
          </div>
          <div className="rounded-lg border border-gray-200 p-4">
            <dt className="text-sm text-gray-500">Role</dt>
            <dd className="mt-1 capitalize font-medium text-gray-800">{user?.role?.replace("_", " ") || "Not available"}</dd>
          </div>
          <div className="rounded-lg border border-gray-200 p-4">
            <dt className="text-sm text-gray-500">User ID</dt>
            <dd className="mt-1 font-medium text-gray-800">{user?.id || user?._id || "Not assigned"}</dd>
          </div>
        </dl>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
        <p className="mt-1 text-gray-500">Manage your store, POS, inventory, and receipt settings.</p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <nav className="h-fit w-full rounded-xl bg-white p-3 shadow-sm lg:w-64">
          {visibleTabs.map((tab) => (
            <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} className={`mb-1 flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition ${activeTab === tab.id ? "bg-blue-50 font-medium text-blue-600" : "text-gray-600 hover:bg-gray-50"}`}>
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-gray-100 text-xs font-bold">{tab.icon}</span>
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>

        <form onSubmit={saveSettings} className="flex-1 rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-semibold text-gray-800">{tabs.find((tab) => tab.id === activeTab)?.name} settings</h2>
          {activeTab === "profile" ? renderProfile() : loading ? <p className="text-gray-500">Loading settings...</p> : (
            <>
              {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-red-700">{error}</p>}
              <div className="grid gap-5">{sections[activeTab].map(renderField)}</div>
              <div className="mt-6 flex justify-end border-t border-gray-100 pt-5">
                <button type="submit" disabled={saving} className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">
                  {saving ? "Saving..." : "Save settings"}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
