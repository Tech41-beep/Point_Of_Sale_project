import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopMenu from '../components/TopMenu';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  return (
    <div className="app-shell">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className={`app-main ${sidebarOpen ? '' : 'sidebar-hidden'}`}>
        <TopMenu sidebarOpen={sidebarOpen} onMenuClick={() => setSidebarOpen((visible) => !visible)} />
        <main className="page-content"><Outlet /></main>
      </div>
    </div>
  );
}
