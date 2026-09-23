

import { faChartBar, faUsers, faCog, faSignOutAlt, faTasks } from '@fortawesome/free-solid-svg-icons';

const Links = {
 ADMIN: [
  { label: 'AdminDashboard',              path: '/admin-dashboard',        icon: faChartBar },
  { label: 'Super Admin Response',   path: '/my-requests',            icon: faTasks },
  // { label: 'Request to Super Admin', path: '/admin-request-product',  icon: faUsers },
  // { label: 'Add Product',            path: '/add-product',            icon: faCog },
  // { label: 'Add Department',         path: '/add-department',         icon: faCog },
  { label: 'Manage Users',           path: '/users',                  icon: faCog },
  { label: 'View Product',           path: '/view-product',           icon: faCog },
  { label: 'Manage Requests',        path: '/manage-request',         icon: faCog },
   { label: 'productReport',        path: '/product-report',         icon: faCog },
  { label: 'Logout',                 path: '/',                       icon: faSignOutAlt },
],
  SUPPER_ADMIN: [
    { label: 'SupperAdminDashboard',           path: '/supper-admin-dashboard', icon: faChartBar },
    { label: 'Admin Requests',      path: '/view-admin-request',     icon: faUsers },
    { label: 'Manage Users',        path: '/users',           icon: faCog },
    { label: 'View Product',        path: '/view-product',           icon: faCog },
    { label: 'Logout',              path: '/',                       icon: faSignOutAlt },
  ],

  STAFF: [
    { label: 'StaffDashboard',        path: '/staff-dashboard',  icon: faChartBar },
    { label: 'StaffContracts',  path: '/staff-cotracts',  icon: faCog },
    { label: 'My Request',      path: '/my-request',       icon: faTasks },
    { label: 'Logout',           path: '/',                 icon: faSignOutAlt },
  ],
};

export default Links;
