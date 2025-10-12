import { ReactNode, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { storage } from '@/lib/storage';
import BidanSidebar from './BidanSidebar';
import BidanHeader from './BidanHeader';

type BidanLayoutProps = {
    children: ReactNode;
};

export default function BidanLayout({ children }: BidanLayoutProps) {
    const navigate = useNavigate();
    const location = useLocation();
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const handleLogout = () => {
        storage.removeToken();
        storage.removeRole();
        navigate('/login');
    };

    // Get current page title for breadcrumb
    const getPageTitle = () => {
        if (location.pathname === '/bidan') return 'Dashboard';
        if (location.pathname === '/bidan/users') return 'Users';
        return 'Dashboard';
    };

    const getBreadcrumb = () => {
        if (location.pathname === '/bidan') return ['Pages', 'Dashboard'];
        if (location.pathname === '/bidan/users') return ['Pages', 'Users'];
        return ['Pages', 'Dashboard'];
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <BidanSidebar />

            <div className="flex-1 flex flex-col">
                <BidanHeader
                    pageTitle={getPageTitle()}
                    breadcrumb={getBreadcrumb()}
                    onLogout={() => setShowLogoutConfirm(true)}
                />

                <main className="flex-1 overflow-auto p-8">
                    {children}
                </main>
            </div>

            {/* Logout Confirmation Modal */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold mb-4">Konfirmasi Logout</h3>
                        <p className="text-gray-600 mb-6">Apakah Anda yakin ingin keluar dari akun?</p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setShowLogoutConfirm(false)}
                                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}