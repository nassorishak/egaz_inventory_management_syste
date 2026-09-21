// import React, { useState, useEffect } from 'react';
// import axios from 'axios';

// const AdminRequestProduct = () => {
//   const [products, setProducts] = useState([]);
//   const [staffList, setStaffList] = useState([]);
//   const [loadingData, setLoadingData] = useState(true);

//   const [requestType, setRequestType] = useState('ADMIN_REQUEST');
//   const [productId, setProductId] = useState('');
//   const [quantity, setQuantity] = useState('');
//   const [staffId, setStaffId] = useState('');
//   const [issueDate, setIssueDate] = useState('');
//   const [description, setDescription] = useState('');

//   const [loading, setLoading] = useState(false);
//   const [success, setSuccess] = useState('');
//   const [error, setError] = useState('');

//   const adminId = Number(localStorage.getItem('userId'));
//   const adminName = localStorage.getItem('userName') || 'Admin';

//   // ============ FETCH PRODUCTS + STAFF FROM DATABASE ============
//   useEffect(() => {
//     const load = async () => {
//       setLoadingData(true);
//       setError('');

//       try {
//         const [pRes, uRes] = await Promise.all([
//         axios.get('http://localhost:8080/api/users'),
//           axios.get('http://localhost:8080/api/users'),
//         ]);

//         // Debug: angalia shape ya data inayokuja
//         console.log('📦 Products from backend:', pRes.data);
//         console.log('👥 Users from backend:', uRes.data);

//         // === PRODUCTS ===
//         // Support: array moja kwa moja, au { data: [...] }, au { content: [...] }
//         const rawProducts =
//           Array.isArray(pRes.data) ? pRes.data :
//           Array.isArray(pRes.data?.data) ? pRes.data.data :
//           Array.isArray(pRes.data?.content) ? pRes.data.content :
//           [];

//         setProducts(rawProducts);

//         // === STAFF ===
//         const rawUsers =
//           Array.isArray(uRes.data) ? uRes.data :
//           Array.isArray(uRes.data?.data) ? uRes.data.data :
//           Array.isArray(uRes.data?.content) ? uRes.data.content :
//           [];

//         const staff = rawUsers.filter((u) => {
//           const role = (u.role || '').toString().trim().toUpperCase();
//           return role === 'STAFF';
//         });

//         console.log('✅ Filtered staff:', staff);
//         setStaffList(staff);

//         if (rawProducts.length === 0) {
//           setError('No products found in the database. Please ask Super Admin to add products.');
//         } else if (staff.length === 0) {
//           setError('No staff users found. Please register staff first.');
//         }
//       } catch (err) {
//         console.error('❌ Fetch error:', err);
//         setError(
//           'Failed to load products/staff from the server. Make sure the backend is running.'
//         );
//       } finally {
//         setLoadingData(false);
//       }
//     };
//     load();
//   }, []);

//   // ============ SUBMIT ============
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
//     setSuccess('');

//     if (!productId) return setError('Please select a product.');
//     if (!quantity || Number(quantity) <= 0) return setError('Enter a valid quantity.');
//     if (requestType === 'ADMIN_REQUEST' && !staffId)
//       return setError('Please select the staff who will receive the product.');
//     if (!description.trim()) return setError('Please type the description/reason.');

//     try {
//       setLoading(true);

//       const selectedProduct = products.find(
//         (p) => String(p.productId ?? p.id) === String(productId)
//       );
//       const selectedStaff = staffList.find(
//         (s) => String(s.userId ?? s.id) === String(staffId)
//       );

//       const payload = {
//         requestType,
//         adminId,
//         adminName,
//         productId: Number(selectedProduct?.productId ?? selectedProduct?.id),
//         productName: selectedProduct?.productName ?? selectedProduct?.name ?? '',
//         quantity: Number(quantity),
//         staffId: staffId ? Number(selectedStaff?.userId ?? selectedStaff?.id) : null,
//         staffName: selectedStaff?.userName ?? selectedStaff?.name ?? null,
//         departmentId:
//           selectedStaff?.department?.departmentId ??
//           selectedStaff?.department?.id ??
//           null,
//         departmentName: selectedStaff?.department?.departmentName ?? null,
//         issueDate: issueDate || null,
//         description: description.trim(),
//       };

