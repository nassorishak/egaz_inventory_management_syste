// import React, { useState, useEffect } from 'react';
// import axios from 'axios';

// const ViewAdminRequests = () => {
//   const [requests, setRequests] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [selected, setSelected] = useState(null);
//   const [note, setNote] = useState('');

//   const superAdminId = Number(localStorage.getItem('userId'));

//   const fetchRequests = async () => {
//     setLoading(true);
//     try {
//       const res = await axios.get('http://localhost:8080/api/admin-requests/all');
//       // Onyesha PENDING kwanza
//       const sorted = [...res.data].sort((a, b) => {
//         if (a.status === 'PENDING' && b.status !== 'PENDING') return -1;
//         if (a.status !== 'PENDING' && b.status === 'PENDING') return 1;
//         return 0;
//       });
//       setRequests(sorted);
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => { fetchRequests(); }, []);

//   const approve = async (id) => {
//     try {
//       await axios.put(
//         `http://localhost:8080/api/admin-requests/approve/${id}`,
//         null,
//         { params: { superAdminId, note: note || 'Approved' } }
//       );
//       alert('✅ Request approved!');
//       setSelected(null); setNote('');
//       fetchRequests();
//     } catch (err) {
//       alert('❌ ' + (err.response?.data || err.message));
//     }
//   };

//   const reject = async (id) => {
//     try {
//       await axios.put(
//         `http://localhost:8080/api/admin-requests/reject/${id}`,
//         null,
//         { params: { superAdminId, note: note || 'Rejected' } }
//       );
//       alert('❌ Request rejected.');
//       setSelected(null); setNote('');
//       fetchRequests();
//     } catch (err) {
//       alert('❌ ' + (err.response?.data || err.message));
//     }
//   };

//   return (
//     <div style={{ padding: 30, maxWidth: 1100, margin: '0 auto' }}>
//       <h1 style={{ color: '#172033' }}>Admin Requests</h1>
//       <p style={{ color: '#718096', marginBottom: 25 }}>
//         Approve or reject requests sent by admins.
//       </p>

//       {loading ? (
//         <p>Loading...</p>
//       ) : requests.length === 0 ? (
//         <p style={{ color: '#64748b' }}>No requests yet.</p>
//       ) : (
//         <div style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 10px 30px rgba(15,23,42,0.08)' }}>
//           <table style={{ width: '100%', borderCollapse: 'collapse' }}>
//             <thead>
//               <tr style={{ background: '#f1f5f9' }}>
//                 <th style={th}>Type</th>
//                 <th style={th}>Admin</th>
//                 <th style={th}>Product</th>
//                 <th style={th}>Qty</th>
//                 <th style={th}>Staff</th>
//                 <th style={th}>Status</th>
//                 <th style={th}>Action</th>
//               </tr>
//             </thead>
//             <tbody>
//               {requests.map((r) => (
//                 <tr key={r.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
//                   <td style={td}>
//                     {r.requestType === 'STOCK_REQUEST' ? '📦 Stock' : '📤 Give'}
//                   </td>
//                   <td style={td}>{r.adminName}</td>
//                   <td style={td}>{r.productName}</td>
//                   <td style={td}>{r.quantity}</td>
//                   <td style={td}>{r.staffName || '—'}</td>
//                   <td style={td}>
//                     <span style={badge(r.status)}>{r.status}</span>
//                   </td>
//                   <td style={td}>
//                     {r.status === 'PENDING' ? (
//                       <button
//                         onClick={() => { setSelected(r); setNote(''); }}
//                         style={{
//                           padding: '6px 12px', background: '#2563eb', color: '#fff',
//                           border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600,
//                         }}
//                       >
//                         Respond
//                       </button>
//                     ) : (
//                       <span style={{ color: '#94a3b8', fontSize: 12 }}>
//                         {r.superAdminNote || '—'}
//                       </span>
//                     )}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}

//       {/* JIBU */}
//       {selected && (
//         <div style={{
//           marginTop: 25, background: '#fff', padding: 25, borderRadius: 16,
//           boxShadow: '0 10px 30px rgba(15,23,42,0.08)', border: '2px solid #2563eb',
//         }}>
//           <h3 style={{ marginTop: 0 }}>Respond to {selected.adminName}</h3>
//           <p><b>Product:</b> {selected.productName}</p>
//           <p><b>Quantity:</b> {selected.quantity}</p>
//           {selected.staffName && <p><b>Staff:</b> {selected.staffName}</p>}
//           <p><b>Reason:</b> {selected.description}</p>

