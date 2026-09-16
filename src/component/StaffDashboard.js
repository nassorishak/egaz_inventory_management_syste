// StaffDashboard.jsx
import React from 'react';
import Sidebar from './Sidebar';
import links from './Links';

const StaffDashboard = () => {
  return (
    <div style={{ display: 'flex' }}>
      <Sidebar role="STAFF" links={links} />
      <div style={{ flex: 1, padding: '20px' }}>
        <h1>Staff Dashboard</h1>
        <p>Welcome, Staff! Track tasks and department updates here.</p>
      </div>
    </div>
  );
};

export default StaffDashboard;
