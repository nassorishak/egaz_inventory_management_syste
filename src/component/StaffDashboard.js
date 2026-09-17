// // StaffDashboard.jsx
// import React from 'react';
// import links from './Links';
// import { useNavigate } from 'react-router-dom';

// const StaffDashboard = () => {
//   // Get logged-in staff name from localStorage
//   const staffName =
//     localStorage.getItem('name') ||
//     localStorage.getItem('userName') ||
//     localStorage.getItem('username') ||
    
//     'Staff';
//     const navigate = useNavigate();

//  const cards = [
//     {
//       title: 'Request Product',
//       icon: '➕',
//       description:
//         'Submit a new product request to be added to the inventory.',
//       color: '#3b82f6',
//       actions: [
//         {
//           label: 'Create Request',
//           path: '/request-product',                   // ✅ staff page, not admin
//         },
//       ],
//     },
//     {
//       title: 'Requested Products',
//       icon: '📝',
//       description:
//         'View all products you have requested and their current status.',
//       color: '#f97316',
//       actions: [
//         {
//           label: 'View My Requests',
//           path: '/my-request',                       // ✅ plural, matches route
//         },
//       ],
//     },
//   ];

//   const handleAction = (action) => {
//     navigate(action.path);                            // ✅ SPA navigation
//   };
//   return (
//     <div style={{ display: 'flex' }}>
      

//       <div
//         style={{
//           flex: 1,
//           padding: '20px',
//           backgroundColor: '#f8fafc',
//           minHeight: '100vh',
//         }}
//       >
//         {/* Header */}
//         <div
//           style={{
//             display: 'flex',
//             justifyContent: 'space-between',
//             alignItems: 'center',
//             marginBottom: '30px',
//           }}
//         >
//           {/* Dashboard Title */}
//           <div>
//             <h1
//               style={{
//                 margin: '0 0 8px 0',
//                 color: '#0f172a',
//                 fontSize: '32px',
//               }}
//             >
//               Staff Dashboard
//             </h1>

//             <p
//               style={{
//                 margin: 0,
//                 color: '#64748b',
//                 fontSize: '15px',
//               }}
//             >
//               Welcome to the Inventory Management System
//             </p>
//           </div>

//           {/* Staff Profile */}
//           <div
//             style={{
//               display: 'flex',
//               alignItems: 'center',
//               gap: '12px',
//               backgroundColor: '#ffffff',
//               padding: '10px 16px',
//               borderRadius: '10px',
//               border: '1px solid #e2e8f0',
//               boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
//             }}
//           >
//             {/* Staff Icon */}
//             <div
//               style={{
//                 width: '45px',
//                 height: '45px',
//                 borderRadius: '50%',
//                 backgroundColor: '#10b981',
//                 display: 'flex',
//                 alignItems: 'center',
//                 justifyContent: 'center',
//                 color: '#ffffff',
//                 fontSize: '22px',
//               }}
//             >
//               👤
//             </div>

//             {/* Staff Information */}
//             <div>
//               <div
//                 style={{
//                   fontSize: '15px',
//                   fontWeight: '700',
//                   color: '#1e293b',
//                 }}
//               >
//                 {staffName}
//               </div>

//               <div
//                 style={{
//                   fontSize: '12px',
//                   color: '#64748b',
//                   fontWeight: '600',
//                   marginTop: '2px',
//                 }}
//               >
//                 STAFF
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Dashboard Cards */}
//         <div
//           style={{
//             display: 'grid',
//             gridTemplateColumns:
//               'repeat(auto-fit, minmax(280px, 1fr))',
//             gap: '20px',
//           }}
//         >
//           {cards.map((card) => (
//             <div
//               key={card.title}
//               style={{
//                 backgroundColor: '#ffffff',
//                 borderRadius: '12px',
//                 padding: '24px',
//                 border: '1px solid #e2e8f0',
//                 borderLeft: `5px solid ${card.color}`,
//                 boxShadow:
//                   '0 2px 8px rgba(0, 0, 0, 0.06)',
//                 transition: 'all 0.3s ease',
//               }}
//               onMouseEnter={(e) => {
//                 e.currentTarget.style.transform =
//                   'translateY(-5px)';
//                 e.currentTarget.style.boxShadow =
//                   '0 8px 20px rgba(0, 0, 0, 0.12)';
//               }}
//               onMouseLeave={(e) => {
//                 e.currentTarget.style.transform =
//                   'translateY(0)';
//                 e.currentTarget.style.boxShadow =
//                   '0 2px 8px rgba(0, 0, 0, 0.06)';
//               }}
//             >
//               {/* Icon */}
//               <div
//                 style={{
//                   width: '55px',
//                   height: '55px',
//                   borderRadius: '10px',
//                   backgroundColor: `${card.color}15`,
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'center',
//                   fontSize: '30px',
//                   marginBottom: '18px',
//                 }}
//               >
//                 {card.icon}
//               </div>

//               {/* Title */}
//               <h2
//                 style={{
//                   margin: '0 0 8px 0',
//                   color: '#1e293b',
//                   fontSize: '20px',
//                 }}
//               >
//                 {card.title}
//               </h2>

//               {/* Description */}
//               <p
//                 style={{
//                   margin: '0 0 20px 0',
//                   color: '#64748b',
//                   fontSize: '14px',
//                   lineHeight: '1.5',
//                 }}
//               >
//                 {card.description}
//               </p>

//               {/* Actions */}
//               <div
//                 style={{
//                   display: 'flex',
//                   flexDirection: 'column',
//                   gap: '10px',
//                 }}
//               >
//                 {card.actions.map((action) => (
//                   <button
//                     key={action.label}
//                     onClick={() => handleAction(action)}
//                     style={{
//                       width: '100%',
//                       padding: '11px 15px',
//                       border: 'none',
//                       borderRadius: '7px',
//                       backgroundColor: card.color,
//                       color: '#ffffff',
//                       fontSize: '14px',
//                       fontWeight: '600',
//                       cursor: 'pointer',
//                     }}
//                   >
//                     {action.label} →
//                   </button>
//                 ))}
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default StaffDashboard;

// StaffDashboard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const StaffDashboard = () => {
  const navigate = useNavigate();

  const cards = [
    {
      title: 'Request Product',
      icon: '➕',
      description: 'Submit a new product request to be added to the inventory.',
      color: '#3b82f6',
      actions: [
        {
          label: 'Create Request',
          path: '/request-product',
        },
      ],
    },
    {
      title: 'Requested Products',
      icon: '📝',
      description: 'View all products you have requested and their current status.',
      color: '#f97316',
      actions: [
        {
          label: 'View My Requests',
          path: '/my-request',
        },
      ],
    },
  ];

  const handleAction = (action) => {
    navigate(action.path);
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
            {/* Icon */}
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

            {/* Title */}
            <h2
              style={{
                margin: '0 0 8px 0',
                color: '#1e293b',
                fontSize: '20px',
              }}
            >
              {card.title}
            </h2>

            {/* Description */}
            <p
              style={{
                margin: '0 0 20px 0',
                color: '#64748b',
                fontSize: '14px',
                lineHeight: '1.5',
              }}
            >
              {card.description}
            </p>

            {/* Actions */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
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

export default StaffDashboard;