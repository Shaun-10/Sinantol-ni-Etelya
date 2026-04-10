import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import RiderAuthShell from '../components/RiderAuthShell';

export default function RiderSignupPage() {
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    navigate('/rider/login');
  };

  return (
    <RiderAuthShell
      title="RIDER SIGN UP"
      subtitle="Create your rider account to start accepting deliveries."
      footer={(
        <p>
          Already have an account? <Link to="/rider/login">Login</Link>
        </p>
      )}
    >
      <form onSubmit={handleSubmit} className="rider-form">
        <div className="rider-field">
          <input type="email" name="email" placeholder="Email" autoComplete="email" />
        </div>
        <div className="rider-field">
          <input type="text" name="username" placeholder="Username" autoComplete="username" />
        </div>
        <div className="rider-field">
          <input type="password" name="password" placeholder="Password" autoComplete="new-password" />
        </div>
        <button type="submit" className="rider-primary-btn">Sign Up</button>
      </form>
    </RiderAuthShell>
  );
}
