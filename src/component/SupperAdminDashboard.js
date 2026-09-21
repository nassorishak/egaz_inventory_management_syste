// import React, { useState, useEffect } from 'react';

// const SuperAdminDashboard = () => {
//   const [users, setUsers] = useState([]);
//   const [showUsers, setShowUsers] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [showReportOptions, setShowReportOptions] = useState(false);
//   const [downloadingType, setDownloadingType] = useState(null);

//   // Fetch users when the modal is opened
//   useEffect(() => {
//     if (showUsers) {
//       fetchUsers();
//     }
//   }, [showUsers]);

//   const fetchUsers = async () => {
//     setLoading(true);
//     try {
//       const response = await fetch('http://localhost:8080/api/users');
//       if (!response.ok) throw new Error('Failed to fetch users');
//       const data = await response.json();
//       setUsers(data);
//     } catch (error) {
//       console.error('Error fetching users:', error);
//       alert('Failed to load users. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Proper file download: fetch as blob, then trigger download via hidden link
//   const handleDownloadReport = async (type) => {
//     setDownloadingType(type);

//     const url =
//       type === 'pdf'
//         ? 'http://localhost:8080/api/products/report/pdf'
//         : 'http://localhost:8080/api/products/report/excel';

//     try {
//       const response = await fetch(url, {
//         method: 'GET',
//         headers: {
//           Accept:
//             type === 'pdf'
//               ? 'application/pdf'
//               : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
//         },
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

//       const blob = await response.blob();

//       if (blob.size === 0) {
//         throw new Error('Received an empty file from the server.');
//       }

//       const disposition = response.headers.get('Content-Disposition');
//       let filename = type === 'pdf' ? 'product-report.pdf' : 'product-report.xlsx';
//       if (disposition && disposition.indexOf('filename=') !== -1) {
//         const match = disposition.match(/filename\*?=["']?([^"';]+)["']?/);
//         if (match && match[1]) {
//           filename = decodeURIComponent(match[1]);
//         }
//       }

//       const blobUrl = window.URL.createObjectURL(blob);
//       const link = document.createElement('a');
//       link.href = blobUrl;
//       link.download = filename;
//       link.style.display = 'none';
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//       window.URL.revokeObjectURL(blobUrl);

//       setShowReportOptions(false);
//     } catch (error) {
//       console.error('Error downloading report:', error);
//       alert(`Failed to download report: ${error.message}`);
//     } finally {
//       setDownloadingType(null);
//     }
//   };

//   const cards = [
//     {
//       title: 'All Products Report',
//       icon: '📦',
//       description: 'Download a full report of all registered products.',
//       color: '#3b82f6',
//       actions: [{ label: 'Download Product Report', type: 'report' }],
//     },
//     {
//       title: 'System Users',
//       icon: '👥',
//       description: 'View all registered users across every department.',
//       color: '#8b5cf6',
//       actions: [{ label: 'List All Users', type: 'users' }],
//     },
//     {
//       title: 'Manage Admins',
//       icon: '🛡️',
//       description: 'Add, edit, or remove admin accounts from the system.',
//       color: '#ef4444',
//       actions: [{ label: 'Manage Admins', path: '/manage-admins' }],
//     },
//     {
//       title: 'Audit Logs',
//       icon: '📜',
//       description: 'Review all system activity and user actions.',
//       color: '#f59e0b',
//       actions: [{ label: 'View Audit Logs', path: '/audit-logs' }],
//     },
//     {
//       title: 'System Settings',
//       icon: '⚙️',
//       description: 'Configure global settings for the inventory system.',
//       color: '#0ea5e9',
//       actions: [{ label: 'Open Settings', path: '/system-settings' }],
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
//       setShowReportOptions(true);
//     } else if (action.type === 'users') {
//       setShowUsers(true);
//     } else if (action.type === 'departments') {
//       // Reuse departments modal — you can copy the same logic from AdminDashboard
//       window.location.href = '/departments';
//     } else if (action.path) {
//       window.location.href = action.path;
//     }
//   };

//   // Modal styles
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
//     maxWidth: '700px',
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
//         Welcome, Super Admin — Full System Control
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

