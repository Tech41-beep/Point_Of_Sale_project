
import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import TopMenu from "../components/TopMenu";
import Chatbot from "../components/Chatbot";
function CashierLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
      const [chatbotOpen, setChatbotOpen] = useState(false);
    
      const [lightMode, setLightMode] = useState(
        () => localStorage.getItem("pos-theme") !== "dark",
      );
    
      useEffect(() => {
        document.documentElement.dataset.theme = lightMode
          ? "light"
          : "dark";
    
        localStorage.setItem(
          "pos-theme",
          lightMode ? "light" : "dark",
        );
      }, [lightMode]);
    
  return (
    <>
    
         <Sidebar
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            onOpenChatbot={() => setChatbotOpen(true)}
          />
    
          <div
            className={`app-main ${
              sidebarOpen ? "" : "sidebar-hidden"
            }`}
          >
            <TopMenu
              sidebarOpen={sidebarOpen}
              onMenuClick={() =>
                setSidebarOpen((visible) => !visible)
              }
              lightMode={lightMode}
              onLightToggle={() =>
                setLightMode((enabled) => !enabled)
              }
            />
    
            <main className="page-content">
              <Outlet />
            </main>
          </div>
    
          <Chatbot open={chatbotOpen} setOpen={setChatbotOpen} />
    
    </>
  )
}

export default CashierLayout