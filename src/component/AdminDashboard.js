// // export default AdminDashboard;
// import React, { useState, useEffect, useMemo } from 'react';
// import jsPDF from 'jspdf';
// import autoTable from 'jspdf-autotable';
// import * as XLSX from 'xlsx';

// // Use relative URLs so the dev-server proxy forwards them (no CORS)
// const API_BASE = '/api';

// const PRODUCTS_ENDPOINT = `${API_BASE}/products/all`;
// const DEPARTMENTS_ENDPOINT = `${API_BASE}/departments`;
// const USERS_ENDPOINT = `${API_BASE}/users`;

// // =====================================================
// // Helpers: pick fields from any shape
// // =====================================================
// const pickUsername = (u) => {
//   if (!u || typeof u !== 'object') return '';
//   const direct =
//     u.user_name ?? u.userName ?? u.username ?? u.name ??
//     u.fullName ?? u.full_name ?? u.displayName;
//   if (direct != null && String(direct).trim() !== '') return String(direct);

//   const emailLike = /@/;
//   const phoneLike = /^\+?\d{7,}$/;
//   const numberLike = /^\d+$/;
//   const roleLike = /^(admin|staff|super|supper|user|manager|role)/i;

//   for (const [, val] of Object.entries(u)) {
//     if (typeof val !== 'string') continue;
//     const v = val.trim();
//     if (!v) continue;
//     if (emailLike.test(v)) continue;
//     if (phoneLike.test(v)) continue;
//     if (numberLike.test(v)) continue;
//     if (roleLike.test(v)) continue;
//     return v;
//   }
//   return '';
// };

// const pickPhone = (u) => {
//   if (!u) return '';
//   return u.phone_number ?? u.phoneNumber ?? u.phone ?? u.mobileNumber ?? u.mobile ?? '';
// };

// const pickRole = (u) => {
//   if (!u) return '';
//   if (typeof u.role === 'string') return u.role;
//   if (u.role && typeof u.role === 'object') return u.role.roleName ?? u.role.name ?? '';
//   return '';
// };

// const pickDeptId = (d) =>
//   d?.departmentId ?? d?.deptId ?? d?.department_id ?? d?.id ?? null;

// const pickDeptName = (d) =>
//   d?.departmentName ?? d?.deptName ?? d?.department_name ?? d?.name ?? d?.department ?? null;

// const normalizeArray = (data) => {
//   if (Array.isArray(data)) return data;
//   if (Array.isArray(data?.data)) return data.data;
//   if (Array.isArray(data?.content)) return data.content;
//   if (Array.isArray(data?.departments)) return data.departments;
//   if (Array.isArray(data?.users)) return data.users;
//   return [];
// };

// // =====================================================
// // ✅ Bulletproof department resolver
// //    Handles: object, string-name, numeric-string, number,
// //    and top-level departmentId field.
// // =====================================================
// const resolveUserDepartment = (u, deptMap) => {
//   if (!u) return '';

//   const dep = u.department ?? u.dept ?? u.departmentObj;

//   // 1) Nested object
//   if (dep && typeof dep === 'object') {
//     const name =
//       dep.departmentName ??
//       dep.deptName ??
//       dep.department_name ??
//       dep.name ??
//       dep.department ??
//       dep.departmentTitle;
//     if (name && String(name).trim()) return String(name);

//     const id =
//       dep.departmentId ??
//       dep.deptId ??
//       dep.department_id ??
//       dep.id;
//     if (id != null) {
//       const key = String(id);
//       if (deptMap && deptMap[key]) return deptMap[key];
//     }
//   }

//   // 2) Plain string
//   if (typeof dep === 'string' && dep.trim()) {
//     const trimmed = dep.trim();
//     // Numeric string → treat as ID
//     if (/^\d+$/.test(trimmed)) {
//       if (deptMap && deptMap[trimmed]) return deptMap[trimmed];
//     }
//     // Otherwise it's a real name
//     return trimmed;
//   }

//   // 3) ✅ Plain NUMBER (FK id) → look up in map
//   if (typeof dep === 'number') {
//     const key = String(dep);
//     if (deptMap && deptMap[key]) return deptMap[key];
//   }

//   // 4) Top-level departmentId / deptId → look up in map
//   const topId =
//     u.departmentId ??
//     u.department_id ??
//     u.deptId ??
//     u.dept_id;
//   if (topId != null) {
//     const key = String(topId);
//     if (deptMap && deptMap[key]) return deptMap[key];
//   }

//   // 5) Fallback: any key with "department" that holds a string
//   for (const [key, val] of Object.entries(u)) {
//     if (!/department/i.test(key)) continue;
//     if (typeof val === 'string' && val.trim()) return val;
//   }

//   return '';
// };

// const AdminDashboard = () => {
//   const [departments, setDepartments] = useState([]);
//   const [departmentsLoading, setDepartmentsLoading] = useState(false);
//   const [departmentsError, setDepartmentsError] = useState('');
//   const [showDepartments, setShowDepartments] = useState(false);

//   const [showReportOptions, setShowReportOptions] = useState(false);
//   const [downloadingType, setDownloadingType] = useState(null);
//   const [reportError, setReportError] = useState('');
//   const [reportKind, setReportKind] = useState('products');

//   // Build deptMap: departmentId → departmentName
//   const deptMap = useMemo(() => {
//     const map = {};
//     departments.forEach((d) => {
//       const id = pickDeptId(d);
//       const name = pickDeptName(d);
//       if (id != null && name) {
//         map[String(id)] = name;
//       }
//     });
//     return map;
//   }, [departments]);

//   // Pre-load departments on mount
//   useEffect(() => {
//     fetchDepartments();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   useEffect(() => {
//     if (showDepartments) fetchDepartments();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [showDepartments]);

//   // ============ FETCH DEPARTMENTS ============
//   const fetchDepartments = async () => {
//     setDepartmentsLoading(true);
//     setDepartmentsError('');
//     try {
//       const response = await fetch(DEPARTMENTS_ENDPOINT);
//       if (!response.ok) {
//         const text = await response.text();
//         throw new Error(text || `Server responded with ${response.status}`);
//       }
//       const text = await response.text();
//       const data = text ? JSON.parse(text) : [];

//       console.log('🏢 Raw departments response:', data);

//       const list = normalizeArray(data);
//       setDepartments(list);

