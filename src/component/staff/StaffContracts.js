import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = 'http://localhost:8080/api';

const StaffContracts = () => {
  const staffId = Number(localStorage.getItem('userId'));
  const staffName = localStorage.getItem('userName') || 'Staff';

  const [requests, setRequests] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal state
  const [openForm, setOpenForm] = useState(false);
  const [activeRequest, setActiveRequest] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    purpose: '',
    startDate: '',
    endDate: '',
    responsibilityNotes: '',
    staffSignature: '',
  });

  // ===== Load requests approved by admin + my contracts =====
  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [reqRes, ctrRes] = await Promise.all([
        axios.get(`${API}/product-requests/my-requests?userId=${staffId}`),
        axios.get(`${API}/contracts/my/${staffId}`).catch(() => ({ data: [] })),
      ]);

      setRequests(Array.isArray(reqRes.data) ? reqRes.data : []);
      setContracts(Array.isArray(ctrRes.data) ? ctrRes.data : []);
    } catch (err) {
      console.error(err);
      setError('Failed to load data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  // Which request IDs already have a contract submitted
  const contractedRequestIds = new Set(
    contracts.map((c) => c.adminRequest?.id ?? c.adminRequest?.requestId)
  );

  // ===== Open contract form =====
  const openContractForm = (request) => {
    setActiveRequest(request);
    setForm({
      purpose: '',
      startDate: '',
      endDate: '',
      responsibilityNotes:
        'I agree to use this product only for official work purposes and to return it in good condition.',
      staffSignature: staffName,
    });
    setOpenForm(true);
  };

  const closeForm = () => {
    setOpenForm(false);
    setActiveRequest(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // ===== Submit contract =====
  const submitContract = async (e) => {
    e.preventDefault();
    if (!activeRequest) return;

    if (!form.purpose.trim()) return alert('Please enter the purpose.');
    if (!form.startDate) return alert('Please choose a start date.');
    if (!form.endDate) return alert('Please choose an end date.');
    if (!form.staffSignature.trim()) return alert('Please sign your full name.');

    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      await axios.post(`${API}/contracts/create`, {
        staffId,
        requestId: activeRequest.requestId ?? activeRequest.id,
        productName: activeRequest.productName ?? '',
        quantity: activeRequest.quantity ?? 0,
        purpose: form.purpose.trim(),
        startDate: form.startDate,
        endDate: form.endDate,
        responsibilityNotes: form.responsibilityNotes.trim(),
        staffSignature: form.staffSignature.trim(),
      });

      setSuccess('✅ Contract submitted to the admin successfully!');
      closeForm();
      load();
    } catch (err) {
      console.error(err);
      setError(
        typeof err.response?.data === 'string'
          ? err.response.data
          : 'Failed to submit contract.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={page}>
      <div style={header}>
        <div>
          <h2 style={title}>My Contracts</h2>
          <p style={subtitle}>
            Fill the contract for any product approved by the admin.
          </p>
        </div>

        <button style={refreshBtn} onClick={load} disabled={loading}>
          ⟳ Refresh
        </button>
      </div>

      {error && <div style={errorBox}>⚠️ {error}</div>}
      {success && <div style={successBox}>✅ {success}</div>}

      {loading ? (
        <div style={loadingBox}>Loading...</div>
      ) : requests.length === 0 ? (
        <div style={emptyBox}>
          <div style={{ fontSize: 42, marginBottom: 10 }}>📭</div>
          <div>You have no requests yet.</div>
        </div>
      ) : (
        <div style={tableContainer}>
          <table style={table}>
            <thead>
              <tr>
                <th style={th}>Request #</th>
                <th style={th}>Product</th>
                <th style={th}>Qty</th>
                <th style={th}>Admin Note</th>
                <th style={th}>Status</th>
                <th style={th}>Contract</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => {
                const reqId = r.requestId ?? r.id;
                const alreadyContracted = contractedRequestIds.has(reqId);
                const contract = contracts.find(
                  (c) => (c.adminRequest?.id ?? c.adminRequest?.requestId) === reqId
                );

                return (
                  <tr key={reqId} style={row}>
                    <td style={td}>#{reqId}</td>
                    <td style={td}>{r.productName || '—'}</td>
                    <td style={td}>{r.quantity ?? '—'}</td>
                    <td style={{ ...td, color: '#64748b' }}>{r.adminNote || '—'}</td>
                    <td style={td}>
                      <span style={statusBadge(r.status)}>{r.status}</span>
                    </td>
                    <td style={td}>
                      {alreadyContracted ? (
                        <span style={{ color: '#16a34a', fontWeight: 700, fontSize: 12 }}>
                          ✓ Contract {contract?.status || 'SUBMITTED'}
                        </span>
                      ) : r.status === 'APPROVED' ? (
                        <button
                          style={contractBtn}
                          onClick={() => openContractForm(r)}
                        >
                          ✍️ Fill Contract
                        </button>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: 12 }}>
                          Waiting for admin
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* CONTRACT FORM MODAL */}
      {openForm && activeRequest && (
        <div style={overlay} onClick={closeForm}>
          <div style={modal} onClick={(e) => e.stopPropagation()}>
            <div style={modalHeader}>
              <div>
                <h3 style={{ margin: 0, color: '#1e293b' }}>Product Contract</h3>
                <p style={{ margin: '6px 0 0', color: '#64748b', fontSize: 13 }}>
                  {activeRequest.productName}{}
                </p>
              </div>
              <button style={closeBtn} onClick={closeForm}>×</button>
            </div>

            <form onSubmit={submitContract}>
              <div style={grid}>
                <div style={field}>
                  <label style={label}>Purpose *</label>
                  <input
                    name="purpose"
                    value={form.purpose}
                    onChange={handleChange}
                    style={input}
                    placeholder="Why do you need this product?"
                  />
                </div>

                <div style={field}>
                  <label style={label}>Date *</label>
                  <input
                    type="date"
                    name="startDate"
                    value={form.startDate}
                    onChange={handleChange}
                    style={input}
                  />
                </div>

                <div style={field}>
                  <label style={label}>End Date *</label>
                  <input
                    type="date"
                    name="endDate"
                    value={form.endDate}
                    onChange={handleChange}
                    style={input}
                  />
                </div>

                <div style={{ ...field, gridColumn: '1 / -1' }}>
                  <label style={label}>Responsibility Agreement</label>
                  <textarea
                    name="responsibilityNotes"
                    value={form.responsibilityNotes}
                    onChange={handleChange}
                    style={{ ...input, minHeight: 90, resize: 'vertical' }}
                  />
                </div>

                <div style={{ ...field, gridColumn: '1 / -1' }}>
                  <label style={label}>Signature (Type your full name) *</label>
                  <input
                    name="staffSignature"
                    value={form.staffSignature}
                    onChange={handleChange}
                    style={input}
                  />
                </div>
              </div>

              <div style={modalActions}>
                <button type="button" onClick={closeForm} style={cancelBtn} disabled={submitting}>
                  Cancel
                </button>
                <button type="submit" style={submitBtn} disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Contract'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ---------- styles ----------
const page = { padding: 30, background: '#f8fafc', minHeight: '80vh', fontFamily: 'Arial, sans-serif' };
const header = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24, gap: 16, flexWrap: 'wrap' };
const title = { margin: 0, color: '#1e293b', fontSize: 28 };
const subtitle = { marginTop: 6, color: '#64748b', fontSize: 14 };

const refreshBtn = { padding: '10px 18px', border: 'none', borderRadius: 8, background: '#2563eb', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: 14 };
const errorBox = { background: '#fee2e2', color: '#b91c1c', padding: '12px 15px', borderRadius: 8, marginBottom: 20, border: '1px solid #fecaca' };
const successBox = { background: '#f0fdf4', color: '#15803d', padding: '12px 15px', borderRadius: 8, marginBottom: 20, border: '1px solid #bbf7d0' };
const loadingBox = { background: '#fff', padding: 40, textAlign: 'center', borderRadius: 10, color: '#64748b' };
const emptyBox = { background: '#fff', padding: 50, textAlign: 'center', borderRadius: 12, color: '#475569', border: '1px dashed #cbd5e1' };

const tableContainer = { background: '#fff', borderRadius: 12, overflowX: 'auto', boxShadow: '0 4px 15px rgba(0,0,0,0.06)' };
const table = { width: '100%', borderCollapse: 'collapse', minWidth: 900 };
const th = { background: '#1e40af', color: '#fff', padding: '14px 12px', textAlign: 'left', fontSize: 14, whiteSpace: 'nowrap' };
const td = { padding: '13px 12px', borderBottom: '1px solid #e2e8f0', color: '#334155', fontSize: 14, verticalAlign: 'top' };
const row = { transition: 'background-color 0.2s' };

const statusBadge = (status) => {
  const s = (status || '').toUpperCase();
  const base = { display: 'inline-block', padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, letterSpacing: 0.3 };
  if (s === 'APPROVED') return { ...base, background: '#dcfce7', color: '#166534' };
  if (s === 'REJECTED') return { ...base, background: '#fee2e2', color: '#b91c1c' };
  if (s === 'COMPLETED') return { ...base, background: '#dbeafe', color: '#1e40af' };
  return { ...base, background: '#fef3c7', color: '#92400e' };
};

const contractBtn = { padding: '8px 14px', border: 'none', borderRadius: 7, background: '#8b5cf6', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' };

const overlay = { position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 };
const modal = { background: '#fff', borderRadius: 14, padding: 28, width: '100%', maxWidth: 620, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 50px rgba(0,0,0,0.25)' };
const modalHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 };
const closeBtn = { border: 'none', background: '#fee2e2', color: '#dc2626', width: 34, height: 34, borderRadius: '50%', fontSize: 20, cursor: 'pointer' };

const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 };
const field = { display: 'flex', flexDirection: 'column' };
const label = { fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 };
const input = { padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 7, fontSize: 14, outline: 'none' };

const modalActions = { display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 };
const cancelBtn = { padding: '10px 18px', border: '1px solid #cbd5e1', background: '#fff', color: '#475569', borderRadius: 7, cursor: 'pointer', fontWeight: 600 };
const submitBtn = { padding: '10px 22px', border: 'none', background: '#16a34a', color: '#fff', borderRadius: 7, cursor: 'pointer', fontWeight: 700 };

export default StaffContracts;