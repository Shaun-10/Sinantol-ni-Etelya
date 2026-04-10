const tabs = ['ALL', 'Pending', 'Completed'];

export default function OrdersTabs({ activeTab, onTabChange }) {
  return (
    <div className="orders-tabs" role="tablist" aria-label="Order status filters">
      {tabs.map((tab) => {
        const isActive = activeTab === tab;

        return (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={`orders-tab-btn ${isActive ? 'active' : ''}`}
            onClick={() => onTabChange(tab)}
          >
            {tab}
          </button>
        );
      })}
    </div>
  );
}
