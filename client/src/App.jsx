import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/useAuthStore'
import DashboardLayout from './layouts/DashboardLayout'
import AuthLayout from './layouts/AuthLayout'
import Login from './pages/auth/Login'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'
import Dashboard from './pages/dashboard/Dashboard'
import Profile from './pages/profile/Profile'
import Settings from './pages/settings/Settings'
import NotFound from './pages/NotFound'
import Forbidden from './pages/Forbidden'
import ServerError from './pages/ServerError'
import { Toaster } from './components/ui/toaster'
import EmployeeList from './pages/hrms/EmployeeList'
import EmployeeProfile from './pages/hrms/EmployeeProfile'
import Departments from './pages/hrms/Departments'
import Designations from './pages/hrms/Designations'
import EmploymentTypes from './pages/hrms/EmploymentTypes'
import OrgStructure from './pages/hrms/OrgStructure'
import KioskLayout from './pages/kiosk/KioskLayout'
import KioskSuccess from './pages/kiosk/KioskSuccess'
import AttendanceDashboard from './pages/attendance/AttendanceDashboard'
import AttendanceAnalytics from './pages/attendance/AttendanceAnalytics'
import AttendanceReports from './pages/attendance/AttendanceReports'
import AttendanceCorrections from './pages/attendance/AttendanceCorrections'
import PayrollDashboard from './pages/payroll/PayrollDashboard'
import AttendanceHistory from './pages/attendance/AttendanceHistory'
import AttendanceSettings from './pages/attendance/AttendanceSettings'
import ShiftDashboard from './pages/shift/ShiftDashboard'
import ShiftList from './pages/shift/ShiftList'
import ShiftCalendar from './pages/shift/ShiftCalendar'
import ShiftAssignment from './pages/shift/ShiftAssignment'
import ShiftAssignmentsList from './pages/shift/ShiftAssignmentsList'
import ShiftRequests from './pages/shift/ShiftRequests'
import LeaveDashboard from './pages/leave/LeaveDashboard'
import LeaveTypes from './pages/leave/LeaveTypes'
import LeaveBalance from './pages/leave/LeaveBalance'
import LeaveRequests from './pages/leave/LeaveRequests'
import LeaveCalendar from './pages/leave/LeaveCalendar'
import HolidayCalendar from './pages/leave/HolidayCalendar'
import LeaveReports from './pages/leave/LeaveReports'
import MemberDirectory from './pages/members/MemberDirectory'
import MemberRegistration from './pages/members/MemberRegistration'
import MemberProfile from './pages/members/MemberProfile'
import BillingDashboard from './pages/billing/BillingDashboard'
// PT Module
import PTCalendar from './pages/pt/PTCalendar'
import MemberFitnessHub from './pages/pt/MemberFitnessHub'
import BodyMeasurements from './pages/pt/BodyMeasurements'
import WorkoutNotes from './pages/pt/WorkoutNotes'
import ClientFeedback from './pages/pt/ClientFeedback'
import PTProgress from './pages/pt/PTProgress'
import ClientProgressProfile from './pages/pt/ClientProgressProfile'
import PTEarnings from './pages/pt/PTEarnings'
import TrainerLeaderboard from './pages/pt/TrainerLeaderboard'
import PTDashboard from './pages/pt/PTDashboard'
import ExpensesDashboard from './pages/expenses/ExpensesDashboard'
import AssetsDashboard from './pages/assets/AssetsDashboard'
import SecurityDashboard from './pages/security/SecurityDashboard'
import KioskTerminal from './pages/kiosk/KioskTerminal'
import SalesReport from './pages/reports/SalesReport'
import FinanceReport from './pages/reports/FinanceReport'
import ComprehensiveReports from './pages/reports/ComprehensiveReports'
import AnalyticsDashboard from './pages/analytics/AnalyticsDashboard'
import CafeDashboard from './pages/cafe/CafeDashboard'
import CleaningDashboard from './pages/cleaning/CleaningDashboard'
import Notifications from './pages/notifications/Notifications'
import ChatPage from './pages/chat/ChatPage'
import SubscriptionsDashboard from './pages/subscriptions/SubscriptionsDashboard'
import EquipmentDashboard from './pages/equipment/EquipmentDashboard'
import TaskBoard from './pages/tasks/TaskBoard'
import MyTasks from './pages/tasks/MyTasks'
import DocumentCenter from './pages/documents/DocumentCenter'
import TransformationTimeline from './pages/pt/TransformationTimeline'
import ClientPhotos from './pages/pt/ClientPhotos'

// A simple protected route wrapper
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthStore()
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  return children
}

