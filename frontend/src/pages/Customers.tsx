import React, { useState, useEffect } from 'react';
import { fetchApi } from '../utils/api';
import { Plus, Search, Edit2 } from 'lucide-react';
import { Modal } from '../components/Modal';

interface Customer {
  id: number;
  name: string;
  mobile: string;
  email: string;
  type: string;
  status: string;
  businessName: string;
  gstNumber: string;
  address: string;
}

const Customers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '', mobile: '', email: '', businessName: '', gstNumber: '',
    type: 'RETAIL', address: '', status: 'LEAD'
  });

  const loadCustomers = async () => {
    try {
      const data = await fetchApi(`/customers?search=${search}`);
      setCustomers(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [search]);

  const handleOpenModal = (customer?: Customer) => {
    if (customer) {
      setEditingId(customer.id);
      setFormData({
        name: customer.name, mobile: customer.mobile, email: customer.email || '', 
        businessName: customer.businessName || '', gstNumber: customer.gstNumber || '',
        type: customer.type, address: customer.address || '', status: customer.status
      });
    } else {
      setEditingId(null);
      setFormData({ name: '', mobile: '', email: '', businessName: '', gstNumber: '', type: 'RETAIL', address: '', status: 'LEAD' });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await fetchApi(`/customers/${editingId}`, { method: 'PUT', body: JSON.stringify(formData) });
      } else {
        await fetchApi('/customers', { method: 'POST', body: JSON.stringify(formData) });
      }
      setShowModal(false);
      loadCustomers();
    } catch (err: any) {
      alert(err.message || JSON.stringify(err));
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 700 }}>Customers</h1>
        <button onClick={() => handleOpenModal()} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={18} /> Add Customer
        </button>
      </div>

      <div className="card glass" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Search size={18} style={{ color: 'var(--text-muted)' }} />
        <input 
          type="text" 
          placeholder="Search by name, mobile, business..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ border: 'none', background: 'transparent', flex: 1, outline: 'none' }}
        />
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Business Name</th>
              <th>Mobile</th>
              <th>Type</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ textAlign: 'center' }}>Loading...</td></tr>
            ) : customers.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center' }}>No customers found</td></tr>
            ) : (
              customers.map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 500 }}>{c.name}</td>
                  <td>{c.businessName || '-'}</td>
                  <td>{c.mobile}</td>
                  <td><span className="badge badge-warning">{c.type}</span></td>
                  <td>
                    <span className={`badge ${c.status === 'ACTIVE' ? 'badge-success' : c.status === 'LEAD' ? 'badge-warning' : 'badge-danger'}`}>
                      {c.status}
                    </span>
                  </td>
                  <td>
                    <button onClick={() => handleOpenModal(c)} className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}><Edit2 size={14}/></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingId ? 'Edit Customer' : 'Add Customer'}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Name *</label>
              <input style={{ width: '100%', marginTop: '0.25rem' }} required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div>
              <label style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Mobile *</label>
              <input style={{ width: '100%', marginTop: '0.25rem' }} required value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} />
            </div>
            <div>
              <label style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Email</label>
              <input style={{ width: '100%', marginTop: '0.25rem' }} type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
            <div>
              <label style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Business Name</label>
              <input style={{ width: '100%', marginTop: '0.25rem' }} value={formData.businessName} onChange={e => setFormData({...formData, businessName: e.target.value})} />
            </div>
            <div>
              <label style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>GST Number</label>
              <input style={{ width: '100%', marginTop: '0.25rem' }} value={formData.gstNumber} onChange={e => setFormData({...formData, gstNumber: e.target.value})} />
            </div>
            <div>
              <label style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Customer Type</label>
              <select style={{ width: '100%', marginTop: '0.25rem' }} value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                <option value="RETAIL">Retail</option>
                <option value="WHOLESALE">Wholesale</option>
                <option value="DISTRIBUTOR">Distributor</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Status</label>
              <select style={{ width: '100%', marginTop: '0.25rem' }} value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                <option value="LEAD">Lead</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>
          <div>
            <label style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Address</label>
            <textarea style={{ width: '100%', marginTop: '0.25rem' }} rows={2} value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 2rem' }}>Save Customer</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Customers;