//       if (list.length === 0) {
//         setDepartmentsError('No departments found in the database.');
//       }
//     } catch (error) {
//       console.error('❌ Error fetching departments:', error);
//       setDepartmentsError(
//         error.message === 'Failed to fetch'
//           ? 'Cannot reach the server. Make sure the backend is running.'
//           : error.message || 'Failed to load departments.'
//       );
//       setDepartments([]);
//     } finally {
//       setDepartmentsLoading(false);
//     }
//   };

//   // =====================================================
//   // PRODUCTS — PDF / EXCEL
//   // =====================================================
//   const generateProductsPdf = (products) => {
//     const doc = new jsPDF({ orientation: 'landscape' });
//     doc.setFontSize(16);
//     doc.text('Product Report', 14, 18);
//     doc.setFontSize(10);
//     doc.setTextColor(100);
//     doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 24);

//     const columns = [
//       { header: 'ID', dataKey: 'id' },
//       { header: 'Name', dataKey: 'name' },
//       { header: 'Description', dataKey: 'description' },
//       { header: 'Quantity', dataKey: 'quantity' },
//       { header: 'Unit Price', dataKey: 'unitPrice' },
//       { header: 'Supplier', dataKey: 'supplier' },
//       { header: 'Receipt Date', dataKey: 'receiptDate' },
//       { header: 'Issue Date', dataKey: 'issueDate' },
//     ];

//     const rows = products.map((p) => ({
//       id: p.productId ?? '',
//       name: p.productName ?? '',
//       description: p.productDescription ?? '',
//       quantity: p.productQuantity ?? '',
//       unitPrice: p.price ?? '',
//       supplier: p.supplierName ?? '',
//       receiptDate: p.receiptDate ?? '',
//       issueDate: p.issueDate ?? '',
//     }));

//     autoTable(doc, {
//       columns,
//       body: rows,
//       startY: 30,
//       styles: { fontSize: 9, cellPadding: 3 },
//       headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
//       alternateRowStyles: { fillColor: [248, 250, 252] },
//       margin: { left: 10, right: 10 },
//     });

//     doc.save(`product-report-${Date.now()}.pdf`);
//   };

//   const generateProductsExcel = (products) => {
//     const data = products.map((p) => ({
//       ID: p.productId ?? '',
//       Name: p.productName ?? '',
//       Description: p.productDescription ?? '',
//       Quantity: p.productQuantity ?? '',
//       'Unit Price': p.price ?? '',
//       Supplier: p.supplierName ?? '',
//       'Receipt Date': p.receiptDate ?? '',
//       'Issue Date': p.issueDate ?? '',
//     }));

//     const worksheet = XLSX.utils.json_to_sheet(data);
//     worksheet['!cols'] = [
//       { wch: 8 }, { wch: 25 }, { wch: 35 }, { wch: 10 },
//       { wch: 12 }, { wch: 22 }, { wch: 14 }, { wch: 14 },
//     ];

//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');
//     XLSX.writeFile(workbook, `product-report-${Date.now()}.xlsx`);
//   };

//   // =====================================================
//   // USERS — PDF / EXCEL
//   // =====================================================
//   const generateUsersPdf = (users) => {
//     console.log('=== USERS COUNT ===', users.length);
//     console.log('=== deptMap ===', deptMap);

//     const doc = new jsPDF({ orientation: 'landscape' });
//     doc.setFontSize(16);
//     doc.text('Users Report', 14, 18);
//     doc.setFontSize(10);
//     doc.setTextColor(100);
//     doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 24);

//     const columns = [
//       { header: 'ID', dataKey: 'id' },
//       { header: 'Username', dataKey: 'username' },
//       { header: 'Email', dataKey: 'email' },
//       { header: 'Gender', dataKey: 'gender' },
//       { header: 'Phone', dataKey: 'phone' },
//       { header: 'Role', dataKey: 'role' },
//       { header: 'Department', dataKey: 'department' },
//     ];

//     const rows = users.map((u) => {
//       const resolved = resolveUserDepartment(u, deptMap);
//       console.log(
//         `User ${u.userId ?? u.id} (${pickUsername(u)}): department=${JSON.stringify(u.department)} → ${resolved || '(empty)'}`
//       );
//       return {
//         id: u.userId ?? u.id ?? '',
//         username: pickUsername(u),
//         email: u.email ?? '',
//         gender: u.gender ?? '',
//         phone: pickPhone(u),
//         role: pickRole(u),
//         department: resolved || '-',
//       };
//     });

//     autoTable(doc, {
//       columns,
//       body: rows,
//       startY: 30,
//       styles: { fontSize: 9, cellPadding: 3 },
//       headStyles: { fillColor: [249, 115, 22], textColor: 255, fontStyle: 'bold' },
//       alternateRowStyles: { fillColor: [255, 247, 237] },
//       margin: { left: 10, right: 10 },
//     });

//     doc.save(`users-report-${Date.now()}.pdf`);
//   };

//   const generateUsersExcel = (users) => {
//     console.log('=== EXCEL USERS COUNT ===', users.length);
//     console.log('=== deptMap ===', deptMap);

//     const data = users.map((u) => ({
//       ID: u.userId ?? u.id ?? '',
//       Username: pickUsername(u),
//       Email: u.email ?? '',
//       Gender: u.gender ?? '',
//       Phone: pickPhone(u),
//       Role: pickRole(u),
//       Department: resolveUserDepartment(u, deptMap) || '-',
//     }));

//     const worksheet = XLSX.utils.json_to_sheet(data);
//     worksheet['!cols'] = [
//       { wch: 8 }, { wch: 25 }, { wch: 30 }, { wch: 10 },
//       { wch: 16 }, { wch: 16 }, { wch: 22 },
//     ];

//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');
//     XLSX.writeFile(workbook, `users-report-${Date.now()}.xlsx`);
//   };

//   // ============ DOWNLOAD REPORT ============
//   const handleDownloadReport = async (type) => {
//     setDownloadingType(type);
//     setReportError('');

//     try {
//       const isUsers = reportKind === 'users';
//       const endpoint = isUsers ? USERS_ENDPOINT : PRODUCTS_ENDPOINT;
//       const fileBase = isUsers ? 'users-report' : 'product-report';

//       // Ensure departments are loaded BEFORE generating users report
//       if (isUsers && departments.length === 0) {
//         console.log('⚠️ Departments not loaded yet — fetching now...');
//         await fetchDepartments();
//       }

//       const response = await fetch(endpoint, {
//         method: 'GET',
//         headers: { Accept: 'application/json' },
//       });

//       if (!response.ok) {
//         let errorMsg = `Server responded with ${response.status}`;
//         try {
//           const errText = await response.text();
//           if (errText) errorMsg = errText;
//         } catch (_) {}
//         throw new Error(errorMsg);
//       }

