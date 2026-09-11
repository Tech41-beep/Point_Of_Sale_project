import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import "../../../index.css";
import { useFindCustomerById } from "../../auth/hooks/use.findById";
const formatMoney = (value) =>
  Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

function Invoice() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sale = location.state?.sale;
  const saleId = sale?._id || searchParams.get("saleId");
  const { data, loading, error } = useFindCustomerById("sales", saleId);
  const invoice = data || sale;
  if (!invoice && loading) {
    return <p className="mx-auto max-w-md p-6 text-center">Loading invoice...</p>;
  }

  if (!invoice) {
    return (
      <div className="mx-auto max-w-md rounded-xl border border-amber-200 bg-amber-50 p-6 text-center">
        <h1 className="text-lg font-bold text-amber-900">
          Invoice not selected
        </h1>
        <p className="mt-2 text-sm text-amber-700">
          {error || "Open an invoice from the sales list using the eye icon."}
        </p>
        <button
          type="button"
          onClick={() => navigate("/sales")}
          className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
        >
          Back to sales
        </button>
      </div>
    );
  }

  const items = Array.isArray(invoice?.items) ? invoice.items : [];
  const isPaid = invoice?.paymentStatus?.toLowerCase() === "completed";

  return (
    <div   id="invoice-print-area"
  className="mx-auto w-full max-w-[100mm] overflow-hidden rounded-2xl
             border border-slate-200 bg-white text-slate-800 shadow-xl
             print:rounded-none print:border-0 print:shadow-none">
      <header className="bg-slate-900 px-6 py-6 text-white">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-300">
              Point of Sale
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight">Invoice</h1>
          </div>
          <div className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider">
            {isPaid ? "Paid" : "Pending"}
          </div>
        </div>
      </header>

      <main className="px-6 py-5 text-sm">
        <section className="flex items-start justify-between gap-4 border-b border-dashed border-slate-300 pb-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
              Receipt
            </p>
            <p className="mt-1 font-semibold text-slate-900">
              Thank you for your purchase
            </p>
          </div>
          <div className="text-right text-xs leading-5 text-slate-500">
            <p>
              <span className="block text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                Invoice number
              </span>
              <span className="font-semibold text-slate-900">
                {invoice?.invoiceNumber || "—"}
              </span>
            </p>
            <p className="mt-2">
              <span className="block text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                Date
              </span>
              <span className="text-slate-700">
                {invoice?.saleDate
                  ? new Date(invoice.saleDate).toLocaleDateString()
                  : "—"}
              </span>
            </p>
          </div>
        </section>

        <section className="border-b border-dashed border-slate-300 py-4">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
            Customer information
          </h2>
          <p className="mt-2 font-semibold text-slate-900">
            {invoice?.customer?.name || "Walk-in customer"}
          </p>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            {invoice?.customer?.phone || "No phone provided"}
          </p>
          {invoice?.customer?.address && (
            <p className="text-xs leading-5 text-slate-500">
              {invoice?.customer.address}
            </p>
          )}
        </section>

        <section className="py-4">
          <h2 className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
            Items
          </h2>
          <div className="overflow-hidden rounded-lg border border-slate-200">
            <table className="w-full border-collapse text-left text-xs">
              <thead className="bg-slate-50 text-[9px] uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-3 py-2.5 font-semibold">Item</th>
                  <th className="px-2 py-2.5 text-center font-semibold">Qty</th>
                  <th className="px-2 py-2.5 text-right font-semibold">
                    Price
                  </th>
                  <th className="px-3 py-2.5 text-right font-semibold">
                    Total
                  </th>
                </tr>
              </thead>
              {/* // map table rows */}
              <tbody className="divide-y divide-slate-100">
                {items.map((item, index) => (
                  <tr key={item._id || index}>
                    <td className="px-3 py-3 font-medium text-slate-800">
                      {item.product?.name || "Product"}
                    </td>
                    <td className="px-2 py-3 text-center text-slate-500">
                      {item.quantity || 0}
                    </td>
                    <td className="px-2 py-3 text-right text-slate-500">
                      ${formatMoney(item.price)}
                    </td>
                    <td className="px-3 py-3 text-right font-semibold text-slate-800">
                      $
                      {formatMoney(
                        Number(item.price || 0) * Number(item.quantity || 0),
                      )}
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-3 py-5 text-center text-slate-400"
                    >
                      No items available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="ml-[90px] justify-center  w-44 border-t border-slate-200 pt-3 text-xs">
          <div className="flex justify-between py-1 text-slate-500">
            <span>Paid</span>
            <span className="font-medium text-slate-700">
              ${formatMoney(invoice?.paidAmount)}
            </span>
          </div>
          <div className="flex justify-between py-1 text-slate-500">
            <span>Due</span>
            <span className="font-medium text-slate-700">
              ${formatMoney(invoice?.dueAmount)}
            </span>
          </div>
          <div className="flex justify-between py-1 text-slate-500">
            <span>Change</span>
            <span className="font-medium text-slate-700">
              ${formatMoney(invoice?.changeAmount)}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between rounded-lg bg-slate-900 px-3 py-2.5 text-white">
            <span className="font-semibold">Total</span>
            <span className="text-base font-bold">
              ${formatMoney(invoice?.totalCost)}
            </span>
          </div>
        </section>
        <div className="mt-4 flex justify-center gap-3 print:hidden">
  <button
    type="button"
    onClick={() => window.print()}
    className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
  >
    Print
  </button>

  <button
    type="button"
    onClick={() => navigate("/sales")}
    className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-600"
  >
    ← Back
  </button>
</div>

        <footer className="mt-6 border-t border-dashed border-slate-300 pt-5 text-center">
          <p className="font-semibold text-slate-800">
            Thank you for your business!
          </p>
          <p className="mx-auto mt-2 max-w-[230px] text-[10px] leading-4 text-slate-400">
            This is a computer-generated receipt and does not require a
            signature.
          </p>
     
          <button
            type="button"
            onClick={() => navigate("/sales")}
            className="mt-4 text-xs font-semibold text-slate-500 hover:text-slate-900 print:hidden"
          >
            ← Back to sales
          </button>
        </footer>
      </main>
    </div>
  );
}

export default Invoice;
