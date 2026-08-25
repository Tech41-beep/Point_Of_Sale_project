import { useEffect } from "react";
import { useCurrentUser } from "../auth/hooks/use.current";

const Icon = ({ children, size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);

export default function TopMenu({ onMenuClick, sidebarOpen, lightMode, onLightToggle }) {
  const { user, getCurrentUser } = useCurrentUser();

  useEffect(() => {
    getCurrentUser().catch(() => {
      // The rest of the dashboard can still render if profile loading fails.
    });
  }, [getCurrentUser]);

  return (
    <header className="top-menu">
      <button className="icon-button menu-button" onClick={onMenuClick} aria-label={sidebarOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={sidebarOpen}>
        <Icon>{sidebarOpen ? <path d="m15 18-6-6 6-6" /> : <path d="M4 6h16M4 12h16M4 18h16" />}</Icon>
      </button>

      <div className="top-menu__title">
        <span>Overview</span>
        <small>Wednesday, 12 August 2026</small>
      </div>

      <div className="top-menu__actions">
        <label className="search-box">
          <Icon size={18}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></Icon>
          <input id="global-search" name="globalSearch" type="search" placeholder="Search anything..." aria-label="Search" />
          <kbd>⌘ K</kbd>
        </label>
        <button
          className={`light-toggle ${lightMode ? 'is-on' : ''}`}
          type="button"
          onClick={onLightToggle}
          aria-label={`Turn light mode ${lightMode ? 'off' : 'on'}`}
          aria-pressed={lightMode}
          title={`Light mode: ${lightMode ? 'On' : 'Off'}`}
        >
          <span className="light-toggle__icon" aria-hidden="true">
            <Icon size={17}>
              {lightMode
                ? <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.66 6.34l1.41-1.41" /></>
                : <path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z" />}
            </Icon>
          </span>
          <span className="light-toggle__text">Light</span>
          <span className="light-toggle__state">{lightMode ? 'On' : 'Off'}</span>
        </button>
        <button className="icon-button notification-button" aria-label="Notifications">
          <Icon><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></Icon>
          <span />
        </button>
        <div className="profile">
          <div className="avatar">{user?.avatar || 'AM'}</div>
          <div className="profile__copy">
            <strong>{user?.name || 'Unknown User'}
              </strong>
              <span>
                {user?.role || 'User'}
              </span>
              </div>
          <Icon size={16}><path d="m6 9 6 6 6-6" /></Icon>
        </div>
      </div>
    </header>
  );
}
