import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../api";

const money = (value) => `$${Number(value || 0).toFixed(2)}`;

export default function Storefront() {
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState("shop");
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const load = async () => {
    setLoading(true);
    try {
      const [productResponse, orderResponse] = await Promise.all([
        api.get("/store/products", { params: { limit: 25 } }),
        api.get("/store/orders"),
      ]);
      setProducts(productResponse.data.result || []);
      setOrders(orderResponse.data.result || []);
    } catch {
      toast.error("Unable to load the store.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);
  const categories = useMemo(
    () => [...new Set(products.map((p) => p.category?.name).filter(Boolean))],
    [products],
  );
  const visible = products.filter(
    (p) =>
      (!category || p.category?.name === category) &&
      `${p.name} ${p.code || ""}`.toLowerCase().includes(query.toLowerCase()),
  );
  const total = cart.reduce(
    (sum, item) => sum + item.salePrice * item.quantity,
    0,
  );
  const add = (product) =>
    setCart((current) => {
      const found = current.find((item) => item._id === product._id);
      if (found)
        return current.map((item) =>
          item._id === product._id
            ? {
                ...item,
                quantity: Math.min(
                  item.quantity + 1,
                  product.currentStockQuantity,
                ),
              }
            : item,
        );
      return [...current, { ...product, quantity: 1 }];
    });
  const change = (id, amount) =>
    setCart((current) =>
      current
        .map((item) =>
          item._id === id
            ? { ...item, quantity: item.quantity + amount }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  async function checkout() {
    if (!cart.length) return;
    setPlacing(true);
    try {
      const response = await api.post("/store/orders", {
        items: cart.map((item) => ({
          productId: item._id,
          quantity: item.quantity,
        })),
      });
      setOrders((current) => [response.data.result, ...current]);
      setCart([]);
      toast.success(`Order ${response.data.result.orderNumber} placed.`);
      await load();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to place order.");
    } finally {
      setPlacing(false);
    }
  }
  return (
    <>
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-20 flex flex-wrap items-center gap-4 border-b bg-white px-5 py-4 shadow-sm">
        <Link to="/shop" className="text-xl font-bold text-indigo-600">
          PointFlow <span className="text-slate-800">Shop</span>
        </Link>
        <nav className="ml-auto flex items-center gap-2 text-sm font-semibold">
          <button
            onClick={() => setTab("shop")}
            className={
              tab === "shop"
                ? "rounded-lg bg-indigo-600 px-3 py-2 text-white"
                : "px-3 py-2"
            }
          >
            Products
          </button>
          <button
            onClick={() => setTab("orders")}
            className={
              tab === "orders"
                ? "rounded-lg bg-indigo-600 px-3 py-2 text-white"
                : "px-3 py-2"
            }
          >
            My orders
          </button>
        </nav>
      </header>
      <div className="mx-auto grid max-w-7xl gap-6 p-5 lg:grid-cols-[1fr_330px]">
        {tab === "shop" ? (
          <section>
            <div className="mb-5 flex flex-wrap gap-3">
              <input
                className="min-w-[220px] flex-1 rounded-xl border bg-white px-4 py-3 outline-none focus:border-indigo-500"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products…"
              />{" "}
              <select
                className="rounded-xl border bg-white px-3"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">All categories</option>
                {categories.map((name) => (
                  <option key={name}>{name}</option>
                ))}
              </select>
            </div>
            {loading ? (
              <p>Loading products…</p>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {visible.map((product) => (
                  <article
                    key={product._id}
                    className="rounded-2xl border bg-white p-4 shadow-sm"
                  >
                    <div className="mb-4 grid h-44 place-items-center overflow-hidden rounded-xl bg-slate-50 p-4 text-4xl">
                      {product.imageUrl ? (
                        <img
                          className="h-full w-full object-contain"
                          src={product.imageUrl}
                          alt={product.name}
                        />
                      ) : (
                        "📦"
                      )}
                    </div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
                      {product.category?.name || "Product"}
                    </p>
                    <h2 className="mt-1 font-bold">{product.name}</h2>
                    <p className="mt-2 text-lg font-bold">
                      {money(product.salePrice)}
                    </p>
                    <p
                      className={
                        product.currentStockQuantity
                          ? "text-sm text-emerald-600"
                          : "text-sm text-rose-600"
                      }
                    >
                      {product.currentStockQuantity
                        ? `${product.currentStockQuantity} in stock`
                        : "Out of stock"}
                    </p>
                    <button
                      disabled={!product.currentStockQuantity}
                      onClick={() => add(product)}
                      className="mt-3 w-full rounded-lg bg-indigo-600 px-3 py-2 text-sm font-bold text-white disabled:bg-slate-300"
                    >
                      Add to cart
                    </button>
                  </article>
                ))}
              </div>
            )}
          </section>
        ) : (
          <section>
            <h1 className="mb-5 text-2xl font-bold">My order history</h1>
            {orders.length ? (
              <div className="space-y-3">
                {orders.map((order) => (
                  <article
                    key={order._id}
                    className="rounded-xl border bg-white p-4"
                  >
                    <div className="flex justify-between gap-4">
                      <div>
                        <strong>{order.orderNumber}</strong>
                        <p className="text-sm text-slate-500">
                          {new Date(order.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <strong>{money(order.total)}</strong>
                        <p className="text-sm capitalize text-indigo-600">
                          {order.status}
                        </p>
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-slate-600">
                      {order.items
                        .map((item) => `${item.name} × ${item.quantity}`)
                        .join(", ")}
                    </p>
                  </article>
                ))}
              </div>
            ) : (
              <p>No orders yet.</p>
            )}
          </section>
        )}
        <aside className="h-fit rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex justify-between">
            <h2 className="text-lg font-bold">Your cart</h2>
            <span className="text-sm text-slate-500">
              {cart.length} products
            </span>
          </div>
          {cart.length ? (
            <>
              {cart.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center gap-2 border-b py-3 text-sm"
                >
                  <div className="min-w-0 flex-1">
                    <strong className="block truncate">{item.name}</strong>
                    <span>{money(item.salePrice)}</span>
                  </div>
                  <button
                    onClick={() => change(item._id, -1)}
                    className="rounded border px-2"
                  >
                    −
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    onClick={() => change(item._id, 1)}
                    disabled={item.quantity >= item.currentStockQuantity}
                    className="rounded border px-2 disabled:opacity-40"
                  >
                    +
                  </button>
                </div>
              ))}
              <div className="mt-4 flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>{money(total)}</span>
              </div>
              <button
                disabled={placing}
                onClick={checkout}
                className="mt-4 w-full rounded-lg bg-indigo-600 py-3 font-bold text-white disabled:opacity-60"
              >
                {placing ? "Placing order…" : "Place order"}
              </button>
            </>
          ) : (
            <p className="py-8 text-center text-sm text-slate-500">
              Your cart is empty.
            </p>
          )}
        </aside>
      </div>
    </main>
    </>

  );
}