// RBAC wrapper
function RoleProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, hasRole } = useAuthStore()
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  const hasAccess = allowedRoles.some(role => hasRole(role))
  if (!hasAccess) {
    return <Navigate to="/403" replace />
  }

  return children
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Route>

        {/* Protected Dashboard Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="chat" element={<RoleProtectedRoute allowedRoles={['OWNER', 'MANAGER', 'TRAINER', 'RECEPTION', 'CAFE', 'CLEANING']}><ChatPage /></RoleProtectedRoute>} />
          
          <Route 
            path="settings" 
            element={
              <RoleProtectedRoute allowedRoles={['OWNER']}>
                <Settings />
              </RoleProtectedRoute>
            } 
          />

          <Route 
            path="employees" 
            element={
              <RoleProtectedRoute allowedRoles={['OWNER', 'MANAGER']}>
                <EmployeeList />
              </RoleProtectedRoute>
            } 
          />
          <Route 
            path="employees/:id" 
            element={
              <RoleProtectedRoute allowedRoles={['OWNER', 'MANAGER']}>
                <EmployeeProfile />
              </RoleProtectedRoute>
            } 
          />
          <Route 
            path="departments" 
            element={
              <RoleProtectedRoute allowedRoles={['OWNER']}>
                <Departments />
              </RoleProtectedRoute>
            } 
          />
          <Route 
            path="designations" 
            element={
              <RoleProtectedRoute allowedRoles={['OWNER']}>
                <Designations />
              </RoleProtectedRoute>
            } 
          />
          <Route 
            path="employment-types" 
            element={
              <RoleProtectedRoute allowedRoles={['OWNER']}>
                <EmploymentTypes />
              </RoleProtectedRoute>
            } 
          />
          <Route 
            path="org-structure" 
            element={
              <RoleProtectedRoute allowedRoles={['OWNER']}>
                <OrgStructure />
              </RoleProtectedRoute>
            } 
          />
          <Route path="attendance" element={<RoleProtectedRoute allowedRoles={['OWNER', 'MANAGER']}><AttendanceDashboard /></RoleProtectedRoute>} />
          <Route path="attendance/analytics" element={<RoleProtectedRoute allowedRoles={['OWNER', 'MANAGER']}><AttendanceAnalytics /></RoleProtectedRoute>} />
          <Route path="attendance/reports" element={<RoleProtectedRoute allowedRoles={['OWNER', 'MANAGER']}><AttendanceReports /></RoleProtectedRoute>} />
          <Route path="attendance/payroll-summary" element={<RoleProtectedRoute allowedRoles={['OWNER', 'MANAGER']}><PayrollDashboard /></RoleProtectedRoute>} />
          
          {/* Reports & Analytics */}
          <Route path="analytics" element={<RoleProtectedRoute allowedRoles={['OWNER', 'MANAGER']}><AnalyticsDashboard /></RoleProtectedRoute>} />
          <Route path="reports/sales" element={<RoleProtectedRoute allowedRoles={['OWNER', 'MANAGER']}><SalesReport /></RoleProtectedRoute>} />
          <Route path="reports/finance" element={<RoleProtectedRoute allowedRoles={['OWNER', 'MANAGER']}><FinanceReport /></RoleProtectedRoute>} />
          <Route path="reports/comprehensive" element={<RoleProtectedRoute allowedRoles={['OWNER', 'MANAGER', 'ADMIN']}><ComprehensiveReports /></RoleProtectedRoute>} />

          {/* Facilities */}
          <Route path="equipment" element={<RoleProtectedRoute allowedRoles={['OWNER', 'MANAGER']}><EquipmentDashboard /></RoleProtectedRoute>} />
          <Route path="cafe" element={<RoleProtectedRoute allowedRoles={['OWNER', 'CAFE']}><CafeDashboard /></RoleProtectedRoute>} />
          <Route path="cleaning" element={<RoleProtectedRoute allowedRoles={['OWNER', 'MANAGER', 'CLEANING']}><CleaningDashboard /></RoleProtectedRoute>} />


          {/* System */}
          <Route path="notifications" element={<RoleProtectedRoute allowedRoles={['OWNER', 'MANAGER', 'TRAINER', 'RECEPTION', 'CAFE', 'CLEANING']}><Notifications /></RoleProtectedRoute>} />
          
          <Route path="attendance/corrections" element={<RoleProtectedRoute allowedRoles={['OWNER', 'MANAGER']}><AttendanceCorrections /></RoleProtectedRoute>} />
          <Route path="payroll" element={<RoleProtectedRoute allowedRoles={['OWNER', 'MANAGER']}><PayrollDashboard /></RoleProtectedRoute>} />
          <Route 
            path="attendance/history" 
            element={
              <RoleProtectedRoute allowedRoles={['OWNER', 'MANAGER']}>
                <AttendanceHistory />
              </RoleProtectedRoute>
            } 
          />
          <Route 
            path="attendance/settings" 
            element={
              <RoleProtectedRoute allowedRoles={['OWNER', 'MANAGER']}>
                <AttendanceSettings />
              </RoleProtectedRoute>
            } 
          />
          {/* Leave Management Routes */}
          <Route path="leave">
            <Route index element={
              <RoleProtectedRoute allowedRoles={['OWNER', 'MANAGER', 'TRAINER', 'RECEPTION', 'CAFE', 'CLEANING']}>
                <LeaveDashboard />
              </RoleProtectedRoute>
            } />
            <Route path="types" element={
              <RoleProtectedRoute allowedRoles={['OWNER', 'MANAGER']}>
                <LeaveTypes />
              </RoleProtectedRoute>
            } />
            <Route path="balances" element={
              <RoleProtectedRoute allowedRoles={['OWNER', 'MANAGER']}>
                <LeaveBalance />
              </RoleProtectedRoute>
            } />
            <Route path="requests" element={
              <RoleProtectedRoute allowedRoles={['OWNER', 'MANAGER', 'TRAINER', 'RECEPTION', 'CAFE', 'CLEANING']}>
                <LeaveRequests />
              </RoleProtectedRoute>
            } />
            <Route path="calendar" element={
              <RoleProtectedRoute allowedRoles={['OWNER', 'MANAGER', 'TRAINER', 'RECEPTION', 'CAFE', 'CLEANING']}>
                <LeaveCalendar />
              </RoleProtectedRoute>
            } />
            <Route path="holidays" element={
              <RoleProtectedRoute allowedRoles={['OWNER', 'MANAGER', 'TRAINER', 'RECEPTION', 'CAFE', 'CLEANING']}>
                <HolidayCalendar />
              </RoleProtectedRoute>
            } />
            <Route path="reports" element={
              <RoleProtectedRoute allowedRoles={['OWNER', 'MANAGER']}>
                <LeaveReports />
              </RoleProtectedRoute>
            } />
          </Route>
          
          {/* Shift Management Routes */}
          <Route path="shifts" element={<RoleProtectedRoute allowedRoles={['OWNER', 'MANAGER']}><ShiftDashboard /></RoleProtectedRoute>} />
          <Route path="shifts/list" element={<RoleProtectedRoute allowedRoles={['OWNER', 'MANAGER']}><ShiftList /></RoleProtectedRoute>} />
          <Route path="pt">
            <Route path="dashboard" element={<RoleProtectedRoute allowedRoles={['TRAINER']}><PTDashboard /></RoleProtectedRoute>} />
            <Route path="calendar" element={<RoleProtectedRoute allowedRoles={['OWNER', 'MANAGER', 'TRAINER']}><PTCalendar /></RoleProtectedRoute>} />
            <Route path="fitness" element={<RoleProtectedRoute allowedRoles={['OWNER', 'MANAGER', 'TRAINER']}><MemberFitnessHub /></RoleProtectedRoute>} />
            <Route path="progress" element={<RoleProtectedRoute allowedRoles={['OWNER', 'MANAGER', 'TRAINER']}><PTProgress /></RoleProtectedRoute>} />
            <Route path="photos" element={<RoleProtectedRoute allowedRoles={['OWNER', 'MANAGER', 'TRAINER']}><ClientPhotos /></RoleProtectedRoute>} />
            <Route path="timeline/:memberId" element={<RoleProtectedRoute allowedRoles={['OWNER', 'MANAGER', 'TRAINER']}><TransformationTimeline /></RoleProtectedRoute>} />
            <Route path="notes" element={<RoleProtectedRoute allowedRoles={['OWNER', 'MANAGER', 'TRAINER']}><WorkoutNotes /></RoleProtectedRoute>} />
            <Route path="measurements" element={<RoleProtectedRoute allowedRoles={['OWNER', 'MANAGER', 'TRAINER']}><BodyMeasurements /></RoleProtectedRoute>} />
            <Route path="feedback" element={<RoleProtectedRoute allowedRoles={['OWNER', 'MANAGER', 'TRAINER']}><ClientFeedback /></RoleProtectedRoute>} />
            <Route path="earnings" element={<RoleProtectedRoute allowedRoles={['OWNER', 'MANAGER', 'TRAINER']}><PTEarnings /></RoleProtectedRoute>} />
            <Route path="performance" element={<RoleProtectedRoute allowedRoles={['OWNER', 'MANAGER', 'TRAINER']}><TrainerLeaderboard /></RoleProtectedRoute>} />
            <Route path="members/:id/progress" element={<RoleProtectedRoute allowedRoles={['OWNER', 'MANAGER', 'TRAINER']}><ClientProgressProfile /></RoleProtectedRoute>} />
            <Route path="leaderboard" element={<RoleProtectedRoute allowedRoles={['OWNER', 'MANAGER', 'TRAINER']}><TrainerLeaderboard /></RoleProtectedRoute>} />
          </Route>
          <Route path="shifts/calendar" element={<RoleProtectedRoute allowedRoles={['OWNER', 'MANAGER']}><ShiftCalendar /></RoleProtectedRoute>} />
          <Route path="shifts/assign" element={<RoleProtectedRoute allowedRoles={['OWNER', 'MANAGER']}><ShiftAssignment /></RoleProtectedRoute>} />
          <Route path="shifts/assignments/list" element={<RoleProtectedRoute allowedRoles={['OWNER', 'MANAGER']}><ShiftAssignmentsList /></RoleProtectedRoute>} />
          <Route path="shifts/requests" element={<RoleProtectedRoute allowedRoles={['OWNER', 'MANAGER', 'TRAINER', 'RECEPTION', 'CAFE', 'CLEANING']}><ShiftRequests /></RoleProtectedRoute>} />
          
          {/* Members Routes */}
          <Route path="members">
            <Route index element={
              <RoleProtectedRoute allowedRoles={['OWNER', 'MANAGER', 'RECEPTION', 'TRAINER']}>
                <MemberDirectory />
              </RoleProtectedRoute>
            } />
            <Route path="new" element={
              <RoleProtectedRoute allowedRoles={['OWNER', 'MANAGER', 'RECEPTION']}>
                <MemberRegistration />
              </RoleProtectedRoute>
            } />
            <Route path=":id" element={
              <RoleProtectedRoute allowedRoles={['OWNER', 'MANAGER', 'RECEPTION', 'TRAINER']}>
                <MemberProfile />
              </RoleProtectedRoute>
            } />
            <Route path=":id/edit" element={
              <RoleProtectedRoute allowedRoles={['OWNER', 'MANAGER', 'RECEPTION']}>
                <MemberRegistration />
              </RoleProtectedRoute>
            } />
          </Route>
          
          {/* PT Module Routes (Removed Duplicate) */}

          {/* Memberships & Billing Routes */}
          <Route 
            path="subscriptions" 
            element={
              <RoleProtectedRoute allowedRoles={['OWNER', 'MANAGER']}>
                <SubscriptionsDashboard />
              </RoleProtectedRoute>
            } 
          />
          <Route 
            path="billing" 
            element={
              <RoleProtectedRoute allowedRoles={['OWNER']}>
                <BillingDashboard />
              </RoleProtectedRoute>
            } 
          />
          {/* Operations Routes */}
          <Route 
            path="tasks" 
            element={
              <RoleProtectedRoute allowedRoles={['OWNER', 'MANAGER', 'ADMIN']}>
                <TaskBoard />
              </RoleProtectedRoute>
            } 
          />
          <Route 
            path="my-tasks" 
            element={
              <RoleProtectedRoute allowedRoles={['OWNER', 'MANAGER', 'CLEANING', 'CAFE', 'RECEPTION', 'TRAINER', 'ADMIN']}>
                <MyTasks />
              </RoleProtectedRoute>
            } 
          />
          <Route 
            path="documents" 
            element={
              <RoleProtectedRoute allowedRoles={['OWNER', 'MANAGER', 'ADMIN']}>
                <DocumentCenter />
              </RoleProtectedRoute>
            } 
          />
          <Route 
            path="expenses" 
            element={
              <RoleProtectedRoute allowedRoles={['OWNER']}>
                <ExpensesDashboard />
              </RoleProtectedRoute>
            } 
          />
          <Route 
            path="assets" 
            element={
              <RoleProtectedRoute allowedRoles={['OWNER']}>
                <AssetsDashboard />
              </RoleProtectedRoute>
            } 
          />
          <Route 
            path="security" 
            element={
              <RoleProtectedRoute allowedRoles={['OWNER', 'ADMIN']}>
                <SecurityDashboard />
              </RoleProtectedRoute>
            } 
          />
        </Route>

        {/* Standalone Kiosk Mode */}
        <Route path="/kiosk" element={<KioskLayout />}>
          <Route index element={<KioskTerminal />} />
          <Route path="success" element={<KioskSuccess />} />
        </Route>

        {/* Redirects */}
        <Route path="/dashboard" element={<Navigate to="/" replace />} />

        {/* Error Routes */}
        <Route path="/403" element={<Forbidden />} />
        <Route path="/500" element={<ServerError />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  )
}

export default App
