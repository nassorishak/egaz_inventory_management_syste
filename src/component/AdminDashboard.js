
// // // export default AdminDashboard;
// // import React, { useState, useEffect } from 'react';
// // import jsPDF from 'jspdf';
// // import autoTable from 'jspdf-autotable';
// // import * as XLSX from 'xlsx';

// // // Use relative URLs so the dev-server proxy forwards them (no CORS)
// // const API_BASE = '/api';

// // // ⚠️ Adjust these to match your DepartmentApi.java
// // const PRODUCTS_ENDPOINT = `${API_BASE}/products/all`;
// // const DEPARTMENTS_ENDPOINT = `${API_BASE}/departments/all`; // <-- verify this

// // const AdminDashboard = () => {
// //   const [departments, setDepartments] = useState([]);
// //   const [showDepartments, setShowDepartments] = useState(false);
// //   const [loading, setLoading] = useState(false);
// //   const [showReportOptions, setShowReportOptions] = useState(false);
// //   const [downloadingType, setDownloadingType] = useState(null);
// //   const [reportError, setReportError] = useState('');

// //   // Fetch departments when the modal is opened
// //   useEffect(() => {
// //     if (showDepartments) {
// //       fetchDepartments();
// //     }
// //   }, [showDepartments]);

// //   const fetchDepartments = async () => {
// //     setLoading(true);
// //     try {
// //       const response = await fetch(DEPARTMENTS_ENDPOINT);
// //       if (!response.ok) throw new Error('Failed to fetch departments');
// //       const data = await response.json();
// //       setDepartments(data);
// //     } catch (error) {
// //       console.error('Error fetching departments:', error);
// //       alert('Failed to load departments. Please try again.');
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   // ============ PDF GENERATOR ============
// //   const generatePdf = (products) => {
// //     const doc = new jsPDF({ orientation: 'landscape' });

// //     doc.setFontSize(16);
// //     doc.text('Product Report', 14, 18);

// //     doc.setFontSize(10);
// //     doc.setTextColor(100);
// //     doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 24);

// //     // Columns match your Product entity fields
// //     const columns = [
// //       { header: 'ID', dataKey: 'id' },
// //       { header: 'Name', dataKey: 'name' },
// //       { header: 'Description', dataKey: 'description' },
// //       { header: 'Quantity', dataKey: 'quantity' },
// //       { header: 'Unit Price', dataKey: 'unitPrice' },
// //       { header: 'Supplier', dataKey: 'supplier' },
// //       { header: 'Receipt Date', dataKey: 'receiptDate' },
// //       { header: 'Issue Date', dataKey: 'issueDate' },
// //       { header: 'Added By', dataKey: 'addedBy' },
// //     ];

// //     const rows = products.map((p) => ({
// //       id: p.productId ?? '',
// //       name: p.productName ?? '',
// //       description: p.productDescription ?? '',
// //       quantity: p.productQuantity ?? '',
// //       unitPrice: p.price ?? '',
// //       supplier: p.supplierName ?? '',
// //       receiptDate: p.receiptDate ?? '',
// //       issueDate: p.issueDate ?? '',
// //       addedBy:
// //         p.user?.fullName ??
// //         p.user?.username ??
// //         p.user?.name ??
// //         '',
// //     }));

// //     autoTable(doc, {
// //       columns,
// //       body: rows,
// //       startY: 30,
// //       styles: { fontSize: 8, cellPadding: 2 },
// //       headStyles: {
// //         fillColor: [59, 130, 246],
// //         textColor: 255,
// //         fontStyle: 'bold',
// //       },
// //       alternateRowStyles: { fillColor: [248, 250, 252] },
// //       margin: { left: 10, right: 10 },
// //     });

// //     doc.save(`product-report-${Date.now()}.pdf`);
// //   };

// //   // ============ EXCEL GENERATOR ============
// //   const generateExcel = (products) => {
// //     const data = products.map((p) => ({
// //       ID: p.productId ?? '',
// //       Name: p.productName ?? '',
// //       Description: p.productDescription ?? '',
// //       Quantity: p.productQuantity ?? '',
// //       'Unit Price': p.price ?? '',
// //       Supplier: p.supplierName ?? '',
// //       'Receipt Date': p.receiptDate ?? '',
// //       'Issue Date': p.issueDate ?? '',
// //       'Added By':
// //         p.user?.fullName ??
// //         p.user?.username ??
// //         p.user?.name ??
// //         '',
// //     }));

// //     const worksheet = XLSX.utils.json_to_sheet(data);

// //     worksheet['!cols'] = [
// //       { wch: 8 },   // ID
// //       { wch: 25 },  // Name
// //       { wch: 35 },  // Description
// //       { wch: 10 },  // Quantity
// //       { wch: 12 },  // Unit Price
// //       { wch: 22 },  // Supplier
// //       { wch: 14 },  // Receipt Date
// //       { wch: 14 },  // Issue Date
// //       { wch: 20 },  // Added By
// //     ];

// //     const workbook = XLSX.utils.book_new();
// //     XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');

// //     XLSX.writeFile(workbook, `product-report-${Date.now()}.xlsx`);
// //   };

// //   // ============ DOWNLOAD REPORT (PDF / EXCEL) ============
// //   const handleDownloadReport = async (type) => {
// //     setDownloadingType(type);
// //     setReportError('');

// //     try {
// //       const response = await fetch(PRODUCTS_ENDPOINT, {
// //         method: 'GET',
// //         headers: { Accept: 'application/json' },
// //       });

// //       if (!response.ok) {
// //         let errorMsg = `Server responded with ${response.status}`;
// //         try {
// //           const errText = await response.text();
// //           if (errText) errorMsg = errText;
// //         } catch (_) {
// //           /* ignore */
// //         }
// //         throw new Error(errorMsg);
// //       }

// //       // If backend returns a file directly, save it as-is
// //       const contentType = (response.headers.get('Content-Type') || '').toLowerCase();

// //       if (
// //         contentType.includes('application/pdf') ||
// //         contentType.includes('spreadsheetml') ||
// //         contentType.includes('application/vnd.ms-excel')
// //       ) {
// //         const blob = await response.blob();
// //         if (blob.size === 0) {
// //           throw new Error('Received an empty file from the server.');
// //         }

// //         const disposition = response.headers.get('Content-Disposition') || '';
// //         let filename = type === 'pdf' ? 'product-report.pdf' : 'product-report.xlsx';
// //         const match = disposition.match(/filename\*?=["']?([^"';]+)["']?/);
// //         if (match && match[1]) filename = decodeURIComponent(match[1]);

