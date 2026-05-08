import { useState, type ChangeEvent, type FormEvent } from "react";
import type { RiderFormData } from "./riderModalShared";

interface AddRiderModalProps {
  onClose: () => void;
  onAddRider: (formValues: RiderFormData) => void;
}

const areaOptions = [
  "Quezon City",
  "Makati",
  "Manila",
  "Marikina",
  "Taguig",
  "Paranaque",
];

const defaultRiderFormValues: RiderFormData = {
  lastName: "",
  firstName: "",
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

export default function AddRiderModal({
  onClose,
  onAddRider,
}: AddRiderModalProps): JSX.Element {
  const [form, setForm] = useState<RiderFormData>(defaultRiderFormValues);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errorMessage) setErrorMessage("");
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const requiredFields: (keyof RiderFormData)[] = [
      "firstName",
      "lastName",
      "contact",
      "email",
      "password",
    ];

    const emptyField = requiredFields.find((field) => !form[field]);

    if (emptyField) {
      setErrorMessage("Please fill in all required fields.");
      return;
    }

    if (!/^\d{10,11}$/.test(form.contact)) {
      setErrorMessage("Contact number must be 10–11 digits.");
      return;
    }

    onAddRider(form);
  };

  const inputStyle =
    "w-full bg-gray-100 border border-green-400 rounded-md px-4 py-2 text-sm " +
    "focus:outline-none focus:ring-2 focus:ring-green-500";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-11/12 max-w-3xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-xl font-bold text-green-700">Add Rider</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
            {/* Rider Information */}
            <section className="space-y-4">
              <h3 className="font-semibold text-lg">Rider Information</h3>

              <div className="grid grid-cols-3 gap-4">
                <label className="sr-only" htmlFor="firstName">
                  First Name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  placeholder="First Name"
                  aria-label="First Name"
                  value={form.firstName}
                  onChange={handleChange}
                  className={inputStyle}
                />
                <label className="sr-only" htmlFor="lastName">
                  Last Name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  placeholder="Last Name"
                  aria-label="Last Name"
                  value={form.lastName}
                  onChange={handleChange}
                  className={inputStyle}
                />
                <label className="sr-only" htmlFor="middleInitial">
                  Middle Initial
                </label>
                <input
                  id="middleInitial"
                  name="middleInitial"
                  placeholder="Middle Initial"
                  aria-label="Middle Initial"
                  value={form.middleInitial}
                  onChange={handleChange}
                  className={inputStyle}
                />
              </div>

              <label className="sr-only" htmlFor="address">
                Address
              </label>
              <input
                id="address"
                name="address"
                placeholder="Address"
                aria-label="Address"
                value={form.address}
                onChange={handleChange}
                className={inputStyle}
              />

              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-gray-700">
                  Area
                </span>
                <select
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  className={inputStyle}
                >
                  <option value="">Select area</option>
                  {areaOptions.map((area) => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid grid-cols-2 gap-4">
                <label className="sr-only" htmlFor="contact">
                  Contact
                </label>
                <input
                  id="contact"
                  name="contact"
                  placeholder="Contact"
                  aria-label="Contact"
                  value={form.contact}
                  onChange={handleChange}
                  className={inputStyle}
                />
                <label className="sr-only" htmlFor="birthdate">
                  Birthdate
                </label>
                <input
                  id="birthdate"
                  type="date"
                  name="birthdate"
                  aria-label="Birthdate"
                  value={form.birthdate}
                  onChange={handleChange}
                  className={inputStyle}
                />
              </div>

              <label className="sr-only" htmlFor="plate_number">
                Plate Number
              </label>
              <input
                id="plate_number"
                name="plate_number"
                placeholder="Plate No."
                aria-label="Plate Number"
                value={form.plate_number}
                onChange={handleChange}
                className={inputStyle}
              />

              <label className="sr-only" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="Email"
                aria-label="Email"
                value={form.email}
                onChange={handleChange}
                className={inputStyle}
              />

              <label className="sr-only" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                name="password"
                placeholder="Password"
                aria-label="Password"
                value={form.password}
                onChange={handleChange}
                className={inputStyle}
              />
            </section>

            {/* Emergency Contact */}
            <section className="space-y-4">
              <h3 className="font-semibold text-lg">Emergency Contact</h3>

              <label className="sr-only" htmlFor="emergencyName">
                Emergency Contact Name
              </label>
              <input
                id="emergencyName"
                name="emergencyName"
                placeholder="Name"
                aria-label="Emergency Contact Name"
                value={form.emergencyName}
                onChange={handleChange}
                className={inputStyle}
              />

              <label className="sr-only" htmlFor="emergencyContact">
                Emergency Contact Number
              </label>
              <input
                id="emergencyContact"
                name="emergencyContact"
                placeholder="Contact"
                aria-label="Emergency Contact Number"
                value={form.emergencyContact}
                onChange={handleChange}
                className={inputStyle}
              />
            </section>

            {errorMessage && (
              <div className="text-red-600 text-sm">{errorMessage}</div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t flex justify-end">
            <button
              type="submit"
              className="px-6 py-2 bg-yellow-400 text-black rounded-md font-semibold hover:bg-yellow-500"
            >
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
