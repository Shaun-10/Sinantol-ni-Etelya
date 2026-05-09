export interface Rider {
  orderId: number;
  id: string;
  userid: string;
  name: string;
  firstName: string;
  lastName: string;
  middleInitial: string;
  address: string;
  location: string;
  contact: string;
  birthdate: string;
  plate_number: string;
  email: string;
  emergencyName: string;
  emergencyContact: string;
  isOnline: boolean;
}

export interface RiderFormData {
  firstName: string;
  lastName: string;
  middleInitial: string;
  address: string;
  location: string;
  contact: string;
  birthdate: string;
  plate_number: string;
  email: string;
  password: string;
  emergencyName: string;
  emergencyContact: string;
}

export interface RiderFormErrors {
  [key: string]: string;
}

export const defaultRiderFormValues: RiderFormData = {
  firstName: "",
  lastName: "",
  middleInitial: "",
  address: "",
  location: "",
  contact: "",
  birthdate: "",
  plate_number: "",
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

export function normalizeDbString(value: unknown): string {
  if (typeof value !== "string") return "";

  const normalized = value.trim();
  return normalized.toUpperCase() === "N/A" ? "" : normalized;
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
    firstName: rider.firstName || "",
    lastName: rider.lastName || "",
    middleInitial: rider.middleInitial || "",
    address: normalizeDbString(rider.address),
    location: normalizeDbString(rider.location),
    contact: normalizeDbString(rider.contact),
    birthdate: rider.birthdate || "",
    plate_number: normalizeDbString(rider.plate_number),
    email: normalizeDbString(rider.email),
    password: "",
    emergencyName: rider.emergencyName || "",
    emergencyContact: rider.emergencyContact || "",
  };
}
