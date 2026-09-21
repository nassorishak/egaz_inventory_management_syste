// import React, { useState, useEffect } from 'react';
// import axios from 'axios';

// const RequestProduct = () => {
//   const [products, setProducts] = useState([]);
//   const [departments, setDepartments] = useState([]);

//   const [productId, setProductId] = useState('');
//   const [departmentId, setDepartmentId] = useState('');
//   const [quantity, setQuantity] = useState('');
//   const [issueDate, setIssueDate] = useState('');
//   const [description, setDescription] = useState('');   // ✅ typed by staff

//   const [loading, setLoading] = useState(false);
//   const [success, setSuccess] = useState('');
//   const [error, setError] = useState('');

//   const userId = localStorage.getItem('userId');

//   // Fetch products and departments
//   useEffect(() => {
//     const load = async () => {
//       try {
//         const [pRes, dRes] = await Promise.all([
//           axios.get('http://localhost:8080/api/products/all'),
//           axios.get('http://localhost:8080/api/departments'),
//         ]);
//         setProducts(Array.isArray(pRes.data) ? pRes.data : []);
//         setDepartments(Array.isArray(dRes.data) ? dRes.data : []);
//       } catch (err) {
//         console.error(err);
//         setError('Failed to load data. Make sure the backend is running.');
//       }
//     };
//     load();
//   }, []);

//   const handleSubmit = async (e) => {
//   e.preventDefault();
//   setError('');
//   setSuccess('');

//   if (!userId) { setError('Please log in again.'); return; }
//   if (!productId) { setError('Please select a product.'); return; }
//   if (!departmentId) { setError('Please select a department.'); return; }
//   if (!quantity || Number(quantity) <= 0) {
//     setError('Please enter a valid quantity.'); return;
//   }
//   if (!issueDate) { setError('Please choose an issue date.'); return; }
//   if (!description.trim()) {
//     setError('Please type the product description.'); return;
//   }

//   try {
//     setLoading(true);

//     await axios.post(
//       `http://localhost:8080/api/product-requests/create?userId=${userId}&productId=${productId}&departmentId=${departmentId}`,
//       {
//         quantity: parseInt(quantity, 10),
//         issueDate: issueDate,
//         description: description.trim(),
//       },
//       { headers: { 'Content-Type': 'application/json' } }
//     );

//     setSuccess('Your request has been sent to the Admin successfully!');
//     setProductId('');
//     setDepartmentId('');
//     setQuantity('');
//     setIssueDate('');
//     setDescription('');
//   } catch (err) {
//     const msg = err.response?.data;
//     setError(typeof msg === 'string' ? msg : 'Failed to submit request.');
//   } finally {
//     setLoading(false);
//   }
// };

//   const selected = products.find(
//     (p) => String(p.productId) === String(productId)
//   );
//   const selectedDept = departments.find(
//     (d) => String(d.departmentId) === String(departmentId)
//   );
//   const stock = selected ? Number(selected.productQuantity) : 0;
//   const exceedsStock = selected && Number(quantity) > stock;

//   return (
//     <>
//       <style>{`
//         * { box-sizing: border-box; }
//         .request-page {
//           min-height: 100vh; background: #f4f7fb;
//           padding: 35px 20px; font-family: Arial, Helvetica, sans-serif;
//         }
//         .request-container { width: 100%; max-width: 750px; margin: 0 auto; }
//         .page-header { margin-bottom: 25px; }
//         .page-header h1 { margin: 0; color: #172033; font-size: 30px; font-weight: 700; }
//         .page-header p { margin: 8px 0 0; color: #718096; font-size: 15px; }

