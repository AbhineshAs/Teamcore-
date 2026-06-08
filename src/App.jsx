import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import DashboardLayout from './components/DashboardLayout';

// Public pages
import Login from './pages/public/Login';
import PublicLeadCapture from './pages/public/PublicLeadCapture';
import SaleClose from './pages/public/SaleClose';
import PageNotFound from './pages/public/PageNotFound';

// Admin pages
import {
  AdminDashboard, ManageManagers, ManageHR, ManageExecutives,
  ManagerLeads, LeadsReport, AdminAssignTask, ManagerAnalytics,
  AttendanceLogs, ClosedSales, FinanceCenter, AdminProfile, AdminAllLeads
} from './pages/admin/AdminPages';

// Manager pages
import {
  ManagerDashboard, ManagerMyLeads, ManagerTasks, ManagerAssignHR,
  ManagerPipeline, ManagerTeamLeads, ManagerManageExecutives, ManagerTeamSales,
  ManagerPerformance, ManagerTeamLeaves, ManagerApplyLeave, ManagerProfile
} from './pages/manager/ManagerPages';

// HR pages
import {
  HrDashboard, HrAddExecutive, HrApplyLeave, HrAttendanceHistory,
  HrAttendance, HrTasks, HrProfile
} from './pages/hr/HrPages';

// Executive pages
import {
  ExecutiveDashboard, ExecutiveClosedSales, ExecutiveFollowups, ExecutiveLeadCapture,
  ExecutiveApplyLeave, ExecutiveTasks, ExecutiveProfile, ExecutiveAllLeads
} from './pages/executive/ExecutivePages';

import IvrCenter from './pages/ivr/IvrCenter';

function RootRedirect() {
  const { currentUser } = useAuth();
  if (currentUser) {
    return <Navigate to={`/${currentUser.role.toLowerCase()}/dashboard`} replace />;
  }
  return <Navigate to="/login" replace />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/capture-lead" element={<PublicLeadCapture />} />
          <Route path="/sale-close/:id" element={<SaleClose />} />

          {/* Admin Dashboard */}
          <Route path="/admin" element={<DashboardLayout />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="ivr" element={<IvrCenter />} />
            <Route path="manage-managers" element={<ManageManagers />} />
            <Route path="manage-hr" element={<ManageHR />} />
            <Route path="manage-executives" element={<ManageExecutives />} />
            <Route path="manager-leads" element={<ManagerLeads />} />
            <Route path="all-leads" element={<AdminAllLeads />} />
            <Route path="leads/report" element={<LeadsReport />} />
            <Route path="tasks/assign" element={<AdminAssignTask />} />
            <Route path="performance/managers" element={<ManagerAnalytics />} />
            <Route path="attendance/list" element={<AttendanceLogs />} />
            <Route path="sales" element={<ClosedSales />} />
            <Route path="finance/terminal" element={<FinanceCenter />} />
            <Route path="profile" element={<AdminProfile />} />
          </Route>

          {/* Manager Dashboard */}
          <Route path="/manager" element={<DashboardLayout />}>
            <Route path="dashboard" element={<ManagerDashboard />} />
            <Route path="ivr" element={<IvrCenter />} />
            <Route path="my-leads" element={<ManagerMyLeads />} />
            <Route path="tasks" element={<ManagerTasks />} />
            <Route path="assign-hr-task" element={<ManagerAssignHR />} />
            <Route path="pipeline" element={<ManagerPipeline />} />
            <Route path="lead-capture" element={<ManagerTeamLeads />} />
            <Route path="executives" element={<ManagerManageExecutives />} />
            <Route path="closed-sales" element={<ManagerTeamSales />} />
            <Route path="performance" element={<ManagerPerformance />} />
            <Route path="leave/requests" element={<ManagerTeamLeaves />} />
            <Route path="leave/apply" element={<ManagerApplyLeave />} />
            <Route path="profile" element={<ManagerProfile />} />
          </Route>

          {/* HR Dashboard */}
          <Route path="/hr" element={<DashboardLayout />}>
            <Route path="dashboard" element={<HrDashboard />} />
            <Route path="add-executive" element={<HrAddExecutive />} />
            <Route path="leave/apply" element={<HrApplyLeave />} />
            <Route path="attendance/all" element={<HrAttendanceHistory />} />
            <Route path="attendance" element={<HrAttendance />} />
            <Route path="tasks" element={<HrTasks />} />
            <Route path="profile" element={<HrProfile />} />
          </Route>

          {/* Executive Dashboard */}
          <Route path="/executive" element={<DashboardLayout />}>
            <Route path="dashboard" element={<ExecutiveDashboard />} />
            <Route path="ivr" element={<IvrCenter />} />
            <Route path="closed-sales" element={<ExecutiveClosedSales />} />
            <Route path="follow-ups" element={<ExecutiveFollowups />} />
            <Route path="lead-capture" element={<ExecutiveLeadCapture />} />
            <Route path="all-leads" element={<ExecutiveAllLeads />} />
            <Route path="leave/apply" element={<ExecutiveApplyLeave />} />
            <Route path="tasks" element={<ExecutiveTasks />} />
            <Route path="profile" element={<ExecutiveProfile />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
