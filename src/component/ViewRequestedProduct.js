// import React, { useState, useEffect } from 'react';

// const ViewRequestedProduct = () => {

//   // ==============================
//   // API URLs
//   // ==============================
//   const apiUrl = 'http://localhost:8080/api/products';
//   const deptUrl = 'http://localhost:8080/api/departments';

//   // ==============================
//   // STATES
//   // ==============================
//   const [requests, setRequests] = useState([]);
//   const [departments, setDepartments] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');

//   // ==============================
//   // FETCH ON LOAD — wait for BOTH
//   // ==============================
//   useEffect(() => {
//     let cancelled = false;

//     const loadAll = async () => {
//       setLoading(true);
//       setError('');

//       // Run both in parallel, wait for both
//       const [productsResult, departmentsResult] = await Promise.allSettled([
//         fetch(`${apiUrl}/all`).then(async (r) => {
//           const text = await r.text();
//           if (!r.ok) throw new Error(text || 'Failed to fetch products');
//           return text ? JSON.parse(text) : [];
//         }),
//         fetch(deptUrl).then(async (r) => {
//           const text = await r.text();
//           if (!r.ok) throw new Error(text || 'Failed to fetch departments');
//           return text ? JSON.parse(text) : [];
//         })
//       ]);

//       if (cancelled) return;

//       // Products
//       if (productsResult.status === 'fulfilled') {
//         const data = productsResult.value;
//         console.log('✅ Requested products:', data);
//         if (Array.isArray(data) && data[0]) {
//           console.log('🔍 Sample request keys:', Object.keys(data[0]));
//           console.log('🔍 Sample request:', data[0]);
//         }
//         setRequests(Array.isArray(data) ? data : []);
//       } else {
//         console.error('❌ Products fetch failed:', productsResult.reason);
//         setError(
//           productsResult.reason?.message ||
//           'Unable to load requested products.'
//         );
//         setRequests([]);
//       }

//       // Departments
//       if (departmentsResult.status === 'fulfilled') {
//         const data = departmentsResult.value;
//         console.log('✅ Departments:', data);
//         if (Array.isArray(data) && data[0]) {
//           console.log('🔍 Sample department keys:', Object.keys(data[0]));
//           console.log('🔍 Sample department:', data[0]);
//         }
//         setDepartments(Array.isArray(data) ? data : []);
//       } else {
//         console.error('❌ Departments fetch failed:', departmentsResult.reason);
//         // Don't override the products error — departments failing is non-fatal
//         setDepartments([]);
//       }

//       setLoading(false);
//     };

//     loadAll();

//     return () => {
//       cancelled = true;
//     };
//   }, []);

//   // ==============================
//   // HELPERS — read from any shape
//   // ==============================
//   const readDeptId = (d) =>
//     d?.departmentId ??
//     d?.deptId ??
//     d?.department_id ??
//     d?.id ??
//     null;

//   const readDeptName = (d) =>
//     d?.departmentName ??
//     d?.deptName ??
//     d?.department_name ??
//     d?.name ??
//     d?.department ??
//     '-';

//   const readRequestId = (req) =>
//     req?.requestId ??
//     req?.id ??
//     req?.productId ??
//     null;

//   const readRequestDeptId = (req) =>
//     req?.departmentId ??
//     req?.deptId ??
//     req?.department_id ??
//     req?.department?.departmentId ??
//     req?.department?.deptId ??
//     req?.department?.id ??
//     null;

//   const readRequestDeptName = (req) =>
//     req?.departmentName ??
//     req?.deptName ??
//     req?.department_name ??
//     req?.department?.departmentName ??
//     req?.department?.deptName ??
//     req?.department?.name ??
//     null;

//   // ==============================
//   // RESOLVE departmentName
//   // ==============================
//   const getDepartmentName = (req) => {
//     // 1) Direct name on the request
//     const direct = readRequestDeptName(req);
//     if (direct) return direct;

//     // 2) Look up by id in the departments list
//     const id = readRequestDeptId(req);
//     if (id == null) return '-';

//     const match = departments.find(
//       (d) => String(readDeptId(d)) === String(id)
//     );

//     return match ? readDeptName(match) : '-';
//   };

//   // ==============================
//   // RENDER
//   // ==============================
//   return (
//     <div style={styles.page}>

