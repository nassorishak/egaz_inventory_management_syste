
// import React, { useState, useEffect } from 'react';
// import axios from 'axios';

// const AddProduct = () => {
//   const [productName, setProductName] = useState('');
//   const [productQuantity, setProductQuantity] = useState('');
//   const [receiptDate, setReceiptDate] = useState('');
//   const [issueDate, setIssueDate] = useState('');
//   const [price, setPrice] = useState('');
//   const [supplierName, setSupplierName] = useState('');
//   const [productDescription, setProductDescription] = useState('');

//   const [departmentId, setDepartmentId] = useState('');
//   const [departments, setDepartments] = useState([]);

//   const [loading, setLoading] = useState(false);
//   const [departmentLoading, setDepartmentLoading] = useState(true);

//   const [success, setSuccess] = useState('');
//   const [error, setError] = useState('');

//   useEffect(() => {
//     const fetchDepartments = async () => {
//       try {
//         setDepartmentLoading(true);
//         const response = await axios.get('http://localhost:8080/api/departments');
//         setDepartments(Array.isArray(response.data) ? response.data : []);
//       } catch (error) {
//         console.error('Error fetching departments:', error.response?.data || error.message);
//         setError('Failed to load departments.');
//       } finally {
//         setDepartmentLoading(false);
//       }
//     };
//     fetchDepartments();
//   }, []);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setSuccess('');
//     setError('');

//     if (!departmentId) { setError('Please select a department.'); setLoading(false); return; }
//     if (!productName.trim()) { setError('Product name is required.'); setLoading(false); return; }
//     if (!productQuantity.trim()) { setError('Product quantity is required.'); setLoading(false); return; }
//     if (!price || isNaN(parseInt(price, 10))) { setError('Product price is required.'); setLoading(false); return; }
//     if (!receiptDate) { setError('Receipt date is required.'); setLoading(false); return; }
//     if (!issueDate) { setError('Issue date is required.'); setLoading(false); return; }
//     if (!supplierName.trim()) { setError('Supplier name is required.'); setLoading(false); return; }
//     if (!productDescription.trim()) { setError('Product description is required.'); setLoading(false); return; }

//     const userId = localStorage.getItem('userId');
//     if (!userId) { setError('No logged-in user was found. Please login again.'); setLoading(false); return; }

//     const productData = {
//       productName: productName.trim(),
//       productQuantity: productQuantity.trim(),
//       receiptDate: receiptDate,
//       issueDate: issueDate,
//       price: parseInt(price, 10),
//       supplierName: supplierName.trim(),
//       productDescription: productDescription.trim(),
//       departmentId: parseInt(departmentId, 10)
//     };

//     try {
//       await axios.post(
//         `http://localhost:8080/api/products/create?userId=${encodeURIComponent(userId)}`,
//         productData,
//         { headers: { 'Content-Type': 'application/json' } }
//       );

//       setSuccess('Product added successfully!');
//       setProductName(''); setProductQuantity(''); setReceiptDate('');
//       setIssueDate(''); setPrice(''); setSupplierName('');
//       setDepartmentId(''); setProductDescription('');
//     } catch (error) {
//       console.error('Error adding product:', error.response?.data || error.message);
//       const backendError = error.response?.data;
//       if (typeof backendError === 'string') { setError(backendError); }
//       else if (backendError?.message) { setError(backendError.message); }
//       else { setError('Failed to add product. Please check the entered information.'); }
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <>
//       <style>
//         {`
//           * { box-sizing: border-box; margin: 0; padding: 0; }

//           body, html {
//             height: 100%;
//             width: 100%;
//             background-color: #f3f4f6;
//             font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
//           }

//           .product-page {
//             min-height: 100vh;
//             width: 100%;
//             display: flex;
//             justify-content: center;
//             align-items: center;
//             padding: 16px;
//             background: #f3f4f6;
//           }

