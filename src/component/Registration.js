import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Registration = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    gender: 'Male',
    phoneNumber: '',
    departmentId: '1',
    role: 'Staff',
  });

  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Fetch departments
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await axios.get(
          'http://localhost:8080/api/departments'
        );

        setDepartments(response.data);
      } catch (err) {
        console.error('Error fetching departments:', err);
        setError('Unable to load departments.');
      }
    };

    fetchDepartments();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Submit registration
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');
    setSuccess('');
    setLoading(true);

    const payload = {
      userName: formData.name.trim(),
      email: formData.email.trim(),
      password: formData.password,
      gender: formData.gender,
      phoneNumber: formData.phoneNumber.trim(),
      role: formData.role,
      department: {
        departmentId: Number(formData.departmentId),
      },
    };

    console.log('Registration Payload:', payload);

    try {
      const response = await axios.post(
        'http://localhost:8080/api/users/register',
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        setSuccess(
          'Account created successfully! Redirecting to login...'
        );

        setTimeout(() => {
          navigate('/');
        }, 2000);
      }
    } catch (err) {
      console.error('Registration error:', err);

      if (err.response && err.response.data) {
        const data = err.response.data;

        if (typeof data === 'string') {
          setError(data);
        } else if (data.message) {
          setError(data.message);
        } else {
          setError(
            'Failed to create account. Please check your details.'
          );
        }
      } else {
        setError(
          'Cannot connect to server. Please ensure backend is running.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`

        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          font-family:
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            Roboto,
            Arial,
            sans-serif;
        }

        .registration-container {
          min-height: 100vh;
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 30px 20px;
          position: relative;
          overflow: hidden;

          background:
            linear-gradient(
              135deg,
              #0f172a 0%,
              #1e3a8a 50%,
              #2563eb 100%
            );
        }

        /* Decorative circles */

        .registration-container::before {
          content: "";
          position: absolute;
          width: 420px;
          height: 420px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.06);
          top: -170px;
          left: -130px;
        }

        .registration-container::after {
          content: "";
          position: absolute;
          width: 520px;
          height: 520px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.05);
          bottom: -250px;
          right: -160px;
        }

        /* Main Card */

        .registration-card {
          width: 100%;
          max-width: 1000px;
          position: relative;
          z-index: 2;

          display: flex;

          background: white;
          border-radius: 24px;
          overflow: hidden;

          box-shadow:
            0 30px 70px rgba(0, 0, 0, 0.28);
        }

        /* Left information panel */

        .registration-left {
          width: 40%;
          padding: 55px 45px;

          display: flex;
          flex-direction: column;
          justify-content: center;

          color: white;

          background:
            linear-gradient(
              160deg,
              #1e3a8a 0%,
              #1d4ed8 55%,
              #2563eb 100%
            );
        }

        .logo-container {
          width: 75px;
          height: 75px;

          border-radius: 18px;

          display: flex;
          align-items: center;
          justify-content: center;

          overflow: hidden;

          margin-bottom: 25px;

          background: rgba(255, 255, 255, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.25);
        }

        .logo {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .system-title {
          margin: 0 0 18px;

          font-size: 31px;
          line-height: 1.15;
          font-weight: 800;

          letter-spacing: 1px;
        }

        .left-description {
          max-width: 320px;

          margin: 0 0 30px;

          color: rgba(255, 255, 255, 0.82);

          font-size: 14px;
          line-height: 1.7;
        }

        .features {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .feature {
          display: flex;
          align-items: center;
          gap: 12px;

          font-size: 14px;

          color: rgba(255, 255, 255, 0.92);
        }

        .feature-icon {
          width: 23px;
          height: 23px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 50%;

          background: rgba(255, 255, 255, 0.18);

          font-size: 13px;
          font-weight: bold;
        }

        /* Right Form */

        .registration-right {
          width: 60%;
          padding: 45px 55px;

          background: white;
        }

        .form-header {
          margin-bottom: 25px;
        }

        .form-title {
          margin: 0 0 7px;

          color: #111827;

          font-size: 31px;
          font-weight: 750;
        }

        .form-subtitle {
          margin: 0;

          color: #6b7280;

          font-size: 14px;
          line-height: 1.5;
        }

        /* Messages */

        .message {
          padding: 12px 15px;

          margin-bottom: 20px;

          border-radius: 10px;

          font-size: 13px;
          line-height: 1.5;
        }

        .error-message {
          color: #b91c1c;

          background: #fef2f2;

          border: 1px solid #fecaca;
        }

        .success-message {
          color: #166534;

          background: #f0fdf4;

          border: 1px solid #bbf7d0;
        }

        /* Form */

        .registration-form {
          width: 100%;
        }

        .input-group {
          margin-bottom: 17px;
        }

        .input-label {
          display: block;

          margin-bottom: 7px;

          color: #374151;

          font-size: 13px;
          font-weight: 650;
        }

        .input-wrapper {
          width: 100%;
          height: 47px;

          display: flex;
          align-items: center;

          border: 1px solid #d1d5db;

          border-radius: 10px;

          background: #f9fafb;

          transition: all 0.2s ease;

          overflow: hidden;
        }

        .input-wrapper:focus-within {
          border-color: #2563eb;

          background: white;

          box-shadow:
            0 0 0 3px rgba(37, 99, 235, 0.10);
        }

        .input-icon {
          width: 44px;

          display: flex;
          align-items: center;
          justify-content: center;

          color: #64748b;

          font-size: 16px;
        }

        .form-input {
          flex: 1;

          height: 100%;

          border: none;
          outline: none;

          background: transparent;

          padding: 0 12px 0 0;

          color: #111827;

          font-size: 13px;
        }

        .form-input::placeholder {
          color: #9ca3af;
        }

        /* Gender + Department + Role */

        .form-row {
          display: grid;

          grid-template-columns: 1fr 1fr;

          gap: 15px;
        }

        .form-row-full {
          display: grid;

          grid-template-columns: 1fr;

          gap: 15px;
        }

        .form-select {
          width: 100%;
          height: 47px;

          padding: 0 12px;

          border: 1px solid #d1d5db;

          border-radius: 10px;

          outline: none;

          background: #f9fafb;

          color: #374151;

          font-size: 13px;

          cursor: pointer;
        }

        .form-select:focus {
          border-color: #2563eb;

          background: white;

          box-shadow:
            0 0 0 3px rgba(37, 99, 235, 0.10);
        }

        /* Register Button */

        .register-button {
          width: 100%;
          height: 50px;

          margin-top: 5px;

          border: none;

          border-radius: 10px;

          background:
            linear-gradient(
              135deg,
              #1e40af 0%,
              #2563eb 100%
            );

          color: white;

          font-size: 14px;
          font-weight: 700;

          cursor: pointer;

          box-shadow:
            0 5px 12px rgba(30, 64, 175, 0.18);

          transition: all 0.2s ease;
        }

        .register-button:hover:not(:disabled) {
          transform: translateY(-2px);

          box-shadow:
            0 10px 20px rgba(30, 64, 175, 0.25);
        }

        .register-button:active:not(:disabled) {
          transform: translateY(0);
        }

        .register-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        /* Login section */

        .login-section {
          margin-top: 22px;

          padding-top: 20px;

          border-top: 1px solid #e5e7eb;

          text-align: center;
        }

        .login-text {
          margin: 0 0 7px;

          color: #6b7280;

          font-size: 12px;
        }

        .login-link {
          color: #1d4ed8;

          font-size: 13px;
          font-weight: 650;

          text-decoration: none;
        }

        .login-link:hover {
          text-decoration: underline;
        }

        /* Responsive Design */

        @media (max-width: 850px) {

          .registration-card {
            max-width: 650px;
          }

          .registration-left {
            display: none;
          }

          .registration-right {
            width: 100%;

            padding: 45px 50px;
          }
        }

        @media (max-width: 550px) {

          .registration-container {
            padding: 20px 12px;
          }

          .registration-card {
            border-radius: 18px;
          }

          .registration-right {
            padding: 35px 25px;
          }

          .form-title {
            font-size: 27px;
          }

          .form-row {
            grid-template-columns: 1fr;
            gap: 0;
          }

          .input-group {
            margin-bottom: 16px;
          }
        }

      `}</style>

      <div className="registration-container">

        <div className="registration-card">

          {/* LEFT SIDE */}

          <div className="registration-left">

           <div
  style={{
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '24px',
    borderRadius: '8px;'
  }}
>
  <img
    src="/egaz.jpg"
    alt="System Logo"
    style={{
      width: '100%',
      maxWidth: '150px',
      height: '140px',
      objectFit: 'contain',
      padding: '19px',
      background: 'rgba(255, 255, 255, 0.08)',
      border: '2px solid rgba(255, 255, 255, 0.25)',
      borderRadius: '70px',
      boxShadow:
        '0 10px 25px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
      backdropFilter: 'blur(6px)',
      WebkitBackdropFilter: 'blur(6px)',
    }}
    onError={(e) => {
      e.target.style.display = 'none';
    }}
  />
</div>

            <h1 className="system-title">
              INVENTORY
              <br />
              MANAGEMENT
              <br />
              SYSTEM
            </h1>

            <p className="left-description">
              Create your account and join the Inventory
              Management System. Manage your work efficiently
              from one secure platform.
            </p>

            <div className="features">

              <div className="feature">
                <span className="feature-icon">✓</span>
                <span>Easy inventory management</span>
              </div>

              <div className="feature">
                <span className="feature-icon">✓</span>
                <span>Secure staff access</span>
              </div>

              <div className="feature">
                <span className="feature-icon">✓</span>
                <span>Organized departments</span>
              </div>

            </div>

          </div>

          {/* RIGHT SIDE */}

          <div className="registration-right">

            <div className="form-header">

              <h1 className="form-title">
                Create Account
              </h1>

              <p className="form-subtitle">
                Fill in your details below to create your account
              </p>

            </div>

            {/* Error */}

            {error && (
              <div className="message error-message">
                ⚠️ {error}
              </div>
            )}

            {/* Success */}

            {success && (
              <div className="message success-message">
                ✓ {success}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="registration-form"
            >

              {/* Full Name */}

              <div className="input-group">

                <label className="input-label">
                  Full Name
                </label>

                <div className="input-wrapper">

                  <span className="input-icon">
                    👤
                  </span>

                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                    className="form-input"
                  />

                </div>

              </div>

              {/* Email */}

              <div className="input-group">

                <label className="input-label">
                  Email Address
                </label>

                <div className="input-wrapper">

                  <span className="input-icon">
                    ✉
                  </span>

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required
                    className="form-input"
                  />

                </div>

              </div>

              {/* Password */}

              <div className="input-group">

                <label className="input-label">
                  Password
                </label>

                <div className="input-wrapper">

                  <span className="input-icon">
                    🔒
                  </span>

                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a password"
                    required
                    className="form-input"
                  />

                </div>

              </div>

              {/* Gender + Department */}

              <div className="form-row">

                <div className="input-group">

                  <label className="input-label">
                    Gender
                  </label>

                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="form-select"
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

                <div className="input-group">

                  <label className="input-label">
                    Department
                  </label>

                  <select
                    name="departmentId"
                    value={formData.departmentId}
                    onChange={handleChange}
                    required
                    className="form-select"
                  >

                    {departments.length > 0 ? (

                      departments.map((dept) => (

                        <option
                          key={dept.departmentId}
                          value={dept.departmentId}
                        >
                          {dept.departmentName}
                        </option>

                      ))

                    ) : (

                      <option value="">
                        Loading departments...
                      </option>

                    )}

                  </select>

                </div>

              </div>

              {/* Phone */}

              <div className="input-group">

                <label className="input-label">
                  Phone Number
                </label>

                <div className="input-wrapper">

                  <span className="input-icon">
                    📞
                  </span>

                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                    required
                    className="form-input"
                  />

                </div>

              </div>

              {/* Role */}

              <div className="input-group">

                <label className="input-label">
                  Role
                </label>

                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                  className="form-select"
                >

                  <option value="Admin">
                    Admin
                  </option>

                  <option value="Staff">
                    Staff
                  </option>

                </select>

              </div>

              {/* Register */}

              <button
                type="submit"
                disabled={loading}
                className="register-button"
              >
                {loading
                  ? 'Creating Account...'
                  : 'Create Account →'}
              </button>

            </form>

            {/* Login */}

            <div className="login-section">

              <p className="login-text">
                Already have an account?
              </p>

              <Link
                to="/"
                className="login-link"
              >
                ← Back to Login
              </Link>

            </div>

          </div>

        </div>

      </div>
    </>
  );
};

export default Registration;


