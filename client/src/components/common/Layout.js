import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import './Layout.css';

function Layout() {
  return (
    <div className="app-container">
      <Header />
      <main className="main-container">
        <Sidebar />
        <div className="content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default Layout; 