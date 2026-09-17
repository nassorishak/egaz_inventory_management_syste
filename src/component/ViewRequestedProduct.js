import React, { useState, useEffect } from 'react';

const ViewRequestedProduct = () => {

  // ==============================
  // API URLs
  // ==============================
  const apiUrl = 'http://localhost:8080/api/products';
  const deptUrl = 'http://localhost:8080/api/departments';

  // ==============================
  // STATES
  // ==============================
  const [requests, setRequests] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ==============================
  // FETCH ON LOAD — wait for BOTH
  // ==============================
  useEffect(() => {
    let cancelled = false;

    const loadAll = async () => {
      setLoading(true);
      setError('');

      // Run both in parallel, wait for both
      const [productsResult, departmentsResult] = await Promise.allSettled([
        fetch(`${apiUrl}/all`).then(async (r) => {
          const text = await r.text();
          if (!r.ok) throw new Error(text || 'Failed to fetch products');
          return text ? JSON.parse(text) : [];
        }),
        fetch(deptUrl).then(async (r) => {
          const text = await r.text();
          if (!r.ok) throw new Error(text || 'Failed to fetch departments');
          return text ? JSON.parse(text) : [];
        })
      ]);

      if (cancelled) return;

      // Products
      if (productsResult.status === 'fulfilled') {
        const data = productsResult.value;
        console.log('✅ Requested products:', data);
        if (Array.isArray(data) && data[0]) {
          console.log('🔍 Sample request keys:', Object.keys(data[0]));
          console.log('🔍 Sample request:', data[0]);
        }
        setRequests(Array.isArray(data) ? data : []);
      } else {
        console.error('❌ Products fetch failed:', productsResult.reason);
        setError(
          productsResult.reason?.message ||
          'Unable to load requested products.'
        );
        setRequests([]);
      }

      // Departments
      if (departmentsResult.status === 'fulfilled') {
        const data = departmentsResult.value;
        console.log('✅ Departments:', data);
        if (Array.isArray(data) && data[0]) {
          console.log('🔍 Sample department keys:', Object.keys(data[0]));
          console.log('🔍 Sample department:', data[0]);
        }
        setDepartments(Array.isArray(data) ? data : []);
      } else {
        console.error('❌ Departments fetch failed:', departmentsResult.reason);
        // Don't override the products error — departments failing is non-fatal
        setDepartments([]);
      }

      setLoading(false);
    };

    loadAll();

    return () => {
      cancelled = true;
    };
  }, []);

  // ==============================
  // HELPERS — read from any shape
  // ==============================
  const readDeptId = (d) =>
    d?.departmentId ??
    d?.deptId ??
    d?.department_id ??
    d?.id ??
    null;

  const readDeptName = (d) =>
    d?.departmentName ??
    d?.deptName ??
    d?.department_name ??
    d?.name ??
    d?.department ??
    '-';

  const readRequestId = (req) =>
    req?.requestId ??
    req?.id ??
    req?.productId ??
    null;

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

  // ==============================
  // RESOLVE departmentName
  // ==============================
  const getDepartmentName = (req) => {
    // 1) Direct name on the request
    const direct = readRequestDeptName(req);
    if (direct) return direct;

    // 2) Look up by id in the departments list
    const id = readRequestDeptId(req);
    if (id == null) return '-';

    const match = departments.find(
      (d) => String(readDeptId(d)) === String(id)
    );

    return match ? readDeptName(match) : '-';
  };

  // ==============================
  // RENDER
  // ==============================
  return (
    <div style={styles.page}>

      <div style={styles.header}>
        <h2 style={styles.title}>Requested Products</h2>
        <p style={styles.subtitle}>Products that have been requested</p>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {loading ? (
        <div style={styles.loading}>Loading requested products...</div>
      ) : (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Product Name</th>
                <th style={styles.th}>Product Description</th>
                <th style={styles.th}>Quantity</th>
                <th style={styles.th}>Department Name</th>
                <th style={styles.th}>Issue Date</th>
              </tr>
            </thead>

            <tbody>
              {requests.length === 0 ? (
                <tr>
                  <td colSpan="6" style={styles.noProducts}>
                    No requested products found.
                  </td>
                </tr>
              ) : (
                requests.map((req, index) => (
                  <tr
                    key={readRequestId(req) ?? `row-${index}`}
                    style={styles.row}
                  >
                    <td style={styles.td}>
                      {readRequestId(req) ?? '-'}
                    </td>

                    <td style={styles.td}>
                      <strong>{req.productName ?? '-'}</strong>
                    </td>

                    <td style={styles.td}>
                      {req.productDescription ?? '-'}
                    </td>

                    <td style={styles.td}>
                      {req.quantity ?? req.productQuantity ?? '-'}
                    </td>

                    <td style={styles.td}>
                      {getDepartmentName(req)}
                    </td>

                    <td style={styles.td}>
                      {req.issueDate ?? '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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
    fontFamily: 'Arial, Helvetica, sans-serif'
  },
  header: { marginBottom: '25px' },
  title: { margin: 0, color: '#1e293b', fontSize: '28px' },
  subtitle: { marginTop: '6px', color: '#64748b', fontSize: '14px' },
  error: {
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
    padding: '12px 15px',
    borderRadius: '8px',
    marginBottom: '20px'
  },
  loading: {
    backgroundColor: 'white',
    padding: '40px',
    textAlign: 'center',
    borderRadius: '10px',
    color: '#64748b'
  },
  tableContainer: {
    backgroundColor: 'white',
    borderRadius: '12px',
    overflowX: 'auto',
    boxShadow: '0 4px 15px rgba(0,0,0,0.06)'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: '900px'
  },
  th: {
    backgroundColor: '#1e40af',
    color: 'white',
    padding: '14px 12px',
    textAlign: 'left',
    fontSize: '14px',
    whiteSpace: 'nowrap'
  },
  td: {
    padding: '13px 12px',
    borderBottom: '1px solid #e2e8f0',
    color: '#334155',
    fontSize: '14px'
  },
  row: { transition: 'background-color 0.2s' },
  noProducts: {
    padding: '35px',
    textAlign: 'center',
    color: '#64748b'
  }
};

export default ViewRequestedProduct;