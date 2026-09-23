
// import React from 'react';
// import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// import Layout from './component/Layout';
// import ProtectedRoute from './component/ProtectedRoute';

// // Auth
// import Login        from './component/Login';
// import Registration from './component/Registration';

// // SuperAdmin
// import SupperAdminDashboard from './component/SupperAdminDashboard';
// import ViewAdminRequests     from './component/supperadmin/ViewAdminRequest';

// // Admin
// import AdminDashboard       from './component/AdminDashboard';
// import AddProduct           from './component/AddProduct';
// import AddDepartment        from './component/AddDepartment';
// import User                 from './component/User';
// import ViewProduct          from './component/ViewProduct';
// import ManageRequests       from './component/admin/ManageRequest';
// import AdminRequestProduct  from './component/admin/AdminRequestProduct';
// import MyRequests           from './component/admin/MyRequests';

// // Staff
// import StaffDashboard         from './component/StaffDashboard';
// import ViewRequestedProducts  from './component/ViewRequestedProduct';
// import RequestProduct         from './component/staff/RequestProduct';
// import MyRequest              from './component/staff/MyRequest';
// import StaffContracts from './component/staff/StaffContracts';
// import ResetPassword from './component/ResetPassword';
// import ForgotPassword from './component/ForgotPassword';

// function App() {
//   return (
//     <BrowserRouter>
//       <Routes>

//         {/* ---------- PUBLIC ---------- */}
//         <Route path="/"             element={<Login />} />
//         <Route path="/registration" element={<Registration />} />

//         {/* ---------- ALL AUTHENTICATED ROUTES — LAYOUT MOJA TU ---------- */}
//         <Route
//           element={
//             <ProtectedRoute allowedRoles={['ADMIN', 'SUPPER_ADMIN', 'SUPPERADMIN', 'SUPERADMIN', 'STAFF']}>
//               <Layout />
//             </ProtectedRoute>
//           }
//         >
//           {/* SuperAdmin */}
//           <Route path="/supper-admin-dashboard" element={<SupperAdminDashboard />} />
//           <Route path="/view-admin-request"     element={<ViewAdminRequests />} />

//           {/* Admin */}
//           <Route path="/admin-dashboard"        element={<AdminDashboard />} />
//           <Route path="/admin-request-product"  element={<AdminRequestProduct />} />
//           <Route path="/my-requests"            element={<MyRequests />} />
//           <Route path="/add-product"            element={<AddProduct />} />
//           <Route path="/add-department"         element={<AddDepartment />} />
//           <Route path="/manage-request"         element={<ManageRequests />} />
//           <Route path="/requested-product"      element={<ViewRequestedProducts />} />
//           <Route path="/requested-product1"     element={<RequestProduct />} />


//           {/* Shared */}
//           <Route path="/users"                  element={<User/>} />
//           <Route path="/view-product"           element={<ViewProduct />} />
//           <Route path="/forgot-password" element={<ForgotPassword />} />
//           <Route path="/reset-password" element={<ResetPassword />} />

//           {/* Staff */}
//           <Route path="/staff-dashboard"   element={<StaffDashboard />} />
//           <Route path="/request-product"   element={<RequestProduct />} />
//           <Route path="/my-request"        element={<MyRequest />} />
//            <Route path="/staff-cotracts"        element={<StaffContracts />} />
//         </Route>

//         {/* ---------- FALLBACK ---------- */}
//         <Route path="*" element={<Navigate to="/" replace />} />

//       </Routes>
//     </BrowserRouter>
//   );
// }

// export default App;
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Layout from './component/Layout';
import ProtectedRoute from './component/ProtectedRoute';

// Auth
import Login        from './component/Login';
import Registration from './component/Registration';

// ✅ Import these at the top
import ForgotPassword from './component/ForgotPassword';
import ResetPassword  from './component/ResetPassword';

// SuperAdmin
import SupperAdminDashboard from './component/SupperAdminDashboard';
import ViewAdminRequests     from './component/supperadmin/ViewAdminRequest';

// Admin
import AdminDashboard       from './component/AdminDashboard';
import AddProduct           from './component/AddProduct';
import AddDepartment        from './component/AddDepartment';
import User                 from './component/User';
import ViewProduct          from './component/ViewProduct';
import ManageRequests       from './component/admin/ManageRequest';
import AdminRequestProduct  from './component/admin/AdminRequestProduct';
import MyRequests           from './component/admin/MyRequests';

// Staff
import StaffDashboard         from './component/StaffDashboard';
import ViewRequestedProducts  from './component/ViewRequestedProduct';
import RequestProduct         from './component/staff/RequestProduct';
import MyRequest              from './component/staff/MyRequest';
import StaffContracts         from './component/staff/StaffContracts';
import ProductReport from './component/admin/ProductReport';

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ---------- PUBLIC ROUTES (no login required) ---------- */}
        <Route path="/"                element={<Login />} />
        <Route path="/registration"    element={<Registration />} />

        {/* ✅ MOVED HERE — accessible WITHOUT login */}
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password"  element={<ResetPassword />} />

        {/* ---------- PROTECTED ROUTES — LAYOUT ---------- */}
        <Route
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SUPPER_ADMIN', 'SUPPERADMIN', 'SUPERADMIN', 'STAFF']}>
              <Layout />
            </ProtectedRoute>
          }
        >
          {/* SuperAdmin */}
          <Route path="/supper-admin-dashboard" element={<SupperAdminDashboard />} />
          <Route path="/view-admin-request"     element={<ViewAdminRequests />} />

          {/* Admin */}
          <Route path="/admin-dashboard"        element={<AdminDashboard />} />
          <Route path="/admin-request-product"  element={<AdminRequestProduct />} />
          <Route path="/my-requests"            element={<MyRequests />} />
          <Route path="/add-product"            element={<AddProduct />} />
          <Route path="/product-report"            element={<ProductReport />} />
          <Route path="/add-department"         element={<AddDepartment />} />
          <Route path="/manage-request"         element={<ManageRequests />} />
          <Route path="/requested-product"      element={<ViewRequestedProducts />} />
          <Route path="/requested-product1"     element={<RequestProduct />} />

          {/* Shared */}
          <Route path="/users"                  element={<User />} />
          <Route path="/view-product"           element={<ViewProduct />} />

          {/* Staff */}
          <Route path="/staff-dashboard"   element={<StaffDashboard />} />
          <Route path="/request-product"   element={<RequestProduct />} />
          <Route path="/my-request"        element={<MyRequest />} />
          <Route path="/staff-cotracts"    element={<StaffContracts />} />
        </Route>

        {/* ---------- FALLBACK ---------- */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;