import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function CreateCustomer() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ id: "", name: "", phone: "", address: "", note: "" });
  const [error, setError] = useState("");

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      const token = localStorage.getItem("token");
      await axios.post("/api/customers", form, {
        withCredentials: true,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      navigate("/customers");
    } catch (error) {
      setError(error.response?.data?.message || error.response?.data?.error || "Failed to create customer");
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link to="/customers" className="text-sm font-medium text-indigo-600">← Back to customers</Link>
      <h1 className="mt-3 text-2xl font-bold text-gray-800">Create Customer</h1>

      <form onSubmit={handleSubmit} className="mt-6 rounded-xl bg-white p-6 shadow-sm">
        {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-medium text-gray-700">Customer ID *
            <input name="id" value={form.id} onChange={handleChange} required placeholder="C001" className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-indigo-500" />
          </label>

          <label className="text-sm font-medium text-gray-700">Customer Name *
            <input name="name" value={form.name} onChange={handleChange} required placeholder="Enter customer name" className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-indigo-500" />
          </label>

          <label className="text-sm font-medium text-gray-700">Phone
            <input name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="Enter phone number" className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-indigo-500" />
          </label>

          <label className="text-sm font-medium text-gray-700">Address
            <input name="address" value={form.address} onChange={handleChange} placeholder="Enter address" className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-indigo-500" />
          </label>

          <label className="text-sm font-medium text-gray-700 sm:col-span-2">Note
            <textarea name="note" value={form.note} onChange={handleChange} rows="3" placeholder="Enter a note" className="mt-2 w-full resize-none rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-indigo-500" />
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-3 border-t border-gray-200 pt-5">
          <Link to="/customers" className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-600">Cancel</Link>
          <button type="submit" className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white">Create Customer</button>
        </div>
      </form>
    </div>
  );
}

export default CreateCustomer;
