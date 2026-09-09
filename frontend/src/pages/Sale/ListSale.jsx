import { useEffect, useState } from "react";
import api from "../../api";
import { FiEdit2, FiEye } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import SalePaymentModal from "./SalePaymentModal";

function Sale() {
  // state variables
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [error, setError] = useState("");

  const [editId, setEditId] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  // useEffect: use for fetching sales from the API
  useEffect(() => {
    async function fetchSales() {
      setLoading(true);
      setError("");
      try {
        const response = await api.get("/sales", {
          params: { page, limit: 10, search: search || undefined },
        });
        setSales(
          Array.isArray(response.data?.result) ? response.data.result : [],
        );
        setTotalPages(response.data?.totalPages || 1);
        setTotalItems(response.data?.totalItems || 0);
      } catch (error) {
        setError(
          error.response?.data?.message ||
            error.response?.data?.error ||
            "Failed to fetch sales from the server.",
        );
      } finally {
        setLoading(false);
      }
    }

    fetchSales();
  }, [page, search]);
  // search handler
  function handleSearch(event) {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  }

  return (
    <div className="category-page rounded-xl bg-white p-6 shadow-sm">
      <SalePaymentModal 
       open={isOpen}
       editId ={editId}
       onPaymentAdded={(updatedSale) => {
         if (!updatedSale) return;
         setSales((current) =>
           current.map((sale) =>
             sale._id === updatedSale._id ? {...sale, ...updatedSale} : sale,
           ),
         );
       }}
      onClose= {() =>
        {
       setIsOpen(false)
        setEditId(null)

        }
      
        }
  
      />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Sale</h1>
        <button
          type="button"
          onClick={() => navigate("/sales/pos")}
          className="primary-button"
        >
          + Add Sale
        </button>
      </div>
      {/* search */}
      <form
        className="mt-6 flex flex-col gap-3 sm:flex-row"
        onSubmit={handleSearch}
      >
        <input
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-indigo-500"
          type="search"
          placeholder="Search by invoice or status"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
        />

        <button
          type="submit"
          className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white"
        >
          Search
        </button>
      </form>
      {/* table */}
      <div className="mt-6 overflow-x-auto">
        {error && (
          <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </p>
        )}
        <table className="w-full min-w-[650px] border-collapse text-left">
          <thead className="bg-gray-50 text-sm text-gray-500">
            <tr>
              {[
                "NO",
                "Invoice",
                "Sale By",
                "Customer",
                "Total Cost",
                "Due Amount",
                "Paid Amount",
                "Change Amount",
                "Payment Status",
                "Sale Date",
                "Actions",
              ].map((title) => (
                <th key={title} className="border-b border-gray-300 px-4 py-3">
                  {title}
                </th>
              ))}
            </tr>
          </thead>
          {/* map */}
          <tbody className="text-sm text-gray-700">
            {sales.map((sale, index) => (
              <tr key={sale._id} className="transition hover:bg-gray-50">
                <td className="border-b border-gray-200 px-4 py-4">{(page - 1) * 10 + index + 1}</td>
                <td className="border-b border-gray-200 px-4 py-4 font-semibold">{sale.invoiceNumber || "—"}</td>
                <td className="border-b border-gray-200 px-4 py-4">{sale.user?.name || "—"}</td>
                <td className="border-b border-gray-200 px-4 py-4">{sale.customer?.name || "—"}</td>
                <td className="border-b border-gray-200 px-4 py-4">$ {Number(sale.totalCost || 0).toLocaleString()}</td>
                <td className="border-b border-gray-200 px-4 py-4">$ {Number(sale.dueAmount || 0).toLocaleString()}</td>
                <td className="border-b border-gray-200 px-4 py-4">$ {Number(sale.paidAmount || 0).toLocaleString()}</td>
                <td className="border-b border-gray-200 px-4 py-4">$ {Number(sale.changeAmount || 0).toLocaleString()}</td>
                <td className="border-b border-gray-200 px-4 py-4">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${sale.paymentStatus === "completed" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                    {sale.paymentStatus || "—"}
                  </span>
                </td>
                <td className="border-b border-gray-200 px-4 py-4">
                  {sale.saleDate
                    ? new Date(sale.saleDate).toLocaleDateString()
                    : "—"}
                </td>
                <td className="border-b border-gray-200 px-4 py-4">
                  {/* icon buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditId(sale._id);
                        setIsOpen(true);
                      }}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg
                 text-blue-600 transition hover:bg-blue-50
                 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      aria-label={`Add payment to invoice ${sale.invoiceNumber}`}
                      title="Add payment"
                    >
                      <FiEdit2 size={17} aria-hidden="true" />
                    </button>

                    <button
                      type="button"
                      onClick={() => navigate("/invoice", { state: { sale } })}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg
                 text-emerald-600 transition hover:bg-emerald-50
                 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      aria-label={`View invoice ${sale.invoiceNumber}`}
                      title="View invoice"
                    >
                      <FiEye size={18} aria-hidden="true" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {/* loading and no purchases found messages */}
            {!loading && sales.length === 0 && (
              <tr>
                <td
                  colSpan={11}
                  className="px-4 py-8 text-center text-gray-500"
                >
                  No sales found
                </td>
              </tr>
            )}
            {loading && (
              <tr>
                <td
                  colSpan={11}
                  className="px-4 py-8 text-center text-gray-500"
                >
                  Loading Sales...
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination controls */}
        {!loading && totalItems > 0 && (
          <div className="mt-4 flex flex-col items-center justify-between gap-3 border-t border-gray-200 pt-4 sm:flex-row">
            <span className="text-sm text-gray-500">
              Showing {(page - 1) * 10 + 1}–{Math.min(page * 10, totalItems)} of{" "}
              {totalItems}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button" 
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:opacity-40"
                onClick={() => setPage((current) => current - 1)}
                disabled={page === 1}
              >
                Previous
              </button>
              <span className="px-2 text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:opacity-40"
                onClick={() => setPage((current) => current + 1)}
                disabled={page >= totalPages}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Sale;
