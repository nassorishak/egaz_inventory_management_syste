// // // import React, { useState, useEffect } from 'react';
// // // import axios from 'axios';

// // // const ManageRequests = () => {
// // //   const [requests, setRequests] = useState([]);
// // //   const [loading, setLoading] = useState(true);

// // //   const load = async () => {
// // //     try {
// // //       setLoading(true);
// // //       const res = await axios.get('http://localhost:8080/api/product-requests/all');
// // //       setRequests(Array.isArray(res.data) ? res.data : []);
// // //     } catch (err) {
// // //       console.error(err);
// // //     } finally {
// // //       setLoading(false);
// // //     }
// // //   };

// // //   useEffect(() => { load(); }, []);

// // //   const approve = async (id) => {
// // //     if (!window.confirm('Approve this request? Stock will be reduced.')) return;
// // //     try {
// // //       await axios.put(`http://localhost:8080/api/product-requests/approve/${id}`);
// // //       alert('Request approved. Stock updated.');
// // //       load();
// // //     } catch (err) {
// // //       alert('Failed: ' + (err.response?.data || err.message));
// // //     }
// // //   };

// // //   const reject = async (id) => {
// // //     const note = window.prompt('Reason for rejection (optional):') || '';
// // //     try {
// // //       await axios.put(
// // //         `http://localhost:8080/api/product-requests/reject/${id}?note=${encodeURIComponent(note)}`
// // //       );
// // //       alert('Request rejected.');
// // //       load();
// // //     } catch (err) {
// // //       alert('Failed: ' + (err.response?.data || err.message));
// // //     }
// // //   };

// // //   return (
// // //     <div style={{ padding: '30px', background: '#f8fafc', minHeight: '100vh' }}>
// // //       <h2 style={{ color: '#1e293b', marginTop: 0 }}>Product Requests</h2>
// // //       <p style={{ color: '#64748b', marginTop: 4, marginBottom: 20 }}>
// // //         Approve or reject product requests submitted by staff.
// // //       </p>

// // //       {loading ? (
// // //         <div style={{
// // //           background: '#fff', padding: 40, textAlign: 'center',
// // //           borderRadius: 12, color: '#64748b',
// // //         }}>
// // //           Loading requests...
// // //         </div>
// // //       ) : (
// // //         <div style={{
// // //           background: '#fff', borderRadius: 12, overflowX: 'auto',
// // //           boxShadow: '0 4px 15px rgba(0,0,0,0.06)',
// // //         }}>
// // //           <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
// // //             <thead>
// // //               <tr>
// // //                 <th style={th}>Product Name</th>
// // //                 <th style={th}>Product Description</th>
// // //                 <th style={th}>Quantity</th>
// // //                 <th style={th}>Department Name</th>
// // //                 <th style={th}>Issue Date</th>
// // //                 <th style={th}>Status</th>
// // //                 <th style={th}>Actions</th>
// // //               </tr>
// // //             </thead>
// // //             <tbody>
// // //               {requests.length === 0 ? (
// // //                 <tr>
// // //                   <td colSpan="7" style={{ padding: 35, textAlign: 'center', color: '#64748b' }}>
// // //                     No requests yet.
// // //                   </td>
// // //                 </tr>
// // //               ) : (
// // //                 requests.map((r) => (
// // //                   <tr key={r.requestId} style={{ borderBottom: '1px solid #e2e8f0' }}>
// // //                     <td style={td}><strong>{r.productName ?? r.product?.productName ?? '-'}</strong></td>
// // //                     <td style={td}>{r.productDescription ?? r.product?.productDescription ?? '-'}</td>
// // //                     <td style={td}>{r.quantity ?? '-'}</td>
// // //                     <td style={td}>{r.departmentName ?? r.department?.departmentName ?? '-'}</td>
// // //                     <td style={td}>{r.issueDate ?? '-'}</td>
// // //                     <td style={td}>
// // //                       <span style={{
// // //                         padding: '4px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600,
// // //                         background: r.status === 'APPROVED' ? '#dcfce7'
// // //                                   : r.status === 'REJECTED' ? '#fee2e2'
// // //                                   : '#fef3c7',
// // //                         color:      r.status === 'APPROVED' ? '#166534'
// // //                                   : r.status === 'REJECTED' ? '#b91c1c'
// // //                                   : '#92400e',
// // //                       }}>
// // //                         {r.status}
// // //                       </span>
// // //                     </td>
// // //                     <td style={td}>
// // //                       {r.status === 'PENDING' ? (
// // //                         <div style={{ display: 'flex', gap: 8 }}>
// // //                           <button onClick={() => approve(r.requestId)} style={btnGreen}>Approve</button>
// // //                           <button onClick={() => reject(r.requestId)} style={btnRed}>Reject</button>
// // //                         </div>
// // //                       ) : (
// // //                         <span style={{ color: '#94a3b8' }}>—</span>
// // //                       )}
// // //                     </td>
// // //                   </tr>
// // //                 ))
// // //               )}
// // //             </tbody>
// // //           </table>
// // //         </div>
// // //       )}
// // //     </div>
// // //   );
// // // };