//           /* COMPACT CARD */
//           .product-card {
//             background: #ffffff;
//             border-radius: 12px;
//             width: 100%;
//             max-width: 1100px;
//             max-height: 88vh;
//             overflow-y: auto;
//             padding: 24px 28px;
//             box-shadow: 0 10px 20px -5px rgba(0, 0, 0, 0.05);
//             border: 1px solid #e5e7eb;
//             scrollbar-width: thin;
//             scrollbar-color: #c4b5fd #f3f4f6;
//           }

//           .product-card::-webkit-scrollbar { width: 6px; }
//           .product-card::-webkit-scrollbar-track { background: #f3f4f6; border-radius: 8px; }
//           .product-card::-webkit-scrollbar-thumb { background: #c4b5fd; border-radius: 8px; }
//           .product-card::-webkit-scrollbar-thumb:hover { background: #a78bfa; }

//           /* HEADER - Smaller */
//           .card-header {
//             margin-bottom: 18px;
//             padding-bottom: 14px;
//             border-bottom: 1px solid #e5e7eb;
//           }

//           .card-header h2 {
//             margin: 0;
//             color: #111827;
//             font-size: 18px;
//             font-weight: 700;
//           }

//           .card-header p {
//             margin: 4px 0 0;
//             color: #6b7280;
//             font-size: 12px;
//           }

//           /* 3-COLUMN GRID - Tighter */
//           .form-grid {
//             display: grid;
//             grid-template-columns: 1fr 1fr 1fr;
//             gap: 14px;
//           }

//           .form-group { display: flex; flex-direction: column; }
//           .full-width { grid-column: 1 / -1; }

//           /* SECTION TITLE - Compact */
//           .section-title {
//             grid-column: 1 / -1;
//             display: flex;
//             align-items: center;
//             gap: 10px;
//             margin-top: 4px;
//             margin-bottom: 0;
//             color: #7c3aed;
//             font-size: 11px;
//             font-weight: 700;
//             text-transform: uppercase;
//             letter-spacing: 0.5px;
//           }

//           .section-line { flex: 1; height: 1px; background: #e5e7eb; }

//           /* LABEL - Smaller */
//           .form-group label {
//             margin-bottom: 4px;
//             color: #374151;
//             font-size: 12px;
//             font-weight: 600;
//           }

//           .required { color: #ef4444; margin-left: 2px; }

//           /* INPUTS - Shorter */
//           .product-input, .department-select {
//             width: 100%;
//             height: 38px;
//             padding: 0 10px;
//             border: 1px solid #d1d5db;
//             border-radius: 6px;
//             background: #ffffff;
//             color: #1f2937;
//             font-size: 13px;
//             outline: none;
//             transition: all 0.2s ease;
//             font-family: inherit;
//           }

//           .product-input::placeholder { color: #9ca3af; }
//           .product-input:hover, .department-select:hover { border-color: #9ca3af; }
//           .product-input:focus, .department-select:focus {
//             border-color: #7c3aed;
//             box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
//           }
//           .product-input:disabled, .department-select:disabled {
//             background: #f9fafb; color: #9ca3af; cursor: not-allowed;
//           }

//           /* TEXTAREA - Compact */
//           textarea.product-input {
//             height: auto;
//             padding: 8px 10px;
//             resize: vertical;
//             min-height: 60px;
//           }

//           /* BUTTON - Shorter */
//           .button-container {
//             margin-top: 18px;
//           }

//           .add-button {
//             width: 20%;
//             height: 44px;
//             padding: 0 20px;
//             margin-left:390px;
//             border: none;
//             border-radius: 6px;
//             background: #7c3aed;
//             color: #ffffff;
//             font-size: 14px;
//             font-weight: 600;
//             cursor: pointer;
//             transition: all 0.2s ease;
//             display: flex;
//             align-items: center;
//             justify-content: center;
//             gap: 6px;
//           }

//           .add-button:hover {
//             background: #6d28d9;
//             transform: translateY(-1px);
//             box-shadow: 0 4px 10px rgba(124, 58, 237, 0.25);
//           }
//           .add-button:active { transform: translateY(0); }
//           .add-button:disabled {
//             background: #c4b5fd; cursor: not-allowed; transform: none; box-shadow: none;
//           }