//       const contentType = (response.headers.get('Content-Type') || '').toLowerCase();

//       if (
//         contentType.includes('application/pdf') ||
//         contentType.includes('spreadsheetml') ||
//         contentType.includes('application/vnd.ms-excel')
//       ) {
//         const blob = await response.blob();
//         if (blob.size === 0) throw new Error('Received an empty file from the server.');

//         const disposition = response.headers.get('Content-Disposition') || '';
//         let filename = type === 'pdf' ? `${fileBase}.pdf` : `${fileBase}.xlsx`;
//         const match = disposition.match(/filename\*?=["']?([^"';]+)["']?/);
//         if (match && match[1]) filename = decodeURIComponent(match[1]);

//         const url = window.URL.createObjectURL(blob);
//         const link = document.createElement('a');
//         link.href = url;
//         link.download = filename;
//         document.body.appendChild(link);
//         link.click();
//         document.body.removeChild(link);
//         window.URL.revokeObjectURL(url);

//         setShowReportOptions(false);
//         return;
//       }

//       const data = await response.json();
//       if (!Array.isArray(data) || data.length === 0) {
//         throw new Error('No data available to export.');
//       }

//       console.log('=== RAW API RESPONSE (first user) ===');
//       console.log(JSON.stringify(data[0], null, 2));

//       if (isUsers) {
//         if (type === 'pdf') generateUsersPdf(data);
//         else generateUsersExcel(data);
//       } else {
//         if (type === 'pdf') generateProductsPdf(data);
//         else generateProductsExcel(data);
//       }

//       setShowReportOptions(false);
//     } catch (error) {
//       console.error('Error downloading report:', error);
//       setReportError(
//         error.message === 'Failed to fetch'
//           ? 'Cannot reach the server. Make sure the backend is running and the proxy is configured.'
//           : error.message
//       );
//     } finally {
//       setDownloadingType(null);
//     }
//   };

//   // ============ CARDS ============
//   const cards = [
//     {
//       title: 'Products',
//       icon: '📦',
//       description: 'Download a report of all registered products.',
//       color: '#3b82f6',
//       actions: [{ label: 'Download Product Report', type: 'report', kind: 'products' }],
//     },
//     {
//       title: 'Users',
//       icon: '👥',
//       description: 'Download a report of all registered users in the system.',
//       color: '#f97316',
//       actions: [{ label: 'Download Users Report', type: 'report', kind: 'users' }],
//     },
//     {
//       title: 'Departments',
//       icon: '🏢',
//       description: 'View all registered departments in the system.',
//       color: '#10b981',
//       actions: [{ label: 'List Registered Departments', type: 'departments' }],
//     },
//   ];

//   const handleAction = (action) => {
//     if (action.type === 'report') {
//       setReportError('');
//       setReportKind(action.kind || 'products');
//       setShowReportOptions(true);
//     } else if (action.type === 'departments') {
//       setShowDepartments(true);
//     } else if (action.path) {
//       window.location.href = action.path;
//     }
//   };

//   // ============ STYLES ============
//   const modalOverlay = {
//     position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     display: 'flex', alignItems: 'center', justifyContent: 'center',
//     zIndex: 1000,
//   };

//   const modalContent = {
//     backgroundColor: '#fff',
//     borderRadius: '12px',
//     padding: '30px',
//     maxWidth: '600px',
//     width: '90%',
//     maxHeight: '80vh',
//     overflowY: 'auto',
//     boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
//   };

//   const closeButton = {
//     marginTop: '20px',
//     padding: '10px 24px',
//     border: 'none',
//     borderRadius: '7px',
//     backgroundColor: '#e2e8f0',
//     color: '#1e293b',
//     fontSize: '14px',
//     fontWeight: '600',
//     cursor: 'pointer',
//   };

//   const isUsersReport = reportKind === 'users';
//   const reportTitle = isUsersReport ? 'Download Users Report' : 'Download Product Report';
//   const reportAccent = isUsersReport ? '#f97316' : '#3b82f6';

//   return (
//     <div style={{ padding: '30px' }}>
//       <p style={{ margin: '0 0 24px', color: '#64748b', fontSize: 15 }}>
//         Welcome to the Inventory Management System
//       </p>

//       <div
//         style={{
//           display: 'grid',
//           gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
//           gap: '20px',
//         }}
//       >
//         {cards.map((card) => (
//           <div
//             key={card.title}
//             style={{
//               backgroundColor: '#ffffff',
//               borderRadius: '12px',
//               padding: '24px',
//               border: '1px solid #e2e8f0',
//               borderLeft: `5px solid ${card.color}`,
//               boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
//               transition: 'all 0.3s ease',
//             }}
//             onMouseEnter={(e) => {
//               e.currentTarget.style.transform = 'translateY(-5px)';
//               e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.12)';
//             }}
//             onMouseLeave={(e) => {
//               e.currentTarget.style.transform = 'translateY(0)';
//               e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.06)';
//             }}
//           >
//             <div
//               style={{
//                 width: '55px', height: '55px', borderRadius: '10px',
//                 backgroundColor: `${card.color}15`,
//                 display: 'flex', alignItems: 'center', justifyContent: 'center',
//                 fontSize: '30px', marginBottom: '18px',
//               }}
//             >
//               {card.icon}
//             </div>

//             <h2 style={{ margin: '0 0 8px 0', color: '#1e293b', fontSize: '20px' }}>
//               {card.title}
//             </h2>

//             <p style={{ margin: '0 0 20px 0', color: '#64748b', fontSize: '14px', lineHeight: '1.5' }}>
//               {card.description}
//             </p>

//             <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
//               {card.actions.map((action) => (
//                 <button
//                   key={action.label}
//                   onClick={() => handleAction(action)}
//                   style={{
//                     width: '100%', padding: '11px 15px', border: 'none',
//                     borderRadius: '7px', backgroundColor: card.color,
//                     color: '#ffffff', fontSize: '14px', fontWeight: '600',
//                     cursor: 'pointer',
//                   }}
//                 >
//                   {action.label} →
//                 </button>
//               ))}
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* ============ REPORT OPTIONS MODAL ============ */}
//       {showReportOptions && (
//         <div style={modalOverlay} onClick={() => !downloadingType && setShowReportOptions(false)}>
//           <div style={modalContent} onClick={(e) => e.stopPropagation()}>
//             <h2 style={{ marginTop: 0, color: '#1e293b' }}>📄 {reportTitle}</h2>
//             <p style={{ color: '#64748b', marginBottom: '20px' }}>
//               Choose the format you want to download:
//             </p>

