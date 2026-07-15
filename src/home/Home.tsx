import { useNavigate } from 'react-router-dom';
import './home.css';

interface Props {
  onLogout: () => void;
  canViewChronSorting: boolean; // viewer role on chronsorting client
}

// Pages available in the app
const PAGES = [
  {
    path: '/dashboard',
    title: 'Promises',
    description: 'Promises extracted by the AI agent from public sources.',
  },
  {
    path: '/chronsorting',
    title: 'ChronSorting',
    description: 'Extract a chronological timeline from any document.',
    roleGated: true,
  },
  {
    path: '/immosearch',
    title: 'ImmoSearch',
    description: 'Search and analyse real estate listings.',
  },
  {
    path: '/travelmatch',
    title: 'TravelMatch',
    description: 'Find and match travel offers based on your preferences.',
  },
  {
    path: '/rag',
    title: 'RAG',
    description: 'Retrieval-augmented generation over your documents.',
  },
  {
    path: '/ocr',
    title: 'OCR',
    description: 'Extract text from images and scanned documents.',
  },
];

export default function Home({ onLogout, canViewChronSorting }: Props) {
  const navigate = useNavigate();

  return (
    <div className="home">
      <div className="home__grid">
        {PAGES.map(page => {
          const disabled = page.roleGated && !canViewChronSorting;
          return (
            <div
              key={page.path}
              className={`home__card${disabled ? ' home__card--disabled' : ''}`}
              title={disabled ? 'No permissions' : undefined}
              onClick={disabled ? undefined : () => navigate(page.path)}
            >
              <h2 className="home__card-title">{page.title}</h2>
              <p className="home__card-description">{page.description}</p>
            </div>
          );
        })}
        <div className="home__card home__card--logout" onClick={onLogout}>
          <h2 className="home__card-title">Logout</h2>
          <p className="home__card-description">Sign out of your account.</p>
        </div>
      </div>
    </div>
  );
}