//             <p style={{ margin: '0 0 20px 0', color: '#64748b', fontSize: '14px', lineHeight: '1.5' }}>
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

//       {/* Report Options Modal */}
//       {showReportOptions && (
//         <div style={modalOverlay} onClick={() => setShowReportOptions(false)}>
//           <div style={modalContent} onClick={(e) => e.stopPropagation()}>
//             <h2 style={{ marginTop: 0, color: '#1e293b' }}>Download Product Report</h2>
//             <p style={{ color: '#64748b', marginBottom: '24px' }}>
//               Choose the format for your product report:
//             </p>
//             <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
//               <button
//                 onClick={() => handleDownloadReport('pdf')}
//                 disabled={downloadingType === 'pdf'}
//                 style={{
//                   flex: 1,
//                   minWidth: '140px',
//                   padding: '14px 20px',
//                   border: 'none',
//                   borderRadius: '8px',
//                   backgroundColor: downloadingType === 'pdf' ? '#f87171' : '#ef4444',
//                   color: '#fff',
//                   fontSize: '15px',
//                   fontWeight: '600',
//                   cursor: downloadingType === 'pdf' ? 'wait' : 'pointer',
//                 }}
//               >
//                 {downloadingType === 'pdf' ? '⏳ Downloading...' : '📄 Download PDF'}
//               </button>
//               <button
//                 onClick={() => handleDownloadReport('excel')}
//                 disabled={downloadingType === 'excel'}
//                 style={{
//                   flex: 1,
//                   minWidth: '140px',
//                   padding: '14px 20px',
//                   border: 'none',
//                   borderRadius: '8px',
//                   backgroundColor: downloadingType === 'excel' ? '#4ade80' : '#16a34a',
//                   color: '#fff',
//                   fontSize: '15px',
//                   fontWeight: '600',
//                   cursor: downloadingType === 'excel' ? 'wait' : 'pointer',
//                 }}
//               >
//                 {downloadingType === 'excel' ? '⏳ Downloading...' : '📊 Download Excel'}
//               </button>
//             </div>
//             <div style={{ textAlign: 'right' }}>
//               <button style={closeButton} onClick={() => setShowReportOptions(false)}>
//                 Cancel
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Users Modal */}
//       {showUsers && (
//         <div style={modalOverlay} onClick={() => setShowUsers(false)}>
//           <div style={modalContent} onClick={(e) => e.stopPropagation()}>
//             <h2 style={{ marginTop: 0, color: '#1e293b' }}>Registered Users</h2>
//             {loading ? (
//               <p style={{ color: '#64748b' }}>Loading users...</p>
//             ) : users.length === 0 ? (
//               <p style={{ color: '#64748b' }}>No users found.</p>
//             ) : (
//               <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
//                 <thead>
//                   <tr style={{ backgroundColor: '#f1f5f9' }}>
//                     <th style={thStyle}>Username</th>
//                     <th style={thStyle}>Role</th>
//                     <th style={thStyle}>Department</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {users.map((user) => (
//                     <tr key={user.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
//                       <td style={tdStyle}>{user.username || user.name}</td>
//                       <td style={tdStyle}>{user.role || '—'}</td>
//                       <td style={tdStyle}>{user.department || '—'}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             )}
//             <div style={{ textAlign: 'right' }}>
//               <button style={closeButton} onClick={() => setShowUsers(false)}>
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

// export default SuperAdminDashboard;

