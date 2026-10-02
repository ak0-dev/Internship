import { useAuth } from '../context/AuthContext';
import AdminDashboardPage from './AdminDashboardPage';
import DashboardPage from './DashboardPage';
import RecruiterDashboardPage from './RecruiterDashboardPage';

const RoleDashboardPage = () => {
  const { user } = useAuth();

  if (user?.role === 'ADMIN') {
    return <AdminDashboardPage />;
  }
  if (user?.role === 'RECRUITER') {
    return <RecruiterDashboardPage />;
  }

  return <DashboardPage />;
};

export default RoleDashboardPage;