// // // const th = {
// // //   background: '#1e40af', color: '#fff',
// // //   padding: '14px 12px', textAlign: 'left',
// // //   fontSize: 14, whiteSpace: 'nowrap',
// // // };
// // // const td = {
// // //   padding: '13px 12px', color: '#334155', fontSize: 14,
// // // };
// // // const btnGreen = {
// // //   padding: '7px 14px', border: 'none', borderRadius: 6,
// // //   background: '#16a34a', color: '#fff', fontWeight: 600, cursor: 'pointer',
// // // };
// // // const btnRed = {
// // //   padding: '7px 14px', border: 'none', borderRadius: 6,
// // //   background: '#dc2626', color: '#fff', fontWeight: 600, cursor: 'pointer',
// // // };

// // // export default ManageRequests;

// // import React, { useState, useEffect } from 'react';
// // import axios from 'axios';

// // const ManageRequests = () => {
// //   const [requests, setRequests] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [error, setError] = useState('');

// //   // Modal state
// //   const [modalOpen, setModalOpen] = useState(false);
// //   const [modalType, setModalType] = useState(''); // 'approve' | 'reject'
// //   const [modalRequest, setModalRequest] = useState(null);
// //   const [modalNote, setModalNote] = useState('');
// //   const [submitting, setSubmitting] = useState(false);

// //   const load = async () => {
// //     try {
// //       setLoading(true);
// //       const res = await axios.get('http://localhost:8080/api/product-requests/all');
// //       setRequests(Array.isArray(res.data) ? res.data : []);
// //     } catch (err) {
// //       console.error(err);
// //       setError('Failed to load requests.');
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   useEffect(() => { load(); }, []);

// //   // ----- Open modal -----
// //   const openModal = (request, type) => {
// //     setModalRequest(request);
// //     setModalType(type);
// //     setModalNote('');
// //     setModalOpen(true);
// //   };

// //   const closeModal = () => {
// //     setModalOpen(false);
// //     setModalRequest(null);
// //     setModalType('');
// //     setModalNote('');
// //   };

// //   // ----- Confirm action -----
// //   const confirmAction = async () => {
// //     if (!modalRequest) return;

// //     const id = modalRequest.requestId;
// //     const url =
// //       modalType === 'approve'
// //         ? `http://localhost:8080/api/product-requests/approve/${id}`
// //         : `http://localhost:8080/api/product-requests/reject/${id}`;

// //     try {
// //       setSubmitting(true);
// //       await axios.put(
// //         `${url}?note=${encodeURIComponent(modalNote.trim())}`
// //       );
// //       closeModal();
// //       await load();
// //     } catch (err) {
// //       alert('Failed: ' + (err.response?.data || err.message));
// //     } finally {
// //       setSubmitting(false);
// //     }
// //   };

// //   const statusStyle = (status) => {
// //     switch ((status || '').toUpperCase()) {
// //       case 'APPROVED':
// //         return { background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0' };
// //       case 'REJECTED':
// //         return { background: '#fee2e2', color: '#b91c1c', border: '1px solid #fecaca' };
// //       default:
// //         return { background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' };
// //     }
// //   };

// //   const statusIcon = (status) => {
// //     switch ((status || '').toUpperCase()) {
// //       case 'APPROVED': return '✓';
// //       case 'REJECTED': return '✕';
// //       default:         return '⏳';
// //     }
// //   };

// //   return (
// //     <div style={{ padding: '30px', background: '#f8fafc', minHeight: '100vh' }}>
// //       <h2 style={{ color: '#1e293b', marginTop: 0 }}>Product Requests</h2>
// //       <p style={{ color: '#64748b', marginTop: 4, marginBottom: 20 }}>
// //         Approve or reject product requests submitted by staff.
// //       </p>

// //       {error && (
// //         <div style={{ background: '#fee2e2', color: '#b91c1c', padding: 12, borderRadius: 8, marginBottom: 16 }}>
// //           {error}
// //         </div>
// //       )}

// //       {loading ? (
// //         <div style={{ background: '#fff', padding: 40, textAlign: 'center', borderRadius: 12, color: '#64748b' }}>
// //           Loading requests...
// //         </div>
// //       ) : (
// //         <div style={{ background: '#fff', borderRadius: 12, overflowX: 'auto', boxShadow: '0 4px 15px rgba(0,0,0,0.06)' }}>
// //           <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 1000 }}>
// //             <thead>
// //               <tr>
// //                 <th style={th}>Request ID</th>
// //                 <th style={th}>Product Name</th>
// //                 <th style={th}>Description</th>
// //                 <th style={th}>Quantity</th>
// //                 <th style={th}>Department</th>
// //                 <th style={th}>Issue Date</th>
// //                 <th style={th}>Status</th>
// //                 <th style={th}>Admin Note</th>
// //                 <th style={th}>Actions</th>
// //               </tr>
// //             </thead>
// //             <tbody>
// //               {requests.length === 0 ? (
// //                 <tr>
// //                   <td colSpan="9" style={{ padding: 35, textAlign: 'center', color: '#64748b' }}>
// //                     No requests yet.
// //                   </td>
// //                 </tr>
// //               ) : (
// //                 requests.map((r) => (
// //                   <tr key={r.requestId} style={{ borderBottom: '1px solid #e2e8f0' }}>
// //                     <td style={td}>#{r.requestId}</td>
// //                     <td style={td}><strong>{r.productName ?? r.product?.productName ?? '-'}</strong></td>
// //                     <td style={{ ...td, maxWidth: 240 }}>{r.description ?? '-'}</td>
// //                     <td style={td}>{r.quantity ?? '-'}</td>
// //                     <td style={td}>{r.departmentName ?? r.department?.departmentName ?? '-'}</td>
// //                     <td style={td}>{r.issueDate ?? '-'}</td>
// //                     <td style={td}>
// //                       <span style={{ ...statusBadge, ...statusStyle(r.status) }}>
// //                         {statusIcon(r.status)} {r.status}
// //                       </span>
// //                     </td>
// //                     <td style={{ ...td, maxWidth: 220, color: '#64748b' }}>
// //                       {r.adminNote || '—'}
// //                     </td>
// //                     <td style={td}>
// //                       {r.status === 'PENDING' ? (
// //                         <div style={{ display: 'flex', gap: 8 }}>
// //                           <button onClick={() => openModal(r, 'approve')} style={btnGreen}>
// //                             Approve
// //                           </button>
// //                           <button onClick={() => openModal(r, 'reject')} style={btnRed}>
// //                             Reject
// //                           </button>
// //                         </div>
// //                       ) : (
// //                         <span style={{ color: '#94a3b8' }}>—</span>
// //                       )}
// //                     </td>
// //                   </tr>
// //                 ))
// //               )}
// //             </tbody>
// //           </table>
// //         </div>
// //       )}