//       <div style={styles.header}>
//         <h2 style={styles.title}>Requested Products</h2>
//         <p style={styles.subtitle}>Products that have been requested</p>
//       </div>

//       {error && <div style={styles.error}>{error}</div>}

//       {loading ? (
//         <div style={styles.loading}>Loading requested products...</div>
//       ) : (
//         <div style={styles.tableContainer}>
//           <table style={styles.table}>
//             <thead>
//               <tr>
//                 <th style={styles.th}>ID</th>
//                 <th style={styles.th}>Product Name</th>
//                 <th style={styles.th}>Product Description</th>
//                 <th style={styles.th}>Quantity</th>
//                 <th style={styles.th}>Department Name</th>
//                 <th style={styles.th}>Issue Date</th>
//               </tr>
//             </thead>

//             <tbody>
//               {requests.length === 0 ? (
//                 <tr>
//                   <td colSpan="6" style={styles.noProducts}>
//                     No requested products found.
//                   </td>
//                 </tr>
//               ) : (
//                 requests.map((req, index) => (
//                   <tr
//                     key={readRequestId(req) ?? `row-${index}`}
//                     style={styles.row}
//                   >
//                     <td style={styles.td}>
//                       {readRequestId(req) ?? '-'}
//                     </td>

//                     <td style={styles.td}>
//                       <strong>{req.productName ?? '-'}</strong>
//                     </td>

//                     <td style={styles.td}>
//                       {req.productDescription ?? '-'}
//                     </td>

//                     <td style={styles.td}>
//                       {req.quantity ?? req.productQuantity ?? '-'}
//                     </td>

//                     <td style={styles.td}>
//                       {getDepartmentName(req)}
//                     </td>

//                     <td style={styles.td}>
//                       {req.issueDate ?? '-'}
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );
// };

// // ======================================================
// // STYLES
// // ======================================================
// const styles = {
//   page: {
//     padding: '30px',
//     backgroundColor: '#f8fafc',
//     minHeight: '100vh',
//     fontFamily: 'Arial, Helvetica, sans-serif'
//   },
//   header: { marginBottom: '25px' },
//   title: { margin: 0, color: '#1e293b', fontSize: '28px' },
//   subtitle: { marginTop: '6px', color: '#64748b', fontSize: '14px' },
//   error: {
//     backgroundColor: '#fee2e2',
//     color: '#b91c1c',
//     padding: '12px 15px',
//     borderRadius: '8px',
//     marginBottom: '20px'
//   },
//   loading: {
//     backgroundColor: 'white',
//     padding: '40px',
//     textAlign: 'center',
//     borderRadius: '10px',
//     color: '#64748b'
//   },
//   tableContainer: {
//     backgroundColor: 'white',
//     borderRadius: '12px',
//     overflowX: 'auto',
//     boxShadow: '0 4px 15px rgba(0,0,0,0.06)'
//   },
//   table: {
//     width: '100%',
//     borderCollapse: 'collapse',
//     minWidth: '900px'
//   },
//   th: {
//     backgroundColor: '#1e40af',
//     color: 'white',
//     padding: '14px 12px',
//     textAlign: 'left',
//     fontSize: '14px',
//     whiteSpace: 'nowrap'
//   },
//   td: {
//     padding: '13px 12px',
//     borderBottom: '1px solid #e2e8f0',
//     color: '#334155',
//     fontSize: '14px'
//   },
//   row: { transition: 'background-color 0.2s' },
//   noProducts: {
//     padding: '35px',
//     textAlign: 'center',
//     color: '#64748b'
//   }
// };

// export default ViewRequestedProduct;

import React, { useState, useEffect } from 'react';