// //         const url = window.URL.createObjectURL(blob);
// //         const link = document.createElement('a');
// //         link.href = url;
// //         link.download = filename;
// //         document.body.appendChild(link);
// //         link.click();
// //         document.body.removeChild(link);
// //         window.URL.revokeObjectURL(url);

// //         setShowReportOptions(false);
// //         return;
// //       }

// //       // Otherwise expect JSON and build the file client-side
// //       const products = await response.json();

// //       if (!Array.isArray(products) || products.length === 0) {
// //         throw new Error('No product data available to export.');
// //       }

// //       if (type === 'pdf') {
// //         generatePdf(products);
// //       } else {
// //         generateExcel(products);
// //       }

// //       setShowReportOptions(false);
// //     } catch (error) {
// //       console.error('Error downloading report:', error);
// //       setReportError(
// //         error.message === 'Failed to fetch'
// //           ? 'Cannot reach the server. Make sure the backend is running and the proxy is configured.'
// //           : error.message
// //       );
// //     } finally {
// //       setDownloadingType(null);
// //     }
// //   };

// //   const cards = [
// //     {
// //       title: 'Products',
// //       icon: '📦',
// //       description: 'Download a report of all registered products.',
// //       color: '#3b82f6',
// //       actions: [{ label: 'Download Product Report', type: 'report' }],
// //     },
// //     {
// //       title: 'Requested Products',
// //       icon: '📝',
// //       description: 'View products requested by departments and staff.',
// //       color: '#f97316',
// //       actions: [{ label: 'View Requests', path: '/manage-request' }],
// //     },
// //     {
// //       title: 'Departments',
// //       icon: '🏢',
// //       description: 'View all registered departments in the system.',
// //       color: '#10b981',
// //       actions: [{ label: 'List Registered Departments', type: 'departments' }],
// //     },
// //   ];

// //   const handleAction = (action) => {
// //     if (action.type === 'report') {
// //       setReportError('');
// //       setShowReportOptions(true);
// //     } else if (action.type === 'departments') {
// //       setShowDepartments(true);
// //     } else if (action.path) {
// //       window.location.href = action.path;
// //     }
// //   };

// //   // ============ STYLES ============
// //   const modalOverlay = {
// //     position: 'fixed',
// //     top: 0,
// //     left: 0,
// //     right: 0,
// //     bottom: 0,
// //     backgroundColor: 'rgba(0,0,0,0.5)',
// //     display: 'flex',
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //     zIndex: 1000,
// //   };

// //   const modalContent = {
// //     backgroundColor: '#fff',
// //     borderRadius: '12px',
// //     padding: '30px',
// //     maxWidth: '600px',
// //     width: '90%',
// //     maxHeight: '80vh',
// //     overflowY: 'auto',
// //     boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
// //   };

// //   const closeButton = {
// //     marginTop: '20px',
// //     padding: '10px 24px',
// //     border: 'none',
// //     borderRadius: '7px',
// //     backgroundColor: '#e2e8f0',
// //     color: '#1e293b',
// //     fontSize: '14px',
// //     fontWeight: '600',
// //     cursor: 'pointer',
// //   };

// //   return (
// //     <div style={{ padding: '30px' }}>
// //       <p style={{ margin: '0 0 24px', color: '#64748b', fontSize: 15 }}>
// //         Welcome to the Inventory Management System
// //       </p>

// //       {/* Dashboard Cards */}
// //       <div
// //         style={{
// //           display: 'grid',
// //           gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
// //           gap: '20px',
// //         }}
// //       >
// //         {cards.map((card) => (
// //           <div
// //             key={card.title}
// //             style={{
// //               backgroundColor: '#ffffff',
// //               borderRadius: '12px',
// //               padding: '24px',
// //               border: '1px solid #e2e8f0',
// //               borderLeft: `5px solid ${card.color}`,
// //               boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
// //               transition: 'all 0.3s ease',
// //             }}
// //             onMouseEnter={(e) => {
// //               e.currentTarget.style.transform = 'translateY(-5px)';
// //               e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.12)';
// //             }}
// //             onMouseLeave={(e) => {
// //               e.currentTarget.style.transform = 'translateY(0)';
// //               e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.06)';
// //             }}
// //           >
// //             <div
// //               style={{
// //                 width: '55px',
// //                 height: '55px',
// //                 borderRadius: '10px',
// //                 backgroundColor: `${card.color}15`,
// //                 display: 'flex',
// //                 alignItems: 'center',
// //                 justifyContent: 'center',
// //                 fontSize: '30px',
// //                 marginBottom: '18px',
// //               }}
// //             >
// //               {card.icon}
// //             </div>

// //             <h2 style={{ margin: '0 0 8px 0', color: '#1e293b', fontSize: '20px' }}>
// //               {card.title}
// //             </h2>

// //             <p style={{ margin: '0 0 20px 0', color: '#64748b', fontSize: '14px', lineHeight: '1.5' }}>
// //               {card.description}
// //             </p>

// //             <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
// //               {card.actions.map((action) => (
// //                 <button
// //                   key={action.label}
// //                   onClick={() => handleAction(action)}
// //                   style={{
// //                     width: '100%',
// //                     padding: '11px 15px',
// //                     border: 'none',
// //                     borderRadius: '7px',
// //                     backgroundColor: card.color,
// //                     color: '#ffffff',
// //                     fontSize: '14px',
// //                     fontWeight: '600',
// //                     cursor: 'pointer',
// //                   }}
// //                 >
// //                   {action.label} →
// //                 </button>
// //               ))}
// //             </div>
// //           </div>
// //         ))}
// //       </div>

// //       {/* ============ REPORT OPTIONS MODAL ============ */}
// //       {showReportOptions && (
// //         <div style={modalOverlay} onClick={() => !downloadingType && setShowReportOptions(false)}>
// //           <div style={modalContent} onClick={(e) => e.stopPropagation()}>
// //             <h2 style={{ marginTop: 0, color: '#1e293b' }}>
// //               📄 Download Product Report
// //             </h2>
// //             <p style={{ color: '#64748b', marginBottom: '20px' }}>
// //               Choose the format you want to download:
// //             </p>

// //             {reportError && (
// //               <div
// //                 style={{
// //                   background: '#fef2f2',
// //                   color: '#dc2626',
// //                   border: '1px solid #fecaca',
// //                   padding: '12px 15px',
// //                   borderRadius: '8px',
// //                   marginBottom: '18px',
// //                   fontSize: '13px',
// //                   display: 'flex',
// //                   alignItems: 'center',
// //                   gap: '8px',
// //                 }}
// //               >
// //                 ⚠️ {reportError}
// //               </div>
// //             )}