// //       {/* ============ MODAL ============ */}
// //       {modalOpen && modalRequest && (
// //         <div style={overlay} onClick={closeModal}>
// //           <div style={modal} onClick={(e) => e.stopPropagation()}>
// //             <div style={modalHeader}>
// //               <h3 style={{ margin: 0, color: '#1e293b' }}>
// //                 {modalType === 'approve' ? 'Approve Request' : 'Reject Request'}
// //               </h3>
// //               <button onClick={closeModal} style={closeBtn}>×</button>
// //             </div>

// //             <div style={modalBody}>
// //               <div style={requestInfo}>
// //                 <div><b>Request:</b> #{modalRequest.requestId}</div>
// //                 <div><b>Product:</b> {modalRequest.productName ?? modalRequest.product?.productName}</div>
// //                 <div><b>Quantity:</b> {modalRequest.quantity}</div>
// //                 <div><b>Department:</b> {modalRequest.departmentName ?? modalRequest.department?.departmentName}</div>
// //               </div>

// //               <label style={label}>
// //                 Admin Note {modalType === 'reject' ? '(reason)' : '(optional)'}
// //               </label>
// //               <textarea
// //                 value={modalNote}
// //                 onChange={(e) => setModalNote(e.target.value)}
// //                 placeholder={
// //                   modalType === 'approve'
// //                     ? 'e.g. Approved. Please collect from store before Friday.'
// //                     : 'e.g. Insufficient stock. Please request again next month.'
// //                 }
// //                 rows={4}
// //                 style={textarea}
// //               />
// //             </div>

// //             <div style={modalFooter}>
// //               <button onClick={closeModal} style={cancelBtn} disabled={submitting}>
// //                 Cancel
// //               </button>
// //               <button
// //                 onClick={confirmAction}
// //                 style={
// //                   modalType === 'approve'
// //                     ? { ...confirmBtn, background: '#16a34a' }
// //                     : { ...confirmBtn, background: '#dc2626' }
// //                 }
// //                 disabled={submitting}
// //               >
// //                 {submitting
// //                   ? 'Processing...'
// //                   : modalType === 'approve'
// //                     ? 'Approve & Save Note'
// //                     : 'Reject & Save Note'}
// //               </button>
// //             </div>
// //           </div>
// //         </div>
// //       )}
// //     </div>
// //   );
// // };

// // // ======================================================
// // // Styles
// // // ======================================================
// // const th = {
// //   background: '#1e40af', color: '#fff', padding: '14px 12px',
// //   textAlign: 'left', fontSize: 14, whiteSpace: 'nowrap',
// // };
// // const td = { padding: '13px 12px', color: '#334155', fontSize: 14, verticalAlign: 'top' };
// // const statusBadge = {
// //   display: 'inline-block', padding: '5px 12px', borderRadius: 20,
// //   fontSize: 12, fontWeight: 700, letterSpacing: 0.3,
// // };
// // const btnGreen = {
// //   padding: '7px 14px', border: 'none', borderRadius: 6,
// //   background: '#16a34a', color: '#fff', fontWeight: 600, cursor: 'pointer',
// // };
// // const btnRed = {
// //   padding: '7px 14px', border: 'none', borderRadius: 6,
// //   background: '#dc2626', color: '#fff', fontWeight: 600, cursor: 'pointer',
// // };

