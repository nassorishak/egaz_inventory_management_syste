// import React, { useState, useEffect } from 'react';
// import axios from 'axios';

// const MyRequests = () => {
//   const [requests, setRequests] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');

//   const userId = localStorage.getItem('userId');

//   const load = async () => {
//     if (!userId) {
//       setError('Please log in again.');
//       setLoading(false);
//       return;
//     }
//     try {
//       setLoading(true);
//       const res = await axios.get(
//         `http://localhost:8080/api/product-requests/my-requests?userId=${userId}`
//       );
//       setRequests(Array.isArray(res.data) ? res.data : []);
//     } catch (err) {
//       console.error(err);
//       setError('Failed to load your requests.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     load();
//   }, [userId]);

//   // Helper — colors + label per status
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
//     <div style={page}>
//       <div style={header}>
//         <div>
//           <h2 style={title}>My Requests</h2>
//           <p style={subtitle}>
//             Track the status of every product request you have submitted
//           </p>
//         </div>

//         <button
//           onClick={load}
//           style={refreshBtn}
//           disabled={loading}
//         >
//           ⟳ Refresh
//         </button>
//       </div>

//       {error && <div style={errorBox}>{error}</div>}

//       {/* Summary cards */}
//       {!loading && requests.length > 0 && (
//         <div style={summaryGrid}>
//           <SummaryCard
//             label="Total"
//             value={requests.length}
//             color="#3b82f6"
//           />
//           <SummaryCard
//             label="Pending"
//             value={requests.filter(r => r.status === 'PENDING').length}
//             color="#f59e0b"
//           />
//           <SummaryCard
//             label="Approved"
//             value={requests.filter(r => r.status === 'APPROVED').length}
//             color="#16a34a"
//           />
//           <SummaryCard
//             label="Rejected"
//             value={requests.filter(r => r.status === 'REJECTED').length}
//             color="#dc2626"
//           />
//         </div>
//       )}

//       {loading ? (
//         <div style={loadingBox}>Loading your requests...</div>
//       ) : requests.length === 0 ? (
//         <div style={emptyBox}>
//           <div style={{ fontSize: 42, marginBottom: 10 }}>📭</div>
//           <div style={{ fontWeight: 600, color: '#334155', marginBottom: 6 }}>
//             You haven't submitted any requests yet
//           </div>
//           <div style={{ fontSize: 13, color: '#64748b' }}>
//             Go to <b>Request a Product</b> to submit your first request.
//           </div>
//         </div>
//       ) : (
//         <div style={tableContainer}>
//           <table style={table}>
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
//               </tr>
//             </thead>

//             <tbody>
//               {requests.map((r) => (
//                 <tr key={r.requestId} style={row}>
//                   <td style={td}>#{r.requestId}</td>
//                   <td style={td}>
//                     <strong>{r.productName ?? r.product?.productName ?? '-'}</strong>
//                   </td>
//                   <td style={{ ...td, maxWidth: 260 }}>
//                     {r.description ?? r.product?.productDescription ?? '-'}
//                   </td>
//                   <td style={td}>{r.quantity ?? '-'}</td>
//                   <td style={td}>{r.departmentName ?? r.department?.departmentName ?? '-'}</td>
//                   <td style={td}>{r.issueDate ?? '-'}</td>
//                   <td style={td}>
//                     <span style={{ ...statusBadge, ...statusStyle(r.status) }}>
//                       {statusIcon(r.status)} {r.status || 'PENDING'}
//                     </span>
//                   </td>
//                   <td style={{ ...td, maxWidth: 220, color: '#64748b' }}>
//                     {r.adminNote || '—'}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );
// };

// // ======================================================
// // Small reusable component
// // ======================================================
// const SummaryCard = ({ label, value, color }) => (
//   <div style={{
//     background: '#fff',
//     borderRadius: 12,
//     padding: 16,
//     border: '1px solid #e2e8f0',
//     borderLeft: `5px solid ${color}`,
//     boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
//   }}>
//     <div style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>{label}</div>
//     <div style={{ fontSize: 26, fontWeight: 700, color: '#1e293b', marginTop: 4 }}>
//       {value}
//     </div>
//   </div>
// );

