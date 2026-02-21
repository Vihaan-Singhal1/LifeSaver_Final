import { ShieldPlus } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: 'Report' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/first-aid', label: 'First Aid' }
];

function Navbar() {
  return (
    <header className="border-b border-base-300 bg-base-100">
      <div className="navbar mx-auto w-full max-w-6xl">
        <div className="navbar-start">
          <Link to="/" className="btn btn-ghost gap-2 text-xl font-semibold">
            <ShieldPlus className="h-6 w-6" />
            Life Saver
          </Link>
        </div>
        <div className="navbar-end">
          <nav className="menu menu-horizontal gap-2 px-1">
            {links.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `btn btn-ghost text-base font-medium ${isActive ? 'bg-base-200 text-primary' : ''}`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