// //             <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
// //               {/* PDF BUTTON */}
// //               <button
// //                 onClick={() => handleDownloadReport('pdf')}
// //                 disabled={downloadingType === 'pdf'}
// //                 style={{
// //                   flex: 1,
// //                   minWidth: '160px',
// //                   padding: '20px 20px',
// //                   border: 'none',
// //                   borderRadius: '10px',
// //                   background:
// //                     downloadingType === 'pdf'
// //                       ? '#f87171'
// //                       : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
// //                   color: '#fff',
// //                   fontSize: '15px',
// //                   fontWeight: '700',
// //                   cursor: downloadingType === 'pdf' ? 'wait' : 'pointer',
// //                   boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
// //                   transition: 'all 0.2s ease',
// //                   display: 'flex',
// //                   flexDirection: 'column',
// //                   alignItems: 'center',
// //                   gap: '10px',
// //                 }}
// //               >
// //                 <span style={{ fontSize: '32px' }}>
// //                   {downloadingType === 'pdf' ? '⏳' : '📄'}
// //                 </span>
// //                 {downloadingType === 'pdf' ? 'Downloading...' : 'Download PDF'}
// //               </button>

// //               {/* EXCEL BUTTON */}
// //               <button
// //                 onClick={() => handleDownloadReport('excel')}
// //                 disabled={downloadingType === 'excel'}
// //                 style={{
// //                   flex: 1,
// //                   minWidth: '160px',
// //                   padding: '20px 20px',
// //                   border: 'none',
// //                   borderRadius: '10px',
// //                   background:
// //                     downloadingType === 'excel'
// //                       ? '#4ade80'
// //                       : 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
// //                   color: '#fff',
// //                   fontSize: '15px',
// //                   fontWeight: '700',
// //                   cursor: downloadingType === 'excel' ? 'wait' : 'pointer',
// //                   boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)',
// //                   transition: 'all 0.2s ease',
// //                   display: 'flex',
// //                   flexDirection: 'column',
// //                   alignItems: 'center',
// //                   gap: '10px',
// //                 }}
// //               >
// //                 <span style={{ fontSize: '32px' }}>
// //                   {downloadingType === 'excel' ? '⏳' : '📊'}
// //                 </span>
// //                 {downloadingType === 'excel' ? 'Downloading...' : 'Download Excel'}
// //               </button>
// //             </div>

// //             <div style={{ textAlign: 'right' }}>
// //               <button
// //                 style={closeButton}
// //                 onClick={() => setShowReportOptions(false)}
// //                 disabled={!!downloadingType}
// //               >
// //                 Cancel
// //               </button>
// //             </div>
// //           </div>
// //         </div>
// //       )}

// //       {/* ============ DEPARTMENTS MODAL ============ */}
// //       {showDepartments && (
// //         <div style={modalOverlay} onClick={() => setShowDepartments(false)}>
// //           <div style={modalContent} onClick={(e) => e.stopPropagation()}>
// //             <h2 style={{ marginTop: 0, color: '#1e293b' }}>Registered Departments</h2>
// //             {loading ? (
// //               <p style={{ color: '#64748b' }}>Loading departments...</p>
// //             ) : departments.length === 0 ? (
// //               <p style={{ color: '#64748b' }}>No departments found.</p>
// //             ) : (
// //               <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
// //                 <thead>
// //                   <tr style={{ backgroundColor: '#f1f5f9' }}>
// //                     <th style={thStyle}>Department Name</th>
// //                   </tr>
// //                 </thead>
// //                 <tbody>
// //                   {departments.map((dept) => (
// //                     <tr key={dept.id ?? dept.departmentId} style={{ borderBottom: '1px solid #e2e8f0' }}>
// //                       <td style={tdStyle}>
// //                         {dept.name || dept.departmentName || dept.deptName || ''}
// //                       </td>
// //                     </tr>
// //                   ))}
// //                 </tbody>
// //               </table>
// //             )}
// //             <div style={{ textAlign: 'right' }}>
// //               <button style={closeButton} onClick={() => setShowDepartments(false)}>
// //                 Close
// //               </button>
// //             </div>
// //           </div>
// //         </div>
// //       )}
// //     </div>
// //   );
// // };

// // // Inline table styles
// // const thStyle = {
// //   padding: '12px 16px',
// //   textAlign: 'left',
// //   fontSize: '14px',
// //   color: '#334155',
// //   fontWeight: '600',
// // };

// // const tdStyle = {
// //   padding: '12px 16px',
// //   fontSize: '14px',
// //   color: '#475569',
// // };

// // export default AdminDashboard;

// import React, { useState, useEffect } from 'react';
// import jsPDF from 'jspdf';
// import autoTable from 'jspdf-autotable';
// import * as XLSX from 'xlsx';

// // Use relative URLs so the dev-server proxy forwards them (no CORS)
// const API_BASE = '/api';

// // Endpoints — match your Spring Boot controllers
// const PRODUCTS_ENDPOINT = `${API_BASE}/products/all`;
// const DEPARTMENTS_ENDPOINT = `${API_BASE}/departments/all`; // ⚠️ verify against your DepartmentApi.java

// const AdminDashboard = () => {
//   const [departments, setDepartments] = useState([]);
//   const [showDepartments, setShowDepartments] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [showReportOptions, setShowReportOptions] = useState(false);
//   const [downloadingType, setDownloadingType] = useState(null);
//   const [reportError, setReportError] = useState('');

//   // Fetch departments when the modal is opened
//   useEffect(() => {
//     if (showDepartments) {
//       fetchDepartments();
//     }
//   }, [showDepartments]);

//   // ============ FETCH DEPARTMENTS ============
//   const fetchDepartments = async () => {
//     setLoading(true);
//     try {
//       const response = await fetch(DEPARTMENTS_ENDPOINT);
//       if (!response.ok) throw new Error('Failed to fetch departments');
//       const data = await response.json();
//       setDepartments(data);
//     } catch (error) {
//       console.error('Error fetching departments:', error);
//       alert('Failed to load departments. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ============ PDF GENERATOR ============
//   const generatePdf = (products) => {
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
//       headStyles: {
//         fillColor: [59, 130, 246],
//         textColor: 255,
//         fontStyle: 'bold',
//       },
//       alternateRowStyles: { fillColor: [248, 250, 252] },
//       margin: { left: 10, right: 10 },
//     });

//     doc.save(`product-report-${Date.now()}.pdf`);
//   };

