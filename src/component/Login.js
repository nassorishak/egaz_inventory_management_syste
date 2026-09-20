
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(
        'http://localhost:8080/api/users/login',
        {
          email,
          password,
        }
      );

      const user = response.data;

      if (!user) {
        setError('Invalid credentials');
        setLoading(false);
        return;
      }

    // Save user information
localStorage.setItem('role', user.role);
localStorage.setItem('userId', user.userId);
localStorage.setItem('userName', user.userName || user.name || '');

// Navigate according to role
const role = (user.role || '').trim().toUpperCase();

if (role === 'STAFF') {
  navigate('/staff-dashboard');
} else if (role === 'ADMIN') {
  navigate('/admin-dashboard');
} else if (role === 'SUPPER-ADMIN' || role === 'SUPERADMIN' || role === 'SUPPERADMIN') {
  navigate('/super-admin-dashboard');
} else {
  setError('Access denied: invalid user role.');
}
    } catch (err) {
      console.error('Login error:', err);

      if (err.message && err.message.includes('431')) {
        setError(
          'Request header too large — clear localStorage and cookies.'
        );
      } else if (err.code === 'ERR_NETWORK') {
        setError(
          'Cannot connect to server. Please ensure backend is running.'
        );
      } else {
        setError('Invalid email or password');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Background Decoration */}
      <div style={styles.circleOne}></div>
      <div style={styles.circleTwo}></div>

      <div style={styles.card}>
        {/* Left Side */}
        <div style={styles.leftSection}>
          <div style={styles.logoContainer}>
            <img
              src="/egaz.jpg"
              alt="System Logo"
              style={styles.logo}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>

          <h1 style={styles.systemTitle}>
            INVENTORY
            <br />
            MANAGEMENT
            <br />
            SYSTEM
          </h1>

          <p style={styles.leftText}>
            Manage your inventory, staff and daily operations
            efficiently from one place.
          </p>

          <div style={styles.features}>
            <div style={styles.feature}>
              <span style={styles.featureIcon}>✓</span>
              <span>Easy inventory management</span>
            </div>

            <div style={styles.feature}>
              <span style={styles.featureIcon}>✓</span>
              <span>Secure staff access</span>
            </div>

            <div style={styles.feature}>
              <span style={styles.featureIcon}>✓</span>
              <span>Real-time information</span>
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div style={styles.rightSection}>
          <div style={styles.header}>
            <h2 style={styles.title}>WELCOME TO LOGIN </h2>
            <p style={styles.subtitle}>
              Sign in to access your dashboard
            </p>
          </div>

          {error && (
            <div style={styles.errorMessage}>
              <span style={styles.errorIcon}>!</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={styles.form}>
            {/* Email */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email Address</label>

              <div style={styles.inputWrapper}>
                <span style={styles.inputIcon}>✉</span>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  style={styles.input}
                />
              </div>
            </div>

            {/* Password */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>

              <div style={styles.inputWrapper}>
                <span style={styles.inputIcon}>🔒</span>

                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  style={styles.input}
                />
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.submitButton,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
              onMouseOver={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow =
                    '0 10px 20px rgba(30, 64, 175, 0.25)';
                }
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow =
                  '0 5px 12px rgba(30, 64, 175, 0.18)';
              }}
            >
              {loading ? (
                <>
                  <span style={styles.spinner}></span>
                  Logging in...
                </>
              ) : (
                <>
                  Login
                  <span style={styles.arrow}>→</span>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div style={styles.divider}>
            <div style={styles.line}></div>
            <span style={styles.dividerText}>OR</span>
            <div style={styles.line}></div>
          </div>

          {/* Registration */}
          <Link
            to="/registration"
            style={{
              textDecoration: 'none',
              display: 'block',
            }}
          >
            <button
              type="button"
              style={styles.secondaryButton}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#f8fafc';
                e.currentTarget.style.borderColor = '#1e40af';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
                e.currentTarget.style.borderColor = '#d1d5db';
              }}
            >
              Create New Account
            </button>
          </Link>

          <p style={styles.footerText}>
            Staff & Admin & Supper-AdminPortal
          </p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '30px 20px',
    boxSizing: 'border-box',
    position: 'relative',
    overflow: 'hidden',
    background:
      'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #2563eb 100%)',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
  },

  circleOne: {
    position: 'absolute',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.06)',
    top: '-150px',
    left: '-120px',
  },

  circleTwo: {
    position: 'absolute',
    width: '500px',
    height: '500px',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.05)',
    bottom: '-220px',
    right: '-150px',
  },

  card: {
    width: '100%',
    maxWidth: '950px',
    minHeight: '570px',
    display: 'flex',
    position: 'relative',
    zIndex: 2,
    overflow: 'hidden',
    borderRadius: '24px',
    backgroundColor: '#ffffff',
    boxShadow: '0 30px 70px rgba(0, 0, 0, 0.25)',
  },

  leftSection: {
    width: '45%',
    padding: '55px 45px',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    background:
      'linear-gradient(160deg, #1e3a8a 0%, #1d4ed8 55%, #2563eb 100%)',
    color: 'white',
  },

  logoContainer: {
    width: '75px',
    height: '75px',
    borderRadius: '18px',
    backgroundColor: 'rgba(255,255,255,0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '25px',
    overflow: 'hidden',
    border: '1px solid rgba(255,255,255,0.25)',
  },

  logo: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },

  systemTitle: {
    margin: '0 0 18px 0',
    fontSize: '32px',
    lineHeight: '1.15',
    fontWeight: '800',
    letterSpacing: '1px',
  },

  leftText: {
    fontSize: '15px',
    lineHeight: '1.7',
    color: 'rgba(255,255,255,0.82)',
    margin: '0 0 30px 0',
    maxWidth: '330px',
  },

  features: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },

  feature: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '14px',
    color: 'rgba(255,255,255,0.9)',
  },

  featureIcon: {
    width: '23px',
    height: '23px',
    borderRadius: '50%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    fontSize: '13px',
    fontWeight: 'bold',
  },

  rightSection: {
    width: '55%',
    padding: '55px 60px',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },

  header: {
    marginBottom: '30px',
  },

  title: {
    margin: '0 0 8px 0',
    color: '#111827',
    fontSize: '32px',
    fontWeight: '750',
  },

  subtitle: {
    margin: 0,
    color: '#6b7280',
    fontSize: '15px',
  },

  errorMessage: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 14px',
    marginBottom: '20px',
    borderRadius: '10px',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    color: '#b91c1c',
    fontSize: '13px',
    lineHeight: '1.4',
  },

  errorIcon: {
    minWidth: '21px',
    height: '21px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dc2626',
    color: 'white',
    fontWeight: 'bold',
    fontSize: '13px',
  },

  form: {
    width: '100%',
  },

  inputGroup: {
    marginBottom: '22px',
  },

  label: {
    display: 'block',
    marginBottom: '8px',
    color: '#374151',
    fontSize: '14px',
    fontWeight: '600',
  },

  inputWrapper: {
    height: '50px',
    display: 'flex',
    alignItems: 'center',
    border: '1px solid #d1d5db',
    borderRadius: '10px',
    backgroundColor: '#f9fafb',
    overflow: 'hidden',
    transition: 'all 0.2s ease',
  },

  inputIcon: {
    width: '45px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#64748b',
    fontSize: '17px',
  },

  input: {
    flex: 1,
    height: '100%',
    border: 'none',
    outline: 'none',
    backgroundColor: 'transparent',
    padding: '0 14px 0 0',
    fontSize: '14px',
    color: '#111827',
    boxSizing: 'border-box',
  },

  submitButton: {
    width: '100%',
    height: '52px',
    border: 'none',
    borderRadius: '10px',
    background:
      'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)',
    color: 'white',
    fontSize: '15px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    transition: 'all 0.2s ease',
    boxShadow: '0 5px 12px rgba(30, 64, 175, 0.18)',
  },

  arrow: {
    fontSize: '20px',
    lineHeight: 1,
  },

  spinner: {
    width: '16px',
    height: '16px',
    border: '2px solid rgba(255,255,255,0.4)',
    borderTop: '2px solid white',
    borderRadius: '50%',
    display: 'inline-block',
    animation: 'spin 0.8s linear infinite',
  },

  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    margin: '28px 0 20px',
  },

  line: {
    flex: 1,
    height: '1px',
    backgroundColor: '#e5e7eb',
  },

  dividerText: {
    color: '#9ca3af',
    fontSize: '11px',
    fontWeight: '600',
  },

  secondaryButton: {
    width: '100%',
    height: '50px',
    borderRadius: '10px',
    border: '1px solid #d1d5db',
    backgroundColor: 'white',
    color: '#1e40af',
    fontSize: '14px',
    fontWeight: '650',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },

  footerText: {
    textAlign: 'center',
    margin: '25px 0 0',
    color: '#9ca3af',
    fontSize: '12px',
  },
};

export default Login;