//           /* MESSAGES - Compact */
//           .message {
//             margin-top: 14px;
//             padding: 10px 12px;
//             border-radius: 6px;
//             font-size: 13px;
//             font-weight: 500;
//             display: flex;
//             align-items: center;
//             gap: 6px;
//           }

//           .success-message { background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; }
//           .error-message { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }

//           /* RESPONSIVE */
//           @media (max-width: 1024px) {
//             .form-grid { grid-template-columns: 1fr 1fr; }
//           }

//           @media (max-width: 768px) {
//             .product-card { padding: 20px 16px; max-height: 95vh; }
//             .form-grid { grid-template-columns: 1fr; gap: 12px; }
//             .full-width { grid-column: auto; }
//             .section-title { grid-column: auto; margin-top: 8px; }
//           }

//           @media (max-width: 480px) {
//             .product-page { padding: 10px; }
//             .product-card { padding: 16px 12px; border-radius: 10px; }
//             .card-header h2 { font-size: 16px; }
//             .product-input, .department-select { height: 36px; font-size: 12px; }
//             .add-button { height: 42px; font-size: 13px; }
//           }
//         `}
//       </style>

//       <div className="product-page">
//         <div className="product-card">
          
//           <div className="card-header">
//             <h2>Add New Product</h2>
//             <p>Fill in the details below to add a product to the inventory.</p>
//           </div>

//           <form onSubmit={handleSubmit}>
//             <div className="form-grid">

//               <div className="section-title">
//                 📦 Product Information
//                 <div className="section-line"></div>
//               </div>

//               {/* PRODUCT NAME - Full Width */}
//               <div className="form-group full-width">
//                 <label htmlFor="productName">Product Name <span className="required">*</span></label>
//                 <input id="productName" type="text" className="product-input" placeholder="Enter product name"
//                   value={productName} onChange={(e) => setProductName(e.target.value)} required disabled={loading} />
//               </div>

//               {/* QUANTITY - Col 1 */}
//               <div className="form-group">
//                 <label htmlFor="quantity">Quantity <span className="required">*</span></label>
//                 <input id="quantity" type="number" min="1" className="product-input" placeholder="0"
//                   value={productQuantity} onChange={(e) => setProductQuantity(e.target.value)} required disabled={loading} />
//               </div>

//               {/* PRICE - Col 2 */}
//               <div className="form-group">
//                 <label htmlFor="price">Price <span className="required">*</span></label>
//                 <input id="price" type="number" min="0" className="product-input" placeholder="Enter price"
//                   value={price} onChange={(e) => setPrice(e.target.value)} required disabled={loading} />
//               </div>

//               {/* Empty Col 3 */}
//               <div className="form-group" style={{ visibility: 'hidden' }}></div>

//               {/* DESCRIPTION - Full Width */}
//               <div className="form-group full-width">
//                 <label htmlFor="productDescription">Description / Reason <span className="required">*</span></label>
//                 <textarea id="productDescription" className="product-input" placeholder="Explain why this product is being added"
//                   value={productDescription} onChange={(e) => setProductDescription(e.target.value)} required disabled={loading} rows={2} />
//               </div>

//               <div className="section-title">
//                 📅 Product Dates
//                 <div className="section-line"></div>
//               </div>

//               {/* RECEIPT DATE - Col 1 */}
//               <div className="form-group">
//                 <label htmlFor="receiptDate">Receipt Date <span className="required">*</span></label>
//                 <input id="receiptDate" type="date" className="product-input"
//                   value={receiptDate} onChange={(e) => setReceiptDate(e.target.value)} required disabled={loading} />
//               </div>

//               {/* ISSUE DATE - Col 2 */}
//               <div className="form-group">
//                 <label htmlFor="issueDate">Issue Date <span className="required">*</span></label>
//                 <input id="issueDate" type="date" className="product-input"
//                   value={issueDate} onChange={(e) => setIssueDate(e.target.value)} required disabled={loading} />
//               </div>

