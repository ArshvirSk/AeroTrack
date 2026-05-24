import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { AlertCircle, Mail, Plane, User } from "lucide-react";
import { useState } from "react";

const Profile = () => {
  const { user, error } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    // TODO: Implement profile update logic
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] p-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center">
                <Plane className="w-8 h-8 text-yellow-500" />
              </div>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-100">Profile Settings</h2>
          <p className="text-gray-400 mt-2">Manage your account information</p>
        </div>

        <Card className="bg-[#252525] border-gray-800">
          <CardContent className="pt-6">
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg flex items-center text-red-500">
                <AlertCircle className="w-5 h-5 mr-2" />
                <span>{error}</span>
              </div>
            )}
            <form onSubmit={handleUpdateProfile} className="space-y-4">
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

              <Button
                type="submit"
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-black"
              >
                Update Profile
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
