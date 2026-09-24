// // export default MyRequests;
// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';

// const API = 'http://localhost:8080/api';

// const MyRequests = () => {
//   const navigate = useNavigate();

//   const [requests, setRequests] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [actionLoading, setActionLoading] = useState(null);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');

//   // Edit modal state
//   const [showEdit, setShowEdit] = useState(false);
//   const [editForm, setEditForm] = useState(null);
//   const [savingEdit, setSavingEdit] = useState(false);

//   const adminId = Number(localStorage.getItem('userId'));

//   // ===== Fetch my requests =====
//   const fetchMyRequests = async () => {
//     if (!adminId) {
//       setError('Please log in again.');
//       return;
//     }
//     setLoading(true);
//     setError('');
//     try {
//       const res = await axios.get(`${API}/admin-requests/my/${adminId}`);
//       setRequests(Array.isArray(res.data) ? res.data : []);
//     } catch (err) {
//       console.error('Fetch error:', err);
//       setError('Failed to load your requests. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchMyRequests();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // ===== Give product to staff =====
//   const completeRequest = async (id) => {
//     if (!window.confirm('Give this product to the staff? Stock will be reduced.')) return;
//     setActionLoading(id);
//     setError('');
//     setSuccess('');
//     try {
//       await axios.put(`${API}/admin-requests/complete/${id}`);
//       setSuccess('✅ Product has been given to the staff successfully!');
//       fetchMyRequests();
//     } catch (err) {
//       const msg = err.response?.data;
//       setError(typeof msg === 'string' ? msg : 'Failed to complete the request.');
//     } finally {
//       setActionLoading(null);
//     }
//   };

//   // ===== Delete request =====
//   const deleteRequest = async (id) => {
//     if (!window.confirm('Are you sure you want to delete this request? This cannot be undone.')) return;
//     setActionLoading(id);
//     setError('');
//     setSuccess('');
//     try {
//       await axios.delete(`${API}/admin-requests/delete/${id}`);
//       setSuccess('🗑️ Request deleted successfully!');
//       setRequests((prev) => prev.filter((r) => r.id !== id));
//     } catch (err) {
//       const msg = err.response?.data;
//       setError(typeof msg === 'string' ? msg : 'Failed to delete the request.');
//     } finally {
//       setActionLoading(null);
//     }
//   };

//   // ===== Open update modal =====
//   const openEdit = (req) => {
//     setEditForm({
//       id: req.id,
//       requestType: req.requestType || '',
//       status: req.status || 'PENDING',
//       quantity: req.quantity ?? '',
//       staffName: req.staffName || '',
//       departmentName: req.departmentName || '',
//       description: req.description || '',
//       superAdminNote: req.superAdminNote || '',
//     });
//     setShowEdit(true);
//     setError('');
//     setSuccess('');
//   };

//   const closeEdit = () => {
//     setShowEdit(false);
//     setEditForm(null);
//   };

//   const handleEditChange = (e) => {
//     const { name, value } = e.target;
//     setEditForm((prev) => ({ ...prev, [name]: value }));
//   };

//   // ===== Submit update =====
//   const submitEdit = async (e) => {
//     e.preventDefault();
//     if (!editForm) return;

//     if (!editForm.quantity || Number(editForm.quantity) <= 0) {
//       return alert('Please enter a valid quantity.');
//     }

//     setSavingEdit(true);
//     setError('');
//     setSuccess('');
//     try {
//       await axios.put(`${API}/admin-requests/update/${editForm.id}`, {
//         requestType: editForm.requestType,
//         status: editForm.status,
//         quantity: Number(editForm.quantity),
//         staffName: editForm.staffName.trim(),
//         departmentName: editForm.departmentName.trim(),
//         description: editForm.description.trim(),
//         superAdminNote: editForm.superAdminNote.trim(),
//       });
//       setSuccess('✏️ Request updated successfully!');
//       closeEdit();
//       fetchMyRequests();
//     } catch (err) {
//       const msg = err.response?.data;
//       setError(typeof msg === 'string' ? msg : 'Failed to update the request.');
//     } finally {
//       setSavingEdit(false);
//     }
//   };

//   // ===== Request to Super Admin =====
//   const handleRequestToAdmin = () => navigate('/admin-request-product');

//   // ===== Stats =====
//   const pending   = requests.filter((r) => r.status === 'PENDING').length;
//   const approved  = requests.filter((r) => r.status === 'APPROVED').length;
//   const rejected  = requests.filter((r) => r.status === 'REJECTED').length;
//   const completed = requests.filter((r) => r.status === 'COMPLETED').length;

//   return (
//     <>
//       <style>{`
//         * { box-sizing: border-box; }
//         .mar-page { min-height: 100vh; background: #f4f7fb; padding: 35px 20px; font-family: Arial, sans-serif; }
//         .mar-container { max-width: 1150px; margin: 0 auto; }

//         .mar-header {
//           margin-bottom: 25px; display: flex; justify-content: space-between;
//           align-items: flex-start; gap: 20px; flex-wrap: wrap;
//         }
//         .mar-header-left { flex: 1; min-width: 250px; }
//         .mar-header h1 { margin: 0; color: #172033; font-size: 30px; font-weight: 700; }
//         .mar-header p { margin: 8px 0 0; color: #718096; font-size: 15px; }

//         .mar-request-btn {
//           border: none;
//           background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
//           color: #fff; padding: 13px 24px; border-radius: 10px;
//           font-size: 14px; font-weight: 700; cursor: pointer;
//           box-shadow: 0 6px 16px rgba(139, 92, 246, 0.35);
//           white-space: nowrap;
//         }
//         .mar-request-btn:hover { transform: translateY(-2px); }

//         .mar-stats {
//           display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
//           gap: 15px; margin-bottom: 25px;
//         }
//         .mar-stat {
//           background: #fff; border-radius: 14px; padding: 18px;
//           border-left: 5px solid #2563eb;
//           box-shadow: 0 6px 18px rgba(15,23,42,0.06);
//         }
//         .mar-stat.pending   { border-left-color: #f59e0b; }
//         .mar-stat.approved  { border-left-color: #16a34a; }
//         .mar-stat.rejected  { border-left-color: #dc2626; }
//         .mar-stat.completed { border-left-color: #2563eb; }

//         .mar-stat .label { font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
//         .mar-stat .value { font-size: 26px; font-weight: 800; color: #172033; margin-top: 6px; }

//         .mar-card { background: #fff; border-radius: 16px; padding: 24px; border: 1px solid #edf0f5; box-shadow: 0 10px 30px rgba(15,23,42,0.08); }
//         .mar-empty { text-align: center; padding: 50px 20px; color: #94a3b8; }
//         .mar-empty .icon { font-size: 45px; margin-bottom: 10px; }
//         .mar-empty p { margin: 0; font-size: 14px; }

//         .mar-table { width: 100%; border-collapse: collapse; }
//         .mar-table thead tr { background: #f1f5f9; }
//         .mar-table th { padding: 13px 14px; text-align: left; font-size: 12px; color: #334155; font-weight: 700; text-transform: uppercase; letter-spacing: 0.4px; }
//         .mar-table td { padding: 14px; font-size: 13px; color: #475569; border-bottom: 1px solid #e2e8f0; vertical-align: middle; }
//         .mar-table tbody tr:hover { background: #f8fafc; }

//         .mar-badge { display: inline-block; padding: 5px 11px; border-radius: 7px; font-size: 11px; font-weight: 700; letter-spacing: 0.4px; }
//         .badge-pending   { background: #fef3c7; color: #92400e; }
//         .badge-approved  { background: #dcfce7; color: #166534; }
//         .badge-rejected  { background: #fee2e2; color: #991b1b; }
//         .badge-completed { background: #dbeafe; color: #1e40af; }

//         .mar-type { display: inline-block; padding: 5px 11px; border-radius: 7px; font-size: 11px; font-weight: 700; background: #ede9fe; color: #6d28d9; }
//         .mar-type.stock { background: #dcfce7; color: #15803d; }

//         .mar-actions { display: flex; gap: 6px; flex-wrap: wrap; }

//         .mar-btn {
//           padding: 7px 12px; border: none; border-radius: 7px;
//           color: #fff; font-size: 11px; font-weight: 700; cursor: pointer;
//         }
//         .mar-btn:disabled { opacity: 0.6; cursor: not-allowed; }
//         .mar-btn.give    { background: #16a34a; }
//         .mar-btn.update  { background: #2563eb; }
//         .mar-btn.delete  { background: #dc2626; }

