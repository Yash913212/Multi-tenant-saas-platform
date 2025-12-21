import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Input from '../components/Common/Input';
import Button from '../components/Common/Button';
import { isValidEmail } from '../utils/helpers';

export const Login = () => {
  const navigate = useNavigate();
  const { login, error: authError } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    subdomain: '',
    rememberMe: false,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors = {};

    if (!isValidEmail(formData.email)) {
      newErrors.email = 'Invalid email address';
    }

    if (!formData.password || formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.subdomain.trim()) {
      newErrors.subdomain = 'Subdomain is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    const result = await login(
      formData.email,
      formData.password,
      formData.subdomain
    );

    if (result.success) {
      if (formData.rememberMe) {
        localStorage.setItem('rememberedSubdomain', formData.subdomain);
      }
      navigate('/dashboard');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
          Welcome Back
        </h1>
        <p className="text-center text-gray-600 mb-6">
          Login to your SaaS account
        </p>

        {authError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            {authError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            placeholder="you@example.com"
            required
          />

          <Input
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            placeholder="Your password"
            required
          />

          <Input
            label="Tenant Subdomain"
            name="subdomain"
            value={formData.subdomain}
            onChange={handleChange}
            error={errors.subdomain}
            placeholder="mycompany"
            required
          />

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
              className="w-4 h-4"
            />
            <span className="text-sm text-gray-700">Remember me</span>
          </label>

          <Button
            type="submit"
            loading={loading}
            className="w-full"
          >
            Login
          </Button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-500 hover:text-blue-700 font-semibold">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
