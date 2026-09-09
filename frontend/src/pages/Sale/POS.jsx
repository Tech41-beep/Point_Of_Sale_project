import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import api from "../../api";
import Modal from "../../components/Modal";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Barcode from "../../components/BarCode";
function POS() {
  const navigate = useNavigate();
  
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [customerId, setCustomerId] = useState(
    location.state?.customerId || "",
  );
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paidAmount, setPaidAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  async function loadPosData() {
    setLoading(true);
    setError("");

    try {
      // api calls to fetch products, categories, and customers in parallel
      const [productResponse, categoryResponse, customerResponse] =
        await Promise.all([
          api.get("/products", { params: { page: 1, limit: 1000 } }),
          api.get("/categories", { params: { page: 1, limit: 1000 } }),
          api.get("/customers", { params: { page: 1, limit: 1000 } }),
        ]);

      setProducts(productResponse.data?.result || []);
      setCategories(categoryResponse.data?.result || []);
      setCustomers(customerResponse.data?.result || []);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Unable to load POS data.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPosData();
  }, []);

  async function clearButton() {
    setCart([]);
    setPaidAmount("");
    setCustomerId("");
    setPaymentMethod("cash");
    setError("");
  }

  const visibleProducts = products.filter((product) => {
    const productCategory = product.category?._id || product.category;
    const searchValue = search.trim().toLowerCase();
    const matchesCategory = category === "all" || productCategory === category;
    const matchesSearch =
      !searchValue ||
      product.name?.toLowerCase().includes(searchValue) ||
      product.code?.toLowerCase().includes(searchValue);

    return matchesCategory && matchesSearch;
  });

  const total = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart],
  );

  function requestCheckout() {
    setError("");
    setMessage("");

    if (!customerId) {
      setError("Please select a customer.");
      return;
    }

    if (cart.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    setCheckoutModalOpen(true);
  }

  function addToCart(product) {
    const productId = product._id || product.id;
    const stock = Number(product.currentStockQuantity || 0);
    if (stock === 0) return;

    setCart((currentCart) => {
      const existingItem = currentCart.find(
        (item) => item.productId === productId,
      );

      if (existingItem) {
        if (existingItem.quantity >= stock) return currentCart;
        return currentCart.map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }

      return [
        ...currentCart,
        {
          productId,
          name: product.name,
          price: Number(product.salePrice || 0),
          stock,
          quantity: 1,
        },
      ];
    });
  }
  async function handleBarcodeScan(barcode) {
    setError("");
    try {
      const response = await api.get(
        `/products/barcode/${encodeURIComponent(barcode)}`,
      );
      const product = response.data?.result;
      if (!product) throw new Error("The server returned an invalid product.");
      if (Number(product.currentStockQuantity || 0) <= 0) {
        setError(`${product.name} is out of stock.`);
        return;
      }
      addToCart(product);
    } catch (requestError) {
      setError(
        requestError.response?.status === 404
          ? `Product with barcode ${barcode} was not found.`
          : requestError.response?.data?.message || "Unable to scan product.",
      );
    }
  }

  function changeQuantity(productId, amount) {
    setCart((currentCart) =>
      currentCart
        .map((item) => {
          if (item.productId !== productId) return item;
          const quantity = Math.min(item.quantity + amount, item.stock);
          return { ...item, quantity };
        })
        .filter((item) => item.quantity > 0),
    );
  }

  function removeFromCart(productId) {
    setCart((currentCart) =>
      currentCart.filter((item) => item.productId !== productId),
    );
  }
  function checkStock(productId) {
    const product = products.find((p) => (p._id || p.id) === productId);
    return Number(product?.currentStockQuantity || 0);
  }

  async function checkout() {
    setError("");
    setMessage("");

    if (!customerId) return setError("Please select a customer.");
    if (cart.length === 0) return setError("Your cart is empty.");

    setSaving(true);
    try {
      const response = await api.post("/sales", {
        customer: customerId,
        paymentMethod,
        paidAmount: Number(paidAmount || 0),
        totalCost: total,
        saleDate: new Date().toISOString(),
        items: cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
      });

      const sale = response.data?.result;

      toast.success("Sale completed successfully.");

      navigate("/invoice", {
        state: { sale },
      });

 
      setMessage(
        `Sale completed: ${response.data?.result?.invoiceNumber || "invoice created"}`,
      );
      setCart([]);
      setPaidAmount("");
      await loadPosData();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Unable to complete the sale.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="pos">
      <Barcode onScan={handleBarcodeScan} />
      <Modal
        open={checkoutModalOpen}
        title="Confirm checkout"
        onClose={() => {
          if (!saving) setCheckoutModalOpen(false);
        }}
      >

        
        <div className="space-y-3 text-gray-700">
          <p>Are you sure you want to complete this sale?</p>

          <div className="rounded-lg bg-gray-100 p-4">
            <p>Items: {cart.length}</p>
            <p>Payment method: {paymentMethod}</p>
            <p>Paid amount: ${Number(paidAmount || 0).toFixed(2)}</p>
            <p className="mt-2 text-lg font-bold text-gray-900">
              Total: ${total.toFixed(2)}
            </p>
          </div>
        </div>
        <hr className="my-4 border-t border-gray-300" />
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            className="rounded-lg bg-gray-200 px-4 py-2 text-gray-800"
            disabled={saving}
            onClick={() => setCheckoutModalOpen(false)}
          >
            Cancel
          </button>

          <button
            type="button"
            className="rounded-lg bg-[#5b5ce2] px-4 py-2 text-white disabled:opacity-50"
            disabled={saving}
            onClick={async () => {
              setCheckoutModalOpen(false);
              await checkout();
            }}
          >
            Confirm checkout
          </button>
        </div>
      </Modal>
      <h1>Point of Sale</h1>

      <section className="pos__sidebar">
        <div className="pos__sidebar-header">
          <h2>New Order</h2>
          <select
            className="pos__customer-select"
            value={customerId}
            onChange={(event) => setCustomerId(event.target.value)}
          >
            <option value="">Select customer</option>
            {customers.map((customer) => (
              <option
                key={customer._id || customer.id}
                value={customer._id || customer.id}
              >
                {customer.name} {customer.phone ? `- ${customer.phone}` : ""}
              </option>
            ))}
          </select>
        </div>

        <div className="pos__sidebar-search">
          <input
            type="search"
            placeholder="Search products by name or code..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="pos__categories">
          <button
            type="button"
            className={category === "all" ? "active" : ""}
            onClick={() => setCategory("all")}
          >
            All
          </button>
          {categories.map((item) => (
            <button
              key={item._id || item.id}
              type="button"
              className={category === (item._id || item.id) ? "active" : ""}
              onClick={() => setCategory(item._id || item.id)}
            >
              {item.name}
            </button>
          ))}
        </div>

        {error && <p className="pos__error">{error}</p>}
        {message && <p className="pos__success">{message}</p>}

        <div className="pos__sidebar-products">
          {loading ? (
            <p className="pos__empty">Loading products...</p>
          ) : visibleProducts.length === 0 ? (
            <p className="pos__empty">No products found.</p>
          ) : (
            visibleProducts.map((product) => {
              const stock = Number(product.currentStockQuantity || 0);
              return (
                <button
                  key={product._id || product.id}
                  type="button"
                  className="pos__product-card"
                  disabled={stock === 0}
                  onClick={() => addToCart(product)}
                >
                  <span className="pos__product-image">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} />
                    ) : (
                      "📦"
                    )}
                  </span>
                  <strong>{product.name}</strong>
                  <span>${Number(product.salePrice || 0).toFixed(2)}</span>
                  <small>Stock: {stock}</small>
                </button>
              );
            })
          )}
        </div>
      </section>

      <aside className="pos__main">
        <div className="pos__main-header">
          <h2>Cart</h2>
          <span>{cart.length} items</span>
        </div>

        <div className="pos__main-cart">
          {cart.length === 0 && (
            <p className="pos__empty">Your cart is empty.</p>
          )}
          {cart.map((item) => (
            <div className="pos__cart-item" key={item.productId}>
              <div>
                <strong>{item.name}</strong>
                <small>${item.price.toFixed(2)} each</small>
              </div>
              <div className="pos__quantity">
                <button
                  type="button"
                  onClick={() => changeQuantity(item.productId, -1)}
                >
                  −
                </button>
                <span>{item.quantity}</span>
                <button
                  type="button"
                  onClick={() => changeQuantity(item.productId, 1)}
                >
                  +
                </button>
              </div>
              <strong>${(item.price * item.quantity).toFixed(2)}</strong>
              <button
                type="button"
                className="pos__remove"
                onClick={() => removeFromCart(item.productId)}
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <div className="pos__main-footer">
          <label>
            Payment method
            <select
              value={paymentMethod}
              onChange={(event) => setPaymentMethod(event.target.value)}
            >
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="mobile_payment">Mobile payment</option>
            </select>
          </label>
          <label>
            Paid amount
            <input
              type="number"
              min="0"
              step="0.01"
              value={paidAmount}
              onChange={(event) => setPaidAmount(event.target.value)}
            />
          </label>
          <div className="pos__total">
            <span>Total</span>
            <strong>${total.toFixed(2)}</strong>
          </div>

          <div className="pos__main-actions">
            <button
              type="button"
              className="pos__main-checkout"
              disabled={saving || cart.length === 0}
              onClick={requestCheckout}
            >
              Checkout
            </button>

            <button
              type="button"
              className="pos__main-checkout bg-red-600 hover:bg-red-700"
              onClick={clearButton}
            >
              Clear Cart
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}

export default POS;
