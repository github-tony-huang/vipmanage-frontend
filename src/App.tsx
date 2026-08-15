import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/auth';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MemberList from './pages/Member/List';
import MemberDetail from './pages/Member/Detail';
import CardTypeList from './pages/CardType/List';
import MemberCardList from './pages/MemberCard/List';
import SignList from './pages/Sign/List';
import TransactionList from './pages/Transaction/List';
import OnlineList from './pages/Admin/OnlineList';
import RoleList from './pages/Admin/RoleList';
import StaffList from './pages/Admin/StaffList';
import OperationLogList from './pages/Admin/OperationLogList';
import SystemSettings from './pages/Admin/SystemSettings';

// 受保护的路由组件
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="members" element={<MemberList />} />
          <Route path="members/:id" element={<MemberDetail />} />
          <Route path="card-types" element={<CardTypeList />} />
          <Route path="member-cards" element={<MemberCardList />} />
          <Route path="signs" element={<SignList />} />
          <Route path="transactions" element={<TransactionList />} />
          <Route path="admin/online" element={<OnlineList />} />
          <Route path="admin/staff" element={<StaffList />} />
          <Route path="admin/roles" element={<RoleList />} />
          <Route path="admin/logs" element={<OperationLogList />} />
          <Route path="admin/settings" element={<SystemSettings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
