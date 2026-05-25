import React, { useState } from 'react';
import api from '../api/api';
import { GoogleLogin } from '@react-oauth/google';
import AuthLayout from '../components/auth/AuthLayout';
import { motion } from 'framer-motion';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    identifier: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      const res = await api.post('/auth/google', {
        token: credentialResponse.credential,
        isSignup: true,
      });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('userEmail', res.data.email || '');
      localStorage.setItem('username', res.data.username || '');
      localStorage.setItem('user', JSON.stringify({ username: res.data.username, email: res.data.email }));
      localStorage.setItem('mode', String(res.data.preferredMode || 'INVESTOR').toUpperCase());
      if (res.data.isNewUser) {
        window.location.href = '/onboarding';
      } else {
        window.location.href = '/dashboard';
      }
    } catch (error) {
      setLoading(false);
      setErrors({ general: error.response?.data?.error || 'Google Signup Failed. Please try again.' });
    }
  };

  const handleGoogleError = () => {
    setErrors({ general: 'Google Signup Failed. Please try again.' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { username, identifier, password, confirmPassword } = formData;

    if (!username || !password || !identifier || !confirmPassword) {
      setErrors({ general: 'Please fill in all fields' });
      return;
    }

    if (password !== confirmPassword) {
      setErrors({ general: 'Passwords do not match' });
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/auth/register', {
        username,
        email: identifier,
        identifier,
        password
      });

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('userEmail', res.data.email || identifier);
      localStorage.setItem('user', JSON.stringify({ username: res.data.username, email: res.data.email || identifier }));
      window.location.href = '/onboarding';
    } catch (error) {
      setLoading(false);
      setErrors({ general: error.response?.data?.error || 'Registration Failed' });
    }
  };

  return (
    <AuthLayout>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="mb-6">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2 font-['Plus_Jakarta_Sans'] tracking-tight">Create your account</h2>
          <p className="text-gray-500 text-sm font-medium">Join Radar and start your journey.</p>
        </div>

        {errors.general && (
          <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-center">
            <AlertCircle className="w-4 h-4 mr-2" />
            {errors.general}
          </div>
        )}

        <div className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <div className="relative">
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-4 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#10706B] focus:ring-4 focus:ring-[#10706B]/5 hover:border-[#10706B]/50 transition-all text-sm font-medium"
                  placeholder="Username"
                />
              </div>
            </div>

            <div>
              <div className="relative">
                <input
                  type="text"
                  name="identifier"
                  value={formData.identifier}
                  onChange={handleInputChange}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-4 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#10706B] focus:ring-4 focus:ring-[#10706B]/5 hover:border-[#10706B]/50 transition-all text-sm font-medium"
                  placeholder="Email"
                />
              </div>
            </div>

            <div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-4 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#10706B] focus:ring-4 focus:ring-[#10706B]/5 hover:border-[#10706B]/50 transition-all text-sm font-medium"
                  placeholder="Password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-2 px-4">
                Use 8 or more characters with a mix of letters, numbers & symbols.
              </p>
            </div>

            <div>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-4 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#10706B] focus:ring-4 focus:ring-[#10706B]/5 hover:border-[#10706B]/50 transition-all text-sm font-medium"
                  placeholder="Confirm Password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={loading}
              className="w-full bg-[#10706B] text-white font-bold py-4 rounded-xl hover:bg-[#0D5C58] transition-all shadow-lg shadow-[#10706B]/20 text-sm tracking-[0.1em] uppercase mt-2"
            >
              {loading ? 'CREATING ACCOUNT...' : 'SIGN UP'}
            </motion.button>
          </form>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-gray-100"></div>
            <span className="flex-shrink-0 mx-4 text-gray-400 text-xs uppercase tracking-wider font-medium">Or continue with</span>
            <div className="flex-grow border-t border-gray-100"></div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme="outline"
                size="large"
                width="100%"
                text="signup_with"
                shape="rectangular"
              />
            </div>
          </div>

          <div className="text-center pt-2">
            <span className="text-gray-500 text-sm">Already have an account? </span>
            <a href="/login" className="text-[#10706B] font-bold text-sm hover:underline">Log In</a>
          </div>
        </div>
      </motion.div>
    </AuthLayout>
  );
}
