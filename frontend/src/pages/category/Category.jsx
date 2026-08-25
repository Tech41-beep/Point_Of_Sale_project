import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api";
function Category() {
  // state variables
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState("");
  const [categoryToDelete, setCategoryToDelete] = useState(null);


 // useEffect: use for fetching categories from the API
  useEffect(() => {
    async function fetchCategories() {
      setLoading(true);
      setError("");
      try {
        const response = await api.get("/categories", {
          params: { page, limit: 10, search: search || undefined },
        });
        setCategories(Array.isArray(response.data?.result) ? response.data.result : []);
        setTotalPages(response.data?.totalPages || 1);
        setTotalItems(response.data?.totalItems || 0);
      } catch (error) {
        setError(error.response?.data?.message || error.response?.data?.error || "Failed to fetch categories");
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, [page, search]);
  // search handler
  function handleSearch(event) {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  }

//delete handler
  async function handleDelete() {
    if (!categoryToDelete) return;

    const category = categoryToDelete;
    setError("");
    setDeletingId(category._id);
    try {
      await api.delete(`/categories/${category._id}`);
      setCategories((current) => current.filter((item) => item._id !== category._id));
      setTotalItems((current) => Math.max(0, current - 1));
      setCategoryToDelete(null);
      if (categories.length === 1 && page > 1) 
        setPage((current) => current - 1);
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.response?.data?.error || "Failed to delete category");
    } finally {
      setDeletingId("");
    }
  }

  return (

    <div className="category-page rounded-xl bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Categories</h1>
        <Link className="primary-button" to="/categories/add">+ Add Category</Link>
      </div>
    {/* search */}
      <form className="mt-6 flex flex-col gap-3 sm:flex-row" onSubmit={handleSearch}>
        <input
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-indigo-500"
          type="search"
          placeholder="Search by ID, name or note"
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
              {['Category ID', 'Category Name', 'Note', 'Actions'].map((title) => (
                <th key={title} className="border-b border-gray-300 px-4 py-3">{title}</th>
              ))}
            </tr>
          </thead>
          {/* map */}
          <tbody className="text-sm text-gray-700">
            {categories.map((category) => (
              <tr key={category._id || category.id}>
                <td className="border-b border-gray-300 px-4 py-4 font-semibold">{category.id}</td>
                <td className="border-b border-gray-300 px-4 py-4">{category.name}</td>
                <td className="border-b border-gray-300 px-4 py-4">{category.note}</td>
                <td className="border-b border-gray-300 px-4 py-4">
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/categories/edit/${category._id}`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 transition-colors hover:border-indigo-300 hover:bg-indigo-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                      aria-label={`Edit ${category.name}`}
                    >
                      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z" />
                      </svg>
                      Edit
                    </Link>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition-colors hover:border-red-300 hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      onClick={() => setCategoryToDelete(category)}
                      disabled={deletingId === category._id}
                      aria-label={`Delete ${category.name}`}
                    >
                      {deletingId === category._id ? (
                        <>
                          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 animate-spin fill-none stroke-current" strokeWidth="2" strokeLinecap="round">
                            <path d="M21 12a9 9 0 1 1-6.22-8.56" />
                          </svg>
                          Deleting…
                        </>
                      ) : (
                        <>
                          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
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
            {/* loading and no categories found messages */}
            {!loading && categories.length === 0 && (
              <tr>
                <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                  No categories found</td>
              </tr>
            )}
            {loading && (
              <tr>
                <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                  Loading categories...
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
            <button type  ="button" className="rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:opacity-40" onClick={() => setPage((current) => current + 1)} disabled={page >= totalPages}>
              Next
            </button>
          </div>
        </div>}
      </div>

      {categoryToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-[2px]"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !deletingId) setCategoryToDelete(null);
          }}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-black/5"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-category-title"
            aria-describedby="delete-category-description"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 9v4M12 17h.01" />
                  <path d="M10.3 3.7 2.5 17.2A2 2 0 0 0 4.2 20h15.6a2 2 0 0 0 1.7-2.8L13.7 3.7a2 2 0 0 0-3.4 0Z" />
                </svg>
              </div>
              <div>
                <h2 id="delete-category-title" className="text-lg font-bold text-gray-900">Delete category?</h2>
                <p id="delete-category-description" className="mt-2 text-sm leading-6 text-gray-500">
                  You are about to permanently delete <span className="font-semibold text-gray-700">{categoryToDelete.name}</span>. This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => setCategoryToDelete(null)}
                disabled={Boolean(deletingId)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="inline-flex min-w-36 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                onClick={handleDelete}
                disabled={Boolean(deletingId)}
              >
                {deletingId ? (
                  <>
                    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 animate-spin fill-none stroke-current" strokeWidth="2" strokeLinecap="round">
                      <path d="M21 12a9 9 0 1 1-6.22-8.56" />
                    </svg>
                    Deleting…
                  </>
                ) : "Delete category"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Category;