//         .mar-note { font-size: 12px; color: #64748b; font-style: italic; max-width: 220px; display: inline-block; }

//         .mar-msg { margin-top: 18px; padding: 13px 15px; border-radius: 10px; font-size: 14px; }
//         .mar-success { background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; }
//         .mar-error   { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }

//         .mar-loading { text-align: center; padding: 50px 20px; color: #64748b; font-size: 14px; }

//         /* EDIT MODAL */
//         .mar-overlay {
//           position: fixed; inset: 0; background: rgba(15,23,42,0.5);
//           display: flex; align-items: center; justify-content: center;
//           z-index: 1000; padding: 20px;
//         }
//         .mar-modal {
//           background: #fff; border-radius: 14px; padding: 28px;
//           width: 100%; max-width: 620px; max-height: 90vh; overflow-y: auto;
//           box-shadow: 0 20px 50px rgba(0,0,0,0.25);
//         }
//         .mar-modal-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
//         .mar-modal-header h3 { margin: 0; color: #1e293b; }
//         .mar-modal-close { border: none; background: #fee2e2; color: #dc2626; width: 34px; height: 34px; border-radius: 50%; font-size: 20px; cursor: pointer; }

//         .mar-form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; }
//         .mar-field { display: flex; flex-direction: column; }
//         .mar-label { font-size: 13px; font-weight: 600; color: #334155; margin-bottom: 6px; }
//         .mar-input { padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 7px; font-size: 14px; outline: none; }

//         .mar-modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 24px; }
//         .mar-cancel { padding: 10px 18px; border: 1px solid #cbd5e1; background: #fff; color: #475569; border-radius: 7px; cursor: pointer; font-weight: 600; }
//         .mar-save { padding: 10px 22px; border: none; background: #2563eb; color: #fff; border-radius: 7px; cursor: pointer; font-weight: 700; }

//         @media (max-width: 800px) {
//           .mar-card { padding: 12px; overflow-x: auto; }
//           .mar-table { min-width: 780px; }
//           .mar-header h1 { font-size: 24px; }
//           .mar-request-btn { width: 100%; }
//         }
//       `}</style>

//       <div className="mar-page">
//         <div className="mar-container">

//           {/* HEADER */}
//           <div className="mar-header">
//             <div className="mar-header-left">
//               <h1>Admin — Staff Requests</h1>
//               <p>Give approved products to staff and manage requests.</p>
//             </div>

//             <button
//               type="button"
//               className="mar-request-btn"
//               onClick={handleRequestToAdmin}
//             >
//               📩 Request to Super Admin
//             </button>
//           </div>

//           {/* STATS */}
//           <div className="mar-stats">
//             <div className="mar-stat pending">
//               <div className="label">Pending</div>
//               <div className="value">{pending}</div>
//             </div>
//             <div className="mar-stat approved">
//               <div className="label">Approved</div>
//               <div className="value">{approved}</div>
//             </div>
//             <div className="mar-stat rejected">
//               <div className="label">Rejected</div>
//               <div className="value">{rejected}</div>
//             </div>
//             <div className="mar-stat completed">
//               <div className="label">Completed</div>
//               <div className="value">{completed}</div>
//             </div>
//           </div>

//           {/* TABLE CARD */}
//           <div className="mar-card">
//             {loading ? (
//               <div className="mar-loading">Loading your requests...</div>
//             ) : requests.length === 0 ? (
//               <div className="mar-empty">
//                 <div className="icon">📭</div>
//                 <p>You have not sent any requests yet.</p>
//               </div>
//             ) : (
//               <table className="mar-table">
//                 <thead>
//                   <tr>
//                     <th>Type</th>
//                     <th>Qty</th>
//                     <th>Staff</th>
//                     <th>Status</th>
//                     <th>Super Admin Note</th>
//                     <th>Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {requests.map((r) => (
//                     <tr key={r.id}>
//                       <td>
//                         <span className={`mar-type ${r.requestType === 'STOCK_REQUEST' ? 'stock' : ''}`}>
//                           {r.requestType === 'STOCK_REQUEST' ? '📦 new_product' : '📤 staff-request'}
//                         </span>
//                       </td>
//                       <td>{r.quantity ?? '—'}</td>
//                       <td>{r.staffName || '—'}</td>
//                       <td>
//                         <span className={`mar-badge badge-${(r.status || 'PENDING').toLowerCase()}`}>
//                           {r.status || 'PENDING'}
//                         </span>
//                       </td>
//                       <td>
//                         <span className="mar-note">{r.superAdminNote || '—'}</span>
//                       </td>
//                       <td>
//                         <div className="mar-actions">
//                           {r.status === 'APPROVED' && (
//                             <button
//                               className="mar-btn give"
//                               disabled={actionLoading === r.id}
//                               onClick={() => completeRequest(r.id)}
//                             >
//                               {actionLoading === r.id ? '…' : '🎁 Give'}
//                             </button>
//                           )}

//                           <button
//                             className="mar-btn update"
//                             disabled={actionLoading === r.id}
//                             onClick={() => openEdit(r)}
//                           >
//                             ✏️ Update
//                           </button>

//                           <button
//                             className="mar-btn delete"
//                             disabled={actionLoading === r.id}
//                             onClick={() => deleteRequest(r.id)}
//                           >
//                             {actionLoading === r.id ? '…' : '🗑️ Delete'}
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             )}

//             {success && <div className="mar-msg mar-success">{success}</div>}
//             {error && <div className="mar-msg mar-error">⚠️ {error}</div>}
//           </div>

//         </div>
//       </div>

//       {/* EDIT MODAL */}
//       {showEdit && editForm && (
//         <div className="mar-overlay" onClick={closeEdit}>
//           <div className="mar-modal" onClick={(e) => e.stopPropagation()}>
//             <div className="mar-modal-header">
//               <h3>Update Request #{editForm.id}</h3>
//               <button className="mar-modal-close" onClick={closeEdit}>×</button>
//             </div>

//             <form onSubmit={submitEdit}>
//               <div className="mar-form-grid">
//                 <div className="mar-field">
//                   <label className="mar-label">Request Type</label>
//                   <select
//                     name="requestType"
//                     value={editForm.requestType}
//                     onChange={handleEditChange}
//                     className="mar-input"
//                   >
//                     <option value="ADMIN_REQUEST">ADMIN_REQUEST</option>
//                     <option value="STOCK_REQUEST">STOCK_REQUEST</option>
//                   </select>
//                 </div>

//                 <div className="mar-field">
//                   <label className="mar-label">Status</label>
//                   <select
//                     name="status"
//                     value={editForm.status}
//                     onChange={handleEditChange}
//                     className="mar-input"
//                   >
//                     <option value="PENDING">PENDING</option>
//                     <option value="APPROVED">APPROVED</option>
//                     <option value="REJECTED">REJECTED</option>
//                     <option value="COMPLETED">COMPLETED</option>
//                   </select>
//                 </div>

//                 <div className="mar-field">
//                   <label className="mar-label">Quantity</label>
//                   <input
//                     type="number"
//                     min="1"
//                     name="quantity"
//                     value={editForm.quantity}
//                     onChange={handleEditChange}
//                     className="mar-input"
//                   />
//                 </div>

//                 <div className="mar-field">
//                   <label className="mar-label">Staff Name</label>
//                   <input
//                     name="staffName"
//                     value={editForm.staffName}
//                     onChange={handleEditChange}
//                     className="mar-input"
//                   />
//                 </div>

//                 <div className="mar-field">
//                   <label className="mar-label">Department</label>
//                   <input
//                     name="departmentName"
//                     value={editForm.departmentName}
//                     onChange={handleEditChange}
//                     className="mar-input"
//                   />
//                 </div>

//                 <div className="mar-field" style={{ gridColumn: '1 / -1' }}>
//                   <label className="mar-label">Description</label>
//                   <textarea
//                     name="description"
//                     value={editForm.description}
//                     onChange={handleEditChange}
//                     className="mar-input"
//                     rows={3}
//                   />
//                 </div>

//                 <div className="mar-field" style={{ gridColumn: '1 / -1' }}>
//                   <label className="mar-label">Super Admin Note</label>
//                   <textarea
//                     name="superAdminNote"
//                     value={editForm.superAdminNote}
//                     onChange={handleEditChange}
//                     className="mar-input"
//                     rows={2}
//                   />
//                 </div>
//               </div>

