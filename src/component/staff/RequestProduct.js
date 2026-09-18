import React, { useState, useEffect } from 'react';
import axios from 'axios';

const RequestProduct = () => {
  const [products, setProducts] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [productId, setProductId] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [description, setDescription] = useState('');   // ✅ typed by staff

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const userId = localStorage.getItem('userId');

  // Fetch products and departments
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
  if (!quantity || Number(quantity) <= 0) {
    setError('Please enter a valid quantity.'); return;
  }
  if (!issueDate) { setError('Please choose an issue date.'); return; }
  if (!description.trim()) {
    setError('Please type the product description.'); return;
  }

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

  const selected = products.find(
    (p) => String(p.productId) === String(productId)
  );
  const selectedDept = departments.find(
    (d) => String(d.departmentId) === String(departmentId)
  );
  const stock = selected ? Number(selected.productQuantity) : 0;
  const exceedsStock = selected && Number(quantity) > stock;

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        .request-page {
          min-height: 100vh; background: #f4f7fb;
          padding: 35px 20px; font-family: Arial, Helvetica, sans-serif;
        }
        .request-container { width: 100%; max-width: 750px; margin: 0 auto; }
        .page-header { margin-bottom: 25px; }
        .page-header h1 { margin: 0; color: #172033; font-size: 30px; font-weight: 700; }
        .page-header p { margin: 8px 0 0; color: #718096; font-size: 15px; }

        .request-card {
          background: #fff; border-radius: 18px; padding: 32px;
          border: 1px solid #edf0f5;
          box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
        }
        .card-header {
          display: flex; align-items: center; gap: 15px;
          padding-bottom: 22px; margin-bottom: 25px;
          border-bottom: 1px solid #edf0f5;
        }
        .icon-box {
          width: 54px; height: 54px; border-radius: 14px;
          background: #e8f0ff;
          display: flex; align-items: center; justify-content: center;
          font-size: 25px;
        }
        .card-header h2 { margin: 0; color: #172033; font-size: 21px; }
        .card-header p { margin: 5px 0 0; color: #718096; font-size: 13px; }

        .form-group { display: flex; flex-direction: column; margin-bottom: 18px; }
        .form-group label {
          margin-bottom: 8px; color: #374151;
          font-size: 14px; font-weight: 600;
        }
        .required { color: #ef4444; margin-left: 3px; }

        .product-input, .product-select, .product-textarea {
          width: 100%; padding: 0 14px;
          border: 1px solid #d9dee8; border-radius: 10px;
          background: #fff; color: #1f2937;
          font-size: 14px; outline: none;
          transition: all 0.25s ease; font-family: inherit;
        }
        .product-input, .product-select { height: 48px; }
        .product-textarea {
          padding: 12px 14px; min-height: 100px; resize: vertical;
        }
        .product-input:hover, .product-select:hover, .product-textarea:hover {
          border-color: #b8c2d1;
        }
        .product-input:focus, .product-select:focus, .product-textarea:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.10);
        }
        .product-input:disabled, .product-select:disabled, .product-textarea:disabled {
          background: #f3f4f6; cursor: not-allowed;
        }

        .warning-box {
          margin-top: -8px; margin-bottom: 14px;
          padding: 8px 12px; border-radius: 8px; font-size: 13px;
          background: #fef3c7; color: #92400e;
          border: 1px solid #fde68a;
        }

        .button-container { margin-top: 8px; display: flex; justify-content: flex-end; }
        .submit-button {
          min-width: 190px; height: 50px; padding: 0 25px;
          border: none; border-radius: 10px;
          background: #2563eb; color: #fff;
          font-size: 15px; font-weight: 600; cursor: pointer;
          transition: all 0.25s ease;
        }
        .submit-button:hover:not(:disabled) {
          background: #1d4ed8; transform: translateY(-1px);
          box-shadow: 0 7px 18px rgba(37, 99, 235, 0.25);
        }
        .submit-button:disabled { background: #93c5fd; cursor: not-allowed; }

        .message {
          margin-top: 20px; padding: 13px 15px;
          border-radius: 9px; font-size: 14px;
        }
        .success-message { background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; }
        .error-message   { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }

        .form-footer { margin-top: 18px; text-align: center; color: #9ca3af; font-size: 12px; }

        @media (max-width: 700px) {
          .request-page { padding: 25px 15px; }
          .request-card { padding: 22px; }
          .button-container { justify-content: stretch; }
          .submit-button { width: 100%; }
          .page-header h1 { font-size: 25px; }
        }
      `}</style>

      <div className="request-page">
        <div className="request-container">

          <div className="page-header">
            <h1>Request a Product</h1>
            <p>Fill in the details below and submit your request to the Admin.</p>
          </div>

          <div className="request-card">

            <div className="card-header">
              <div className="icon-box">📝</div>
              <div>
                <h2>New Product Request</h2>
                <p>All fields are required</p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>

              {/* PRODUCT NAME */}
              <div className="form-group">
                <label htmlFor="product">
                  Product Name <span className="required">*</span>
                </label>
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

              {/* DESCRIPTION — TYPED BY STAFF */}
              <div className="form-group">
                <label htmlFor="description">
                  Product Description <span className="required">*</span>
                </label>
                <textarea
                  id="description"
                  className="product-textarea"
                  placeholder="Type the description of the product you are requesting"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  disabled={loading}
                  rows={4}
                />
              </div>

              {/* QUANTITY */}
              <div className="form-group">
                <label htmlFor="quantity">
                  Quantity <span className="required">*</span>
                </label>
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

              {exceedsStock && (
                <div className="warning-box">
                  ⚠️ Only {stock} available in stock.
                </div>
              )}

              {/* DEPARTMENT NAME */}
              <div className="form-group">
                <label htmlFor="department">
                  Department Name <span className="required">*</span>
                </label>
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
                <label htmlFor="issueDate">
                  Issue Date <span className="required">*</span>
                </label>
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

              {/* SUMMARY */}
              {selected && selectedDept && (
                <div style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 10,
                  padding: 16,
                  marginBottom: 14,
                  fontSize: 13,
                  color: '#334155',
                }}>
                  <strong style={{ display: 'block', marginBottom: 8, color: '#1e293b' }}>
                    Request Summary
                  </strong>
                  <div>Product Name: <b>{selected.productName}</b></div>
                  <div>Description: <b>{description || '-'}</b></div>
                  <div>Quantity: <b>{quantity || '-'}</b></div>
                  <div>Department Name: <b>{selectedDept.departmentName}</b></div>
                  <div>Issue Date: <b>{issueDate || '-'}</b></div>
                </div>
              )}

              <div className="button-container">
                <button
                  type="submit"
                  className="submit-button"
                  disabled={loading}
                >
                  {loading ? 'Submitting...' : '＋ Submit Request'}
                </button>
              </div>

            </form>

            {success && (
              <div className="message success-message">✓ {success}</div>
            )}
            {error && (
              <div className="message error-message">⚠️ {error}</div>
            )}

            <div className="form-footer">
              Fields marked with <span style={{ color: '#ef4444' }}>*</span> are required.
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default RequestProduct;