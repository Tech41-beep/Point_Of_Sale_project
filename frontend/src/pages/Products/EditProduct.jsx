import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../../api";
import { useFindCustomerById } from "../../auth/hooks/use.findById";
import { useCollection } from "../../auth/hooks/use.Collection";

const inputClass = "mt-2 w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-indigo-500";

function EditProduct() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form, setForm] = useState({ id: "", barcode: "", name: "", code: "", category: "", costPrice: "", salePrice: "", currentStockQuantity: "", imageUrl: "", note: "" });
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const { data, loading, error: loadError } = useFindCustomerById("products", id);
  const { update, isLoading } = useCollection("products");

  useEffect(() => {
    api.get("/categories", { params: { page: 1, limit: 100 } })
      .then(({ data: response }) => setCategories(Array.isArray(response?.result) ? response.result : []))
      .catch((requestError) => setError(requestError.response?.data?.message || "Failed to load categories."));
  }, []);

  useEffect(() => {
    if (!data) return;
    setForm({
      id: data.id || "", barcode: data.barcode || "", name: data.name || "", code: data.code || "",
      category: data.category?._id || data.category || "",
      costPrice: String(data.costPrice ?? ""), salePrice: String(data.salePrice ?? ""),
      currentStockQuantity: String(data.currentStockQuantity ?? ""),
      imageUrl: data.imageUrl || "", note: data.note || "",
    });
  }, [data]);

  function handleChange(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (isLoading) return;
    const payload = Object.fromEntries(Object.entries(form).map(([key, value]) => [key, value.trim()]));
    if (!payload.id || !payload.barcode || !payload.name || !payload.category || payload.costPrice === "" || payload.salePrice === "") {
      setError("Product ID, barcode, name, category, cost price, and sale price are required.");
      return;
    }
    setError("");
    try {
      await update(id, { ...payload, costPrice: Number(payload.costPrice), salePrice: Number(payload.salePrice), currentStockQuantity: Number(payload.currentStockQuantity) || 0 });
      navigate("/products", { replace: true, state: { message: "Product updated successfully." } });
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message || "Failed to update product.");
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link to="/products" className="text-sm font-medium text-indigo-600">← Back to products</Link>
      <h1 className="mt-3 text-2xl font-bold text-gray-800">Edit Product</h1>
      <form onSubmit={handleSubmit} className="mt-6 rounded-xl bg-white p-6 shadow-sm">
        {(error || loadError) && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error || loadError}</p>}
        {loading && <p className="mb-4 text-sm text-gray-500">Loading product…</p>}
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-medium text-gray-700">Product ID *<input name="id" value={form.id} onChange={handleChange} required className={inputClass} /></label>
          <label className="text-sm font-medium text-gray-700">Barcode *<input name="barcode" value={form.barcode} onChange={handleChange} required minLength={4} maxLength={32} className={inputClass} /></label>
          <label className="text-sm font-medium text-gray-700">Code<input name="code" value={form.code} onChange={handleChange} className={inputClass} /></label>
          <label className="text-sm font-medium text-gray-700">Product Name *<input name="name" value={form.name} onChange={handleChange} required className={inputClass} /></label>
          <label className="text-sm font-medium text-gray-700">Category *
            <select name="category" value={form.category} onChange={handleChange} required className={`${inputClass} bg-white`}>
              <option value="">Select a category</option>
              {categories.map((category) => <option key={category._id} value={category._id}>{category.name}</option>)}
            </select>
          </label>
          <label className="text-sm font-medium text-gray-700">Cost Price *<input name="costPrice" type="number" min="0" step="0.01" value={form.costPrice} onChange={handleChange} required className={inputClass} /></label>
          <label className="text-sm font-medium text-gray-700">Sale Price *<input name="salePrice" type="number" min="0" step="0.01" value={form.salePrice} onChange={handleChange} required className={inputClass} /></label>
          <label className="text-sm font-medium text-gray-700">Current Stock Quantity<input name="currentStockQuantity" type="number" min="0" value={form.currentStockQuantity} onChange={handleChange} className={inputClass} /></label>
          <label className="text-sm font-medium text-gray-700 sm:col-span-2">Image URL<input name="imageUrl" value={form.imageUrl} onChange={handleChange} className={inputClass} /></label>
          <label className="text-sm font-medium text-gray-700 sm:col-span-2">Note<textarea name="note" value={form.note} onChange={handleChange} rows="3" className={`${inputClass} resize-none`} /></label>
        </div>
        <div className="mt-6 flex justify-end gap-3 border-t border-gray-200 pt-5">
          <Link to="/products" className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-600">Cancel</Link>
          <button type="submit" disabled={loading || isLoading} className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{isLoading ? "Saving…" : "Save Product"}</button>
        </div>
      </form>
    </div>
  );
}

export default EditProduct;
