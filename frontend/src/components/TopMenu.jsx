const Icon = ({ children, size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);

export default function TopMenu({ onMenuClick, sidebarOpen }) {
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
          <input type="search" placeholder="Search anything..." aria-label="Search" />
          <kbd>⌘ K</kbd>
        </label>
        <button className="icon-button notification-button" aria-label="Notifications">
          <Icon><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></Icon>
          <span />
        </button>
        <div className="profile">
          <div className="avatar">AM</div>
          <div className="profile__copy"><strong>Alex Morgan</strong><span>Administrator</span></div>
          <Icon size={16}><path d="m6 9 6 6 6-6" /></Icon>
        </div>
      </div>
    </header>
  );
}
