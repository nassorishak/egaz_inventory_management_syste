import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ManageRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:8080/api/product-requests/all');
      setRequests(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const approve = async (id) => {
    if (!window.confirm('Approve this request? Stock will be reduced.')) return;
    try {
      await axios.put(`http://localhost:8080/api/product-requests/approve/${id}`);
      alert('Request approved. Stock updated.');
      load();
    } catch (err) {
      alert('Failed: ' + (err.response?.data || err.message));
    }
  };

  const reject = async (id) => {
    const note = window.prompt('Reason for rejection (optional):') || '';
    try {
      await axios.put(
        `http://localhost:8080/api/product-requests/reject/${id}?note=${encodeURIComponent(note)}`
      );
      alert('Request rejected.');
      load();
    } catch (err) {
      alert('Failed: ' + (err.response?.data || err.message));
    }
  };

  return (
    <div style={{ padding: '30px', background: '#f8fafc', minHeight: '100vh' }}>
      <h2 style={{ color: '#1e293b', marginTop: 0 }}>Product Requests</h2>
      <p style={{ color: '#64748b', marginTop: 4, marginBottom: 20 }}>
        Approve or reject product requests submitted by staff.
      </p>

      {loading ? (
        <div style={{
          background: '#fff', padding: 40, textAlign: 'center',
          borderRadius: 12, color: '#64748b',
        }}>
          Loading requests...
        </div>
      ) : (
        <div style={{
          background: '#fff', borderRadius: 12, overflowX: 'auto',
          boxShadow: '0 4px 15px rgba(0,0,0,0.06)',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
            <thead>
              <tr>
                <th style={th}>Product Name</th>
                <th style={th}>Product Description</th>
                <th style={th}>Quantity</th>
                <th style={th}>Department Name</th>
                <th style={th}>Issue Date</th>
                <th style={th}>Status</th>
                <th style={th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: 35, textAlign: 'center', color: '#64748b' }}>
                    No requests yet.
                  </td>
                </tr>
              ) : (
                requests.map((r) => (
                  <tr key={r.requestId} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={td}><strong>{r.productName ?? r.product?.productName ?? '-'}</strong></td>
                    <td style={td}>{r.productDescription ?? r.product?.productDescription ?? '-'}</td>
                    <td style={td}>{r.quantity ?? '-'}</td>
                    <td style={td}>{r.departmentName ?? r.department?.departmentName ?? '-'}</td>
                    <td style={td}>{r.issueDate ?? '-'}</td>
                    <td style={td}>
                      <span style={{
                        padding: '4px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600,
                        background: r.status === 'APPROVED' ? '#dcfce7'
                                  : r.status === 'REJECTED' ? '#fee2e2'
                                  : '#fef3c7',
                        color:      r.status === 'APPROVED' ? '#166534'
                                  : r.status === 'REJECTED' ? '#b91c1c'
                                  : '#92400e',
                      }}>
                        {r.status}
                      </span>
                    </td>
                    <td style={td}>
                      {r.status === 'PENDING' ? (
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={() => approve(r.requestId)} style={btnGreen}>Approve</button>
                          <button onClick={() => reject(r.requestId)} style={btnRed}>Reject</button>
                        </div>
                      ) : (
                        <span style={{ color: '#94a3b8' }}>—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const th = {
  background: '#1e40af', color: '#fff',
  padding: '14px 12px', textAlign: 'left',
  fontSize: 14, whiteSpace: 'nowrap',
};
const td = {
  padding: '13px 12px', color: '#334155', fontSize: 14,
};
const btnGreen = {
  padding: '7px 14px', border: 'none', borderRadius: 6,
  background: '#16a34a', color: '#fff', fontWeight: 600, cursor: 'pointer',
};
const btnRed = {
  padding: '7px 14px', border: 'none', borderRadius: 6,
  background: '#dc2626', color: '#fff', fontWeight: 600, cursor: 'pointer',
};

export default ManageRequests;