//   // ============ EXCEL GENERATOR ============
//   const generateExcel = (products) => {
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
//       { wch: 8 },   // ID
//       { wch: 25 },  // Name
//       { wch: 35 },  // Description
//       { wch: 10 },  // Quantity
//       { wch: 12 },  // Unit Price
//       { wch: 22 },  // Supplier
//       { wch: 14 },  // Receipt Date
//       { wch: 14 },  // Issue Date
//     ];

//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');

//     XLSX.writeFile(workbook, `product-report-${Date.now()}.xlsx`);
//   };

//   // ============ DOWNLOAD REPORT (PDF / EXCEL) ============
//   const handleDownloadReport = async (type) => {
//     setDownloadingType(type);
//     setReportError('');

//     try {
//       const response = await fetch(PRODUCTS_ENDPOINT, {
//         method: 'GET',
//         headers: { Accept: 'application/json' },
//       });

//       if (!response.ok) {
//         let errorMsg = `Server responded with ${response.status}`;
//         try {
//           const errText = await response.text();
//           if (errText) errorMsg = errText;
//         } catch (_) {
//           /* ignore */
//         }
//         throw new Error(errorMsg);
//       }

//       // If the backend returns a file directly, save it as-is
//       const contentType = (response.headers.get('Content-Type') || '').toLowerCase();

//       if (
//         contentType.includes('application/pdf') ||
//         contentType.includes('spreadsheetml') ||
//         contentType.includes('application/vnd.ms-excel')
//       ) {
//         const blob = await response.blob();
//         if (blob.size === 0) {
//           throw new Error('Received an empty file from the server.');
//         }

//         const disposition = response.headers.get('Content-Disposition') || '';
//         let filename = type === 'pdf' ? 'product-report.pdf' : 'product-report.xlsx';
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

//       // Otherwise expect JSON and build the file client-side
//       const products = await response.json();

//       if (!Array.isArray(products) || products.length === 0) {
//         throw new Error('No product data available to export.');
//       }

//       if (type === 'pdf') {
//         generatePdf(products);
//       } else {
//         generateExcel(products);
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

//   // ============ CARDS CONFIG ============
//   const cards = [
//     {
//       title: 'Products',
//       icon: '📦',
//       description: 'Download a report of all registered products.',
//       color: '#3b82f6',
//       actions: [{ label: 'Download Product Report', type: 'report' }],
//     },
//     {
//       title: 'Requested Products',
//       icon: '📝',
//       description: 'View products requested by departments and staff.',
//       color: '#f97316',
//       actions: [{ label: 'View Requests', path: '/manage-request' }],
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
//       setShowReportOptions(true);
//     } else if (action.type === 'departments') {
//       setShowDepartments(true);
//     } else if (action.path) {
//       window.location.href = action.path;
//     }
//   };

//   // ============ STYLES ============
//   const modalOverlay = {
//     position: 'fixed',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'center',
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

//   return (
//     <div style={{ padding: '30px' }}>
//       <p style={{ margin: '0 0 24px', color: '#64748b', fontSize: 15 }}>
//         Welcome to the Inventory Management System
//       </p>

//       {/* Dashboard Cards */}
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
//                 width: '55px',
//                 height: '55px',
//                 borderRadius: '10px',
//                 backgroundColor: `${card.color}15`,
//                 display: 'flex',
//                 alignItems: 'center',
//                 justifyContent: 'center',
//                 fontSize: '30px',
//                 marginBottom: '18px',
//               }}
//             >
//               {card.icon}
//             </div>

//             <h2 style={{ margin: '0 0 8px 0', color: '#1e293b', fontSize: '20px' }}>
//               {card.title}
//             </h2>

//             <p
//               style={{
//                 margin: '0 0 20px 0',
//                 color: '#64748b',
//                 fontSize: '14px',
//                 lineHeight: '1.5',
//               }}
//             >
//               {card.description}
//             </p>

//             <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
//               {card.actions.map((action) => (
//                 <button
//                   key={action.label}
//                   onClick={() => handleAction(action)}
//                   style={{
//                     width: '100%',
//                     padding: '11px 15px',
//                     border: 'none',
//                     borderRadius: '7px',
//                     backgroundColor: card.color,
//                     color: '#ffffff',
//                     fontSize: '14px',
//                     fontWeight: '600',
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
//         <div
//           style={modalOverlay}
//           onClick={() => !downloadingType && setShowReportOptions(false)}
//         >
//           <div style={modalContent} onClick={(e) => e.stopPropagation()}>
//             <h2 style={{ marginTop: 0, color: '#1e293b' }}>
//               📄 Download Product Report
//             </h2>
//             <p style={{ color: '#64748b', marginBottom: '20px' }}>
//               Choose the format you want to download:
//             </p>

//             {reportError && (
//               <div
//                 style={{
//                   background: '#fef2f2',
//                   color: '#dc2626',
//                   border: '1px solid #fecaca',
//                   padding: '12px 15px',
//                   borderRadius: '8px',
//                   marginBottom: '18px',
//                   fontSize: '13px',
//                   display: 'flex',
//                   alignItems: 'center',
//                   gap: '8px',
//                 }}
//               >
//                 ⚠️ {reportError}
//               </div>
//             )}

//             <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
//               {/* PDF BUTTON */}
//               <button
//                 onClick={() => handleDownloadReport('pdf')}
//                 disabled={downloadingType === 'pdf'}
//                 style={{
//                   flex: 1,
//                   minWidth: '160px',
//                   padding: '20px 20px',
//                   border: 'none',
//                   borderRadius: '10px',
//                   background:
//                     downloadingType === 'pdf'
//                       ? '#f87171'
//                       : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
//                   color: '#fff',
//                   fontSize: '15px',
//                   fontWeight: '700',
//                   cursor: downloadingType === 'pdf' ? 'wait' : 'pointer',
//                   boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
//                   transition: 'all 0.2s ease',
//                   display: 'flex',
//                   flexDirection: 'column',
//                   alignItems: 'center',
//                   gap: '10px',
//                 }}
//               >
//                 <span style={{ fontSize: '32px' }}>
//                   {downloadingType === 'pdf' ? '⏳' : '📄'}
//                 </span>
//                 {downloadingType === 'pdf' ? 'Downloading...' : 'Download PDF'}
//               </button>

