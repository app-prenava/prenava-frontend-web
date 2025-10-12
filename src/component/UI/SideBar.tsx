import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import logoUrl from '@/assets/logo.png';

interface SideBarProps {
  children: React.ReactNode;
  headerSubtitle?: string; // e.g. "Pages / Manajemen Material"
  headerTitle?: string; // e.g. "Manajemen Material"
  userName?: string; // e.g. "Irdan"
  userRole?: string; // e.g. "dinkes"
}

const SideBar: React.FC<SideBarProps> = ({
  children,
  headerSubtitle = 'Pages / Manajemen Material',
  headerTitle = 'Manajemen Material',
  userName = 'Irdan',
  userRole = 'dinkes',
}) => {
  const [usersOpen, setUsersOpen] = useState(true);

  return (
    <div className="min-h-screen w-full bg-gray-50 flex">
      {/* Left Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Brand */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <img src={logoUrl} alt="Prenava" className="w-10 h-10" />
            <div>
              <h1 className="font-semibold text-lg">Prenava</h1>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            <li>
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition ${isActive
                    ? 'text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
                style={({ isActive }) => (isActive ? { backgroundColor: '#FA6978' } : {})}
              >
                <span className="text-xl">📊</span>
                <span className="font-medium">Dashboard</span>
              </NavLink>
            </li>

            {/* Users group */}
            <li>
              <button
                type="button"
                onClick={() => setUsersOpen(!usersOpen)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100"
              >
                <span className="flex items-center gap-3">
                  <span className="text-xl">👥</span>
                  <span className="font-medium">Users</span>
                </span>
                <span className={`transition-transform ${usersOpen ? 'rotate-180' : ''}`}>▾</span>
              </button>
              {usersOpen && (
                <ul className="mt-2 pl-2 space-y-2">
                  <li>
                    <NavLink
                      to="/bidan"
                      className={({ isActive }) =>
                        `block px-4 py-3 rounded-lg transition ${isActive
                          ? 'text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                        }`
                      }
                      style={({ isActive }) => (isActive ? { backgroundColor: '#FA6978' } : {})}
                    >
                      Bidan
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/dinkes"
                      className={({ isActive }) =>
                        `block px-4 py-3 rounded-lg transition ${isActive
                          ? 'text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                        }`
                      }
                      style={({ isActive }) => (isActive ? { backgroundColor: '#FA6978' } : {})}
                    >
                      Dinkes
                    </NavLink>
                  </li>
                </ul>
              )}
            </li>
          </ul>
        </nav>
      </aside>

      {/* Right main area */}
      <div className="flex-1 flex flex-col">
        {/* Top Headbar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <div>
            <div className="text-xs text-gray-500">{headerSubtitle}</div>
            <div className="text-sm font-semibold">{headerTitle}</div>
          </div>
          <div className="flex items-center gap-4">
            <button className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50">
              <span role="img" aria-label="bell">🔔</span>
            </button>
            <button className="flex items-center gap-3 px-3 py-1.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50">
              <span className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center overflow-hidden">
                <span className="text-sm font-semibold">{userName.charAt(0)}</span>
              </span>
              <span className="text-left">
                <div className="text-sm font-semibold leading-tight">{userName}</div>
                <div className="text-xs text-gray-500 leading-tight">{userRole}</div>
              </span>
              <span>▾</span>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default SideBar;