//       console.log('📤 Sending payload:', payload);

//       await axios.post('http://localhost:8080/api/admin-requests/create', payload);

//       setSuccess(
//         requestType === 'ADMIN_REQUEST'
//           ? 'Request sent to Super Admin for approval!'
//           : 'Stock request sent to Super Admin!'
//       );

//       setProductId('');
//       setQuantity('');
//       setStaffId('');
//       setIssueDate('');
//       setDescription('');
//     } catch (err) {
//       console.error('❌ Submit error:', err);
//       const msg = err.response?.data;
//       setError(typeof msg === 'string' ? msg : 'Failed to submit request.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const selected = products.find(
//     (p) => String(p.productId ?? p.id) === String(productId)
//   );
//   const stock = selected
//     ? Number(selected.productQuantity ?? selected.quantity ?? 0)
//     : 0;
//   const exceedsStock = selected && Number(quantity) > stock;

//   return (
//     <div style={{ padding: 30, maxWidth: 800, margin: '0 auto' }}>
//       <h1 style={{ color: '#172033' }}>Request to Super Admin</h1>
//       <p style={{ color: '#718096', marginBottom: 25 }}>
//         Choose the type of request and fill in the details.
//       </p>

//       <div
//         style={{
//           background: '#fff',
//           borderRadius: 16,
//           padding: 30,
//           boxShadow: '0 10px 30px rgba(15,23,42,0.08)',
//           border: '1px solid #edf0f5',
//         }}
//       >
//         {/* AINA YA OMBI */}
//         <div style={{ marginBottom: 20 }}>
//           <label style={labelStyle}>Request Type</label>
//           <div style={{ display: 'flex', gap: 12 }}>
//             <button
//               type="button"
//               onClick={() => setRequestType('ADMIN_REQUEST')}
//               style={tabBtn(requestType === 'ADMIN_REQUEST', '#8b5cf6')}
//             >
//               📤 Give Product to Staff
//             </button>
//             <button
//               type="button"
//               onClick={() => setRequestType('STOCK_REQUEST')}
//               style={tabBtn(requestType === 'STOCK_REQUEST', '#16a34a')}
//             >
//               📦 Request New Stock
//             </button>
//           </div>
//         </div>

//         {/* Loading state */}
//         {loadingData && (
//           <div style={{ padding: 20, textAlign: 'center', color: '#64748b' }}>
//             Loading products and staff from the database...
//           </div>
//         )}

//         {!loadingData && (
//           <form onSubmit={handleSubmit}>
//             {/* PRODUCT */}
//             <div style={{ marginBottom: 18 }}>
//               <label style={labelStyle}>Product *</label>
//               <select
//                 value={productId}
//                 onChange={(e) => setProductId(e.target.value)}
//                 required
//                 disabled={loading || products.length === 0}
//                 style={inputStyle}
//               >
//                 <option value="">
//                   {products.length === 0
//                     ? 'No products available'
//                     : '-- Select product --'}
//                 </option>
//                 {products.map((p) => {
//                   const pid = p.productId ?? p.id;
//                   const pname = p.productName ?? p.name;
//                   const pqty = p.productQuantity ?? p.quantity ?? 0;
//                   return (
//                     <option key={pid} value={pid}>
//                       {pname} (stock: {pqty})
//                     </option>
//                   );
//                 })}
//               </select>
//             </div>

//             {/* QUANTITY */}
//             <div style={{ marginBottom: 18 }}>
//               <label style={labelStyle}>Quantity *</label>
//               <input
//                 type="number"
//                 min="1"
//                 value={quantity}
//                 onChange={(e) => setQuantity(e.target.value)}
//                 required
//                 disabled={loading}
//                 style={inputStyle}
//               />
//             </div>

//             {requestType === 'ADMIN_REQUEST' && exceedsStock && (
//               <div
//                 style={{
//                   background: '#fef3c7',
//                   color: '#92400e',
//                   padding: 10,
//                   borderRadius: 8,
//                   marginBottom: 14,
//                   fontSize: 13,
//                 }}
//               >
//                 ⚠️ Only {stock} in stock. If stock is not enough, use{' '}
//                 <b>Request New Stock</b>.
//               </div>
//             )}

