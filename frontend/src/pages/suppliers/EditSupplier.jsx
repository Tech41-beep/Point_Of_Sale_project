import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useFindCustomerById } from "../../auth/hooks/use.findById";
import { useCollection } from "../../auth/hooks/use.Collection";

function EditSupplier() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form, setForm] = useState({ id: "", businessName: "", name: "", phone: "", address: "", note: "" });
  const [error, setError] = useState("");
  const { data, loading, error: loadError } = useFindCustomerById("suppliers", id);
  const { update, isLoading } = useCollection("suppliers");

  useEffect(() => {
    if (data) {
      setForm({
        id: data.id || "",
        businessName: data.businessName || "",
        name: data.name || "",
        phone: data.phone || "",
        address: data.address || "",
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
    const payload = Object.fromEntries(Object.entries(form)
    .map(([key, value]) => [key, value.trim()]));

    if (!payload.id || !payload.businessName || !payload.address) {
      setError("Supplier ID, business name, and address are required.");
      return;
    }

    setError("");
    try {
      await update(id, payload);
      navigate("/suppliers", { replace: true, state: { message: "Supplier updated successfully." } });
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.response?.data?.error || requestError.message || "Failed to update supplier.");
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link to="/suppliers" className="text-sm font-medium text-indigo-600">← Back to suppliers</Link>
      <h1 className="mt-3 text-2xl font-bold text-gray-800">Edit Supplier</h1>
      <form onSubmit={handleSubmit} className="mt-6 rounded-xl bg-white p-6 shadow-sm">
        {(error || loadError) && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error || loadError}</p>}
        {loading && <p className="mb-4 text-sm text-gray-500">Loading supplier…</p>}
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-medium text-gray-700">Supplier ID *
            <input name="id" value={form.id} onChange={handleChange} required placeholder="S001" className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-indigo-500" />
          </label>
          <label className="text-sm font-medium text-gray-700">Business Name *
            <input name="businessName" value={form.businessName} onChange={handleChange} required placeholder="Enter business name" className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-indigo-500" />
          </label>
          <label className="text-sm font-medium text-gray-700">Contact Name
            <input name="name" value={form.name} onChange={handleChange} placeholder="Enter contact name" className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-indigo-500" />
          </label>
          <label className="text-sm font-medium text-gray-700">Phone
            <input name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="Enter phone number" className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-indigo-500" />
          </label>
          <label className="text-sm font-medium text-gray-700 sm:col-span-2">Address *
            <input name="address" value={form.address} onChange={handleChange} required placeholder="Enter address" className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-indigo-500" />
          </label>
          <label className="text-sm font-medium text-gray-700 sm:col-span-2">Note
            <textarea name="note" value={form.note} onChange={handleChange} rows="3" placeholder="Enter a note" className="mt-2 w-full resize-none rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-indigo-500" />
          </label>
        </div>
        <div className="mt-6 flex justify-end gap-3 border-t border-gray-200 pt-5">
          <Link to="/suppliers" className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-600">Cancel</Link>
          <button type="submit" disabled={loading || isLoading} className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-wait disabled:opacity-60">
            {isLoading ? "Saving…" : "Save Supplier"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditSupplier;
