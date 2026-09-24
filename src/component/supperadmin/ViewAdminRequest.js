
// import React, { useState, useEffect } from 'react';
// import axios from 'axios';

// const ViewAdminRequests = () => {
//   const [requests, setRequests] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [selected, setSelected] = useState(null);
//   const [note, setNote] = useState('');
//   const [actionLoading, setActionLoading] = useState(false);
//   const [toast, setToast] = useState(null);

//   const superAdminId = Number(localStorage.getItem('userId'));

//   /* ---------------- FETCH ---------------- */
//   const fetchRequests = async () => {
//     setLoading(true);
//     try {
//       const res = await axios.get('http://localhost:8080/api/admin-requests/all');
//       const sorted = [...res.data].sort((a, b) => {
//         if (a.status === 'PENDING' && b.status !== 'PENDING') return -1;
//         if (a.status !== 'PENDING' && b.status === 'PENDING') return 1;
//         return 0;
//       });
//       setRequests(sorted);
//     } catch (err) {
//       console.error(err);
//       showToast('error', 'Failed to load requests.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => { fetchRequests(); }, []);

//   /* ---------------- TOAST ---------------- */
//   const showToast = (type, text) => {
//     setToast({ type, text });
//     setTimeout(() => setToast(null), 3000);
//   };

