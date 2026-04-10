import { FiMapPin, FiNavigation } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import RiderAppLayout from '../components/rider/RiderAppLayout';

export default function RiderDeliveryDetailsPage() {
  const navigate = useNavigate();

  return (
    <RiderAppLayout pageTitle="Rider deliveries - details" showBack backTo="/rider/deliveries">
      <article className="details-card">
        <div className="details-head-row">
          <span className="delivery-id">DEL-003</span>
          <span className="pill yellow">In Progress</span>
        </div>
        <h2>Ana Reyes</h2>
        <p><FiMapPin /> 789 Mabini Blvd, Brgy. Ermita, Manila</p>
        <p className="contact-green">+63 912 345 6789</p>
        <div className="eta-bar"><FiNavigation /> 0.8 km away - ETA 3 min</div>
      </article>

      <article className="details-card">
        <h3>ORDER ITEMS</h3>
        <ul>
          <li>3x Small Classic</li>
          <li>1x Bottled Spicy</li>
        </ul>
        <div className="details-total-row">
          <span>Cash on Delivery</span>
          <strong>P500</strong>
        </div>
      </article>

      <article className="details-card">
        <h3>PAYMENT OPTIONS</h3>
        <button type="button" className="inline-green-btn" onClick={() => navigate('/rider/deliveries/payment')}>
          Switch to e-Payment (GCash/Maya)
        </button>
      </article>

      <button type="button" className="map-btn">Navigate with Google Maps</button>

      <div className="delivery-result-row">
        <button type="button" className="result-btn delivered" onClick={() => navigate('/rider/deliveries/delivered')}>
          Delivered
        </button>
        <button type="button" className="result-btn failed">Failed</button>
      </div>
    </RiderAppLayout>
  );
}
