import React, { useEffect, useMemo, useState } from 'react';
import { FiHash, FiMapPin, FiPhone, FiTruck, FiUser } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import RiderAppLayout from '../../components/RiderAppLayout';
import { getRiderSupabaseClient } from '../../lib/supabaseClient';
import { getRiderProfileData } from '../../lib/riderData';

interface ProfileRow {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  value: string;
}

export default function RiderProfilePage() {
  const navigate = useNavigate();
  const [profileName, setProfileName] = useState('Rider');
  const [profileEmail, setProfileEmail] = useState('-');
  const [profileContact, setProfileContact] = useState('-');
  const [profileArea, setProfileArea] = useState('-');
  const [profileMotor, setProfileMotor] = useState('-');
  const [profilePlate, setProfilePlate] = useState('-');

  const profileRows: ProfileRow[] = useMemo(
    () => [
      { icon: FiUser, label: 'Full Name', value: profileName },
      { icon: FiPhone, label: 'Contact', value: profileContact },
      { icon: FiMapPin, label: 'Assigned Area', value: profileArea },
      { icon: FiTruck, label: 'Motor Model', value: profileMotor },
      { icon: FiHash, label: 'Plate Number', value: profilePlate },
    ],
    [profileArea, profileContact, profileMotor, profileName, profilePlate]
  );

  useEffect(() => {
    const loadProfile = async () => {
      const profile = await getRiderProfileData();
      setProfileName(profile.fullName || 'Rider');
      setProfileEmail(profile.email || '-');
      setProfileContact(profile.contact || '-');
      setProfileArea(profile.assignedArea || '-');
      setProfileMotor(profile.motorModel || '-');
      setProfilePlate(profile.plateNumber || '-');
    };

    loadProfile();
  }, []);

  const handleLogout = async () => {
    const client = getRiderSupabaseClient();
    if (client) {
      await client.auth.signOut();
    }

    navigate('/rider/login', { replace: true });
  };

  return (
    <RiderAppLayout>
      {/* Profile Card */}
      <article className="bg-rider-item-bg rounded-xl overflow-hidden">
        {/* Main Section */}
        <div className="flex items-center gap-2.5 px-3 py-3 border-b border-[#8f8f8f]">
          <div className="w-[54px] h-[54px] border-2 border-black rounded-full grid place-items-center text-[2rem] flex-shrink-0">
            <FiUser />
          </div>
          <div>
            <h2 className="m-0 text-[2rem] text-[#0f6320] font-black">{profileName}</h2>
            <p className="m-0.5 text-[#335236] font-bold flex items-center gap-1.5">
              <span className="w-1.75 h-1.75 rounded-full bg-[#21a641]" />
              Active Rider
            </p>
          </div>
        </div>

        {/* Profile Rows */}
        {profileRows.map((row, idx) => {
          const Icon = row.icon;
          return (
            <div
              key={row.label}
              className={`px-3 py-3 flex gap-2.5 ${idx < profileRows.length - 1 ? 'border-b border-[#8f8f8f]' : ''}`}
            >
              <Icon size={22} className="mt-0.5 text-[#1b2f1f] flex-shrink-0" />
              <div>
                <span className="block text-[#4f5953] text-[0.85rem]">{row.label}</span>
                <strong className="block text-[#1d2b1f] text-[1.2rem] mt-0.5">{row.value}</strong>
              </div>
            </div>
          );
        })}
      </article>

      {/* Logout Button */}
      <button
        type="button"
        onClick={handleLogout}
        className="w-full mt-auto border-none rounded-[10px] bg-rider-logout-bg text-rider-logout-text px-3 py-3 text-[1.8rem] font-black cursor-pointer hover:opacity-90"
      >
        Logout
      </button>
    </RiderAppLayout>
  );
}
