import React from 'react';
import { motion } from 'framer-motion';
import { Github, Twitter, Linkedin, Mail } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      icon: Github,
      href: 'https://github.com/ylogx',
      label: 'GitHub'
    },
    {
      icon: Twitter,
      href: 'https://twitter.com/ylogx',
      label: 'Twitter'
    },
    {
      icon: Linkedin,
      href: 'https://linkedin.com/company/ylogx',
      label: 'LinkedIn'
    },
    {
      icon: Mail,
      href: 'mailto:contact@ylogx.com',
      label: 'Email'
    }
  ];

  return (
    <motion.footer 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white border-t border-gray-200 mt-auto"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            {socialLinks.map((link) => (
              <motion.a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-gray-700 transition-colors"
                whileHover={{ scale: 1.1 }}
                title={link.label}
              >
                <link.icon className="w-5 h-5" />
              </motion.a>
            ))}
          </div>
          
          <div className="text-sm text-gray-500">
            © {currentYear} ylogx. All rights reserved.
          </div>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer; 