import { Routes, Route } from "react-router-dom";

import Welcome from "../pages/Welcome";
import Login from "../pages/Login";
import Register from "../pages/Register";
import OTP from "../pages/OTP";
import AccessDenied from "../pages/AccessDenied";

import ProtectedRoute from "../component/ProtectedRoute";
import Layout from "../component/Layout";
import Dashboard from "../pages/Dashboard";
import EstanciaDashboard from "../pages/EstanciaDashboards";
import Residents from "../pages/Residents";
import Certificates from "../pages/Certificates";
import Blotter from "@/pages/Blotter";
import News from "@/pages/News";
import Ordinance from "@/pages/Ordinance";
import Incidents from "@/pages/Incidents";
import Officials from "@/pages/Officials";
import EventsCalendar from "@/pages/EventsCalendar";
import EvacuationCenters from "@/pages/EvacuationCenters";
import Concern from "@/pages/Concern";
import AppUsers from "@/pages/AppUsers";


export default function AppRoutes() {
  return (
    <Routes>

      {/* PUBLIC */}
      <Route path="/" element={<Welcome />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/otp" element={<OTP />} />
      <Route path="/accessdenied" element={<AccessDenied />} />
      <Route path="/estancia/dashboard" element={<EstanciaDashboard />} />

      {/* PROTECTED (ALL LOGGED IN USERS) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/news" element={<News />} />
          <Route path="/incidents" element={<Incidents />} />
          <Route path="/evacuation-centers" element={<EvacuationCenters />} />
        </Route>
      </Route>

      {/* BDRRMO ONLY ROUTES */}
      <Route
          element={
            <ProtectedRoute allowedRoles={["bdrrmo_admin"]} />
          }
        >
          <Route element={<Layout />}>
          <Route path="/residents" element={<Residents />} />
            <Route path="/certificates" element={<Certificates />} />
            <Route path="/concerns" element={<Concern />} />
            <Route path="/blotters" element={<Blotter />} />
            <Route path="/ordinance" element={<Ordinance />} />
            <Route path="/officials" element={<Officials />} />
            <Route path="/events" element={<EventsCalendar />} />
            <Route path="/appusers" element={<AppUsers />} />
          </Route>
        </Route>

    </Routes>
  );
}