//             {reportError && (
//               <div style={{
//                 background: '#fef2f2', color: '#dc2626',
//                 border: '1px solid #fecaca', padding: '12px 15px',
//                 borderRadius: '8px', marginBottom: '18px',
//                 fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px',
//               }}>
//                 ⚠️ {reportError}
//               </div>
//             )}

//             <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
//               <button
//                 onClick={() => handleDownloadReport('pdf')}
//                 disabled={downloadingType === 'pdf'}
//                 style={{
//                   flex: 1, minWidth: '160px', padding: '20px 20px', border: 'none',
//                   borderRadius: '10px',
//                   background: downloadingType === 'pdf' ? '#f87171'
//                     : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
//                   color: '#fff', fontSize: '15px', fontWeight: '700',
//                   cursor: downloadingType === 'pdf' ? 'wait' : 'pointer',
//                   boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
//                   display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
//                 }}
//               >
//                 <span style={{ fontSize: '32px' }}>{downloadingType === 'pdf' ? '⏳' : '📄'}</span>
//                 {downloadingType === 'pdf' ? 'Downloading...' : 'Download PDF'}
//               </button>

//               <button
//                 onClick={() => handleDownloadReport('excel')}
//                 disabled={downloadingType === 'excel'}
//                 style={{
//                   flex: 1, minWidth: '160px', padding: '20px 20px', border: 'none',
//                   borderRadius: '10px',
//                   background: downloadingType === 'excel' ? '#4ade80'
//                     : 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
//                   color: '#fff', fontSize: '15px', fontWeight: '700',
//                   cursor: downloadingType === 'excel' ? 'wait' : 'pointer',
//                   boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)',
//                   display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
//                 }}
//               >
//                 <span style={{ fontSize: '32px' }}>{downloadingType === 'excel' ? '⏳' : '📊'}</span>
//                 {downloadingType === 'excel' ? 'Downloading...' : 'Download Excel'}
//               </button>
//             </div>

//             <div style={{ textAlign: 'right' }}>
//               <button
//                 style={{ ...closeButton, borderTop: `3px solid ${reportAccent}` }}
//                 onClick={() => setShowReportOptions(false)}
//                 disabled={!!downloadingType}
//               >
//                 Cancel
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ============ DEPARTMENTS MODAL ============ */}
//       {showDepartments && (
//         <div style={modalOverlay} onClick={() => setShowDepartments(false)}>
//           <div style={modalContent} onClick={(e) => e.stopPropagation()}>
//             <h2 style={{ marginTop: 0, color: '#1e293b' }}>🏢 Registered Departments</h2>

//             {departmentsLoading ? (
//               <p style={{ color: '#64748b' }}>Loading departments...</p>
//             ) : departmentsError ? (
//               <div style={{
//                 background: '#fef2f2', color: '#dc2626',
//                 border: '1px solid #fecaca', padding: '12px 15px',
//                 borderRadius: '8px', marginBottom: '10px', fontSize: '13px',
//               }}>
//                 ⚠️ {departmentsError}
//               </div>
//             ) : departments.length === 0 ? (
//               <p style={{ color: '#64748b' }}>No departments found.</p>
//             ) : (
//               <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
//                 <thead>
//                   <tr style={{ backgroundColor: '#f1f5f9' }}>
//                     <th style={thStyle}>#</th>
//                     <th style={thStyle}>ID</th>
//                     <th style={thStyle}>Department Name</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {departments.map((dept, index) => (
//                     <tr key={pickDeptId(dept) ?? `dept-${index}`} style={{ borderBottom: '1px solid #e2e8f0' }}>
//                       <td style={tdStyle}>{index + 1}</td>
//                       <td style={tdStyle}>{pickDeptId(dept) ?? '-'}</td>
//                       <td style={{ ...tdStyle, fontWeight: 600, color: '#1e293b' }}>
//                         {pickDeptName(dept) ?? '-'}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             )}

//             <div style={{ textAlign: 'right' }}>
//               <button style={closeButton} onClick={() => setShowDepartments(false)}>
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// const thStyle = {
//   padding: '12px 16px', textAlign: 'left',
//   fontSize: '14px', color: '#334155', fontWeight: '600',
// };

// const tdStyle = {
//   padding: '12px 16px', fontSize: '14px', color: '#475569',
// };

// export default AdminDashboard;

// export default AdminDashboard;
import React, { useState, useEffect, useMemo } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

// Use relative URLs so the dev-server proxy forwards them (no CORS)
const API_BASE = '/api';

const PRODUCTS_ENDPOINT = `${API_BASE}/products/all`;
const DEPARTMENTS_ENDPOINT = `${API_BASE}/departments`;
const USERS_ENDPOINT = `${API_BASE}/users`;
const PRODUCT_REQUESTS_ENDPOINT = `${API_BASE}/product-requests/all`;

// =====================================================
// Helpers: pick fields from any shape
// =====================================================
const pickUsername = (u) => {
  if (!u || typeof u !== 'object') return '';
  const direct =
    u.user_name ?? u.userName ?? u.username ?? u.name ??
    u.fullName ?? u.full_name ?? u.displayName;
  if (direct != null && String(direct).trim() !== '') return String(direct);

  const emailLike = /@/;
  const phoneLike = /^\+?\d{7,}$/;
  const numberLike = /^\d+$/;
  const roleLike = /^(admin|staff|super|supper|user|manager|role)/i;

  for (const [, val] of Object.entries(u)) {
    if (typeof val !== 'string') continue;
    const v = val.trim();
    if (!v) continue;
    if (emailLike.test(v)) continue;
    if (phoneLike.test(v)) continue;
    if (numberLike.test(v)) continue;
    if (roleLike.test(v)) continue;
    return v;
  }
  return '';
};

const pickPhone = (u) => {
  if (!u) return '';
  return u.phone_number ?? u.phoneNumber ?? u.phone ?? u.mobileNumber ?? u.mobile ?? '';
};

const pickRole = (u) => {
  if (!u) return '';
  if (typeof u.role === 'string') return u.role;
  if (u.role && typeof u.role === 'object') return u.role.roleName ?? u.role.name ?? '';
  return '';
};

const pickDeptId = (d) =>
  d?.departmentId ?? d?.deptId ?? d?.department_id ?? d?.id ?? null;

const pickDeptName = (d) =>
  d?.departmentName ?? d?.deptName ?? d?.department_name ?? d?.name ?? d?.department ?? null;