//               {/* Empty Col 3 */}
//               <div className="form-group" style={{ visibility: 'hidden' }}></div>

//               <div className="section-title">
//                 🚚 Supplier & Department
//                 <div className="section-line"></div>
//               </div>

//               {/* SUPPLIER NAME - Col 1 */}
//               <div className="form-group">
//                 <label htmlFor="supplierName">Supplier Name <span className="required">*</span></label>
//                 <input id="supplierName" type="text" className="product-input" placeholder="Enter supplier name"
//                   value={supplierName} onChange={(e) => setSupplierName(e.target.value)} required disabled={loading} />
//               </div>

//               {/* DEPARTMENT - Col 2 */}
//               <div className="form-group">
//                 <label htmlFor="department">Department <span className="required">*</span></label>
//                 <select id="department" className="department-select"
//                   value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} required disabled={loading || departmentLoading}>
//                   <option value="">{departmentLoading ? 'Loading...' : '-- Select --'}</option>
//                   {departments.map((department) => (
//                     <option key={department.departmentId} value={department.departmentId}>
//                       {department.departmentName}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               {/* Empty Col 3 */}
//               <div className="form-group" style={{ visibility: 'hidden' }}></div>

//             </div>

//             <div className="button-container">
//               <button type="submit" className="add-button" disabled={loading || departmentLoading}>
//                 {loading ? 'Adding Product...' : 'Add Product →'}
//               </button>
//             </div>

//           </form>

//           {success && <div className="message success-message">✓ {success}</div>}
//           {error && <div className="message error-message">⚠️ {error}</div>}

//         </div>
//       </div>
//     </>
//   );
// };

