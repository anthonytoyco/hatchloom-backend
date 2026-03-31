import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import authService, {
  SignUpRequest,
  SupportedSignupRole,
} from "../services/authService";

const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "STUDENT" as SupportedSignupRole,
    schoolId: "",
    age: "",
  });

  const requiresSchoolId =
    formData.role === "STUDENT" || formData.role === "SCHOOL_TEACHER";
  const requiresAge = formData.role === "STUDENT";
  const schoolIdUuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
    setSuccess(null);
  };

  const validateForm = (): boolean => {
    if (
      !formData.username ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError("All base fields are required");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    if (formData.password.length < 5) {
      setError("Password must be at least 5 characters long");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }
    if (requiresSchoolId && !formData.schoolId) {
      setError("schoolId is required for this role");
      return false;
    }

    if (requiresSchoolId && !schoolIdUuidRegex.test(formData.schoolId.trim())) {
      setError("schoolId must be a valid UUID");
      return false;
    }

    if (requiresAge) {
      const parsedAge = Number(formData.age);
      if (!formData.age || Number.isNaN(parsedAge) || parsedAge <= 0) {
        setError("Age must be a positive number for students");
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    if (!validateForm()) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const signUpData: SignUpRequest = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      };

      if (requiresSchoolId) signUpData.schoolId = formData.schoolId.trim();
      if (requiresAge) signUpData.age = Number(formData.age);

      const registerResponse = await authService.signup(signUpData);
      if (!registerResponse.userId) {
        setError(registerResponse.message || "Registration failed.");
        return;
      }

      const loginResponse = await authService.login({
        username: formData.username,
        password: formData.password,
      });

      if (!loginResponse.accessToken || !loginResponse.refreshToken) {
        setSuccess("Registration successful. Please log in.");
        navigate("/login");
        return;
      }

      localStorage.setItem("access_token", loginResponse.accessToken);
      localStorage.setItem("refresh_token", loginResponse.refreshToken);

      const session = await authService.validateSession();
      if (!session.valid || !session.userId) {
        setSuccess("Registration successful. Please log in.");
        navigate("/login");
        return;
      }

      localStorage.setItem(
        "user",
        JSON.stringify({
          userId: session.userId,
          username: formData.username,
          role: session.role || formData.role,
        }),
      );

      navigate(`/profile/${session.userId}`);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else if (axios.isAxiosError(err)) {
        setError(
          (err.response?.data as { message?: string } | undefined)?.message ??
            "Sign up failed. Please try again.",
        );
      } else {
        setError("Sign up failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-8 bg-slate-50">
      <div className="w-full max-w-md p-8 mx-auto bg-white shadow-xl rounded-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900">Create Account</h1>
          <p className="mt-2 text-sm text-slate-500">
            Join our learning community
          </p>
        </div>

        {error && (
          <div role="alert" className="px-3 py-2 mb-4 text-sm font-medium text-red-600 border border-red-300 rounded-lg bg-red-50">
            {error}
          </div>
        )}
        {success && (
          <div role="status" className="px-3 py-2 mb-4 text-sm font-medium border rounded-lg border-emerald-300 bg-emerald-50 text-emerald-700">
            {success}
          </div>
        )}

        <form
          onSubmit={(e) => {
            void handleSubmit(e);
          }}
          className="space-y-4"
        >
          <div>
            <label
              htmlFor="username"
              className="block mb-1 text-sm font-semibold text-slate-700"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username"
              disabled={loading}
              required
              autoComplete="username"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-100 disabled:cursor-not-allowed disabled:bg-slate-100"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block mb-1 text-sm font-semibold text-slate-700"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              disabled={loading}
              required
              autoComplete="email"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-100 disabled:cursor-not-allowed disabled:bg-slate-100"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block mb-1 text-sm font-semibold text-slate-700"
            >
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password (min 5 characters)"
                disabled={loading}
                required
                autoComplete="new-password"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 pr-10 text-sm outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-100 disabled:cursor-not-allowed disabled:bg-slate-100"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => { setShowPassword((prev) => !prev); }}
                className="absolute -translate-y-1/2 cursor-pointer right-3 top-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block mb-1 text-sm font-semibold text-slate-700"
            >
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                disabled={loading}
                required
                autoComplete="new-password"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 pr-10 text-sm outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-100 disabled:cursor-not-allowed disabled:bg-slate-100"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => { setShowConfirmPassword((prev) => !prev); }}
                className="absolute -translate-y-1/2 cursor-pointer right-3 top-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
              >
                {showConfirmPassword ? (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="role"
              className="block mb-1 text-sm font-semibold text-slate-700"
            >
              Role
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              disabled={loading}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-100 disabled:cursor-not-allowed disabled:bg-slate-100"
            >
              <option value="STUDENT">Student</option>
              <option value="SCHOOL_TEACHER">Teacher</option>
              <option value="PARENT">Parent</option>
            </select>
          </div>

          {requiresSchoolId && (
            <div>
              <label
                htmlFor="schoolId"
                className="block mb-1 text-sm font-semibold text-slate-700"
              >
                School ID
              </label>
              <input
                type="text"
                id="schoolId"
                name="schoolId"
                value={formData.schoolId}
                onChange={handleChange}
                placeholder="550e8400-e29b-41d4-a716-446655440000"
                disabled={loading}
                aria-describedby="schoolId-hint"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-100 disabled:cursor-not-allowed disabled:bg-slate-100"
              />
              <p id="schoolId-hint" className="mt-1 text-xs text-slate-400">Must be a valid UUID provided by your institution.</p>
            </div>
          )}

          {requiresAge && (
            <div>
              <label
                htmlFor="age"
                className="block mb-1 text-sm font-semibold text-slate-700"
              >
                Age
              </label>
              <input
                type="number"
                id="age"
                name="age"
                min={1}
                value={formData.age}
                onChange={handleChange}
                placeholder="16"
                disabled={loading}
                autoComplete="off"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-100 disabled:cursor-not-allowed disabled:bg-slate-100"
              />
            </div>
          )}

          <button
            type="submit"
            className="flex w-full cursor-pointer items-center justify-center rounded-lg bg-pink-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-pink-700 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={loading}
          >
            {loading && (
              <svg className="w-4 h-4 mr-2 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <div className="pt-4 mt-6 text-sm text-center border-t border-slate-200 text-slate-500">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-pink-600 hover:underline"
          >
            Log in here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
