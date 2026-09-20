import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * ProtectedRoute — only allows access if user is logged in AND role matches.
 *
 * @param {string[]} allowedRoles - e.g. ['ADMIN'] or ['SUPPER_ADMIN']
 * @param {ReactNode} children    - the page to render
 */
const ProtectedRoute = ({ allowedRoles = [], children }) => {
  const rawRole = localStorage.getItem('role');
  const userId = localStorage.getItem('userId');

  // Not logged in at all
  if (!rawRole || !userId) {
    console.warn('🔒 ProtectedRoute: not logged in, redirecting to /');
    return <Navigate to="/" replace />;
  }

  // Normalize: "SupperAdmin" → "SUPPERADMIN"
  const role = rawRole.trim().toUpperCase();

  // Normalize underscores so "SUPPER_ADMIN" === "SUPPERADMIN"
  const normalized = role.replace(/[_\-\s]/g, '');

  const allowedNormalized = allowedRoles.map((r) =>
    r.trim().toUpperCase().replace(/[_\-\s]/g, '')
  );

  const allowed = allowedNormalized.includes(normalized);

  // Debug log — tazama console ya browser
  console.log('🔒 ProtectedRoute:', {
    rawRole,
    normalized,
    allowedNormalized,
    allowed,
  });

  if (!allowed) {
    // Wrong role → send them to their own dashboard
    if (normalized === 'ADMIN') {
      return <Navigate to="/admin-dashboard" replace />;
    }
    if (normalized === 'SUPPERADMIN' || normalized === 'SUPERADMIN') {
      return <Navigate to="/supper-admin-dashboard" replace />;
    }
    if (normalized === 'STAFF') {
      return <Navigate to="/staff-dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;