//               <div className="mar-modal-actions">
//                 <button type="button" className="mar-cancel" onClick={closeEdit} disabled={savingEdit}>
//                   Cancel
//                 </button>
//                 <button type="submit" className="mar-save" disabled={savingEdit}>
//                   {savingEdit ? 'Saving...' : 'Save Changes'}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

// export default MyRequests;

// export default MyRequests;
// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';

// const API = 'http://localhost:8080/api';

// const MyRequests = () => {
//   const navigate = useNavigate();

//   const [requests, setRequests] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [actionLoading, setActionLoading] = useState(null);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');

//   // Edit modal state
//   const [showEdit, setShowEdit] = useState(false);
//   const [editForm, setEditForm] = useState(null);
//   const [savingEdit, setSavingEdit] = useState(false);

//   const adminId = Number(localStorage.getItem('userId'));

//   // ===== Fetch my requests =====
//   const fetchMyRequests = async () => {
//     if (!adminId) {
//       setError('Please log in again.');
//       return;
//     }
//     setLoading(true);
//     setError('');
//     try {
//       const res = await axios.get(`${API}/admin-requests/my/${adminId}`);
//       setRequests(Array.isArray(res.data) ? res.data : []);
//     } catch (err) {
//       console.error('Fetch error:', err);
//       setError('Failed to load your requests. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchMyRequests();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // ===== Give product to staff =====
//   const completeRequest = async (id) => {
//     if (!window.confirm('Give this product to the staff? Stock will be reduced.')) return;
//     setActionLoading(id);
//     setError('');
//     setSuccess('');
//     try {
//       await axios.put(`${API}/admin-requests/complete/${id}`);
//       setSuccess('✅ Product has been given to the staff successfully!');
//       fetchMyRequests();
//     } catch (err) {
//       const msg = err.response?.data;
//       setError(typeof msg === 'string' ? msg : 'Failed to complete the request.');
//     } finally {
//       setActionLoading(null);
//     }
//   };

//   // ===== Delete request =====
//   const deleteRequest = async (id) => {
//     if (!window.confirm('Are you sure you want to delete this request? This cannot be undone.')) return;
//     setActionLoading(id);
//     setError('');
//     setSuccess('');
//     try {
//       await axios.delete(`${API}/admin-requests/delete/${id}`);
//       setSuccess('🗑️ Request deleted successfully!');
//       setRequests((prev) => prev.filter((r) => r.id !== id));
//     } catch (err) {
//       const msg = err.response?.data;
//       setError(typeof msg === 'string' ? msg : 'Failed to delete the request.');
//     } finally {
//       setActionLoading(null);
//     }
//   };

//   // ===== Open update modal =====
//   const openEdit = (req) => {
//     setEditForm({
//       id: req.id,
//       requestType: req.requestType || '',
//       status: req.status || 'PENDING',
//       quantity: req.quantity ?? '',
//       departmentName: req.departmentName || '',
//       description: req.description || '',
//       superAdminNote: req.superAdminNote || '',
//     });
//     setShowEdit(true);
//     setError('');
//     setSuccess('');
//   };

//   const closeEdit = () => {
//     setShowEdit(false);
//     setEditForm(null);
//   };

//   const handleEditChange = (e) => {
//     const { name, value } = e.target;
//     setEditForm((prev) => ({ ...prev, [name]: value }));
//   };

//   // ===== Submit update =====
//   const submitEdit = async (e) => {
//     e.preventDefault();
//     if (!editForm) return;

//     if (!editForm.quantity || Number(editForm.quantity) <= 0) {
//       return alert('Please enter a valid quantity.');
//     }

//     setSavingEdit(true);
//     setError('');
//     setSuccess('');
//     try {
//       await axios.put(`${API}/admin-requests/update/${editForm.id}`, {
//         requestType: editForm.requestType,
//         status: editForm.status,
//         quantity: Number(editForm.quantity),
//         departmentName: editForm.departmentName.trim(),
//         description: editForm.description.trim(),
//         superAdminNote: editForm.superAdminNote.trim(),
//       });
//       setSuccess('✏️ Request updated successfully!');
//       closeEdit();
//       fetchMyRequests();
//     } catch (err) {
//       const msg = err.response?.data;
//       setError(typeof msg === 'string' ? msg : 'Failed to update the request.');
//     } finally {
//       setSavingEdit(false);
//     }
//   };

//   // ===== Request to Super Admin =====
//   const handleRequestToAdmin = () => navigate('/admin-request-product');

//   // ===== Stats =====
//   const pending   = requests.filter((r) => r.status === 'PENDING').length;
//   const approved  = requests.filter((r) => r.status === 'APPROVED').length;
//   const rejected  = requests.filter((r) => r.status === 'REJECTED').length;
//   const completed = requests.filter((r) => r.status === 'COMPLETED').length;

//   return (
//     <>
//       <style>{`
//         * { box-sizing: border-box; }
//         .mar-page { min-height: 100vh; background: #f4f7fb; padding: 35px 20px; font-family: Arial, sans-serif; }
//         .mar-container { max-width: 1150px; margin: 0 auto; }

//         .mar-header {
//           margin-bottom: 25px; display: flex; justify-content: space-between;
//           align-items: flex-start; gap: 20px; flex-wrap: wrap;
//         }
//         .mar-header-left { flex: 1; min-width: 250px; }
//         .mar-header h1 { margin: 0; color: #172033; font-size: 30px; font-weight: 700; }
//         .mar-header p { margin: 8px 0 0; color: #718096; font-size: 15px; }

//         .mar-request-btn {
//           border: none;
//           background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
//           color: #fff; padding: 13px 24px; border-radius: 10px;
//           font-size: 14px; font-weight: 700; cursor: pointer;
//           box-shadow: 0 6px 16px rgba(139, 92, 246, 0.35);
//           white-space: nowrap;
//         }
//         .mar-request-btn:hover { transform: translateY(-2px); }

//         .mar-stats {
//           display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
//           gap: 15px; margin-bottom: 25px;
//         }
//         .mar-stat {
//           background: #fff; border-radius: 14px; padding: 18px;
//           border-left: 5px solid #2563eb;
//           box-shadow: 0 6px 18px rgba(15,23,42,0.06);
//         }
//         .mar-stat.pending   { border-left-color: #f59e0b; }
//         .mar-stat.approved  { border-left-color: #16a34a; }
//         .mar-stat.rejected  { border-left-color: #dc2626; }
//         .mar-stat.completed { border-left-color: #2563eb; }

//         .mar-stat .label { font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
//         .mar-stat .value { font-size: 26px; font-weight: 800; color: #172033; margin-top: 6px; }

//         .mar-card { background: #fff; border-radius: 16px; padding: 24px; border: 1px solid #edf0f5; box-shadow: 0 10px 30px rgba(15,23,42,0.08); }
//         .mar-empty { text-align: center; padding: 50px 20px; color: #94a3b8; }
//         .mar-empty .icon { font-size: 45px; margin-bottom: 10px; }
//         .mar-empty p { margin: 0; font-size: 14px; }

//         .mar-table { width: 100%; border-collapse: collapse; }
//         .mar-table thead tr { background: #f1f5f9; }
//         .mar-table th { padding: 13px 14px; text-align: left; font-size: 12px; color: #334155; font-weight: 700; text-transform: uppercase; letter-spacing: 0.4px; }
//         .mar-table td { padding: 14px; font-size: 13px; color: #475569; border-bottom: 1px solid #e2e8f0; vertical-align: middle; }
//         .mar-table tbody tr:hover { background: #f8fafc; }

//         .mar-badge { display: inline-block; padding: 5px 11px; border-radius: 7px; font-size: 11px; font-weight: 700; letter-spacing: 0.4px; }
//         .badge-pending   { background: #fef3c7; color: #92400e; }
//         .badge-approved  { background: #dcfce7; color: #166534; }
//         .badge-rejected  { background: #fee2e2; color: #991b1b; }
//         .badge-completed { background: #dbeafe; color: #1e40af; }

//         .mar-type { display: inline-block; padding: 5px 11px; border-radius: 7px; font-size: 11px; font-weight: 700; background: #ede9fe; color: #6d28d9; }
//         .mar-type.stock { background: #dcfce7; color: #15803d; }

