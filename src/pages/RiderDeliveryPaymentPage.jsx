import { FiMapPin, FiNavigation } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import RiderAppLayout from '../components/rider/RiderAppLayout';

export default function RiderDeliveryPaymentPage() {
  const navigate = useNavigate();

  return (
    <RiderAppLayout pageTitle="Rider deliveries - info qr" showBack backTo="/rider/deliveries/details">
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
        <div className="qr-box">QR</div>
        <p className="qr-name">Ana's GCash</p>
        <p className="qr-copy">Scan to pay</p>
        <p className="qr-price">P500</p>
        <button type="button" className="upload-btn">Upload Payment Proof</button>
        <button type="button" className="confirm-btn" onClick={() => navigate('/rider/deliveries/delivered')}>
          Confirm Payment Received
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
