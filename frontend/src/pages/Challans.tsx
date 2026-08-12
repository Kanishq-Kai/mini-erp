import React, { useState, useEffect } from 'react';
import { fetchApi } from '../utils/api';
import { Plus, Check, X, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/Modal';

interface Challan {
  id: number;
  challanNumber: string;
  totalQuantity: number;
  status: string;
  createdAt: string;
  customer: { name: string };
  createdBy: { name: string };
}

const Challans = () => {
  const [challans, setChallans] = useState<Challan[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const [showModal, setShowModal] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [challanItems, setChallanItems] = useState<{productId: string, quantity: number}[]>([{ productId: '', quantity: 1 }]);

  const loadChallans = async () => {
    try {
      const data = await fetchApi('/challans');
      setChallans(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadLookups = async () => {
    try {
      const custData = await fetchApi('/customers');
      setCustomers(custData.data);
      const prodData = await fetchApi('/products');
      setProducts(prodData.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadChallans();
    loadLookups();
  }, []);

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      await fetchApi(`/challans/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });
      loadChallans();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId) return alert('Select a customer');
    
    // filter out empty products
    const validItems = challanItems.filter(i => i.productId && i.quantity > 0).map(i => ({
      productId: Number(i.productId),
      quantity: Number(i.quantity)
    }));

    if (validItems.length === 0) return alert('Add at least one product');

    try {
      await fetchApi('/challans', {
        method: 'POST',
        body: JSON.stringify({
          customerId: Number(selectedCustomerId),
          items: validItems,
          status: 'DRAFT' // Creates as draft initially
        })
      });
      setShowModal(false);
      setSelectedCustomerId('');
      setChallanItems([{ productId: '', quantity: 1 }]);
      loadChallans();
    } catch (err: any) {
      alert(err.message || JSON.stringify(err));
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 700 }}>Sales Challans</h1>
        <button onClick={() => setShowModal(true)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={18} /> Generate Challan
        </button>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Challan No.</th>
              <th>Customer</th>
              <th>Total Qty</th>
              <th>Created By</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ textAlign: 'center' }}>Loading...</td></tr>
            ) : challans.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center' }}>No challans found</td></tr>
            ) : (
              challans.map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 600, fontFamily: 'monospace' }}>{c.challanNumber}</td>
                  <td>{c.customer.name}</td>
                  <td>{c.totalQuantity}</td>
                  <td>{c.createdBy.name}</td>
                  <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                  <td>
                    <span className={`badge ${c.status === 'CONFIRMED' ? 'badge-success' : c.status === 'CANCELLED' ? 'badge-danger' : 'badge-warning'}`}>
                      {c.status}
                    </span>
                  </td>
                  <td>
                    {c.status === 'DRAFT' && (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => handleStatusChange(c.id, 'CONFIRMED')} className="btn btn-primary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }} title="Confirm">
                          <Check size={14} /> Confirm
                        </button>
                        <button onClick={() => handleStatusChange(c.id, 'CANCELLED')} className="btn btn-danger" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }} title="Cancel">
                          <X size={14} /> Cancel
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Generate New Challan (Draft)">
        <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ fontSize: '0.875rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Select Customer *</label>
            <select required style={{ width: '100%' }} value={selectedCustomerId} onChange={e => setSelectedCustomerId(e.target.value)}>
              <option value="">-- Choose Customer --</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.mobile})</option>)}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.875rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>Products</label>
            {challanItems.map((item, index) => (
              <div key={index} style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                <select style={{ flex: 1 }} value={item.productId} onChange={e => {
                  const newItems = [...challanItems];
                  newItems[index].productId = e.target.value;
                  setChallanItems(newItems);
                }}>
                  <option value="">-- Select Product --</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name} (Stock: {p.currentStock}) - ${p.unitPrice}</option>)}
                </select>
                <input 
                  type="number" 
                  min="1" 
                  style={{ width: '80px' }} 
                  value={item.quantity} 
                  onChange={e => {
                    const newItems = [...challanItems];
                    newItems[index].quantity = Number(e.target.value);
                    setChallanItems(newItems);
                  }} 
                />
                <button type="button" onClick={() => setChallanItems(challanItems.filter((_, i) => i !== index))} style={{ color: 'var(--danger-color)' }}>
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
            <button type="button" onClick={() => setChallanItems([...challanItems, { productId: '', quantity: 1 }])} className="btn btn-secondary" style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>
              + Add Another Product
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
            <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 2rem' }}>Save as Draft</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Challans;
