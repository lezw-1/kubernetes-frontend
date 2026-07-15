import { Link, useLocation } from 'react-router-dom';

interface Props {
  open: boolean; // Controlled from Shell
  onToggle: () => void; // Toggle open/closed
  onLogout: () => void;
  canViewChronSorting: boolean; // viewer role on chronsorting client
}

export default function Sidebar({ open, onToggle, onLogout, canViewChronSorting }: Props) {
  const { pathname } = useLocation(); // Highlight the active nav link based on current path

  return (
    <nav className={`app-nav${open ? '' : ' app-nav--collapsed'}`}>
      <button className="app-nav__toggle" onClick={onToggle} title={open ? 'Close sidebar' : 'Open sidebar'}>
        {open ? '‹' : '›'}
      </button>
      {open && (
        <>
          <Link to="/">
            <button className={`app-nav__btn${pathname === '/' ? ' app-nav__btn--active' : ''}`}>Home</button>
          </Link>
          <Link to="/dashboard">
            <button className={`app-nav__btn${pathname === '/dashboard' ? ' app-nav__btn--active' : ''}`}>Promises</button>
          </Link>
          {canViewChronSorting ? (
            <Link to="/chronsorting">
              <button className={`app-nav__btn${pathname === '/chronsorting' ? ' app-nav__btn--active' : ''}`}>ChronSorting</button>
            </Link>
          ) : (
            <button className="app-nav__btn" disabled title="No permissions">ChronSorting</button>
          )}
          <Link to="/immosearch">
            <button className={`app-nav__btn${pathname === '/immosearch' ? ' app-nav__btn--active' : ''}`}>ImmoSearch</button>
          </Link>
          <Link to="/travelmatch">
            <button className={`app-nav__btn${pathname === '/travelmatch' ? ' app-nav__btn--active' : ''}`}>TravelMatch</button>
          </Link>
          <Link to="/rag">
            <button className={`app-nav__btn${pathname === '/rag' ? ' app-nav__btn--active' : ''}`}>RAG</button>
          </Link>
          <Link to="/ocr">
            <button className={`app-nav__btn${pathname === '/ocr' ? ' app-nav__btn--active' : ''}`}>OCR</button>
          </Link>
          <span className="app-nav__spacer" />
          <button className="app-nav__btn" onClick={onLogout}>Logout</button>
        </>
      )}
    </nav>
  );
}