//               {/* EXCEL BUTTON */}
//               <button
//                 onClick={() => handleDownloadReport('excel')}
//                 disabled={downloadingType === 'excel'}
//                 style={{
//                   flex: 1,
//                   minWidth: '160px',
//                   padding: '20px 20px',
//                   border: 'none',
//                   borderRadius: '10px',
//                   background:
//                     downloadingType === 'excel'
//                       ? '#4ade80'
//                       : 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
//                   color: '#fff',
//                   fontSize: '15px',
//                   fontWeight: '700',
//                   cursor: downloadingType === 'excel' ? 'wait' : 'pointer',
//                   boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)',
//                   transition: 'all 0.2s ease',
//                   display: 'flex',
//                   flexDirection: 'column',
//                   alignItems: 'center',
//                   gap: '10px',
//                 }}
//               >
//                 <span style={{ fontSize: '32px' }}>
//                   {downloadingType === 'excel' ? '⏳' : '📊'}
//                 </span>
//                 {downloadingType === 'excel' ? 'Downloading...' : 'Download Excel'}
//               </button>
//             </div>

//             <div style={{ textAlign: 'right' }}>
//               <button
//                 style={closeButton}
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
//             <h2 style={{ marginTop: 0, color: '#1e293b' }}>Registered Departments</h2>
//             {loading ? (
//               <p style={{ color: '#64748b' }}>Loading departments...</p>
//             ) : departments.length === 0 ? (
//               <p style={{ color: '#64748b' }}>No departments found.</p>
//             ) : (
//               <table
//                 style={{
//                   width: '100%',
//                   borderCollapse: 'collapse',
//                   marginTop: '10px',
//                 }}
//               >
//                 <thead>
//                   <tr style={{ backgroundColor: '#f1f5f9' }}>
//                     <th style={thStyle}>Department Name</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {departments.map((dept) => (
//                     <tr
//                       key={dept.id ?? dept.departmentId}
//                       style={{ borderBottom: '1px solid #e2e8f0' }}
//                     >
//                       <td style={tdStyle}>
//                         {dept.name || dept.departmentName || dept.deptName || ''}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             )}
//             <div style={{ textAlign: 'right' }}>
//               <button
//                 style={closeButton}
//                 onClick={() => setShowDepartments(false)}
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// // Inline table styles
// const thStyle = {
//   padding: '12px 16px',
//   textAlign: 'left',
//   fontSize: '14px',
//   color: '#334155',
//   fontWeight: '600',
// };

// const tdStyle = {
//   padding: '12px 16px',
//   fontSize: '14px',
//   color: '#475569',
// };

// export default AdminDashboard;

// import React, { useState, useEffect } from 'react';
// import jsPDF from 'jspdf';
// import autoTable from 'jspdf-autotable';
// import * as XLSX from 'xlsx';

// // Use relative URLs so the dev-server proxy forwards them (no CORS)
// const API_BASE = '/api';

// // Endpoints — match your Spring Boot controllers
// const PRODUCTS_ENDPOINT = `${API_BASE}/products/all`;   // ProductApi.java → @GetMapping("/all")
// const DEPARTMENTS_ENDPOINT = `${API_BASE}/departments/all`; // ⚠️ verify against your DepartmentApi.java
// const USERS_ENDPOINT = `${API_BASE}/users`;             // ✅ UserApi.java → @GetMapping (root)

// const AdminDashboard = () => {
//   const [departments, setDepartments] = useState([]);
//   const [showDepartments, setShowDepartments] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [showReportOptions, setShowReportOptions] = useState(false);
//   const [downloadingType, setDownloadingType] = useState(null);
//   const [reportError, setReportError] = useState('');

//   // Which report is being generated: 'products' or 'users'
//   const [reportKind, setReportKind] = useState('products');

//   // Fetch departments when the modal is opened
//   useEffect(() => {
//     if (showDepartments) {
//       fetchDepartments();
//     }
//   }, [showDepartments]);

//   // ============ FETCH DEPARTMENTS ============
//   const fetchDepartments = async () => {
//     setLoading(true);
//     try {
//       const response = await fetch(DEPARTMENTS_ENDPOINT);
//       if (!response.ok) throw new Error('Failed to fetch departments');
//       const data = await response.json();
//       setDepartments(data);
//     } catch (error) {
//       console.error('Error fetching departments:', error);
//       alert('Failed to load departments. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // =====================================================
//   // ============ PRODUCTS — PDF / EXCEL =================
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
//       headStyles: {
//         fillColor: [59, 130, 246],
//         textColor: 255,
//         fontStyle: 'bold',
//       },
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
//       { wch: 8 },
//       { wch: 25 },
//       { wch: 35 },
//       { wch: 10 },
//       { wch: 12 },
//       { wch: 22 },
//       { wch: 14 },
//       { wch: 14 },
//     ];

//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');
//     XLSX.writeFile(workbook, `product-report-${Date.now()}.xlsx`);
//   };

//   // =====================================================
//   // ============ USERS — PDF / EXCEL ====================
//   // =====================================================
//   const generateUsersPdf = (users) => {
//     const doc = new jsPDF({ orientation: 'landscape' });

//     doc.setFontSize(16);
//     doc.text('Users Report', 14, 18);

//     doc.setFontSize(10);
//     doc.setTextColor(100);
//     doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 24);

//     const columns = [
//       { header: 'ID', dataKey: 'id' },
//       { header: 'Full Name', dataKey: 'fullName' },
//       { header: 'Email', dataKey: 'email' },
//       { header: 'Phone', dataKey: 'phone' },
//       { header: 'Role', dataKey: 'role' },
//       { header: 'Department', dataKey: 'department' },
//     ];

//     const rows = users.map((u) => ({
//       id: u.userId ?? u.id ?? '',
//       fullName: u.fullName ?? u.name ?? '',
//       email: u.email ?? '',
//       phone: u.phone ?? u.phoneNumber ?? '',
//       role: u.role?.roleName ?? u.role?.name ?? u.role ?? '',
//       department:
//         u.department?.departmentName ??
//         u.department?.name ??
//         u.department ??
//         '',
//     }));

//     autoTable(doc, {
//       columns,
//       body: rows,
//       startY: 30,
//       styles: { fontSize: 9, cellPadding: 3 },
//       headStyles: {
//         fillColor: [249, 115, 22],
//         textColor: 255,
//         fontStyle: 'bold',
//       },
//       alternateRowStyles: { fillColor: [255, 247, 237] },
//       margin: { left: 10, right: 10 },
//     });

//     doc.save(`users-report-${Date.now()}.pdf`);
//   };

//   const generateUsersExcel = (users) => {
//     const data = users.map((u) => ({
//       ID: u.userId ?? u.id ?? '',
//       'Full Name': u.fullName ?? u.name ?? '',
//       Email: u.email ?? '',
//       Phone: u.phone ?? u.phoneNumber ?? '',
//       Role: u.role?.roleName ?? u.role?.name ?? u.role ?? '',
//       Department:
//         u.department?.departmentName ??
//         u.department?.name ??
//         u.department ??
//         '',
//     }));