const ViewRequestedProduct = () => {

  // ==============================
  // API URLs
  // ==============================
  const apiUrl = 'http://localhost:8080/api/products';
  const deptUrl = 'http://localhost:8080/api/departments';
  const requestsUrl = 'http://localhost:8080/api/product-requests/all';

  // ==============================
  // STATES
  // ==============================
  const [requests, setRequests] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');

  const REFRESH_INTERVAL = 15000;

  // ==============================
  // FETCH ON LOAD — wait for BOTH
  // ==============================
  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ==============================
  // AUTO-REFRESH (so cards update when status changes on backend)
  // ==============================
  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(() => loadAll(true), REFRESH_INTERVAL);
    return () => clearInterval(id);
  }, [autoRefresh]);

  const loadAll = async (silent = false) => {
    if (!silent) setLoading(true);
    setError('');

    const [productsResult, departmentsResult, requestsResult] = await Promise.allSettled([
      fetch(`${apiUrl}/all`).then(async (r) => {
        const text = await r.text();
        if (!r.ok) throw new Error(text || 'Failed to fetch products');
        return text ? JSON.parse(text) : [];
      }),
      fetch(deptUrl).then(async (r) => {
        const text = await r.text();
        if (!r.ok) throw new Error(text || 'Failed to fetch departments');
        return text ? JSON.parse(text) : [];
      }),
      fetch(requestsUrl).then(async (r) => {
        const text = await r.text();
        if (!r.ok) throw new Error(text || 'Failed to fetch requests');
        return text ? JSON.parse(text) : [];
      })
    ]);

    // Requested products (either source works — we merge them)
    let requested = [];
    if (productsResult.status === 'fulfilled') {
      requested = Array.isArray(productsResult.value) ? productsResult.value : [];
    } else {
      console.error('❌ Products fetch failed:', productsResult.reason);
      setError(productsResult.reason?.message || 'Unable to load requested products.');
    }

    // Product requests (carry the status field)
    let reqList = [];
    if (requestsResult.status === 'fulfilled') {
      reqList = Array.isArray(requestsResult.value) ? requestsResult.value : [];
    } else {
      console.error('❌ Requests fetch failed:', requestsResult.reason);
    }

    // Departments
    if (departmentsResult.status === 'fulfilled') {
      setDepartments(Array.isArray(departmentsResult.value) ? departmentsResult.value : []);
    } else {
      console.error('❌ Departments fetch failed:', departmentsResult.reason);
      setDepartments([]);
    }

    // Merge: products list × requests list (by productId)
    const reqByProduct = new Map();
    reqList.forEach((r) => {
      const pid = r?.product?.productId ?? r?.productId;
      if (pid != null) reqByProduct.set(String(pid), r);
    });

    const merged = requested.map((prod) => {
      const pid = prod.productId ?? prod.id;
      const match = pid != null ? reqByProduct.get(String(pid)) : null;

      return {
        ...prod,
        // attach request data if any
        status: match?.status ?? prod.status ?? 'AVAILABLE',
        quantity: match?.quantity ?? prod.quantity ?? prod.productQuantity,
        departmentName:
          match?.departmentName ??
          match?.department?.departmentName ??
          prod.departmentName ??
          prod.department?.departmentName,
        departmentId:
          match?.departmentId ??
          match?.department?.departmentId ??
          prod.departmentId ??
          prod.department?.departmentId,
        issueDate: match?.issueDate ?? prod.issueDate,
        description: match?.description ?? prod.productDescription,
      };
    });

    // If requests endpoint has entries that don't match a product row, keep them too
    reqList.forEach((r) => {
      const pid = r?.product?.productId ?? r?.productId;
      const already = merged.some((m) => String(m.productId ?? m.id) === String(pid));
      if (!already) {
        merged.push({
          productId: pid,
          productName: r?.product?.productName ?? r?.productName,
          productDescription: r?.productDescription ?? r?.description,
          quantity: r?.quantity,
          status: r?.status ?? 'PENDING',
          departmentName:
            r?.departmentName ?? r?.department?.departmentName,
          departmentId:
            r?.departmentId ?? r?.department?.departmentId,
          issueDate: r?.issueDate,
          description: r?.description,
        });
      }
    });

    setRequests(merged);
    setLastUpdated(new Date());
    setLoading(false);
  };

  // ==============================
  // HELPERS — read from any shape
  // ==============================
  const readDeptId = (d) =>
    d?.departmentId ?? d?.deptId ?? d?.department_id ?? d?.id ?? null;

  const readDeptName = (d) =>
    d?.departmentName ?? d?.deptName ?? d?.department_name ?? d?.name ?? d?.department ?? '-';

  const readRequestId = (req) =>
    req?.requestId ?? req?.id ?? req?.productId ?? null;

  const readRequestDeptId = (req) =>
    req?.departmentId ??
    req?.deptId ??
    req?.department_id ??
    req?.department?.departmentId ??
    req?.department?.deptId ??
    req?.department?.id ??
    null;

  const readRequestDeptName = (req) =>
    req?.departmentName ??
    req?.deptName ??
    req?.department_name ??
    req?.department?.departmentName ??
    req?.department?.deptName ??
    req?.department?.name ??
    null;

  const getDepartmentName = (req) => {
    const direct = readRequestDeptName(req);
    if (direct) return direct;

    const id = readRequestDeptId(req);
    if (id == null) return '-';

    const match = departments.find((d) => String(readDeptId(d)) === String(id));
    return match ? readDeptName(match) : '-';
  };

  // ✅ Normalize status so cards always work
  const statusOf = (req) =>
    (req?.status || 'PENDING').toString().trim().toUpperCase();

  // ==============================
  // STATUS CONFIG — one place to control everything
  // ==============================
  const STATUS_CONFIG = {
    PENDING:   { label: 'Pending',   color: '#f59e0b', bg: '#fffbeb', border: '#fde68a', icon: '⏳' },
    CHECKED:   { label: 'Checked',   color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe', icon: '🔍' },
    APPROVED:  { label: 'Approved',  color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', icon: '✅' },
    REJECTED:  { label: 'Rejected',  color: '#dc2626', bg: '#fef2f2', border: '#fecaca', icon: '❌' },
    COMPLETED: { label: 'Completed', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', icon: '🎁' },
    AVAILABLE: { label: 'Available', color: '#0891b2', bg: '#ecfeff', border: '#a5f3fc', icon: '📦' },
  };

  const getStatusConfig = (status) =>
    STATUS_CONFIG[status] || {
      label: status,
      color: '#475569',
      bg: '#f1f5f9',
      border: '#cbd5e1',
      icon: '•',
    };

  // ==============================
  // GROUP requests by status
  // ==============================
  const statusOrder = ['PENDING', 'CHECKED', 'APPROVED', 'REJECTED', 'COMPLETED', 'AVAILABLE'];

  const grouped = requests.reduce((acc, req) => {
    const s = statusOf(req);
    if (!acc[s]) acc[s] = [];
    acc[s].push(req);
    return acc;
  }, {});

  // Sort groups by predefined order
  const orderedStatuses = Object.keys(grouped).sort((a, b) => {
    const ia = statusOrder.indexOf(a);
    const ib = statusOrder.indexOf(b);
    return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
  });

  // Apply status filter
  const visibleStatuses =
    statusFilter === 'ALL' ? orderedStatuses : orderedStatuses.filter((s) => s === statusFilter);

  // ==============================
  // RENDER
  // ==============================
  return (
    <div style={styles.page}>

      {/* HEADER */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Requested Products</h2>
          <p style={styles.subtitle}>
            Products grouped by status — updates automatically every 15s.
          </p>
        </div>
        <div style={styles.headerRight}>
          <label style={styles.toggleLabel}>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            Auto-refresh
          </label>
          <button
            type="button"
            style={styles.refreshBtn}
            onClick={() => loadAll()}
          >
            ⟳ Refresh
          </button>
          {lastUpdated && (
            <span style={styles.lastUpdated}>
              {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {/* STATUS FILTER BUTTONS */}
      <div style={styles.filterRow}>
        <button
          type="button"
          onClick={() => setStatusFilter('ALL')}
          style={{
            ...styles.filterBtn,
            ...(statusFilter === 'ALL' ? styles.filterBtnActive : {}),
          }}
        >
          All ({requests.length})
        </button>

        {statusOrder.map((s) => {
          const count = grouped[s]?.length || 0;
          if (count === 0) return null;
          const cfg = getStatusConfig(s);
          return (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              style={{
                ...styles.filterBtn,
                ...(statusFilter === s
                  ? {
                      backgroundColor: cfg.color,
                      color: '#fff',
                      borderColor: cfg.color,
                    }
                  : {
                      backgroundColor: cfg.bg,
                      color: cfg.color,
                      borderColor: cfg.border,
                    }),
              }}
            >
              {cfg.icon} {cfg.label} ({count})
            </button>
          );
        })}
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {loading ? (
        <div style={styles.loading}>Loading requested products...</div>
      ) : requests.length === 0 ? (
        <div style={styles.emptyBox}>No requested products found.</div>
      ) : (
        <div style={styles.groupsContainer}>
          {visibleStatuses.map((status) => {
            const items = grouped[status];
            const cfg = getStatusConfig(status);

            return (
              <div
                key={status}
                style={{
                  ...styles.statusCard,
                  borderColor: cfg.border,
                  backgroundColor: '#fff',
                }}
              >
                {/* CARD HEADER */}
                <div
                  style={{
                    ...styles.cardHeader,
                    backgroundColor: cfg.bg,
                    borderBottom: `1px solid ${cfg.border}`,
                  }}
                >
                  <div style={styles.cardHeaderLeft}>
                    <span
                      style={{
                        ...styles.statusDot,
                        backgroundColor: cfg.color,
                      }}
                    />
                    <h3 style={{ ...styles.cardTitle, color: cfg.color }}>
                      {cfg.icon} {cfg.label}
                    </h3>
                    <span style={{ ...styles.badge, backgroundColor: cfg.color }}>
                      {items.length}
                    </span>
                  </div>
                </div>

                {/* CARD BODY — mini table */}
                <div style={{ overflowX: 'auto' }}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>ID</th>
                        <th style={styles.th}>Product Name</th>
                        <th style={styles.th}>Description</th>
                        <th style={styles.th}>Qty</th>
                        <th style={styles.th}>Department</th>
                        <th style={styles.th}>Issue Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((req, index) => (
                        <tr
                          key={readRequestId(req) ?? `row-${status}-${index}`}
                          style={styles.row}
                        >
                          <td style={styles.td}>{readRequestId(req) ?? '-'}</td>
                          <td style={styles.td}>
                            <strong>{req.productName ?? '-'}</strong>
                          </td>
                          <td style={styles.td}>{req.productDescription ?? '-'}</td>
                          <td style={styles.td}>
                            {req.quantity ?? req.productQuantity ?? '-'}
                          </td>
                          <td style={styles.td}>{getDepartmentName(req)}</td>
                          <td style={styles.td}>{req.issueDate ?? '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ======================================================
// STYLES
// ======================================================
const styles = {
  page: {
    padding: '30px',
    backgroundColor: '#f8fafc',
    minHeight: '100vh',
    fontFamily: 'Arial, Helvetica, sans-serif',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '16px',
    marginBottom: '18px',
    flexWrap: 'wrap',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
  },
  toggleLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    color: '#334155',
  },
  refreshBtn: {
    padding: '8px 16px',
    backgroundColor: '#fff',
    color: '#2563eb',
    border: '1px solid #c7d2fe',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  lastUpdated: {
    fontSize: '12px',
    color: '#64748b',
  },
  title: { margin: 0, color: '#1e293b', fontSize: '28px' },
  subtitle: { marginTop: '6px', color: '#64748b', fontSize: '14px' },

  filterRow: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    marginBottom: '20px',
  },
  filterBtn: {
    padding: '8px 14px',
    border: '1px solid #cbd5e1',
    borderRadius: '20px',
    backgroundColor: '#fff',
    color: '#334155',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  filterBtnActive: {
    backgroundColor: '#1e293b',
    color: '#fff',
    borderColor: '#1e293b',
  },

  error: {
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
    padding: '12px 15px',
    borderRadius: '8px',
    marginBottom: '20px',
  },
  loading: {
    backgroundColor: 'white',
    padding: '40px',
    textAlign: 'center',
    borderRadius: '10px',
    color: '#64748b',
  },
  emptyBox: {
    backgroundColor: '#fff',
    padding: '40px',
    textAlign: 'center',
    color: '#64748b',
    borderRadius: '12px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.06)',
  },

  groupsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '22px',
  },
  statusCard: {
    border: '1px solid #e2e8f0',
    borderRadius: '14px',
    overflow: 'hidden',
    boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
  },
  cardHeader: {
    padding: '14px 18px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  statusDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    display: 'inline-block',
  },
  cardTitle: {
    margin: 0,
    fontSize: '16px',
    fontWeight: 700,
  },
  badge: {
    display: 'inline-block',
    padding: '3px 10px',
    borderRadius: '12px',
    color: '#fff',
    fontSize: '12px',
    fontWeight: 700,
  },

  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: '820px',
  },
  th: {
    backgroundColor: '#f1f5f9',
    color: '#334155',
    padding: '12px',
    textAlign: 'left',
    fontSize: '12.5px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    whiteSpace: 'nowrap',
  },
  td: {
    padding: '12px',
    borderBottom: '1px solid #e2e8f0',
    color: '#334155',
    fontSize: '13.5px',
    verticalAlign: 'top',
  },
  row: { transition: 'background-color 0.2s' },
};

export default ViewRequestedProduct;