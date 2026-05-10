import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';

function getAdminName(user) {
  return user?.user_metadata?.name || user?.email?.split('@')[0] || 'Administrador';
}

function Icon({ type, className = 'h-4 w-4' }) {
  const paths = {
    users: 'M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM16 10a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM3.5 19a4.5 4.5 0 0 1 9 0M13.5 18a3.5 3.5 0 0 1 7 0',
    chevron: 'm7 10 5 5 5-5',
    logout: 'M15 17l5-5-5-5M20 12H9M11 20H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h6',
  };

  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d={paths[type]} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function AdminShell({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const adminName = getAdminName(user);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function handleLogout() {
    await logout();
    navigate('/', { replace: true });
  }

  const navClass = ({ isActive }) =>
    `whitespace-nowrap px-2 py-1 text-sm font-semibold transition sm:px-3 sm:text-base ${
      isActive
        ? 'text-white'
        : 'text-blue-100 hover:text-white'
    }`;

  return (
    <div className="min-h-dvh bg-slate-100">
      <header className="sticky top-0 z-40 border-b border-primary-900/20 bg-primary-700 text-white shadow-lg shadow-primary-900/20">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-3 py-3 sm:px-6 lg:flex-nowrap">
          <Link to="/admin/dashboard" className="flex min-w-0 shrink-0 items-center gap-2 sm:gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-white text-sm font-black text-primary-700 shadow-sm sm:h-10 sm:w-10">
              SW
            </span>
            <span className="hidden text-lg font-bold sm:block">SecureWork Rooms</span>
          </Link>

          <nav className="order-3 flex w-full items-center gap-1 overflow-x-auto pb-0.5 sm:gap-3 lg:order-none lg:ml-auto lg:w-auto lg:overflow-visible">
            <NavLink to="/admin/dashboard" className={navClass}>General</NavLink>
            <NavLink to="/admin/salas/texto" className={navClass}>Texto</NavLink>
            <NavLink to="/admin/salas/archivos" className={navClass}>Archivos</NavLink>
          </nav>

          <div className="relative ml-auto shrink-0 lg:ml-0" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              className="flex items-center gap-2 rounded-full px-1 py-1 transition hover:bg-white/10"
              aria-expanded={menuOpen}
              aria-label="Menu de administrador"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-sm font-bold text-primary-700 shadow-sm sm:h-11 sm:w-11">
                <Icon type="users" className="h-5 w-5" />
              </span>
              <span className="hidden h-9 w-9 items-center justify-center rounded-full bg-white/15 text-sm font-semibold md:flex">
                {adminName.slice(0, 2).toUpperCase()}
              </span>
              <Icon type="chevron" className={`h-4 w-4 text-blue-100 transition ${menuOpen ? 'rotate-180' : ''}`} />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-12 w-[calc(100vw-2rem)] max-w-72 rounded-lg border border-slate-200 bg-white py-2 text-slate-800 shadow-2xl sm:top-14">
                <span className="absolute -top-2 right-8 h-4 w-4 rotate-45 border-l border-t border-slate-200 bg-white" />
                <div className="px-4 py-3">
                  <p className="text-sm font-bold text-slate-950">{adminName}</p>
                  <p className="mt-1 truncate text-sm text-slate-500">{user?.email}</p>
                </div>
                <div className="my-1 border-t border-slate-100" />
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50"
                >
                  <Icon type="logout" />
                  Cerrar sesion
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-3 py-5 sm:px-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}
