export function SiteFooter() {
  return (
    <footer className="site-footer" aria-label="Site footer">
      <div className="site-footer-inner">
        <p className="footer-brand">CloseLoop</p>
        <p className="footer-copy">
          Migration integrity platform for heterogeneous-to-SAP programs.
        </p>
        <p className="footer-contact">
          Contact: <a href="mailto:hello@closeloop.app">hello@closeloop.app</a>
        </p>
        <nav aria-label="Legal">
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
        </nav>
        <p className="footer-meta">© {new Date().getFullYear()} CloseLoop. All rights reserved.</p>
      </div>
    </footer>
  );
}