//           <label style={{ display: 'block', margin: '15px 0 8px', fontWeight: 600 }}>
//             Your Note
//           </label>
//           <textarea
//             value={note}
//             onChange={(e) => setNote(e.target.value)}
//             rows={3}
//             style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid #d9dee8', boxSizing: 'border-box' }}
//             placeholder="Write a short note (optional)"
//           />

//           <div style={{ display: 'flex', gap: 10, marginTop: 15 }}>
//             <button onClick={() => approve(selected.id)} style={{ flex: 1, padding: 12, background: '#16a34a', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>
//               ✅ Approve
//             </button>
//             <button onClick={() => reject(selected.id)} style={{ flex: 1, padding: 12, background: '#dc2626', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>
//               ❌ Reject
//             </button>
//             <button onClick={() => { setSelected(null); setNote(''); }} style={{ flex: 1, padding: 12, background: '#e2e8f0', color: '#1e293b', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>
//               Cancel
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// const th = { padding: '12px 14px', textAlign: 'left', fontSize: 13, color: '#334155', fontWeight: 600 };
// const td = { padding: '12px 14px', fontSize: 13, color: '#475569' };
// const badge = (status) => ({
//   padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700,
//   background:
//     status === 'APPROVED' ? '#dcfce7' :
//     status === 'REJECTED' ? '#fee2e2' :
//     status === 'COMPLETED' ? '#dbeafe' : '#fef3c7',
//   color:
//     status === 'APPROVED' ? '#166534' :
//     status === 'REJECTED' ? '#991b1b' :
//     status === 'COMPLETED' ? '#1e40af' : '#92400e',
// });

