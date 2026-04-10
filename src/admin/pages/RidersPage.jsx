import { useState } from 'react';
import RidersHeader from '../components/riders/RidersHeader';
import RidersTable from '../components/riders/RidersTable';
import AddRiderModal from '../components/riders/AddRiderModal';
import RiderDetailsModal from '../components/riders/RiderDetailsModal';
import RiderDeliveriesModal from '../components/riders/RiderDeliveriesModal';

const ridersData = [
  {
    orderId: 1,
    name: 'Joseph Santos',
    firstName: 'Joseph',
    lastName: 'Santos',
    middleInitial: 'P',
    address: '14 Magsaysay St., Quezon City',
    contact: '09171234567',
    birthdate: '02/18/1995',
    plateNo: 'NBD 1023',
    status: 'Assigned',
    emergencyName: 'Maria Santos',
    emergencyContact: '09179876543',
  },
  {
    orderId: 2,
    name: 'Vince Reyes',
    firstName: 'Vince',
    lastName: 'Reyes',
    middleInitial: 'L',
    address: '22 Katipunan Ave., Quezon City',
    contact: '09183456789',
    birthdate: '08/11/1993',
    plateNo: 'NCA 9876',
    status: 'Assigned',
    emergencyName: 'Angela Reyes',
    emergencyContact: '09185551234',
  },
  {
    orderId: 3,
    name: 'Carlo Pagirigan',
    firstName: 'Carlo',
    lastName: 'Pagirigan',
    middleInitial: 'M',
    address: '17 Aurora Blvd., San Juan',
    contact: '09221234567',
    birthdate: '04/07/1992',
    plateNo: 'NCI 4422',
    status: 'Unassigned',
    emergencyName: 'Liza Pagirigan',
    emergencyContact: '09223334444',
  },
  {
    orderId: 4,
    name: 'Mark Oraa',
    firstName: 'Mark',
    lastName: 'Oraa',
    middleInitial: 'R',
    address: '9 Central Ave, U.P. Campus Quezon City, 1101 Metro Manila',
    contact: '09454211753',
    birthdate: '11/5/1991',
    plateNo: 'NBC 4685',
    status: 'Assigned',
    emergencyName: 'Carla S. Oraa',
    emergencyContact: '09354219253',
  },
];

export default function RidersPage() {
  const [riders, setRiders] = useState(ridersData);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedRider, setSelectedRider] = useState(null);
  const [isDeliveriesModalOpen, setIsDeliveriesModalOpen] = useState(false);

  const handleViewDetails = (rider) => {
    setSelectedRider(rider);
  };

  const handleOpenDeliveries = () => {
    setSelectedRider(null);
    setIsDeliveriesModalOpen(true);
  };

  const handleDeleteRider = (riderToDelete) => {
    setRiders((prev) => prev.filter((rider) => rider.orderId !== riderToDelete.orderId));

    if (selectedRider?.orderId === riderToDelete.orderId) {
      setSelectedRider(null);
      setIsDeliveriesModalOpen(false);
    }
  };

  const handleAddRider = (formValues) => {
    const nextOrderId = riders.length > 0 ? Math.max(...riders.map((rider) => rider.orderId)) + 1 : 1;

    const newRider = {
      orderId: nextOrderId,
      name: `${formValues.firstName.trim()} ${formValues.lastName.trim()}`.trim(),
      firstName: formValues.firstName.trim(),
      lastName: formValues.lastName.trim(),
      middleInitial: formValues.middleInitial.trim(),
      address: formValues.address.trim() || 'N/A',
      contact: formValues.contact.trim() || 'N/A',
      birthdate: formValues.birthdate.trim() || 'N/A',
      plateNo: formValues.plateNo.trim() || 'N/A',
      status: 'Assigned',
      emergencyName: formValues.emergencyName.trim() || 'N/A',
      emergencyContact: formValues.emergencyContact.trim() || 'N/A',
    };

    setRiders((prev) => [...prev, newRider]);
    setIsAddModalOpen(false);
  };

  const handleSaveRider = (updatedRider) => {
    setRiders((prev) =>
      prev.map((rider) => (rider.orderId === updatedRider.orderId ? updatedRider : rider))
    );
    setSelectedRider(updatedRider);
  };

  const activeRiders = riders.filter((rider) => rider.status === 'Assigned').length;

  return (
    <div className="riders-main-content">
      <RidersHeader
        onAddRider={() => setIsAddModalOpen(true)}
        activeCount={activeRiders}
        totalCount={riders.length}
      />
      <RidersTable
        riders={riders}
        onViewDetails={handleViewDetails}
      />

      {isAddModalOpen && <AddRiderModal onClose={() => setIsAddModalOpen(false)} onAddRider={handleAddRider} />}

      {selectedRider && (
        <RiderDetailsModal
          rider={selectedRider}
          onClose={() => setSelectedRider(null)}
          onOpenDeliveries={handleOpenDeliveries}
          onSaveRider={handleSaveRider}
          onDeleteRider={handleDeleteRider}
        />
      )}

      {isDeliveriesModalOpen && <RiderDeliveriesModal onClose={() => setIsDeliveriesModalOpen(false)} />}
    </div>
  );
}
