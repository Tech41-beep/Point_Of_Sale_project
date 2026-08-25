import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useFindCustomerById } from "../../auth/hooks/use.findById";
import { useCollection } from "../../auth/hooks/use.Collection";

function EditCategory() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ id: "", name: "", note: "" });
  const [error, setError] = useState("");
  const { id } = useParams();
  const { data, loading, error: loadError } = useFindCustomerById("categories", id);
  const { update, isLoading } = useCollection("categories");

  useEffect(() => {
    if (data) {
      setForm({
        id: data.id || "",
        name: data.name || "",
        note: data.note || "",
      });
    }
  }, [data]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (isLoading) return;

    if (!form.id.trim() || !form.name.trim()) {
      setError("Category ID and category name are required.");
      return;
    }

    const categoryData = {
      id: form.id.trim(),
      name: form.name.trim(),
      note: form.note.trim(),
    };

    setError("");
    try {
      await update(id, categoryData);

      navigate("/categories", {
        replace: true,
        state: { message: "Category updated successfully." },
      });
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
        requestError.response?.data?.error ||
        requestError.message ||
        "Failed to update category.",
      );
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link to="/categories" className="text-sm font-medium text-indigo-600">← Back to categories</Link>
      <h1 className="mt-3 text-2xl font-bold text-gray-800">Edit Category</h1>

      <form onSubmit={handleSubmit} className="mt-6 rounded-xl bg-white p-6 shadow-sm">
        {(error || loadError) && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error || loadError}</p>}
        {loading && <p className="mb-4 text-sm text-gray-500">Loading category…</p>}

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-medium text-gray-700">CategoryID *
            <input name="id" value={form.id} onChange={handleChange} required placeholder="C001" className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-indigo-500" />
          </label>

          <label className="text-sm font-medium text-gray-700">Category Name *
            <input name="name" value={form.name} onChange={handleChange} required placeholder="Enter category name" className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-indigo-500" />
          </label>

       
          <label className="text-sm font-medium text-gray-700 sm:col-span-2">Note
            <textarea name="note" value={form.note} onChange={handleChange} rows="3" placeholder="Enter a note" className="mt-2 w-full resize-none rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-indigo-500" />
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-3 border-t border-gray-200 pt-5">
          <Link to="/categories" className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-600">Cancel</Link>
          <button type="submit" disabled={loading || isLoading} className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-wait disabled:opacity-60">
            {isLoading ? "Saving…" : "Edit Category"}
          </button>
        </div>
      </form>
    </div>
  );
}



export default EditCategory;
