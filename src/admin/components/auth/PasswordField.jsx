import { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

export default function PasswordField({ name = 'password', placeholder, value, onChange, error }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="mb-3 w-full">
      <div className="flex items-center rounded-lg border border-transparent bg-[#d9ddd6] px-3 py-2 transition focus-within:border-[#1c5d2a]">
        <input
          name={name}
          type={showPassword ? 'text' : 'password'}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="w-full bg-transparent text-sm text-[#1f2d23] outline-none"
        />
        <button
          type="button"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          onClick={() => setShowPassword((prev) => !prev)}
          className="pl-2 text-[#244229]"
        >
          {showPassword ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>
      {error ? <p className="mt-1 text-xs text-red-700">{error}</p> : null}
    </div>
  );
}
