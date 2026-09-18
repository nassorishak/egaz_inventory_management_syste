
// import React from 'react';

// const AdminDashboard = () => {
//   const cards = [
//     {
//       title: 'Products',
//       icon: '📦',
//       description: 'Download a report of all registered products.',
//       color: '#3b82f6',
//       actions: [{ label: 'Download Product Report', path: '/api/products/report' }],
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
//       actions: [{ label: 'List Registered Departments', path: '/add-department' }],
//     },
//   ];

//   const handleAction = (action) => {
//     if (action.label === 'Download Product Report') {
//       window.open(`http://localhost:8080${action.path}`, '_blank');
//     } else {
//       window.location.href = action.path;
//     }
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
//     </div>
//   );
// };

// export default AdminDashboard;

import React, { useState, useEffect } from 'react';

const AdminDashboard = () => {
  const [departments, setDepartments] = useState([]);
  const [showDepartments, setShowDepartments] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showReportOptions, setShowReportOptions] = useState(false);

  // Fetch departments when the modal is opened
  useEffect(() => {
    if (showDepartments) {
      fetchDepartments();
    }
  }, [showDepartments]);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/departments');
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

 // Proper file download: fetch as blob, then trigger download via hidden link
const handleDownloadReport = async (type) => {
  const url =
    type === 'pdf'
      ? 'http://localhost:8080/api/products/report/pdf'
      : 'http://localhost:8080/api/products/report/excel';

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept:
          type === 'pdf'
            ? 'application/pdf'
            : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    });

    if (!response.ok) {
      // Try to read the error body for a better message
      let errorMsg = `Server responded with ${response.status}`;
      try {
        const errText = await response.text();
        if (errText) errorMsg = errText;
      } catch (_) {
        /* ignore */
      }
      throw new Error(errorMsg);
    }

    const blob = await response.blob();

    // Guard against empty files (often caused by a backend error with 200 status)
    if (blob.size === 0) {
      throw new Error('Received an empty file from the server.');
    }

    // Try to get filename from Content-Disposition header
    const disposition = response.headers.get('Content-Disposition');
    let filename = type === 'pdf' ? 'product-report.pdf' : 'product-report.xlsx';
    if (disposition && disposition.indexOf('filename=') !== -1) {
      const match = disposition.match(/filename\*?=["']?([^"';]+)["']?/);
      if (match && match[1]) {
        filename = decodeURIComponent(match[1]);
      }
    }

    // Create a temporary object URL and click a hidden anchor
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);

    setShowReportOptions(false);
  } catch (error) {
    console.error('Error downloading report:', error);
    alert(`Failed to download report: ${error.message}`);
  }
};

  const cards = [
    {
      title: 'Products',
      icon: '📦',
      description: 'Download a report of all registered products.',
      color: '#3b82f6',
      actions: [{ label: 'Download Product Report', type: 'report' }],
    },
    {
      title: 'Requested Products',
      icon: '📝',
      description: 'View products requested by departments and staff.',
      color: '#f97316',
      actions: [{ label: 'View Requests', path: '/manage-request' }],
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
      setShowReportOptions(true);
    } else if (action.type === 'departments') {
      setShowDepartments(true);
    } else if (action.path) {
      window.location.href = action.path;
    }
  };

  // Modal styles
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
    maxWidth: '700px',
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

            <p style={{ margin: '0 0 20px 0', color: '#64748b', fontSize: '14px', lineHeight: '1.5' }}>
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

      {/* Report Options Modal */}
      {showReportOptions && (
        <div style={modalOverlay} onClick={() => setShowReportOptions(false)}>
          <div style={modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginTop: 0, color: '#1e293b' }}>Download Product Report</h2>
            <p style={{ color: '#64748b', marginBottom: '24px' }}>
              Choose the format for your product report:
            </p>
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              <button
                onClick={() => handleDownloadReport('pdf')}
                style={{
                  flex: 1,
                  minWidth: '140px',
                  padding: '14px 20px',
                  border: 'none',
                  borderRadius: '8px',
                  backgroundColor: '#ef4444',
                  color: '#fff',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                📄 Download PDF
              </button>
              <button
                onClick={() => handleDownloadReport('excel')}
                style={{
                  flex: 1,
                  minWidth: '140px',
                  padding: '14px 20px',
                  border: 'none',
                  borderRadius: '8px',
                  backgroundColor: '#16a34a',
                  color: '#fff',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                📊 Download Excel
              </button>
            </div>
            <div style={{ textAlign: 'right' }}>
              <button style={closeButton} onClick={() => setShowReportOptions(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Departments Modal */}
      {showDepartments && (
        <div style={modalOverlay} onClick={() => setShowDepartments(false)}>
          <div style={modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginTop: 0, color: '#1e293b' }}>Registered Departments</h2>
            {loading ? (
              <p style={{ color: '#64748b' }}>Loading departments...</p>
            ) : departments.length === 0 ? (
              <p style={{ color: '#64748b' }}>No departments found.</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f1f5f9' }}>
                    <th style={thStyle}>Department Name</th>
                  </tr>
                </thead>
                <tbody>
                  {departments.map((dept) => (
                    <tr key={dept.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={tdStyle}>{dept.name || dept.departmentName}</td>
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