//         .mar-actions { display: flex; gap: 6px; flex-wrap: wrap; }

//         .mar-btn {
//           padding: 7px 12px; border: none; border-radius: 7px;
//           color: #fff; font-size: 11px; font-weight: 700; cursor: pointer;
//         }
//         .mar-btn:disabled { opacity: 0.6; cursor: not-allowed; }
//         .mar-btn.give    { background: #16a34a; }
//         .mar-btn.update  { background: #2563eb; }
//         .mar-btn.delete  { background: #dc2626; }

//         .mar-note { font-size: 12px; color: #64748b; font-style: italic; max-width: 220px; display: inline-block; }

//         .mar-msg { margin-top: 18px; padding: 13px 15px; border-radius: 10px; font-size: 14px; }
//         .mar-success { background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; }
//         .mar-error   { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }

//         .mar-loading { text-align: center; padding: 50px 20px; color: #64748b; font-size: 14px; }

//         /* EDIT MODAL */
//         .mar-overlay {
//           position: fixed; inset: 0; background: rgba(15,23,42,0.5);
//           display: flex; align-items: center; justify-content: center;
//           z-index: 1000; padding: 20px;
//         }
//         .mar-modal {
//           background: #fff; border-radius: 14px; padding: 28px;
//           width: 100%; max-width: 620px; max-height: 90vh; overflow-y: auto;
//           box-shadow: 0 20px 50px rgba(0,0,0,0.25);
//         }
//         .mar-modal-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
//         .mar-modal-header h3 { margin: 0; color: #1e293b; }
//         .mar-modal-close { border: none; background: #fee2e2; color: #dc2626; width: 34px; height: 34px; border-radius: 50%; font-size: 20px; cursor: pointer; }

//         .mar-form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; }
//         .mar-field { display: flex; flex-direction: column; }
//         .mar-label { font-size: 13px; font-weight: 600; color: #334155; margin-bottom: 6px; }
//         .mar-input { padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 7px; font-size: 14px; outline: none; }

//         .mar-modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 24px; }
//         .mar-cancel { padding: 10px 18px; border: 1px solid #cbd5e1; background: #fff; color: #475569; border-radius: 7px; cursor: pointer; font-weight: 600; }
//         .mar-save { padding: 10px 22px; border: none; background: #2563eb; color: #fff; border-radius: 7px; cursor: pointer; font-weight: 700; }

//         @media (max-width: 800px) {
//           .mar-card { padding: 12px; overflow-x: auto; }
//           .mar-table { min-width: 780px; }
//           .mar-header h1 { font-size: 24px; }
//           .mar-request-btn { width: 100%; }
//         }
//       `}</style>

//       <div className="mar-page">
//         <div className="mar-container">

//           {/* HEADER */}
//           <div className="mar-header">
//             <div className="mar-header-left">
//               <h1>Admin — Staff Requests</h1>
//               <p>Give approved products to staff and manage requests.</p>
//             </div>

//             <button
//               type="button"
//               className="mar-request-btn"
//               onClick={handleRequestToAdmin}
//             >
//               📩 Request to Super Admin
//             </button>
//           </div>

//           {/* STATS */}
//           <div className="mar-stats">
//             <div className="mar-stat pending">
//               <div className="label">Pending</div>
//               <div className="value">{pending}</div>
//             </div>
//             <div className="mar-stat approved">
//               <div className="label">Approved</div>
//               <div className="value">{approved}</div>
//             </div>
//             <div className="mar-stat rejected">
//               <div className="label">Rejected</div>
//               <div className="value">{rejected}</div>
//             </div>
//             <div className="mar-stat completed">
//               <div className="label">Completed</div>
//               <div className="value">{completed}</div>
//             </div>
//           </div>

//           {/* TABLE CARD */}
//           <div className="mar-card">
//             {loading ? (
//               <div className="mar-loading">Loading your requests...</div>
//             ) : requests.length === 0 ? (
//               <div className="mar-empty">
//                 <div className="icon">📭</div>
//                 <p>You have not sent any requests yet.</p>
//               </div>
//             ) : (
//               <table className="mar-table">
//                 <thead>
//                   <tr>
//                     <th>Type</th>
//                     <th>Qty</th>
//                     <th>Status</th>
//                     <th>Super Admin Note</th>
//                     <th>Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {requests.map((r) => (
//                     <tr key={r.id}>
//                       <td>
//                         <span className={`mar-type ${r.requestType === 'STOCK_REQUEST' ? 'stock' : ''}`}>
//                           {r.requestType === 'STOCK_REQUEST' ? '📦 new_product' : '📤 staff-request'}
//                         </span>
//                       </td>
//                       <td>{r.quantity ?? '—'}</td>
//                       <td>
//                         <span className={`mar-badge badge-${(r.status || 'PENDING').toLowerCase()}`}>
//                           {r.status || 'PENDING'}
//                         </span>
//                       </td>
//                       <td>
//                         <span className="mar-note">{r.superAdminNote || '—'}</span>
//                       </td>
//                       <td>
//                         <div className="mar-actions">
//                           {r.status === 'APPROVED' && (
//                             <button
//                               className="mar-btn give"
//                               disabled={actionLoading === r.id}
//                               onClick={() => completeRequest(r.id)}
//                             >
//                               {actionLoading === r.id ? '…' : '🎁 Give'}
//                             </button>
//                           )}

//                           <button
//                             className="mar-btn update"
//                             disabled={actionLoading === r.id}
//                             onClick={() => openEdit(r)}
//                           >
//                             ✏️ Update
//                           </button>

//                           {/* <button
//                             className="mar-btn delete"
//                             disabled={actionLoading === r.id}
//                             onClick={() => deleteRequest(r.id)}
//                           >
//                             {actionLoading === r.id ? '…' : '🗑️ Delete'}
//                           </button> */}
//                         </div>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             )}

//             {success && <div className="mar-msg mar-success">{success}</div>}
//             {error && <div className="mar-msg mar-error">⚠️ {error}</div>}
//           </div>

//         </div>
//       </div>

//       {/* EDIT MODAL */}
//       {showEdit && editForm && (
//         <div className="mar-overlay" onClick={closeEdit}>
//           <div className="mar-modal" onClick={(e) => e.stopPropagation()}>
//             <div className="mar-modal-header">
//               <h3>Update Request #{editForm.id}</h3>
//               <button className="mar-modal-close" onClick={closeEdit}>×</button>
//             </div>

//             <form onSubmit={submitEdit}>
//               <div className="mar-form-grid">
//                 <div className="mar-field">
//                   <label className="mar-label">Request Type</label>
//                   <select
//                     name="requestType"
//                     value={editForm.requestType}
//                     onChange={handleEditChange}
//                     className="mar-input"
//                   >
//                     <option value="ADMIN_REQUEST">ADMIN_REQUEST</option>
//                     <option value="STOCK_REQUEST">STOCK_REQUEST</option>
//                   </select>
//                 </div>

//                 <div className="mar-field">
//                   <label className="mar-label">Status</label>
//                   <select
//                     name="status"
//                     value={editForm.status}
//                     onChange={handleEditChange}
//                     className="mar-input"
//                   >
//                     <option value="PENDING">PENDING</option>
//                     <option value="APPROVED">APPROVED</option>
//                     <option value="REJECTED">REJECTED</option>
//                     <option value="COMPLETED">COMPLETED</option>
//                   </select>
//                 </div>

//                 <div className="mar-field">
//                   <label className="mar-label">Quantity</label>
//                   <input
//                     type="number"
//                     min="1"
//                     name="quantity"
//                     value={editForm.quantity}
//                     onChange={handleEditChange}
//                     className="mar-input"
//                   />
//                 </div>

//                 <div className="mar-field">
//                   <label className="mar-label">Department</label>
//                   <input
//                     name="departmentName"
//                     value={editForm.departmentName}
//                     onChange={handleEditChange}
//                     className="mar-input"
//                   />
//                 </div>

//                 <div className="mar-field" style={{ gridColumn: '1 / -1' }}>
//                   <label className="mar-label">Description</label>
//                   <textarea
//                     name="description"
//                     value={editForm.description}
//                     onChange={handleEditChange}
//                     className="mar-input"
//                     rows={3}
//                   />
//                 </div>

