import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api";
import { toast } from "react-toastify";
import Modal from "../../components/Modal";
const inputClass = "mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 outline-none focus:border-indigo-500";
const emptyForm = { supplier: "", invoiceNumber: "", purchaseDate: new Date().toISOString().slice(0, 10), product: "", quantity: "1", price: "", paidAmount: "0", purchaseStatus: "pending" };

export default function CreatePurchase() {
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [cart, setCart] = useState([]);

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
  

 
  function handleAddToCart(){
    const selectedProduct = products.find((item) => item._id === form.product);
    const data = {
      product: form.product,
      name: selectedProduct?.name || "Unknown product",
      code: selectedProduct?.code || selectedProduct?.id || "—",
      quantity: Number(form.quantity),
      price: Number(form.price)
    };

    const exist = cart.find((item) => item.product === data.product && item.price === data.price);
    if(exist){
      setError("This product with the same unit cost is already in the cart. You can change the quantity in the cart.");
      return;
    }
    if(!data.product || data.quantity < 1 || form.price === "" || data.price < 0){
      setError("Select a product and enter a valid quantity and unit cost.");
      return;
    }
    setCart((current) => {
      const existingIndex = current.findIndex((item) => item.product === data.product && item.price === data.price);
      if (existingIndex === -1) return [...current, data];
      return current.map((item, index) => index === existingIndex ? { ...item, quantity: item.quantity + data.quantity } : item);
    });
    setForm((current) => ({ ...current, product: "", quantity: "1", price: "" }));
    setError("");
  }
  const clearForm = () => setForm(emptyForm);

  const removeCartItem = (index) => setCart((current) => current.filter((_, itemIndex) => itemIndex !== index));
  const cartTotal = cart.reduce((total, item) => total + item.quantity * item.price, 0);

  // add data to the database
function submit(event) {
  event.preventDefault();

  if (
    !form.supplier ||
    !form.invoiceNumber.trim() ||
    !form.purchaseDate ||
    cart.length === 0
  ) {
    setError(
      "Complete the purchase details and add at least one item to the cart."
    );
    return;
  }

  const paidAmount = Number(form.paidAmount);

  if (!Number.isFinite(paidAmount) || paidAmount < 0) {
    setError("Enter a valid paid amount.");
    return;
  }

  if (paidAmount > cartTotal) {
    setError("Paid amount cannot be greater than the cart total.");
    return;
  }

  setError("");
  setConfirmOpen(true);
}
async function confirmCreatePurchase() {
  if (loading) return;

  setLoading(true);

  try {
    await api.post("/purchases", {
      supplier: form.supplier,
      invoiceNumber: form.invoiceNumber.trim(),
      purchaseDate: form.purchaseDate,
      paidAmount: Number(form.paidAmount),
      purchaseStatus: form.purchaseStatus,
      items: cart.map(({ product, quantity, price }) => ({
        product,
        quantity,
        price,
      })),
    });

    toast.success("Purchase created successfully!");

    navigate("/purchases", { replace: true });
  } catch (error) {
    toast.error(
      error.response?.data?.message || "Failed to create purchase"
    );
  } finally {
    setLoading(false);
  }
}

  return <div className="mx-auto max-w-3xl">
  <Modal
  open={confirmOpen}
  onClose={() => {
    if (!loading) setConfirmOpen(false);
  }}
  
  title="Create purchase?"
  titleClassName="text-indigo-600"
>
  <p className="text-sm text-black/80">
    Please confirm that the purchase details are correct.
  </p>

  <div className="mt-4 space-y-2 rounded-lg bg-gray-50 p-4 text-sm">
    <p className="text-black">
      Invoice:{" "}
      <strong className="text-black">{form.invoiceNumber || "—"}</strong>
    </p>

    <p className="text-black">
      Items: <strong className="text-black">{cart.length}</strong>
    </p>

    <p className="text-black">
      Total:{" "}
      <strong className="text-black">
        ${cartTotal.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </strong>
    </p>

    <p className="text-black">
      Paid:{" "}
      <strong className="text-black">
        ${Number(form.paidAmount || 0).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </strong>
    </p>
  </div>

  <div className="mt-6 flex justify-end gap-3">
    <button
      type="button"
      onClick={() => setConfirmOpen(false)}
      disabled={loading}
      className="rounded-lg border text-black border-black px-4 py-2 disabled:opacity-50"
    >
      Go back
    </button>

    <button
      type="button"
      onClick={confirmCreatePurchase}
      disabled={loading}
      className="rounded-lg bg-indigo-600 px-4 py-2  disabled:opacity-50"
    >
      {loading ? "Creating…" : "Confirm purchase"}
    </button>
  </div>
</Modal>

    <Link to="/purchases" className="text-sm font-medium text-indigo-600">← Back to purchases</Link>
    <h1 className="mt-3 text-2xl font-bold text-gray-800">Create Purchase</h1>
    <form onSubmit={submit} className="mt-6 rounded-xl bg-white p-6 shadow-sm">
      {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="text-sm font-medium text-gray-700">Supplier *<select name="supplier" value={form.supplier} onChange={change} required className={inputClass}><option value="">Select supplier</option>
        {suppliers.map((item) => <option key={item._id} value={item._id}>{item.businessName || item.name}</option>)}</select></label>
        <label className="text-sm font-medium text-gray-700">Invoice Number *<input name="invoiceNumber" value={form.invoiceNumber} onChange={change} required className={inputClass} /></label>
        <label className="text-sm font-medium text-gray-700">Purchase Date *<input name="purchaseDate" type="date" value={form.purchaseDate} onChange={change} required className={inputClass} /></label>
        <label className="text-sm font-medium text-gray-700">Status<select name="purchaseStatus" value={form.purchaseStatus} onChange={change} className={inputClass}><option value="pending">Pending</option><option value="received">Received</option><option value="cancelled">Cancelled</option></select></label>
        <label className="text-sm font-medium text-gray-700 sm:col-span-2">Product *<select name="product" value={form.product} onChange={selectProduct} className={inputClass}><option value="">Select product</option>{products.map((item) => <option key={item._id} value={item._id}>{item.name} ({item.code || item.id})</option>)}</select></label>
        <label className="text-sm font-medium text-gray-700">Quantity *<input name="quantity" type="number" min="1" value={form.quantity} onChange={change} className={inputClass} /></label>
        <label className="text-sm font-medium text-gray-700">Unit Cost *<input name="price" type="number" min="0" step="0.01" value={form.price} onChange={change} className={inputClass} /></label>
   
        <label className="text-sm font-medium text-gray-700"> Paid Amount<input name="paidAmount" type="number" min="0" step="0.01" value={form.paidAmount} onChange={change} className={inputClass} /></label>
        <div className="rounded-lg bg-indigo-50 p-4 text-sm text-indigo-700"> Cart total: $ <strong>{cartTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></div>
           <button
          type="button"
          onClick={handleAddToCart}
          className="group flex w-full items-center justify-center gap-2 rounded-lg border border-indigo-600 bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 active:translate-y-0 sm:col-span-2"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 transition group-hover:bg-white/30" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4">
              <path d="M12 5v14M5 12h14" strokeLinecap="round" />
            </svg>
          </span>
          Add to cart
        </button>
      </div>

  {/* Table Add to cart */}
      {cart.length > 0 && <div className="mt-6 overflow-hidden rounded-xl border border-gray-200">
        <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-5 py-4">
          <div><h2 className="font-semibold text-gray-800">Purchase items</h2><p className="mt-0.5 text-xs text-gray-500">{cart.length} product{cart.length === 1 ? "" : "s"} added to this purchase</p></div>
          <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">Cart</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-white text-xs uppercase tracking-wide text-gray-500"><tr><th className="px-5 py-3 font-semibold">Product</th><th className="px-4 py-3 text-center font-semibold">Quantity</th><th className="px-4 py-3 text-right font-semibold">Unit cost</th><th className="px-4 py-3 text-right font-semibold">Amount</th><th className="px-5 py-3 text-right font-semibold">Action</th></tr></thead>
            <tbody className="divide-y divide-gray-100">
              {cart.map((item, index) => <tr key={`${item.product}-${item.price}`} className="transition hover:bg-gray-50">
                <td className="px-5 py-4"><p className="font-semibold text-gray-800">{item.name}</p><p className="mt-0.5 text-xs text-gray-400">{item.code}</p></td>
                <td className="px-4 py-4 text-center text-gray-600">{item.quantity}</td>
                <td className="px-4 py-4 text-right text-gray-600">${item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td className="px-4 py-4 text-right font-semibold text-gray-800">${(item.quantity * item.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td className="px-5 py-4 text-right"><button type="button" onClick={() => removeCartItem(index)} className="rounded-lg px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50">Remove</button></td>
              </tr>)}
            </tbody>
            <tfoot className="border-t border-gray-200 bg-gray-50"><tr><td colSpan="3" className="px-5 py-4 text-right font-semibold text-gray-600">Total</td><td className="px-4 py-4 text-right text-base font-bold text-indigo-700">
              ${cartTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td><td /></tr></tfoot>
          </table>
        </div>

      </div>}

      <div className="mt-6 flex text-black justify-end gap-3 border-t pt-5 border-black"><Link to="/purchases" className="rounded-lg  hover:bg-amber-100 text-black border border-black px-5 py-2.5 text-sm font-semibold disabled:opacity-50">Cancel</Link><button disabled={loading} className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{loading ? "Creating…" : "Create Purchase"}</button></div>
    </form>
  </div>;

      }
