import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Input from '../components/Common/Input';
import Button from '../components/Common/Button';
import { isValidSubdomain, isValidEmail } from '../utils/helpers';

export const Register = () => {
  const navigate = useNavigate();
  const { register, error: authError } = useAuth();
  const [formData, setFormData] = useState({
    organizationName: '',
    subdomain: '',
    adminEmail: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const newErrors = {};

    if (!formData.organizationName.trim()) {
      newErrors.organizationName = 'Organization name is required';
    }

    if (!isValidSubdomain(formData.subdomain)) {
      newErrors.subdomain = 'Subdomain must be 3+ characters, lowercase, letters/numbers/hyphens only';
    }

    if (!isValidEmail(formData.adminEmail)) {
      newErrors.adminEmail = 'Invalid email address';
    }

    if (!formData.password || formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms';
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
    const result = await register(
      formData.organizationName,
      formData.subdomain,
      formData.adminEmail,
      formData.password
    );

    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
          Create Account
        </h1>
        <p className="text-center text-gray-600 mb-6">
          Start your SaaS journey today
        </p>

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
            ✓ Registration successful! Redirecting...
          </div>
        )}

        {authError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            {authError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Organization Name"
            name="organizationName"
            value={formData.organizationName}
            onChange={handleChange}
            error={errors.organizationName}
            placeholder="Your company name"
            required
          />

          <div>
            <Input
              label="Subdomain"
              name="subdomain"
              value={formData.subdomain}
              onChange={handleChange}
              error={errors.subdomain}
              placeholder="mycompany"
              required
            />
            {formData.subdomain && (
              <p className="text-sm text-gray-600 mt-2">
                URL: <span className="font-mono font-bold">{formData.subdomain}.yoursaasapp.com</span>
              </p>
            )}
          </div>

          <Input
            label="Admin Email"
            type="email"
            name="adminEmail"
            value={formData.adminEmail}
            onChange={handleChange}
            error={errors.adminEmail}
            placeholder="admin@company.com"
            required
          />

          <Input
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            placeholder="At least 6 characters"
            required
          />

          <Input
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            placeholder="Confirm password"
            required
          />

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="agreeToTerms"
              checked={formData.agreeToTerms}
              onChange={handleChange}
              className="mt-1 w-4 h-4"
            />
            <span className="text-sm text-gray-700">
              I agree to the Terms & Conditions and Privacy Policy
            </span>
          </label>
          {errors.agreeToTerms && (
            <p className="text-red-500 text-sm">{errors.agreeToTerms}</p>
          )}

          <Button
            type="submit"
            loading={loading}
            className="w-full"
            disabled={success}
          >
            Create Account
          </Button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-500 hover:text-blue-700 font-semibold">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