import React, { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

// Use relative URLs so the dev-server proxy forwards them (no CORS)
const API_BASE = '/api';

// Endpoints — match your Spring Boot controllers
const PRODUCTS_ENDPOINT = `${API_BASE}/products/all`;
const USERS_ENDPOINT = `${API_BASE}/users`;

const SuperAdminDashboard = () => {
  const [showReportOptions, setShowReportOptions] = useState(false);
  const [downloadingType, setDownloadingType] = useState(null);
  const [reportError, setReportError] = useState('');
  const [reportKind, setReportKind] = useState('products');

  // =====================================================
  // ============ PRODUCTS — PDF / EXCEL =================
  // =====================================================
  const generateProductsPdf = (products) => {
    const doc = new jsPDF({ orientation: 'landscape' });

    doc.setFontSize(16);
    doc.text('All Products Report', 14, 18);

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

    doc.save(`products-report-${Date.now()}.pdf`);
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
    XLSX.writeFile(workbook, `products-report-${Date.now()}.xlsx`);
  };

  // =====================================================
  // ============ USERS — PDF / EXCEL ====================
  // =====================================================
  const generateUsersPdf = (userList) => {
    const doc = new jsPDF({ orientation: 'landscape' });

    doc.setFontSize(16);
    doc.text('System Users Report', 14, 18);

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

    const rows = userList.map((u) => ({
      id: u.userId ?? u.id ?? '',
      username: u.userName ?? u.username ?? u.name ?? '',
      email: u.email ?? '',
      gender: u.gender ?? '',
      phone: u.phoneNumber ?? u.phone ?? '',
      role: u.role?.roleName ?? u.role?.name ?? u.role ?? '',
      department:
        u.department?.departmentName ??
        u.department?.name ??
        u.department ??
        '',
    }));

    autoTable(doc, {
      columns,
      body: rows,
      startY: 30,
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: {
        fillColor: [139, 92, 246],
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: { fillColor: [245, 243, 255] },
      margin: { left: 10, right: 10 },
    });

    doc.save(`users-report-${Date.now()}.pdf`);
  };

  const generateUsersExcel = (userList) => {
    const data = userList.map((u) => ({
      ID: u.userId ?? u.id ?? '',
      Username: u.userName ?? u.username ?? u.name ?? '',
      Email: u.email ?? '',
      Gender: u.gender ?? '',
      Phone: u.phoneNumber ?? u.phone ?? '',
      Role: u.role?.roleName ?? u.role?.name ?? u.role ?? '',
      Department:
        u.department?.departmentName ??
        u.department?.name ??
        u.department ??
        '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    worksheet['!cols'] = [
      { wch: 8 },
      { wch: 25 },
      { wch: 30 },
      { wch: 10 },
      { wch: 16 },
      { wch: 16 },
      { wch: 20 },
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

      const data = await response.json();

      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('No data available to export.');
      }

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
      title: 'All Products Report',
      icon: '📦',
      description: 'Download a full report of all registered products.',
      color: '#3b82f6',
      actions: [
        { label: 'Download Product Report', type: 'report', kind: 'products' },
      ],
    },
    {
      title: 'System Users',
      icon: '👥',
      description: 'Download a report of all registered users across every department.',
      color: '#8b5cf6',
      actions: [
        { label: 'Download Users Report', type: 'report', kind: 'users' },
      ],
    },
    {
      title: 'Audit Logs',
      icon: '📜',
      description: 'Review all system activity and user actions.',
      color: '#f59e0b',
      actions: [{ label: 'View Audit Logs', path: '/audit-logs' }],
    },
  ];

  const handleAction = (action) => {
    if (action.type === 'report') {
      setReportError('');
      setReportKind(action.kind || 'products');
      setShowReportOptions(true);
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
  const reportTitle = isUsersReport
    ? 'Download Users Report'
    : 'Download Product Report';
  const reportAccent = isUsersReport ? '#8b5cf6' : '#3b82f6';

  return (
    <div style={{ padding: '30px' }}>
      <p style={{ margin: '0 0 24px', color: '#64748b', fontSize: 15 }}>
        Welcome, Super Admin — Full System Control
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
            <h2 style={{ marginTop: 0, color: '#1e293b' }}>📄 {reportTitle}</h2>
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
              <button
                onClick={() => handleDownloadReport('pdf')}
                disabled={downloadingType === 'pdf'}
                style={{
                  flex: 1,
                  minWidth: '160px',
                  padding: '20px',
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

              <button
                onClick={() => handleDownloadReport('excel')}
                disabled={downloadingType === 'excel'}
                style={{
                  flex: 1,
                  minWidth: '160px',
                  padding: '20px',
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
    </div>
  );
};

export default SuperAdminDashboard;