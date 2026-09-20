import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ViewAdminRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState('');

  const superAdminId = Number(localStorage.getItem('userId'));

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:8080/api/admin-requests/all');
      // Onyesha PENDING kwanza
      const sorted = [...res.data].sort((a, b) => {
        if (a.status === 'PENDING' && b.status !== 'PENDING') return -1;
        if (a.status !== 'PENDING' && b.status === 'PENDING') return 1;
        return 0;
      });
      setRequests(sorted);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  const approve = async (id) => {
    try {
      await axios.put(
        `http://localhost:8080/api/admin-requests/approve/${id}`,
        null,
        { params: { superAdminId, note: note || 'Approved' } }
      );
      alert('✅ Request approved!');
      setSelected(null); setNote('');
      fetchRequests();
    } catch (err) {
      alert('❌ ' + (err.response?.data || err.message));
    }
  };

  const reject = async (id) => {
    try {
      await axios.put(
        `http://localhost:8080/api/admin-requests/reject/${id}`,
        null,
        { params: { superAdminId, note: note || 'Rejected' } }
      );
      alert('❌ Request rejected.');
      setSelected(null); setNote('');
      fetchRequests();
    } catch (err) {
      alert('❌ ' + (err.response?.data || err.message));
    }
  };

  return (
    <div style={{ padding: 30, maxWidth: 1100, margin: '0 auto' }}>
      <h1 style={{ color: '#172033' }}>Admin Requests</h1>
      <p style={{ color: '#718096', marginBottom: 25 }}>
        Approve or reject requests sent by admins.
      </p>

      {loading ? (
        <p>Loading...</p>
      ) : requests.length === 0 ? (
        <p style={{ color: '#64748b' }}>No requests yet.</p>
      ) : (
        <div style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 10px 30px rgba(15,23,42,0.08)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f1f5f9' }}>
                <th style={th}>Type</th>
                <th style={th}>Admin</th>
                <th style={th}>Product</th>
                <th style={th}>Qty</th>
                <th style={th}>Staff</th>
                <th style={th}>Status</th>
                <th style={th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={td}>
                    {r.requestType === 'STOCK_REQUEST' ? '📦 Stock' : '📤 Give'}
                  </td>
                  <td style={td}>{r.adminName}</td>
                  <td style={td}>{r.productName}</td>
                  <td style={td}>{r.quantity}</td>
                  <td style={td}>{r.staffName || '—'}</td>
                  <td style={td}>
                    <span style={badge(r.status)}>{r.status}</span>
                  </td>
                  <td style={td}>
                    {r.status === 'PENDING' ? (
                      <button
                        onClick={() => { setSelected(r); setNote(''); }}
                        style={{
                          padding: '6px 12px', background: '#2563eb', color: '#fff',
                          border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600,
                        }}
                      >
                        Respond
                      </button>
                    ) : (
                      <span style={{ color: '#94a3b8', fontSize: 12 }}>
                        {r.superAdminNote || '—'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* JIBU */}
      {selected && (
        <div style={{
          marginTop: 25, background: '#fff', padding: 25, borderRadius: 16,
          boxShadow: '0 10px 30px rgba(15,23,42,0.08)', border: '2px solid #2563eb',
        }}>
          <h3 style={{ marginTop: 0 }}>Respond to {selected.adminName}</h3>
          <p><b>Product:</b> {selected.productName}</p>
          <p><b>Quantity:</b> {selected.quantity}</p>
          {selected.staffName && <p><b>Staff:</b> {selected.staffName}</p>}
          <p><b>Reason:</b> {selected.description}</p>

          <label style={{ display: 'block', margin: '15px 0 8px', fontWeight: 600 }}>
            Your Note
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid #d9dee8', boxSizing: 'border-box' }}
            placeholder="Write a short note (optional)"
          />

          <div style={{ display: 'flex', gap: 10, marginTop: 15 }}>
            <button onClick={() => approve(selected.id)} style={{ flex: 1, padding: 12, background: '#16a34a', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>
              ✅ Approve
            </button>
            <button onClick={() => reject(selected.id)} style={{ flex: 1, padding: 12, background: '#dc2626', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>
              ❌ Reject
            </button>
            <button onClick={() => { setSelected(null); setNote(''); }} style={{ flex: 1, padding: 12, background: '#e2e8f0', color: '#1e293b', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const th = { padding: '12px 14px', textAlign: 'left', fontSize: 13, color: '#334155', fontWeight: 600 };
const td = { padding: '12px 14px', fontSize: 13, color: '#475569' };
const badge = (status) => ({
  padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700,
  background:
    status === 'APPROVED' ? '#dcfce7' :
    status === 'REJECTED' ? '#fee2e2' :
    status === 'COMPLETED' ? '#dbeafe' : '#fef3c7',
  color:
    status === 'APPROVED' ? '#166534' :
    status === 'REJECTED' ? '#991b1b' :
    status === 'COMPLETED' ? '#1e40af' : '#92400e',
});

export default ViewAdminRequests;