import React, { useState } from 'react';

export default function ProductForm({ onSubmit }) {
  const [form, setForm] = useState({
    name: '',
    price: '',
    quantity: '',
    description: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    // Basic client-side validation
    if (!form.name || !form.price) {
      setError('Name and price are required');
      return;
    }
    setSubmitting(true);
    try {
      if (onSubmit) {
        await onSubmit(form);
      } else {
        // Fallback: attempt POST to /api/products
        await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: form.name,
            price: parseFloat(form.price),
            quantity: Number(form.quantity) || 0,
            description: form.description
          })
        });
      }
      setForm({ name: '', price: '', quantity: '', description: '' });
    } catch (err) {
      setError(err.message || 'Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="product-form">
      {error && <div className="error">{error}</div>}
      <div>
        <label>Name</label>
        <input name="name" value={form.name} onChange={handleChange} />
      </div>
      <div>
        <label>Price</label>
        <input name="price" value={form.price} onChange={handleChange} type="number" step="0.01" />
      </div>
      <div>
        <label>Quantity</label>
        <input name="quantity" value={form.quantity} onChange={handleChange} type="number" />
      </div>
      <div>
        <label>Description</label>
        <textarea name="description" value={form.description} onChange={handleChange} />
      </div>
      <div>
        <button type="submit" disabled={submitting}>{submitting ? 'Saving...' : 'Save Product'}</button>
      </div>
    </form>
  );
}
