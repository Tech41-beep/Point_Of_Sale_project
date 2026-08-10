import { useAuth } from '../../app/providers/AuthProvider';

const Dashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="card">
      <h2>Dashboard</h2>
      <p>Welcome back, {user?.name || 'there'}.</p>
      <p>Your role: {user?.role || 'guest'}</p>
      <button className="secondary" onClick={() => logout()}>Sign out</button>
    </div>
  );
};

export default Dashboard;
