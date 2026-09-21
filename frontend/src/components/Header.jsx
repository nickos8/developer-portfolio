function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2.6v2.6M12 18.8v2.6M4.6 4.6l1.9 1.9M17.5 17.5l1.9 1.9M2.6 12h2.6M18.8 12h2.6M4.6 19.4l1.9-1.9M17.5 6.5l1.9-1.9" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.2 14.6A8.4 8.4 0 0 1 9.4 3.8a8.4 8.4 0 1 0 10.8 10.8z" />
    </svg>
  )
}

export default function Header({ view, onNavigate, theme, onToggleTheme, isAuthenticated }) {
  return (
    <header className="site-header">
      <div className="wrap nav">
        <button type="button" className="logo" onClick={() => onNavigate('public')}>
          <span className="mark">DP</span> Developer Portfolio
        </button>

        <div className="nav-actions">
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => onNavigate(view === 'admin' ? 'public' : 'admin')}
          >
            {view === 'admin' ? 'View site' : isAuthenticated ? 'Dashboard' : 'Admin login'}
          </button>

          <button
            type="button"
            className="theme-toggle"
            onClick={onToggleTheme}
            aria-label="Toggle light/dark theme"
          >
            {theme === 'light' ? <MoonIcon /> : <SunIcon />}
          </button>
        </div>
      </div>
    </header>
  )
}