// // ======================================================
// // Styles
// // ======================================================
// const page = {
//   padding: '30px',
//   background: '#f8fafc',
//   minHeight: '100vh',
//   fontFamily: 'Arial, Helvetica, sans-serif',
// };
// const header = {
//   display: 'flex',
//   justifyContent: 'space-between',
//   alignItems: 'flex-end',
//   marginBottom: 24,
//   gap: 16,
//   flexWrap: 'wrap',
// };
// const title = { margin: 0, color: '#1e293b', fontSize: 28 };
// const subtitle = { marginTop: 6, color: '#64748b', fontSize: 14 };
// const refreshBtn = {
//   padding: '10px 18px',
//   border: 'none',
//   borderRadius: 8,
//   background: '#2563eb',
//   color: '#fff',
//   fontWeight: 600,
//   cursor: 'pointer',
//   fontSize: 14,
// };
// const errorBox = {
//   background: '#fee2e2',
//   color: '#b91c1c',
//   padding: '12px 15px',
//   borderRadius: 8,
//   marginBottom: 20,
//   border: '1px solid #fecaca',
// };
// const loadingBox = {
//   background: '#fff',
//   padding: 40,
//   textAlign: 'center',
//   borderRadius: 10,
//   color: '#64748b',
// };
// const emptyBox = {
//   background: '#fff',
//   padding: 50,
//   textAlign: 'center',
//   borderRadius: 12,
//   color: '#475569',
//   border: '1px dashed #cbd5e1',
// };
// const summaryGrid = {
//   display: 'grid',
//   gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
//   gap: 16,
//   marginBottom: 24,
// };
// const tableContainer = {
//   background: '#fff',
//   borderRadius: 12,
//   overflowX: 'auto',
//   boxShadow: '0 4px 15px rgba(0,0,0,0.06)',
// };
// const table = {
//   width: '100%',
//   borderCollapse: 'collapse',
//   minWidth: 900,
// };
// const th = {
//   background: '#1e40af',
//   color: '#fff',
//   padding: '14px 12px',
//   textAlign: 'left',
//   fontSize: 14,
//   whiteSpace: 'nowrap',
// };
// const td = {
//   padding: '13px 12px',
//   borderBottom: '1px solid #e2e8f0',
//   color: '#334155',
//   fontSize: 14,
//   verticalAlign: 'top',
// };
// const row = { transition: 'background-color 0.2s' };
// const statusBadge = {
//   display: 'inline-block',
//   padding: '5px 12px',
//   borderRadius: 20,
//   fontSize: 12,
//   fontWeight: 700,
//   letterSpacing: 0.3,
// };