//     const worksheet = XLSX.utils.json_to_sheet(data);
//     worksheet['!cols'] = [
//       { wch: 8 },
//       { wch: 25 },
//       { wch: 30 },
//       { wch: 16 },
//       { wch: 16 },
//       { wch: 20 },
//     ];

//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');
//     XLSX.writeFile(workbook, `users-report-${Date.now()}.xlsx`);
//   };

//   // ============ DOWNLOAD REPORT (PDF / EXCEL) ============
//   const handleDownloadReport = async (type) => {
//     setDownloadingType(type);
//     setReportError('');

//     try {
//       const isUsers = reportKind === 'users';
//       const endpoint = isUsers ? USERS_ENDPOINT : PRODUCTS_ENDPOINT;
//       const fileBase = isUsers ? 'users-report' : 'product-report';

//       const response = await fetch(endpoint, {
//         method: 'GET',
//         headers: { Accept: 'application/json' },
//       });

//       if (!response.ok) {
//         let errorMsg = `Server responded with ${response.status}`;
//         try {
//           const errText = await response.text();
//           if (errText) errorMsg = errText;
//         } catch (_) {
//           /* ignore */
//         }
//         throw new Error(errorMsg);
//       }

//       // If the backend returns a file directly, save it as-is
//       const contentType = (response.headers.get('Content-Type') || '').toLowerCase();

//       if (
//         contentType.includes('application/pdf') ||
//         contentType.includes('spreadsheetml') ||
//         contentType.includes('application/vnd.ms-excel')
//       ) {
//         const blob = await response.blob();
//         if (blob.size === 0) {
//           throw new Error('Received an empty file from the server.');
//         }

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

//       // Otherwise expect JSON and build the file client-side
//       const data = await response.json();

//       if (!Array.isArray(data) || data.length === 0) {
//         throw new Error('No data available to export.');
//       }

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

//   // ============ CARDS CONFIG ============
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
//     position: 'fixed',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'center',
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

//       {/* Dashboard Cards */}
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
//                 width: '55px',
//                 height: '55px',
//                 borderRadius: '10px',
//                 backgroundColor: `${card.color}15`,
//                 display: 'flex',
//                 alignItems: 'center',
//                 justifyContent: 'center',
//                 fontSize: '30px',
//                 marginBottom: '18px',
//               }}
//             >
//               {card.icon}
//             </div>

//             <h2 style={{ margin: '0 0 8px 0', color: '#1e293b', fontSize: '20px' }}>
//               {card.title}
//             </h2>

//             <p
//               style={{
//                 margin: '0 0 20px 0',
//                 color: '#64748b',
//                 fontSize: '14px',
//                 lineHeight: '1.5',
//               }}
//             >
//               {card.description}
//             </p>

//             <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
//               {card.actions.map((action) => (
//                 <button
//                   key={action.label}
//                   onClick={() => handleAction(action)}
//                   style={{
//                     width: '100%',
//                     padding: '11px 15px',
//                     border: 'none',
//                     borderRadius: '7px',
//                     backgroundColor: card.color,
//                     color: '#ffffff',
//                     fontSize: '14px',
//                     fontWeight: '600',
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
//         <div
//           style={modalOverlay}
//           onClick={() => !downloadingType && setShowReportOptions(false)}
//         >
//           <div style={modalContent} onClick={(e) => e.stopPropagation()}>
//             <h2 style={{ marginTop: 0, color: '#1e293b' }}>
//               📄 {reportTitle}
//             </h2>
//             <p style={{ color: '#64748b', marginBottom: '20px' }}>
//               Choose the format you want to download:
//             </p>

//             {reportError && (
//               <div
//                 style={{
//                   background: '#fef2f2',
//                   color: '#dc2626',
//                   border: '1px solid #fecaca',
//                   padding: '12px 15px',
//                   borderRadius: '8px',
//                   marginBottom: '18px',
//                   fontSize: '13px',
//                   display: 'flex',
//                   alignItems: 'center',
//                   gap: '8px',
//                 }}
//               >
//                 ⚠️ {reportError}
//               </div>
//             )}

//             <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
//               {/* PDF BUTTON */}
//               <button
//                 onClick={() => handleDownloadReport('pdf')}
//                 disabled={downloadingType === 'pdf'}
//                 style={{
//                   flex: 1,
//                   minWidth: '160px',
//                   padding: '20px 20px',
//                   border: 'none',
//                   borderRadius: '10px',
//                   background:
//                     downloadingType === 'pdf'
//                       ? '#f87171'
//                       : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
//                   color: '#fff',
//                   fontSize: '15px',
//                   fontWeight: '700',
//                   cursor: downloadingType === 'pdf' ? 'wait' : 'pointer',
//                   boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
//                   transition: 'all 0.2s ease',
//                   display: 'flex',
//                   flexDirection: 'column',
//                   alignItems: 'center',
//                   gap: '10px',
//                 }}
//               >
//                 <span style={{ fontSize: '32px' }}>
//                   {downloadingType === 'pdf' ? '⏳' : '📄'}
//                 </span>
//                 {downloadingType === 'pdf' ? 'Downloading...' : 'Download PDF'}
//               </button>

//               {/* EXCEL BUTTON */}
//               <button
//                 onClick={() => handleDownloadReport('excel')}
//                 disabled={downloadingType === 'excel'}
//                 style={{
//                   flex: 1,
//                   minWidth: '160px',
//                   padding: '20px 20px',
//                   border: 'none',
//                   borderRadius: '10px',
//                   background:
//                     downloadingType === 'excel'
//                       ? '#4ade80'
//                       : 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
//                   color: '#fff',
//                   fontSize: '15px',
//                   fontWeight: '700',
//                   cursor: downloadingType === 'excel' ? 'wait' : 'pointer',
//                   boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)',
//                   transition: 'all 0.2s ease',
//                   display: 'flex',
//                   flexDirection: 'column',
//                   alignItems: 'center',
//                   gap: '10px',
//                 }}
//               >
//                 <span style={{ fontSize: '32px' }}>
//                   {downloadingType === 'excel' ? '⏳' : '📊'}
//                 </span>
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
//             <h2 style={{ marginTop: 0, color: '#1e293b' }}>Registered Departments</h2>
//             {loading ? (
//               <p style={{ color: '#64748b' }}>Loading departments...</p>
//             ) : departments.length === 0 ? (
//               <p style={{ color: '#64748b' }}>No departments found.</p>
//             ) : (
//               <table
//                 style={{
//                   width: '100%',
//                   borderCollapse: 'collapse',
//                   marginTop: '10px',
//                 }}
//               >
//                 <thead>
//                   <tr style={{ backgroundColor: '#f1f5f9' }}>
//                     <th style={thStyle}>Department Name</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {departments.map((dept) => (
//                     <tr
//                       key={dept.id ?? dept.departmentId}
//                       style={{ borderBottom: '1px solid #e2e8f0' }}
//                     >
//                       <td style={tdStyle}>
//                         {dept.name || dept.departmentName || dept.deptName || ''}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             )}
//             <div style={{ textAlign: 'right' }}>
//               <button
//                 style={closeButton}
//                 onClick={() => setShowDepartments(false)}
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// // Inline table styles
// const thStyle = {
//   padding: '12px 16px',
//   textAlign: 'left',
//   fontSize: '14px',
//   color: '#334155',
//   fontWeight: '600',
// };

