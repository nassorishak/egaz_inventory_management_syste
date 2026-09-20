

// export default App;
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Layout from './component/Layout';


// Auth / public
import Login        from './component/Login';
import Registration from './component/Registration';

// SupperAdmin pages
import SupperAdminDashboard  from './component/SupperAdminDashboard';

// Admin pages
import AdminDashboard  from './component/AdminDashboard';
import AddProduct      from './component/AddProduct';
import AddDepartment   from './component/AddDepartment';
import User            from './component/User';
import ViewProduct     from './component/ViewProduct';
import ManageRequests  from './component/admin/ManageRequest';


// Staff pages
import StaffDashboard         from './component/StaffDashboard';
import ViewRequestedProducts  from './component/ViewRequestedProduct';
import RequestProduct         from './component/staff/RequestProduct';
import MyRequest              from './component/staff/MyRequest';


function App() {
  const role = (localStorage.getItem('role') || 'STAFF').toUpperCase();

  return (
    <BrowserRouter>
      <Routes>

        {/* ---------- PUBLIC (no sidebar) ---------- */}
        <Route path="/"             element={<Login />} />
        <Route path="/registration" element={<Registration />} />

          {/* ----------SUPPER ADMIN AREA (with sidebar) ---------- */}
        <Route element={<Layout role="SUPPER_ADMIN" />}>
          <Route path="/supper-admin-dashboard"  element={<SupperAdminDashboard />} />
          <Route path="/add-product"      element={<AddProduct />} />
          <Route path="/add-department"   element={<AddDepartment />} />
          <Route path="/system-users"     element={<User />} />
          <Route path="/view-product"     element={<ViewProduct />} />
          <Route path="/manage-request"   element={<ManageRequests />} />
          {/* keep these if you still want them */}
          <Route path="/requested-product"  element={<ViewRequestedProducts />} />
          <Route path="/requested-product1" element={<RequestProduct />} />
        </Route>

        {/* ---------- ADMIN AREA (with sidebar) ---------- */}
        <Route element={<Layout role="ADMIN" />}>
          <Route path="/admin-dashboard"  element={<AdminDashboard />} />
          <Route path="/add-product"      element={<AddProduct />} />
          <Route path="/add-department"   element={<AddDepartment />} />
          <Route path="/system-users"     element={<User />} />
          <Route path="/view-product"     element={<ViewProduct />} />
          <Route path="/manage-request"   element={<ManageRequests />} />
          {/* keep these if you still want them */}
          <Route path="/requested-product"  element={<ViewRequestedProducts />} />
          <Route path="/requested-product1" element={<RequestProduct />} />
        </Route>

        

        {/* ---------- STAFF AREA (with sidebar) ---------- */}
        <Route element={<Layout role="STAFF" />}>
          <Route path="/staff-dashboard"  element={<StaffDashboard />} />
          <Route path="/request-product"  element={<RequestProduct />} />
          <Route path="/my-request"       element={<MyRequest />} />
          <Route path="/requested-product"  element={<ViewRequestedProducts />} />
        </Route>

       {/* ---------- Fallback ---------- */}
<Route
  path="*"
  element={
    <Navigate
      to={
        role === 'ADMIN'
          ? '/admin-dashboard'
          : role === 'SUPPERADMIN' || role === 'SUPERADMIN' || role === 'SUPPER_ADMIN'
          ? '/supper-admin-dashboard'
          : role === 'STAFF'
          ? '/staff-dashboard'
          : '/'
      }
      replace
    />
  }
/>

      </Routes>
    </BrowserRouter>
  );
}

export default App;