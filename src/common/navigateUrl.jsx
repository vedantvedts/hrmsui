import { useEffect } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import Login from "../component/login/login";
import Dashboard from "../component/dashboard/dashboard";
import Employee from "../component/master/Employee";
import Designation from "../component/master/designation";
import Division from "../component/master/division";
import UserManagerList from "../component/admin/userMangerList";
import FormRoleAccess from "../component/admin/roleAccess";
import Requisition from "../component/training/requisition";
import Calendar from "../component/training/calendar";
import AddEditRequisition from "../component/training/addEditRequisition";
import SignAuthority from "../component/master/signAuthority";


function AppRoutes() {

  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  // Redirect to /login if user is not logged in and not on login page
  useEffect(() => {
    const publicPaths = ["/", "/login", "/sign-up"];
    if (!user && !publicPaths.includes(location.pathname)) {
      navigate("/login");
    }
  }, [user, location.pathname, navigate]);

  const hideHeader = ["/", "/login"].includes(location.pathname);
  return (
    <>
      {!hideHeader}

      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/employee" element={<Employee />} />
        <Route path="/designation" element={<Designation />} />
        <Route path="/division" element={<Division />} />
        <Route path="/users" element={<UserManagerList />} />
        <Route path="/roleaccess" element={<FormRoleAccess />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/requisition" element={<Requisition />} />
        <Route path="/req-add-edit" element={<AddEditRequisition />} />
        <Route path="/sign-authority" element={<SignAuthority />} />
      </Routes>

    </>
  );

}
export default AppRoutes;