//                 <div className="mar-field" style={{ gridColumn: '1 / -1' }}>
//                   <label className="mar-label">Super Admin Note</label>
//                   <textarea
//                     name="superAdminNote"
//                     value={editForm.superAdminNote}
//                     onChange={handleEditChange}
//                     className="mar-input"
//                     rows={2}
//                   />
//                 </div>
//               </div>

//               <div className="mar-modal-actions">
//                 <button type="button" className="mar-cancel" onClick={closeEdit} disabled={savingEdit}>
//                   Cancel
//                 </button>
//                 <button type="submit" className="mar-save" disabled={savingEdit}>
//                   {savingEdit ? 'Saving...' : 'Save Changes'}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

// export default MyRequests;

// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';

// const API = 'http://localhost:8080/api';

// const MyRequests = () => {
//   const navigate = useNavigate();

//   const [requests, setRequests] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [actionLoading, setActionLoading] = useState(null);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');

//   // Edit modal state
//   const [showEdit, setShowEdit] = useState(false);
//   const [editForm, setEditForm] = useState(null);
//   const [savingEdit, setSavingEdit] = useState(false);

//   const adminId = Number(localStorage.getItem('userId'));

//   // ===== Fetch my requests =====
//   const fetchMyRequests = async () => {
//     if (!adminId) {
//       setError('Please log in again.');
//       return;
//     }
//     setLoading(true);
//     setError('');
//     try {
//       const res = await axios.get(`${API}/admin-requests/my/${adminId}`);
//       setRequests(Array.isArray(res.data) ? res.data : []);
//     } catch (err) {
//       console.error('Fetch error:', err);
//       setError('Failed to load your requests. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchMyRequests();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // ===== Give product to staff =====
//   const completeRequest = async (id) => {
//     if (!window.confirm('Give this product to the staff? Stock will be reduced.')) return;
//     setActionLoading(id);
//     setError('');
//     setSuccess('');
//     try {
//       await axios.put(`${API}/admin-requests/complete/${id}`);
//       setSuccess('✅ Product has been given to the staff successfully!');
//       fetchMyRequests();
//     } catch (err) {
//       const msg = err.response?.data;
//       setError(typeof msg === 'string' ? msg : 'Failed to complete the request.');
//     } finally {
//       setActionLoading(null);
//     }
//   };

//   // ===== Delete request =====
//   const deleteRequest = async (id) => {
//     if (!window.confirm('Are you sure you want to delete this request? This cannot be undone.')) return;
//     setActionLoading(id);
//     setError('');
//     setSuccess('');
//     try {
//       await axios.delete(`${API}/admin-requests/delete/${id}`);
//       setSuccess('🗑️ Request deleted successfully!');
//       setRequests((prev) => prev.filter((r) => r.id !== id));
//     } catch (err) {
//       const msg = err.response?.data;
//       setError(typeof msg === 'string' ? msg : 'Failed to delete the request.');
//     } finally {
//       setActionLoading(null);
//     }
//   };

//   // ===== Open update modal =====
//   const openEdit = (req) => {
//     setEditForm({
//       id: req.id,
//       requestType: req.requestType || '',
//       status: req.status || 'PENDING',
//       quantity: req.quantity ?? '',
//       departmentName: req.departmentName || '',
//       description: req.description || '',
//       superAdminNote: req.superAdminNote || '',
//     });
//     setShowEdit(true);
//     setError('');
//     setSuccess('');
//   };

//   const closeEdit = () => {
//     setShowEdit(false);
//     setEditForm(null);
//   };

//   const handleEditChange = (e) => {
//     const { name, value } = e.target;
//     setEditForm((prev) => ({ ...prev, [name]: value }));
//   };

//   // ===== Submit update =====
//   const submitEdit = async (e) => {
//     e.preventDefault();
//     if (!editForm) return;

//     if (!editForm.quantity || Number(editForm.quantity) <= 0) {
//       return alert('Please enter a valid quantity.');
//     }

//     setSavingEdit(true);
//     setError('');
//     setSuccess('');
//     try {
//       // ⚠️ departmentName is NOT sent — backend keeps the existing value
//       await axios.put(`${API}/admin-requests/update/${editForm.id}`, {
//         requestType: editForm.requestType,
//         status: editForm.status,
//         quantity: Number(editForm.quantity),
//         description: editForm.description.trim(),
//         superAdminNote: editForm.superAdminNote.trim(),
//       });
//       setSuccess('✏️ Request updated successfully!');
//       closeEdit();
//       fetchMyRequests();
//     } catch (err) {
//       const msg = err.response?.data;
//       setError(typeof msg === 'string' ? msg : 'Failed to update the request.');
//     } finally {
//       setSavingEdit(false);
//     }
//   };

//   // ===== Request to Super Admin =====
//   const handleRequestToAdmin = () => navigate('/admin-request-product');

//   // ===== Stats =====
//   const pending   = requests.filter((r) => r.status === 'PENDING').length;
//   const approved  = requests.filter((r) => r.status === 'APPROVED').length;
//   const rejected  = requests.filter((r) => r.status === 'REJECTED').length;
//   const completed = requests.filter((r) => r.status === 'COMPLETED').length;

//   return (
//     <>
//       <style>{`
//         * { box-sizing: border-box; }
//         .mar-page { min-height: 100vh; background: #f4f7fb; padding: 35px 20px; font-family: Arial, sans-serif; }
//         .mar-container { max-width: 1150px; margin: 0 auto; }

//         .mar-header {
//           margin-bottom: 25px; display: flex; justify-content: space-between;
//           align-items: flex-start; gap: 20px; flex-wrap: wrap;
//         }
//         .mar-header-left { flex: 1; min-width: 250px; }
//         .mar-header h1 { margin: 0; color: #172033; font-size: 30px; font-weight: 700; }
//         .mar-header p { margin: 8px 0 0; color: #718096; font-size: 15px; }

//         .mar-request-btn {
//           border: none;
//           background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
//           color: #fff; padding: 13px 24px; border-radius: 10px;
//           font-size: 14px; font-weight: 700; cursor: pointer;
//           box-shadow: 0 6px 16px rgba(139, 92, 246, 0.35);
//           white-space: nowrap;
//         }
//         .mar-request-btn:hover { transform: translateY(-2px); }

//         .mar-stats {
//           display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
//           gap: 15px; margin-bottom: 25px;
//         }
//         .mar-stat {
//           background: #fff; border-radius: 14px; padding: 18px;
//           border-left: 5px solid #2563eb;
//           box-shadow: 0 6px 18px rgba(15,23,42,0.06);
//         }
//         .mar-stat.pending   { border-left-color: #f59e0b; }
//         .mar-stat.approved  { border-left-color: #16a34a; }
//         .mar-stat.rejected  { border-left-color: #dc2626; }
//         .mar-stat.completed { border-left-color: #2563eb; }

//         .mar-stat .label { font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
//         .mar-stat .value { font-size: 26px; font-weight: 800; color: #172033; margin-top: 6px; }

//         .mar-card { background: #fff; border-radius: 16px; padding: 24px; border: 1px solid #edf0f5; box-shadow: 0 10px 30px rgba(15,23,42,0.08); }
//         .mar-empty { text-align: center; padding: 50px 20px; color: #94a3b8; }
//         .mar-empty .icon { font-size: 45px; margin-bottom: 10px; }
//         .mar-empty p { margin: 0; font-size: 14px; }

//         .mar-table { width: 100%; border-collapse: collapse; }
//         .mar-table thead tr { background: #f1f5f9; }
//         .mar-table th { padding: 13px 14px; text-align: left; font-size: 12px; color: #334155; font-weight: 700; text-transform: uppercase; letter-spacing: 0.4px; white-space: nowrap; }
//         .mar-table td { padding: 14px; font-size: 13px; color: #475569; border-bottom: 1px solid #e2e8f0; vertical-align: middle; }
//         .mar-table tbody tr:hover { background: #f8fafc; }

//         .mar-badge { display: inline-block; padding: 5px 11px; border-radius: 7px; font-size: 11px; font-weight: 700; letter-spacing: 0.4px; }
//         .badge-pending   { background: #fef3c7; color: #92400e; }
//         .badge-approved  { background: #dcfce7; color: #166534; }
//         .badge-rejected  { background: #fee2e2; color: #991b1b; }
//         .badge-completed { background: #dbeafe; color: #1e40af; }

//         .mar-type { display: inline-block; padding: 5px 11px; border-radius: 7px; font-size: 11px; font-weight: 700; background: #ede9fe; color: #6d28d9; }
//         .mar-type.stock { background: #dcfce7; color: #15803d; }

