import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Header.css';

function Header() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="header">
      <div className="logo">
        <img 
          src="/logo.svg" 
          alt="MiC Logo" 
          className="logo-img" 
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3QgeD0iNCIgeT0iMjAiIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgZmlsbD0iI0Y4QjUwMCIvPgo8cmVjdCB4PSI0IiB5PSI0IiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIGZpbGw9IiM0RThCQjgiLz4KPHJlY3QgeD0iMjAiIHk9IjQiIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgZmlsbD0iIzRFOEJCOCIvPgo8cmVjdCB4PSIyMCIgeT0iMjAiIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgZmlsbD0iIzRFOEJCOCIvPgo8L3N2Zz4K";
          }}
        />
        <h1 className="logo-text">MiC Data Platform</h1>
      </div>
      <div className="user-nav">
        <div className="search-bar">
          <input type="text" placeholder="Search projects, modules..." />
          <button>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
        </div>
        <div className="notifications">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
        </div>
        <div className="user-profile">
          <img 
            src="/user-avatar.jpg" 
            alt="User"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNFMEU1RUMiLz4KPHBhdGggZD0iTTIwIDIwQzIzLjMxMzcgMjAgMjYgMTcuMzEzNyAyNiAxNEMyNiAxMC42ODYzIDIzLjMxMzcgOCAyMCA4QzE2LjY4NjMgOCAxNCAxMC42ODYzIDE0IDE0QzE0IDE3LjMxMzcgMTYuNjg2MyAyMCAyMCAyMFoiIGZpbGw9IiM5QUE1QjEiLz4KPHBhdGggZD0iTTMyIDM0QzMyIDI4LjQ3NzIgMjYuNjI3NCAyNCAyMCAyNEMxMy4zNzI2IDI0IDggMjguNDc3MiA4IDM0SDMyWiIgZmlsbD0iIzlBQTVCMSIvPgo8L3N2Zz4K";
            }}
          />
          <div className="user-info-dropdown">
            <span className="user-name">{user?.fullName || '用戶'}</span>
            <span className="user-role">({user?.role || '未知角色'})</span>
            <div className="dropdown-menu">
              <Link to="/dashboard" className="dropdown-item">儀表板</Link>
              <button onClick={handleLogout} className="dropdown-item logout-item">登出</button>
            </div>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
      </div>
    </header>
  );
}

export default Header; 