//         .request-card {
//           background: #fff; border-radius: 18px; padding: 32px;
//           border: 1px solid #edf0f5;
//           box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
//         }
//         .card-header {
//           display: flex; align-items: center; gap: 15px;
//           padding-bottom: 22px; margin-bottom: 25px;
//           border-bottom: 1px solid #edf0f5;
//         }
//         .icon-box {
//           width: 54px; height: 54px; border-radius: 14px;
//           background: #e8f0ff;
//           display: flex; align-items: center; justify-content: center;
//           font-size: 25px;
//         }
//         .card-header h2 { margin: 0; color: #172033; font-size: 21px; }
//         .card-header p { margin: 5px 0 0; color: #718096; font-size: 13px; }

//         .form-group { display: flex; flex-direction: column; margin-bottom: 18px; }
//         .form-group label {
//           margin-bottom: 8px; color: #374151;
//           font-size: 14px; font-weight: 600;
//         }
//         .required { color: #ef4444; margin-left: 3px; }

//         .product-input, .product-select, .product-textarea {
//           width: 100%; padding: 0 14px;
//           border: 1px solid #d9dee8; border-radius: 10px;
//           background: #fff; color: #1f2937;
//           font-size: 14px; outline: none;
//           transition: all 0.25s ease; font-family: inherit;
//         }
//         .product-input, .product-select { height: 48px; }
//         .product-textarea {
//           padding: 12px 14px; min-height: 100px; resize: vertical;
//         }
//         .product-input:hover, .product-select:hover, .product-textarea:hover {
//           border-color: #b8c2d1;
//         }
//         .product-input:focus, .product-select:focus, .product-textarea:focus {
//           border-color: #2563eb;
//           box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.10);
//         }
//         .product-input:disabled, .product-select:disabled, .product-textarea:disabled {
//           background: #f3f4f6; cursor: not-allowed;
//         }

//         .warning-box {
//           margin-top: -8px; margin-bottom: 14px;
//           padding: 8px 12px; border-radius: 8px; font-size: 13px;
//           background: #fef3c7; color: #92400e;
//           border: 1px solid #fde68a;
//         }

//         .button-container { margin-top: 8px; display: flex; justify-content: flex-end; }
//         .submit-button {
//           min-width: 190px; height: 50px; padding: 0 25px;
//           border: none; border-radius: 10px;
//           background: #2563eb; color: #fff;
//           font-size: 15px; font-weight: 600; cursor: pointer;
//           transition: all 0.25s ease;
//         }
//         .submit-button:hover:not(:disabled) {
//           background: #1d4ed8; transform: translateY(-1px);
//           box-shadow: 0 7px 18px rgba(37, 99, 235, 0.25);
//         }
//         .submit-button:disabled { background: #93c5fd; cursor: not-allowed; }

//         .message {
//           margin-top: 20px; padding: 13px 15px;
//           border-radius: 9px; font-size: 14px;
//         }
//         .success-message { background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; }
//         .error-message   { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }

//         .form-footer { margin-top: 18px; text-align: center; color: #9ca3af; font-size: 12px; }

//         @media (max-width: 700px) {
//           .request-page { padding: 25px 15px; }
//           .request-card { padding: 22px; }
//           .button-container { justify-content: stretch; }
//           .submit-button { width: 100%; }
//           .page-header h1 { font-size: 25px; }
//         }
//       `}</style>

//       <div className="request-page">
//         <div className="request-container">

//           <div className="page-header">
//             <h1>Request a Product</h1>
//             <p>Fill in the details below and submit your request to the Admin.</p>
//           </div>

//           <div className="request-card">

//             <div className="card-header">
//               <div className="icon-box">📝</div>
//               <div>
//                 <h2>New Product Request</h2>
//                 <p>All fields are required</p>
//               </div>
//             </div>

//             <form onSubmit={handleSubmit}>

