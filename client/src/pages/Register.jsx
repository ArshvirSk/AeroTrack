import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { AlertCircle, Lock, Mail, Plane, User } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

const Register = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const { register, loading, error } = useAuth();

  const handleRegister = async (e) => {
    e.preventDefault();
    setPasswordError("");
    
    // Validate password match
    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    
    // Validate password strength
    if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters long");
      return;
    }
    
    const success = await register(name, email, password);
    if (success) {
      // Navigate to dashboard since user is now authenticated
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center overflow-hidden p-2">
                <img src={logo} alt="Logo" className="w-full h-full object-contain" />
              </div>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-100">Create Account</h2>
          <p className="text-gray-400 mt-2">
            Sign up for your aviation account
          </p>
        </div>

        <Card className="bg-[#252525] border-gray-800">
          <CardContent className="pt-6">
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg flex items-center text-red-500">
                <AlertCircle className="w-5 h-5 mr-2" />
                <span>{error}</span>
              </div>
            )}
            
            {passwordError && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg flex items-center text-red-500">
                <AlertCircle className="w-5 h-5 mr-2" />
                <span>{passwordError}</span>
              </div>
            )}
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-gray-100" htmlFor="name">
                  Full Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10 bg-[#1a1a1a] border-gray-800 text-gray-100 placeholder:text-gray-500 focus:border-yellow-500/50 focus:ring-yellow-500/20"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-100" htmlFor="email">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-[#1a1a1a] border-gray-800 text-gray-100 placeholder:text-gray-500 focus:border-yellow-500/50 focus:ring-yellow-500/20"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-100" htmlFor="password">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 bg-[#1a1a1a] border-gray-800 text-gray-100 placeholder:text-gray-500 focus:border-yellow-500/50 focus:ring-yellow-500/20"
                    placeholder="Create a password"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-100" htmlFor="confirmPassword">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 bg-[#1a1a1a] border-gray-800 text-gray-100 placeholder:text-gray-500 focus:border-yellow-500/50 focus:ring-yellow-500/20"
                    placeholder="Confirm your password"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-black"
                disabled={loading || password !== confirmPassword}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin mr-2"></div>
                    Creating account...
                  </div>
                ) : (
                  "Create Account"
                )}
              </Button>
              {password !== confirmPassword && (
                <p className="mt-2 text-sm text-red-500">
                  Passwords do not match
                </p>
              )}
            </form>

            <div className="mt-6 text-center text-gray-400">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-yellow-500 hover:text-yellow-400"
              >
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;