// const tdStyle = {
//   padding: '12px 16px',
//   fontSize: '14px',
//   color: '#475569',
// };

// export default AdminDashboard;
import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

// Use relative URLs so the dev-server proxy forwards them (no CORS)
const API_BASE = '/api';

// Endpoints — match your Spring Boot controllers
const PRODUCTS_ENDPOINT = `${API_BASE}/products/all`;
const DEPARTMENTS_ENDPOINT = `${API_BASE}/departments/all`;
const USERS_ENDPOINT = `${API_BASE}/users`;

// =====================================================
// Helper: reliably pick the username from any user object
// =====================================================
// Tries common key names, and as a last resort scans all
// string values on the object for something that looks
// like a name (skips emails, phones, roles, IDs).
const pickUsername = (u) => {
  if (!u || typeof u !== 'object') return '';

  // 1) Try the well-known keys first
  const direct =
    u.user_name ??
    u.userName ??
    u.username ??
    u.name ??
    u.fullName ??
    u.full_name ??
    u.displayName;

  if (direct != null && String(direct).trim() !== '') {
    return String(direct);
  }

  // 2) Fallback: scan all string values for something name-like
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

// Helper: reliably pick the phone number
const pickPhone = (u) => {
  if (!u || typeof u !== 'object') return '';
  return (
    u.phone_number ??
    u.phoneNumber ??
    u.phone ??
    u.mobileNumber ??
    u.mobile ??
    ''
  );
};

// Helper: reliably pick the role (string or nested object)
const pickRole = (u) => {
  if (!u) return '';
  if (typeof u.role === 'string') return u.role;
  if (u.role && typeof u.role === 'object') {
    return u.role.roleName ?? u.role.name ?? '';
  }
  return '';
};

// Helper: reliably pick the department name (string or nested object)
const pickDepartment = (u) => {
  if (!u) return '';
  if (typeof u.department === 'string') return u.department;
  if (u.department && typeof u.department === 'object') {
    return (
      u.department.departmentName ??
      u.department.name ??
      u.department.deptName ??
      ''
    );
  }
  return '';
};

const AdminDashboard = () => {
  const [departments, setDepartments] = useState([]);
  const [showDepartments, setShowDepartments] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showReportOptions, setShowReportOptions] = useState(false);
  const [downloadingType, setDownloadingType] = useState(null);
  const [reportError, setReportError] = useState('');

  // Which report is being generated: 'products' or 'users'
  const [reportKind, setReportKind] = useState('products');

  // Fetch departments when the modal is opened
  useEffect(() => {
    if (showDepartments) {
      fetchDepartments();
    }
  }, [showDepartments]);

  // ============ FETCH DEPARTMENTS ============
  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const response = await fetch(DEPARTMENTS_ENDPOINT);
      if (!response.ok) throw new Error('Failed to fetch departments');
      const data = await response.json();
      setDepartments(data);
    } catch (error) {
      console.error('Error fetching departments:', error);
      alert('Failed to load departments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // ============ PRODUCTS — PDF / EXCEL =================
  // =====================================================
  const generateProductsPdf = (products) => {
    const doc = new jsPDF({ orientation: 'landscape' });

    doc.setFontSize(16);
    doc.text('Product Report', 14, 18);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 24);

    const columns = [
      { header: 'ID', dataKey: 'id' },
      { header: 'Name', dataKey: 'name' },
      { header: 'Description', dataKey: 'description' },
      { header: 'Quantity', dataKey: 'quantity' },
      { header: 'Unit Price', dataKey: 'unitPrice' },
      { header: 'Supplier', dataKey: 'supplier' },
      { header: 'Receipt Date', dataKey: 'receiptDate' },
      { header: 'Issue Date', dataKey: 'issueDate' },
    ];

    const rows = products.map((p) => ({
      id: p.productId ?? '',
      name: p.productName ?? '',
      description: p.productDescription ?? '',
      quantity: p.productQuantity ?? '',
      unitPrice: p.price ?? '',
      supplier: p.supplierName ?? '',
      receiptDate: p.receiptDate ?? '',
      issueDate: p.issueDate ?? '',
    }));

    autoTable(doc, {
      columns,
      body: rows,
      startY: 30,
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { left: 10, right: 10 },
    });

    doc.save(`product-report-${Date.now()}.pdf`);
  };

  const generateProductsExcel = (products) => {
    const data = products.map((p) => ({
      ID: p.productId ?? '',
      Name: p.productName ?? '',
      Description: p.productDescription ?? '',
      Quantity: p.productQuantity ?? '',
      'Unit Price': p.price ?? '',
      Supplier: p.supplierName ?? '',
      'Receipt Date': p.receiptDate ?? '',
      'Issue Date': p.issueDate ?? '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    worksheet['!cols'] = [
      { wch: 8 },
      { wch: 25 },
      { wch: 35 },
      { wch: 10 },
      { wch: 12 },
      { wch: 22 },
      { wch: 14 },
      { wch: 14 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');
    XLSX.writeFile(workbook, `product-report-${Date.now()}.xlsx`);
  };

  // =====================================================
  // ============ USERS — PDF / EXCEL ====================
  // =====================================================
  const generateUsersPdf = (users) => {
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

    const rows = users.map((u) => ({
      id: u.userId ?? u.id ?? '',
      username: pickUsername(u),   // ← smart helper
      email: u.email ?? '',
      gender: u.gender ?? '',
      phone: pickPhone(u),         // ← smart helper
      role: pickRole(u),           // ← smart helper
      department: pickDepartment(u), // ← smart helper
    }));

    autoTable(doc, {
      columns,
      body: rows,
      startY: 30,
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: {
        fillColor: [249, 115, 22],
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: { fillColor: [255, 247, 237] },
      margin: { left: 10, right: 10 },
    });

    doc.save(`users-report-${Date.now()}.pdf`);
  };

  const generateUsersExcel = (users) => {
    const data = users.map((u) => ({
      ID: u.userId ?? u.id ?? '',
      Username: pickUsername(u),      // ← smart helper
      Email: u.email ?? '',
      Gender: u.gender ?? '',
      Phone: pickPhone(u),            // ← smart helper
      Role: pickRole(u),              // ← smart helper
      Department: pickDepartment(u),  // ← smart helper
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    worksheet['!cols'] = [
      { wch: 8 },   // ID
      { wch: 25 },  // Username
      { wch: 30 },  // Email
      { wch: 10 },  // Gender
      { wch: 16 },  // Phone
      { wch: 16 },  // Role
      { wch: 20 },  // Department
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');
    XLSX.writeFile(workbook, `users-report-${Date.now()}.xlsx`);
  };

  // ============ DOWNLOAD REPORT (PDF / EXCEL) ============
  const handleDownloadReport = async (type) => {
    setDownloadingType(type);
    setReportError('');

    try {
      const isUsers = reportKind === 'users';
      const endpoint = isUsers ? USERS_ENDPOINT : PRODUCTS_ENDPOINT;
      const fileBase = isUsers ? 'users-report' : 'product-report';

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });

      if (!response.ok) {
        let errorMsg = `Server responded with ${response.status}`;
        try {
          const errText = await response.text();
          if (errText) errorMsg = errText;
        } catch (_) {
          /* ignore */
        }
        throw new Error(errorMsg);
      }

      // If the backend returns a file directly, save it as-is
      const contentType = (response.headers.get('Content-Type') || '').toLowerCase();

      if (
        contentType.includes('application/pdf') ||
        contentType.includes('spreadsheetml') ||
        contentType.includes('application/vnd.ms-excel')
      ) {
        const blob = await response.blob();
        if (blob.size === 0) {
          throw new Error('Received an empty file from the server.');
        }

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

      // Otherwise expect JSON and build the file client-side
      const data = await response.json();

      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('No data available to export.');
      }

      // Debug log — remove after confirming it works
      console.log('=== FIRST USER FROM API ===');
      console.log(data[0]);
      console.log('=== KEYS ===', Object.keys(data[0] || {}));

      if (isUsers) {
        if (type === 'pdf') generateUsersPdf(data);
        else generateUsersExcel(data);
      } else {
        if (type === 'pdf') generateProductsPdf(data);
        else generateProductsExcel(data);
      }

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

  // ============ CARDS CONFIG ============
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
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
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

      {/* Dashboard Cards */}
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
                width: '55px',
                height: '55px',
                borderRadius: '10px',
                backgroundColor: `${card.color}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '30px',
                marginBottom: '18px',
              }}
            >
              {card.icon}
            </div>

            <h2 style={{ margin: '0 0 8px 0', color: '#1e293b', fontSize: '20px' }}>
              {card.title}
            </h2>

            <p
              style={{
                margin: '0 0 20px 0',
                color: '#64748b',
                fontSize: '14px',
                lineHeight: '1.5',
              }}
            >
              {card.description}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {card.actions.map((action) => (
                <button
                  key={action.label}
                  onClick={() => handleAction(action)}
                  style={{
                    width: '100%',
                    padding: '11px 15px',
                    border: 'none',
                    borderRadius: '7px',
                    backgroundColor: card.color,
                    color: '#ffffff',
                    fontSize: '14px',
                    fontWeight: '600',
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
        <div
          style={modalOverlay}
          onClick={() => !downloadingType && setShowReportOptions(false)}
        >
          <div style={modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginTop: 0, color: '#1e293b' }}>
              📄 {reportTitle}
            </h2>
            <p style={{ color: '#64748b', marginBottom: '20px' }}>
              Choose the format you want to download:
            </p>

            {reportError && (
              <div
                style={{
                  background: '#fef2f2',
                  color: '#dc2626',
                  border: '1px solid #fecaca',
                  padding: '12px 15px',
                  borderRadius: '8px',
                  marginBottom: '18px',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                ⚠️ {reportError}
              </div>
            )}

            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              {/* PDF BUTTON */}
              <button
                onClick={() => handleDownloadReport('pdf')}
                disabled={downloadingType === 'pdf'}
                style={{
                  flex: 1,
                  minWidth: '160px',
                  padding: '20px 20px',
                  border: 'none',
                  borderRadius: '10px',
                  background:
                    downloadingType === 'pdf'
                      ? '#f87171'
                      : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  color: '#fff',
                  fontSize: '15px',
                  fontWeight: '700',
                  cursor: downloadingType === 'pdf' ? 'wait' : 'pointer',
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <span style={{ fontSize: '32px' }}>
                  {downloadingType === 'pdf' ? '⏳' : '📄'}
                </span>
                {downloadingType === 'pdf' ? 'Downloading...' : 'Download PDF'}
              </button>

              {/* EXCEL BUTTON */}
              <button
                onClick={() => handleDownloadReport('excel')}
                disabled={downloadingType === 'excel'}
                style={{
                  flex: 1,
                  minWidth: '160px',
                  padding: '20px 20px',
                  border: 'none',
                  borderRadius: '10px',
                  background:
                    downloadingType === 'excel'
                      ? '#4ade80'
                      : 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                  color: '#fff',
                  fontSize: '15px',
                  fontWeight: '700',
                  cursor: downloadingType === 'excel' ? 'wait' : 'pointer',
                  boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <span style={{ fontSize: '32px' }}>
                  {downloadingType === 'excel' ? '⏳' : '📊'}
                </span>
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
            <h2 style={{ marginTop: 0, color: '#1e293b' }}>Registered Departments</h2>
            {loading ? (
              <p style={{ color: '#64748b' }}>Loading departments...</p>
            ) : departments.length === 0 ? (
              <p style={{ color: '#64748b' }}>No departments found.</p>
            ) : (
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  marginTop: '10px',
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: '#f1f5f9' }}>
                    <th style={thStyle}>Department Name</th>
                  </tr>
                </thead>
                <tbody>
                  {departments.map((dept) => (
                    <tr
                      key={dept.id ?? dept.departmentId}
                      style={{ borderBottom: '1px solid #e2e8f0' }}
                    >
                      <td style={tdStyle}>
                        {dept.name || dept.departmentName || dept.deptName || ''}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <div style={{ textAlign: 'right' }}>
              <button
                style={closeButton}
                onClick={() => setShowDepartments(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Inline table styles
const thStyle = {
  padding: '12px 16px',
  textAlign: 'left',
  fontSize: '14px',
  color: '#334155',
  fontWeight: '600',
};

const tdStyle = {
  padding: '12px 16px',
  fontSize: '14px',
  color: '#475569',
};

export default AdminDashboard;