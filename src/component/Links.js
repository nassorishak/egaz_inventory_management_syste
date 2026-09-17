
import { faChartBar, faUsers, faCog, faSignOutAlt, faTasks } from '@fortawesome/free-solid-svg-icons';

const Links = {
  ADMIN: [
    { label: 'Dashboard', path: '/admin-dashboard', icon: faChartBar },
    // { label: 'Manage Users', path: '/manage-users', icon: faUsers },
    { label: 'AddProduct', path: '/add-product', icon: faCog },
    { label: 'AddDepartment', path: '/add-department', icon: faCog },
        { label: 'ManageUsers', path: '/system-users', icon: faCog },
            { label: 'ViewProduct', path: '/view-product', icon: faCog },
              { label: 'ManageRequest', path: '/manage-request', icon: faCog },
    { label: 'Logout', path: '/', icon: faSignOutAlt } 
  ],
  // STAFF: [
  //   { label: 'Dashboard', path: '/staff-dashboard', icon: faChartBar },
  //   { label: 'RequestedProduct', path: '/requested-product', icon: faTasks },
  //   { label: 'RequestProduct', path: '/request-product', icon: faCog },
  //   { label: 'RequestProduct1', path: '/requested-product1', icon: faCog },
  //   { label: 'Logout', path: '/', icon: faSignOutAlt }
  // ]
  STAFF: [
  { label: 'Dashboard',        path: '/staff-dashboard',  icon: faChartBar },
  { label: 'Request Product',  path: '/request-product',  icon: faCog },
  { label: 'My Requests',      path: '/my-request',       icon: faTasks },
  { label: 'Logout',           path: '/',                 icon: faSignOutAlt },
],
};

export default Links;
