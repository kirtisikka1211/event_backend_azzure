import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users, CheckCircle, ArrowRight, Star, Zap, Globe, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import Logo from '../components/UI/Logo';
import Button from '../components/UI/Button';

const Landing: React.FC = () => {
  const features = [
    {
      icon: Calendar,
      title: 'Event Management',
      description: 'Create and manage events with ease. Set dates, locations, and track attendance.',
    },
    {
      icon: Users,
      title: 'User Registration',
      description: 'Simple registration process for attendees to join events and stay connected.',
    },
    {
      icon: CheckCircle,
      title: 'Check-in System',
      description: 'Seamless check-in process for event attendees with real-time tracking.',
    },
    {
      icon: Zap,
      title: 'Real-time Updates',
      description: 'Get instant notifications about event changes and registration status.',
    },
    {
      icon: Globe,
      title: 'Global Reach',
      description: 'Connect with attendees worldwide and manage international events.',
    },
    {
      icon: Shield,
      title: 'Secure Platform',
      description: 'Enterprise-grade security to protect your event data and attendee information.',
    },
  ];

  

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-10 px-4 py-6"
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Logo />
          <div className="flex space-x-4">
            <Link to="/auth">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link to="/auth?mode=signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="relative px-4 py-20 text-center">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <h1 className="text-5xl md:text-7xl font-bold  text-gray-900 mb-6">
              Event{' '}
              <span className="bg-primary-700  bg-clip-text text-transparent">
                Management
              </span>
              <br />Made Simple
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-8">
              Streamline your events with our professional platform. Create, manage, and track events effortlessly with real-time check-ins and registration management.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          >
            <Link to="/auth?mode=signup">
              <Button size="lg" className="text-lg px-8 py-4 bg-primary-700  hover:from-primary-700 hover:from-blue-600 hover:to-blue-800 focus:ring-blue-500 shadow-lg hover:shadow-xl transition-all duration-300">
                Start Managing Events
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to="/auth">
              <Button variant="outline" size="lg" className="text-lg px-8 py-4 border-2 hover:bg-gray-50 transform hover:scale-105 transition-all duration-300">
                Sign In to Continue
              </Button>
            </Link>
          </motion.div>

          {/* Hero Animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="relative"
          >
            <div className="bg-gradient-to-r from-primary-600 to-primary-400 rounded-2xl p-8 mx-auto max-w-4xl shadow-2xl transform hover:scale-105 transition-all duration-500">

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                  className="text-center text-white"
                  whileHover={{ scale: 1.05 }}
                >
                  <Calendar className="w-12 h-12 mx-auto mb-4 animate-float" />
                  <h3 className="text-xl font-semibold mb-2">500+ Events</h3>
                  <p className="text-white/80">Successfully managed</p>
                </motion.div>
                <motion.div
                  className="text-center text-white"
                  whileHover={{ scale: 1.05 }}
                >
                  <Users className="w-12 h-12 mx-auto mb-4 animate-float" style={{ animationDelay: '1s' }} />
                  <h3 className="text-xl font-semibold mb-2">10,000+ Attendees</h3>
                  <p className="text-white/80">Connected worldwide</p>
                </motion.div>
                <motion.div
                  className="text-center text-white"
                  whileHover={{ scale: 1.05 }}
                >
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 animate-float" style={{ animationDelay: '2s' }} />
                  <h3 className="text-xl font-semibold mb-2">99.9% Uptime</h3>
                  <p className="text-white/80">Reliable platform</p>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>

        
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white relative overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Everything you need to manage events
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our comprehensive platform provides all the tools you need for successful event management.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className="group p-6 rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="bg-gradient-to-r from-primary-500  w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">{feature.title}</h3>
                <p className="text-gray-600 text-center">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary-600  relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to transform your events?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join thousands of organizations already using √logx to create memorable event experiences.
            </p>
            <Link to="/auth?mode=signup">
              <Button
                size="lg"
                variant="secondary"
                className="text-lg px-8 py-4 bg-white text-primary-600 hover:bg-gray-100 transform hover:scale-105 transition-all duration-300"
              >
                Get Started Today
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>

       
        
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <Logo className="h-8 mb-4" />
              <p className="text-gray-400">
                Professional event management platform for seamless organization and tracking.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link to="/auth" className="text-gray-400 hover:text-white transition-colors">Sign In</Link></li>
                <li><Link to="/auth?mode=signup" className="text-gray-400 hover:text-white transition-colors">Create Account</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <p className="text-gray-400">
                Email: support@ylogx.com<br />
                Phone: +1 (555) 123-4567
              </p>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-400">
              © 2024 √logx. All rights reserved. Built for the future of event management.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;