// // const overlay = {
// //   position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)',
// //   display: 'flex', alignItems: 'center', justifyContent: 'center',
// //   zIndex: 1000, padding: 20,
// // };
// // const modal = {
// //   background: '#fff', borderRadius: 14, width: '100%', maxWidth: 520,
// //   boxShadow: '0 20px 60px rgba(0,0,0,0.3)', overflow: 'hidden',
// // };
// // const modalHeader = {
// //   display: 'flex', justifyContent: 'space-between', alignItems: 'center',
// //   padding: '18px 22px', borderBottom: '1px solid #e2e8f0',
// // };
// // const closeBtn = {
// //   border: 'none', background: '#fee2e2', color: '#dc2626',
// //   width: 34, height: 34, borderRadius: '50%',
// //   fontSize: 20, cursor: 'pointer', lineHeight: 1,
// // };
// // const modalBody = { padding: '20px 22px' };
// // const requestInfo = {
// //   background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10,
// //   padding: 14, fontSize: 13, color: '#334155',
// //   display: 'grid', gap: 6, marginBottom: 18,
// // };
// // const label = {
// //   display: 'block', marginBottom: 8, fontSize: 14,
// //   fontWeight: 600, color: '#374151',
// // };
// // const textarea = {
// //   width: '100%', minHeight: 100, padding: '12px 14px',
// //   border: '1px solid #d9dee8', borderRadius: 10,
// //   fontSize: 14, fontFamily: 'inherit', resize: 'vertical',
// //   outline: 'none', color: '#1f2937',
// // };
// // const modalFooter = {
// //   display: 'flex', justifyContent: 'flex-end', gap: 10,
// //   padding: '16px 22px', borderTop: '1px solid #e2e8f0',
// //   background: '#f8fafc',
// // };
// // const cancelBtn = {
// //   padding: '10px 18px', border: '1px solid #cbd5e1',
// //   background: '#fff', color: '#475569', borderRadius: 8,
// //   fontWeight: 600, cursor: 'pointer',
// // };
// // const confirmBtn = {
// //   padding: '10px 18px', border: 'none',
// //   color: '#fff', borderRadius: 8, fontWeight: 600, cursor: 'pointer',
// // };

// // export default ManageRequests;

// import React, { useState, useEffect } from 'react';
// import axios from 'axios';

// const ManageRequests = () => {
//   const [requests, setRequests] = useState([]);
//   const [loading, setLoading]   = useState(true);
//   const [error, setError]       = useState('');

//   // Modal state
//   const [modalOpen, setModalOpen]       = useState(false);
//   const [modalType, setModalType]       = useState(''); // 'approve' | 'reject' | 'edit'
//   const [modalRequest, setModalRequest] = useState(null);
//   const [modalNote, setModalNote]       = useState('');
//   const [submitting, setSubmitting]     = useState(false);

//   // Edit-form fields
//   const [editQuantity, setEditQuantity]       = useState('');
//   const [editIssueDate, setEditIssueDate]     = useState('');
//   const [editDescription, setEditDescription] = useState('');

//   const load = async () => {
//     try {
//       setLoading(true);
//       const res = await axios.get('http://localhost:8080/api/product-requests/all');
//       setRequests(Array.isArray(res.data) ? res.data : []);
//     } catch (err) {
//       console.error(err);
//       setError('Failed to load requests.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => { load(); }, []);

//   // ----- Open modal -----
//   const openModal = (request, type) => {
//     setModalRequest(request);
//     setModalType(type);
//     setModalNote('');
//     setEditQuantity(request.quantity ?? '');
//     setEditIssueDate(request.issueDate ?? '');
//     setEditDescription(request.description ?? '');
//     setModalOpen(true);
//   };

//   const closeModal = () => {
//     setModalOpen(false);
//     setModalRequest(null);
//     setModalType('');
//     setModalNote('');
//     setEditQuantity('');
//     setEditIssueDate('');
//     setEditDescription('');
//   };

//   // ----- Confirm action -----
//   const confirmAction = async () => {
//     if (!modalRequest) return;

//     const id = modalRequest.requestId;

//     try {
//       setSubmitting(true);

//       if (modalType === 'approve') {
//         await axios.put(
//           `http://localhost:8080/api/product-requests/approve/${id}?note=${encodeURIComponent(modalNote.trim())}`
//         );
//       } else if (modalType === 'reject') {
//         await axios.put(
//           `http://localhost:8080/api/product-requests/reject/${id}?note=${encodeURIComponent(modalNote.trim())}`
//         );
//       } else if (modalType === 'edit') {
//         await axios.put(
//           `http://localhost:8080/api/product-requests/update/${id}`,
//           {
//             quantity: parseInt(editQuantity, 10),
//             issueDate: editIssueDate,
//             description: editDescription.trim(),
//           },
//           { headers: { 'Content-Type': 'application/json' } }
//         );
//       }

//       closeModal();
//       await load();
//     } catch (err) {
//       alert('Failed: ' + (err.response?.data || err.message));
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   // ----- Delete -----
//   const handleDelete = async (id) => {
//     if (!window.confirm('Delete this request permanently?')) return;
//     try {
//       await axios.delete(`http://localhost:8080/api/product-requests/delete/${id}`);
//       await load();
//     } catch (err) {
//       alert('Failed: ' + (err.response?.data || err.message));
//     }
//   };

//   const statusStyle = (status) => {
//     switch ((status || '').toUpperCase()) {
//       case 'APPROVED':
//         return { background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0' };
//       case 'REJECTED':
//         return { background: '#fee2e2', color: '#b91c1c', border: '1px solid #fecaca' };
//       default:
//         return { background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' };
//     }
//   };

//   const statusIcon = (status) => {
//     switch ((status || '').toUpperCase()) {
//       case 'APPROVED': return '✓';
//       case 'REJECTED': return '✕';
//       default:         return '⏳';
//     }
//   };

