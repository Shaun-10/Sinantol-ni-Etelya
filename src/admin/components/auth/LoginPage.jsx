import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import AuthLayout from './AuthLayout';
import AuthCard from './AuthCard';
import InputField from './InputField';
import PasswordField from './PasswordField';

const defaultValues = {
  email: '',
  password: ''
};

export default function LoginPage() {
  const [form, setForm] = useState(defaultValues);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.email.trim()) nextErrors.email = 'Email is required.';
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) {
      nextErrors.email = 'Enter a valid email address.';
    }
    if (!form.password) nextErrors.password = 'Password is required.';

    return nextErrors;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length === 0) {
      console.log('Login form submitted:', form);
      navigate('/dashboard');
    }
  };

  return (
    <AuthLayout>
      <AuthCard
        title="WELCOME BACK"
        size="large"
      >
        <form onSubmit={handleSubmit} noValidate>
          <InputField
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            error={errors.email}
          />
          <PasswordField
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            error={errors.password}
          />

          <button
            type="submit"
            className="mt-1 w-full rounded-lg bg-[#3f7f2f] px-4 py-2 text-base font-semibold text-white transition hover:bg-[#2f6422]"
          >
            Log In
          </button>
        </form>
      </AuthCard>
    </AuthLayout>
  );
}
