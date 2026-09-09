import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api";

function CreateProduct() {
  const navigate = useNavigate();
  const imageInputRef = useRef(null);
  const [form, setForm] = useState({ id: "", barcode: "", category: "", name: "", code: "", costPrice: "", salePrice: "", currentStockQuantity: "", imageUrl: "", note: "" });
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await api.get("/categories", {
          params: { page: 1, limit: 100 },
        });
        setCategories(
          Array.isArray(response.data?.result) ? response.data.result : [],
        );
      } catch (requestError) {
        setError(
          requestError.response?.data?.message ||
            requestError.response?.data?.error ||
            "Failed to load categories.",
        );
      }
    }

    fetchCategories();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handleImageChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      event.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("Product image must be 2 MB or smaller.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setForm((current) => ({ ...current, imageUrl: reader.result }));
      setError("");
    };
    reader.onerror = () => setError("Failed to read the selected image.");
    reader.readAsDataURL(file);
  }

  function handleRemoveImage() {
    setForm((current) => ({ ...current, imageUrl: "" }));
    if (imageInputRef.current) imageInputRef.current.value = "";
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (isLoading) return;
    const payload = Object.fromEntries(Object.entries(form).map(([key, value]) => [key, value.trim()]));

    if (
  !payload.id ||
  !payload.barcode ||
  !payload.name ||
  !payload.category ||
  !payload.costPrice ||
  !payload.salePrice
) {
  setError(
    "Product ID, barcode, name, category, cost price, and sale price are required.",
  );
  return;
}
    setError("");
    setIsLoading(true);
    try {
      await api.post("/products", {
        ...payload,
        costPrice: Number(payload.costPrice),
        salePrice: Number(payload.salePrice),
        currentStockQuantity: Number(payload.currentStockQuantity) || 0,
      });
      navigate("/products", { replace: true, state: { message: "Product created successfully." } });
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.response?.data?.error || "Failed to create product");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link to="/products" className="text-sm font-medium text-indigo-600">← Back to products</Link>
      <h1 className="mt-3 text-2xl font-bold text-gray-800">Create Product</h1>
      <form onSubmit={handleSubmit} className="mt-6 rounded-xl bg-white p-6 shadow-sm">
        {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-medium text-gray-700">Product ID *
            <input name="id" value={form.id} onChange={handleChange} required placeholder="P001" className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-indigo-500" />
          </label>
          <label className="text-sm font-medium text-gray-700">Barcode *
            <input name="barcode" value={form.barcode} onChange={handleChange} required minLength={4} maxLength={32} placeholder="Scan or enter barcode" className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-indigo-500" />
          </label>
          <label className="text-sm font-medium text-gray-700">code *
            <input name="code" value={form.code} onChange={handleChange} required placeholder="Enter product code" className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-indigo-500" />
          </label>

          <label className="text-sm font-medium text-gray-700">Product Name *
            <input name="name" value={form.name} onChange={handleChange} required placeholder="Enter product name" className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-indigo-500" />
          </label>
          <label className="text-sm font-medium text-gray-700">Category *
            <select name="category" value={form.category} onChange={handleChange} required className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 outline-none focus:border-indigo-500">
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium text-gray-700">Cost Price *
            <input name="costPrice" type="number" min="0" value={form.costPrice} onChange={handleChange} required placeholder="Enter cost price" className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-indigo-500" />
          </label>
          <label className="text-sm font-medium text-gray-700">Sale Price *
            <input name="salePrice" type="number" min="0" value={form.salePrice} onChange={handleChange} required placeholder="Enter sale price" className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-indigo-500" />
          </label>
          <label className="text-sm font-medium text-gray-700">Current Stock Quantity
            <input name="currentStockQuantity" type="number" min="0" value={form.currentStockQuantity} onChange={handleChange} placeholder="Enter current stock quantity" className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-indigo-500" />
          </label>
          <div className="text-sm font-medium text-gray-700 sm:col-span-2">
            <label htmlFor="product-image">Product Image</label>
            <input
              ref={imageInputRef}
              id="product-image"
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              onChange={handleImageChange}
              className="mt-2 block w-full rounded-lg border border-gray-300 text-sm text-gray-600 file:mr-4 file:border-0 file:bg-indigo-50 file:px-4 file:py-2.5 file:font-semibold file:text-indigo-600 hover:file:bg-indigo-100"
            />
            <p className="mt-1 text-xs font-normal text-gray-500">PNG, JPG, WebP, or GIF. Maximum size: 2 MB.</p>
            {form.imageUrl && (
              <div className="mt-3 flex items-start gap-3">
                <img src={form.imageUrl} alt="Product preview" className="h-28 w-28 rounded-lg border border-gray-200 object-cover" />
                <button type="button" onClick={handleRemoveImage} className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50">
                  Remove image
                </button>
              </div>
            )}
          </div>
          <label className="text-sm font-medium text-gray-700 sm:col-span-2">Note
            <textarea name="note" value={form.note} onChange={handleChange} rows="3" placeholder="Enter a note" className="mt-2 w-full resize-none rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-indigo-500" />
          </label>
        </div>
        <div className="mt-6 flex justify-end gap-3 border-t border-gray-200 pt-5">
          <Link to="/products" className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-600">Cancel</Link>
          <button type="submit" disabled={isLoading} className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-wait disabled:opacity-60">
            {isLoading ? "Creating…" : "Create Product"}
          </button>
          
        </div>
      </form>
    </div>
  );
}

export default CreateProduct;