//   return (
//     <div style={{ padding: '30px', background: '#f8fafc', minHeight: '100vh' }}>
//       <h2 style={{ color: '#1e293b', marginTop: 0 }}>Product Requests</h2>
//       <p style={{ color: '#64748b', marginTop: 4, marginBottom: 20 }}>
//         Approve, reject, update or delete product requests submitted by staff.
//       </p>

//       {error && (
//         <div style={{ background: '#fee2e2', color: '#b91c1c', padding: 12, borderRadius: 8, marginBottom: 16 }}>
//           {error}
//         </div>
//       )}

//       {loading ? (
//         <div style={{ background: '#fff', padding: 40, textAlign: 'center', borderRadius: 12, color: '#64748b' }}>
//           Loading requests...
//         </div>
//       ) : (
//         <div style={{ background: '#fff', borderRadius: 12, overflowX: 'auto', boxShadow: '0 4px 15px rgba(0,0,0,0.06)' }}>
//           <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 1100 }}>
//             <thead>
//               <tr>
//                 <th style={th}>Request ID</th>
//                 <th style={th}>Product Name</th>
//                 <th style={th}>Description</th>
//                 <th style={th}>Quantity</th>
//                 <th style={th}>Department</th>
//                 <th style={th}>Issue Date</th>
//                 <th style={th}>Status</th>
//                 <th style={th}>Admin Note</th>
//                 <th style={th}>Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {requests.length === 0 ? (
//                 <tr>
//                   <td colSpan="9" style={{ padding: 35, textAlign: 'center', color: '#64748b' }}>
//                     No requests yet.
//                   </td>
//                 </tr>
//               ) : (
//                 requests.map((r) => (
//                   <tr key={r.requestId} style={{ borderBottom: '1px solid #e2e8f0' }}>
//                     <td style={td}>#{r.requestId}</td>
//                     <td style={td}><strong>{r.productName ?? r.product?.productName ?? '-'}</strong></td>
//                     <td style={{ ...td, maxWidth: 240 }}>{r.description ?? '-'}</td>
//                     <td style={td}>{r.quantity ?? '-'}</td>
//                     <td style={td}>{r.departmentName ?? r.department?.departmentName ?? '-'}</td>
//                     <td style={td}>{r.issueDate ?? '-'}</td>
//                     <td style={td}>
//                       <span style={{ ...statusBadge, ...statusStyle(r.status) }}>
//                         {statusIcon(r.status)} {r.status}
//                       </span>
//                     </td>
//                     <td style={{ ...td, maxWidth: 220, color: '#64748b' }}>
//                       {r.adminNote || '—'}
//                     </td>
//                     <td style={td}>
//                       <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
//                         {r.status === 'PENDING' && (
//                           <>
//                             <button onClick={() => openModal(r, 'approve')} style={btnGreen}>
//                               Approve
//                             </button>
//                             <button onClick={() => openModal(r, 'reject')} style={btnRed}>
//                               Reject
//                             </button>
//                           </>
//                         )}

//                         <button onClick={() => openModal(r, 'edit')} style={btnBlue}>
//                           Update
//                         </button>

//                         <button onClick={() => handleDelete(r.requestId)} style={btnGray}>
//                           Delete
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>
//       )}

//       {/* ============ MODAL ============ */}
//       {modalOpen && modalRequest && (
//         <div style={overlay} onClick={closeModal}>
//           <div style={modal} onClick={(e) => e.stopPropagation()}>
//             <div style={modalHeader}>
//               <h3 style={{ margin: 0, color: '#1e293b' }}>
//                 {modalType === 'approve' && 'Approve Request'}
//                 {modalType === 'reject'  && 'Reject Request'}
//                 {modalType === 'edit'    && 'Update Request'}
//               </h3>
//               <button onClick={closeModal} style={closeBtn}>×</button>
//             </div>

//             <div style={modalBody}>
//               <div style={requestInfo}>
//                 <div><b>Request:</b> #{modalRequest.requestId}</div>
//                 <div><b>Product:</b> {modalRequest.productName ?? modalRequest.product?.productName}</div>
//                 <div><b>Department:</b> {modalRequest.departmentName ?? modalRequest.department?.departmentName}</div>
//                 <div><b>Status:</b> {modalRequest.status}</div>
//               </div>

//               {modalType === 'edit' ? (
//                 <>
//                   <label style={label}>Quantity</label>
//                   <input
//                     type="number"
//                     min="1"
//                     value={editQuantity}
//                     onChange={(e) => setEditQuantity(e.target.value)}
//                     style={input}
//                   />

//                   <label style={{ ...label, marginTop: 14 }}>Issue Date</label>
//                   <input
//                     type="date"
//                     value={editIssueDate}
//                     onChange={(e) => setEditIssueDate(e.target.value)}
//                     style={input}
//                   />

//                   <label style={{ ...label, marginTop: 14 }}>Description</label>
//                   <textarea
//                     value={editDescription}
//                     onChange={(e) => setEditDescription(e.target.value)}
//                     rows={4}
//                     style={textarea}
//                     placeholder="Description typed by the staff (you can correct it)"
//                   />
//                 </>
//               ) : (
//                 <>
//                   <label style={label}>
//                     Admin Note {modalType === 'reject' ? '(reason)' : '(optional)'}
//                   </label>
//                   <textarea
//                     value={modalNote}
//                     onChange={(e) => setModalNote(e.target.value)}
//                     placeholder={
//                       modalType === 'approve'
//                         ? 'e.g. Approved. Please collect from store before Friday.'
//                         : 'e.g. Insufficient stock. Please request again next month.'
//                     }
//                     rows={4}
//                     style={textarea}
//                   />
//                 </>
//               )}
//             </div>

