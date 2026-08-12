import React, { useState, useEffect } from 'react';
import { fetchApi } from '../utils/api';
import { Plus, Search, Edit2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/Modal';

interface Product {
  id: number;
  name: string;
  sku: string;
  category: string;
  unitPrice: number;
  currentStock: number;
  minStockAlert: number;
}

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '', sku: '', category: '', unitPrice: 0, currentStock: 0, minStockAlert: 0
  });

  const loadProducts = async () => {
    try {
      const data = await fetchApi(`/products?search=${search}`);
      setProducts(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [search]);

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingId(product.id);
      setFormData({
        name: product.name, sku: product.sku, category: product.category || '', 
        unitPrice: product.unitPrice, currentStock: product.currentStock, minStockAlert: product.minStockAlert
      });
    } else {
      setEditingId(null);
      setFormData({ name: '', sku: '', category: '', unitPrice: 0, currentStock: 0, minStockAlert: 0 });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        unitPrice: Number(formData.unitPrice),
        currentStock: Number(formData.currentStock),
        minStockAlert: Number(formData.minStockAlert)
      };
      if (editingId) {
        await fetchApi(`/products/${editingId}`, { method: 'PUT', body: JSON.stringify(payload) });
      } else {
        await fetchApi('/products', { method: 'POST', body: JSON.stringify(payload) });
      }
      setShowModal(false);
      loadProducts();
    } catch (err: any) {
      alert(err.message || JSON.stringify(err));
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 700 }}>Inventory / Products</h1>
        {(user?.role === 'ADMIN' || user?.role === 'WAREHOUSE') && (
          <button onClick={() => handleOpenModal()} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={18} /> Add Product
          </button>
        )}
      </div>

      <div className="card glass" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Search size={18} style={{ color: 'var(--text-muted)' }} />
        <input 
          type="text" 
          placeholder="Search by name or SKU..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ border: 'none', background: 'transparent', flex: 1, outline: 'none' }}
        />
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>SKU</th>
              <th>Product Name</th>
              <th>Category</th>
              <th>Unit Price</th>
              <th>Current Stock</th>
              <th>Status</th>
              {(user?.role === 'ADMIN' || user?.role === 'WAREHOUSE') && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ textAlign: 'center' }}>Loading...</td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center' }}>No products found</td></tr>
            ) : (
              products.map(p => (
                <tr key={p.id}>
                  <td style={{ fontFamily: 'monospace' }}>{p.sku}</td>
                  <td style={{ fontWeight: 500 }}>{p.name}</td>
                  <td>{p.category || '-'}</td>
                  <td>${p.unitPrice.toFixed(2)}</td>
                  <td>{p.currentStock}</td>
                  <td>
                    {p.currentStock <= p.minStockAlert ? (
                      <span className="badge badge-danger">Low Stock</span>
                    ) : (
                      <span className="badge badge-success">In Stock</span>
                    )}
                  </td>
                  {(user?.role === 'ADMIN' || user?.role === 'WAREHOUSE') && (
                    <td>
                      <button onClick={() => handleOpenModal(p)} className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}><Edit2 size={14}/></button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingId ? 'Edit Product' : 'Add Product'}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Product Name *</label>
              <input style={{ width: '100%', marginTop: '0.25rem' }} required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div>
              <label style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>SKU/Code *</label>
              <input style={{ width: '100%', marginTop: '0.25rem' }} required value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} />
            </div>
            <div>
              <label style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Category</label>
              <input style={{ width: '100%', marginTop: '0.25rem' }} value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
            </div>
            <div>
              <label style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Unit Price ($) *</label>
              <input style={{ width: '100%', marginTop: '0.25rem' }} type="number" step="0.01" required value={formData.unitPrice} onChange={e => setFormData({...formData, unitPrice: Number(e.target.value)})} />
            </div>
            <div>
              <label style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Current Stock</label>
              <input style={{ width: '100%', marginTop: '0.25rem' }} type="number" required value={formData.currentStock} onChange={e => setFormData({...formData, currentStock: Number(e.target.value)})} />
            </div>
            <div>
              <label style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Min Stock Alert</label>
              <input style={{ width: '100%', marginTop: '0.25rem' }} type="number" required value={formData.minStockAlert} onChange={e => setFormData({...formData, minStockAlert: Number(e.target.value)})} />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 2rem' }}>Save Product</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Products;
