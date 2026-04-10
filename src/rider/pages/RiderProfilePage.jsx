import { FiHash, FiMapPin, FiPhone, FiTruck, FiUser } from 'react-icons/fi';
import RiderAppLayout from '../components/RiderAppLayout';

export default function RiderProfilePage() {
  return (
    <RiderAppLayout>
      <article className="profile-card">
        <div className="profile-main">
          <div className="profile-avatar"><FiUser /></div>
          <div>
            <h2>John Cruz</h2>
            <p><span className="status-dot" /> Active Rider</p>
          </div>
        </div>

        <div className="profile-row">
          <FiUser />
          <div>
            <span>Full Name</span>
            <strong>John D. Cruz</strong>
          </div>
        </div>

        <div className="profile-row">
          <FiPhone />
          <div>
            <span>Contact</span>
            <strong>+634516933456</strong>
          </div>
        </div>

        <div className="profile-row">
          <FiMapPin />
          <div>
            <span>Assigned Area</span>
            <strong>Quezon City - North fairview</strong>
          </div>
        </div>

        <div className="profile-row">
          <FiTruck />
          <div>
            <span>Motor Model</span>
            <strong>Honda Click 1356</strong>
          </div>
        </div>

        <div className="profile-row">
          <FiHash />
          <div>
            <span>Plate Number</span>
            <strong>hjk-123</strong>
          </div>
        </div>
      </article>

      <button type="button" className="logout-btn">Logout</button>
    </RiderAppLayout>
  );
}

