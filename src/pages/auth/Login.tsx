import { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail, Loader2, Shield } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<null | string>(null);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      toast.error("Email and password are required");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE}/auth/login`,
        { email, password }
      );

      const apiResponseData = response?.data?.data; 
      const tokenWithBearer = apiResponseData?.token;

      if (tokenWithBearer && apiResponseData) {
        const rawToken = tokenWithBearer.replace(/^Bearer\s+/i, "");

        // Save token + user
        sessionStorage.setItem("token", rawToken);
        sessionStorage.setItem("user", JSON.stringify(apiResponseData));

        console.log("Login successful, user data:", apiResponseData);

        // Show success toast
        toast.success("Login successful!");

        // Navigate after small delay to let toast render
        setTimeout(() => {
          navigate("/home");
        }, 100);
      } else {
        toast.error("Invalid login credentials - No token received");
      }
    } catch (error: any) {
      console.error("Login failed:", error);
      toast.error(error?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 100 100"
        >
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#1e40af" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative min-h-screen flex items-center justify-center p-6">
        <div className="bg-white/80 backdrop-blur-sm p-10 rounded-2xl shadow-xl w-full max-w-md border border-slate-200/50 transition-all duration-300 hover:shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-slate-600 to-blue-600 rounded-xl mx-auto mb-6 flex items-center justify-center shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-semibold text-slate-800 mb-2 tracking-tight">Sign In</h1>
            <p className="text-slate-600 font-medium">Access your account securely</p>
          </div>

          {/* Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-slate-700 tracking-wide">Email Address</label>
              <div className={`relative transition-all duration-200 ${focusedField === "email" ? "transform translate-y-0" : ""}`}>
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className={`w-5 h-5 transition-colors duration-200 ${focusedField === "email" ? "text-blue-600" : "text-slate-400"}`} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Email"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-slate-400"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-slate-700 tracking-wide">Password</label>
              <div className={`relative transition-all duration-200 ${focusedField === "password" ? "transform translate-y-0" : ""}`}>
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className={`w-5 h-5 transition-colors duration-200 ${focusedField === "password" ? "text-blue-600" : "text-slate-400"}`} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Enter your password"
                  className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-slate-400"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors duration-200 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Options */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center space-x-2 text-slate-600 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500" />
                <span>Remember me</span>
              </label>
              <a href="#" className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200">Forgot password?</a>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full relative bg-gradient-to-r from-slate-700 to-blue-700 text-white py-3.5 rounded-xl font-semibold text-base shadow-lg hover:from-slate-800 hover:to-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-xl"
            >
              <div className="flex items-center justify-center space-x-2">
                {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                <span>{loading ? "Signing in..." : "Sign In"}</span>
              </div>
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            {/* Security Badge */}
            <div className="flex items-center justify-center mt-4 space-x-2 text-xs text-slate-500">
              <Shield className="w-3 h-3" />
              <span>Secured with enterprise-grade encryption</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