//         .mar-actions { display: flex; gap: 6px; flex-wrap: wrap; }

//         .mar-btn {
//           padding: 7px 12px; border: none; border-radius: 7px;
//           color: #fff; font-size: 11px; font-weight: 700; cursor: pointer;
//         }
//         .mar-btn:disabled { opacity: 0.6; cursor: not-allowed; }
//         .mar-btn.give    { background: #16a34a; }
//         .mar-btn.update  { background: #2563eb; }
//         .mar-btn.delete  { background: #dc2626; }

//         .mar-note { font-size: 12px; color: #64748b; font-style: italic; max-width: 220px; display: inline-block; }

//         .mar-desc { font-size: 12.5px; color: #475569; max-width: 240px; display: inline-block; word-break: break-word; }

//         .mar-msg { margin-top: 18px; padding: 13px 15px; border-radius: 10px; font-size: 14px; }
//         .mar-success { background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; }
//         .mar-error   { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }

//         .mar-loading { text-align: center; padding: 50px 20px; color: #64748b; font-size: 14px; }

//         /* EDIT MODAL */
//         .mar-overlay {
//           position: fixed; inset: 0; background: rgba(15,23,42,0.5);
//           display: flex; align-items: center; justify-content: center;
//           z-index: 1000; padding: 20px;
//         }
//         .mar-modal {
//           background: #fff; border-radius: 14px; padding: 28px;
//           width: 100%; max-width: 620px; max-height: 90vh; overflow-y: auto;
//           box-shadow: 0 20px 50px rgba(0,0,0,0.25);
//         }
//         .mar-modal-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
//         .mar-modal-header h3 { margin: 0; color: #1e293b; }
//         .mar-modal-close { border: none; background: #fee2e2; color: #dc2626; width: 34px; height: 34px; border-radius: 50%; font-size: 20px; cursor: pointer; }

//         .mar-form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; }
//         .mar-field { display: flex; flex-direction: column; }
//         .mar-label { font-size: 13px; font-weight: 600; color: #334155; margin-bottom: 6px; }
//         .mar-input { padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 7px; font-size: 14px; outline: none; }
//         .mar-input[readonly] { background: #f1f5f9; color: #64748b; cursor: not-allowed; }

//         .mar-modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 24px; }
//         .mar-cancel { padding: 10px 18px; border: 1px solid #cbd5e1; background: #fff; color: #475569; border-radius: 7px; cursor: pointer; font-weight: 600; }
//         .mar-save { padding: 10px 22px; border: none; background: #2563eb; color: #fff; border-radius: 7px; cursor: pointer; font-weight: 700; }

//         @media (max-width: 800px) {
//           .mar-card { padding: 12px; overflow-x: auto; }
//           .mar-table { min-width: 780px; }
//           .mar-header h1 { font-size: 24px; }
//           .mar-request-btn { width: 100%; }
//         }
//       `}</style>

//       <div className="mar-page">
//         <div className="mar-container">

//           {/* HEADER */}
//           <div className="mar-header">
//             <div className="mar-header-left">
//               <h1>Admin — Staff Requests</h1>
//               <p>Give approved products to staff and manage requests.</p>
//             </div>

//             <button
//               type="button"
//               className="mar-request-btn"
//               onClick={handleRequestToAdmin}
//             >
//               📩 Request to Super Admin
//             </button>
//           </div>

//           {/* STATS */}
//           <div className="mar-stats">
//             <div className="mar-stat pending">
//               <div className="label">Pending</div>
//               <div className="value">{pending}</div>
//             </div>
//             <div className="mar-stat approved">
//               <div className="label">Approved</div>
//               <div className="value">{approved}</div>
//             </div>
//             <div className="mar-stat rejected">
//               <div className="label">Rejected</div>
//               <div className="value">{rejected}</div>
//             </div>
//             <div className="mar-stat completed">
//               <div className="label">Completed</div>
//               <div className="value">{completed}</div>
//             </div>
//           </div>

//           {/* TABLE CARD */}
//           <div className="mar-card">
//             {loading ? (
//               <div className="mar-loading">Loading your requests...</div>
//             ) : requests.length === 0 ? (
//               <div className="mar-empty">
//                 <div className="icon">📭</div>
//                 <p>You have not sent any requests yet.</p>
//               </div>
//             ) : (
//               <table className="mar-table">
//                 <thead>
//                   <tr>
//                     <th>Type</th>
//                     <th>Qty</th>
//                     {/* ✅ NEW: Description column */}
//                     <th>Description</th>
//                     <th>Status</th>
//                     <th>Super Admin Note</th>
//                     <th>Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {requests.map((r) => (
//                     <tr key={r.id}>
//                       <td>
//                         <span className={`mar-type ${r.requestType === 'STOCK_REQUEST' ? 'stock' : ''}`}>
//                           {r.requestType === 'STOCK_REQUEST' ? '📦 new_product' : '📤 staff-request'}
//                         </span>
//                       </td>
//                       <td>{r.quantity ?? '—'}</td>

//                       {/* ✅ Description cell */}
//                       <td>
//                         <span className="mar-desc" title={r.description || ''}>
//                           {r.description || '—'}
//                         </span>
//                       </td>

//                       <td>
//                         <span className={`mar-badge badge-${(r.status || 'PENDING').toLowerCase()}`}>
//                           {r.status || 'PENDING'}
//                         </span>
//                       </td>
//                       <td>
//                         <span className="mar-note">{r.superAdminNote || '—'}</span>
//                       </td>
//                       <td>
//                         <div className="mar-actions">
//                           {r.status === 'APPROVED' && (
//                             <button
//                               className="mar-btn give"
//                               disabled={actionLoading === r.id}
//                               onClick={() => completeRequest(r.id)}
//                             >
//                               {actionLoading === r.id ? '…' : '🎁 Give'}
//                             </button>
//                           )}

//                           <button
//                             className="mar-btn update"
//                             disabled={actionLoading === r.id}
//                             onClick={() => openEdit(r)}
//                           >
//                             ✏️ Update
//                           </button>

//                           {/* <button
//                             className="mar-btn delete"
//                             disabled={actionLoading === r.id}
//                             onClick={() => deleteRequest(r.id)}
//                           >
//                             {actionLoading === r.id ? '…' : '🗑️ Delete'}
//                           </button> */}
//                         </div>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             )}

//             {success && <div className="mar-msg mar-success">{success}</div>}
//             {error && <div className="mar-msg mar-error">⚠️ {error}</div>}
//           </div>

//         </div>
//       </div>

//       {/* EDIT MODAL */}
//       {showEdit && editForm && (
//         <div className="mar-overlay" onClick={closeEdit}>
//           <div className="mar-modal" onClick={(e) => e.stopPropagation()}>
//             <div className="mar-modal-header">
//               <h3>Update Request #{editForm.id}</h3>
//               <button className="mar-modal-close" onClick={closeEdit}>×</button>
//             </div>

//             <form onSubmit={submitEdit}>
//               <div className="mar-form-grid">
//                 <div className="mar-field">
//                   <label className="mar-label">Request Type</label>
//                   <select
//                     name="requestType"
//                     value={editForm.requestType}
//                     onChange={handleEditChange}
//                     className="mar-input"
//                   >
//                     {/* <option value="ADMIN_REQUEST">ADMIN_REQUEST</option> */}
//                     <option value="STOCK_REQUEST">STOCK_REQUEST</option>
//                   </select>
//                 </div>

//                 <div className="mar-field">
//                   <label className="mar-label">Status</label>
//                   <select
//                     name="status"
//                     value={editForm.status}
//                     onChange={handleEditChange}
//                     className="mar-input"
//                   >
//                     <option value="PENDING">PENDING</option>
//                     <option value="APPROVED">APPROVED</option>
//                     <option value="REJECTED">REJECTED</option>
//                     <option value="COMPLETED">COMPLETED</option>
//                   </select>
//                 </div>

//                 <div className="mar-field">
//                   <label className="mar-label">Quantity</label>
//                   <input
//                     type="number"
//                     min="1"
//                     name="quantity"
//                     value={editForm.quantity}
//                     onChange={handleEditChange}
//                     className="mar-input"
//                   />
//                 </div>

