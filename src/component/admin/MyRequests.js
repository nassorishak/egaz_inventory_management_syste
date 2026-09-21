

// export default  MyRequests;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const MyRequests = () => {
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const adminId = Number(localStorage.getItem('userId'));

  // ===== Fetch maombi yangu =====
  const fetchMyRequests = async () => {
    if (!adminId) {
      setError('Please log in again.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(
        `http://localhost:8080/api/admin-requests/my/${adminId}`
      );
      setRequests(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to load your requests. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ===== Kamilisha ombi (toa product kwa staff) =====
  const completeRequest = async (id) => {
    if (!window.confirm('Are you sure you want to give this product to the staff? Stock will be reduced.')) {
      return;
    }
    setActionLoading(id);
    setError('');
    setSuccess('');
    try {
      await axios.put(
        `http://localhost:8080/api/admin-requests/complete/${id}`
      );
      setSuccess('✅ Product has been given to the staff successfully!');
      fetchMyRequests();
    } catch (err) {
      const msg = err.response?.data;
      setError(typeof msg === 'string' ? msg : 'Failed to complete the request.');
    } finally {
      setActionLoading(null);
    }
  };

  // ===== Request to Admin (navigate to create-request page) =====
  const handleRequestToAdmin = () => {
    navigate('/admin-request-product');   // ⚠️ change to your real route
  };

  // ===== Stats =====
  const pending   = requests.filter((r) => r.status === 'PENDING').length;
  const approved  = requests.filter((r) => r.status === 'APPROVED').length;
  const rejected  = requests.filter((r) => r.status === 'REJECTED').length;
  const completed = requests.filter((r) => r.status === 'COMPLETED').length;

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }

        .mar-page {
          min-height: 100vh;
          background: #f4f7fb;
          padding: 35px 20px;
          font-family: Arial, Helvetica, sans-serif;
        }
        .mar-container { max-width: 1150px; margin: 0 auto; }

        .mar-header {
          margin-bottom: 25px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          flex-wrap: wrap;
        }
        .mar-header-left { flex: 1; min-width: 250px; }
        .mar-header h1 {
          margin: 0; color: #172033;
          font-size: 30px; font-weight: 700;
        }
        .mar-header p {
          margin: 8px 0 0; color: #718096;
          font-size: 15px;
        }

        /* ✅ Request to Admin button */
        .mar-request-btn {
          border: none;
          background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
          color: #fff;
          padding: 13px 24px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 6px 16px rgba(139, 92, 246, 0.35);
          transition: all 0.2s ease;
          white-space: nowrap;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .mar-request-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 22px rgba(139, 92, 246, 0.45);
        }
        .mar-request-btn:active {
          transform: translateY(0);
        }

        /* ===== STATS CARDS ===== */
        .mar-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 15px;
          margin-bottom: 25px;
        }
        .mar-stat {
          background: #fff;
          border-radius: 14px;
          padding: 18px;
          border-left: 5px solid #2563eb;
          box-shadow: 0 6px 18px rgba(15,23,42,0.06);
        }
        .mar-stat.pending   { border-left-color: #f59e0b; }
        .mar-stat.approved  { border-left-color: #16a34a; }
        .mar-stat.rejected  { border-left-color: #dc2626; }
        .mar-stat.completed { border-left-color: #2563eb; }

        .mar-stat .label {
          font-size: 12px;
          color: #64748b;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .mar-stat .value {
          font-size: 26px;
          font-weight: 800;
          color: #172033;
          margin-top: 6px;
        }

        /* ===== TABLE CARD ===== */
        .mar-card {
          background: #fff;
          border-radius: 16px;
          padding: 24px;
          border: 1px solid #edf0f5;
          box-shadow: 0 10px 30px rgba(15,23,42,0.08);
        }

        .mar-empty {
          text-align: center;
          padding: 50px 20px;
          color: #94a3b8;
        }
        .mar-empty .icon { font-size: 45px; margin-bottom: 10px; }
        .mar-empty p { margin: 0; font-size: 14px; }

        /* ===== TABLE ===== */
        .mar-table {
          width: 100%;
          border-collapse: collapse;
        }
        .mar-table thead tr {
          background: #f1f5f9;
        }
        .mar-table th {
          padding: 13px 14px;
          text-align: left;
          font-size: 12px;
          color: #334155;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.4px;
        }
        .mar-table td {
          padding: 14px;
          font-size: 13px;
          color: #475569;
          border-bottom: 1px solid #e2e8f0;
          vertical-align: middle;
        }
        .mar-table tbody tr:hover {
          background: #f8fafc;
        }

        .mar-badge {
          display: inline-block;
          padding: 5px 11px;
          border-radius: 7px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.4px;
        }
        .badge-pending   { background: #fef3c7; color: #92400e; }
        .badge-approved  { background: #dcfce7; color: #166534; }
        .badge-rejected  { background: #fee2e2; color: #991b1b; }
        .badge-completed { background: #dbeafe; color: #1e40af; }

        .mar-type {
          display: inline-block;
          padding: 5px 11px;
          border-radius: 7px;
          font-size: 11px;
          font-weight: 700;
          background: #ede9fe;
          color: #6d28d9;
        }
        .mar-type.stock {
          background: #dcfce7;
          color: #15803d;
        }

        .mar-btn {
          padding: 8px 14px;
          border: none;
          border-radius: 7px;
          background: #16a34a;
          color: #fff;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .mar-btn:hover:not(:disabled) {
          background: #15803d;
          transform: translateY(-1px);
          box-shadow: 0 5px 12px rgba(22, 163, 74, 0.25);
        }
        .mar-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .mar-note {
          font-size: 12px;
          color: #64748b;
          font-style: italic;
          max-width: 220px;
          display: inline-block;
        }

        /* ===== MESSAGES ===== */
        .mar-msg {
          margin-top: 18px;
          padding: 13px 15px;
          border-radius: 10px;
          font-size: 14px;
        }
        .mar-success {
          background: #f0fdf4;
          color: #15803d;
          border: 1px solid #bbf7d0;
        }
        .mar-error {
          background: #fef2f2;
          color: #dc2626;
          border: 1px solid #fecaca;
        }

        .mar-loading {
          text-align: center;
          padding: 50px 20px;
          color: #64748b;
          font-size: 14px;
        }

        /* ===== RESPONSIVE ===== */
        @media (max-width: 800px) {
          .mar-card { padding: 12px; overflow-x: auto; }
          .mar-table { min-width: 780px; }
          .mar-header h1 { font-size: 24px; }
          .mar-request-btn { width: 100%; justify-content: center; }
        }
      `}</style>

      <div className="mar-page">
        <div className="mar-container">

          {/* HEADER */}
          <div className="mar-header">
            <div className="mar-header-left">
              <h1>Super Admin Response</h1>
              <p>Track the status of all your requests and complete approved ones.</p>
            </div>

            {/* ✅ Request to Admin button */}
            <button
              type="button"
              className="mar-request-btn"
              onClick={handleRequestToAdmin}
            >
              📩 Request to Admin
            </button>
          </div>

          {/* STATS */}
          <div className="mar-stats">
            <div className="mar-stat pending">
              <div className="label">Pending</div>
              <div className="value">{pending}</div>
            </div>
            <div className="mar-stat approved">
              <div className="label">Approved</div>
              <div className="value">{approved}</div>
            </div>
            <div className="mar-stat rejected">
              <div className="label">Rejected</div>
              <div className="value">{rejected}</div>
            </div>
            <div className="mar-stat completed">
              <div className="label">Completed</div>
              <div className="value">{completed}</div>
            </div>
          </div>

          {/* TABLE CARD */}
          <div className="mar-card">

            {loading ? (
              <div className="mar-loading">Loading your requests...</div>
            ) : requests.length === 0 ? (
              <div className="mar-empty">
                <div className="icon">📭</div>
                <p>You have not sent any requests yet.</p>
              </div>
            ) : (
              <table className="mar-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Staff</th>
                    <th>Status</th>
                    <th>Super Admin Note</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((r) => (
                    <tr key={r.id}>
                      <td>
                        <span className={`mar-type ${r.requestType === 'STOCK_REQUEST' ? 'stock' : ''}`}>
                          {r.requestType === 'STOCK_REQUEST' ? '📦 new_product' : '📤 staff-request'}
                        </span>
                      </td>
                      <td>{r.productName || '—'}</td>
                      <td>{r.quantity}</td>
                      <td>{r.staffName || '—'}</td>
                      <td>
                        <span className={`mar-badge badge-${r.status.toLowerCase()}`}>
                          {r.status}
                        </span>
                      </td>
                      <td>
                        <span className="mar-note">
                          {r.superAdminNote || '—'}
                        </span>
                      </td>
                      <td>
                        {r.status === 'APPROVED' ? (
                          <button
                            className="mar-btn"
                            disabled={actionLoading === r.id}
                            onClick={() => completeRequest(r.id)}
                          >
                            {actionLoading === r.id ? 'Giving...' : '🎁 Give to Staff'}
                          </button>
                        ) : r.status === 'COMPLETED' ? (
                          <span style={{ color: '#16a34a', fontWeight: 600, fontSize: 12 }}>
                            ✓ Done
                          </span>
                        ) : r.status === 'REJECTED' ? (
                          <span style={{ color: '#dc2626', fontWeight: 600, fontSize: 12 }}>
                            ✕ Rejected
                          </span>
                        ) : (
                          <span style={{ color: '#f59e0b', fontWeight: 600, fontSize: 12 }}>
                            ⏳ Waiting
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {success && <div className="mar-msg mar-success">{success}</div>}
            {error && <div className="mar-msg mar-error">⚠️ {error}</div>}

          </div>

        </div>
      </div>
    </>
  );
};

export default MyRequests;