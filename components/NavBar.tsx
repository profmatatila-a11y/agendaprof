
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const NavBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: 'Início', icon: 'dashboard', path: '/' },
    { label: 'Agenda', icon: 'calendar_month', path: '/agenda' },
    { label: 'Turmas', icon: 'school', path: '/turmas' },
    { label: 'Histórico', icon: 'history_edu', path: '/historico' },

  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-20 bg-white/90 ios-blur border-t border-slate-200 flex items-center justify-around px-6 pb-4 z-50">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center gap-1 transition-colors ${isActive ? 'text-primary' : 'text-slate-400'
              }`}
          >
            <span className={`material-symbols-outlined ${isActive ? 'fill-current' : ''}`}>
              {item.icon}
            </span>
            <span className="text-[10px] font-bold">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default NavBar;
