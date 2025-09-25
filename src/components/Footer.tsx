
'use client';

import React from "react";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 text-center md:text-left">
          
          {/* 🔹 About HR Portal */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-white-400">HR Portal  </h3>
             <p className="text-gray-500">Provide organization management solutions</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-4 text-white-400">About</h3>
            <p className="text-gray-500 ">
              HR Portal is a smart solution for managing human resources. Register your organization and streamline your HR processes efficiently. HR Portal is a smart solution for managing human resources. Register your organization and streamline your HR processes efficiently.
            </p>
          </div>

          {/* 🔹 Quick Links */}
          {/* <div>
            <h3 className="text-xl font-semibold mb-4 text-white-400">Quick Links</h3>
            <ul className="space-y-2">
              {["Home", "Dashboard", "Register", "Contact"].map((link, index) => (
                <li key={index}>
                  <a
                    href={`/${link.toLowerCase()}`}
                    className="text-white-100 hover:text-white-800 transition duration-300"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div> */}

          {/* 🔹 Newsletter Subscription */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-white-500">Stay Updated</h3>
            <p className="text-gray-500 mb-4">Get the latest updates and HR tips!</p>
            {/* <div className="relative">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full p-3 text-gray-600 rounded-full focus:outline-none "
              />
              <button className="absolute right-2 top-2 bg-gray-400 px-4 py-2 rounded-full text-black font-semibold hover:bg-red-500 transition">
                Subscribe
              </button>
            </div> */}
          </div>
             <div>
            <h3 className="text-xl font-semibold mb-4 text-white-00">Address </h3>
             <p className="text-gray-500">B 113, Sector 121, Noida, Gautam Buddha Nagar, Uttar Pradesh India 201307</p>
          </div>
           <div>
            <h3 className="text-xl font-semibold mb-4 text-white-400">Contact </h3>
             <p className="text-gray-500">📞 +91 55518911947 <br></br>
                 ✉️hello@hrmanagement.in</p>
          </div>

          {/* 🔹 Social Media */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-white-400">Connect with Us</h3>
            <div className="flex justify-center md:justify-start space-x-4">
              <a href="#" className="text-gray-500 hover:text-blue-800 text-3xl transition"><FaFacebook /></a>
              <a href="#" className="text-gray-500 hover:text-blue-400 text-3xl transition"><FaTwitter /></a>
              <a href="#" className="text-gray-500 hover:text-pink-500 text-3xl transition"><FaInstagram /></a>
              <a href="#" className="text-gray-500 hover:text-blue-800 text-3xl transition"><FaLinkedin /></a>
            </div>
          </div>
        </div>
        
        {/* 🔹 Copyright */}
        <div className="text-center text-gray-500 mt-12 border-t border-gray-700 pt-6">
          <p>© {new Date().getFullYear()} HR Portal. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
