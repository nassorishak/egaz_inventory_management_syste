// export default Layout;
import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Links from './Links';

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Soma role kutoka localStorage
  const rawRole = (localStorage.getItem('role') || 'STAFF').trim().toUpperCase();
  const role = rawRole.replace(/[_\-\s]/g, '');

  // Chagua links sahihi
  let linkKey = 'STAFF';
  if (role === 'ADMIN') linkKey = 'ADMIN';
  if (role === 'SUPPERADMIN' || role === 'SUPERADMIN') linkKey = 'SUPPER_ADMIN';

  const links = Links[linkKey] || Links.STAFF;

  // Jina la panel
  const panelName =
    linkKey === 'ADMIN' ? 'Admin'
    : linkKey === 'SUPPER_ADMIN' ? 'Super Admin'
    : 'Staff';

  const userName =
    localStorage.getItem('userName') ||
    localStorage.getItem('name') ||
    localStorage.getItem('username') ||
    panelName;

  // Avatar color tofauti kwa kila role
  const avatarColor =
    linkKey === 'ADMIN' ? '#3b82f6'
    : linkKey === 'SUPPER_ADMIN' ? '#8b5cf6'
    : '#10b981';

  // Page titles
  const pageTitles = {
    '/admin-dashboard':       'Admin Dashboard',
    '/supper-admin-dashboard':'Super Admin Dashboard',
    '/staff-dashboard':       'Staff Dashboard',
    '/add-product':           'Add Product',
    '/add-department':        'Add Department',
    '/users':                 'Manage Users',
    '/view-product':          'View Products',
    '/manage-request':        'Manage Requests',
    '/admin-request-product': 'Request to Super Admin',
    '/my-requests':           'My Requests',
    '/view-admin-request':    'Admin Requests',
    '/request-product':       'Request Product',
    '/my-request':            'My Requests',
    '/requested-product':     'Requested Products',
  };

  const currentTitle = pageTitles[location.pathname] || 'Dashboard';

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* ============ SIDEBAR ============ */}
      <aside style={sidebarStyle}>
        {/* LOGO / BRAND */}
        <div style={brandStyle}>
          <div style={logoCircle}>📦</div>
          <div>
            <div style={brandTitle}>IMS</div>
            <div style={brandSubtitle}>{panelName}</div>
          </div>
        </div>

        {/* NAV LINKS */}
        <nav
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            padding: '10px 12px',
            flex: 1,
            overflowY: 'auto',
          }}
        >
          {links.map((link) => {
            const active = isActive(link.path);
            const isLogout = link.label === 'Logout';

            return (
              <button
                key={link.path}
                onClick={() => {
                  if (isLogout) handleLogout();
                  else navigate(link.path);
                }}
                style={{
                  ...navBtnStyle,
                  background: active ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                  color: active ? '#60a5fa' : isLogout ? '#f87171' : '#cbd5e1',
                  borderLeft: active
                    ? '3px solid #3b82f6'
                    : '3px solid transparent',
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                    e.currentTarget.style.color = '#fff';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = isLogout ? '#f87171' : '#cbd5e1';
                  }
                }}
              >
                <FontAwesomeIcon
                  icon={link.icon}
                  style={{ width: 18, fontSize: 15 }}
                />
                <span>{link.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* ============ MAIN AREA ============ */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* ============ TOP HEADER ============ */}
        <header style={topHeaderStyle}>
          {/* Page Title (kushoto) */}
          <h2 style={pageTitleStyle}>{currentTitle}</h2>

          {/* User Profile (kulia) — NAFASI YA AWALI */}
          <div style={userBoxStyle}>
            <div style={{ ...avatarStyle, background: avatarColor }}>👤</div>
            <div style={{ lineHeight: 1.2 }}>
              <div style={userNameStyle}>{userName}</div>
              <div style={userRoleStyle}>{panelName}</div>
            </div>
          </div>
        </header>

        {/* ============ PAGE CONTENT ============ */}
        <main style={{ flex: 1, background: '#f4f7fb', overflowY: 'auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

// ============ STYLES ============

const sidebarStyle = {
  width: 250,
  background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
  color: '#fff',
  display: 'flex',
  flexDirection: 'column',
  position: 'sticky',
  top: 0,
  height: '100vh',
  boxShadow: '4px 0 15px rgba(0,0,0,0.15)',
};

const brandStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: '22px 20px',
  borderBottom: '1px solid rgba(255,255,255,0.08)',
};

const logoCircle = {
  width: 42,
  height: 42,
  borderRadius: 10,
  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 22,
  boxShadow: '0 4px 10px rgba(59, 130, 246, 0.35)',
};

const brandTitle = {
  fontSize: 17,
  fontWeight: 800,
  color: '#fff',
  letterSpacing: 0.5,
};

const brandSubtitle = {
  fontSize: 11,
  color: '#94a3b8',
  fontWeight: 600,
  letterSpacing: 0.3,
  marginTop: 2,
};

const navBtnStyle = {
  width: '100%',
  border: 'none',
  padding: '11px 14px',
  borderRadius: 8,
  textAlign: 'left',
  cursor: 'pointer',
  fontSize: 13.5,
  fontWeight: 600,
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  transition: 'all 0.18s ease',
  fontFamily: 'inherit',
};

// ============ TOP HEADER ============
const topHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '18px 30px',
  background: '#ffffff',
  borderBottom: '1px solid #e2e8f0',
  position: 'sticky',
  top: 0,
  zIndex: 10,
  boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
};

const pageTitleStyle = {
  margin: 0,
  color: '#0f172a',
  fontSize: 20,
  fontWeight: 700,
};

const userBoxStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  background: '#f8fafc',
  padding: '8px 14px',
  borderRadius: 10,
  border: '1px solid #e2e8f0',
};

const avatarStyle = {
  width: 42,
  height: 42,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#fff',
  fontSize: 20,
  flexShrink: 0,
  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
};

const userNameStyle = {
  fontSize: 14,
  fontWeight: 700,
  color: '#1e293b',
};

const userRoleStyle = {
  fontSize: 11,
  color: '#64748b',
  fontWeight: 600,
  letterSpacing: 0.5,
  textTransform: 'uppercase',
};

export default Layout;