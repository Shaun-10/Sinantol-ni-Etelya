import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import '../styles/app.css';

export default function Layout() {
  return (
    <div className="dashboard-page">
      <Navbar />

      <div className="dashboard-content-grid">
        <Sidebar />

        <main className="dashboard-main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