//   /* ---------------- APPROVE / REJECT ---------------- */
//   const approve = async (id) => {
//     setActionLoading(true);
//     try {
//       await axios.put(
//         `http://localhost:8080/api/admin-requests/approve/${id}`,
//         null,
//         { params: { superAdminId, note: note || 'Approved' } }
//       );
//       showToast('success', 'Request approved successfully.');
//       setSelected(null); setNote('');
//       fetchRequests();
//     } catch (err) {
//       showToast('error', err.response?.data || err.message);
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   const reject = async (id) => {
//     setActionLoading(true);
//     try {
//       await axios.put(
//         `http://localhost:8080/api/admin-requests/reject/${id}`,
//         null,
//         { params: { superAdminId, note: note || 'Rejected' } }
//       );
//       showToast('success', 'Request rejected.');
//       setSelected(null); setNote('');
//       fetchRequests();
//     } catch (err) {
//       showToast('error', err.response?.data || err.message);
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   /* ---------------- DELETE ---------------- */
//   const handleDelete = async (id) => {
//     if (!window.confirm('Are you sure you want to delete this request?')) return;
//     setActionLoading(true);
//     try {
//       await axios.delete(
//         `http://localhost:8080/api/admin-requests/delete/${id}`,
//         { params: { superAdminId } }
//       );
//       showToast('success', 'Request deleted.');
//       fetchRequests();
//     } catch (err) {
//       showToast('error', err.response?.data || err.message);
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   /* ---------------- RENDER ---------------- */
//   return (
//     <div style={styles.page}>
//       {/* Header */}
//       <div style={styles.header}>
//         <div>
//           <h1 style={styles.title}>Admin Requests</h1>
//           <p style={styles.subtitle}>
//             Review, approve, reject or delete requests sent by admins.
//           </p>
//         </div>
//         <button onClick={fetchRequests} style={styles.refreshBtn}>
//           ⟳ Refresh
//         </button>
//       </div>

//       {/* Stats */}
//       <div style={styles.statsRow}>
//         <StatCard label="Total"    value={requests.length}                                     color="#2563eb" />
//         <StatCard label="Pending"  value={requests.filter(r => r.status === 'PENDING').length}  color="#d97706" />
//         <StatCard label="Approved" value={requests.filter(r => r.status === 'APPROVED').length} color="#16a34a" />
//         <StatCard label="Rejected" value={requests.filter(r => r.status === 'REJECTED').length} color="#dc2626" />
//       </div>

//       {/* Table */}
//       {loading ? (
//         <div style={styles.emptyBox}>Loading requests…</div>
//       ) : requests.length === 0 ? (
//         <div style={styles.emptyBox}>No requests yet.</div>
//       ) : (
//         <div style={styles.tableCard}>
//           <table style={styles.table}>
//             <thead>
//               <tr style={styles.theadRow}>
//                 <th style={styles.th}>Type</th>
//                 <th style={styles.th}>Admin</th>
//                 <th style={styles.th}>Qty</th>
//                 {/* <th style={styles.th}>Staff</th> */}
//                 <th style={styles.th}>Status</th>
//                 <th style={styles.th}>Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {requests.map((r) => (
//                 <tr key={r.id} style={styles.tr}>
//                   <td style={styles.td}>
//                     {r.requestType === 'STOCK_REQUEST' ? '📦 Stock' : '📤adminRequest'}
//                   </td>
//                   <td style={{ ...styles.td, fontWeight: 600, color: '#1e293b' }}>
//                     {r.adminName}
//                   </td>
//                   <td style={styles.td}>{r.quantity}</td>
//                   {/* <td style={styles.td}>{r.staffName || '—'}</td> */}
//                   <td style={styles.td}>
//                     <span style={badge(r.status)}>{r.status}</span>
//                   </td>
//                   <td style={styles.td}>
//                     <div style={styles.actionGroup}>
//                       {r.status === 'PENDING' && (
//                         <button
//                           onClick={() => { setSelected(r); setNote(''); }}
//                           style={styles.respondBtn}
//                           title="Respond"
//                         >
//                           Respond
//                         </button>
//                       )}
//                       <button
//                         onClick={() => handleDelete(r.id)}
//                         style={styles.deleteBtn}
//                         title="Delete"
//                       >
//                         🗑 Delete
//                       </button>
//                     </div>
//                     {r.status !== 'PENDING' && r.superAdminNote && (
//                       <div style={styles.noteText}>{r.superAdminNote}</div>
//                     )}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}

//       {/* ---------- RESPOND PANEL ---------- */}
//       {selected && (
//         <div style={styles.respondCard}>
//           <div style={styles.respondHeader}>
//             <h3 style={styles.respondTitle}>Respond to {selected.adminName}</h3>
//             <button
//               onClick={() => { setSelected(null); setNote(''); }}
//               style={styles.closeBtn}
//             >
//               ✕
//             </button>
//           </div>

//           <div style={styles.respondGrid}>
//             <Info label="Product"  value={selected.productName} />
//             <Info label="Quantity" value={selected.quantity} />
//             {selected.staffName && <Info label="Staff" value={selected.staffName} />}
//             <Info label="Reason"   value={selected.description} />
//           </div>

//           <label style={styles.label}>Your Note</label>
//           <textarea
//             value={note}
//             onChange={(e) => setNote(e.target.value)}
//             rows={3}
//             style={styles.textarea}
//             placeholder="Write a short note (optional)"
//           />

//           <div style={styles.btnRow}>
//             <button
//               onClick={() => approve(selected.id)}
//               disabled={actionLoading}
//               style={styles.approveBtn}
//             >
//               ✅ Approve
//             </button>
//             <button
//               onClick={() => reject(selected.id)}
//               disabled={actionLoading}
//               style={styles.rejectBtn}
//             >
//               ❌ Reject
//             </button>
//             <button
//               onClick={() => { setSelected(null); setNote(''); }}
//               style={styles.cancelBtn}
//             >
//               Cancel
//             </button>
//           </div>
//         </div>
//       )}

//       {/* ---------- TOAST ---------- */}
//       {toast && (
//         <div
//           style={{
//             ...styles.toast,
//             background: toast.type === 'success' ? '#16a34a' : '#dc2626',
//           }}
//         >
//           {toast.type === 'success' ? '✓' : '⚠'} {toast.text}
//         </div>
//       )}
//     </div>
//   );
// };

// /* ---------------- Small components ---------------- */
// const StatCard = ({ label, value, color }) => (
//   <div style={styles.statCard}>
//     <div style={{ ...styles.statValue, color }}>{value}</div>
//     <div style={styles.statLabel}>{label}</div>
//   </div>
// );

// const Info = ({ label, value }) => (
//   <div style={styles.infoBox}>
//     <div style={styles.infoLabel}>{label}</div>
//     <div style={styles.infoValue}>{value || '—'}</div>
//   </div>
// );

// /* ---------------- Styles ---------------- */
// const styles = {
//   page: {
//     minHeight: '100vh',
//     padding: '30px 40px',
//     background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)',
//     fontFamily: '"Segoe UI", Roboto, Arial, sans-serif',
//   },
//   header: {
//     display: 'flex',
//     justifyContent: 'space-between',
//     alignItems: 'flex-start',
//     marginBottom: 22,
//     flexWrap: 'wrap',
//     gap: 12,
//   },
//   title: {
//     margin: 0,
//     fontSize: 28,
//     fontWeight: 800,
//     color: '#0f172a',
//     letterSpacing: 0.3,
//   },
//   subtitle: {
//     margin: '6px 0 0',
//     color: '#64748b',
//     fontSize: 14,
//   },
//   refreshBtn: {
//     padding: '10px 18px',
//     background: '#fff',
//     color: '#2563eb',
//     border: '1px solid #c7d2fe',
//     borderRadius: 10,
//     fontSize: 13,
//     fontWeight: 600,
//     cursor: 'pointer',
//     boxShadow: '0 2px 8px rgba(37,99,235,0.08)',
//   },

//   statsRow: {
//     display: 'grid',
//     gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
//     gap: 14,
//     marginBottom: 22,
//   },
//   statCard: {
//     background: '#fff',
//     padding: '16px 20px',
//     borderRadius: 14,
//     boxShadow: '0 4px 14px rgba(15,23,42,0.06)',
//     border: '1px solid #eef2f7',
//   },
//   statValue: { fontSize: 24, fontWeight: 800, lineHeight: 1.1 },
//   statLabel: {
//     marginTop: 4,
//     fontSize: 12,
//     color: '#64748b',
//     fontWeight: 600,
//     textTransform: 'uppercase',
//     letterSpacing: 0.5,
//   },

//   tableCard: {
//     background: '#fff',
//     borderRadius: 16,
//     overflow: 'hidden',
//     boxShadow: '0 10px 30px rgba(15,23,42,0.08)',
//     border: '1px solid #eef2f7',
//   },
//   table: { width: '100%', borderCollapse: 'collapse' },
//   theadRow: { background: '#f1f5f9' },
//   th: {
//     padding: '14px 16px',
//     textAlign: 'left',
//     fontSize: 12.5,
//     color: '#334155',
//     fontWeight: 700,
//     textTransform: 'uppercase',
//     letterSpacing: 0.5,
//   },
//   tr: { borderBottom: '1px solid #e2e8f0', transition: 'background 0.15s ease' },
//   td: { padding: '14px 16px', fontSize: 13.5, color: '#475569', verticalAlign: 'top' },
//   actionGroup: { display: 'flex', gap: 6, flexWrap: 'wrap' },
//   respondBtn: {
//     padding: '6px 12px',
//     background: '#2563eb',
//     color: '#fff',
//     border: 'none',
//     borderRadius: 6,
//     fontSize: 12,
//     fontWeight: 600,
//     cursor: 'pointer',
//   },
//   deleteBtn: {
//     padding: '6px 12px',
//     background: '#dc2626',
//     color: '#fff',
//     border: 'none',
//     borderRadius: 6,
//     fontSize: 12,
//     fontWeight: 600,
//     cursor: 'pointer',
//   },
//   noteText: {
//     marginTop: 6,
//     fontSize: 11.5,
//     color: '#94a3b8',
//     fontStyle: 'italic',
//   },

//   emptyBox: {
//     background: '#fff',
//     padding: 40,
//     textAlign: 'center',
//     color: '#64748b',
//     borderRadius: 16,
//     boxShadow: '0 10px 30px rgba(15,23,42,0.06)',
//     fontSize: 14,
//   },

//   respondCard: {
//     marginTop: 25,
//     background: '#fff',
//     padding: 26,
//     borderRadius: 16,
//     boxShadow: '0 15px 40px rgba(37,99,235,0.15)',
//     border: '2px solid #2563eb',
//   },
//   respondHeader: {
//     display: 'flex',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 14,
//   },
//   respondTitle: { margin: 0, fontSize: 18, color: '#0f172a', fontWeight: 700 },
//   closeBtn: {
//     background: 'transparent',
//     border: 'none',
//     fontSize: 18,
//     color: '#94a3b8',
//     cursor: 'pointer',
//     lineHeight: 1,
//   },
//   respondGrid: {
//     display: 'grid',
//     gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
//     gap: 12,
//     marginBottom: 14,
//   },
//   infoBox: {
//     background: '#f8fafc',
//     padding: '10px 14px',
//     borderRadius: 10,
//     border: '1px solid #eef2f7',
//   },
//   infoLabel: {
//     fontSize: 11,
//     color: '#94a3b8',
//     fontWeight: 700,
//     textTransform: 'uppercase',
//     letterSpacing: 0.5,
//   },
//   infoValue: { marginTop: 3, fontSize: 14, color: '#1e293b', fontWeight: 600 },
//   label: {
//     display: 'block',
//     margin: '14px 0 6px',
//     fontSize: 12.5,
//     fontWeight: 700,
//     color: '#334155',
//   },
//   textarea: {
//     width: '100%',
//     padding: 12,
//     borderRadius: 10,
//     border: '1px solid #d9dee8',
//     boxSizing: 'border-box',
//     fontFamily: 'inherit',
//     fontSize: 13.5,
//     resize: 'vertical',
//     outline: 'none',
//   },
//   btnRow: { display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' },
//   approveBtn: {
//     flex: 1, minWidth: 120, padding: 12, background: '#16a34a', color: '#fff',
//     border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 13.5,
//   },
//   rejectBtn: {
//     flex: 1, minWidth: 120, padding: 12, background: '#dc2626', color: '#fff',
//     border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 13.5,
//   },
//   cancelBtn: {
//     flex: 1, minWidth: 100, padding: 12, background: '#e2e8f0', color: '#1e293b',
//     border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 13.5,
//   },

//   toast: {
//     position: 'fixed',
//     bottom: 24,
//     right: 24,
//     color: '#fff',
//     padding: '14px 20px',
//     borderRadius: 12,
//     fontSize: 13.5,
//     fontWeight: 600,
//     boxShadow: '0 15px 40px rgba(0,0,0,0.25)',
//     zIndex: 2000,
//   },
// };

// const badge = (status) => ({
//   padding: '5px 11px',
//   borderRadius: 20,
//   fontSize: 11,
//   fontWeight: 700,
//   letterSpacing: 0.4,
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

// import React, { useState, useEffect } from 'react';
// import axios from 'axios';

// const ViewAdminRequests = () => {
//   const [requests, setRequests] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [selected, setSelected] = useState(null);
//   const [note, setNote] = useState('');
//   const [actionLoading, setActionLoading] = useState(false);
//   const [toast, setToast] = useState(null);

//   // Update modal state
//   const [showUpdate, setShowUpdate] = useState(false);
//   const [updateForm, setUpdateForm] = useState(null);
//   const [savingUpdate, setSavingUpdate] = useState(false);

//   const superAdminId = Number(localStorage.getItem('userId'));

//   /* ---------------- FETCH ---------------- */
//   const fetchRequests = async () => {
//     setLoading(true);
//     try {
//       const res = await axios.get('http://localhost:8080/api/admin-requests/all');
//       const sorted = [...res.data].sort((a, b) => {
//         if (a.status === 'PENDING' && b.status !== 'PENDING') return -1;
//         if (a.status !== 'PENDING' && b.status === 'PENDING') return 1;
//         return 0;
//       });
//       setRequests(sorted);
//     } catch (err) {
//       console.error(err);
//       showToast('error', 'Failed to load requests.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => { fetchRequests(); }, []);

//   /* ---------------- TOAST ---------------- */
//   const showToast = (type, text) => {
//     setToast({ type, text });
//     setTimeout(() => setToast(null), 3000);
//   };

//   /* ---------------- APPROVE / REJECT ---------------- */
//   const approve = async (id) => {
//     setActionLoading(true);
//     try {
//       await axios.put(
//         `http://localhost:8080/api/admin-requests/approve/${id}`,
//         null,
//         { params: { superAdminId, note: note || 'Approved' } }
//       );
//       showToast('success', 'Request approved successfully.');
//       setSelected(null); setNote('');
//       fetchRequests();
//     } catch (err) {
//       showToast('error', err.response?.data || err.message);
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   const reject = async (id) => {
//     setActionLoading(true);
//     try {
//       await axios.put(
//         `http://localhost:8080/api/admin-requests/reject/${id}`,
//         null,
//         { params: { superAdminId, note: note || 'Rejected' } }
//       );
//       showToast('success', 'Request rejected.');
//       setSelected(null); setNote('');
//       fetchRequests();
//     } catch (err) {
//       showToast('error', err.response?.data || err.message);
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   /* ---------------- DELETE ---------------- */
//   const handleDelete = async (id) => {
//     if (!window.confirm('Are you sure you want to delete this request?')) return;
//     setActionLoading(true);
//     try {
//       await axios.delete(
//         `http://localhost:8080/api/admin-requests/delete/${id}`,
//         { params: { superAdminId } }
//       );
//       showToast('success', 'Request deleted.');
//       fetchRequests();
//     } catch (err) {
//       showToast('error', err.response?.data || err.message);
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   /* ---------------- OPEN UPDATE MODAL ---------------- */
//   const openUpdate = (req) => {
//     setUpdateForm({
//       id: req.id,
//       requestType: req.requestType || 'STOCK_REQUEST',
//       status: req.status || 'PENDING',
//       quantity: req.quantity ?? '',
//       productName: req.productName ?? '',
//       description: req.description ?? '',
//       superAdminNote: req.superAdminNote ?? '',
//       // ⚠️ departmentName and staffName NOT editable — kept for display only
//       departmentName: req.departmentName ?? '',
//     });
//     setShowUpdate(true);
//   };

//   const closeUpdate = () => {
//     setShowUpdate(false);
//     setUpdateForm(null);
//   };

//   const handleUpdateChange = (e) => {
//     const { name, value } = e.target;
//     setUpdateForm((prev) => ({ ...prev, [name]: value }));
//   };

//   /* ---------------- SUBMIT UPDATE ---------------- */
//   const submitUpdate = async (e) => {
//     e.preventDefault();
//     if (!updateForm) return;

//     if (!updateForm.quantity || Number(updateForm.quantity) <= 0) {
//       showToast('error', 'Please enter a valid quantity.');
//       return;
//     }

//     setSavingUpdate(true);
//     try {
//       // ⚠️ NO staffName, NO departmentName in payload —
//       //     backend keeps the existing values untouched.
//       await axios.put(
//         `http://localhost:8080/api/admin-requests/update/${updateForm.id}`,
//         {
//           requestType: updateForm.requestType,
//           status: updateForm.status,
//           quantity: Number(updateForm.quantity),
//           productName: updateForm.productName?.trim() || null,
//           description: updateForm.description?.trim() || null,
//           superAdminNote: updateForm.superAdminNote?.trim() || null,
//         },
//         { params: { superAdminId } }
//       );
//       showToast('success', 'Request updated successfully!');
//       closeUpdate();
//       fetchRequests();
//     } catch (err) {
//       showToast('error', err.response?.data || err.message || 'Failed to update request.');
//     } finally {
//       setSavingUpdate(false);
//     }
//   };

//   /* ---------------- RENDER ---------------- */
//   return (
//     <div style={styles.page}>
//       {/* Header */}
//       <div style={styles.header}>
//         <div>
//           <h1 style={styles.title}>Admin Requests</h1>
//           <p style={styles.subtitle}>
//             Review, approve, reject, update or delete requests sent by admins.
//           </p>
//         </div>
//         <button onClick={fetchRequests} style={styles.refreshBtn}>
//           ⟳ Refresh
//         </button>
//       </div>

//       {/* Stats */}
//       <div style={styles.statsRow}>
//         <StatCard label="Total"    value={requests.length}                                     color="#2563eb" />
//         <StatCard label="Pending"  value={requests.filter(r => r.status === 'PENDING').length}  color="#d97706" />
//         <StatCard label="Approved" value={requests.filter(r => r.status === 'APPROVED').length} color="#16a34a" />
//         <StatCard label="Rejected" value={requests.filter(r => r.status === 'REJECTED').length} color="#dc2626" />
//       </div>

//       {/* Table */}
//       {loading ? (
//         <div style={styles.emptyBox}>Loading requests…</div>
//       ) : requests.length === 0 ? (
//         <div style={styles.emptyBox}>No requests yet.</div>
//       ) : (
//         <div style={styles.tableCard}>
//           <table style={styles.table}>
//             <thead>
//               <tr style={styles.theadRow}>
//                 <th style={styles.th}>Type</th>
//                 <th style={styles.th}>Admin</th>
//                 <th style={styles.th}>Qty</th>
//                 <th style={styles.th}>Status</th>
//                 <th style={styles.th}>Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {requests.map((r) => (
//                 <tr key={r.id} style={styles.tr}>
//                   <td style={styles.td}>
//                     {r.requestType === 'STOCK_REQUEST' ? '📦 Stock' : '📤 AdminRequest'}
//                   </td>
//                   <td style={{ ...styles.td, fontWeight: 600, color: '#1e293b' }}>
//                     {r.adminName}
//                   </td>
//                   <td style={styles.td}>{r.quantity}</td>
//                   <td style={styles.td}>
//                     <span style={badge(r.status)}>{r.status}</span>
//                   </td>
//                   <td style={styles.td}>
//                     <div style={styles.actionGroup}>
//                       {r.status === 'PENDING' && (
//                         <button
//                           onClick={() => { setSelected(r); setNote(''); }}
//                           style={styles.respondBtn}
//                           title="Respond"
//                         >
//                           Respond
//                         </button>
//                       )}

//                       <button
//                         onClick={() => openUpdate(r)}
//                         style={styles.updateBtn}
//                         title="Update"
//                       >
//                         ✏️ Update
//                       </button>

//                       <button
//                         onClick={() => handleDelete(r.id)}
//                         style={styles.deleteBtn}
//                         title="Delete"
//                       >
//                         🗑 Delete
//                       </button>
//                     </div>
//                     {r.status !== 'PENDING' && r.superAdminNote && (
//                       <div style={styles.noteText}>{r.superAdminNote}</div>
//                     )}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}

//       {/* ---------- RESPOND PANEL ---------- */}
//       {selected && (
//         <div style={styles.respondCard}>
//           <div style={styles.respondHeader}>
//             <h3 style={styles.respondTitle}>Respond to {selected.adminName}</h3>
//             <button
//               onClick={() => { setSelected(null); setNote(''); }}
//               style={styles.closeBtn}
//             >
//               ✕
//             </button>
//           </div>

//           <div style={styles.respondGrid}>
//             <Info label="Product"  value={selected.productName} />
//             <Info label="Quantity" value={selected.quantity} />
//             {selected.staffName && <Info label="Staff" value={selected.staffName} />}
//             <Info label="Reason"   value={selected.description} />
//           </div>

//           <label style={styles.label}>Your Note</label>
//           <textarea
//             value={note}
//             onChange={(e) => setNote(e.target.value)}
//             rows={3}
//             style={styles.textarea}
//             placeholder="Write a short note (optional)"
//           />

//           <div style={styles.btnRow}>
//             <button
//               onClick={() => approve(selected.id)}
//               disabled={actionLoading}
//               style={styles.approveBtn}
//             >
//               ✅ Approve
//             </button>
//             <button
//               onClick={() => reject(selected.id)}
//               disabled={actionLoading}
//               style={styles.rejectBtn}
//             >
//               ❌ Reject
//             </button>
//             <button
//               onClick={() => { setSelected(null); setNote(''); }}
//               style={styles.cancelBtn}
//             >
//               Cancel
//             </button>
//           </div>
//         </div>
//       )}

//       {/* ---------- UPDATE MODAL ---------- */}
//       {showUpdate && updateForm && (
//         <div style={styles.overlay} onClick={closeUpdate}>
//           <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
//             <div style={styles.modalHeader}>
//               <h3 style={styles.modalTitle}>Update Request #{updateForm.id}</h3>
//               <button onClick={closeUpdate} style={styles.closeBtn}>✕</button>
//             </div>

//             <form onSubmit={submitUpdate}>
//               <div style={styles.modalGrid}>
//                 <div style={styles.inputGroup}>
//                   <label style={styles.inputLabel}>Request Type</label>
//                   <select
//                     name="requestType"
//                     value={updateForm.requestType}
//                     onChange={handleUpdateChange}
//                     style={styles.input}
//                   >
//                     <option value="STOCK_REQUEST">STOCK_REQUEST</option>
//                     <option value="ADMIN_REQUEST">ADMIN_REQUEST</option>
//                   </select>
//                 </div>

//                 <div style={styles.inputGroup}>
//                   <label style={styles.inputLabel}>Status</label>
//                   <select
//                     name="status"
//                     value={updateForm.status}
//                     onChange={handleUpdateChange}
//                     style={styles.input}
//                   >
//                     <option value="PENDING">PENDING</option>
//                     <option value="APPROVED">APPROVED</option>
//                     <option value="REJECTED">REJECTED</option>
//                     <option value="COMPLETED">COMPLETED</option>
//                   </select>
//                 </div>

//                 <div style={styles.inputGroup}>
//                   <label style={styles.inputLabel}>Quantity</label>
//                   <input
//                     type="number"
//                     min="1"
//                     name="quantity"
//                     value={updateForm.quantity}
//                     onChange={handleUpdateChange}
//                     style={styles.input}
//                     required
//                   />
//                 </div>

//                 <div style={styles.inputGroup}>
//                   <label style={styles.inputLabel}>Product Name</label>
//                   <input
//                     name="productName"
//                     value={updateForm.productName}
//                     onChange={handleUpdateChange}
//                     style={styles.input}
//                   />
//                 </div>

//                 {/* ✅ Department shown as read-only (auto-filled from existing data) */}
//                 <div style={styles.inputGroup}>
//                   <label style={styles.inputLabel}>Department (auto)</label>
//                   <input
//                     name="departmentName"
//                     value={updateForm.departmentName}
//                     readOnly
//                     style={{ ...styles.input, backgroundColor: '#f1f5f9', color: '#64748b' }}
//                     title="Department is filled automatically and cannot be changed here"
//                   />
//                 </div>

//                 <div style={{ ...styles.inputGroup, gridColumn: '1 / -1' }}>
//                   <label style={styles.inputLabel}>Description</label>
//                   <textarea
//                     name="description"
//                     value={updateForm.description}
//                     onChange={handleUpdateChange}
//                     rows={3}
//                     style={styles.input}
//                   />
//                 </div>

//                 <div style={{ ...styles.inputGroup, gridColumn: '1 / -1' }}>
//                   <label style={styles.inputLabel}>Super Admin Note</label>
//                   <textarea
//                     name="superAdminNote"
//                     value={updateForm.superAdminNote}
//                     onChange={handleUpdateChange}
//                     rows={2}
//                     style={styles.input}
//                   />
//                 </div>
//               </div>

//               <div style={styles.modalActions}>
//                 <button
//                   type="button"
//                   onClick={closeUpdate}
//                   disabled={savingUpdate}
//                   style={styles.cancelBtn}
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   disabled={savingUpdate}
//                   style={styles.saveBtn}
//                 >
//                   {savingUpdate ? 'Saving…' : 'Save Changes'}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* ---------- TOAST ---------- */}
//       {toast && (
//         <div
//           style={{
//             ...styles.toast,
//             background: toast.type === 'success' ? '#16a34a' : '#dc2626',
//           }}
//         >
//           {toast.type === 'success' ? '✓' : '⚠'} {toast.text}
//         </div>
//       )}
//     </div>
//   );
// };

// /* ---------------- Small components ---------------- */
// const StatCard = ({ label, value, color }) => (
//   <div style={styles.statCard}>
//     <div style={{ ...styles.statValue, color }}>{value}</div>
//     <div style={styles.statLabel}>{label}</div>
//   </div>
// );

// const Info = ({ label, value }) => (
//   <div style={styles.infoBox}>
//     <div style={styles.infoLabel}>{label}</div>
//     <div style={styles.infoValue}>{value || '—'}</div>
//   </div>
// );

// /* ---------------- Styles ---------------- */
// const styles = {
//   page: {
//     minHeight: '100vh',
//     padding: '30px 40px',
//     background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)',
//     fontFamily: '"Segoe UI", Roboto, Arial, sans-serif',
//   },
//   header: {
//     display: 'flex',
//     justifyContent: 'space-between',
//     alignItems: 'flex-start',
//     marginBottom: 22,
//     flexWrap: 'wrap',
//     gap: 12,
//   },
//   title: {
//     margin: 0,
//     fontSize: 28,
//     fontWeight: 800,
//     color: '#0f172a',
//     letterSpacing: 0.3,
//   },
//   subtitle: {
//     margin: '6px 0 0',
//     color: '#64748b',
//     fontSize: 14,
//   },
//   refreshBtn: {
//     padding: '10px 18px',
//     background: '#fff',
//     color: '#2563eb',
//     border: '1px solid #c7d2fe',
//     borderRadius: 10,
//     fontSize: 13,
//     fontWeight: 600,
//     cursor: 'pointer',
//     boxShadow: '0 2px 8px rgba(37,99,235,0.08)',
//   },

//   statsRow: {
//     display: 'grid',
//     gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
//     gap: 14,
//     marginBottom: 22,
//   },
//   statCard: {
//     background: '#fff',
//     padding: '16px 20px',
//     borderRadius: 14,
//     boxShadow: '0 4px 14px rgba(15,23,42,0.06)',
//     border: '1px solid #eef2f7',
//   },
//   statValue: { fontSize: 24, fontWeight: 800, lineHeight: 1.1 },
//   statLabel: {
//     marginTop: 4,
//     fontSize: 12,
//     color: '#64748b',
//     fontWeight: 600,
//     textTransform: 'uppercase',
//     letterSpacing: 0.5,
//   },

//   tableCard: {
//     background: '#fff',
//     borderRadius: 16,
//     overflow: 'hidden',
//     boxShadow: '0 10px 30px rgba(15,23,42,0.08)',
//     border: '1px solid #eef2f7',
//   },
//   table: { width: '100%', borderCollapse: 'collapse' },
//   theadRow: { background: '#f1f5f9' },
//   th: {
//     padding: '14px 16px',
//     textAlign: 'left',
//     fontSize: 12.5,
//     color: '#334155',
//     fontWeight: 700,
//     textTransform: 'uppercase',
//     letterSpacing: 0.5,
//   },
//   tr: { borderBottom: '1px solid #e2e8f0', transition: 'background 0.15s ease' },
//   td: { padding: '14px 16px', fontSize: 13.5, color: '#475569', verticalAlign: 'top' },
//   actionGroup: { display: 'flex', gap: 6, flexWrap: 'wrap' },
//   respondBtn: {
//     padding: '6px 12px',
//     background: '#2563eb',
//     color: '#fff',
//     border: 'none',
//     borderRadius: 6,
//     fontSize: 12,
//     fontWeight: 600,
//     cursor: 'pointer',
//   },
//   updateBtn: {
//     padding: '6px 12px',
//     background: '#f59e0b',
//     color: '#fff',
//     border: 'none',
//     borderRadius: 6,
//     fontSize: 12,
//     fontWeight: 600,
//     cursor: 'pointer',
//   },
//   deleteBtn: {
//     padding: '6px 12px',
//     background: '#dc2626',
//     color: '#fff',
//     border: 'none',
//     borderRadius: 6,
//     fontSize: 12,
//     fontWeight: 600,
//     cursor: 'pointer',
//   },
//   noteText: {
//     marginTop: 6,
//     fontSize: 11.5,
//     color: '#94a3b8',
//     fontStyle: 'italic',
//   },

//   emptyBox: {
//     background: '#fff',
//     padding: 40,
//     textAlign: 'center',
//     color: '#64748b',
//     borderRadius: 16,
//     boxShadow: '0 10px 30px rgba(15,23,42,0.06)',
//     fontSize: 14,
//   },

//   respondCard: {
//     marginTop: 25,
//     background: '#fff',
//     padding: 26,
//     borderRadius: 16,
//     boxShadow: '0 15px 40px rgba(37,99,235,0.15)',
//     border: '2px solid #2563eb',
//   },
//   respondHeader: {
//     display: 'flex',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 14,
//   },
//   respondTitle: { margin: 0, fontSize: 18, color: '#0f172a', fontWeight: 700 },
//   closeBtn: {
//     background: 'transparent',
//     border: 'none',
//     fontSize: 18,
//     color: '#94a3b8',
//     cursor: 'pointer',
//     lineHeight: 1,
//   },
//   respondGrid: {
//     display: 'grid',
//     gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
//     gap: 12,
//     marginBottom: 14,
//   },
//   infoBox: {
//     background: '#f8fafc',
//     padding: '10px 14px',
//     borderRadius: 10,
//     border: '1px solid #eef2f7',
//   },
//   infoLabel: {
//     fontSize: 11,
//     color: '#94a3b8',
//     fontWeight: 700,
//     textTransform: 'uppercase',
//     letterSpacing: 0.5,
//   },
//   infoValue: { marginTop: 3, fontSize: 14, color: '#1e293b', fontWeight: 600 },
//   label: {
//     display: 'block',
//     margin: '14px 0 6px',
//     fontSize: 12.5,
//     fontWeight: 700,
//     color: '#334155',
//   },
//   textarea: {
//     width: '100%',
//     padding: 12,
//     borderRadius: 10,
//     border: '1px solid #d9dee8',
//     boxSizing: 'border-box',
//     fontFamily: 'inherit',
//     fontSize: 13.5,
//     resize: 'vertical',
//     outline: 'none',
//   },
//   btnRow: { display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' },
//   approveBtn: {
//     flex: 1, minWidth: 120, padding: 12, background: '#16a34a', color: '#fff',
//     border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 13.5,
//   },
//   rejectBtn: {
//     flex: 1, minWidth: 120, padding: 12, background: '#dc2626', color: '#fff',
//     border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 13.5,
//   },
//   cancelBtn: {
//     flex: 1, minWidth: 100, padding: 12, background: '#e2e8f0', color: '#1e293b',
//     border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 13.5,
//   },
//   saveBtn: {
//     flex: 1, minWidth: 120, padding: 12, background: '#2563eb', color: '#fff',
//     border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 13.5,
//   },

//   overlay: {
//     position: 'fixed',
//     inset: 0,
//     background: 'rgba(15,23,42,0.5)',
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'center',
//     zIndex: 1500,
//     padding: 20,
//   },
//   modal: {
//     background: '#fff',
//     borderRadius: 16,
//     padding: 26,
//     width: '100%',
//     maxWidth: 640,
//     maxHeight: '90vh',
//     overflowY: 'auto',
//     boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
//   },
//   modalHeader: {
//     display: 'flex',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 18,
//   },
//   modalTitle: { margin: 0, fontSize: 18, color: '#0f172a', fontWeight: 700 },
//   modalGrid: {
//     display: 'grid',
//     gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
//     gap: 14,
//   },
//   inputGroup: { display: 'flex', flexDirection: 'column' },
//   inputLabel: {
//     marginBottom: 6,
//     fontSize: 12.5,
//     fontWeight: 700,
//     color: '#334155',
//   },
//   input: {
//     width: '100%',
//     padding: '10px 12px',
//     border: '1px solid #d9dee8',
//     borderRadius: 8,
//     fontSize: 13.5,
//     outline: 'none',
//     fontFamily: 'inherit',
//     boxSizing: 'border-box',
//   },
//   modalActions: {
//     display: 'flex',
//     justifyContent: 'flex-end',
//     gap: 10,
//     marginTop: 20,
//   },

//   toast: {
//     position: 'fixed',
//     bottom: 24,
//     right: 24,
//     color: '#fff',
//     padding: '14px 20px',
//     borderRadius: 12,
//     fontSize: 13.5,
//     fontWeight: 600,
//     boxShadow: '0 15px 40px rgba(0,0,0,0.25)',
//     zIndex: 2000,
//   },
// };

// const badge = (status) => ({
//   padding: '5px 11px',
//   borderRadius: 20,
//   fontSize: 11,
//   fontWeight: 700,
//   letterSpacing: 0.4,
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

  // Update modal state
  const [showUpdate, setShowUpdate] = useState(false);
  const [updateForm, setUpdateForm] = useState(null);
  const [savingUpdate, setSavingUpdate] = useState(false);

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

  /* ---------------- OPEN UPDATE MODAL ---------------- */
  const openUpdate = (req) => {
    setUpdateForm({
      id: req.id,
      requestType: req.requestType || 'STOCK_REQUEST',
      status: req.status || 'PENDING',
      quantity: req.quantity ?? '',
      productName: req.productName ?? '',
      description: req.description ?? '',
      superAdminNote: req.superAdminNote ?? '',
      // ⚠️ departmentName and staffName NOT editable — kept for display only
      departmentName: req.departmentName ?? '',
    });
    setShowUpdate(true);
  };

  const closeUpdate = () => {
    setShowUpdate(false);
    setUpdateForm(null);
  };

  const handleUpdateChange = (e) => {
    const { name, value } = e.target;
    setUpdateForm((prev) => ({ ...prev, [name]: value }));
  };

  /* ---------------- SUBMIT UPDATE ---------------- */
  const submitUpdate = async (e) => {
    e.preventDefault();
    if (!updateForm) return;

    if (!updateForm.quantity || Number(updateForm.quantity) <= 0) {
      showToast('error', 'Please enter a valid quantity.');
      return;
    }

    setSavingUpdate(true);
    try {
      // ⚠️ NO staffName, NO departmentName in payload —
      //     backend keeps the existing values untouched.
      await axios.put(
        `http://localhost:8080/api/admin-requests/update/${updateForm.id}`,
        {
          requestType: updateForm.requestType,
          status: updateForm.status,
          quantity: Number(updateForm.quantity),
          productName: updateForm.productName?.trim() || null,
          description: updateForm.description?.trim() || null,
          superAdminNote: updateForm.superAdminNote?.trim() || null,
        },
        { params: { superAdminId } }
      );
      showToast('success', 'Request updated successfully!');
      closeUpdate();
      fetchRequests();
    } catch (err) {
      showToast('error', err.response?.data || err.message || 'Failed to update request.');
    } finally {
      setSavingUpdate(false);
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
            Review, approve, reject, update or delete requests sent by admins.
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
                {/* ✅ NEW COLUMNS */}
                <th style={styles.th}>Product Name</th>
                <th style={styles.th}>Qty</th>
                <th style={styles.th}>Description</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Super Admin Note</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id} style={styles.tr}>
                  <td style={styles.td}>
                    {r.requestType === 'STOCK_REQUEST' ? '📦 Stock request' : '📤 AdminRequest'}
                  </td>
                  <td style={{ ...styles.td, fontWeight: 600, color: '#1e293b' }}>
                    {r.adminName}
                  </td>

                  {/* ✅ Product Name */}
                  <td style={styles.td}>{r.productName || '—'}</td>

                  <td style={styles.td}>{r.quantity}</td>

                  {/* ✅ Description */}
                  <td style={styles.td}>{r.description || '—'}</td>

                  <td style={styles.td}>
                    <span style={badge(r.status)}>{r.status}</span>
                  </td>

                  {/* ✅ Super Admin Note */}
                  <td style={{ ...styles.td, fontStyle: r.superAdminNote ? 'italic' : 'normal', color: '#64748b' }}>
                    {r.superAdminNote || '—'}
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
                        onClick={() => openUpdate(r)}
                        style={styles.updateBtn}
                        title="Update"
                      >
                        ✏️ Update
                      </button>

                      <button
                        onClick={() => handleDelete(r.id)}
                        style={styles.deleteBtn}
                        title="Delete"
                      >
                        🗑 Delete
                      </button>
                    </div>
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

      {/* ---------- UPDATE MODAL ---------- */}
      {showUpdate && updateForm && (
        <div style={styles.overlay} onClick={closeUpdate}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Update Request #{updateForm.id}</h3>
              <button onClick={closeUpdate} style={styles.closeBtn}>✕</button>
            </div>

            <form onSubmit={submitUpdate}>
              <div style={styles.modalGrid}>
                <div style={styles.inputGroup}>
                  <label style={styles.inputLabel}>Request Type</label>
                  <select
                    name="requestType"
                    value={updateForm.requestType}
                    onChange={handleUpdateChange}
                    style={styles.input}
                  >
                    <option value="STOCK_REQUEST">STOCK_REQUEST</option>
                    {/* <option value="ADMIN_REQUEST">ADMIN_REQUEST</option> */}
                  </select>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.inputLabel}>Status</label>
                  <select
                    name="status"
                    value={updateForm.status}
                    onChange={handleUpdateChange}
                    style={styles.input}
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="APPROVED">APPROVED</option>
                    <option value="REJECTED">REJECTED</option>
                    <option value="COMPLETED">COMPLETED</option>
                  </select>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.inputLabel}>Quantity</label>
                  <input
                    type="number"
                    min="1"
                    name="quantity"
                    value={updateForm.quantity}
                    onChange={handleUpdateChange}
                    style={styles.input}
                    required
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.inputLabel}>Product Name</label>
                  <input
                    name="productName"
                    value={updateForm.productName}
                    onChange={handleUpdateChange}
                    style={styles.input}
                  />
                </div>

                {/* ✅ Department shown as read-only (auto-filled from existing data) */}
                <div style={styles.inputGroup}>
                  <label style={styles.inputLabel}>Department (auto)</label>
                  <input
                    name="departmentName"
                    value={updateForm.departmentName}
                    readOnly
                    style={{ ...styles.input, backgroundColor: '#f1f5f9', color: '#64748b' }}
                    title="Department is filled automatically and cannot be changed here"
                  />
                </div>

                <div style={{ ...styles.inputGroup, gridColumn: '1 / -1' }}>
                  <label style={styles.inputLabel}>Description</label>
                  <textarea
                    name="description"
                    value={updateForm.description}
                    onChange={handleUpdateChange}
                    rows={3}
                    style={styles.input}
                  />
                </div>

                <div style={{ ...styles.inputGroup, gridColumn: '1 / -1' }}>
                  <label style={styles.inputLabel}>Super Admin Note</label>
                  <textarea
                    name="superAdminNote"
                    value={updateForm.superAdminNote}
                    onChange={handleUpdateChange}
                    rows={2}
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.modalActions}>
                <button
                  type="button"
                  onClick={closeUpdate}
                  disabled={savingUpdate}
                  style={styles.cancelBtn}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingUpdate}
                  style={styles.saveBtn}
                >
                  {savingUpdate ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
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
    overflowX: 'auto',
    boxShadow: '0 10px 30px rgba(15,23,42,0.08)',
    border: '1px solid #eef2f7',
  },
  table: { width: '100%', borderCollapse: 'collapse', minWidth: 1100 },
  theadRow: { background: '#f1f5f9' },
  th: {
    padding: '14px 16px',
    textAlign: 'left',
    fontSize: 12.5,
    color: '#334155',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    whiteSpace: 'nowrap',
  },
  tr: { borderBottom: '1px solid #e2e8f0', transition: 'background 0.15s ease' },
  td: {
    padding: '14px 16px',
    fontSize: 13.5,
    color: '#475569',
    verticalAlign: 'top',
    maxWidth: 220,
    wordBreak: 'break-word',
  },
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
  updateBtn: {
    padding: '6px 12px',
    background: '#f59e0b',
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
  saveBtn: {
    flex: 1, minWidth: 120, padding: 12, background: '#2563eb', color: '#fff',
    border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 13.5,
  },

  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(15,23,42,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1500,
    padding: 20,
  },
  modal: {
    background: '#fff',
    borderRadius: 16,
    padding: 26,
    width: '100%',
    maxWidth: 640,
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  modalTitle: { margin: 0, fontSize: 18, color: '#0f172a', fontWeight: 700 },
  modalGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 14,
  },
  inputGroup: { display: 'flex', flexDirection: 'column' },
  inputLabel: {
    marginBottom: 6,
    fontSize: 12.5,
    fontWeight: 700,
    color: '#334155',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #d9dee8',
    borderRadius: 8,
    fontSize: 13.5,
    outline: 'none',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 20,
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