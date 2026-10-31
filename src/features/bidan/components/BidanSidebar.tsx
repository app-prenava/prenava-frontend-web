import { Link, useLocation } from 'react-router-dom';

type NavItem = {
    path: string;
    label: string;
    icon: string;
};

const navItems: NavItem[] = [
    { path: '/bidan', label: 'Dashboard', icon: '📊' },
    { path: '/bidan/triage', label: 'Triase Pasien (CDSS)', icon: '🚨' },
    { path: '/bidan/appointments', label: 'Janji Temu', icon: '📅' },
    { path: '/bidan/users', label: 'Data Pasien', icon: '👥' },
    { path: '/catatan-kunjungan', label: 'Catatan Kunjungan', icon: '📋' },
    { path: '/bidan/tips', label: 'Kelola Tips', icon: '💡' },
];

export default function BidanSidebar() {
    const location = useLocation();

    return (
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
            {/* Logo */}
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-lg">P</span>
                    </div>
                    <div>
                        <h1 className="font-semibold text-lg text-pink-500">Prenava</h1>
                        <p className="text-xs text-gray-500">Bidan Panel</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4">
                <ul className="space-y-2">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <li key={item.path}>
                                <Link
                                    to={item.path}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${isActive
                                        ? 'bg-pink-100 text-pink-600 border-l-4 border-pink-500 font-semibold'
                                        : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    <span className="text-xl">{item.icon}</span>
                                    <span className="font-medium text-sm">{item.label}</span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>
        </aside>
    );
}
