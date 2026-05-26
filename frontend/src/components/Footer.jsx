import React from 'react';
import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#05070e] border-t border-slate-900 text-slate-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4 col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center space-x-2 text-lg font-bold text-white">
              <div className="w-7 h-7 rounded bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center">
                <Lock className="w-3.5 h-3.5 text-slate-950" />
              </div>
              <span>Secure<span className="text-cyan-400">Freelance</span></span>
            </Link>
            <p className="text-sm max-w-sm">
              The modern decentralised freelance workspace. Smart escrow agreements protect payments, and encrypted pipelines deliver production files.
            </p>
            <div className="flex space-x-4 pt-2">
              {/* GitHub SVG */}
              <a href="#" className="hover:text-cyan-400 transition-colors" aria-label="GitHub">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </a>
              {/* Twitter SVG */}
              <a href="#" className="hover:text-cyan-400 transition-colors" aria-label="Twitter">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
              </a>
              {/* LinkedIn SVG */}
              <a href="#" className="hover:text-cyan-400 transition-colors" aria-label="LinkedIn">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 tracking-wider uppercase">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/marketplace" className="hover:text-cyan-400 transition-colors">Find Projects</Link></li>
              <li><Link to="/marketplace?category=Development" className="hover:text-cyan-400 transition-colors">Development Jobs</Link></li>
              <li><Link to="/marketplace?category=Design" className="hover:text-cyan-400 transition-colors">Creative Design Jobs</Link></li>
              <li><Link to="/register" className="hover:text-cyan-400 transition-colors">Become a Freelancer</Link></li>
            </ul>
          </div>

          {/* Legal / Escrow details */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 tracking-wider uppercase">Security & Escrow</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Safe Escrow Policy</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Support Centre</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs">
          <p>© {new Date().getFullYear()} SecureFreelance. All rights reserved.</p>
          <p className="mt-2 sm:mt-0 text-slate-500">
            Escrow services are powered by secure database state locking algorithms.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