//                 {/* ✅ Department shown as read-only (auto-filled, never updated) */}
//                 <div className="mar-field">
//                   <label className="mar-label">Department (auto)</label>
//                   <input
//                     name="departmentName"
//                     value={editForm.departmentName}
//                     readOnly
//                     className="mar-input"
//                     title="Department is filled automatically and cannot be changed here"
//                   />
//                 </div>

//                 {/* ✅ Description editable */}
//                 <div className="mar-field" style={{ gridColumn: '1 / -1' }}>
//                   <label className="mar-label">Description</label>
//                   <textarea
//                     name="description"
//                     value={editForm.description}
//                     onChange={handleEditChange}
//                     className="mar-input"
//                     rows={3}
//                     placeholder="Describe the request..."
//                   />
//                 </div>

//                 <div className="mar-field" style={{ gridColumn: '1 / -1' }}>
//                   <label className="mar-label">Super Admin Note</label>
//                   <textarea
//                     name="superAdminNote"
//                     value={editForm.superAdminNote}
//                     onChange={handleEditChange}
//                     className="mar-input"
//                     rows={2}
//                   />
//                 </div>
//               </div>

//               <div className="mar-modal-actions">
//                 <button type="button" className="mar-cancel" onClick={closeEdit} disabled={savingEdit}>
//                   Cancel
//                 </button>
//                 <button type="submit" className="mar-save" disabled={savingEdit}>
//                   {savingEdit ? 'Saving...' : 'Save Changes'}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

// export default MyRequests;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API = 'http://localhost:8080/api';

