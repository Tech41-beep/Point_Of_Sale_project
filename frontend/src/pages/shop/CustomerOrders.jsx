import { useEffect, useState } from "react";
import api from "../../api";

const money = (value) => `$ ${Number(value || 0).toLocaleString()}`;

function CustomerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchOrders() {
      setLoading(true);
      setError("");
      try {
        const response = await api.get("/store/orders/all");
        setOrders(Array.isArray(response.data?.result) ? response.data.result : []);
      } catch (requestError) {
        setError(
          requestError.response?.data?.message ||
            "Failed to fetch customer orders from the server.",
        );
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, []);

  return (
    <div className="category-page rounded-xl bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Customer Orders</h1>
          <p className="mt-1 text-sm text-gray-500">
            Orders placed by customers from the store.
          </p>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto">
        {error && (
          <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </p>
        )}
        <table className="w-full min-w-212.5 border-collapse text-left">
          <thead className="bg-gray-50 text-sm text-gray-500">
            <tr>
              {["NO", "Order", "Customer", "Items", "Total", "Status", "Order Date"].map(
                (title) => (
                  <th key={title} className="border-b border-gray-300 px-4 py-3">
                    {title}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody className="text-sm text-gray-700">
            {orders.map((order, index) => (
              <tr key={order._id} className="transition hover:bg-gray-50">
                <td className="border-b border-gray-200 px-4 py-4">{index + 1}</td>
                <td className="border-b border-gray-200 px-4 py-4 font-semibold">
                  {order.orderNumber || "—"}
                </td>
                <td className="border-b border-gray-200 px-4 py-4">
                  <div>{order.customer?.name || "—"}</div>
                  <div className="text-xs text-gray-500">{order.customer?.email || ""}</div>
                </td>
                <td className="max-w-70 border-b border-gray-200 px-4 py-4">
                  {order.items?.map((item) => `${item.name} × ${item.quantity}`).join(", ") || "—"}
                </td>
                <td className="border-b border-gray-200 px-4 py-4 font-semibold">
                  {money(order.total)}
                </td>
                <td className="border-b border-gray-200 px-4 py-4">
                  <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-semibold capitalize text-indigo-700">
                    {order.status || "placed"}
                  </span>
                </td>
                <td className="border-b border-gray-200 px-4 py-4">
                  {order.createdAt ? new Date(order.createdAt).toLocaleString() : "—"}
                </td>
              </tr>
            ))}
            {!loading && orders.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  No customer orders found
                </td>
              </tr>
            )}
            {loading && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  Loading customer orders...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CustomerOrders;
