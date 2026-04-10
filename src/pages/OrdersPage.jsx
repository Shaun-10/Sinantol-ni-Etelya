import { useMemo, useState } from 'react';
import OrdersHeader from '../components/orders/OrdersHeader';
import OrdersTabs from '../components/orders/OrdersTabs';
import OrdersTable from '../components/orders/OrdersTable';
import OrderDetailsModal from '../components/orders/OrderDetailsModal';
import AddOrderModal from '../components/orders/AddOrderModal';

const formatShortDate = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  }).format(date);
};

const getDateByDaysAgo = (daysAgo) => {
  const baseDate = new Date();
  baseDate.setHours(0, 0, 0, 0);
  baseDate.setDate(baseDate.getDate() - daysAgo);
  return baseDate;
};

const getDateRangeFromDaysAgo = (daysAgo) => {
  if (daysAgo === 0) {
    return 'Today';
  }

  if (daysAgo === 1) {
    return 'Yesterday';
  }

  if (daysAgo >= 2 && daysAgo <= 7) {
    return 'Last Week';
  }

  return 'Last Month';
};

const rawOrdersData = [
  {
    id: '#001',
    customer: 'Maria Santos',
    firstName: 'Maria',
    middleInitial: 'S.',
    lastName: 'Santos',
    address: '123 Main Street, City, Province',
    contact: '09123456789',
    assignedRider: 'Joseph Santos',
    flavor: ['Spicy', 'Classic'],
    size: ['Large'],
    quantity: 1,
    total: 150,
    daysAgo: 0,
    orderType: 'Delivery',
    status: 'Pending',
    orderItems: [
      { flavor: 'Classic', size: 'Small', quantity: 2 },
      { flavor: 'Classic', size: 'Large', quantity: 0 },
      { flavor: 'Classic', size: 'Bottled', quantity: 3 },
      { flavor: 'Spicy', size: 'Small', quantity: 0 },
      { flavor: 'Spicy', size: 'Large', quantity: 3 },
      { flavor: 'Spicy', size: 'Bottled', quantity: 0 },
    ],
  },
  {
    id: '#002',
    customer: 'Maria Santos',
    firstName: 'Maria',
    middleInitial: 'S.',
    lastName: 'Santos',
    address: '456 Oak Avenue, Town, Province',
    contact: '09198765432',
    assignedRider: 'John Doe',
    flavor: ['Spicy'],
    size: ['Small', 'Large'],
    quantity: 1,
    total: 150,
    daysAgo: 1,
    orderType: 'Walk-in',
    status: 'Pending',
    orderItems: [
      { flavor: 'Spicy', size: 'Small', quantity: 1 },
      { flavor: 'Spicy', size: 'Large', quantity: 2 },
      { flavor: 'Spicy', size: 'Bottled', quantity: 0 },
    ],
  },
  {
    id: '#003',
    customer: 'Maria Santos',
    firstName: 'Maria',
    middleInitial: 'S.',
    lastName: 'Santos',
    address: '789 Pine Road, Valley, Province',
    contact: '09187654321',
    assignedRider: 'Alex Turner',
    flavor: ['Spicy'],
    size: ['Bottled'],
    quantity: 1,
    total: 150,
    daysAgo: 3,
    orderType: 'Delivery',
    status: 'Completed',
    orderItems: [
      { flavor: 'Spicy', size: 'Small', quantity: 0 },
      { flavor: 'Spicy', size: 'Large', quantity: 0 },
      { flavor: 'Spicy', size: 'Bottled', quantity: 1 },
    ],
  },
  {
    id: '#004',
    customer: 'Maria Santos',
    firstName: 'Maria',
    middleInitial: 'S.',
    lastName: 'Santos',
    address: '321 Elm Street, District, Province',
    contact: '09176543210',
    assignedRider: 'Marcus Black',
    flavor: ['Classic'],
    size: ['Small'],
    quantity: 1,
    total: 150,
    daysAgo: 20,
    orderType: 'Walk-in',
    status: 'Pending',
    orderItems: [
      { flavor: 'Classic', size: 'Small', quantity: 1 },
      { flavor: 'Classic', size: 'Large', quantity: 0 },
      { flavor: 'Classic', size: 'Bottled', quantity: 0 },
    ],
  },
  {
    id: '#005',
    customer: 'Maria Santos',
    firstName: 'Maria',
    middleInitial: 'S.',
    lastName: 'Santos',
    address: '654 Maple Drive, Hill, Province',
    contact: '09165432109',
    assignedRider: 'Sarah Wilson',
    flavor: ['Spicy', 'Classic'],
    size: ['Large'],
    quantity: 1,
    total: 150,
    daysAgo: 0,
    orderType: 'Delivery',
    status: 'Completed',
    orderItems: [
      { flavor: 'Spicy', size: 'Small', quantity: 0 },
      { flavor: 'Spicy', size: 'Large', quantity: 2 },
      { flavor: 'Spicy', size: 'Bottled', quantity: 0 },
      { flavor: 'Classic', size: 'Small', quantity: 0 },
      { flavor: 'Classic', size: 'Large', quantity: 1 },
      { flavor: 'Classic', size: 'Bottled', quantity: 0 },
    ],
  },
  {
    id: '#006',
    customer: 'Maria Santos',
    firstName: 'Maria',
    middleInitial: 'S.',
    lastName: 'Santos',
    address: '987 Cedar Lane, Grove, Province',
    contact: '09154321098',
    assignedRider: 'David Green',
    flavor: ['Classic'],
    size: ['Bottled'],
    quantity: 1,
    total: 150,
    daysAgo: 1,
    orderType: 'Delivery',
    status: 'Pending',
    orderItems: [
      { flavor: 'Classic', size: 'Small', quantity: 0 },
      { flavor: 'Classic', size: 'Large', quantity: 0 },
      { flavor: 'Classic', size: 'Bottled', quantity: 1 },
    ],
  },
  {
    id: '#007',
    customer: 'Maria Santos',
    firstName: 'Maria',
    middleInitial: 'S.',
    lastName: 'Santos',
    address: '246 Birch Court, Park, Province',
    contact: '09143210987',
    assignedRider: 'Emma Strong',
    flavor: ['Spicy'],
    size: ['Small'],
    quantity: 1,
    total: 150,
    daysAgo: 5,
    orderType: 'Walk-in',
    status: 'Pending',
    orderItems: [
      { flavor: 'Spicy', size: 'Small', quantity: 1 },
      { flavor: 'Spicy', size: 'Large', quantity: 0 },
      { flavor: 'Spicy', size: 'Bottled', quantity: 0 },
    ],
  },
  {
    id: '#008',
    customer: 'Maria Santos',
    firstName: 'Maria',
    middleInitial: 'S.',
    lastName: 'Santos',
    address: '135 Willow Street, Wood, Province',
    contact: '09132109876',
    assignedRider: 'Chris Brown',
    flavor: ['Classic'],
    size: ['Large'],
    quantity: 1,
    total: 150,
    daysAgo: 25,
    orderType: 'Walk-in',
    status: 'Completed',
    orderItems: [
      { flavor: 'Classic', size: 'Small', quantity: 0 },
      { flavor: 'Classic', size: 'Large', quantity: 2 },
      { flavor: 'Classic', size: 'Bottled', quantity: 0 },
    ],
  },
  {
    id: '#009',
    customer: 'Maria Santos',
    firstName: 'Maria',
    middleInitial: 'S.',
    lastName: 'Santos',
    address: '579 Ash Road, Branch, Province',
    contact: '09121098765',
    assignedRider: 'Lisa Gray',
    flavor: ['Spicy', 'Classic'],
    size: ['Bottled'],
    quantity: 1,
    total: 150,
    daysAgo: 0,
    orderType: 'Delivery',
    status: 'Completed',
    orderItems: [
      { flavor: 'Spicy', size: 'Small', quantity: 0 },
      { flavor: 'Spicy', size: 'Large', quantity: 0 },
      { flavor: 'Spicy', size: 'Bottled', quantity: 1 },
      { flavor: 'Classic', size: 'Small', quantity: 0 },
      { flavor: 'Classic', size: 'Large', quantity: 0 },
      { flavor: 'Classic', size: 'Bottled', quantity: 1 },
    ],
  },
  {
    id: '#010',
    customer: 'Maria Santos',
    firstName: 'Maria',
    middleInitial: 'S.',
    lastName: 'Santos',
    address: '802 Spruce Circle, Tree, Province',
    contact: '09110987654',
    assignedRider: 'Tom White',
    flavor: ['Spicy'],
    size: ['Small'],
    quantity: 1,
    total: 150,
    daysAgo: 1,
    orderType: 'Walk-in',
    status: 'Pending',
    orderItems: [
      { flavor: 'Spicy', size: 'Small', quantity: 1 },
      { flavor: 'Spicy', size: 'Large', quantity: 0 },
      { flavor: 'Spicy', size: 'Bottled', quantity: 0 },
    ],
  },
  {
    id: '#011',
    customer: 'Maria Santos',
    firstName: 'Maria',
    middleInitial: 'S.',
    lastName: 'Santos',
    address: '413 Poplar Street, Forest, Province',
    contact: '09109876543',
    assignedRider: 'Nina Pink',
    flavor: ['Classic'],
    size: ['Large'],
    quantity: 1,
    total: 150,
    daysAgo: 6,
    orderType: 'Delivery',
    status: 'Completed',
    orderItems: [
      { flavor: 'Classic', size: 'Small', quantity: 0 },
      { flavor: 'Classic', size: 'Large', quantity: 2 },
      { flavor: 'Classic', size: 'Bottled', quantity: 0 },
    ],
  },
  {
    id: '#012',
    customer: 'Maria Santos',
    firstName: 'Maria',
    middleInitial: 'S.',
    lastName: 'Santos',
    address: '926 Oak Park, Wood, Province',
    contact: '09108765432',
    assignedRider: 'Richard Blue',
    flavor: ['Spicy'],
    size: ['Bottled'],
    quantity: 1,
    total: 150,
    daysAgo: 30,
    orderType: 'Walk-in',
    status: 'Pending',
    orderItems: [
      { flavor: 'Spicy', size: 'Small', quantity: 0 },
      { flavor: 'Spicy', size: 'Large', quantity: 0 },
      { flavor: 'Spicy', size: 'Bottled', quantity: 1 },
    ],
  },
];