const MyRequests = () => {
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Edit modal state
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const adminId = Number(localStorage.getItem('userId'));

  // ===== Fetch my requests =====
  const fetchMyRequests = async () => {
    if (!adminId) {
      setError('Please log in again.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${API}/admin-requests/my/${adminId}`);
      setRequests(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to load your requests. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ===== Give product to staff =====
  const completeRequest = async (id) => {
    if (!window.confirm('Give this product to the staff? Stock will be reduced.')) return;
    setActionLoading(id);
    setError('');
    setSuccess('');
    try {
      await axios.put(`${API}/admin-requests/complete/${id}`);
      setSuccess('✅ Product has been given to the staff successfully!');
      fetchMyRequests();
    } catch (err) {
      const msg = err.response?.data;
      setError(typeof msg === 'string' ? msg : 'Failed to complete the request.');
    } finally {
      setActionLoading(null);
    }
  };

  // ===== Delete request =====
  const deleteRequest = async (id) => {
    if (!window.confirm('Are you sure you want to delete this request? This cannot be undone.')) return;
    setActionLoading(id);
    setError('');
    setSuccess('');
    try {
      await axios.delete(`${API}/admin-requests/delete/${id}`);
      setSuccess('🗑️ Request deleted successfully!');
      setRequests((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      const msg = err.response?.data;
      setError(typeof msg === 'string' ? msg : 'Failed to delete the request.');
    } finally {
      setActionLoading(null);
    }
  };

  // ===== Open update modal =====
  const openEdit = (req) => {
    setEditForm({
      id: req.id,
      requestType: req.requestType || '',
      status: req.status || 'PENDING',
      quantity: req.quantity ?? '',
      departmentName: req.departmentName || '',
      description: req.description || '',
      superAdminNote: req.superAdminNote || '',
    });
    setShowEdit(true);
    setError('');
    setSuccess('');
  };

  const closeEdit = () => {
    setShowEdit(false);
    setEditForm(null);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  // ===== Submit update =====
  const submitEdit = async (e) => {
    e.preventDefault();
    if (!editForm) return;

    if (!editForm.quantity || Number(editForm.quantity) <= 0) {
      return alert('Please enter a valid quantity.');
    }

    setSavingEdit(true);
    setError('');
    setSuccess('');
    try {
      // ⚠️ departmentName is NOT sent — backend keeps the existing value
      await axios.put(`${API}/admin-requests/update/${editForm.id}`, {
        requestType: editForm.requestType,
        status: editForm.status,
        quantity: Number(editForm.quantity),
        description: editForm.description.trim(),
        superAdminNote: editForm.superAdminNote.trim(),
      });
      setSuccess('✏️ Request updated successfully!');
      closeEdit();
      fetchMyRequests();
    } catch (err) {
      const msg = err.response?.data;
      setError(typeof msg === 'string' ? msg : 'Failed to update the request.');
    } finally {
      setSavingEdit(false);
    }
  };

  // ===== Request to Super Admin =====
  const handleRequestToAdmin = () => navigate('/admin-request-product');

  // ===== Stats =====
  // ✅ Normalize status so we don't miss anything (uppercase + trim)
  const statusOf = (r) => (r.status || 'PENDING').toString().trim().toUpperCase();

  const pending   = requests.filter((r) => statusOf(r) === 'PENDING').length;
  const approved  = requests.filter((r) => statusOf(r) === 'APPROVED').length;
  const rejected  = requests.filter((r) => statusOf(r) === 'REJECTED').length;
  const completed = requests.filter((r) => statusOf(r) === 'COMPLETED').length;
  const checked   = requests.filter((r) => statusOf(r) === 'CHECKED').length;

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        .mar-page { min-height: 100vh; background: #f4f7fb; padding: 35px 20px; font-family: Arial, sans-serif; }
        .mar-container { max-width: 1150px; margin: 0 auto; }

        .mar-header {
          margin-bottom: 25px; display: flex; justify-content: space-between;
          align-items: flex-start; gap: 20px; flex-wrap: wrap;
        }
        .mar-header-left { flex: 1; min-width: 250px; }
        .mar-header h1 { margin: 0; color: #172033; font-size: 30px; font-weight: 700; }
        .mar-header p { margin: 8px 0 0; color: #718096; font-size: 15px; }

        .mar-request-btn {
          border: none;
          background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
          color: #fff; padding: 13px 24px; border-radius: 10px;
          font-size: 14px; font-weight: 700; cursor: pointer;
          box-shadow: 0 6px 16px rgba(139, 92, 246, 0.35);
          white-space: nowrap;
        }
        .mar-request-btn:hover { transform: translateY(-2px); }

        .mar-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 15px; margin-bottom: 25px;
        }
        .mar-stat {
          background: #fff; border-radius: 14px; padding: 18px;
          border-left: 5px solid #2563eb;
          box-shadow: 0 6px 18px rgba(15,23,42,0.06);
        }
        .mar-stat.pending   { border-left-color: #f59e0b; }
        .mar-stat.approved  { border-left-color: #16a34a; }
        .mar-stat.rejected  { border-left-color: #dc2626; }
        .mar-stat.completed { border-left-color: #2563eb; }
        .mar-stat.checked   { border-left-color: #7c3aed; }

        .mar-stat .label { font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
        .mar-stat .value { font-size: 26px; font-weight: 800; color: #172033; margin-top: 6px; }

        .mar-card { background: #fff; border-radius: 16px; padding: 24px; border: 1px solid #edf0f5; box-shadow: 0 10px 30px rgba(15,23,42,0.08); }
        .mar-empty { text-align: center; padding: 50px 20px; color: #94a3b8; }
        .mar-empty .icon { font-size: 45px; margin-bottom: 10px; }
        .mar-empty p { margin: 0; font-size: 14px; }

        .mar-table { width: 100%; border-collapse: collapse; }
        .mar-table thead tr { background: #f1f5f9; }
        .mar-table th { padding: 13px 14px; text-align: left; font-size: 12px; color: #334155; font-weight: 700; text-transform: uppercase; letter-spacing: 0.4px; white-space: nowrap; }
        .mar-table td { padding: 14px; font-size: 13px; color: #475569; border-bottom: 1px solid #e2e8f0; vertical-align: middle; }
        .mar-table tbody tr:hover { background: #f8fafc; }

        .mar-badge { display: inline-block; padding: 5px 11px; border-radius: 7px; font-size: 11px; font-weight: 700; letter-spacing: 0.4px; }
        .badge-pending   { background: #fef3c7; color: #92400e; }
        .badge-approved  { background: #dcfce7; color: #166534; }
        .badge-rejected  { background: #fee2e2; color: #991b1b; }
        .badge-completed { background: #dbeafe; color: #1e40af; }
        .badge-checked   { background: #ede9fe; color: #6d28d9; }

        .mar-type { display: inline-block; padding: 5px 11px; border-radius: 7px; font-size: 11px; font-weight: 700; background: #ede9fe; color: #6d28d9; }
        .mar-type.stock { background: #dcfce7; color: #15803d; }

        .mar-actions { display: flex; gap: 6px; flex-wrap: wrap; }

        .mar-btn {
          padding: 7px 12px; border: none; border-radius: 7px;
          color: #fff; font-size: 11px; font-weight: 700; cursor: pointer;
        }
        .mar-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .mar-btn.give    { background: #16a34a; }
        .mar-btn.update  { background: #2563eb; }
        .mar-btn.delete  { background: #dc2626; }

        .mar-note { font-size: 12px; color: #64748b; font-style: italic; max-width: 220px; display: inline-block; }

        .mar-desc { font-size: 12.5px; color: #475569; max-width: 240px; display: inline-block; word-break: break-word; }

        .mar-msg { margin-top: 18px; padding: 13px 15px; border-radius: 10px; font-size: 14px; }
        .mar-success { background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; }
        .mar-error   { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }

        .mar-loading { text-align: center; padding: 50px 20px; color: #64748b; font-size: 14px; }

        /* EDIT MODAL */
        .mar-overlay {
          position: fixed; inset: 0; background: rgba(15,23,42,0.5);
          display: flex; align-items: center; justify-content: center;
          z-index: 1000; padding: 20px;
        }
        .mar-modal {
          background: #fff; border-radius: 14px; padding: 28px;
          width: 100%; max-width: 620px; max-height: 90vh; overflow-y: auto;
          box-shadow: 0 20px 50px rgba(0,0,0,0.25);
        }
        .mar-modal-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
        .mar-modal-header h3 { margin: 0; color: #1e293b; }
        .mar-modal-close { border: none; background: #fee2e2; color: #dc2626; width: 34px; height: 34px; border-radius: 50%; font-size: 20px; cursor: pointer; }

        .mar-form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; }
        .mar-field { display: flex; flex-direction: column; }
        .mar-label { font-size: 13px; font-weight: 600; color: #334155; margin-bottom: 6px; }
        .mar-input { padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 7px; font-size: 14px; outline: none; }
        .mar-input[readonly] { background: #f1f5f9; color: #64748b; cursor: not-allowed; }

        .mar-modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 24px; }
        .mar-cancel { padding: 10px 18px; border: 1px solid #cbd5e1; background: #fff; color: #475569; border-radius: 7px; cursor: pointer; font-weight: 600; }
        .mar-save { padding: 10px 22px; border: none; background: #2563eb; color: #fff; border-radius: 7px; cursor: pointer; font-weight: 700; }

        @media (max-width: 800px) {
          .mar-card { padding: 12px; overflow-x: auto; }
          .mar-table { min-width: 780px; }
          .mar-header h1 { font-size: 24px; }
          .mar-request-btn { width: 100%; }
        }
      `}</style>

      <div className="mar-page">
        <div className="mar-container">

          {/* HEADER */}
          <div className="mar-header">
            <div className="mar-header-left">
              <h1>Admin — Staff Requests</h1>
              <p>Give approved products to staff and manage requests.</p>
            </div>

            <button
              type="button"
              className="mar-request-btn"
              onClick={handleRequestToAdmin}
            >
              📩 Request to Super Admin
            </button>
          </div>

          {/* STATS */}
          <div className="mar-stats">
            <div className="mar-stat pending">
              <div className="label">Pending</div>
              <div className="value">{pending}</div>
            </div>
            <div className="mar-stat checked">
              <div className="label">Checked</div>
              <div className="value">{checked}</div>
            </div>
            <div className="mar-stat approved">
              <div className="label">Approved</div>
              <div className="value">{approved}</div>
            </div>
            <div className="mar-stat rejected">
              <div className="label">Rejected</div>
              <div className="value">{rejected}</div>
            </div>
            <div className="mar-stat completed">
              <div className="label">Completed</div>
              <div className="value">{completed}</div>
            </div>
          </div>

          {/* TABLE CARD */}
          <div className="mar-card">
            {loading ? (
              <div className="mar-loading">Loading your requests...</div>
            ) : requests.length === 0 ? (
              <div className="mar-empty">
                <div className="icon">📭</div>
                <p>You have not sent any requests yet.</p>
              </div>
            ) : (
              <table className="mar-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Qty</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Super Admin Note</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((r) => {
                    // ✅ Normalize so badge class matches case
                    const s = (r.status || 'PENDING').toString().trim().toUpperCase();
                    const badgeClass = `badge-${s.toLowerCase()}`;

                    return (
                      <tr key={r.id}>
                        <td>
                          <span className={`mar-type ${r.requestType === 'STOCK_REQUEST' ? 'stock' : ''}`}>
                            {r.requestType === 'STOCK_REQUEST' ? '📦 new_product' : '📤 staff-request'}
                          </span>
                        </td>
                        <td>{r.quantity ?? '—'}</td>

                        <td>
                          <span className="mar-desc" title={r.description || ''}>
                            {r.description || '—'}
                          </span>
                        </td>

                        <td>
                          {/* ✅ badge class now handles any status incl. CHECKED */}
                          <span className={`mar-badge ${badgeClass}`}>
                            {s}
                          </span>
                        </td>
                        <td>
                          <span className="mar-note">{r.superAdminNote || '—'}</span>
                        </td>
                        <td>
                          <div className="mar-actions">
                            {s === 'APPROVED' && (
                              <button
                                className="mar-btn give"
                                disabled={actionLoading === r.id}
                                onClick={() => completeRequest(r.id)}
                              >
                                {actionLoading === r.id ? '…' : '🎁 Give'}
                              </button>
                            )}

                            <button
                              className="mar-btn update"
                              disabled={actionLoading === r.id}
                              onClick={() => openEdit(r)}
                            >
                              ✏️ Update
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}

            {success && <div className="mar-msg mar-success">{success}</div>}
            {error && <div className="mar-msg mar-error">⚠️ {error}</div>}
          </div>

        </div>
      </div>

      {/* EDIT MODAL */}
      {showEdit && editForm && (
        <div className="mar-overlay" onClick={closeEdit}>
          <div className="mar-modal" onClick={(e) => e.stopPropagation()}>
            <div className="mar-modal-header">
              <h3>Update Request #{editForm.id}</h3>
              <button className="mar-modal-close" onClick={closeEdit}>×</button>
            </div>

            <form onSubmit={submitEdit}>
              <div className="mar-form-grid">
                <div className="mar-field">
                  <label className="mar-label">Request Type</label>
                  <select
                    name="requestType"
                    value={editForm.requestType}
                    onChange={handleEditChange}
                    className="mar-input"
                  >
                    <option value="STOCK_REQUEST">STOCK_REQUEST</option>
                  </select>
                </div>

                <div className="mar-field">
                  <label className="mar-label">Status</label>
                  <select
                    name="status"
                    value={editForm.status}
                    onChange={handleEditChange}
                    className="mar-input"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="CHECKED">CHECKED</option>
                    <option value="APPROVED">APPROVED</option>
                    <option value="REJECTED">REJECTED</option>
                    <option value="COMPLETED">COMPLETED</option>
                  </select>
                </div>

                <div className="mar-field">
                  <label className="mar-label">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    name="quantity"
                    value={editForm.quantity}
                    onChange={handleEditChange}
                    className="mar-input"
                  />
                </div>

                <div className="mar-field">
                  <label className="mar-label">Department (auto)</label>
                  <input
                    name="departmentName"
                    value={editForm.departmentName}
                    readOnly
                    className="mar-input"
                    title="Department is filled automatically and cannot be changed here"
                  />
                </div>

                <div className="mar-field" style={{ gridColumn: '1 / -1' }}>
                  <label className="mar-label">Description</label>
                  <textarea
                    name="description"
                    value={editForm.description}
                    onChange={handleEditChange}
                    className="mar-input"
                    rows={3}
                    placeholder="Describe the request..."
                  />
                </div>

                <div className="mar-field" style={{ gridColumn: '1 / -1' }}>
                  <label className="mar-label">Super Admin Note</label>
                  <textarea
                    name="superAdminNote"
                    value={editForm.superAdminNote}
                    onChange={handleEditChange}
                    className="mar-input"
                    rows={2}
                  />
                </div>
              </div>

              <div className="mar-modal-actions">
                <button type="button" className="mar-cancel" onClick={closeEdit} disabled={savingEdit}>
                  Cancel
                </button>
                <button type="submit" className="mar-save" disabled={savingEdit}>
                  {savingEdit ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default MyRequests;