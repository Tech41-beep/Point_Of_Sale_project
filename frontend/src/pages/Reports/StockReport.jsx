import { useState } from "react";
import { useStockReport } from "../../auth/hooks/useStockReport";

const formatMoney = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(value || 0));

export default function StockReport() {
  const { fetchReport, isLoading } = useStockReport();

  const [qty, setQty] = useState("0");
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const [data , setData] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    setHasSearched(true);
    setProducts([]);

    try {
      const data = await fetchReport(Number(qty));

      setProducts(Array.isArray(data.result) ? data.result : []);
      setData(data);
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to fetch the stock report.",
      );
    }
  }

  return (
    <div className="rounded-xl  bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-bold text-gray-800">Stock Report</h1>

      <form
        onSubmit={handleSubmit}
        className="mt-6 flex flex-wrap items-end gap-4"
      >
        <label className="flex flex-col gap-1 text-sm">
          Maximum stock quantity
          <input
            type="number"
            min="0"
            step="any"
            required
            value={qty}
            onChange={(event) => setQty(event.target.value)}
            className="rounded-lg border px-3 py-2"
          />
        </label>

        <button
          type="submit"
          disabled={isLoading}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-white disabled:opacity-50"
        >
          {isLoading ? "Loading..." : "Generate report"}
        </button>
      </form>

      {error && (
        <p role="alert" className="mt-4 text-red-600">
          {error}
        </p>
      )}

      {isLoading && (
        <p role="status" className="mt-4">
          Loading stock...
        </p>
      )}

      {!isLoading && !error && hasSearched && (
        <>
          <p className="mt-6 font-semibold">
            Total products: {products.length}
          </p>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr>
                  {[
                    "No",
                    "Product",
                    "Code",
                    "Stock Quantity",
                    "Cost Price",
                    "Sale Price",
                  ].map((title) => (
                    <th key={title} className="border-b px-4 py-3">
                      {title}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {products.map((product, index) => (
                  <tr key={product._id}>
                    <td className="border-b px-4 py-3">{index + 1}</td>
                    <td className="border-b px-4 py-3">
                      {product.name || "—"}
                    </td>
                    <td className="border-b px-4 py-3">
                      {product.code || "—"}
                    </td>
                    <td className="border-b px-4 py-3">
                      {product.currentStockQuantity ?? 0}
                    </td>
                    <td className="border-b px-4 py-3">
                      {formatMoney(product.costPrice)}
                    </td>
                    <td className="border-b px-4 py-3">
                      {formatMoney(product.salePrice)}
                    </td>
                  </tr>
                ))}

                {products.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      No products found at or below this stock quantity.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
