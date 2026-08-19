import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api";

function Customers() {
  // state variables
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState("");


 // useEffect: use for fetching customers from the API
  useEffect(() => {
    async function fetchCustomers() {
      setLoading(true);
      setError("");
      try {
        const response = await api.get("/customers", {
          params: { page, limit: 10, search: search || undefined },
        });
        setCustomers(Array.isArray(response.data?.result) ? response.data.result : []);
        setTotalPages(response.data?.totalPages || 1);
        setTotalItems(response.data?.totalItems || 0);
      } catch (error) {
        setError(error.response?.data?.message || error.response?.data?.error || "Failed to fetch customers");
      } finally {
        setLoading(false);
      }
    }

    fetchCustomers();
  }, [page, search]);
  
    function CreateCustomer(){
      const [id,setId] = useState("");
      const [name,setName] = useState("");
      const [phone,setPhone] = useState("");
      const [address,setAddress] = useState("");
      const [note,setNote] = useState("");

    }
  
  // search handler
  function handleSearch(event) {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  }

//delete handler
  async function handleDelete(customer) {
    if (!window.confirm(`Delete customer "${customer.name}"?`)) return;

    setError("");
    setDeletingId(customer._id);
    try {
      await api.delete(`/customers/${customer._id}`);
      setCustomers((current) => current.filter((item) => item._id !== customer._id));
      setTotalItems((current) => Math.max(0, current - 1));
      if (customers.length === 1 && page > 1) setPage((current) => current - 1);
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.response?.data?.error || "Failed to delete customer");
    } finally {
      setDeletingId("");
    }
  }

  return (

    <div className="customer-page rounded-xl bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Customers</h1>
        <Link className="primary-button" to="/customers/add">+ Add Customer</Link>
      </div>
    {/* search */}
      <form className="mt-6 flex flex-col gap-3 sm:flex-row" onSubmit={handleSearch}>
        <input
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-indigo-500"
          type="search"
          placeholder="Search by ID, name, phone, address or note"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
        />

        <button type="submit" className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white">
          Search
        </button>
      </form>
      {/* table */}
      <div className="mt-6 overflow-x-auto">
        {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}
        <table className="w-full min-w-[650px] border-collapse text-left">
          <thead className="bg-gray-50 text-sm text-gray-500">
            <tr>
              {['Customer ID', 'Customer Name', 'Phone', 'Address', 'Note', 'Actions'].map((title) => (
                <th key={title} className="border-b border-gray-300 px-4 py-3">{title}</th>
              ))}
            </tr>
          </thead>
          {/* map */}
          <tbody className="text-sm text-gray-700">
            {customers.map((customer) => (
              <tr key={customer._id || customer.id}>
                <td className="border-b border-gray-300 px-4 py-4 font-semibold">{customer.id}</td>
                <td className="border-b border-gray-300 px-4 py-4">{customer.name}</td>
                <td className="border-b border-gray-300 px-4 py-4">{customer.phone}</td>
                <td className="border-b border-gray-300 px-4 py-4">{customer.address}</td>
                <td className="border-b border-gray-300 px-4 py-4">{customer.note}</td>
                <td className="border-b border-gray-300 px-4 py-4">
                  <button
                    type="button"
                    className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-wait disabled:opacity-60"
                    onClick={() => handleDelete(customer)}
                    disabled={deletingId === customer._id}
                  >
                    {deletingId === customer._id ? "Deleting…" : "Delete"}
                  </button>
                </td>
              </tr>
            ))}
            {/* loading and no customers found messages */}
            {!loading && customers.length === 0 && (
              <tr>
                <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                  No customers found</td>
              </tr>
            )}
            {loading && (
              <tr>
                <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                  Loading customers...
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination controls */}
        {!loading && totalItems > 0 && <div className="mt-4 flex flex-col items-center justify-between gap-3 border-t border-gray-200 pt-4 sm:flex-row">
          <span className="text-sm text-gray-500">
            Showing {(page - 1) * 10 + 1}–{Math.min(page * 10, totalItems)} of {totalItems}
          </span>
          <div className="flex items-center gap-2">
            <button type="button" className="rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:opacity-40" onClick={() => setPage((current) => current - 1)} disabled={page === 1}>
              Previous
            </button>
            <span className="px-2 text-sm text-gray-600">Page {page} of {totalPages}</span>
            <button type="button" className="rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:opacity-40" onClick={() => setPage((current) => current + 1)} disabled={page >= totalPages}>
              Next
            </button>
          </div>
        </div>}
      </div>
    </div>
  );
}

export default Customers;
