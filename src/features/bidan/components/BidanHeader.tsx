import { useState } from 'react';

type BidanHeaderProps = {
    pageTitle: string;
    breadcrumb: string[];
    onLogout: () => void;
};

export default function BidanHeader({ pageTitle, breadcrumb, onLogout }: BidanHeaderProps) {
    const [showUserMenu, setShowUserMenu] = useState(false);

    return (
        <header className="bg-white border-b border-gray-200 px-8 py-4">
            <div className="flex items-center justify-between">
                {/* Breadcrumb */}
                <div>
                    <nav className="text-sm text-gray-500 mb-1">
                        {breadcrumb.map((item, index) => (
                            <span key={index}>
                                {item}
                                {index < breadcrumb.length - 1 && <span className="mx-2">/</span>}
                            </span>
                        ))}
                    </nav>
                    <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
                </div>

                {/* Right side - Search, Filter, Notifications, User Profile */}
                <div className="flex items-center gap-4">
                    {/* Search Bar */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search"
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        />
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>

                    {/* Filter Button */}
                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                        <span className="text-gray-600">Filter</span>
                    </button>

                    {/* Notifications */}
                    <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full transition">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM9 12l2 2 4-4" />
                        </svg>
                        {/* Notification badge */}
                        <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                    </button>

                    {/* User Profile */}
                    <div className="relative">
                        <button
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg transition"
                        >
                            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium text-gray-700">I</span>
                            </div>
                            <div className="text-left">
                                <div className="font-semibold text-gray-900">Irdan</div>
                                <div className="text-sm text-gray-500">Bidan</div>
                            </div>
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {/* User Dropdown Menu */}
                        {showUserMenu && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                                <button
                                    onClick={onLogout}
                                    className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition"
                                >
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
