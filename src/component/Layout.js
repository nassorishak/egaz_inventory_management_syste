// import React from 'react';
// import { Outlet } from 'react-router-dom';
// import Sidebar from './Sidebar';
// import Links from './Links';     

// const Layout = ({ role }) => {
//   return (
//     <div style={{ display: 'flex', minHeight: '100vh' }}>
//       <Sidebar role={role} links={Links} />

//       <div
//         style={{
//           flex: 1,
//           backgroundColor: '#f8fafc',
//           minHeight: '100vh',
//           overflowY: 'auto',
//         }}
//       >
//         <Outlet />
//       </div>
//     </div>
//   );
// };

// export default Layout;
// import React from 'react';
// import { Outlet, useLocation } from 'react-router-dom';

// import Links from './Links';

// const Layout = ({ role }) => {
//   const location = useLocation();

//   // Chukua taarifa za mtumiaji kutoka localStorage
//   const userName =
//     localStorage.getItem('name') ||
//     localStorage.getItem('userName') ||
//     localStorage.getItem('username') ||
//     (role === 'ADMIN' ? 'Admin' : 'Staff');

//   // Rangi tofauti kwa admin na staff
//   const avatarColor = role === 'ADMIN' ? '#3b82f6' : '#10b981';

//   // Jina la ukurasa — linabadilika kulingana na URL
//   const pageTitles = {
//     // Admin
//     '/admin-dashboard': 'Admin Dashboard',
//     '/add-product':     'Add Product',
//     '/add-department':  'Add Department',
//     '/system-users':    'Manage Users',
//     '/view-product':    'View Products',
//     '/manage-request':  'Manage Requests',
//     // Staff
//     '/staff-dashboard': 'Staff Dashboard',
//     '/request-product': 'Request Product',
//     '/my-request':      'My Requests',
//     '/requested-product': 'Requested Products',
//   };

//   const currentTitle = pageTitles[location.pathname] || 'Dashboard';

//   return (
//     <div style={{ display: 'flex', minHeight: '100vh' }}>
//         <div
//         style={{
//           flex: 1,
//           backgroundColor: '#f8fafc',
//           minHeight: '100vh',
//           overflowY: 'auto',
//         }}
//       >
//         {/* ---------- TOP HEADER (inaonekana kwenye kila page) ---------- */}
//         <div
//           style={{
//             display: 'flex',
//             justifyContent: 'space-between',
//             alignItems: 'center',
//             padding: '20px 30px',
//             backgroundColor: '#ffffff',
//             borderBottom: '1px solid #e2e8f0',
//             position: 'sticky',
//             top: 0,
//             zIndex: 10,
//           }}
//         >
//           {/* Page Title */}
//           <h2
//             style={{
//               margin: 0,
//               color: '#0f172a',
//               fontSize: '20px',
//               fontWeight: 700,
//             }}
//           >
//             {currentTitle}
//           </h2>

//           {/* User Profile (Admin / Staff) */}
//           <div
//             style={{
//               display: 'flex',
//               alignItems: 'center',
//               gap: 12,
//               backgroundColor: '#f8fafc',
//               padding: '8px 14px',
//               borderRadius: 10,
//               border: '1px solid #e2e8f0',
//             }}
//           >
//             <div
//               style={{
//                 width: 42,
//                 height: 42,
//                 borderRadius: '50%',
//                 backgroundColor: avatarColor,
//                 display: 'flex',
//                 alignItems: 'center',
//                 justifyContent: 'center',
//                 color: '#fff',
//                 fontSize: 20,
//               }}
//             >
//               👤
//             </div>

//             <div style={{ lineHeight: 1.2 }}>
//               <div
//                 style={{
//                   fontSize: 14,
//                   fontWeight: 700,
//                   color: '#1e293b',
//                 }}
//               >
//                 {userName}
//               </div>
//               <div
//                 style={{
//                   fontSize: 11,
//                   color: '#64748b',
//                   fontWeight: 600,
//                   letterSpacing: 0.5,
//                 }}
//               >
//                 {role}
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* ---------- PAGE CONTENT ---------- */}
//         <Outlet />
//       </div>
//     </div>
//   );
// };

// export default Layout;

import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';       // ✅ import Sidebar
import Links from './Links';           // ✅ import links map

const Layout = ({ role }) => {
  const location = useLocation();

  const userName =
    localStorage.getItem('name') ||
    localStorage.getItem('userName') ||
    localStorage.getItem('username') ||
    (role === 'ADMIN' ? 'Admin' : 'Staff');

  const avatarColor = role === 'ADMIN' ? '#3b82f6' : '#10b981';

  const pageTitles = {
    '/admin-dashboard': 'Admin Dashboard',
    '/add-product':     'Add Product',
    '/add-department':  'Add Department',
    '/system-users':    'Manage Users',
    '/view-product':    'View Products',
    '/manage-request':  'Manage Requests',
    '/staff-dashboard': 'Staff Dashboard',
    '/request-product': 'Request Product',
    '/my-request':      'My Requests',
    '/requested-product': 'Requested Products',
  };

  const currentTitle = pageTitles[location.pathname] || 'Dashboard';

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* ✅ SIDEBAR — mounted once, stays across all pages */}
      <Sidebar role={role} links={Links} />

      {/* Content area — changes on every navigation */}
      <div
        style={{
          flex: 1,
          backgroundColor: '#f8fafc',
          minHeight: '100vh',
          overflowY: 'auto',
        }}
      >
        {/* TOP HEADER (page title + profile) */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '20px 30px',
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            position: 'sticky',
            top: 0,
            zIndex: 10,
          }}
        >
          <h2
            style={{
              margin: 0,
              color: '#0f172a',
              fontSize: '20px',
              fontWeight: 700,
            }}
          >
            {currentTitle}
          </h2>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              backgroundColor: '#f8fafc',
              padding: '8px 14px',
              borderRadius: 10,
              border: '1px solid #e2e8f0',
            }}
          >
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: '50%',
                backgroundColor: avatarColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 20,
              }}
            >
              👤
            </div>

            <div style={{ lineHeight: 1.2 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b' }}>
                {userName}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: '#64748b',
                  fontWeight: 600,
                  letterSpacing: 0.5,
                }}
              >
                {role}
              </div>
            </div>
          </div>
        </div>

        {/* PAGE CONTENT */}
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;