const dateOptions = [
  { value: 'Today', label: 'Today' },
  { value: 'Yesterday', label: 'Yesterday' },
  { value: 'Last Week', label: 'Last Week' },
  { value: 'Last Month', label: 'Last Month' },
];

const ordersData = rawOrdersData.map((order) => ({
  ...order,
  date: formatShortDate(getDateByDaysAgo(order.daysAgo)),
  dateRange: getDateRangeFromDaysAgo(order.daysAgo),
}));

export default function OrdersPage() {
  const [orders, setOrders] = useState(ordersData);
  const [activeStatus, setActiveStatus] = useState('ALL');
  const [selectedFlavors, setSelectedFlavors] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedDate, setSelectedDate] = useState('All');
  const [selectedOrderType, setSelectedOrderType] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isAddOrderModalOpen, setIsAddOrderModalOpen] = useState(false);

  const handleOpenDetailsModal = (order) => {
    setSelectedOrder(order);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedOrder(null);
  };

  const handleOpenAddOrderModal = () => {
    setIsAddOrderModalOpen(true);
  };

  const handleCloseAddOrderModal = () => {
    setIsAddOrderModalOpen(false);
  };

  const handleAddOrder = (newOrder) => {
    setOrders((prevOrders) => [newOrder, ...prevOrders]);
    handleCloseAddOrderModal();
  };

  const handleEditOrder = (updatedOrder) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) => (order.id === updatedOrder.id ? updatedOrder : order))
    );
    handleCloseDetailsModal();
    console.log('Updated order:', updatedOrder);
  };

  const handleDeleteOrder = (orderId) => {
    setOrders((prevOrders) => prevOrders.filter((order) => order.id !== orderId));
    console.log('Deleted order:', orderId);
  };

  const toggleFlavor = (flavor) => {
    setSelectedFlavors((currentFlavors) => {
      if (currentFlavors.includes(flavor)) {
        return currentFlavors.filter((currentFlavor) => currentFlavor !== flavor);
      }

      return [...currentFlavors, flavor];
    });
  };

  const toggleSize = (size) => {
    setSelectedSizes((currentSizes) => {
      if (currentSizes.includes(size)) {
        return currentSizes.filter((currentSize) => currentSize !== size);
      }

      return [...currentSizes, size];
    });
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesStatus = activeStatus === 'ALL' || order.status === activeStatus;
      const matchesFlavor =
        selectedFlavors.length === 0 ||
        [...order.flavor].sort().join('|') === [...selectedFlavors].sort().join('|');
      const matchesSize =
        selectedSizes.length === 0 ||
        [...order.size].sort().join('|') === [...selectedSizes].sort().join('|');
      const matchesDate = selectedDate === 'All' || order.dateRange === selectedDate;
      const matchesOrderType = selectedOrderType === 'All' || order.orderType === selectedOrderType;

      return matchesStatus && matchesFlavor && matchesSize && matchesDate && matchesOrderType;
    });
  }, [activeStatus, orders, selectedFlavors, selectedSizes, selectedDate, selectedOrderType]);

  return (
    <div className="orders-main-content">
      <div className="orders-top-row">
        <div>
          <OrdersHeader />
          <OrdersTabs activeTab={activeStatus} onTabChange={setActiveStatus} />
        </div>

        <button type="button" className="add-order-btn" onClick={handleOpenAddOrderModal}>
          + Add Order
        </button>

      </div>

      <OrdersTable
        orders={filteredOrders}
        selectedFlavors={selectedFlavors}
        selectedSizes={selectedSizes}
        selectedDate={selectedDate}
        selectedOrderType={selectedOrderType}
        onFlavorToggle={toggleFlavor}
        onClearFlavors={() => setSelectedFlavors([])}
        onSizeToggle={toggleSize}
        onClearSizes={() => setSelectedSizes([])}
        onDateChange={setSelectedDate}
        onOrderTypeChange={setSelectedOrderType}
        dateOptions={dateOptions}
        onOpenDetailsModal={handleOpenDetailsModal}
      />

      {isDetailsModalOpen && selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={handleCloseDetailsModal}
          onEdit={handleEditOrder}
          onDelete={handleDeleteOrder}
        />
      )}
      {isAddOrderModalOpen && (
        <AddOrderModal
          onClose={handleCloseAddOrderModal}
          onAdd={handleAddOrder}
        />
      )}
    </div>
  );
}
