import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Settings } from 'lucide-react';
import './PageHeader.css';

type Props = {
  title: string;
  variant?: 'navy' | 'white';
  showBack?: boolean;
  showSettings?: boolean;
  onSettings?: () => void;
  backTo?: string;
};

export function PageHeader({
  title,
  variant = 'navy',
  showBack = true,
  showSettings = false,
  onSettings,
  backTo,
}: Props) {
  const navigate = useNavigate();

  return (
    <header className={`page-header page-header--${variant}`}>
      {showBack ? (
        <button
          type="button"
          className="page-header__icon-btn"
          aria-label="Go back"
          onClick={() => (backTo ? navigate(backTo) : navigate(-1))}
        >
          <ArrowLeft size={22} strokeWidth={2.2} />
        </button>
      ) : (
        <span className="page-header__spacer" />
      )}
      <h1 className="page-header__title">{title}</h1>
      {showSettings ? (
        <button
          type="button"
          className="page-header__icon-btn"
          aria-label="Settings"
          onClick={onSettings}
        >
          <Settings size={20} strokeWidth={2} />
        </button>
      ) : (
        <span className="page-header__spacer" />
      )}
    </header>
  );
}