//             {/* STAFF — only for ADMIN_REQUEST */}
//             {requestType === 'ADMIN_REQUEST' && (
//               <div style={{ marginBottom: 18 }}>
//                 <label style={labelStyle}>Staff who will receive *</label>
//                 <select
//                   value={staffId}
//                   onChange={(e) => setStaffId(e.target.value)}
//                   required
//                   disabled={loading || staffList.length === 0}
//                   style={inputStyle}
//                 >
//                   <option value="">
//                     {staffList.length === 0
//                       ? 'No staff available'
//                       : '-- Select staff --'}
//                   </option>
//                   {staffList.map((s) => {
//                     const sid = s.userId ?? s.id;
//                     const sname = s.userName ?? s.name;
//                     const dept = s.department?.departmentName;
//                     return (
//                       <option key={sid} value={sid}>
//                         {sname} {dept ? `(${dept})` : ''}
//                       </option>
//                     );
//                   })}
//                 </select>
//               </div>
//             )}

//             {/* ISSUE DATE */}
//             <div style={{ marginBottom: 18 }}>
//               <label style={labelStyle}>Issue Date</label>
//               <input
//                 type="date"
//                 value={issueDate}
//                 onChange={(e) => setIssueDate(e.target.value)}
//                 disabled={loading}
//                 style={inputStyle}
//               />
//             </div>

//             {/* DESCRIPTION */}
//             <div style={{ marginBottom: 18 }}>
//               <label style={labelStyle}>Description / Reason *</label>
//               <textarea
//                 value={description}
//                 onChange={(e) => setDescription(e.target.value)}
//                 required
//                 disabled={loading}
//                 rows={4}
//                 style={{ ...inputStyle, height: 'auto', padding: 12 }}
//                 placeholder={
//                   requestType === 'ADMIN_REQUEST'
//                     ? 'Explain why this product is being given to the staff'
//                     : 'Explain why you need more stock (e.g. stock finished)'
//                 }
//               />
//             </div>

//             <button
//               type="submit"
//               disabled={loading || loadingData || products.length === 0}
//               style={{
//                 width: '100%',
//                 height: 50,
//                 background:
//                   requestType === 'ADMIN_REQUEST' ? '#8b5cf6' : '#16a34a',
//                 color: '#fff',
//                 border: 'none',
//                 borderRadius: 10,
//                 fontSize: 15,
//                 fontWeight: 600,
//                 cursor: 'pointer',
//                 opacity: loading || loadingData ? 0.6 : 1,
//               }}
//             >
//               {loading ? 'Sending...' : 'Send Request →'}
//             </button>
//           </form>
//         )}

//         {success && <div style={successBox}>✓ {success}</div>}
//         {error && <div style={errorBox}>⚠️ {error}</div>}
//       </div>
//     </div>
//   );
// };

// // styles
// const labelStyle = {
//   display: 'block',
//   marginBottom: 8,
//   color: '#374151',
//   fontSize: 14,
//   fontWeight: 600,
// };
// const inputStyle = {
//   width: '100%',
//   height: 48,
//   padding: '0 14px',
//   border: '1px solid #d9dee8',
//   borderRadius: 10,
//   fontSize: 14,
//   background: '#fff',
//   color: '#1f2937',
//   outline: 'none',
//   fontFamily: 'inherit',
//   boxSizing: 'border-box',
// };
// const tabBtn = (active, color) => ({
//   flex: 1,
//   padding: 12,
//   background: active ? color : '#f1f5f9',
//   color: active ? '#fff' : '#334155',
//   border: 'none',
//   borderRadius: 10,
//   cursor: 'pointer',
//   fontSize: 13,
//   fontWeight: 600,
// });
// const successBox = {
//   marginTop: 20,
//   padding: 14,
//   borderRadius: 10,
//   background: '#f0fdf4',
//   color: '#15803d',
//   border: '1px solid #bbf7d0',
// };
// const errorBox = {
//   marginTop: 20,
//   padding: 14,
//   borderRadius: 10,
//   background: '#fef2f2',
//   color: '#dc2626',
//   border: '1px solid #fecaca',
// };