//               {/* PRODUCT NAME */}
//               <div className="form-group">
//                 <label htmlFor="product">
//                   Product Name <span className="required">*</span>
//                 </label>
//                 <select
//                   id="product"
//                   className="product-select"
//                   value={productId}
//                   onChange={(e) => setProductId(e.target.value)}
//                   required
//                   disabled={loading}
//                 >
//                   <option value="">-- Select a product --</option>
//                   {products.map((p) => (
//                     <option key={p.productId} value={p.productId}>
//                       {p.productName} (in stock: {p.productQuantity})
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               {/* DESCRIPTION — TYPED BY STAFF */}
//               <div className="form-group">
//                 <label htmlFor="description">
//                   Product Description <span className="required">*</span>
//                 </label>
//                 <textarea
//                   id="description"
//                   className="product-textarea"
//                   placeholder="Type the description of the product you are requesting"
//                   value={description}
//                   onChange={(e) => setDescription(e.target.value)}
//                   required
//                   disabled={loading}
//                   rows={4}
//                 />
//               </div>

//               {/* QUANTITY */}
//               <div className="form-group">
//                 <label htmlFor="quantity">
//                   Quantity <span className="required">*</span>
//                 </label>
//                 <input
//                   id="quantity"
//                   type="number"
//                   min="1"
//                   className="product-input"
//                   placeholder="Enter the quantity you need"
//                   value={quantity}
//                   onChange={(e) => setQuantity(e.target.value)}
//                   required
//                   disabled={loading}
//                 />
//               </div>

//               {exceedsStock && (
//                 <div className="warning-box">
//                   ⚠️ Only {stock} available in stock.
//                 </div>
//               )}

//               {/* DEPARTMENT NAME */}
//               <div className="form-group">
//                 <label htmlFor="department">
//                   Department Name <span className="required">*</span>
//                 </label>
//                 <select
//                   id="department"
//                   className="product-select"
//                   value={departmentId}
//                   onChange={(e) => setDepartmentId(e.target.value)}
//                   required
//                   disabled={loading}
//                 >
//                   <option value="">-- Select your department --</option>
//                   {departments.map((d) => (
//                     <option key={d.departmentId} value={d.departmentId}>
//                       {d.departmentName}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               {/* ISSUE DATE */}
//               <div className="form-group">
//                 <label htmlFor="issueDate">
//                   Issue Date <span className="required">*</span>
//                 </label>
//                 <input
//                   id="issueDate"
//                   type="date"
//                   className="product-input"
//                   value={issueDate}
//                   onChange={(e) => setIssueDate(e.target.value)}
//                   required
//                   disabled={loading}
//                 />
//               </div>

//               {/* SUMMARY */}
//               {selected && selectedDept && (
//                 <div style={{
//                   background: '#f8fafc',
//                   border: '1px solid #e2e8f0',
//                   borderRadius: 10,
//                   padding: 16,
//                   marginBottom: 14,
//                   fontSize: 13,
//                   color: '#334155',
//                 }}>
//                   <strong style={{ display: 'block', marginBottom: 8, color: '#1e293b' }}>
//                     Request Summary
//                   </strong>
//                   <div>Product Name: <b>{selected.productName}</b></div>
//                   <div>Description: <b>{description || '-'}</b></div>
//                   <div>Quantity: <b>{quantity || '-'}</b></div>
//                   <div>Department Name: <b>{selectedDept.departmentName}</b></div>
//                   <div>Issue Date: <b>{issueDate || '-'}</b></div>
//                 </div>
//               )}

//               <div className="button-container">
//                 <button
//                   type="submit"
//                   className="submit-button"
//                   disabled={loading}
//                 >
//                   {loading ? 'Submitting...' : '＋ Submit Request'}
//                 </button>
//               </div>

//             </form>

//             {success && (
//               <div className="message success-message">✓ {success}</div>
//             )}
//             {error && (
//               <div className="message error-message">⚠️ {error}</div>
//             )}

//             <div className="form-footer">
//               Fields marked with <span style={{ color: '#ef4444' }}>*</span> are required.
//             </div>

