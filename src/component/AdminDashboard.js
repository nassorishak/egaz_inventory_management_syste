// AdminDashboard.jsx
import React from 'react';
import Sidebar from './Sidebar';
import links from './Links';


const AdminDashboard = () => {
  return (
    <div style={{ display: 'flex' }}>
      <Sidebar role="ADMIN" links={links} />
      <div style={{ flex: 1, padding: '20px' }}>
        <h1>Admin Dashboard</h1>
        <p>Welcome, Admin! Manage users and system settings here.</p>
      </div>
    </div>
  );
};

export default AdminDashboard;
