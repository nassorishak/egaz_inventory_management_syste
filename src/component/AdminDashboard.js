
import React from 'react';

const AdminDashboard = () => {
  const cards = [
    {
      title: 'Products',
      icon: '📦',
      description: 'Download a report of all registered products.',
      color: '#3b82f6',
      actions: [{ label: 'Download Product Report', path: '/api/products/report' }],
    },
    {
      title: 'Requested Products',
      icon: '📝',
      description: 'View products requested by departments and staff.',
      color: '#f97316',
      actions: [{ label: 'View Requests', path: '/manage-request' }],
    },
    {
      title: 'Departments',
      icon: '🏢',
      description: 'View all registered departments in the system.',
      color: '#10b981',
      actions: [{ label: 'List Registered Departments', path: '/add-department' }],
    },
  ];

  const handleAction = (action) => {
    if (action.label === 'Download Product Report') {
      window.open(`http://localhost:8080${action.path}`, '_blank');
    } else {
      window.location.href = action.path;
    }
  };

  return (
    <div style={{ padding: '30px' }}>
      <p style={{ margin: '0 0 24px', color: '#64748b', fontSize: 15 }}>
        Welcome to the Inventory Management System
      </p>

      {/* Dashboard Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
        }}
      >
        {cards.map((card) => (
          <div
            key={card.title}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              padding: '24px',
              border: '1px solid #e2e8f0',
              borderLeft: `5px solid ${card.color}`,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.12)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.06)';
            }}
          >
            <div
              style={{
                width: '55px',
                height: '55px',
                borderRadius: '10px',
                backgroundColor: `${card.color}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '30px',
                marginBottom: '18px',
              }}
            >
              {card.icon}
            </div>

            <h2 style={{ margin: '0 0 8px 0', color: '#1e293b', fontSize: '20px' }}>
              {card.title}
            </h2>

            <p style={{ margin: '0 0 20px 0', color: '#64748b', fontSize: '14px', lineHeight: '1.5' }}>
              {card.description}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {card.actions.map((action) => (
                <button
                  key={action.label}
                  onClick={() => handleAction(action)}
                  style={{
                    width: '100%',
                    padding: '11px 15px',
                    border: 'none',
                    borderRadius: '7px',
                    backgroundColor: card.color,
                    color: '#ffffff',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  {action.label} →
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