// export default AdminRequestProduct;

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminRequestProduct = () => {
  const [products, setProducts] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  const [requestType, setRequestType] = useState('ADMIN_REQUEST');
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [staffId, setStaffId] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [description, setDescription] = useState('');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const adminId = Number(localStorage.getItem('userId'));
  const adminName = localStorage.getItem('userName') || 'Admin';

  // ============ FETCH PRODUCTS + STAFF FROM DATABASE ============
  useEffect(() => {
    const load = async () => {
      setLoadingData(true);
      setError('');

      try {
        const [pRes, uRes] = await Promise.all([
          axios.get('http://localhost:8080/api/users'),
          axios.get('http://localhost:8080/api/users'),
        ]);

        console.log('📦 Products from backend:', pRes.data);
        console.log('👥 Users from backend:', uRes.data);

        const rawProducts =
          Array.isArray(pRes.data) ? pRes.data :
          Array.isArray(pRes.data?.data) ? pRes.data.data :
          Array.isArray(pRes.data?.content) ? pRes.data.content :
          [];

        setProducts(rawProducts);

        const rawUsers =
          Array.isArray(uRes.data) ? uRes.data :
          Array.isArray(uRes.data?.data) ? uRes.data.data :
          Array.isArray(uRes.data?.content) ? uRes.data.content :
          [];

        const staff = rawUsers.filter((u) => {
          const role = (u.role || '').toString().trim().toUpperCase();
          return role === 'STAFF';
        });

        console.log('✅ Filtered staff:', staff);
        setStaffList(staff);

        if (rawProducts.length === 0) {
          setError('No products found in the database. Please ask Super Admin to add products.');
        } else if (staff.length === 0) {
          setError('No staff users found. Please register staff first.');
        }
      } catch (err) {
        console.error('❌ Fetch error:', err);
        setError('Failed to load products/staff from the server. Make sure the backend is running.');
      } finally {
        setLoadingData(false);
      }
    };
    load();
  }, []);

  // ============ SUBMIT ============
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!productId) return setError('Please select a product.');
    if (!quantity || Number(quantity) <= 0) return setError('Enter a valid quantity.');
    if (requestType === 'ADMIN_REQUEST' && !staffId)
      return setError('Please select the staff who will receive the product.');
    if (!description.trim()) return setError('Please type the description/reason.');

    try {
      setLoading(true);

      const selectedProduct = products.find(
        (p) => String(p.productId ?? p.id) === String(productId)
      );
      const selectedStaff = staffList.find(
        (s) => String(s.userId ?? s.id) === String(staffId)
      );

      const payload = {
        requestType,
        adminId,
        adminName,
        productId: Number(selectedProduct?.productId ?? selectedProduct?.id),
        productName: selectedProduct?.productName ?? selectedProduct?.name ?? '',
        quantity: Number(quantity),
        staffId: staffId ? Number(selectedStaff?.userId ?? selectedStaff?.id) : null,
        staffName: selectedStaff?.userName ?? selectedStaff?.name ?? null,
        departmentId:
          selectedStaff?.department?.departmentId ??
          selectedStaff?.department?.id ??
          null,
        departmentName: selectedStaff?.department?.departmentName ?? null,
        issueDate: issueDate || null,
        description: description.trim(),
      };

      console.log('📤 Sending payload:', payload);

      await axios.post('http://localhost:8080/api/admin-requests/create', payload);

      setSuccess(
        requestType === 'ADMIN_REQUEST'
          ? 'Request sent to Super Admin for approval!'
          : 'Stock request sent to Super Admin!'
      );

      setProductId('');
      setQuantity('');
      setStaffId('');
      setIssueDate('');
      setDescription('');
    } catch (err) {
      console.error('❌ Submit error:', err);
      const msg = err.response?.data;
      setError(typeof msg === 'string' ? msg : 'Failed to submit request.');
    } finally {
      setLoading(false);
    }
  };

  const selected = products.find(
    (p) => String(p.productId ?? p.id) === String(productId)
  );
  const stock = selected
    ? Number(selected.productQuantity ?? selected.quantity ?? 0)
    : 0;
  const exceedsStock = selected && Number(quantity) > stock;

  // Accent colors per request type
  const accent = requestType === 'ADMIN_REQUEST' ? '#8b5cf6' : '#16a34a';
  const accentSoft = requestType === 'ADMIN_REQUEST' ? '#f5f3ff' : '#f0fdf4';

  return (
    <div style={page}>
      <div style={card}>
        {/* HEADER */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={title}>Request to Super Admin</h1>
          <p style={subtitle}>
            Choose the type of request and fill in the details below.
          </p>
        </div>

        {/* REQUEST TYPE TABS */}
        <div style={{ marginBottom: 26 }}>
          <label style={labelStyle}>Request Type</label>
          <div style={tabRow}>
            <button
              type="button"
              onClick={() => setRequestType('ADMIN_REQUEST')}
              style={tabBtn(requestType === 'ADMIN_REQUEST', '#8b5cf6')}
            >
              <span style={{ fontSize: 18 }}>📤</span>
              <span style={tabText}>
                Give Product to Staff
                <small style={tabSub}>Issue item from stock</small>
              </span>
            </button>
            <button
              type="button"
              onClick={() => setRequestType('STOCK_REQUEST')}
              style={tabBtn(requestType === 'STOCK_REQUEST', '#16a34a')}
            >
              <span style={{ fontSize: 18 }}>📦</span>
              <span style={tabText}>
                Request New Stock
                <small style={tabSub}>Ask for more quantity</small>
              </span>
            </button>
          </div>
        </div>

        {/* Loading state */}
        {loadingData && (
          <div style={loadingBox}>
            <div style={spinner} />
            Loading products and staff from the database...
          </div>
        )}

        {!loadingData && (
          <form onSubmit={handleSubmit}>
            {/* ROW 1: PRODUCT + QUANTITY */}
            <div style={row}>
              <div style={col}>
                <label style={labelStyle}>Product *</label>
                <select
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  required
                  disabled={loading || products.length === 0}
                  style={inputStyle}
                >
                  <option value="">
                    {products.length === 0
                      ? 'No products available'
                      : '-- Select product --'}
                  </option>
                  {products.map((p) => {
                    const pid = p.productId ?? p.id;
                    const pname = p.productName ?? p.name;
                    const pqty = p.productQuantity ?? p.quantity ?? 0;
                    return (
                      <option key={pid} value={pid}>
                        {pname} (stock: {pqty})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div style={{ ...col, maxWidth: 200 }}>
                <label style={labelStyle}>Quantity *</label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                  disabled={loading}
                  style={inputStyle}
                  placeholder="0"
                />
              </div>

              {/* STAFF — only for ADMIN_REQUEST, inline on larger screens */}
              {requestType === 'ADMIN_REQUEST' && (
                <div style={col}>
                  <label style={labelStyle}>Staff who will receive *</label>
                  <select
                    value={staffId}
                    onChange={(e) => setStaffId(e.target.value)}
                    required
                    disabled={loading || staffList.length === 0}
                    style={inputStyle}
                  >
                    <option value="">
                      {staffList.length === 0
                        ? 'No staff available'
                        : '-- Select staff --'}
                    </option>
                    {staffList.map((s) => {
                      const sid = s.userId ?? s.id;
                      const sname = s.userName ?? s.name;
                      const dept = s.department?.departmentName;
                      return (
                        <option key={sid} value={sid}>
                          {sname} {dept ? `(${dept})` : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}
            </div>

            {requestType === 'ADMIN_REQUEST' && exceedsStock && (
              <div style={warningBox}>
                ⚠️ Only {stock} in stock. If stock is not enough, use{' '}
                <b>Request New Stock</b>.
              </div>
            )}

            {/* ROW 2: ISSUE DATE + DESCRIPTION */}
            <div style={row}>
              <div style={{ ...col, maxWidth: 220 }}>
                <label style={labelStyle}>Issue Date</label>
                <input
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  disabled={loading}
                  style={inputStyle}
                />
              </div>

              <div style={col}>
                <label style={labelStyle}>Description / Reason *</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  disabled={loading}
                  rows={2}
                  style={{ ...inputStyle, height: 48, padding: '12px 14px', resize: 'vertical' }}
                  placeholder={
                    requestType === 'ADMIN_REQUEST'
                      ? 'Explain why this product is being given to the staff'
                      : 'Explain why you need more stock (e.g. stock finished)'
                  }
                />
              </div>
            </div>

            {/* SUBMIT */}
            <div style={{ marginTop: 28 }}>
              <button
                type="submit"
                disabled={loading || loadingData || products.length === 0}
                style={{
                  ...submitBtn,
                  background: accent,
                  boxShadow: `0 6px 16px ${accent}40`,
                  opacity: loading || loadingData ? 0.6 : 1,
                  cursor: loading || loadingData ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? 'Sending...' : `Send ${requestType === 'ADMIN_REQUEST' ? 'Request' : 'Stock Request'} →`}
              </button>
            </div>
          </form>
        )}

        {success && <div style={successBox}>✓ {success}</div>}
        {error && <div style={errorBox}>⚠️ {error}</div>}
      </div>
    </div>
  );
};

// ================= STYLES =================
const page = {
  padding: '40px 20px',
  maxWidth: 1000,
  margin: '0 auto',
  fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
  background: '#f8fafc',
  minHeight: '100vh',
};

const card = {
  background: '#fff',
  borderRadius: 20,
  padding: 36,
  boxShadow: '0 12px 40px rgba(15,23,42,0.08)',
  border: '1px solid #edf0f5',
};

const title = {
  color: '#0f172a',
  fontSize: 26,
  fontWeight: 700,
  margin: 0,
  letterSpacing: '-0.02em',
};

const subtitle = {
  color: '#64748b',
  fontSize: 14,
  marginTop: 6,
  marginBottom: 0,
};

const labelStyle = {
  display: 'block',
  marginBottom: 8,
  color: '#334155',
  fontSize: 13,
  fontWeight: 600,
  letterSpacing: '0.01em',
};

const inputStyle = {
  width: '100%',
  height: 48,
  padding: '0 14px',
  border: '1.5px solid #e2e8f0',
  borderRadius: 12,
  fontSize: 14,
  background: '#fff',
  color: '#1f2937',
  outline: 'none',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s, box-shadow 0.15s',
};

const tabRow = {
  display: 'flex',
  gap: 14,
  flexWrap: 'wrap',
};

const tabBtn = (active, color) => ({
  flex: 1,
  minWidth: 220,
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: '16px 18px',
  background: active ? color : '#f8fafc',
  color: active ? '#fff' : '#334155',
  border: active ? `2px solid ${color}` : '2px solid #e2e8f0',
  borderRadius: 14,
  cursor: 'pointer',
  textAlign: 'left',
  transition: 'all 0.2s ease',
  fontFamily: 'inherit',
});

const tabText = {
  display: 'flex',
  flexDirection: 'column',
  fontSize: 14,
  fontWeight: 600,
  lineHeight: 1.3,
};

const tabSub = {
  fontSize: 11,
  fontWeight: 400,
  opacity: 0.8,
  marginTop: 2,
};

const row = {
  display: 'flex',
  gap: 20,
  flexWrap: 'wrap',
  marginBottom: 20,
};

const col = {
  flex: 1,
  minWidth: 220,
};

const warningBox = {
  background: '#fffbeb',
  color: '#92400e',
  padding: '12px 16px',
  borderRadius: 10,
  marginBottom: 20,
  fontSize: 13,
  border: '1px solid #fde68a',
};

const submitBtn = {
  width: '100%',
  height: 54,
  color: '#fff',
  border: 'none',
  borderRadius: 12,
  fontSize: 15,
  fontWeight: 700,
  letterSpacing: '0.01em',
  transition: 'transform 0.1s, opacity 0.2s',
};

const loadingBox = {
  padding: 40,
  textAlign: 'center',
  color: '#64748b',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 12,
};

const spinner = {
  width: 28,
  height: 28,
  border: '3px solid #e2e8f0',
  borderTop: '3px solid #8b5cf6',
  borderRadius: '50%',
  animation: 'spin 0.8s linear infinite',
};

const successBox = {
  marginTop: 24,
  padding: 16,
  borderRadius: 12,
  background: '#f0fdf4',
  color: '#15803d',
  border: '1px solid #bbf7d0',
  fontSize: 14,
  fontWeight: 500,
};

const errorBox = {
  marginTop: 24,
  padding: 16,
  borderRadius: 12,
  background: '#fef2f2',
  color: '#dc2626',
  border: '1px solid #fecaca',
  fontSize: 14,
  fontWeight: 500,
};

export default AdminRequestProduct;