const normalizeArray = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.departments)) return data.departments;
  if (Array.isArray(data?.users)) return data.users;
  return [];
};

// =====================================================
// ✅ Bulletproof department resolver
// =====================================================
const resolveUserDepartment = (u, deptMap) => {
  if (!u) return '';

  const dep = u.department ?? u.dept ?? u.departmentObj;

  // 1) Nested object
  if (dep && typeof dep === 'object') {
    const name =
      dep.departmentName ??
      dep.deptName ??
      dep.department_name ??
      dep.name ??
      dep.department ??
      dep.departmentTitle;
    if (name && String(name).trim()) return String(name);

    const id =
      dep.departmentId ??
      dep.deptId ??
      dep.department_id ??
      dep.id;
    if (id != null) {
      const key = String(id);
      if (deptMap && deptMap[key]) return deptMap[key];
    }
  }

  // 2) Plain string
  if (typeof dep === 'string' && dep.trim()) {
    const trimmed = dep.trim();
    if (/^\d+$/.test(trimmed)) {
      if (deptMap && deptMap[trimmed]) return deptMap[trimmed];
    }
    return trimmed;
  }

  // 3) Plain NUMBER (FK id)
  if (typeof dep === 'number') {
    const key = String(dep);
    if (deptMap && deptMap[key]) return deptMap[key];
  }

  // 4) Top-level departmentId / deptId
  const topId = u.departmentId ?? u.department_id ?? u.deptId ?? u.dept_id;
  if (topId != null) {
    const key = String(topId);
    if (deptMap && deptMap[key]) return deptMap[key];
  }

  // 5) Fallback
  for (const [key, val] of Object.entries(u)) {
    if (!/department/i.test(key)) continue;
    if (typeof val === 'string' && val.trim()) return val;
  }

  return '';
};

// =====================================================
// ✅ Merge products + requests (for full report)
// =====================================================
const mergeProductsWithRequests = (products, requests) => {
  const requestMap = new Map();
  requests.forEach((req) => {
    if (req?.product?.productId) {
      requestMap.set(req.product.productId, req);
    }
  });

  return products.map((prod) => {
    const req = requestMap.get(prod.productId);
    const requestStatus = req?.status ?? 'AVAILABLE';

    const stockStatus =
      requestStatus === 'APPROVED'
        ? 'Out of Stock'
        : Number(prod.productQuantity) > 0
          ? 'In Stock'
          : 'Out of Stock';

    return {
      ...prod,
      productQuantity: prod.productQuantity ?? '0',
      requestQuantity: req?.quantity ?? '-',
      adminNote: req?.adminNote ?? '-',
      description: req?.description ?? '-',
      status: requestStatus,
      departmentName:
        req?.departmentName ??
        prod?.department?.departmentName ??
        prod?.departmentName ??
        '-',
      productDescription: prod.productDescription ?? '-',
      stockStatus,
      receiptVoucherNo: prod.receiptVoucherNo ?? '-',
      supplierName: prod.supplierName ?? '-',
      balance: prod.balance ?? '-',
    };
  });
};