//             <div style={modalFooter}>
//               <button onClick={closeModal} style={cancelBtn} disabled={submitting}>
//                 Cancel
//               </button>
//               <button
//                 onClick={confirmAction}
//                 style={{
//                   ...confirmBtn,
//                   background:
//                     modalType === 'approve' ? '#16a34a'
//                   : modalType === 'reject'  ? '#dc2626'
//                   : '#2563eb',
//                 }}
//                 disabled={submitting}
//               >
//                 {submitting
//                   ? 'Processing...'
//                   : modalType === 'approve' ? 'Approve & Save Note'
//                   : modalType === 'reject'  ? 'Reject & Save Note'
//                   : 'Save Changes'}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// // ======================================================
// // Styles
// // ======================================================
// const th = {
//   background: '#1e40af', color: '#fff', padding: '14px 12px',
//   textAlign: 'left', fontSize: 14, whiteSpace: 'nowrap',
// };
// const td = { padding: '13px 12px', color: '#334155', fontSize: 14, verticalAlign: 'top' };
// const statusBadge = {
//   display: 'inline-block', padding: '5px 12px', borderRadius: 20,
//   fontSize: 12, fontWeight: 700, letterSpacing: 0.3,
// };

// const btnGreen = {
//   padding: '6px 12px', border: 'none', borderRadius: 6,
//   background: '#16a34a', color: '#fff', fontWeight: 600, cursor: 'pointer',
// };
// const btnRed = {
//   padding: '6px 12px', border: 'none', borderRadius: 6,
//   background: '#dc2626', color: '#fff', fontWeight: 600, cursor: 'pointer',
// };
// const btnBlue = {
//   padding: '6px 12px', border: 'none', borderRadius: 6,
//   background: '#2563eb', color: '#fff', fontWeight: 600, cursor: 'pointer',
// };
// const btnGray = {
//   padding: '6px 12px', border: 'none', borderRadius: 6,
//   background: '#64748b', color: '#fff', fontWeight: 600, cursor: 'pointer',
// };

// const overlay = {
//   position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)',
//   display: 'flex', alignItems: 'center', justifyContent: 'center',
//   zIndex: 1000, padding: 20,
// };
// const modal = {
//   background: '#fff', borderRadius: 14, width: '100%', maxWidth: 520,
//   boxShadow: '0 20px 60px rgba(0,0,0,0.3)', overflow: 'hidden',
// };
// const modalHeader = {
//   display: 'flex', justifyContent: 'space-between', alignItems: 'center',
//   padding: '18px 22px', borderBottom: '1px solid #e2e8f0',
// };
// const closeBtn = {
//   border: 'none', background: '#fee2e2', color: '#dc2626',
//   width: 34, height: 34, borderRadius: '50%',
//   fontSize: 20, cursor: 'pointer', lineHeight: 1,
// };
// const modalBody = { padding: '20px 22px' };
// const requestInfo = {
//   background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10,
//   padding: 14, fontSize: 13, color: '#334155',
//   display: 'grid', gap: 6, marginBottom: 18,
// };
// const label = {
//   display: 'block', marginBottom: 8, fontSize: 14,
//   fontWeight: 600, color: '#374151',
// };
// const textarea = {
//   width: '100%', minHeight: 100, padding: '12px 14px',
//   border: '1px solid #d9dee8', borderRadius: 10,
//   fontSize: 14, fontFamily: 'inherit', resize: 'vertical',
//   outline: 'none', color: '#1f2937',
// };
// const input = {
//   width: '100%', height: 44, padding: '0 12px',
//   border: '1px solid #d9dee8', borderRadius: 10,
//   fontSize: 14, color: '#1f2937', outline: 'none',
// };
// const modalFooter = {
//   display: 'flex', justifyContent: 'flex-end', gap: 10,
//   padding: '16px 22px', borderTop: '1px solid #e2e8f0',
//   background: '#f8fafc',
// };
// const cancelBtn = {
//   padding: '10px 18px', border: '1px solid #cbd5e1',
//   background: '#fff', color: '#475569', borderRadius: 8,
//   fontWeight: 600, cursor: 'pointer',
// };
// const confirmBtn = {
//   padding: '10px 18px', border: 'none',
//   color: '#fff', borderRadius: 8, fontWeight: 600, cursor: 'pointer',
// };

