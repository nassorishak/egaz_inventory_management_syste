import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [devLink, setDevLink] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setDevLink('');
    setLoading(true);

    try {
      const res = await axios.post(
        'http://localhost:8080/api/users/forgot-password',
        { email: email.trim() }
      );

      setMessage(res.data.message || 'Reset link generated.');

      // ✅ Weka link kwenye state ili ionekane kwenye page
      if (res.data.resetLink) {
        setDevLink(res.data.resetLink);
      }
    } catch (err) {
      setError(err.response?.data || 'Something went wrong.');
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
        maxWidth: 460,
        boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
      }}>
        <h2 style={{ marginTop: 0, color: '#111827' }}>Forgot Password?</h2>
        <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 20 }}>
          Enter your email to generate a reset link.
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
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            style={{
              width: '100%', height: 42, padding: '0 12px',
              border: '1px solid #d1d5db', borderRadius: 8,
              fontSize: 14, marginBottom: 16, outline: 'none'
            }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', height: 44, border: 'none',
              borderRadius: 8, background: '#2563eb', color: '#fff',
              fontSize: 14, fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Generating...' : 'Get Reset Link'}
          </button>
        </form>

        {/* ✅ Link inaonekana hapa */}
        {devLink && (
          <div style={{
            background: '#f3f4f6',
            border: '1px dashed #9ca3af',
            padding: 14,
            borderRadius: 8,
            marginTop: 18,
            fontSize: 12,
            wordBreak: 'break-all'
          }}>
            <div style={{ marginBottom: 8, color: '#374151', fontWeight: 700 }}>
              🔗 DEV Reset Link (click to reset):
            </div>
            <Link
              to={`/reset-password?token=${devLink.split('token=')[1]}`}
              style={{
                color: '#2563eb',
                textDecoration: 'underline',
                fontSize: 13
              }}
            >
              → Go to Reset Password Page
            </Link>
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 13 }}>
          <Link to="/" style={{ color: '#2563eb', textDecoration: 'none' }}>
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;