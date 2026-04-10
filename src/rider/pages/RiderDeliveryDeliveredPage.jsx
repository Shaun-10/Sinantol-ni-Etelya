import { FiMapPin, FiNavigation } from 'react-icons/fi';
import RiderAppLayout from '../components/RiderAppLayout';

export default function RiderDeliveryDeliveredPage() {
  return (
    <RiderAppLayout pageTitle="Rider deliveries - delivered" showBack backTo="/rider/deliveries/details">
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

      <article className="details-card success-text-card">
        Delivered at <strong>01:57 PM</strong>
      </article>
    </RiderAppLayout>
  );
}

