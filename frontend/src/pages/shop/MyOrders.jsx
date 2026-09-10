import { useEffect, useState } from "react";
import api from "../../api";

const money = (value) => `$${Number(value || 0).toFixed(2)}`;

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/store/orders")
      .then((response) => setOrders(response.data?.result || []))
      .catch((requestError) => setError(requestError.response?.data?.message || "Unable to load your orders."))
      .finally(() => setLoading(false));
  }, []);

  return <section className="mx-auto max-w-4xl"><h1 className="text-2xl font-bold text-slate-900">My orders</h1><p className="mt-1 text-sm text-slate-500">Review the orders you have placed.</p>{loading && <p className="mt-6 text-slate-500">Loading orders…</p>}{error && <p className="mt-6 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}{!loading && !error && (orders.length ? <div className="mt-6 space-y-3">{orders.map((order) => <article key={order._id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-wrap justify-between gap-3"><div><strong>{order.orderNumber}</strong><p className="mt-1 text-sm text-slate-500">{new Date(order.createdAt).toLocaleString()}</p></div><div className="text-right"><strong>{money(order.total)}</strong><p className="mt-1 text-sm font-medium capitalize text-indigo-600">{order.status}</p></div></div><p className="mt-4 text-sm text-slate-600">{order.items.map((item) => `${item.name} × ${item.quantity}`).join(", ")}</p></article>)}</div> : <p className="mt-6 rounded-xl bg-white p-6 text-center text-slate-500">You have not placed any orders yet.</p>)}</section>;
}
