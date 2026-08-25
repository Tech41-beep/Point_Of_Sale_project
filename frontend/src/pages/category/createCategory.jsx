import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api";

function CreateCategory() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ id: "", name: "",  note: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (isLoading) return;
    const payload = Object.fromEntries(Object.entries(form).map(([key, value]) => [key, value.trim()]));

    if (!payload.id || !payload.name) {
      setError("Category ID and name are required.");
      return;
    }

    setError("");
    setIsLoading(true);
    try {
      await api.post("/categories", payload);
      navigate("/categories", { replace: true, state: { message: "Category created successfully." } });
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.response?.data?.error || "Failed to create category");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link to="/categories" className="text-sm font-medium text-indigo-600">← Back to categories</Link>
      <h1 className="mt-3 text-2xl font-bold text-gray-800">Create Category</h1>
      <form onSubmit={handleSubmit} className="mt-6 rounded-xl bg-white p-6 shadow-sm">
        {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-medium text-gray-700">Category ID *
            <input name="id" value={form.id} onChange={handleChange} required placeholder="C001" className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-indigo-500" />
          </label>
          <label className="text-sm font-medium text-gray-700">Category Name *
            <input name="name" value={form.name} onChange={handleChange} required placeholder="Enter category name" className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-indigo-500" />
          </label>
          <label className="text-sm font-medium text-gray-700">Note
            <input name="note" value={form.note} onChange={handleChange} placeholder="Enter a note" className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-indigo-500" />
          </label>
        
        </div>
        <div className="mt-6 flex justify-end gap-3 border-t border-gray-200 pt-5">
          <Link to="/categories" className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-600">Cancel</Link>
          <button type="submit" disabled={isLoading} className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-wait disabled:opacity-60">
            {isLoading ? "Creating…" : "Create Category"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateCategory;
