import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../../api";

const inputClass = "mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 outline-none focus:border-indigo-500";

export default function EditPurchase() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ supplier: "", invoiceNumber: "", purchaseDate: "", product: "", quantity: "1", price: "", paidAmount: "0", purchaseStatus: "pending" });
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get(`/purchases/${id}`), api.get("/suppliers", { params: { limit: 100 } }), api.get("/products", { params: { limit: 100 } })])
      .then(([purchaseResponse, suppliersResponse, productsResponse]) => {
        const purchase = purchaseResponse.data.result;
        const item = purchase.items?.[0];
        setSuppliers(suppliersResponse.data?.result || []);
        setProducts(productsResponse.data?.result || []);
        setForm({ supplier: purchase.supplier?._id || purchase.supplier || "", invoiceNumber: purchase.invoiceNumber || "", purchaseDate: purchase.purchaseDate?.slice(0, 10) || "", product: item?.product?._id || item?.product || "", quantity: String(item?.quantity ?? 1), price: String(item?.price ?? ""), paidAmount: String(purchase.paidAmount ?? 0), purchaseStatus: purchase.purchaseStatus || "pending" });
      })
      .catch((requestError) => setError(requestError.response?.data?.message || "Failed to load purchase."))
      .finally(() => setLoading(false));
  }, [id]);

  const change = ({ target: { name, value } }) => setForm((current) => ({ ...current, [name]: value }));

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.put(`/purchases/${id}`, { supplier: form.supplier, invoiceNumber: form.invoiceNumber.trim(), purchaseDate: form.purchaseDate, paidAmount: Number(form.paidAmount) || 0, purchaseStatus: form.purchaseStatus, items: [{ product: form.product, quantity: Number(form.quantity), price: Number(form.price) }] });
      navigate("/purchases", { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to update purchase.");
      setLoading(false);
    }
  }

  return <div className="mx-auto max-w-3xl">
    <Link to="/purchases" className="text-sm font-medium text-indigo-600">← Back to purchases</Link><h1 className="mt-3 text-2xl font-bold text-gray-800">Edit Purchase</h1>
    <form onSubmit={submit} className="mt-6 rounded-xl bg-white p-6 shadow-sm">{error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="text-sm font-medium text-gray-700">Supplier *<select name="supplier" value={form.supplier} onChange={change} required className={inputClass}><option value="">Select supplier</option>{suppliers.map((item) => <option key={item._id} value={item._id}>{item.businessName || item.name}</option>)}</select></label>
        <label className="text-sm font-medium text-gray-700">Invoice Number *<input name="invoiceNumber" value={form.invoiceNumber} onChange={change} required className={inputClass} /></label>
        <label className="text-sm font-medium text-gray-700">Date *<input name="purchaseDate" type="date" value={form.purchaseDate} onChange={change} required className={inputClass} /></label>
        <label className="text-sm font-medium text-gray-700">Status<select name="purchaseStatus" value={form.purchaseStatus} onChange={change} className={inputClass}><option value="pending">Pending</option><option value="received">Received</option><option value="cancelled">Cancelled</option></select></label>
        <label className="text-sm font-medium text-gray-700 sm:col-span-2">Product *<select name="product" value={form.product} onChange={change} required className={inputClass}><option value="">Select product</option>{products.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}</select></label>
        <label className="text-sm font-medium text-gray-700">Quantity *<input name="quantity" type="number" min="1" value={form.quantity} onChange={change} required className={inputClass} /></label>
        <label className="text-sm font-medium text-gray-700">Unit Cost *<input name="price" type="number" min="0" step="0.01" value={form.price} onChange={change} required className={inputClass} /></label>
        <label className="text-sm font-medium text-gray-700">Paid Amount<input name="paidAmount" type="number" min="0" step="0.01" value={form.paidAmount} onChange={change} className={inputClass} /></label>
      </div>
      <div className="mt-6 flex justify-end gap-3 border-t border-gray-200 pt-5"><Link to="/purchases" className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-600">Cancel</Link><button disabled={loading} className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{loading ? "Saving…" : "Save Purchase"}</button></div>
    </form>
  </div>;
}
