import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Customers() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    async function fetchCustomers() {
      try {
        const response = await axios.get("/api/customers");
        if (!response.ok) {
          throw new Error("Failed to fetch customers");
        }
        const data = await response.json();
        setCustomers(Array.isArray(data) ? data : data.customers || []);
      } catch (error) {
        console.error("Error fetching customers:", error);
      }
    }

    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter((customer) => {
    const text = search.toLowerCase();
    const matchesSearch =
      (customer.name || "").toLowerCase().includes(text) ||
      (customer.job || "").toLowerCase().includes(text) ||
      (customer.email || "").toLowerCase().includes(text) ||
      (customer.phone || "").includes(text);
    const matchesStatus =
      status === "all" || (customer.status || "").toLowerCase() === status;

    return matchesSearch && matchesStatus;
  });

  function handleSearch(event) {
    event.preventDefault();
    setSearch(searchInput.trim());
  }

  return (
    <div className="customer-page rounded-xl bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Customers</h1>
        <Link className="primary-button" to="/customers/add">+ Add Customer</Link>
      </div>

      <form className="mt-6 flex flex-col gap-3 sm:flex-row" onSubmit={handleSearch}>
        <select
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
        >
          <option value="all">All Customers</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        <input
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-indigo-500"
          type="search"
          placeholder="Search by name, job, email or phone"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
        />

        <button type="submit" className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white">
          Search
        </button>
      </form>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[650px] border-collapse text-left">
          <thead className="bg-gray-50 text-sm text-gray-500">
            <tr>
              {['Customer Name', 'Job', 'Email', 'Phone', 'Status'].map((title) => (
                <th key={title} className="border-b border-gray-300 px-4 py-3">{title}</th>
              ))}
            </tr>
          </thead>
          <tbody className="text-sm text-gray-700">
            {filteredCustomers.map((customer) => (
              <tr key={customer.email}>
                <td className="border-b border-gray-300 px-4 py-4 font-semibold">{customer.name}</td>
                <td className="border-b border-gray-300 px-4 py-4">{customer.job}</td>
                <td className="border-b border-gray-300 px-4 py-4">{customer.email}</td>
                <td className="border-b border-gray-300 px-4 py-4">{customer.phone}</td>
                <td className={`border-b border-gray-300 px-4 py-4 ${customer.status === "Active" ? "text-green-600" : "text-red-500"}`}>
                  {customer.status}
                </td>
              </tr>
            ))}

            {filteredCustomers.length === 0 && (
              <tr>
                <td colSpan="5" className="px-4 py-8 text-center text-gray-500">No customers found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Customers;
