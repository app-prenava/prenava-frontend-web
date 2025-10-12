import React from "react";

interface SidebarItemProps {
  label: string;
  icon: React.ReactNode;
  active?: boolean;
  collapsed?: boolean;
  onClick?: () => void;
  hasChildren?: boolean;
  isOpen?: boolean;
  isSubmenu?: boolean;
}

export const SidebarItem: React.FC<SidebarItemProps> = ({
  label,
  icon,
  active = false,
  collapsed = false,
  onClick,
  hasChildren = false,
  isOpen = false,
  isSubmenu = false,
}) => {
  return (
    <button
      onClick={onClick}
      className={`
        group flex items-center ${collapsed ? 'justify-center px-2' : 'gap-3 px-4'} py-3 rounded-r-2xl w-full transition-all
        ${active ? "bg-[#f9f7fc]" : "hover:bg-[#f9f7fc]"}
        ${isSubmenu ? 'ml-4 text-sm' : ''}
      `}
    >
      {/* garis vertikal */}
      {!collapsed && !isSubmenu && (
        <div
          className={`w-[3px] h-8 rounded-full mr-1 transition-all ${
            active ? "bg-rose-400" : "bg-transparent group-hover:bg-rose-400"
          }`}
        ></div>
      )}

      {/* ikon + teks */}
      <div className="flex items-center gap-3 text-gray-700 flex-1">
        <span className="text-xl">{icon}</span>
        {!collapsed && (
          <span className={`${active ? "text-rose-500 font-semibold" : ""} flex-1 text-left`}>
            {label}
          </span>
        )}
        
        {/* Dropdown arrow */}
        {hasChildren && !collapsed && (
          <svg
            className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-90' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        )}
      </div>
    </button>
  );
};
