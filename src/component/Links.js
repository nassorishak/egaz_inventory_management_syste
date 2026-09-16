// navLinks.js
import { faChartBar, faUsers, faCog, faSignOutAlt, faTasks } from '@fortawesome/free-solid-svg-icons';

const Links = {
  ADMIN: [
    { label: 'Dashboard', path: '/admin-dashboard', icon: faChartBar },
    { label: 'Manage Users', path: '/manage-users', icon: faUsers },
    { label: 'AddProduct', path: '/add-product', icon: faCog },
    { label: 'AddDepartment', path: '/add-department', icon: faCog },
        { label: 'User', path: '/system-users', icon: faCog },
            { label: 'ViewProduct', path: '/view-product', icon: faCog },
    { label: 'Logout', path: '/', icon: faSignOutAlt } 
  ],
  STAFF: [
    { label: 'Dashboard', path: '/staff-dashboard', icon: faChartBar },
    { label: 'My Tasks', path: '/tasks', icon: faTasks },
    { label: 'Department Updates', path: '/announcements', icon: faCog },
    { label: 'Logout', path: '/', icon: faSignOutAlt }
  ]
};

export default Links;
