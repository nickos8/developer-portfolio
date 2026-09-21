export default function Footer({ onNavigate }) {
  return (
    <footer>
      <div className="wrap foot">
        <span>&copy; {new Date().getFullYear()} Developer Portfolio</span>
        <button
          type="button"
          className="admin-link"
          onClick={() => onNavigate('admin')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', font: 'inherit' }}
        >
          Admin
        </button>
      </div>
    </footer>
  )
}