// export default AddProduct;
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AddProduct = () => {
  const [productName, setProductName] = useState('');
  const [productQuantity, setProductQuantity] = useState('');
  const [receiptDate, setReceiptDate] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [price, setPrice] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [productDescription, setProductDescription] = useState('');

  const [departmentId, setDepartmentId] = useState('');
  const [departments, setDepartments] = useState([]);

  const [loading, setLoading] = useState(false);
  const [departmentLoading, setDepartmentLoading] = useState(true);

  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setDepartmentLoading(true);
        const response = await axios.get('http://localhost:8080/api/departments');
        setDepartments(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error('Error fetching departments:', error.response?.data || error.message);
        setError('Failed to load departments.');
      } finally {
        setDepartmentLoading(false);
      }
    };
    fetchDepartments();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');

    if (!departmentId) { setError('Please select a department.'); setLoading(false); return; }
    if (!productName.trim()) { setError('Product name is required.'); setLoading(false); return; }
    if (!productQuantity.trim()) { setError('Product quantity is required.'); setLoading(false); return; }
    if (!price || isNaN(parseInt(price, 10))) { setError('Product price is required.'); setLoading(false); return; }
    if (!receiptDate) { setError('Receipt date is required.'); setLoading(false); return; }
    if (!issueDate) { setError('Issue date is required.'); setLoading(false); return; }
    if (!supplierName.trim()) { setError('Supplier name is required.'); setLoading(false); return; }
    if (!productDescription.trim()) { setError('Product description is required.'); setLoading(false); return; }

    const userId = localStorage.getItem('userId');
    if (!userId) { setError('No logged-in user was found. Please login again.'); setLoading(false); return; }

    const productData = {
      productName: productName.trim(),
      productQuantity: productQuantity.trim(),
      receiptDate: receiptDate,
      issueDate: issueDate,
      price: parseInt(price, 10),
      supplierName: supplierName.trim(),
      productDescription: productDescription.trim(),
      departmentId: parseInt(departmentId, 10)
    };

    try {
      await axios.post(
        `http://localhost:8080/api/products/create?userId=${encodeURIComponent(userId)}`,
        productData,
        { headers: { 'Content-Type': 'application/json' } }
      );

      setSuccess('Product added successfully!');
      setProductName(''); setProductQuantity(''); setReceiptDate('');
      setIssueDate(''); setPrice(''); setSupplierName('');
      setDepartmentId(''); setProductDescription('');
    } catch (error) {
      console.error('Error adding product:', error.response?.data || error.message);
      const backendError = error.response?.data;
      if (typeof backendError === 'string') { setError(backendError); }
      else if (backendError?.message) { setError(backendError.message); }
      else { setError('Failed to add product. Please check the entered information.'); }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>
        {`
          * { box-sizing: border-box; margin: 0; padding: 0; }

          body, html {
            height: 100%;
            width: 100%;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          }

          /* RICH GRADIENT BACKGROUND */
          .product-page {
            min-height: 50vh;
            width: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 16px;
            background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 50%, #f3f4f6 100%);
          }

          /* CARD WITH TOP ACCENT */
          .product-card {
            background: #ffffff;
            border-radius: 14px;
            width: 100%;
            max-width: 1000px;
            max-height: 85vh;
            overflow-y: auto;
            padding: 24px 28px;
            box-shadow: 0 20px 40px -10px rgba(124, 58, 237, 0.15), 0 8px 16px -8px rgba(0, 0, 0, 0.05);
            border: 1px solid #ede9fe;
            border-top: 4px solid #7c3aed;
            scrollbar-width: thin;
            scrollbar-color: #c4b5fd #f3f4f6;
          }

          .product-card::-webkit-scrollbar { width: 6px; }
          .product-card::-webkit-scrollbar-track { background: #f3f4f6; border-radius: 8px; }
          .product-card::-webkit-scrollbar-thumb { background: #c4b5fd; border-radius: 8px; }
          .product-card::-webkit-scrollbar-thumb:hover { background: #a78bfa; }

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

          /* 3-COLUMN GRID */
          .form-grid {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
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
          .product-input, .department-select {
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

          .product-input::placeholder { color: #9ca3af; }

          .product-input:hover, .department-select:hover {
            border-color: #c4b5fd;
            background: #ffffff;
          }

          .product-input:focus, .department-select:focus {
            border-color: #7c3aed;
            background: #ffffff;
            box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.12);
          }

          .product-input:disabled, .department-select:disabled {
            background: #f9fafb; color: #9ca3af; cursor: not-allowed;
          }

          /* TEXTAREA */
          textarea.product-input {
            height: auto;
            padding: 8px 10px;
            resize: vertical;
            min-height: 60px;
          }

          /* BUTTON */
          .button-container {
            margin-top: 18px;
            display: flex;
            justify-content: center;
          }

          .add-button {
            width: 220px;
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

          .add-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(124, 58, 237, 0.35);
          }

          .add-button:active { transform: translateY(0); }

          .add-button:disabled {
            background: #c4b5fd;
            cursor: not-allowed;
            transform: none;
            box-shadow: none;
          }

          /* MESSAGES */
          .message {
            margin-top: 14px;
            padding: 10px 12px;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 6px;
          }

          .success-message {
            background: #f0fdf4;
            color: #15803d;
            border: 1px solid #bbf7d0;
          }

          .error-message {
            background: #fef2f2;
            color: #dc2626;
            border: 1px solid #fecaca;
          }

          /* RESPONSIVE */
          @media (max-width: 1024px) {
            .form-grid { grid-template-columns: 1fr 1fr; }
          }

          @media (max-width: 768px) {
            .product-card { padding: 20px 16px; max-height: 95vh; }
            .form-grid { grid-template-columns: 1fr; gap: 12px; }
            .full-width { grid-column: auto; }
            .section-title { grid-column: auto; margin-top: 8px; }
          }

          @media (max-width: 480px) {
            .product-page { padding: 10px; }
            .product-card { padding: 16px 12px; border-radius: 10px; }
            .card-header h2 { font-size: 16px; }
            .header-icon { width: 34px; height: 34px; font-size: 16px; }
            .product-input, .department-select { height: 36px; font-size: 12px; }
            .add-button { width: 100%; height: 42px; font-size: 13px; }
          }
        `}
      </style>

      <div className="product-page">
        <div className="product-card">
          
          <div className="card-header">
            <div className="header-icon">📦</div>
            <div>
              <h2>Add New Product</h2>
              <p>Fill in the details below to add a product to the inventory.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-grid">

              <div className="section-title">
                <span className="emoji">📦</span> Product Information
                <div className="section-line"></div>
              </div>

              {/* PRODUCT NAME - Full Width */}
              <div className="form-group full-width">
                <label htmlFor="productName">Product Name <span className="required">*</span></label>
                <input id="productName" type="text" className="product-input" placeholder="Enter product name"
                  value={productName} onChange={(e) => setProductName(e.target.value)} required disabled={loading} />
              </div>

              {/* QUANTITY - Col 1 */}
              <div className="form-group">
                <label htmlFor="quantity">Quantity <span className="required">*</span></label>
                <input id="quantity" type="number" min="1" className="product-input" placeholder="0"
                  value={productQuantity} onChange={(e) => setProductQuantity(e.target.value)} required disabled={loading} />
              </div>

              {/* PRICE - Col 2 */}
              <div className="form-group">
                <label htmlFor="price">Price <span className="required">*</span></label>
                <input id="price" type="number" min="0" className="product-input" placeholder="Enter price"
                  value={price} onChange={(e) => setPrice(e.target.value)} required disabled={loading} />
              </div>

              {/* Empty Col 3 */}
              <div className="form-group" style={{ visibility: 'hidden' }}></div>

              {/* DESCRIPTION - Full Width */}
              <div className="form-group full-width">
                <label htmlFor="productDescription">Description / Reason <span className="required">*</span></label>
                <textarea id="productDescription" className="product-input" placeholder="Explain why this product is being added"
                  value={productDescription} onChange={(e) => setProductDescription(e.target.value)} required disabled={loading} rows={2} />
              </div>

              <div className="section-title">
                <span className="emoji">📅</span> Product Dates
                <div className="section-line"></div>
              </div>

              {/* RECEIPT DATE - Col 1 */}
              <div className="form-group">
                <label htmlFor="receiptDate">Receipt Date <span className="required">*</span></label>
                <input id="receiptDate" type="date" className="product-input"
                  value={receiptDate} onChange={(e) => setReceiptDate(e.target.value)} required disabled={loading} />
              </div>

              {/* ISSUE DATE - Col 2 */}
              <div className="form-group">
                <label htmlFor="issueDate">Issue Date <span className="required">*</span></label>
                <input id="issueDate" type="date" className="product-input"
                  value={issueDate} onChange={(e) => setIssueDate(e.target.value)} required disabled={loading} />
              </div>

              {/* Empty Col 3 */}
              <div className="form-group" style={{ visibility: 'hidden' }}></div>

              <div className="section-title">
                <span className="emoji">🚚</span> Supplier & Department
                <div className="section-line"></div>
              </div>

              {/* SUPPLIER NAME - Col 1 */}
              <div className="form-group">
                <label htmlFor="supplierName">Supplier Name <span className="required">*</span></label>
                <input id="supplierName" type="text" className="product-input" placeholder="Enter supplier name"
                  value={supplierName} onChange={(e) => setSupplierName(e.target.value)} required disabled={loading} />
              </div>

              {/* DEPARTMENT - Col 2 */}
              <div className="form-group">
                <label htmlFor="department">Department <span className="required">*</span></label>
                <select id="department" className="department-select"
                  value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} required disabled={loading || departmentLoading}>
                  <option value="">{departmentLoading ? 'Loading...' : '-- Select --'}</option>
                  {departments.map((department) => (
                    <option key={department.departmentId} value={department.departmentId}>
                      {department.departmentName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Empty Col 3 */}
              <div className="form-group" style={{ visibility: 'hidden' }}></div>

            </div>

            <div className="button-container">
              <button type="submit" className="add-button" disabled={loading || departmentLoading}>
                {loading ? 'Adding Product...' : 'Add Product →'}
              </button>
            </div>

          </form>

          {success && <div className="message success-message">✓ {success}</div>}
          {error && <div className="message error-message">⚠️ {error}</div>}

        </div>
      </div>
    </>
  );
};

export default AddProduct;