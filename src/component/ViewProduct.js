
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ViewProduct = () => {
  const navigate = useNavigate();

  // ==============================
  // API URL
  // ==============================
  const apiUrl = 'http://localhost:8080/api/products/';

  // ==============================
  // STATES
  // ==============================
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState('');

  const [showForm, setShowForm] = useState(false);

  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    productId: '',
    productName: '',
    description: '',
    quantity: '',
    price: '',
    category: '',
    supplier: ''
  });

  // ==============================
  // FETCH PRODUCTS WHEN PAGE LOADS
  // ==============================
  useEffect(() => {
    fetchProducts();
  }, []);

  // ==============================
  // GET ALL PRODUCTS
  // ==============================
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(`${apiUrl}/getAll`);

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();

      setProducts(Array.isArray(data) ? data : []);

    } catch (err) {
      console.error('Error fetching products:', err);

      setError(
        'Unable to load products. Make sure the backend is running.'
      );

    } finally {
      setLoading(false);
    }
  };

  // ==============================
  // ADD PRODUCT
  // ==============================
  const handleAddProduct = () => {
    navigate('/add-product');
  };

  // ==============================
  // HANDLE INPUT
  // ==============================
  const handleInputChange = (e) => {
    const { id, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [id]: value
    }));
  };

  // ==============================
  // OPEN UPDATE FORM
  // ==============================
  const handleUpdateClick = (product) => {

    setFormData({
      productId: product.productId || '',
      productName: product.productName || '',
      description: product.description || '',
      quantity: product.quantity || '',
      price: product.price || '',
      category: product.category || '',
      supplier: product.supplier || ''
    });

    setShowForm(true);
    setError('');

    // Scroll to form
    setTimeout(() => {
      document
        .getElementById('product-update-form')
        ?.scrollIntoView({
          behavior: 'smooth'
        });
    }, 100);
  };

  // ==============================
  // UPDATE PRODUCT
  // ==============================
  const handleUpdateProduct = async (e) => {
    e.preventDefault();

    if (!formData.productId) {
      alert('Product ID is missing.');
      return;
    }

    if (!formData.productName.trim()) {
      alert('Please enter product name.');
      return;
    }

    try {
      setSaving(true);

      setError('');

      const productPayload = {
        productId: formData.productId,

        productName: formData.productName.trim(),

        description: formData.description.trim(),

        quantity: parseInt(formData.quantity, 10) || 0,

        price: parseFloat(formData.price) || 0,

        category: formData.category.trim(),

        supplier: formData.supplier.trim()
      };

      console.log(
        'Updating product:',
        productPayload
      );

      const response = await fetch(
        `${apiUrl}/update/${formData.productId}`,
        {
          method: 'PUT',

          headers: {
            'Content-Type': 'application/json'
          },

          body: JSON.stringify(productPayload)
        }
      );

      const responseText = await response.text();

      if (!response.ok) {
        throw new Error(
          responseText ||
          'Failed to update product'
        );
      }

      alert('Product updated successfully!');

      // Close form
      setShowForm(false);

      // Clear form
      clearForm();

      // Refresh table
      await fetchProducts();

    } catch (err) {

      console.error(
        'Error updating product:',
        err
      );

      setError(
        err.message ||
        'Error updating product.'
      );

      alert(
        `Error updating product: ${
          err.message ||
          'Unknown error'
        }`
      );

    } finally {
      setSaving(false);
    }
  };

  // ==============================
  // DELETE PRODUCT
  // ==============================
  const handleDeleteProduct = async (productId) => {

    const confirmDelete = window.confirm(
      'Are you sure you want to delete this product?'
    );

    if (!confirmDelete) {
      return;
    }

    try {

      setError('');

      const response = await fetch(
        `${apiUrl}/delete/${productId}`,
        {
          method: 'DELETE'
        }
      );

      const responseText =
        await response.text();

      if (!response.ok) {
        throw new Error(
          responseText ||
          'Failed to delete product'
        );
      }

      alert('Product deleted successfully!');

      // Refresh product table
      await fetchProducts();

    } catch (err) {

      console.error(
        'Error deleting product:',
        err
      );

      setError(
        err.message ||
        'Error deleting product.'
      );

      alert(
        `Error deleting product: ${
          err.message ||
          'Unknown error'
        }`
      );
    }
  };

  // ==============================
  // CLEAR FORM
  // ==============================
  const clearForm = () => {

    setFormData({
      productId: '',
      productName: '',
      description: '',
      quantity: '',
      price: '',
      category: '',
      supplier: ''
    });

  };

  // ==============================
  // CANCEL UPDATE
  // ==============================
  const handleCancel = () => {

    setShowForm(false);

    clearForm();

    setError('');
  };

  return (
    <div style={styles.page}>

      {/* ==========================================
          HEADER
      ========================================== */}

      <div style={styles.header}>

        <div>

          <h2 style={styles.title}>
            Product Management
          </h2>

          <p style={styles.subtitle}>
            Manage products, stock and product information
          </p>

        </div>

        {/* ADD PRODUCT BUTTON */}

        <button
          type="button"
          onClick={handleAddProduct}
          style={styles.addButton}
        >
          + Add Product
        </button>

      </div>


      {/* ==========================================
          ERROR MESSAGE
      ========================================== */}

      {error && (

        <div style={styles.error}>
          {error}
        </div>

      )}


      {/* ==========================================
          LOADING
      ========================================== */}

      {loading ? (

        <div style={styles.loading}>
          Loading products...
        </div>

      ) : (

        /* ==========================================
           PRODUCT TABLE
        ========================================== */

        <div style={styles.tableContainer}>

          <table style={styles.table}>

            <thead>

              <tr>

                <th style={styles.th}>
                  ID
                </th>

                <th style={styles.th}>
                  Product Name
                </th>

                <th style={styles.th}>
                  Description
                </th>

                <th style={styles.th}>
                  Quantity
                </th>

                <th style={styles.th}>
                  Price
                </th>

                <th style={styles.th}>
                  Category
                </th>

                <th style={styles.th}>
                  Supplier
                </th>

                <th style={styles.th}>
                  Actions
                </th>

              </tr>

            </thead>


            <tbody>

              {products.length === 0 ? (

                <tr>

                  <td
                    colSpan="8"
                    style={styles.noProducts}
                  >
                    No products found.
                  </td>

                </tr>

              ) : (

                products.map((product) => (

                  <tr
                    key={product.productId}
                    style={styles.row}
                  >

                    {/* ID */}

                    <td style={styles.td}>
                      {product.productId}
                    </td>


                    {/* NAME */}

                    <td style={styles.td}>
                      <strong>
                        {product.productName}
                      </strong>
                    </td>


                    {/* DESCRIPTION */}

                    <td style={styles.td}>
                      {product.description || '-'}
                    </td>


                    {/* QUANTITY */}

                    <td style={styles.td}>

                      <span
                        style={
                          product.quantity > 0
                            ? styles.stockAvailable
                            : styles.stockEmpty
                        }
                      >
                        {product.quantity}
                      </span>

                    </td>


                    {/* PRICE */}

                    <td style={styles.td}>
                      {product.price != null
                        ? Number(
                            product.price
                          ).toLocaleString()
                        : '0'}
                    </td>


                    {/* CATEGORY */}

                    <td style={styles.td}>
                      {product.category || '-'}
                    </td>


                    {/* SUPPLIER */}

                    <td style={styles.td}>
                      {product.supplier || '-'}
                    </td>


                    {/* ACTIONS */}

                    <td style={styles.td}>

                      <div style={styles.actions}>

                        {/* UPDATE */}

                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateClick(
                              product
                            )
                          }
                          style={styles.updateButton}
                        >
                          Update
                        </button>


                        {/* DELETE */}

                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteProduct(
                              product.productId
                            )
                          }
                          style={styles.deleteButton}
                        >
                          Delete
                        </button>

                      </div>

                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>

      )}


      {/* ==========================================
          UPDATE FORM
      ========================================== */}

      {showForm && (

        <div
          id="product-update-form"
          style={styles.formContainer}
        >

          <div style={styles.formHeader}>

            <div>

              <h3 style={styles.formTitle}>
                Update Product
              </h3>

              <p style={styles.formSubtitle}>
                Edit the product information below
              </p>

            </div>

            <button
              type="button"
              onClick={handleCancel}
              style={styles.closeButton}
            >
              ×
            </button>

          </div>


          <form
            onSubmit={handleUpdateProduct}
          >

            <div style={styles.formGrid}>

              {/* PRODUCT ID */}

              <div style={styles.inputGroup}>

                <label style={styles.label}>
                  Product ID
                </label>

                <input
                  type="text"
                  value={formData.productId}
                  readOnly
                  style={{
                    ...styles.input,
                    backgroundColor:
                      '#f1f5f9'
                  }}
                />

              </div>


              {/* PRODUCT NAME */}

              <div style={styles.inputGroup}>

                <label style={styles.label}>
                  Product Name
                </label>

                <input
                  id="productName"
                  type="text"
                  value={
                    formData.productName
                  }
                  onChange={
                    handleInputChange
                  }
                  style={styles.input}
                  required
                />

              </div>


              {/* DESCRIPTION */}

              <div style={styles.inputGroup}>

                <label style={styles.label}>
                  Description
                </label>

                <input
                  id="description"
                  type="text"
                  value={
                    formData.description
                  }
                  onChange={
                    handleInputChange
                  }
                  style={styles.input}
                />

              </div>


              {/* QUANTITY */}

              <div style={styles.inputGroup}>

                <label style={styles.label}>
                  Quantity
                </label>

                <input
                  id="quantity"
                  type="number"
                  min="0"
                  value={
                    formData.quantity
                  }
                  onChange={
                    handleInputChange
                  }
                  style={styles.input}
                  required
                />

              </div>


              {/* PRICE */}

              <div style={styles.inputGroup}>

                <label style={styles.label}>
                  Price
                </label>

                <input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={
                    formData.price
                  }
                  onChange={
                    handleInputChange
                  }
                  style={styles.input}
                  required
                />

              </div>


              {/* CATEGORY */}

              <div style={styles.inputGroup}>

                <label style={styles.label}>
                  Category
                </label>

                <input
                  id="category"
                  type="text"
                  value={
                    formData.category
                  }
                  onChange={
                    handleInputChange
                  }
                  style={styles.input}
                />

              </div>


              {/* SUPPLIER */}

              <div style={styles.inputGroup}>

                <label style={styles.label}>
                  Supplier
                </label>

                <input
                  id="supplier"
                  type="text"
                  value={
                    formData.supplier
                  }
                  onChange={
                    handleInputChange
                  }
                  style={styles.input}
                />

              </div>

            </div>


            {/* FORM BUTTONS */}

            <div style={styles.formButtons}>

              <button
                type="button"
                onClick={handleCancel}
                style={styles.cancelButton}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                style={styles.saveButton}
                disabled={saving}
              >
                {saving
                  ? 'Updating...'
                  : 'Update Product'}
              </button>

            </div>

          </form>

        </div>

      )}


      {/* ==========================================
          INTERNAL CSS
      ========================================== */}

      <style>{`

        * {
          box-sizing: border-box;
        }

        button {
          font-family: inherit;
        }

        button:hover {
          opacity: 0.9;
        }

        table tbody tr:hover {
          background-color: #f8fafc;
        }

      `}</style>

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
    fontFamily:
      'Arial, Helvetica, sans-serif'
  },


  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '25px',
    gap: '20px'
  },


  title: {
    margin: 0,
    color: '#1e293b',
    fontSize: '28px'
  },


  subtitle: {
    marginTop: '6px',
    color: '#64748b',
    fontSize: '14px'
  },


  addButton: {
    border: 'none',
    backgroundColor: '#2563eb',
    color: 'white',
    padding: '12px 22px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '600',
    boxShadow:
      '0 4px 10px rgba(37, 99, 235, 0.25)'
  },


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
    boxShadow:
      '0 4px 15px rgba(0,0,0,0.06)'
  },


  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: '1000px'
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
    borderBottom:
      '1px solid #e2e8f0',
    color: '#334155',
    fontSize: '14px'
  },


  row: {
    transition: 'background-color 0.2s'
  },


  noProducts: {
    padding: '35px',
    textAlign: 'center',
    color: '#64748b'
  },


  stockAvailable: {
    backgroundColor: '#dcfce7',
    color: '#15803d',
    padding: '5px 10px',
    borderRadius: '15px',
    fontWeight: '600',
    fontSize: '12px'
  },


  stockEmpty: {
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    padding: '5px 10px',
    borderRadius: '15px',
    fontWeight: '600',
    fontSize: '12px'
  },


  actions: {
    display: 'flex',
    gap: '8px'
  },


  updateButton: {
    border: 'none',
    backgroundColor: '#16a34a',
    color: 'white',
    padding: '8px 13px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600'
  },


  deleteButton: {
    border: 'none',
    backgroundColor: '#dc2626',
    color: 'white',
    padding: '8px 13px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600'
  },


  formContainer: {
    backgroundColor: 'white',
    marginTop: '30px',
    padding: '25px',
    borderRadius: '12px',
    boxShadow:
      '0 4px 15px rgba(0,0,0,0.08)'
  },


  formHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '25px'
  },


  formTitle: {
    margin: 0,
    color: '#1e293b'
  },


  formSubtitle: {
    marginTop: '5px',
    color: '#64748b',
    fontSize: '13px'
  },


  closeButton: {
    border: 'none',
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    width: '35px',
    height: '35px',
    borderRadius: '50%',
    fontSize: '22px',
    cursor: 'pointer'
  },


  formGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px'
  },


  inputGroup: {
    display: 'flex',
    flexDirection: 'column'
  },


  label: {
    marginBottom: '7px',
    fontWeight: '600',
    color: '#334155',
    fontSize: '14px'
  },


  input: {
    width: '100%',
    padding: '11px 12px',
    border:
      '1px solid #cbd5e1',
    borderRadius: '7px',
    outline: 'none',
    fontSize: '14px'
  },


  formButtons: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '25px'
  },


  cancelButton: {
    padding: '11px 20px',
    border:
      '1px solid #cbd5e1',
    backgroundColor: 'white',
    color: '#475569',
    borderRadius: '7px',
    cursor: 'pointer',
    fontWeight: '600'
  },


  saveButton: {
    padding: '11px 22px',
    border: 'none',
    backgroundColor: '#2563eb',
    color: 'white',
    borderRadius: '7px',
    cursor: 'pointer',
    fontWeight: '600'
  }

};

export default ViewProduct;

