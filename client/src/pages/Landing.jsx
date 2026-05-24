import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowRight,
  BarChart3,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Globe,
  MapPin,
  Plane,
  Search,
  Shield,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");

  const handleSearch = () => {
    navigate(`/flights?from=${origin}&to=${destination}&date=${date}`);
  };

  const features = [
    {
      icon: Plane,
      title: "Real-Time Flight Tracking",
      description: "Track aircraft movements globally with live position updates, altitude, speed, and route information on an interactive map.",
      action: "Track Live Flights",
      route: "/flight-map",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Comprehensive flight reports, performance metrics, and operational insights for data-driven aviation decisions.",
      action: "View Analytics",
      route: "/report",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: DollarSign,
      title: "Smart Cost Estimation",
      description: "AI-powered flight cost prediction using machine learning to estimate fuel, operational, and total flight expenses.",
      action: "Calculate Costs",
      route: "/cost-estimation",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      icon: Globe,
      title: "Global Airport Directory",
      description: "Access detailed information about airports worldwide including facilities, weather, and operational status.",
      action: "Explore Airports",
      route: "/airports",
      gradient: "from-orange-500 to-red-500"
    },
    {
      icon: Clock,
      title: "ETA Predictions",
      description: "Accurate arrival time estimations factoring in weather conditions, air traffic, and historical flight data.",
      action: "Predict ETA",
      route: "/eta-estimation",
      gradient: "from-indigo-500 to-blue-500"
    },
    {
      icon: Search,
      title: "Intelligent Flight Search",
      description: "Advanced flight discovery with filters, real-time availability, and comprehensive airline comparisons.",
      action: "Search Flights",
      route: "/flights",
      gradient: "from-teal-500 to-cyan-500"
    }
  ];

  const stats = [
    { number: "50K+", label: "Flights Tracked Daily", icon: Plane },
    { number: "1,200+", label: "Airports Covered", icon: Globe },
    { number: "99.9%", label: "Uptime Reliability", icon: Shield },
    { number: "150+", label: "Airlines Monitored", icon: Users }
  ];

  const benefits = [
    "Real-time global flight tracking",
    "AI-powered cost predictions", 
    "Advanced weather integration",
    "Comprehensive reporting dashboard",
    "Multi-airline route comparison",
    "Historical performance analytics",
    "Mobile-responsive interface",
    "Secure authentication system"
  ];

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex flex-col">
      {/* Navigation Bar */}
      <nav className="absolute top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Plane className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">AeroTrack</span>
          </div>
          <div className="flex gap-4">
            <Button
              variant="ghost"
              className="text-white hover:text-indigo-400 hover:bg-white/10"
              onClick={() => navigate("/login")}
            >
              Sign In
            </Button>
            <Button
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
              onClick={() => navigate("/register")}
            >
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-black/60 to-black/80 z-10" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2074&q=80')] bg-cover bg-center" />
        
        {/* Animated particles effect */}
        <div className="absolute inset-0 z-5">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-yellow-500/30 rounded-full animate-pulse"></div>
          <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-blue-500/40 rounded-full animate-ping"></div>
          <div className="absolute bottom-1/3 left-1/2 w-3 h-3 bg-green-500/20 rounded-full animate-bounce"></div>
        </div>

        <div className="relative z-20 container mx-auto px-6 pt-20">
          <div className="max-w-6xl mx-auto text-center">
            {/* Hero Content */}
            <div className="mb-12">
              <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
                The Future of
                <span className="block bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
                  Aviation Intelligence
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-4xl mx-auto leading-relaxed">
                Track flights in real-time, predict costs with AI, analyze performance metrics, and access comprehensive aviation data — all in one powerful platform.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Button
                  size="lg"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-4 text-lg"
                  onClick={() => navigate("/register")}
                >
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg"
                  onClick={() => navigate("/dashboard")}
                >
                  View Demo
                  <Plane className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>

            {/* Quick Flight Search */}
            <Card className="bg-white/10 backdrop-blur-lg border-white/20 max-w-4xl mx-auto">
              <CardContent className="p-8">
                <h3 className="text-2xl font-semibold text-white mb-6">Quick Flight Search</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white font-medium">From</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <Input
                        type="text"
                        value={origin}
                        onChange={(e) => setOrigin(e.target.value)}
                        className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                        placeholder="Origin city"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white font-medium">To</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <Input
                        type="text"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                        placeholder="Destination city"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white font-medium">Date</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <Input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="pl-10 bg-white/10 border-white/20 text-white"
                      />
                    </div>
                  </div>
                  <div className="flex items-end">
                    <Button
                      size="lg"
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                      onClick={handleSearch}
                    >
                      <Search className="w-5 h-5 mr-2" />
                      Search
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gradient-to-r from-indigo-600/10 to-purple-600/10 py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  <stat.icon className="w-8 h-8 text-indigo-500" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">{stat.number}</div>
                <div className="text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Powerful Aviation Tools
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Everything you need to manage, track, and analyze aviation operations in one comprehensive platform.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="bg-[#252525] border-gray-800 hover:border-indigo-500/50 transition-all duration-300 group hover:scale-105">
              <CardContent className="p-8">
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-400 mb-6 leading-relaxed">
                  {feature.description}
                </p>
                <Button
                  variant="outline"
                  className="border-indigo-500/50 text-indigo-400 hover:text-white hover:bg-indigo-500/10 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300"
                  onClick={() => navigate(feature.route)}
                >
                  {feature.action}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-gradient-to-br from-[#252525] to-[#1a1a1a] py-20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Why Choose AeroTrack?
              </h2>
              <p className="text-xl text-gray-400 mb-8">
                Built by aviation experts for aviation professionals. Our platform combines cutting-edge technology with deep industry knowledge.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-300">{benefit}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <Button
                  size="lg"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                  onClick={() => navigate("/register")}
                >
                  Start Your Free Trial
                  <Zap className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 rounded-2xl p-8 backdrop-blur-sm border border-indigo-500/30">
                <div className="text-center">
                  <TrendingUp className="w-16 h-16 text-indigo-500 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-white mb-4">Real-Time Performance</h3>
                  <p className="text-gray-300 mb-6">
                    Experience aviation data like never before with our advanced real-time tracking and analytics engine.
                  </p>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-indigo-500">&lt; 1ms</div>
                      <div className="text-sm text-gray-400">Latency</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-indigo-500">24/7</div>
                      <div className="text-sm text-gray-400">Monitoring</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-indigo-500">100%</div>
                      <div className="text-sm text-gray-400">Accuracy</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 py-16">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Aviation Operations?
          </h2>
          <p className="text-xl text-white/80 mb-8 max-w-3xl mx-auto">
            Join thousands of aviation professionals who trust AeroTrack for their flight tracking, analytics, and operational intelligence needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold"
              onClick={() => navigate("/register")}
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              size="lg"
              className="bg-white text-indigo-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold"
              onClick={() => navigate("/login")}
            >
              Sign In to Dashboard
              <Plane className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black py-12">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <div className="flex justify-center items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Plane className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">AeroTrack</span>
            </div>
            <p className="text-gray-400 mb-6">
              The most advanced aviation intelligence platform for professionals worldwide.
            </p>
            <div className="flex justify-center space-x-6 text-gray-400">
              <span>© 2026 AeroTrack. All rights reserved.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