// export default ManageRequests;

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ManageRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  // Modal state
  const [modalOpen, setModalOpen]       = useState(false);
  const [modalType, setModalType]       = useState(''); // 'approve' | 'reject' | 'edit'
  const [modalRequest, setModalRequest] = useState(null);
  const [modalNote, setModalNote]       = useState('');
  const [submitting, setSubmitting]     = useState(false);

  // Edit-form fields
  const [editQuantity, setEditQuantity]       = useState('');
  const [editIssueDate, setEditIssueDate]     = useState('');
  const [editDescription, setEditDescription] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:8080/api/product-requests/all');
      setRequests(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setError('Failed to load requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // ----- Open modal -----
  const openModal = (request, type) => {
    setModalRequest(request);
    setModalType(type);
    setModalNote('');
    setEditQuantity(request.quantity ?? '');
    setEditIssueDate(request.issueDate ?? '');
    setEditDescription(request.description ?? '');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalRequest(null);
    setModalType('');
    setModalNote('');
    setEditQuantity('');
    setEditIssueDate('');
    setEditDescription('');
  };

  // ----- Confirm action -----
  const confirmAction = async () => {
    if (!modalRequest) return;

    const id = modalRequest.requestId;

    try {
      setSubmitting(true);

      if (modalType === 'approve') {
        await axios.put(
          `http://localhost:8080/api/product-requests/approve/${id}?note=${encodeURIComponent(modalNote.trim())}`
        );
      } else if (modalType === 'reject') {
        await axios.put(
          `http://localhost:8080/api/product-requests/reject/${id}?note=${encodeURIComponent(modalNote.trim())}`
        );
      } else if (modalType === 'edit') {
        await axios.put(
          `http://localhost:8080/api/product-requests/update/${id}`,
          {
            quantity: parseInt(editQuantity, 10),
            issueDate: editIssueDate,
            description: editDescription.trim(),
          },
          { headers: { 'Content-Type': 'application/json' } }
        );
      }

      closeModal();
      await load();
    } catch (err) {
      alert('Failed: ' + (err.response?.data || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  // ----- Delete -----
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this request permanently?')) return;
    try {
      await axios.delete(`http://localhost:8080/api/product-requests/delete/${id}`);
      await load();
    } catch (err) {
      alert('Failed: ' + (err.response?.data || err.message));
    }
  };

  const statusStyle = (status) => {
    switch ((status || '').toUpperCase()) {
      case 'APPROVED':
        return { background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0' };
      case 'REJECTED':
        return { background: '#fee2e2', color: '#b91c1c', border: '1px solid #fecaca' };
      default:
        return { background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' };
    }
  };

  const statusIcon = (status) => {
    switch ((status || '').toUpperCase()) {
      case 'APPROVED': return '✓';
      case 'REJECTED': return '✕';
      default:         return '⏳';
    }
  };

  return (
    <div style={{ padding: '30px', background: '#f8fafc', minHeight: '100vh' }}>
      <h2 style={{ color: '#1e293b', marginTop: 0 }}>Product Requests</h2>
      <p style={{ color: '#64748b', marginTop: 4, marginBottom: 20 }}>
        Approve, reject, update or delete product requests submitted by staff.
      </p>

      {error && (
        <div style={{ background: '#fee2e2', color: '#b91c1c', padding: 12, borderRadius: 8, marginBottom: 16 }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ background: '#fff', padding: 40, textAlign: 'center', borderRadius: 12, color: '#64748b' }}>
          Loading requests...
        </div>
      ) : (
        <div style={{ background: '#fff', borderRadius: 12, overflowX: 'auto', boxShadow: '0 4px 15px rgba(0,0,0,0.06)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 1100 }}>
            <thead>
              <tr>
                <th style={th}>Request ID</th>
                <th style={th}>Product Name</th>
                <th style={th}>Description</th>
                <th style={th}>Quantity</th>
                <th style={th}>Department</th>
                <th style={th}>Issue Date</th>
                <th style={th}>Status</th>
                <th style={th}>Admin Note</th>
                <th style={th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ padding: 35, textAlign: 'center', color: '#64748b' }}>
                    No requests yet.
                  </td>
                </tr>
              ) : (
                requests.map((r) => (
                  <tr key={r.requestId} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={td}>#{r.requestId}</td>
                    <td style={td}><strong>{r.productName ?? r.product?.productName ?? '-'}</strong></td>
                    <td style={{ ...td, maxWidth: 240 }}>{r.description ?? '-'}</td>
                    <td style={td}>{r.quantity ?? '-'}</td>
                    <td style={td}>{r.departmentName ?? r.department?.departmentName ?? '-'}</td>
                    <td style={td}>{r.issueDate ?? '-'}</td>
                    <td style={td}>
                      <span style={{ ...statusBadge, ...statusStyle(r.status) }}>
                        {statusIcon(r.status)} {r.status}
                      </span>
                    </td>
                    <td style={{ ...td, maxWidth: 220, color: '#64748b' }}>
                      {r.adminNote || '—'}
                    </td>
                    <td style={td}>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {r.status === 'PENDING' && (
                          <>
                            <button onClick={() => openModal(r, 'approve')} style={btnGreen}>
                              Approve
                            </button>
                            <button onClick={() => openModal(r, 'reject')} style={btnRed}>
                              Reject
                            </button>
                          </>
                        )}

                        <button onClick={() => openModal(r, 'edit')} style={btnBlue}>
                          Update
                        </button>

                        <button onClick={() => handleDelete(r.requestId)} style={btnGray}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ============ MODAL ============ */}
      {modalOpen && modalRequest && (
        <div style={overlay} onClick={closeModal}>
          <div style={modal} onClick={(e) => e.stopPropagation()}>
            <div style={modalHeader}>
              <h3 style={{ margin: 0, color: '#1e293b' }}>
                {modalType === 'approve' && 'Approve Request'}
                {modalType === 'reject'  && 'Reject Request'}
                {modalType === 'edit'    && 'Update Request'}
              </h3>
              <button onClick={closeModal} style={closeBtn}>×</button>
            </div>

            <div style={modalBody}>
              <div style={requestInfo}>
                <div><b>Request:</b> #{modalRequest.requestId}</div>
                <div><b>Product:</b> {modalRequest.productName ?? modalRequest.product?.productName}</div>
                <div><b>Department:</b> {modalRequest.departmentName ?? modalRequest.department?.departmentName}</div>
                <div><b>Status:</b> {modalRequest.status}</div>
              </div>

              {modalType === 'edit' ? (
                <>
                  <label style={label}>Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={editQuantity}
                    onChange={(e) => setEditQuantity(e.target.value)}
                    style={input}
                  />

                  <label style={{ ...label, marginTop: 14 }}>Issue Date</label>
                  <input
                    type="date"
                    value={editIssueDate}
                    onChange={(e) => setEditIssueDate(e.target.value)}
                    style={input}
                  />

                  <label style={{ ...label, marginTop: 14 }}>Description</label>
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={4}
                    style={textarea}
                    placeholder="Description typed by the staff (you can correct it)"
                  />
                </>
              ) : (
                <>
                  <label style={label}>
                    Admin Note {modalType === 'reject' ? '(reason)' : '(optional)'}
                  </label>
                  <textarea
                    value={modalNote}
                    onChange={(e) => setModalNote(e.target.value)}
                    placeholder={
                      modalType === 'approve'
                        ? 'e.g. Approved. Please collect from store before Friday.'
                        : 'e.g. Insufficient stock. Please request again next month.'
                    }
                    rows={4}
                    style={textarea}
                  />
                </>
              )}
            </div>

            <div style={modalFooter}>
              <button onClick={closeModal} style={cancelBtn} disabled={submitting}>
                Cancel
              </button>
              <button
                onClick={confirmAction}
                style={{
                  ...confirmBtn,
                  background:
                    modalType === 'approve' ? '#16a34a'
                  : modalType === 'reject'  ? '#dc2626'
                  : '#2563eb',
                }}
                disabled={submitting}
              >
                {submitting
                  ? 'Processing...'
                  : modalType === 'approve' ? 'Approve & Save Note'
                  : modalType === 'reject'  ? 'Reject & Save Note'
                  : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ======================================================
// Styles
// ======================================================
const th = {
  background: '#1e40af', color: '#fff', padding: '14px 12px',
  textAlign: 'left', fontSize: 14, whiteSpace: 'nowrap',
};
const td = { padding: '13px 12px', color: '#334155', fontSize: 14, verticalAlign: 'top' };
const statusBadge = {
  display: 'inline-block', padding: '5px 12px', borderRadius: 20,
  fontSize: 12, fontWeight: 700, letterSpacing: 0.3,
};

const btnGreen = {
  padding: '6px 12px', border: 'none', borderRadius: 6,
  background: '#16a34a', color: '#fff', fontWeight: 600, cursor: 'pointer',
};
const btnRed = {
  padding: '6px 12px', border: 'none', borderRadius: 6,
  background: '#dc2626', color: '#fff', fontWeight: 600, cursor: 'pointer',
};
const btnBlue = {
  padding: '6px 12px', border: 'none', borderRadius: 6,
  background: '#2563eb', color: '#fff', fontWeight: 600, cursor: 'pointer',
};
const btnGray = {
  padding: '6px 12px', border: 'none', borderRadius: 6,
  background: '#64748b', color: '#fff', fontWeight: 600, cursor: 'pointer',
};

const overlay = {
  position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 1000, padding: 20,
};
const modal = {
  background: '#fff', borderRadius: 14, width: '100%', maxWidth: 520,
  boxShadow: '0 20px 60px rgba(0,0,0,0.3)', overflow: 'hidden',
};
const modalHeader = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  padding: '18px 22px', borderBottom: '1px solid #e2e8f0',
};
const closeBtn = {
  border: 'none', background: '#fee2e2', color: '#dc2626',
  width: 34, height: 34, borderRadius: '50%',
  fontSize: 20, cursor: 'pointer', lineHeight: 1,
};
const modalBody = { padding: '20px 22px' };
const requestInfo = {
  background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10,
  padding: 14, fontSize: 13, color: '#334155',
  display: 'grid', gap: 6, marginBottom: 18,
};
const label = {
  display: 'block', marginBottom: 8, fontSize: 14,
  fontWeight: 600, color: '#374151',
};
const textarea = {
  width: '100%', minHeight: 100, padding: '12px 14px',
  border: '1px solid #d9dee8', borderRadius: 10,
  fontSize: 14, fontFamily: 'inherit', resize: 'vertical',
  outline: 'none', color: '#1f2937',
};
const input = {
  width: '100%', height: 44, padding: '0 12px',
  border: '1px solid #d9dee8', borderRadius: 10,
  fontSize: 14, color: '#1f2937', outline: 'none',
};
const modalFooter = {
  display: 'flex', justifyContent: 'flex-end', gap: 10,
  padding: '16px 22px', borderTop: '1px solid #e2e8f0',
  background: '#f8fafc',
};
const cancelBtn = {
  padding: '10px 18px', border: '1px solid #cbd5e1',
  background: '#fff', color: '#475569', borderRadius: 8,
  fontWeight: 600, cursor: 'pointer',
};
const confirmBtn = {
  padding: '10px 18px', border: 'none',
  color: '#fff', borderRadius: 8, fontWeight: 600, cursor: 'pointer',
};

export default ManageRequests; 