// Sidebar.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const Sidebar = ({ role, links }) => {
  const roleLinks = links[role];

  return (
    <nav style={styles.sidebar}>
      {roleLinks.map((item) => (
        <Link key={item.path} to={item.path} style={styles.link}>
          <FontAwesomeIcon icon={item.icon} style={styles.icon} />
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  );
};

const styles = {
  sidebar: {
    width: '220px',
    backgroundColor: '#1f2937',
    minHeight: '100vh',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  link: {
    color: '#f9fafb',
    textDecoration: 'none',
    fontSize: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px',
    borderRadius: '6px',
    transition: 'background-color 0.2s'
  },
  icon: {
    fontSize: '18px'
  }
};

export default Sidebar;
