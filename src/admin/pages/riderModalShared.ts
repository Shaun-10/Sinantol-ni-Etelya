export interface Rider {
  orderId: number;
  id: string;
  userid: string;
  name: string;
  firstName: string;
  lastName: string;
  middleInitial: string;
  address: string;
  location: string; // ✅ ADD
  contact: string;
  birthdate: string;
  plateNo: string;
  email: string;
  emergencyName: string;
  emergencyContact: string;
  isOnline: boolean;
}

export interface RiderFormData {
  lastName: string;
  firstName: string;
  middleInitial: string;
  address: string;
  location: string; // ✅ ADD
  contact: string;
  birthdate: string;
  plateNo: string;
  email: string;
  password: string;
  emergencyName: string;
  emergencyContact: string;
}

export interface RiderFormErrors {
  [key: string]: string;
}

export const defaultRiderFormValues: RiderFormData = {
  lastName: "",
  firstName: "",
  middleInitial: "",
  address: "",
  location: "", // ✅ ADD
  contact: "",
  birthdate: "",
  plateNo: "",
  email: "",
  password: "",
  emergencyName: "",
  emergencyContact: "",
};

export function toDisplayDate(value: string): string {
  const normalized = (value || "").trim();

  if (!normalized) return "N/A";

  const match = normalized.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return normalized;

  const [, year, month, day] = match;
  return `${Number(month)}/${Number(day)}/${year}`;
}

export function toDateInputValue(value: string): string {
  const normalized = (value || "").trim();

  if (!normalized || normalized.toUpperCase() === "N/A") return "";

  if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) return normalized;

  const match = normalized.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return "";

  const [, month, day, year] = match;
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

export function buildRiderFormData(rider: Rider): RiderFormData {
  return {
    lastName: rider.lastName || "",
    firstName: rider.firstName || "",
    middleInitial: rider.middleInitial || "",
    address: rider.address || "",
    location: rider.location || "", // ✅ ADD
    contact: rider.contact || "",
    birthdate: toDateInputValue(rider.birthdate),
    plateNo: rider.plateNo || "",
    email: rider.email || "",
    password: "",
    emergencyName: rider.emergencyName || "",
    emergencyContact: rider.emergencyContact || "",
  };
}