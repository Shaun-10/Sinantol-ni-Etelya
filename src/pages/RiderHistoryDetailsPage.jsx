import { FiMapPin } from 'react-icons/fi';
import RiderAppLayout from '../components/rider/RiderAppLayout';

export default function RiderHistoryDetailsPage() {
  return (
    <RiderAppLayout pageTitle="Rider History Details" showBack backTo="/rider/history">
      <article className="details-card">
        <div className="details-head-row">
          <span className="delivery-id">DEL-002</span>
          <span className="pill red">Failed</span>
        </div>
        <h2>Juan Dela Cruz</h2>
        <p><FiMapPin /> 456 Bonifacio St., Brgy. Poblacion, Makati</p>
        <p className="contact-green">+63 987 654 3210</p>
      </article>

      <article className="details-card">
        <h3>ORDER ITEMS</h3>
        <ul>
          <li>1x Large Classic</li>
          <li>2x Small Spicy</li>
        </ul>
        <div className="details-total-row">
          <span>Paid Online</span>
          <strong>P370</strong>
        </div>
      </article>

      <article className="details-card fail-text-card">
        <p>Failed at <strong>01:45 PM</strong></p>
        <strong className="reason-text">Reason: Customer not available</strong>
      </article>
    </RiderAppLayout>
  );
}
