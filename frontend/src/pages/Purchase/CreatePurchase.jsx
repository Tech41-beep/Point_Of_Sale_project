import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api";

const inputClass = "mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 outline-none focus:border-indigo-500";
const emptyForm = { supplier: "", invoiceNumber: "", purchaseDate: new Date().toISOString().slice(0, 10), product: "", quantity: "1", price: "", paidAmount: "0", purchaseStatus: "pending" };

export default function CreatePurchase() {
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([api.get("/suppliers", { params: { limit: 100 } }), api.get("/products", { params: { limit: 100 } })])
      .then(([suppliersResponse, productsResponse]) => {
        setSuppliers(suppliersResponse.data?.result || []);
        setProducts(productsResponse.data?.result || []);
      })
      .catch((requestError) => setError(requestError.response?.data?.message || "Failed to load suppliers and products."));
  }, []);

  const change = ({ target: { name, value } }) => setForm((current) => ({ ...current, [name]: value }));
  const selectProduct = ({ target: { value } }) => {
    const product = products.find((item) => item._id === value);
    setForm((current) => ({ ...current, product: value, price: product ? String(product.costPrice ?? "") : "" }));
  };

  async function submit(event) {
    event.preventDefault();
    if (!form.supplier || !form.invoiceNumber.trim() || !form.purchaseDate || !form.product || Number(form.quantity) < 1 || Number(form.price) < 0) {
      setError("Complete all required purchase fields.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await api.post("/purchases", {
        supplier: form.supplier,
        invoiceNumber: form.invoiceNumber.trim(),
        purchaseDate: form.purchaseDate,
        paidAmount: Number(form.paidAmount) || 0,
        purchaseStatus: form.purchaseStatus,
        items: [{ product: form.product, quantity: Number(form.quantity), price: Number(form.price) }],
      });
      navigate("/purchases", { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to create purchase.");
    } finally {
      setLoading(false);
    }
  }

  return <div className="mx-auto max-w-3xl">
    <Link to="/purchases" className="text-sm font-medium text-indigo-600">← Back to purchases</Link>
    <h1 className="mt-3 text-2xl font-bold text-gray-800">Create Purchase</h1>
    <form onSubmit={submit} className="mt-6 rounded-xl bg-white p-6 shadow-sm">
      {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="text-sm font-medium text-gray-700">Supplier *<select name="supplier" value={form.supplier} onChange={change} required className={inputClass}><option value="">Select supplier</option>{suppliers.map((item) => <option key={item._id} value={item._id}>{item.businessName || item.name}</option>)}</select></label>
        <label className="text-sm font-medium text-gray-700">Invoice Number *<input name="invoiceNumber" value={form.invoiceNumber} onChange={change} required className={inputClass} /></label>
        <label className="text-sm font-medium text-gray-700">Purchase Date *<input name="purchaseDate" type="date" value={form.purchaseDate} onChange={change} required className={inputClass} /></label>
        <label className="text-sm font-medium text-gray-700">Status<select name="purchaseStatus" value={form.purchaseStatus} onChange={change} className={inputClass}><option value="pending">Pending</option><option value="received">Received</option><option value="cancelled">Cancelled</option></select></label>
        <label className="text-sm font-medium text-gray-700 sm:col-span-2">Product *<select name="product" value={form.product} onChange={selectProduct} required className={inputClass}><option value="">Select product</option>{products.map((item) => <option key={item._id} value={item._id}>{item.name} ({item.code || item.id})</option>)}</select></label>
        <label className="text-sm font-medium text-gray-700">Quantity *<input name="quantity" type="number" min="1" value={form.quantity} onChange={change} required className={inputClass} /></label>
        <label className="text-sm font-medium text-gray-700">Unit Cost *<input name="price" type="number" min="0" step="0.01" value={form.price} onChange={change} required className={inputClass} /></label>
        <label className="text-sm font-medium text-gray-700"> Paid Amount<input name="paidAmount" type="number" min="0" step="0.01" value={form.paidAmount} onChange={change} className={inputClass} /></label>
        <div className="rounded-lg bg-gray-50 p-4 text-sm text-red-700"> Total: $ <strong>{((Number(form.quantity) || 0) * (Number(form.price) || 0)).toLocaleString()}</strong></div>
      </div>
      <div className="mt-6 flex justify-end gap-3 border-t border-gray-200 pt-5"><Link to="/purchases" className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-600">Cancel</Link><button disabled={loading} className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{loading ? "Creating…" : "Create Purchase"}</button></div>
    </form>
  </div>;
}