//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default RequestProduct;
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const RequestProduct = () => {
  const [products, setProducts] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [productId, setProductId] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [description, setDescription] = useState('');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const userId = localStorage.getItem('userId');

  useEffect(() => {
    const load = async () => {
      try {
        const [pRes, dRes] = await Promise.all([
          axios.get('http://localhost:8080/api/products/all'),
          axios.get('http://localhost:8080/api/departments'),
        ]);
        setProducts(Array.isArray(pRes.data) ? pRes.data : []);
        setDepartments(Array.isArray(dRes.data) ? dRes.data : []);
      } catch (err) {
        console.error(err);
        setError('Failed to load data. Make sure the backend is running.');
      }
    };
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!userId) { setError('Please log in again.'); return; }
    if (!productId) { setError('Please select a product.'); return; }
    if (!departmentId) { setError('Please select a department.'); return; }
    if (!quantity || Number(quantity) <= 0) { setError('Please enter a valid quantity.'); return; }
    if (!issueDate) { setError('Please choose an issue date.'); return; }
    if (!description.trim()) { setError('Please type the product description.'); return; }

    try {
      setLoading(true);

      await axios.post(
        `http://localhost:8080/api/product-requests/create?userId=${userId}&productId=${productId}&departmentId=${departmentId}`,
        {
          quantity: parseInt(quantity, 10),
          issueDate: issueDate,
          description: description.trim(),
        },
        { headers: { 'Content-Type': 'application/json' } }
      );

      setSuccess('Your request has been sent to the Admin successfully!');
      setProductId('');
      setDepartmentId('');
      setQuantity('');
      setIssueDate('');
      setDescription('');
    } catch (err) {
      const msg = err.response?.data;
      setError(typeof msg === 'string' ? msg : 'Failed to submit request.');
    } finally {
      setLoading(false);
    }
  };

  const selected = products.find((p) => String(p.productId) === String(productId));
  const selectedDept = departments.find((d) => String(d.departmentId) === String(departmentId));
  const stock = selected ? Number(selected.productQuantity) : 0;
  const exceedsStock = selected && Number(quantity) > stock;

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }

        body, html {
          height: 100%;
          width: 100%;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }

        /* RICH GRADIENT BACKGROUND */
        .request-page {
          min-height: 80vh;
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 16px;
          background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 50%, #f3f4f6 100%);
        }

        /* CARD WITH TOP ACCENT */
        .request-card {
          background: #ffffff;
          border-radius: 14px;
          width: 100%;
          max-width: 1000px;
          max-height: 90vh;
          overflow-y: auto;
          padding: 24px 28px;
          box-shadow: 0 20px 40px -10px rgba(124, 58, 237, 0.15), 0 8px 16px -8px rgba(0, 0, 0, 0.05);
          border: 1px solid #ede9fe;
          border-top: 4px solid #7c3aed;
          scrollbar-width: thin;
          scrollbar-color: #c4b5fd #f3f4f6;
        }

        .request-card::-webkit-scrollbar { width: 6px; }
        .request-card::-webkit-scrollbar-track { background: #f3f4f6; border-radius: 8px; }
        .request-card::-webkit-scrollbar-thumb { background: #c4b5fd; border-radius: 8px; }
        .request-card::-webkit-scrollbar-thumb:hover { background: #a78bfa; }

        /* HEADER */
        .card-header {
          margin-bottom: 18px;
          padding-bottom: 14px;
          border-bottom: 1px solid #f3f4f6;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .header-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: linear-gradient(135deg, #7c3aed, #a78bfa);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          color: #ffffff;
          flex-shrink: 0;
          box-shadow: 0 4px 10px rgba(124, 58, 237, 0.25);
        }

        .card-header h2 {
          margin: 0;
          color: #111827;
          font-size: 18px;
          font-weight: 700;
          letter-spacing: -0.3px;
        }

        .card-header p {
          margin: 3px 0 0;
          color: #6b7280;
          font-size: 12px;
        }

        /* 2-COLUMN HORIZONTAL GRID */
        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }

        .form-group { display: flex; flex-direction: column; }
        .full-width { grid-column: 1 / -1; }

        /* SECTION TITLE WITH PILL BACKGROUND */
        .section-title {
          grid-column: 1 / -1;
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 4px;
          margin-bottom: 0;
          color: #6d28d9;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.6px;
        }

        .section-title span.emoji {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 22px;
          height: 22px;
          background: #ede9fe;
          border-radius: 6px;
          font-size: 12px;
        }

        .section-line { flex: 1; height: 1px; background: #ede9fe; }

        /* LABEL */
        .form-group label {
          margin-bottom: 4px;
          color: #374151;
          font-size: 12px;
          font-weight: 600;
        }

        .required { color: #ef4444; margin-left: 2px; }

        /* INPUTS */
        .product-input, .product-select, .product-textarea {
          width: 100%;
          height: 38px;
          padding: 0 10px;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          background: #fafafa;
          color: #1f2937;
          font-size: 13px;
          outline: none;
          transition: all 0.2s ease;
          font-family: inherit;
        }

        .product-textarea {
          height: auto;
          padding: 8px 10px;
          min-height: 70px;
          resize: vertical;
        }

        .product-input::placeholder, .product-textarea::placeholder { color: #9ca3af; }

        .product-input:hover, .product-select:hover, .product-textarea:hover {
          border-color: #c4b5fd;
          background: #ffffff;
        }

        .product-input:focus, .product-select:focus, .product-textarea:focus {
          border-color: #7c3aed;
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.12);
        }

        .product-input:disabled, .product-select:disabled, .product-textarea:disabled {
          background: #f9fafb; color: #9ca3af; cursor: not-allowed;
        }

        /* WARNING */
        .warning-box {
          grid-column: 1 / -1;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 12px;
          background: #fef3c7;
          color: #92400e;
          border: 1px solid #fde68a;
        }

        /* SUMMARY */
        .summary-box {
          grid-column: 1 / -1;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 14px;
          font-size: 13px;
          color: #334155;
        }

        .summary-box strong.title {
          display: block;
          margin-bottom: 8px;
          color: #1e293b;
          font-size: 13px;
        }

        .summary-box .summary-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px 16px;
        }

        /* BUTTON */
        .button-container {
          grid-column: 1 / -1;
          margin-top: 6px;
          display: flex;
          justify-content: center;
        }

        .submit-button {
          width: 240px;
          height: 44px;
          padding: 0 20px;
          border: none;
          border-radius: 8px;
          background: linear-gradient(135deg, #7c3aed, #6d28d9);
          color: #ffffff;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.25s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          box-shadow: 0 4px 12px rgba(124, 58, 237, 0.25);
        }

        .submit-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(124, 58, 237, 0.35);
        }

        .submit-button:active { transform: translateY(0); }

        .submit-button:disabled {
          background: #c4b5fd;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        /* MESSAGES */
        .message {
          grid-column: 1 / -1;
          margin-top: 14px;
          padding: 10px 12px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .success-message { background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; }
        .error-message { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }

        /* FOOTER */
        .form-footer {
          margin-top: 14px;
          text-align: center;
          color: #9ca3af;
          font-size: 12px;
        }

        /* RESPONSIVE */
        @media (max-width: 768px) {
          .request-card { padding: 20px 16px; max-height: 95vh; }
          .form-grid { grid-template-columns: 1fr; gap: 12px; }
          .full-width { grid-column: auto; }
          .section-title { grid-column: auto; margin-top: 8px; }
          .warning-box, .summary-box, .button-container, .message { grid-column: auto; }
          .summary-box .summary-grid { grid-template-columns: 1fr; }
        }

        @media (max-width: 480px) {
          .request-page { padding: 10px; }
          .request-card { padding: 16px 12px; border-radius: 10px; }
          .card-header h2 { font-size: 16px; }
          .header-icon { width: 34px; height: 34px; font-size: 16px; }
          .product-input, .product-select { height: 36px; font-size: 12px; }
          .submit-button { width: 100%; height: 42px; font-size: 13px; }
        }
      `}</style>

      <div className="request-page">
        <div className="request-card">

          <div className="card-header">
            <div className="header-icon">📝</div>
            <div>
              <h2>New Product Request</h2>
              <p>Fill in the details below and submit your request to the Admin.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-grid">

              {/* SECTION: PRODUCT DETAILS */}
              <div className="section-title">
                <span className="emoji">📦</span> Product Details
                <div className="section-line"></div>
              </div>

              {/* PRODUCT NAME */}
              <div className="form-group">
                <label htmlFor="product">Product Name <span className="required">*</span></label>
                <select
                  id="product"
                  className="product-select"
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  required
                  disabled={loading}
                >
                  <option value="">-- Select a product --</option>
                  {products.map((p) => (
                    <option key={p.productId} value={p.productId}>
                      {p.productName} (in stock: {p.productQuantity})
                    </option>
                  ))}
                </select>
              </div>

              {/* QUANTITY */}
              <div className="form-group">
                <label htmlFor="quantity">Quantity <span className="required">*</span></label>
                <input
                  id="quantity"
                  type="number"
                  min="1"
                  className="product-input"
                  placeholder="Enter the quantity you need"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              {/* DESCRIPTION - Full Width */}
              <div className="form-group full-width">
                <label htmlFor="description">Product Description <span className="required">*</span></label>
                <textarea
                  id="description"
                  className="product-textarea"
                  placeholder="Type the description of the product you are requesting"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  disabled={loading}
                  rows={2}
                />
              </div>

              {/* SECTION: DEPARTMENT & DATE */}
              <div className="section-title">
                <span className="emoji">🏢</span> Department & Date
                <div className="section-line"></div>
              </div>

              {/* DEPARTMENT */}
              <div className="form-group">
                <label htmlFor="department">Department Name <span className="required">*</span></label>
                <select
                  id="department"
                  className="product-select"
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  required
                  disabled={loading}
                >
                  <option value="">-- Select your department --</option>
                  {departments.map((d) => (
                    <option key={d.departmentId} value={d.departmentId}>
                      {d.departmentName}
                    </option>
                  ))}
                </select>
              </div>

              {/* ISSUE DATE */}
              <div className="form-group">
                <label htmlFor="issueDate">Issue Date <span className="required">*</span></label>
                <input
                  id="issueDate"
                  type="date"
                  className="product-input"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              {/* WARNING */}
              {exceedsStock && (
                <div className="warning-box">
                  ⚠️ Only {stock} available in stock.
                </div>
              )}

              {/* SUMMARY */}
              {selected && selectedDept && (
                <div className="summary-box">
                  <strong className="title">📋 Request Summary</strong>
                  <div className="summary-grid">
                    <div>Product: <b>{selected.productName}</b></div>
                    <div>Department: <b>{selectedDept.departmentName}</b></div>
                    <div>Quantity: <b>{quantity || '-'}</b></div>
                    <div>Issue Date: <b>{issueDate || '-'}</b></div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      Description: <b>{description || '-'}</b>
                    </div>
                  </div>
                </div>
              )}

              {/* BUTTON */}
              <div className="button-container">
                <button type="submit" className="submit-button" disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit Request →'}
                </button>
              </div>

              {/* MESSAGES */}
              {success && <div className="message success-message">✓ {success}</div>}
              {error && <div className="message error-message">⚠️ {error}</div>}

            </div>
          </form>

          <div className="form-footer">
            Fields marked with <span style={{ color: '#ef4444' }}>*</span> are required.
          </div>

        </div>
      </div>
    </>
  );
};

export default RequestProduct;