// export default ViewAdminRequests;
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ViewAdminRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const superAdminId = Number(localStorage.getItem('userId'));

  /* ---------------- FETCH ---------------- */
  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:8080/api/admin-requests/all');
      const sorted = [...res.data].sort((a, b) => {
        if (a.status === 'PENDING' && b.status !== 'PENDING') return -1;
        if (a.status !== 'PENDING' && b.status === 'PENDING') return 1;
        return 0;
      });
      setRequests(sorted);
    } catch (err) {
      console.error(err);
      showToast('error', 'Failed to load requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  /* ---------------- TOAST ---------------- */
  const showToast = (type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3000);
  };

  /* ---------------- APPROVE / REJECT ---------------- */
  const approve = async (id) => {
    setActionLoading(true);
    try {
      await axios.put(
        `http://localhost:8080/api/admin-requests/approve/${id}`,
        null,
        { params: { superAdminId, note: note || 'Approved' } }
      );
      showToast('success', 'Request approved successfully.');
      setSelected(null); setNote('');
      fetchRequests();
    } catch (err) {
      showToast('error', err.response?.data || err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const reject = async (id) => {
    setActionLoading(true);
    try {
      await axios.put(
        `http://localhost:8080/api/admin-requests/reject/${id}`,
        null,
        { params: { superAdminId, note: note || 'Rejected' } }
      );
      showToast('success', 'Request rejected.');
      setSelected(null); setNote('');
      fetchRequests();
    } catch (err) {
      showToast('error', err.response?.data || err.message);
    } finally {
      setActionLoading(false);
    }
  };

  /* ---------------- DELETE ---------------- */
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this request?')) return;
    setActionLoading(true);
    try {
      await axios.delete(
        `http://localhost:8080/api/admin-requests/delete/${id}`,
        { params: { superAdminId } }
      );
      showToast('success', 'Request deleted.');
      fetchRequests();
    } catch (err) {
      showToast('error', err.response?.data || err.message);
    } finally {
      setActionLoading(false);
    }
  };

  /* ---------------- RENDER ---------------- */
  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Admin Requests</h1>
          <p style={styles.subtitle}>
            Review, approve, reject or delete requests sent by admins.
          </p>
        </div>
        <button onClick={fetchRequests} style={styles.refreshBtn}>
          ⟳ Refresh
        </button>
      </div>

      {/* Stats */}
      <div style={styles.statsRow}>
        <StatCard label="Total"    value={requests.length}                                     color="#2563eb" />
        <StatCard label="Pending"  value={requests.filter(r => r.status === 'PENDING').length}  color="#d97706" />
        <StatCard label="Approved" value={requests.filter(r => r.status === 'APPROVED').length} color="#16a34a" />
        <StatCard label="Rejected" value={requests.filter(r => r.status === 'REJECTED').length} color="#dc2626" />
      </div>

      {/* Table */}
      {loading ? (
        <div style={styles.emptyBox}>Loading requests…</div>
      ) : requests.length === 0 ? (
        <div style={styles.emptyBox}>No requests yet.</div>
      ) : (
        <div style={styles.tableCard}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.theadRow}>
                <th style={styles.th}>Type</th>
                <th style={styles.th}>Admin</th>
                <th style={styles.th}>Qty</th>
                <th style={styles.th}>Staff</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id} style={styles.tr}>
                  <td style={styles.td}>
                    {r.requestType === 'STOCK_REQUEST' ? '📦 Stock' : '📤adminRequest'}
                  </td>
                  <td style={{ ...styles.td, fontWeight: 600, color: '#1e293b' }}>
                    {r.adminName}
                  </td>
                  <td style={styles.td}>{r.quantity}</td>
                  <td style={styles.td}>{r.staffName || '—'}</td>
                  <td style={styles.td}>
                    <span style={badge(r.status)}>{r.status}</span>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.actionGroup}>
                      {r.status === 'PENDING' && (
                        <button
                          onClick={() => { setSelected(r); setNote(''); }}
                          style={styles.respondBtn}
                          title="Respond"
                        >
                          Respond
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(r.id)}
                        style={styles.deleteBtn}
                        title="Delete"
                      >
                        🗑 Delete
                      </button>
                    </div>
                    {r.status !== 'PENDING' && r.superAdminNote && (
                      <div style={styles.noteText}>{r.superAdminNote}</div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ---------- RESPOND PANEL ---------- */}
      {selected && (
        <div style={styles.respondCard}>
          <div style={styles.respondHeader}>
            <h3 style={styles.respondTitle}>Respond to {selected.adminName}</h3>
            <button
              onClick={() => { setSelected(null); setNote(''); }}
              style={styles.closeBtn}
            >
              ✕
            </button>
          </div>

          <div style={styles.respondGrid}>
            <Info label="Product"  value={selected.productName} />
            <Info label="Quantity" value={selected.quantity} />
            {selected.staffName && <Info label="Staff" value={selected.staffName} />}
            <Info label="Reason"   value={selected.description} />
          </div>

          <label style={styles.label}>Your Note</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            style={styles.textarea}
            placeholder="Write a short note (optional)"
          />

          <div style={styles.btnRow}>
            <button
              onClick={() => approve(selected.id)}
              disabled={actionLoading}
              style={styles.approveBtn}
            >
              ✅ Approve
            </button>
            <button
              onClick={() => reject(selected.id)}
              disabled={actionLoading}
              style={styles.rejectBtn}
            >
              ❌ Reject
            </button>
            <button
              onClick={() => { setSelected(null); setNote(''); }}
              style={styles.cancelBtn}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ---------- TOAST ---------- */}
      {toast && (
        <div
          style={{
            ...styles.toast,
            background: toast.type === 'success' ? '#16a34a' : '#dc2626',
          }}
        >
          {toast.type === 'success' ? '✓' : '⚠'} {toast.text}
        </div>
      )}
    </div>
  );
};

/* ---------------- Small components ---------------- */
const StatCard = ({ label, value, color }) => (
  <div style={styles.statCard}>
    <div style={{ ...styles.statValue, color }}>{value}</div>
    <div style={styles.statLabel}>{label}</div>
  </div>
);

const Info = ({ label, value }) => (
  <div style={styles.infoBox}>
    <div style={styles.infoLabel}>{label}</div>
    <div style={styles.infoValue}>{value || '—'}</div>
  </div>
);

/* ---------------- Styles ---------------- */
const styles = {
  page: {
    minHeight: '100vh',
    padding: '30px 40px',
    background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)',
    fontFamily: '"Segoe UI", Roboto, Arial, sans-serif',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 22,
    flexWrap: 'wrap',
    gap: 12,
  },
  title: {
    margin: 0,
    fontSize: 28,
    fontWeight: 800,
    color: '#0f172a',
    letterSpacing: 0.3,
  },
  subtitle: {
    margin: '6px 0 0',
    color: '#64748b',
    fontSize: 14,
  },
  refreshBtn: {
    padding: '10px 18px',
    background: '#fff',
    color: '#2563eb',
    border: '1px solid #c7d2fe',
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(37,99,235,0.08)',
  },

  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: 14,
    marginBottom: 22,
  },
  statCard: {
    background: '#fff',
    padding: '16px 20px',
    borderRadius: 14,
    boxShadow: '0 4px 14px rgba(15,23,42,0.06)',
    border: '1px solid #eef2f7',
  },
  statValue: { fontSize: 24, fontWeight: 800, lineHeight: 1.1 },
  statLabel: {
    marginTop: 4,
    fontSize: 12,
    color: '#64748b',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  tableCard: {
    background: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    boxShadow: '0 10px 30px rgba(15,23,42,0.08)',
    border: '1px solid #eef2f7',
  },
  table: { width: '100%', borderCollapse: 'collapse' },
  theadRow: { background: '#f1f5f9' },
  th: {
    padding: '14px 16px',
    textAlign: 'left',
    fontSize: 12.5,
    color: '#334155',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tr: { borderBottom: '1px solid #e2e8f0', transition: 'background 0.15s ease' },
  td: { padding: '14px 16px', fontSize: 13.5, color: '#475569', verticalAlign: 'top' },
  actionGroup: { display: 'flex', gap: 6, flexWrap: 'wrap' },
  respondBtn: {
    padding: '6px 12px',
    background: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
  },
  deleteBtn: {
    padding: '6px 12px',
    background: '#dc2626',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
  },
  noteText: {
    marginTop: 6,
    fontSize: 11.5,
    color: '#94a3b8',
    fontStyle: 'italic',
  },

  emptyBox: {
    background: '#fff',
    padding: 40,
    textAlign: 'center',
    color: '#64748b',
    borderRadius: 16,
    boxShadow: '0 10px 30px rgba(15,23,42,0.06)',
    fontSize: 14,
  },

  respondCard: {
    marginTop: 25,
    background: '#fff',
    padding: 26,
    borderRadius: 16,
    boxShadow: '0 15px 40px rgba(37,99,235,0.15)',
    border: '2px solid #2563eb',
  },
  respondHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  respondTitle: { margin: 0, fontSize: 18, color: '#0f172a', fontWeight: 700 },
  closeBtn: {
    background: 'transparent',
    border: 'none',
    fontSize: 18,
    color: '#94a3b8',
    cursor: 'pointer',
    lineHeight: 1,
  },
  respondGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: 12,
    marginBottom: 14,
  },
  infoBox: {
    background: '#f8fafc',
    padding: '10px 14px',
    borderRadius: 10,
    border: '1px solid #eef2f7',
  },
  infoLabel: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: { marginTop: 3, fontSize: 14, color: '#1e293b', fontWeight: 600 },
  label: {
    display: 'block',
    margin: '14px 0 6px',
    fontSize: 12.5,
    fontWeight: 700,
    color: '#334155',
  },
  textarea: {
    width: '100%',
    padding: 12,
    borderRadius: 10,
    border: '1px solid #d9dee8',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    fontSize: 13.5,
    resize: 'vertical',
    outline: 'none',
  },
  btnRow: { display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' },
  approveBtn: {
    flex: 1, minWidth: 120, padding: 12, background: '#16a34a', color: '#fff',
    border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 13.5,
  },
  rejectBtn: {
    flex: 1, minWidth: 120, padding: 12, background: '#dc2626', color: '#fff',
    border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 13.5,
  },
  cancelBtn: {
    flex: 1, minWidth: 100, padding: 12, background: '#e2e8f0', color: '#1e293b',
    border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 13.5,
  },

  toast: {
    position: 'fixed',
    bottom: 24,
    right: 24,
    color: '#fff',
    padding: '14px 20px',
    borderRadius: 12,
    fontSize: 13.5,
    fontWeight: 600,
    boxShadow: '0 15px 40px rgba(0,0,0,0.25)',
    zIndex: 2000,
  },
};

const badge = (status) => ({
  padding: '5px 11px',
  borderRadius: 20,
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: 0.4,
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