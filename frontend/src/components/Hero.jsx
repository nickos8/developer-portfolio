export default function Hero() {
  return (
    <main className="wrap hero" id="home">
      <div className="badge">
        <span className="dot" /> Full-stack CRUD demo
      </div>

      <h1>Developer Portfolio</h1>
      <p className="role">Laravel API &nbsp;|&nbsp; React SPA &nbsp;|&nbsp; Authenticated Admin</p>
      <p className="lead">
        A portfolio that manages its own content. Published projects are public; the
        administrator signs in to create, edit, publish, feature, and delete them
        through a protected Laravel Sanctum API.
      </p>

      <div className="cta">
        <a className="btn btn-primary" href="#projects">
          View Projects
        </a>
      </div>
    </main>
  )
}
