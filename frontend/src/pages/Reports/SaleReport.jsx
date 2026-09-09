import { useState } from "react";
import { useSaleReport } from "../../auth/hooks/userSaleReport.";

const formatMoney = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(value || 0));

export default function SaleReport() {
  const { fetchReport, isLoading } = useSaleReport();

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sales, setSales] = useState([]);
  const [totalSales, setTotalSales] = useState(0);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  async function fetchData() {
    const data = await fetchReport(startDate, endDate);
    setSales(Array.isArray(data.result) ? data.result : []);
    setTotalSales(data.totalSales ?? 0);
  }
  function handleFilterChange(event) {
    const { name, value } = event.target;
    if (name === "startDate") {
      setStartDate(value);
    } else if (name === "endDate") {
      setEndDate(value);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!startDate || !endDate || startDate > endDate) {
      setError("Choose a valid date range.");
      return;
    }

    setHasSearched(true);
    setSales([]);
    setTotalSales(0);

    try {
      const data = await fetchReport(startDate, endDate);

      setSales(Array.isArray(data.result) ? data.result : []);
      setTotalSales(data.totalSales ?? 0);
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to fetch the sales report.",
      );
    }
  }

  return (
    <div className="rounded-xl  bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-bold text-gray-800">Sales Report</h1>

      <form
        onSubmit={handleSubmit}
        className="mt-6 flex flex-wrap items-end gap-4"
      >
        <input
          type="date"
          value={startDate}
          onChange={(event) => setStartDate(event.target.value)}
        />

        <input
          type="date"
          value={endDate}
          onChange={(event) => setEndDate(event.target.value)}
        />

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
          Loading sales...
        </p>
      )}

      {!isLoading && !error && hasSearched && (
        <>
          <p className="mt-6 font-semibold">
            Total sales: {formatMoney(totalSales)}
          </p>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr>
                  {[
                    "No",
                    "Invoice",
                    "Sale By",
                    "Customer",
                    "Total Cost",
                    "Payment Status",
                  ].map((title) => (
                    <th key={title} className="border-b px-4 py-3">
                      {title}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {sales.map((sale, index) => (
                  <tr key={sale._id}>
                    <td className="border-b px-4 py-3">{index + 1}</td>
                    <td className="border-b px-4 py-3">
                      {sale.invoiceNumber || "—"}
                    </td>
                    <td className="border-b px-4 py-3">
                      {sale.user?.name || "—"}
                    </td>
                    <td className="border-b px-4 py-3">
                      {sale.customer?.name || "—"}
                    </td>
                    <td className="border-b px-4 py-3">
                      {formatMoney(sale.totalCost)}
                    </td>
                    <td className="border-b px-4 py-3">
                      {sale.paymentStatus || "—"}
                    </td>
                  </tr>
                ))}

                {sales.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      No sales found for this date range.
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
