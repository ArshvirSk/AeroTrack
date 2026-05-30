import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowRight,
  BarChart3,
  Calendar,
  Clock,
  Code,
  DollarSign,
  Globe,
  Zap as Lightning,
  MapPin,
  Plane,
  Search,
  Shield,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  Zap
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

const Landing = () => {
  const navigate = useNavigate();
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = () => {
    navigate(`/flights?from=${origin}&to=${destination}&date=${date}`);
  };

  const features = [
    {
      icon: Plane,
      title: "Real-Time Flight Tracking",
      description: "Track aircraft movements globally with live position updates, altitude, speed, and route information on an interactive map.",
      action: "Track Live Flights",
      route: "/flight-map"
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Comprehensive flight reports, performance metrics, and operational insights for data-driven aviation decisions.",
      action: "View Analytics",
      route: "/report"
    },
    {
      icon: DollarSign,
      title: "Smart Cost Estimation",
      description: "AI-powered flight cost prediction using machine learning to estimate fuel, operational, and total flight expenses.",
      action: "Calculate Costs",
      route: "/cost-estimation"
    },
    {
      icon: Globe,
      title: "Global Airport Directory",
      description: "Access detailed information about airports worldwide including facilities, weather, and operational status.",
      action: "Explore Airports",
      route: "/airports"
    },
    {
      icon: Clock,
      title: "ETA Predictions",
      description: "Accurate arrival time estimations factoring in weather conditions, air traffic, and historical flight data.",
      action: "Predict ETA",
      route: "/eta-estimation"
    },
    {
      icon: Search,
      title: "Intelligent Flight Search",
      description: "Advanced flight discovery with filters, real-time availability, and comprehensive airline comparisons.",
      action: "Search Flights",
      route: "/flights"
    }
  ];

  const stats = [
    { number: "50K+", label: "Flights Tracked Daily", icon: Plane },
    { number: "1,200+", label: "Airports Covered", icon: Globe },
    { number: "99.9%", label: "Uptime Reliability", icon: Shield },
    { number: "150+", label: "Airlines Monitored", icon: Users }
  ];

  const benefits = [
    { icon: Sparkles, text: "Real-time global flight tracking" },
    { icon: Zap, text: "AI-powered cost predictions" },
    { icon: Globe, text: "Advanced weather integration" },
    { icon: BarChart3, text: "Comprehensive reporting dashboard" },
    { icon: Plane, text: "Multi-airline route comparison" },
    { icon: TrendingUp, text: "Historical performance analytics" },
    { icon: Code, text: "Mobile-responsive interface" },
    { icon: Shield, text: "Secure authentication system" }
  ];

  const testimonials = [
    { name: "Captain Johnson", role: "Commercial Pilot", text: "AeroTrack transformed how we manage flight operations. The real-time tracking is incredibly accurate.", avatar: "👨‍✈️" },
    { name: "Sarah Chen", role: "Airline Operations Manager", text: "The analytics dashboard saves us hours every week. Highly recommended for any airline.", avatar: "👩‍💼" },
    { name: "Marco Rossi", role: "Fleet Manager", text: "Best investment we made for our operations. The cost predictions are spot on.", avatar: "👨‍💼" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1E1F23] to-[#2F4550] flex flex-col text-white overflow-hidden">
      
      {/* Navigation Bar */}
      <nav className={`relative z-50 transition-all duration-300 ${scrollY > 50 ? 'bg-[#1E1F23]/90 backdrop-blur-xl border-b border-gray-800 shadow-lg' : 'bg-transparent'}`}>
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3 group cursor-pointer" onClick={() => navigate("/")}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 p-1 bg-[#2F4550]">
              <img src={logo} alt="Logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-2xl font-bold text-white tracking-wide">AeroTrack</span>
          </div>
          <div className="flex gap-4 items-center">
            <Button
              variant="ghost"
              className="text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-300"
              onClick={() => navigate("/login")}
            >
              Sign In
            </Button>
            <Button
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold shadow-md transition-all duration-300"
              onClick={() => navigate("/register")}
            >
              Get Started
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center justify-center pt-20 pb-32">
        <div className="relative z-20 container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            {/* Badge */}
            <div className="flex justify-center mb-8">
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-[#2F4550]/50 border border-yellow-500/30 rounded-full">
                <Sparkles className="w-4 h-4 text-yellow-500" />
                <span className="text-sm text-yellow-500 font-medium tracking-wide">Next-Generation Aviation Intelligence</span>
              </div>
            </div>

            {/* Hero Content */}
            <div className="text-center mb-16">
              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight text-white">
                The Future of <span className="text-yellow-500">Aviation Intelligence</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Track flights in real-time with AI-powered insights, predict costs with machine learning, and access comprehensive aviation data — all in one cutting-edge platform.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
                <Button
                  size="lg"
                  className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-8 py-6 text-lg rounded-lg shadow-lg transition-all duration-300 group"
                  onClick={() => navigate("/register")}
                >
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button
                  size="lg"
                  className="bg-transparent border border-gray-500 text-white hover:bg-gray-800 hover:border-gray-400 px-8 py-6 text-lg rounded-lg transition-all duration-300 group"
                  onClick={() => navigate("/dashboard")}
                >
                  View Demo
                  <Plane className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>

            {/* Premium Search Card */}
            <div className="relative max-w-5xl mx-auto mt-12">
              <Card className="bg-[#1E1F23]/80 backdrop-blur-md border border-gray-700 rounded-2xl shadow-2xl">
                <CardContent className="p-8">
                  <div className="flex items-center space-x-2 mb-6">
                    <Search className="w-5 h-5 text-yellow-500" />
                    <h3 className="text-xl font-semibold text-white">Quick Flight Search</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="space-y-2">
                      <Label className="text-gray-400 text-xs uppercase tracking-wider font-semibold">From</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                        <Input
                          type="text"
                          value={origin}
                          onChange={(e) => setOrigin(e.target.value)}
                          className="pl-10 bg-[#2F4550]/50 border-gray-600 text-white placeholder:text-gray-500 focus:border-yellow-500 focus:ring-yellow-500/20 rounded-lg h-12"
                          placeholder="Origin city"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-400 text-xs uppercase tracking-wider font-semibold">To</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                        <Input
                          type="text"
                          value={destination}
                          onChange={(e) => setDestination(e.target.value)}
                          className="pl-10 bg-[#2F4550]/50 border-gray-600 text-white placeholder:text-gray-500 focus:border-yellow-500 focus:ring-yellow-500/20 rounded-lg h-12"
                          placeholder="Destination city"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Date</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                        <Input
                          type="date"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          className="pl-10 bg-[#2F4550]/50 border-gray-600 text-white focus:border-yellow-500 focus:ring-yellow-500/20 rounded-lg h-12"
                        />
                      </div>
                    </div>
                    <div className="flex items-end">
                      <Button
                        size="lg"
                        className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold h-12 rounded-lg transition-all duration-300"
                        onClick={handleSearch}
                      >
                        Search Flights
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-[#1E1F23]/40 py-20 border-y border-gray-800">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-[#2F4550] rounded-full">
                    <stat.icon className="w-6 h-6 text-yellow-500" />
                  </div>
                </div>
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">{stat.number}</div>
                <div className="text-sm text-gray-400 uppercase tracking-wider font-semibold">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Powerful Aviation Tools
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Everything you need to manage, track, and analyze aviation operations with precision and reliability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-[#1E1F23]/60 border border-gray-800 hover:border-yellow-500/50 transition-colors duration-300">
                <CardContent className="p-8 flex flex-col h-full">
                  <div className="w-12 h-12 bg-[#2F4550] rounded-lg flex items-center justify-center mb-6">
                    <feature.icon className="w-6 h-6 text-yellow-500" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 mb-8 flex-grow leading-relaxed">
                    {feature.description}
                  </p>
                  <Button
                    variant="link"
                    className="text-yellow-500 hover:text-yellow-400 p-0 h-auto justify-start font-semibold"
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
      </div>

      {/* Benefits Section */}
      <div className="py-24 bg-[#1E1F23]/80 border-t border-gray-800">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                Why Professionals Choose AeroTrack
              </h2>
              <p className="text-lg text-gray-400 mb-10">
                Built by aviation experts for aviation professionals. Our platform combines cutting-edge technology with deep industry knowledge to deliver unmatched insights.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-yellow-500/20 flex items-center justify-center">
                      <benefit.icon className="w-3.5 h-3.5 text-yellow-500" />
                    </div>
                    <span className="text-gray-300 font-medium">{benefit.text}</span>
                  </div>
                ))}
              </div>

              <Button
                size="lg"
                className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-8 py-6 rounded-lg transition-all"
                onClick={() => navigate("/register")}
              >
                Start Your Free Trial
              </Button>
            </div>

            {/* Performance Stats Card */}
            <div className="bg-[#2F4550]/40 border border-gray-700 rounded-2xl p-10">
              <div className="flex items-center justify-center mb-8">
                <div className="p-4 bg-[#1E1F23] rounded-2xl">
                  <TrendingUp className="w-8 h-8 text-yellow-500" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4 text-center">Enterprise-Grade Performance</h3>
              <p className="text-gray-400 mb-10 text-center leading-relaxed">
                Experience aviation data like never before with our advanced real-time tracking architecture.
              </p>
              <div className="grid grid-cols-3 gap-6 text-center">
                <div className="p-4 bg-[#1E1F23]/50 rounded-xl border border-gray-700">
                  <div className="text-2xl font-bold text-yellow-500">&lt; 1ms</div>
                  <div className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-semibold">Latency</div>
                </div>
                <div className="p-4 bg-[#1E1F23]/50 rounded-xl border border-gray-700">
                  <div className="text-2xl font-bold text-yellow-500">24/7</div>
                  <div className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-semibold">Uptime</div>
                </div>
                <div className="p-4 bg-[#1E1F23]/50 rounded-xl border border-gray-700">
                  <div className="text-2xl font-bold text-yellow-500">100%</div>
                  <div className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-semibold">Accuracy</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
              Trusted by the Industry
            </h2>
            <p className="text-gray-400 text-lg">Join leaders in aviation who rely on AeroTrack.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-[#1E1F23]/60 border border-gray-800">
                <CardContent className="p-8">
                  <div className="flex space-x-1 mb-6">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                    ))}
                  </div>
                  <p className="text-gray-300 leading-relaxed mb-6">"{testimonial.text}"</p>
                  <div className="flex items-center space-x-4">
                    <div className="text-3xl bg-[#2F4550] w-12 h-12 flex items-center justify-center rounded-full">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <h4 className="font-bold text-white">{testimonial.name}</h4>
                      <p className="text-sm text-gray-400">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Final CTA Section */}
      <div className="py-24 bg-yellow-500">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-6">
              Ready to Upgrade Your Operations?
            </h2>
            <p className="text-xl text-black/80 mb-10">
              Join thousands of aviation professionals who trust AeroTrack. Start your free trial today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-black hover:bg-gray-900 text-white font-bold px-8 py-6 text-lg rounded-lg shadow-xl"
                onClick={() => navigate("/register")}
              >
                Create Account
              </Button>
              <Button
                size="lg"
                className="bg-transparent border-2 border-black text-black hover:bg-black/10 font-bold px-8 py-6 text-lg rounded-lg"
                onClick={() => navigate("/login")}
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#1a1a1a] border-t border-gray-800 py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 rounded flex items-center justify-center bg-[#2F4550]">
                  <img src={logo} alt="Logo" className="w-full h-full object-contain p-1" />
                </div>
                <span className="text-xl font-bold text-white tracking-wide">AeroTrack</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Professional aviation intelligence platform for flight tracking, cost estimation, and analytics.
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-xs">Product</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li className="hover:text-yellow-500 cursor-pointer transition-colors">Features</li>
                <li className="hover:text-yellow-500 cursor-pointer transition-colors">Pricing</li>
                <li className="hover:text-yellow-500 cursor-pointer transition-colors">Security</li>
                <li className="hover:text-yellow-500 cursor-pointer transition-colors">API</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-xs">Company</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li className="hover:text-yellow-500 cursor-pointer transition-colors">About Us</li>
                <li className="hover:text-yellow-500 cursor-pointer transition-colors">Careers</li>
                <li className="hover:text-yellow-500 cursor-pointer transition-colors">Blog</li>
                <li className="hover:text-yellow-500 cursor-pointer transition-colors">Contact</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-xs">Legal</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li className="hover:text-yellow-500 cursor-pointer transition-colors">Privacy Policy</li>
                <li className="hover:text-yellow-500 cursor-pointer transition-colors">Terms of Service</li>
                <li className="hover:text-yellow-500 cursor-pointer transition-colors">Cookie Policy</li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
            <p>© {new Date().getFullYear()} AeroTrack. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
