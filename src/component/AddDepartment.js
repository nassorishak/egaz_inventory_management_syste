

import React, { useState } from 'react';
import axios from 'axios';

const AddDepartment = () => {
  const [deptName, setDeptName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleAddDepartment = async (e) => {
    e.preventDefault();

    // Validation
    if (!deptName.trim()) {
      setError('Please enter a department name.');
      setSuccess('');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await axios.post('/api/departments/create', {
        department: deptName.trim(),
      });

      // Clear input
      setDeptName('');

      // Success message
      setSuccess('Department added successfully!');

    } catch (err) {
      console.error('Error adding department:', err);
      const errorMessage = err.response?.data || 'Failed to add department. Please try again.';
      setError(errorMessage);
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

          .department-page {
            min-height: 100vh;
            background: #f4f7fb;
            padding: 40px 20px;
            font-family: Arial, Helvetica, sans-serif;
          }

          .department-wrapper {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
          }

          /* Page Header */
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
            margin-top: 8px;
            color: #718096;
            font-size: 15px;
          }

          /* Card */
          .department-card {
            background: #ffffff;
            border-radius: 18px;
            padding: 32px;
            box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
            border: 1px solid #edf0f5;
          }

          /* Card Header */
          .card-header {
            display: flex;
            align-items: center;
            gap: 15px;
            margin-bottom: 30px;
          }

          .icon-box {
            width: 52px;
            height: 52px;
            border-radius: 14px;
            background: #e8f0ff;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 25px;
          }

          .card-header h2 {
            margin: 0;
            color: #1a202c;
            font-size: 21px;
          }

          .card-header p {
            margin: 5px 0 0;
            color: #718096;
            font-size: 13px;
          }

          /* Form */
          .form-group {
            margin-bottom: 20px;
          }

          .form-group label {
            display: block;
            margin-bottom: 9px;
            font-size: 14px;
            font-weight: 600;
            color: #374151;
          }

          .department-input {
            width: 100%;
            height: 52px;
            padding: 0 16px;
            border: 1px solid #d9dee8;
            border-radius: 10px;
            outline: none;
            font-size: 15px;
            color: #1f2937;
            transition: all 0.25s ease;
          }

          .department-input::placeholder {
            color: #9ca3af;
          }

          .department-input:focus {
            border-color: #2563eb;
            box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.10);
          }

          .department-input:disabled {
            background: #f3f4f6;
            cursor: not-allowed;
          }

          /* Button */
          .add-button {
            width: 100%;
            height: 52px;
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

          .add-button:active {
            transform: translateY(0);
          }

          .add-button:disabled {
            background: #93c5fd;
            cursor: not-allowed;
            transform: none;
            box-shadow: none;
          }

          /* Messages */
          .message {
            margin-top: 16px;
            padding: 13px 15px;
            border-radius: 9px;
            font-size: 14px;
          }

          .error-message {
            background: #fef2f2;
            color: #dc2626;
            border: 1px solid #fecaca;
          }

          .success-message {
            background: #f0fdf4;
            color: #15803d;
            border: 1px solid #bbf7d0;
          }

          /* Bottom Hint */
          .form-hint {
            margin-top: 18px;
            text-align: center;
            color: #9ca3af;
            font-size: 12px;
          }

          /* Responsive */
          @media (max-width: 600px) {
            .department-page {
              padding: 25px 15px;
            }

            .department-card {
              padding: 23px;
            }

            .page-header h1 {
              font-size: 25px;
            }
          }
        `}
      </style>

      <div className="department-page">

        <div className="department-wrapper">

          {/* Page Header */}
          <div className="page-header">
            <h1>Department Management</h1>
          </div>

          {/* Add Department Card */}
          <div className="department-card">

            <div className="card-header">

              <div className="icon-box">
                🏢
              </div>

              <div>
                <h2>Register Department Here</h2>
              </div>

            </div>

            <form onSubmit={handleAddDepartment}>

              {/* Department Name */}
              <div className="form-group">

                <label htmlFor="departmentName">
                  Department Name
                </label>

                <input
                  id="departmentName"
                  type="text"
                  className="department-input"
                  placeholder="Enter department name"
                  value={deptName}
                  onChange={(e) => {
                    setDeptName(e.target.value);
                    setError('');
                    setSuccess('');
                  }}
                  disabled={loading}
                />

              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="add-button"
                disabled={loading}
              >
                {loading
                  ? 'Adding Department...'
                  : '+ Add Department'}
              </button>

            </form>

            {/* Error Message */}
            {error && (
              <div className="message error-message">
                ⚠️ {error}
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="message success-message">
                ✓ {success}
              </div>
            )}

            <div className="form-hint">
              Enter the department name and click Add Department.
            </div>

          </div>

        </div>

      </div>
    </>
  );
};

export default AddDepartment;
