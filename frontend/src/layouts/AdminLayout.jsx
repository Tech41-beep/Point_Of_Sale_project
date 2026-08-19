import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopMenu from '../components/TopMenu';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [lightMode, setLightMode] = useState(() => localStorage.getItem('pos-theme') !== 'dark');

  useEffect(() => {
    document.documentElement.dataset.theme = lightMode ? 'light' : 'dark';
    localStorage.setItem('pos-theme', lightMode ? 'light' : 'dark');
  }, [lightMode]);

  return (
    <div className="app-shell">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className={`app-main ${sidebarOpen ? '' : 'sidebar-hidden'}`}>
        <TopMenu
          sidebarOpen={sidebarOpen}
          onMenuClick={() => setSidebarOpen((visible) => !visible)}
          lightMode={lightMode}
          onLightToggle={() => setLightMode((enabled) => !enabled)}
        />
        <main className="page-content"><Outlet /></main>
      </div>
    </div>
  );
}