const AdminDashboard = () => {
  const [departments, setDepartments] = useState([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(false);
  const [departmentsError, setDepartmentsError] = useState('');
  const [showDepartments, setShowDepartments] = useState(false);

  const [showReportOptions, setShowReportOptions] = useState(false);
  const [downloadingType, setDownloadingType] = useState(null);
  const [reportError, setReportError] = useState('');
  const [reportKind, setReportKind] = useState('products');

  // Build deptMap: departmentId → departmentName
  const deptMap = useMemo(() => {
    const map = {};
    departments.forEach((d) => {
      const id = pickDeptId(d);
      const name = pickDeptName(d);
      if (id != null && name) {
        map[String(id)] = name;
      }
    });
    return map;
  }, [departments]);

  useEffect(() => {
    fetchDepartments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (showDepartments) fetchDepartments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showDepartments]);

  // ============ FETCH DEPARTMENTS ============
  const fetchDepartments = async () => {
    setDepartmentsLoading(true);
    setDepartmentsError('');
    try {
      const response = await fetch(DEPARTMENTS_ENDPOINT);
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `Server responded with ${response.status}`);
      }
      const text = await response.text();
      const data = text ? JSON.parse(text) : [];

      console.log('🏢 Raw departments response:', data);

      const list = normalizeArray(data);
      setDepartments(list);

      if (list.length === 0) {
        setDepartmentsError('No departments found in the database.');
      }
    } catch (error) {
      console.error('❌ Error fetching departments:', error);
      setDepartmentsError(
        error.message === 'Failed to fetch'
          ? 'Cannot reach the server. Make sure the backend is running.'
          : error.message || 'Failed to load departments.'
      );
      setDepartments([]);
    } finally {
      setDepartmentsLoading(false);
    }
  };

  // =====================================================
  // PRODUCTS — PDF (with ALL attributes)
  // =====================================================
  const generateProductsPdf = (products, requests = []) => {
    // Merge products with their requests so we get QtyReq / Staff Desc / Admin Note / Status
    const merged = mergeProductsWithRequests(products, requests);

    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const marginLeft = 25;
    const marginRight = 25;
    const tableWidth = pageWidth - marginLeft - marginRight;

    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42);
    doc.text('Product Report', marginLeft, 40);

    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, marginLeft, 56);

    // Summary cards
    const inStockCount = merged.filter((p) => p.stockStatus === 'In Stock').length;
    const outStockCount = merged.filter((p) => p.stockStatus === 'Out of Stock').length;

    const cardY = 70;
    const cardHeight = 34;
    const cardGap = 10;
    const cardWidth = (tableWidth - cardGap * 2) / 3;

    doc.setFillColor(220, 252, 231);
    doc.roundedRect(marginLeft, cardY, cardWidth, cardHeight, 4, 4, 'F');
    doc.setTextColor(22, 101, 52);
    doc.setFontSize(9);
    doc.text('In Stock', marginLeft + 10, cardY + 14);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(String(inStockCount), marginLeft + 10, cardY + 28);
    doc.setFont('helvetica', 'normal');

    doc.setFillColor(254, 226, 226);
    doc.roundedRect(marginLeft + cardWidth + cardGap, cardY, cardWidth, cardHeight, 4, 4, 'F');
    doc.setTextColor(185, 28, 28);
    doc.setFontSize(9);
    doc.text('Out of Stock', marginLeft + cardWidth + cardGap + 10, cardY + 14);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(String(outStockCount), marginLeft + cardWidth + cardGap + 10, cardY + 28);
    doc.setFont('helvetica', 'normal');

    doc.setFillColor(219, 234, 254);
    doc.roundedRect(marginLeft + (cardWidth + cardGap) * 2, cardY, cardWidth, cardHeight, 4, 4, 'F');
    doc.setTextColor(30, 64, 175);
    doc.setFontSize(9);
    doc.text('Total Rows', marginLeft + (cardWidth + cardGap) * 2 + 10, cardY + 14);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(String(merged.length), marginLeft + (cardWidth + cardGap) * 2 + 10, cardY + 28);
    doc.setFont('helvetica', 'normal');

    const startY = cardY + cardHeight + 20;

    autoTable(doc, {
      startY,
      tableWidth: tableWidth,
      theme: 'grid',
      head: [[
        'ID',
        'Name',
        'Description',
        'Quantity',
        'QtyReq',
        'Unit Price',
        'Supplier',
        'Supplier VoucherNo',
        'Balance',
        'Receipt Date',
        'Issue Date',
        'Staff Desc',
        'Admin Note',
        'Status',
        'Stock Status',
      ]],
      body: merged.map((p) => [
        { content: p.productId ?? '-', styles: { halign: 'center', fontStyle: 'bold' } },
        p.productName ?? '-',
        p.productDescription ?? '-',
        { content: p.productQuantity ?? '0', styles: { halign: 'center', fontStyle: 'bold' } },
        { content: p.requestQuantity ?? '-', styles: { halign: 'center' } },
        { content: p.price != null ? Number(p.price).toLocaleString() : '-', styles: { halign: 'right' } },
        p.supplierName ?? '-',
        p.receiptVoucherNo ?? '-',
        {
          content:
            p.balance != null && p.balance !== '-'
              ? Number(p.balance).toLocaleString()
              : '-',
          styles: { halign: 'right' },
        },
        { content: p.receiptDate ?? '-', styles: { halign: 'center' } },
        { content: p.issueDate ?? '-', styles: { halign: 'center' } },
        p.description ?? '-',
        p.adminNote ?? '-',
        p.status ?? '-',
        p.stockStatus ?? '-',
      ]),
      styles: {
        fontSize: 7,
        cellPadding: { top: 5, right: 4, bottom: 5, left: 4 },
        overflow: 'linebreak',
        valign: 'middle',
        lineColor: [226, 232, 240],
        lineWidth: 0.5,
        textColor: [30, 41, 59],
      },
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center',
        valign: 'middle',
        fontSize: 7,
      },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: {
        0:  { cellWidth: 30,  halign: 'center' },
        1:  { cellWidth: 60,  halign: 'left', fontStyle: 'bold' },
        2:  { cellWidth: 75,  halign: 'left' },
        3:  { cellWidth: 40,  halign: 'center' },
        4:  { cellWidth: 45,  halign: 'center' },
        5:  { cellWidth: 40,  halign: 'right' },
        6:  { cellWidth: 55,  halign: 'left' },
        7:  { cellWidth: 70,  halign: 'left' },
        8:  { cellWidth: 45,  halign: 'right' },
        9:  { cellWidth: 55,  halign: 'center' },
        10: { cellWidth: 55,  halign: 'center' },
        11: { cellWidth: 70,  halign: 'left' },
        12: { cellWidth: 70,  halign: 'left' },
        13: { cellWidth: 55,  halign: 'center' },
        14: { cellWidth: 50,  halign: 'center' },
      },
      margin: { left: marginLeft, right: marginRight },
      didParseCell: (data) => {
        if (data.section === 'body') {
          // Status column (index 13)
          if (data.column.index === 13) {
            const v = data.cell.raw;
            if (v === 'APPROVED') {
              data.cell.styles.textColor = [22, 101, 52];
              data.cell.styles.fillColor = [240, 253, 244];
              data.cell.styles.fontStyle = 'bold';
            } else if (v === 'REJECTED') {
              data.cell.styles.textColor = [185, 28, 28];
              data.cell.styles.fillColor = [254, 242, 242];
              data.cell.styles.fontStyle = 'bold';
            } else if (v === 'PENDING') {
              data.cell.styles.textColor = [146, 64, 14];
              data.cell.styles.fillColor = [255, 251, 235];
              data.cell.styles.fontStyle = 'bold';
            } else if (v === 'AVAILABLE') {
              data.cell.styles.textColor = [30, 64, 175];
              data.cell.styles.fillColor = [219, 234, 254];
              data.cell.styles.fontStyle = 'bold';
            }
          }
          // Stock Status column (index 14)
          if (data.column.index === 14) {
            const v = data.cell.raw;
            if (v === 'In Stock') {
              data.cell.styles.textColor = [22, 101, 52];
              data.cell.styles.fontStyle = 'bold';
            } else if (v === 'Out of Stock') {
              data.cell.styles.textColor = [185, 28, 28];
              data.cell.styles.fontStyle = 'bold';
            }
          }
          // Balance column (index 8)
          if (data.column.index === 8) {
            const v = data.cell.raw;
            if (v !== '-' && Number(String(v).replace(/,/g, '')) > 0) {
              data.cell.styles.textColor = [22, 101, 52];
              data.cell.styles.fontStyle = 'bold';
            } else if (v !== '-') {
              data.cell.styles.textColor = [185, 28, 28];
            }
          }
        }
      },
    });

    // Footer on every page
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(120);
      const pageHeight = doc.internal.pageSize.getHeight();
      doc.text('Product Report', marginLeft, pageHeight - 20);
      doc.text(`Page ${i} of ${pageCount}`, pageWidth - marginRight - 60, pageHeight - 20);
    }

    doc.save(`product-report-${Date.now()}.pdf`);
  };

  // =====================================================
  // PRODUCTS — EXCEL (with ALL attributes)
  // =====================================================
  const generateProductsExcel = (products, requests = []) => {
    const merged = mergeProductsWithRequests(products, requests);

    const data = merged.map((p) => ({
      ID: p.productId ?? '',
      Name: p.productName ?? '',
      Description: p.productDescription ?? '',
      Quantity: p.productQuantity ?? '',
      QtyReq: p.requestQuantity ?? '',
      'Unit Price': p.price ?? '',
      Supplier: p.supplierName ?? '',
      'Supplier VoucherNo': p.receiptVoucherNo ?? '',
      Balance: p.balance ?? '',
      'Receipt Date': p.receiptDate ?? '',
      'Issue Date': p.issueDate ?? '',
      'Staff Desc': p.description ?? '',
      'Admin Note': p.adminNote ?? '',
      Status: p.status ?? '',
      'Stock Status': p.stockStatus ?? '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    worksheet['!cols'] = [
      { wch: 8 },  { wch: 25 }, { wch: 35 }, { wch: 10 },
      { wch: 10 }, { wch: 12 }, { wch: 22 }, { wch: 20 },
      { wch: 12 }, { wch: 14 }, { wch: 14 }, { wch: 28 },
      { wch: 28 }, { wch: 12 }, { wch: 14 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');
    XLSX.writeFile(workbook, `product-report-${Date.now()}.xlsx`);
  };

  // =====================================================
  // USERS — PDF / EXCEL
  // =====================================================
  const generateUsersPdf = (users) => {
    console.log('=== USERS COUNT ===', users.length);
    console.log('=== deptMap ===', deptMap);

    const doc = new jsPDF({ orientation: 'landscape' });
    doc.setFontSize(16);
    doc.text('Users Report', 14, 18);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 24);

    const columns = [
      { header: 'ID', dataKey: 'id' },
      { header: 'Username', dataKey: 'username' },
      { header: 'Email', dataKey: 'email' },
      { header: 'Gender', dataKey: 'gender' },
      { header: 'Phone', dataKey: 'phone' },
      { header: 'Role', dataKey: 'role' },
      { header: 'Department', dataKey: 'department' },
    ];

    const rows = users.map((u) => {
      const resolved = resolveUserDepartment(u, deptMap);
      console.log(
        `User ${u.userId ?? u.id} (${pickUsername(u)}): department=${JSON.stringify(u.department)} → ${resolved || '(empty)'}`
      );
      return {
        id: u.userId ?? u.id ?? '',
        username: pickUsername(u),
        email: u.email ?? '',
        gender: u.gender ?? '',
        phone: pickPhone(u),
        role: pickRole(u),
        department: resolved || '-',
      };
    });

    autoTable(doc, {
      columns,
      body: rows,
      startY: 30,
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [249, 115, 22], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [255, 247, 237] },
      margin: { left: 10, right: 10 },
    });

    doc.save(`users-report-${Date.now()}.pdf`);
  };

  const generateUsersExcel = (users) => {
    console.log('=== EXCEL USERS COUNT ===', users.length);
    console.log('=== deptMap ===', deptMap);

    const data = users.map((u) => ({
      ID: u.userId ?? u.id ?? '',
      Username: pickUsername(u),
      Email: u.email ?? '',
      Gender: u.gender ?? '',
      Phone: pickPhone(u),
      Role: pickRole(u),
      Department: resolveUserDepartment(u, deptMap) || '-',
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    worksheet['!cols'] = [
      { wch: 8 }, { wch: 25 }, { wch: 30 }, { wch: 10 },
      { wch: 16 }, { wch: 16 }, { wch: 22 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');
    XLSX.writeFile(workbook, `users-report-${Date.now()}.xlsx`);
  };

  // ============ DOWNLOAD REPORT ============
  const handleDownloadReport = async (type) => {
    setDownloadingType(type);
    setReportError('');

    try {
      const isUsers = reportKind === 'users';
      const endpoint = isUsers ? USERS_ENDPOINT : PRODUCTS_ENDPOINT;
      const fileBase = isUsers ? 'users-report' : 'product-report';

      // Ensure departments are loaded BEFORE generating users report
      if (isUsers && departments.length === 0) {
        console.log('⚠️ Departments not loaded yet — fetching now...');
        await fetchDepartments();
      }

      // For products, fetch products + requests in parallel
      let productsData = null;
      let requestsData = [];

      if (!isUsers) {
        const [productRes, requestRes] = await Promise.all([
          fetch(PRODUCTS_ENDPOINT, { headers: { Accept: 'application/json' } }),
          fetch(PRODUCT_REQUESTS_ENDPOINT, { headers: { Accept: 'application/json' } }).catch(() => null),
        ]);

        if (!productRes.ok) {
          let errorMsg = `Server responded with ${productRes.status}`;
          try {
            const errText = await productRes.text();
            if (errText) errorMsg = errText;
          } catch (_) {}
          throw new Error(errorMsg);
        }

        productsData = await productRes.json();
        if (requestRes && requestRes.ok) {
          try {
            requestsData = await requestRes.json();
          } catch (_) {
            requestsData = [];
          }
        }

        if (!Array.isArray(productsData) || productsData.length === 0) {
          throw new Error('No data available to export.');
        }

        if (type === 'pdf') generateProductsPdf(productsData, requestsData);
        else generateProductsExcel(productsData, requestsData);

        setShowReportOptions(false);
        return;
      }

      // Users flow (unchanged)
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });

      if (!response.ok) {
        let errorMsg = `Server responded with ${response.status}`;
        try {
          const errText = await response.text();
          if (errText) errorMsg = errText;
        } catch (_) {}
        throw new Error(errorMsg);
      }

      const contentType = (response.headers.get('Content-Type') || '').toLowerCase();

      if (
        contentType.includes('application/pdf') ||
        contentType.includes('spreadsheetml') ||
        contentType.includes('application/vnd.ms-excel')
      ) {
        const blob = await response.blob();
        if (blob.size === 0) throw new Error('Received an empty file from the server.');

        const disposition = response.headers.get('Content-Disposition') || '';
        let filename = type === 'pdf' ? `${fileBase}.pdf` : `${fileBase}.xlsx`;
        const match = disposition.match(/filename\*?=["']?([^"';]+)["']?/);
        if (match && match[1]) filename = decodeURIComponent(match[1]);

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        setShowReportOptions(false);
        return;
      }

      const data = await response.json();
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('No data available to export.');
      }

      console.log('=== RAW API RESPONSE (first user) ===');
      console.log(JSON.stringify(data[0], null, 2));

      if (type === 'pdf') generateUsersPdf(data);
      else generateUsersExcel(data);

      setShowReportOptions(false);
    } catch (error) {
      console.error('Error downloading report:', error);
      setReportError(
        error.message === 'Failed to fetch'
          ? 'Cannot reach the server. Make sure the backend is running and the proxy is configured.'
          : error.message
      );
    } finally {
      setDownloadingType(null);
    }
  };

  // ============ CARDS ============
  const cards = [
    {
      title: 'Products',
      icon: '📦',
      description: 'Download a report of all registered products.',
      color: '#3b82f6',
      actions: [{ label: 'Download Product Report', type: 'report', kind: 'products' }],
    },
    {
      title: 'Users',
      icon: '👥',
      description: 'Download a report of all registered users in the system.',
      color: '#f97316',
      actions: [{ label: 'Download Users Report', type: 'report', kind: 'users' }],
    },
    {
      title: 'Departments',
      icon: '🏢',
      description: 'View all registered departments in the system.',
      color: '#10b981',
      actions: [{ label: 'List Registered Departments', type: 'departments' }],
    },
  ];

  const handleAction = (action) => {
    if (action.type === 'report') {
      setReportError('');
      setReportKind(action.kind || 'products');
      setShowReportOptions(true);
    } else if (action.type === 'departments') {
      setShowDepartments(true);
    } else if (action.path) {
      window.location.href = action.path;
    }
  };

  // ============ STYLES ============
  const modalOverlay = {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000,
  };

  const modalContent = {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '30px',
    maxWidth: '600px',
    width: '90%',
    maxHeight: '80vh',
    overflowY: 'auto',
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
  };

  const closeButton = {
    marginTop: '20px',
    padding: '10px 24px',
    border: 'none',
    borderRadius: '7px',
    backgroundColor: '#e2e8f0',
    color: '#1e293b',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  };

  const isUsersReport = reportKind === 'users';
  const reportTitle = isUsersReport ? 'Download Users Report' : 'Download Product Report';
  const reportAccent = isUsersReport ? '#f97316' : '#3b82f6';

  return (
    <div style={{ padding: '30px' }}>
      <p style={{ margin: '0 0 24px', color: '#64748b', fontSize: 15 }}>
        Welcome to the Inventory Management System
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
        }}
      >
        {cards.map((card) => (
          <div
            key={card.title}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              padding: '24px',
              border: '1px solid #e2e8f0',
              borderLeft: `5px solid ${card.color}`,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.12)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.06)';
            }}
          >
            <div
              style={{
                width: '55px', height: '55px', borderRadius: '10px',
                backgroundColor: `${card.color}15`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '30px', marginBottom: '18px',
              }}
            >
              {card.icon}
            </div>

            <h2 style={{ margin: '0 0 8px 0', color: '#1e293b', fontSize: '20px' }}>
              {card.title}
            </h2>

            <p style={{ margin: '0 0 20px 0', color: '#64748b', fontSize: '14px', lineHeight: '1.5' }}>
              {card.description}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {card.actions.map((action) => (
                <button
                  key={action.label}
                  onClick={() => handleAction(action)}
                  style={{
                    width: '100%', padding: '11px 15px', border: 'none',
                    borderRadius: '7px', backgroundColor: card.color,
                    color: '#ffffff', fontSize: '14px', fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  {action.label} →
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ============ REPORT OPTIONS MODAL ============ */}
      {showReportOptions && (
        <div style={modalOverlay} onClick={() => !downloadingType && setShowReportOptions(false)}>
          <div style={modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginTop: 0, color: '#1e293b' }}>📄 {reportTitle}</h2>
            <p style={{ color: '#64748b', marginBottom: '20px' }}>
              Choose the format you want to download:
            </p>

            {reportError && (
              <div style={{
                background: '#fef2f2', color: '#dc2626',
                border: '1px solid #fecaca', padding: '12px 15px',
                borderRadius: '8px', marginBottom: '18px',
                fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px',
              }}>
                ⚠️ {reportError}
              </div>
            )}

            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              <button
                onClick={() => handleDownloadReport('pdf')}
                disabled={downloadingType === 'pdf'}
                style={{
                  flex: 1, minWidth: '160px', padding: '20px 20px', border: 'none',
                  borderRadius: '10px',
                  background: downloadingType === 'pdf' ? '#f87171'
                    : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  color: '#fff', fontSize: '15px', fontWeight: '700',
                  cursor: downloadingType === 'pdf' ? 'wait' : 'pointer',
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
                }}
              >
                <span style={{ fontSize: '32px' }}>{downloadingType === 'pdf' ? '⏳' : '📄'}</span>
                {downloadingType === 'pdf' ? 'Downloading...' : 'Download PDF'}
              </button>

              <button
                onClick={() => handleDownloadReport('excel')}
                disabled={downloadingType === 'excel'}
                style={{
                  flex: 1, minWidth: '160px', padding: '20px 20px', border: 'none',
                  borderRadius: '10px',
                  background: downloadingType === 'excel' ? '#4ade80'
                    : 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                  color: '#fff', fontSize: '15px', fontWeight: '700',
                  cursor: downloadingType === 'excel' ? 'wait' : 'pointer',
                  boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
                }}
              >
                <span style={{ fontSize: '32px' }}>{downloadingType === 'excel' ? '⏳' : '📊'}</span>
                {downloadingType === 'excel' ? 'Downloading...' : 'Download Excel'}
              </button>
            </div>

            <div style={{ textAlign: 'right' }}>
              <button
                style={{ ...closeButton, borderTop: `3px solid ${reportAccent}` }}
                onClick={() => setShowReportOptions(false)}
                disabled={!!downloadingType}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============ DEPARTMENTS MODAL ============ */}
      {showDepartments && (
        <div style={modalOverlay} onClick={() => setShowDepartments(false)}>
          <div style={modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginTop: 0, color: '#1e293b' }}>🏢 Registered Departments</h2>

            {departmentsLoading ? (
              <p style={{ color: '#64748b' }}>Loading departments...</p>
            ) : departmentsError ? (
              <div style={{
                background: '#fef2f2', color: '#dc2626',
                border: '1px solid #fecaca', padding: '12px 15px',
                borderRadius: '8px', marginBottom: '10px', fontSize: '13px',
              }}>
                ⚠️ {departmentsError}
              </div>
            ) : departments.length === 0 ? (
              <p style={{ color: '#64748b' }}>No departments found.</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f1f5f9' }}>
                    <th style={thStyle}>#</th>
                    <th style={thStyle}>ID</th>
                    <th style={thStyle}>Department Name</th>
                  </tr>
                </thead>
                <tbody>
                  {departments.map((dept, index) => (
                    <tr key={pickDeptId(dept) ?? `dept-${index}`} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={tdStyle}>{index + 1}</td>
                      <td style={tdStyle}>{pickDeptId(dept) ?? '-'}</td>
                      <td style={{ ...tdStyle, fontWeight: 600, color: '#1e293b' }}>
                        {pickDeptName(dept) ?? '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <div style={{ textAlign: 'right' }}>
              <button style={closeButton} onClick={() => setShowDepartments(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const thStyle = {
  padding: '12px 16px', textAlign: 'left',
  fontSize: '14px', color: '#334155', fontWeight: '600',
};

const tdStyle = {
  padding: '12px 16px', fontSize: '14px', color: '#475569',
};

export default AdminDashboard;