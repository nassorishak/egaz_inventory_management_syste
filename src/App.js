// import React from "react";
// import { BrowserRouter, Routes, Route, Links } from "react-router-dom";
// import Login from "./component/Login";
// import Registration from "./component/Registration";
// import AddProduct from "./component/AddProduct";
// import AddDepartment from "./component/AddDepartment";
// import AdminDashboard from "./component/AdminDashboard";
// import StaffDashboard from "./component/StaffDashboard";
// import User from "./component/User";
// import ViewProduct from "./component/ViewProduct";
// import ViewRequestedProducts from "./component/ViewRequestedProduct";
// import RequestProduct from "./component/staff/RequestProduct";
// import ManageRequests from "./component/admin/ManageRequest";
// import MyRequest  from "./component/staff/MyRequest";


// function App() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         {/* <Route path="/admin-dashboard" element={<AdminDashboard />} />   */}
//          <Route path="/registration" element={<Registration />} /> 
//             <Route path="/add-product" element={<AddProduct />} />  
//                <Route path="/add-department" element={<AddDepartment />} /> 
//                <Route path="/admin-dashboard" element={<AdminDashboard />} />  
//                   <Route path="/system-users" element={<User/>} /> 
//                 <Route path="/view-product" element={<ViewProduct/>} /> 
//                 <Route path="/requested-product" element={<ViewRequestedProducts/>} /> 
//                  <Route path="/requested-product1" element={<RequestProduct/>} /> 
//                   <Route path="/my-request" element={<MyRequest/>} /> 
//                     <Route path="/manage-request" element={<ManageRequests/>} /> 
            
//          <Route path="/" element={<Login />} />
        
          
//   {/* Staff */}
//   <Route path="/staff-dashboard" element={<StaffDashboard />} />  
//       </Routes>
//     </BrowserRouter>
//   );
// }

// export default App;
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Layout from './component/Layout';


// Auth / public
import Login        from './component/Login';
import Registration from './component/Registration';

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
              to={role === 'ADMIN' ? '/admin-dashboard' : '/staff-dashboard'}
              replace
            />
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;