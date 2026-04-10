import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import RiderAuthShell from '../components/rider/RiderAuthShell';

export default function RiderLoginPage() {
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    navigate('/rider/home');
  };

  return (
    <RiderAuthShell
      title="RIDER LOGIN"
      subtitle="Sign in to receive delivery tasks and manage your shift."
      footer={(
        <p>
          Need a rider account? <Link to="/rider/signup">Sign Up</Link>
        </p>
      )}
    >
      <form onSubmit={handleSubmit} className="rider-form">
        <div className="rider-field">
          <input type="text" name="username" placeholder="Username" autoComplete="username" />
        </div>
        <div className="rider-field">
          <input type="password" name="password" placeholder="Password" autoComplete="current-password" />
        </div>
        <button type="submit" className="rider-primary-btn">Login</button>
      </form>
    </RiderAuthShell>
  );
}