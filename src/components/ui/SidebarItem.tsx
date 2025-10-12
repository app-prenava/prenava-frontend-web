import React from "react";

interface SidebarItemProps {
  label: string;
  icon: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}

export const SidebarItem: React.FC<SidebarItemProps> = ({
  label,
  icon,
  active = false,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className={`
        group flex items-center gap-3 px-4 py-3 rounded-r-2xl w-full transition-all
        ${active ? "bg-[#f9f7fc]" : "hover:bg-[#f9f7fc]"}
      `}
    >
      {/* garis vertikal */}
      <div
        className={`w-[3px] h-8 rounded-full mr-1 transition-all ${
          active ? "bg-rose-400" : "bg-transparent group-hover:bg-rose-400"
        }`}
      ></div>

      {/* ikon + teks */}
      <div className="flex items-center gap-3 text-gray-700">
        <span className="text-xl">{icon}</span>
        <span className={`${active ? "text-rose-500 font-semibold" : ""}`}>
          {label}
        </span>
      </div>
    </button>
  );
};