// export default MyRequests;

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const MyRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const userId = localStorage.getItem('userId');

  // ==========================================
  // LOAD MY REQUESTS (memoized)
  // ==========================================
  const load = useCallback(async () => {
    if (!userId) {
      setError('Please log in again.');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError('');
      const res = await axios.get(
        `http://localhost:8080/api/product-requests/my-requests?userId=${userId}`
      );
      setRequests(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setError('Failed to load your requests.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  // ==========================================
  // STATUS BADGE
  // ==========================================
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

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <div style={page}>
      {/* Header */}
      <div style={header}>
        <div>
          <h2 style={title}>My Requests</h2>
          <p style={subtitle}>
            Track the status of every product request you have submitted
          </p>
        </div>

        <button
          onClick={load}
          style={refreshBtn}
          disabled={loading}
        >
          ⟳ Refresh
        </button>
      </div>

      {/* Error */}
      {error && <div style={errorBox}>⚠️ {error}</div>}

      {/* Summary cards */}
      {!loading && requests.length > 0 && (
        <div style={summaryGrid}>
          <SummaryCard
            label="Total"
            value={requests.length}
            color="#3b82f6"
          />
          <SummaryCard
            label="Pending"
            value={requests.filter((r) => r.status === 'PENDING').length}
            color="#f59e0b"
          />
          <SummaryCard
            label="Approved"
            value={requests.filter((r) => r.status === 'APPROVED').length}
            color="#16a34a"
          />
          <SummaryCard
            label="Rejected"
            value={requests.filter((r) => r.status === 'REJECTED').length}
            color="#dc2626"
          />
        </div>
      )}

      {/* Body */}
      {loading ? (
        <div style={loadingBox}>Loading your requests...</div>
      ) : requests.length === 0 ? (
        <div style={emptyBox}>
          <div style={{ fontSize: 42, marginBottom: 10 }}>📭</div>
          <div style={{ fontWeight: 600, color: '#334155', marginBottom: 6 }}>
            You haven't submitted any requests yet
          </div>
          <div style={{ fontSize: 13, color: '#64748b' }}>
            Go to <b>Request a Product</b> to submit your first request.
          </div>
        </div>
      ) : (
        <div style={tableContainer}>
          <table style={table}>
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
              </tr>
            </thead>

            <tbody>
              {requests.map((r) => (
                <tr key={r.requestId} style={row}>
                  <td style={td}>#{r.requestId}</td>

                  <td style={td}>
                    <strong>
                      {r.productName ?? r.product?.productName ?? '-'}
                    </strong>
                  </td>

                  <td style={{ ...td, maxWidth: 260 }}>
                    {r.description ?? r.product?.productDescription ?? '-'}
                  </td>

                  <td style={td}>{r.quantity ?? '-'}</td>

                  <td style={td}>
                    {r.departmentName ?? r.department?.departmentName ?? '-'}
                  </td>

                  <td style={td}>{r.issueDate ?? '-'}</td>

                  <td style={td}>
                    <span style={{ ...statusBadge, ...statusStyle(r.status) }}>
                      {statusIcon(r.status)} {r.status || 'PENDING'}
                    </span>
                  </td>

                  <td style={{ ...td, maxWidth: 220, color: '#64748b' }}>
                    {r.adminNote || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ======================================================
// Small reusable component
// ======================================================
const SummaryCard = ({ label, value, color }) => (
  <div
    style={{
      background: '#fff',
      borderRadius: 12,
      padding: 16,
      border: '1px solid #e2e8f0',
      borderLeft: `5px solid ${color}`,
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    }}
  >
    <div style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>
      {label}
    </div>
    <div
      style={{
        fontSize: 26,
        fontWeight: 700,
        color: '#1e293b',
        marginTop: 4,
      }}
    >
      {value}
    </div>
  </div>
);

// ======================================================
// Styles
// ======================================================
const page = {
  padding: '30px',
  background: '#f8fafc',
  minHeight: '100vh',
  fontFamily: 'Arial, Helvetica, sans-serif',
};

const header = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-end',
  marginBottom: 24,
  gap: 16,
  flexWrap: 'wrap',
};

const title = { margin: 0, color: '#1e293b', fontSize: 28 };
const subtitle = { marginTop: 6, color: '#64748b', fontSize: 14 };

const refreshBtn = {
  padding: '10px 18px',
  border: 'none',
  borderRadius: 8,
  background: '#2563eb',
  color: '#fff',
  fontWeight: 600,
  cursor: 'pointer',
  fontSize: 14,
};

const errorBox = {
  background: '#fee2e2',
  color: '#b91c1c',
  padding: '12px 15px',
  borderRadius: 8,
  marginBottom: 20,
  border: '1px solid #fecaca',
};

const loadingBox = {
  background: '#fff',
  padding: 40,
  textAlign: 'center',
  borderRadius: 10,
  color: '#64748b',
};

const emptyBox = {
  background: '#fff',
  padding: 50,
  textAlign: 'center',
  borderRadius: 12,
  color: '#475569',
  border: '1px dashed #cbd5e1',
};

const summaryGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
  gap: 16,
  marginBottom: 24,
};

const tableContainer = {
  background: '#fff',
  borderRadius: 12,
  overflowX: 'auto',
  boxShadow: '0 4px 15px rgba(0,0,0,0.06)',
};

const table = {
  width: '100%',
  borderCollapse: 'collapse',
  minWidth: 900,
};

const th = {
  background: '#1e40af',
  color: '#fff',
  padding: '14px 12px',
  textAlign: 'left',
  fontSize: 14,
  whiteSpace: 'nowrap',
};

const td = {
  padding: '13px 12px',
  borderBottom: '1px solid #e2e8f0',
  color: '#334155',
  fontSize: 14,
  verticalAlign: 'top',
};

const row = { transition: 'background-color 0.2s' };

const statusBadge = {
  display: 'inline-block',
  padding: '5px 12px',
  borderRadius: 20,
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: 0.3,
};

export default MyRequests;