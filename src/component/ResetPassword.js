import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const ResetPassword = () => {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        'http://localhost:8080/api/users/reset-password',
        { token, newPassword: password }
      );

      setMessage('Password reset successfully! Redirecting to login...');
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      setError(err.response?.data || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #2563eb 100%)',
      padding: 20
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 16,
        padding: 32,
        width: '100%',
        maxWidth: 420,
        boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
      }}>
        <h2 style={{ marginTop: 0, color: '#111827' }}>Reset Password</h2>
        <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 20 }}>
          Choose a new password for your account.
        </p>

        {message && (
          <div style={{
            background: '#f0fdf4', color: '#166534',
            border: '1px solid #bbf7d0', padding: 10,
            borderRadius: 8, marginBottom: 14, fontSize: 13
          }}>✓ {message}</div>
        )}

        {error && (
          <div style={{
            background: '#fef2f2', color: '#b91c1c',
            border: '1px solid #fecaca', padding: 10,
            borderRadius: 8, marginBottom: 14, fontSize: 13
          }}>⚠️ {error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <label style={{
            display: 'block', marginBottom: 6,
            fontSize: 13, fontWeight: 600, color: '#374151'
          }}>
            New Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter new password"
            required
            style={{
              width: '100%', height: 42, padding: '0 12px',
              border: '1px solid #d1d5db', borderRadius: 8,
              fontSize: 14, marginBottom: 14, outline: 'none'
            }}
          />

          <label style={{
            display: 'block', marginBottom: 6,
            fontSize: 13, fontWeight: 600, color: '#374151'
          }}>
            Confirm Password
          </label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Confirm new password"
            required
            style={{
              width: '100%', height: 42, padding: '0 12px',
              border: '1px solid #d1d5db', borderRadius: 8,
              fontSize: 14, marginBottom: 16, outline: 'none'
            }}
          />

          <button
            type="submit"
            disabled={loading || !token}
            style={{
              width: '100%', height: 44, border: 'none',
              borderRadius: 8, background: '#2563eb', color: '#fff',
              fontSize: 14, fontWeight: 700,
              cursor: (loading || !token) ? 'not-allowed' : 'pointer',
              opacity: (loading || !token) ? 0.7 : 1
            }}
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>

          {!token && (
            <p style={{ color: '#b91c1c', fontSize: 12, marginTop: 10, textAlign: 'center' }}>
              ⚠️ Missing or invalid reset token. Please use the link from your email.
            </p>
          )}
        </form>

        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 13 }}>
          <Link to="/" style={{ color: '#2563eb', textDecoration: 'none' }}>
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;