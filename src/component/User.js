
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const User = () => {
  const navigate = useNavigate();

  // Backend API
  const apiUrl = 'http://localhost:8080/api/users';

  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    userId: '',
    userName: '',
    email: '',
    gender: 'Male',
    password: '',
    phoneNumber: '',
    role: 'Staff',
    departmentId: ''
  });

  const [isEdit, setIsEdit] = useState(false);

  // ==============================
  // GET ALL USERS
  // ==============================
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(`${apiUrl}/getAll`);

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();

      // Make sure data is an array
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Unable to load users.');
    } finally {
      setLoading(false);
    }
  };

  // ==============================
  // HANDLE INPUT
  // ==============================
  const handleInputChange = (e) => {
    const { id, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [id]: value
    }));
  };

  // ==============================
  // ADD USER
  // ==============================
  // This sends the user to Registration page
  const handleAddUser = () => {
    navigate('/registration');
  };

  // ==============================
  // OPEN UPDATE FORM
  // ==============================
  const openEditUserForm = (user) => {
    setFormData({
      userId: user.userId || '',
      userName: user.userName || '',
      email: user.email || '',
      gender: user.gender || 'Male',
      password: user.password || '',
      phoneNumber: user.phoneNumber || '',
      role: user.role || 'Staff',
      departmentId: user.department
        ? user.department.departmentId
        : ''
    });

    setIsEdit(true);
    setShowForm(true);
    setError('');

    // Scroll to update form
    setTimeout(() => {
      document
        .getElementById('update-form')
        ?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // ==============================
  // UPDATE USER
  // ==============================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.userId) {
      alert('User ID is missing.');
      return;
    }

    if (!formData.userName.trim()) {
      alert('Please enter username.');
      return;
    }

    if (!formData.email.trim()) {
      alert('Please enter email.');
      return;
    }

    if (!formData.departmentId) {
      alert('Please enter department.');
      return;
    }

    const userPayload = {
      userId: formData.userId,
      userName: formData.userName.trim(),
      email: formData.email.trim(),
      gender: formData.gender,
      password: formData.password,
      phoneNumber: formData.phoneNumber.trim(),
      role: formData.role,

      // Send department object to Spring Boot
      department: {
        departmentId: parseInt(formData.departmentId, 10)
      }
    };

    try {
      setSaving(true);
      setError('');

      console.log('Updating user:', userPayload);

      const response = await fetch(
        `${apiUrl}/update/${formData.userId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(userPayload)
        }
      );

      const responseText = await response.text();

      if (!response.ok) {
        throw new Error(
          responseText || 'Failed to update user'
        );
      }

      alert('User updated successfully!');

      // Close form
      setShowForm(false);
      setIsEdit(false);

      // Clear form
      setFormData({
        userId: '',
        userName: '',
        email: '',
        gender: 'Male',
        password: '',
        phoneNumber: '',
        role: 'Staff',
        departmentId: ''
      });

      // Reload users from database
      await fetchUsers();

    } catch (err) {
      console.error('Error updating user:', err);

      setError(
        err.message || 'Error updating user.'
      );

      alert(
        `Error updating user: ${
          err.message || 'Unknown error'
        }`
      );
    } finally {
      setSaving(false);
    }
  };

  // ==============================
  // CANCEL UPDATE
  // ==============================
  const handleCancel = () => {
    setShowForm(false);
    setIsEdit(false);
    setError('');

    setFormData({
      userId: '',
      userName: '',
      email: '',
      gender: 'Male',
      password: '',
      phoneNumber: '',
      role: 'Staff',
      departmentId: ''
    });
  };

  return (
    <div style={styles.page}>

      {/* ================= HEADER ================= */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>User Management</h2>
          <p style={styles.subtitle}>
            Manage registered users and their information
          </p>
        </div>

        {/* ADD USER BUTTON */}
        <button
          type="button"
          onClick={handleAddUser}
          style={styles.addButton}
        >
          + Add User
        </button>
      </div>

      {/* ================= ERROR ================= */}
      {error && (
        <div style={styles.error}>
          {error}
        </div>
      )}

      {/* ================= LOADING ================= */}
      {loading ? (
        <div style={styles.loading}>
          Loading users...
        </div>
      ) : (
        <div style={styles.tableContainer}>

          <table style={styles.table}>

            <thead>
              <tr>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Username</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Gender</th>
                <th style={styles.th}>Phone</th>
                <th style={styles.th}>Role</th>
                <th style={styles.th}>Department</th>
                <th style={styles.th}>Action</th>
              </tr>
            </thead>

            <tbody>

              {users.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    style={styles.noUsers}
                  >
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.userId}>

                    <td style={styles.td}>
                      {user.userId}
                    </td>

                    <td style={styles.td}>
                      {user.userName}
                    </td>

                    <td style={styles.td}>
                      {user.email}
                    </td>

                    <td style={styles.td}>
                      {user.gender}
                    </td>

                    <td style={styles.td}>
                      {user.phoneNumber}
                    </td>

                    <td style={styles.td}>
                      <span style={styles.role}>
                        {user.role}
                      </span>
                    </td>

                    <td style={styles.td}>
                      {user.department
                        ? user.department.departmentName
                        : 'No Department'}
                    </td>

                    <td style={styles.td}>

                      <button
                        type="button"
                        onClick={() =>
                          openEditUserForm(user)
                        }
                        style={styles.updateButton}
                      >
                        Update
                      </button>

                    </td>

                  </tr>
                ))
              )}

            </tbody>
          </table>

        </div>
      )}

      {/* ================= UPDATE FORM ================= */}
      {showForm && isEdit && (
        <div
          id="update-form"
          style={styles.formContainer}
        >

          <div style={styles.formHeader}>
            <div>
              <h3 style={styles.formTitle}>
                Update User
              </h3>

              <p style={styles.formSubtitle}>
                Edit user information below
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

          <form onSubmit={handleSubmit}>

            <div style={styles.formGrid}>

              {/* USER ID */}
              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  User ID
                </label>

                <input
                  type="text"
                  value={formData.userId}
                  readOnly
                  style={{
                    ...styles.input,
                    backgroundColor: '#f1f5f9'
                  }}
                />
              </div>

              {/* USERNAME */}
              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  Username
                </label>

                <input
                  id="userName"
                  type="text"
                  value={formData.userName}
                  onChange={handleInputChange}
                  style={styles.input}
                  required
                />
              </div>

              {/* EMAIL */}
              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  Email
                </label>

                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  style={styles.input}
                  required
                />
              </div>

              {/* GENDER */}
              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  Gender
                </label>

                <select
                  id="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  style={styles.input}
                >
                  <option value="Male">
                    Male
                  </option>

                  <option value="Female">
                    Female
                  </option>

                  <option value="Other">
                    Other
                  </option>
                </select>
              </div>

              {/* PASSWORD */}
              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  Password
                </label>

                <input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  style={styles.input}
                  required
                />
              </div>

              {/* PHONE */}
              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  Phone Number
                </label>

                <input
                  id="phoneNumber"
                  type="text"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  style={styles.input}
                />
              </div>

              {/* ROLE */}
              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  Role
                </label>

                <select
                  id="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  style={styles.input}
                >
                  <option value="Admin">
                    Admin
                  </option>

                  <option value="Staff">
                    Staff
                  </option>
                </select>
              </div>

              {/* DEPARTMENT */}
              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  Department ID
                </label>

                <input
                  id="departmentId"
                  type="number"
                  value={formData.departmentId}
                  onChange={handleInputChange}
                  style={styles.input}
                  required
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
                  : 'Update User'}
              </button>

            </div>

          </form>

        </div>
      )}

      {/* ================= INTERNAL CSS ================= */}
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
    minWidth: '900px'
  },

  th: {
    backgroundColor: '#1e40af',
    color: 'white',
    padding: '14px 12px',
    textAlign: 'left',
    fontSize: '14px'
  },

  td: {
    padding: '13px 12px',
    borderBottom:
      '1px solid #e2e8f0',
    color: '#334155',
    fontSize: '14px'
  },

  noUsers: {
    padding: '30px',
    textAlign: 'center',
    color: '#64748b'
  },

  role: {
    backgroundColor: '#dbeafe',
    color: '#1d4ed8',
    padding: '5px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600'
  },

  updateButton: {
    border: 'none',
    backgroundColor: '#16a34a',
    color: 'white',
    padding: '8px 15px',
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
    border: '1px solid #cbd5e1',
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

export default User;
