
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AddProduct = () => {
  const [productName, setProductName] = useState('');
  const [productQuantity, setProductQuantity] = useState('');
  const [receiptDate, setReceiptDate] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [price, setPrice] = useState('');
  const [supplierName, setSupplierName] = useState('');

  // Selected Department ID
  const [departmentId, setDepartmentId] = useState('');

  // Departments fetched from database
  const [departments, setDepartments] = useState([]);

  const [loading, setLoading] = useState(false);
  const [departmentLoading, setDepartmentLoading] = useState(true);

  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  /*
   * Fetch departments from database
   */
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setDepartmentLoading(true);

        const response = await axios.get(
          'http://localhost:8080/api/departments'
        );

        setDepartments(response.data);

      } catch (error) {
        console.error('Error fetching departments:', error);
        setError('Failed to load departments.');
      } finally {
        setDepartmentLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  /*
   * Add Product
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setSuccess('');
    setError('');

    // Make sure department is selected
    if (!departmentId) {
      setError('Please select a department.');
      setLoading(false);
      return;
    }

    const productData = {
      ProductName: productName,
      ProductQuantity: productQuantity,
      ReceiptDate: receiptDate,
      IssueDate: issueDate,
      Price: parseInt(price, 10),
      SupplierName: supplierName,

      // Selected department
      department: {
        departmentId: parseInt(departmentId, 10)
      }
    };

    try {
      await axios.post(
        'http://localhost:8080/api/products/create',
        productData
      );

      setSuccess('Product added successfully!');

      // Clear form
      setProductName('');
      setProductQuantity('');
      setReceiptDate('');
      setIssueDate('');
      setPrice('');
      setSupplierName('');
      setDepartmentId('');

    } catch (error) {
      console.error('Error adding product:', error);

      setError(
        error.response?.data?.message ||
        'Failed to add product. Please try again.'
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>
        {`
          * {
            box-sizing: border-box;
          }

          .product-page {
            min-height: 100vh;
            background: #f4f7fb;
            padding: 35px 20px;
            font-family: Arial, Helvetica, sans-serif;
          }

          .product-container {
            width: 100%;
            max-width: 850px;
            margin: 0 auto;
          }

          /* PAGE HEADER */

          .page-header {
            margin-bottom: 25px;
          }

          .page-header h1 {
            margin: 0;
            color: #172033;
            font-size: 30px;
            font-weight: 700;
          }

          .page-header p {
            margin: 8px 0 0;
            color: #718096;
            font-size: 15px;
          }

          /* CARD */

          .product-card {
            background: #ffffff;
            border-radius: 18px;
            padding: 32px;
            border: 1px solid #edf0f5;
            box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
          }

          /* CARD HEADER */

          .card-header {
            display: flex;
            align-items: center;
            gap: 15px;
            padding-bottom: 22px;
            margin-bottom: 25px;
            border-bottom: 1px solid #edf0f5;
          }

          .icon-box {
            width: 54px;
            height: 54px;
            border-radius: 14px;
            background: #e8f0ff;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 25px;
          }

          .card-header h2 {
            margin: 0;
            color: #172033;
            font-size: 21px;
          }

          .card-header p {
            margin: 5px 0 0;
            color: #718096;
            font-size: 13px;
          }

          /* FORM GRID */

          .form-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
          }

          .form-group {
            display: flex;
            flex-direction: column;
          }

          .full-width {
            grid-column: 1 / -1;
          }

          /* SECTION TITLE */

          .section-title {
            grid-column: 1 / -1;
            display: flex;
            align-items: center;
            gap: 10px;
            margin-top: 5px;
            margin-bottom: -5px;
            color: #2563eb;
            font-size: 14px;
            font-weight: 700;
          }

          .section-line {
            flex: 1;
            height: 1px;
            background: #e5e7eb;
          }

          /* LABEL */

          .form-group label {
            margin-bottom: 8px;
            color: #374151;
            font-size: 14px;
            font-weight: 600;
          }

          .required {
            color: #ef4444;
            margin-left: 3px;
          }

          /* INPUT */

          .product-input {
            width: 100%;
            height: 48px;
            padding: 0 14px;
            border: 1px solid #d9dee8;
            border-radius: 10px;
            background: #ffffff;
            color: #1f2937;
            font-size: 14px;
            outline: none;
            transition: all 0.25s ease;
          }

          .product-input:hover {
            border-color: #b8c2d1;
          }

          .product-input:focus {
            border-color: #2563eb;
            box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.10);
          }

          .product-input:disabled {
            background: #f3f4f6;
            cursor: not-allowed;
          }

          /* SELECT */

          .department-select {
            width: 100%;
            height: 48px;
            padding: 0 14px;
            border: 1px solid #d9dee8;
            border-radius: 10px;
            background: #ffffff;
            color: #1f2937;
            font-size: 14px;
            outline: none;
            cursor: pointer;
            transition: all 0.25s ease;
          }

          .department-select:hover {
            border-color: #b8c2d1;
          }

          .department-select:focus {
            border-color: #2563eb;
            box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.10);
          }

          .department-select:disabled {
            background: #f3f4f6;
            cursor: not-allowed;
          }

          /* BUTTON */

          .button-container {
            margin-top: 28px;
            display: flex;
            justify-content: flex-end;
          }

          .add-button {
            min-width: 190px;
            height: 50px;
            padding: 0 25px;
            border: none;
            border-radius: 10px;
            background: #2563eb;
            color: #ffffff;
            font-size: 15px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.25s ease;
          }

          .add-button:hover {
            background: #1d4ed8;
            transform: translateY(-1px);
            box-shadow: 0 7px 18px rgba(37, 99, 235, 0.25);
          }

          .add-button:disabled {
            background: #93c5fd;
            cursor: not-allowed;
            transform: none;
            box-shadow: none;
          }

          /* MESSAGES */

          .message {
            margin-top: 20px;
            padding: 13px 15px;
            border-radius: 9px;
            font-size: 14px;
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

          /* FOOTER */

          .form-footer {
            margin-top: 18px;
            text-align: center;
            color: #9ca3af;
            font-size: 12px;
          }

          /* RESPONSIVE */

          @media (max-width: 700px) {

            .product-page {
              padding: 25px 15px;
            }

            .product-card {
              padding: 22px;
            }

            .form-grid {
              grid-template-columns: 1fr;
            }

            .full-width {
              grid-column: auto;
            }

            .section-title {
              grid-column: auto;
            }

            .button-container {
              justify-content: stretch;
            }

            .add-button {
              width: 100%;
            }

            .page-header h1 {
              font-size: 25px;
            }
          }
        `}
      </style>

      <div className="product-page">

        <div className="product-container">

          {/* PAGE HEADER */}

          <div className="page-header">
            <h1>Product Management</h1>
            <p>
              Add a new product to your inventory system.
            </p>
          </div>

          {/* PRODUCT CARD */}

          <div className="product-card">

            <div className="card-header">

              <div className="icon-box">
                📦
              </div>

              <div>
                <h2>Add New Product</h2>
                <p>
                  Enter the product information below
                </p>
              </div>

            </div>

            <form onSubmit={handleSubmit}>

              <div className="form-grid">

                {/* PRODUCT INFORMATION */}

                <div className="section-title">
                  📦 Product Information
                  <div className="section-line"></div>
                </div>

                {/* PRODUCT NAME */}

                <div className="form-group full-width">

                  <label htmlFor="productName">
                    Product Name
                    <span className="required">*</span>
                  </label>

                  <input
                    id="productName"
                    type="text"
                    className="product-input"
                    placeholder="Enter product name"
                    value={productName}
                    onChange={(e) =>
                      setProductName(e.target.value)
                    }
                    required
                    disabled={loading}
                  />

                </div>

                {/* QUANTITY */}

                <div className="form-group">

                  <label htmlFor="quantity">
                    Quantity
                    <span className="required">*</span>
                  </label>

                  <input
                    id="quantity"
                    type="number"
                    min="1"
                    className="product-input"
                    placeholder="Enter quantity"
                    value={productQuantity}
                    onChange={(e) =>
                      setProductQuantity(e.target.value)
                    }
                    required
                    disabled={loading}
                  />

                </div>

                {/* PRICE */}

                <div className="form-group">

                  <label htmlFor="price">
                    Price
                    <span className="required">*</span>
                  </label>

                  <input
                    id="price"
                    type="number"
                    min="0"
                    className="product-input"
                    placeholder="Enter price"
                    value={price}
                    onChange={(e) =>
                      setPrice(e.target.value)
                    }
                    required
                    disabled={loading}
                  />

                </div>

                {/* DATES */}

                <div className="section-title">
                  📅 Product Dates
                  <div className="section-line"></div>
                </div>

                {/* RECEIPT DATE */}

                <div className="form-group">

                  <label htmlFor="receiptDate">
                    Receipt Date
                    <span className="required">*</span>
                  </label>

                  <input
                    id="receiptDate"
                    type="date"
                    className="product-input"
                    value={receiptDate}
                    onChange={(e) =>
                      setReceiptDate(e.target.value)
                    }
                    required
                    disabled={loading}
                  />

                </div>

                {/* ISSUE DATE */}

                <div className="form-group">

                  <label htmlFor="issueDate">
                    Issue Date
                    <span className="required">*</span>
                  </label>

                  <input
                    id="issueDate"
                    type="date"
                    className="product-input"
                    value={issueDate}
                    onChange={(e) =>
                      setIssueDate(e.target.value)
                    }
                    required
                    disabled={loading}
                  />

                </div>

                {/* SUPPLIER */}

                <div className="section-title">
                  🚚 Supplier & Department
                  <div className="section-line"></div>
                </div>

                {/* SUPPLIER NAME */}

                <div className="form-group">

                  <label htmlFor="supplierName">
                    Supplier Name
                    <span className="required">*</span>
                  </label>

                  <input
                    id="supplierName"
                    type="text"
                    className="product-input"
                    placeholder="Enter supplier name"
                    value={supplierName}
                    onChange={(e) =>
                      setSupplierName(e.target.value)
                    }
                    required
                    disabled={loading}
                  />

                </div>

                {/* DEPARTMENT */}

                <div className="form-group">

                  <label htmlFor="department">
                    Department
                    <span className="required">*</span>
                  </label>

                  <select
                    id="department"
                    className="department-select"
                    value={departmentId}
                    onChange={(e) =>
                      setDepartmentId(e.target.value)
                    }
                    required
                    disabled={loading || departmentLoading}
                  >

                    <option value="">
                      {departmentLoading
                        ? 'Loading departments...'
                        : 'Select Department'}
                    </option>

                    {departments.map((department) => (
                      <option
                        key={department.departmentId}
                        value={department.departmentId}
                      >
                        {department.departmentName}
                      </option>
                    ))}

                  </select>

                </div>

              </div>

              {/* BUTTON */}

              <div className="button-container">

                <button
                  type="submit"
                  className="add-button"
                  disabled={loading || departmentLoading}
                >
                  {loading
                    ? 'Adding Product...'
                    : '＋ Add Product'}
                </button>

              </div>

            </form>

            {/* SUCCESS */}

            {success && (
              <div className="message success-message">
                ✓ {success}
              </div>
            )}

            {/* ERROR */}

            {error && (
              <div className="message error-message">
                ⚠️ {error}
              </div>
            )}

            <div className="form-footer">
              Fields marked with * are required.
            </div>

          </div>

        </div>

      </div>
    </>
  );
};

export default AddProduct;
