import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api";
import Modal from "../../components/Modal";
function Purchase() {
  // state variables
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState("");
  const [purchaseToDelete, setPurchaseToDelete] = useState(null);

  // useEffect: use for fetching purchases from the API
  useEffect(() => {
    async function fetchPurchases() {
      setLoading(true);
      setError("");
      try {
        const response = await api.get("/purchases", {
          params: { page, limit: 10, search: search || undefined },
        });
        setPurchases(
          Array.isArray(response.data?.result) ? response.data.result : [],
        );
        setTotalPages(response.data?.totalPages || 1);
        setTotalItems(response.data?.totalItems || 0);
        setLoading(false);
      } catch (error) {
        setError(
          error.response?.data?.message ||
            error.response?.data?.error ||
            "Failed to fetch purchases from the server.",
        );
      } finally {
        setLoading(false);
      }
    }

    fetchPurchases();
  }, [page, search]);
  // search handler
  function handleSearch(event) {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  }

  //delete handler
  async function handleDelete() {
    if (!purchaseToDelete) return;

    const purchase = purchaseToDelete;
    setError("");
    setDeletingId(purchase._id);
    try {
      await api.delete(`/purchases/${purchase._id}`);
      setPurchases((current) =>
        current.filter((item) => item._id !== purchase._id),
      );
      setTotalItems((current) => Math.max(0, current - 1));
      setPurchaseToDelete(null);
      if (purchases.length === 1 && page > 1) setPage((current) => current - 1);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          requestError.response?.data?.error ||
          "Failed to delete purchase",
      );
    } finally {
      setDeletingId("");
    }
  }

  return (
    <div className="category-page rounded-xl bg-white p-6 shadow-sm">
      <Modal
        open={Boolean(purchaseToDelete)}
        onClose={() => setPurchaseToDelete(null)}
        title="Delete purchase?"
          titleClassName="text-black"
      >
        {/* Confirmation content */}
        <p className="text-sm text-black/80">
          Are you sure you want to delete{" "}
          <strong className="text-black">{purchaseToDelete?.invoiceNumber}</strong>?
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => setPurchaseToDelete(null)}
            className=" hover:bg-gray-100 rounded-lg border border-gray-300 px-4 py-2 text-black disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleDelete}
            className="rounded-lg hover:bg-red-800 bg-red-600 px-4 py-2 text-white disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      </Modal>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Purchases</h1>
        <Link className="primary-button" to="/purchases/add">
          + Add Purchase
        </Link>
      </div>
      {/* search */}
      <form
        className="mt-6 flex flex-col gap-3 sm:flex-row"
        onSubmit={handleSearch}
      >
        <input
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-indigo-500"
          type="search"
          placeholder="Search by ID, name or note"
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
                "Invoice",
                "Supplier",
                "Purchased By",
                "Total Cost",
                "Due Amount",
                "Change Amount",
                "Payment Status",
                "Purchase Status",
                "Purchase Date",
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
            {purchases.map((purchase) => (
              <tr key={purchase._id || purchase.id}>
                <td className="border-b border-gray-300 px-4 py-4 font-semibold">
                  {purchase.invoiceNumber || "—"}
                </td>
                <td className="border-b border-gray-300 px-4 py-4">
                  {purchase.supplier?.businessName ||
                    purchase.supplier?.name ||
                    "—"}
                </td>
                <td className="border-b border-gray-300 px-4 py-4">
                  {purchase.user?.name || "—"}
                </td>
                <td className="border-b text-red-600 font-semibold border-gray-300 px-4 py-4">
                  $ {Number(purchase.totalCost || 0).toLocaleString()}
                </td>
                <td className="border-b  text-red-600 font-semibold border-gray-300 px-4 py-4">
                  $ {Number(purchase.dueAmount || 0).toLocaleString()}
                </td>
                <td className="border-b  text-red-600 font-semibold border-gray-300 px-4 py-4">
                  $ {Number(purchase.changeAmount || 0).toLocaleString()}
                </td>
                <td className="border-b text-blue-600 font-semibold border-gray-300 px-4 py-4">
                  {purchase.paymentStatus || "—"}
                </td>
                <td className="border-b border-gray-300 px-4 py-4">
                  <span
                    className={`${
                      purchase.purchaseStatus?.toLowerCase() === "completed"
                        ? "text-green-500"
                        : purchase.purchaseStatus?.toLowerCase() === "received"
                          ? "text-red-500"
                          : "text-gray-500"
                    }`}
                  >
                    {purchase.purchaseStatus || "—"}
                  </span>
                </td>
                <td className="border-b border-gray-300 px-4 py-4">
                  {purchase.purchaseDate
                    ? new Date(purchase.purchaseDate).toLocaleDateString()
                    : "—"}
                </td>
                <td className="border-b border-gray-300 px-4 py-4">
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/purchases/edit/${purchase._id}`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 transition-colors hover:border-indigo-300 hover:bg-indigo-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                      aria-label={`Edit ${purchase.supplier}`}
                    >
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        className="h-4 w-4 fill-none stroke-current"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z" />
                      </svg>
                      Edit
                    </Link>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition-colors hover:border-red-300 hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      onClick={() => setPurchaseToDelete(purchase)}
                      disabled={deletingId === purchase._id}
                      aria-label={`Delete ${purchase.supplier}`}
                    >
                      {deletingId === purchase._id ? (
                        <>
                          <svg
                            aria-hidden="true"
                            viewBox="0 0 24 24"
                            className="h-4 w-4 animate-spin fill-none stroke-current"
                            strokeWidth="2"
                            strokeLinecap="round"
                          >
                            <path d="M21 12a9 9 0 1 1-6.22-8.56" />
                          </svg>
                          Deleting…
                        </>
                      ) : (
                        <>
                          <svg
                            aria-hidden="true"
                            viewBox="0 0 24 24"
                            className="h-4 w-4 fill-none stroke-current"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M3 6h18" />
                            <path d="M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v5M14 11v5" />
                          </svg>
                          Delete
                        </>
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {/* loading and no purchases found messages */}
            {!loading && purchases.length === 0 && (
              <tr>
                <td
                  colSpan="10"
                  className="px-4 py-8 text-center text-gray-500"
                >
                  No purchases found
                </td>
              </tr>
            )}
            {loading && (
              <tr>
                <td
                  colSpan="10"
                  className="px-4 py-8 text-center text-gray-500"
                >
                  Loading purchases...
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

export default Purchase;
