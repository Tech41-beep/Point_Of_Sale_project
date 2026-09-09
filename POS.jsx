import { useMemo, useState } from "react";

const products = [
  { id: 1, name: "Coffee", price: 2.5, category: "Drinks", icon: "☕" },
  { id: 2, name: "Orange Juice", price: 3, category: "Drinks", icon: "🍊" },
  { id: 3, name: "Burger", price: 5.5, category: "Food", icon: "🍔" },
  { id: 4, name: "Pizza", price: 7, category: "Food", icon: "🍕" },
  { id: 5, name: "French Fries", price: 2.75, category: "Snacks", icon: "🍟" },
  { id: 6, name: "Cookie", price: 1.5, category: "Snacks", icon: "🍪" },
];

const styles = {
  page: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) 380px",
    gap: 20,
    minHeight: "100vh",
    padding: 24,
    background: "#f4f6f8",
    color: "#1f2937",
    fontFamily: "Arial, sans-serif",
  },
  panel: {
    padding: 20,
    borderRadius: 16,
    background: "#ffffff",
    boxShadow: "0 4px 18px rgba(0, 0, 0, 0.06)",
  },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
    marginBottom: 20,
  },
  search: {
    width: 280,
    padding: "12px 14px",
    border: "1px solid #d1d5db",
    borderRadius: 10,
    fontSize: 15,
  },
  categories: { display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 20 },
  categoryButton: {
    padding: "9px 16px",
    border: 0,
    borderRadius: 20,
    cursor: "pointer",
  },
  productGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
    gap: 14,
  },
  productCard: {
    padding: 16,
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    background: "#ffffff",
    textAlign: "left",
    cursor: "pointer",
  },
  productIcon: {
    display: "grid",
    placeItems: "center",
    height: 80,
    marginBottom: 12,
    borderRadius: 10,
    background: "#eff6ff",
    fontSize: 38,
  },
  cart: { display: "flex", flexDirection: "column" },
  cartRow: {
    display: "grid",
    gridTemplateColumns: "minmax(80px, 1fr) 84px 70px 32px",
    gap: 6,
    alignItems: "center",
    padding: "12px 0",
    borderBottom: "1px solid #eeeeee",
    fontSize: 14,
  },
  quantity: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  smallButton: {
    width: 24,
    height: 24,
    border: 0,
    borderRadius: 6,
    background: "#e5e7eb",
    cursor: "pointer",
  },
  total: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "auto",
    padding: "18px 0",
    borderTop: "2px solid #e5e7eb",
    fontSize: 21,
    fontWeight: 700,
  },
  payButton: {
    width: "100%",
    padding: 15,
    border: 0,
    borderRadius: 10,
    color: "white",
    background: "#2563eb",
    fontSize: 17,
    fontWeight: 700,
    cursor: "pointer",
  },
};

export default function POS() {
  const [cart, setCart] = useState([]);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");

  const categories = ["All", ...new Set(products.map((product) => product.category))];

  const filteredProducts = products.filter((product) => {
    const matchesCategory = category === "All" || product.category === category;
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const total = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart],
  );

  function addToCart(product) {
    setCart((currentCart) => {
      const exists = currentCart.find((item) => item.id === product.id);

      if (exists) {
        return currentCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }

      return [...currentCart, { ...product, quantity: 1 }];
    });
  }

  function changeQuantity(productId, amount) {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.id === productId ? { ...item, quantity: item.quantity + amount } : item,
        )
        .filter((item) => item.quantity > 0),
    );
  }

  function removeItem(productId) {
    setCart((currentCart) => currentCart.filter((item) => item.id !== productId));
  }

  function payNow() {
    if (cart.length === 0) {
      window.alert("Please add a product first.");
      return;
    }

    window.alert(`Payment successful! Total: $${total.toFixed(2)}`);
    setCart([]);
  }

  return (
    <main style={styles.page}>
      <section style={styles.panel}>
        <div style={styles.topBar}>
          <h1 style={{ margin: 0 }}>My POS</h1>
          <input
            style={styles.search}
            type="search"
            placeholder="Search product..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div style={styles.categories}>
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              style={{
                ...styles.categoryButton,
                color: category === item ? "white" : "#1f2937",
                background: category === item ? "#2563eb" : "#e5e7eb",
              }}
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>

        <div style={styles.productGrid}>
          {filteredProducts.map((product) => (
            <button
              key={product.id}
              type="button"
              style={styles.productCard}
              onClick={() => addToCart(product)}
            >
              <span style={styles.productIcon}>{product.icon}</span>
              <strong>{product.name}</strong>
              <p style={{ margin: "8px 0 0", color: "#2563eb", fontWeight: 700 }}>
                ${product.price.toFixed(2)}
              </p>
            </button>
          ))}
        </div>
      </section>

      <aside style={{ ...styles.panel, ...styles.cart }}>
        <h2 style={{ margin: 0 }}>Current Order</h2>

        <div style={{ ...styles.cartRow, color: "#6b7280", marginTop: 12 }}>
          <span>Name</span>
          <span>Quantity</span>
          <span>Price</span>
          <span />
        </div>

        <div style={{ minHeight: 220 }}>
          {cart.length === 0 && (
            <p style={{ marginTop: 70, color: "#9ca3af", textAlign: "center" }}>
              Your cart is empty
            </p>
          )}

          {cart.map((item) => (
            <div key={item.id} style={styles.cartRow}>
              <span>{item.name}</span>
              <div style={styles.quantity}>
                <button
                  type="button"
                  style={styles.smallButton}
                  onClick={() => changeQuantity(item.id, -1)}
                >
                  −
                </button>
                <span>{item.quantity}</span>
                <button
                  type="button"
                  style={styles.smallButton}
                  onClick={() => changeQuantity(item.id, 1)}
                >
                  +
                </button>
              </div>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
              <button
                type="button"
                aria-label={`Remove ${item.name}`}
                style={{ ...styles.smallButton, color: "#dc2626", background: "#fee2e2" }}
                onClick={() => removeItem(item.id)}
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <div style={styles.total}>
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>

        <button type="button" style={styles.payButton} onClick={payNow}>
          Pay Now
        </button>
      </aside>
    </main>
  );
}
