import React from "react";
import { BrowserRouter, Routes, Route, Links } from "react-router-dom";
import Login from "./component/Login";
import Registration from "./component/Registration";
import AddProduct from "./component/AddProduct";
import AddDepartment from "./component/AddDepartment";
import AdminDashboard from "./component/AdminDashboard";
import StaffDashboard from "./component/StaffDashboard";
import User from "./component/User";
import ViewProduct from "./component/ViewProduct";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* <Route path="/admin-dashboard" element={<AdminDashboard />} />   */}
         <Route path="/registration" element={<Registration />} /> 
            <Route path="/add-product" element={<AddProduct />} />  
               <Route path="/add-department" element={<AddDepartment />} /> 
               <Route path="/admin-dashboard" element={<AdminDashboard />} />  
                  <Route path="/system-users" element={<User/>} /> 
                <Route path="/view-product" element={<ViewProduct/>} /> 
            
         <Route path="/" element={<Login />} />
        
          
  {/* Staff */}
  <Route path="/staff-dashboard" element={<StaffDashboard />} />  
      </Routes>
    </BrowserRouter>
  );
}

export default App;