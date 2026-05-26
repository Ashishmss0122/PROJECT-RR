import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Terminal, 
  Paintbrush, 
  Sparkles, 
  ArrowRight, 
  DollarSign, 
  FileCheck, 
  Upload 
} from 'lucide-react';
import GlassCard from '../components/GlassCard';

const Home = () => {
  return (
    <div className="relative min-h-screen bg-darkBg overflow-hidden pb-16">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyanAccent/10 rounded-full glow-blur -z-10 animate-pulse"></div>
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-blueAccent/10 rounded-full glow-blur -z-10 duration-5000 animate-pulse"></div>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-cyan-400 mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>The Next Generation Freelance Work Engine</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight max-w-4xl mx-auto">
          Secure Work. Guaranteed Payments. <br />
          <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 bg-clip-text text-transparent text-glow-cyan">
            Powered by Escrow.
          </span>
        </h1>
        <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10">
          A secure freelance ecosystem where users can post projects, bid on contracts, deliver works, and receive verified deposits instantly.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/marketplace"
            className="w-full sm:w-auto px-8 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 font-bold hover:brightness-110 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/35 transition-all flex items-center justify-center space-x-2"
          >
            <span>Explore Marketplace</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            to="/register"
            className="w-full sm:w-auto px-8 py-3 rounded-full bg-slate-900 border border-slate-800 text-slate-200 font-semibold hover:bg-slate-850 hover:border-slate-700 transition-colors flex items-center justify-center"
          >
            Create Free Account
          </Link>
        </div>
      </section>

      {/* Trust Escrow Pitch */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <GlassCard className="max-w-5xl mx-auto border border-cyan-500/20 bg-cyan-950/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <ShieldCheck className="w-48 h-48 text-cyan-400" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center text-left">
            <div className="md:col-span-2 space-y-4">
              <h3 className="text-2xl font-bold text-white flex items-center space-x-2">
                <ShieldCheck className="w-6 h-6 text-cyan-400" />
                <span>Double-Sided Escrow Protection</span>
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                No more chasing invoices or paying for half-finished code. In SecureFreelance, contracts lock agreed amounts. The Client deposits funds into platform escrow, which are automatically released to the Freelancer only after work deliverables are uploaded and accepted.
              </p>
            </div>
            <div className="border-t md:border-t-0 md:border-l border-slate-800 pt-6 md:pt-0 md:pl-8 space-y-3">
              <div className="flex items-center space-x-2 text-cyan-400 text-sm font-bold">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                <span>0% Upfront Financial Risk</span>
              </div>
              <div className="text-xs text-slate-500">
                Escrow funds are backed by secure state logs, guaranteeing that both parties are safe.
              </div>
            </div>
          </div>
        </GlassCard>
      </section>

      {/* Popular Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-10">
          Search by Top Expertise
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { name: 'Development', icon: Terminal, desc: 'Web apps, API, DB setups', link: '/marketplace?category=Development' },
            { name: 'Design', icon: Paintbrush, desc: 'Logo, UI/UX, Vector assets', link: '/marketplace?category=Design' },
            { name: 'Database', icon: ShieldCheck, desc: 'Optimisation, Scripting', link: '/marketplace?category=Database' },
            { name: 'Marketing', icon: Sparkles, desc: 'SEO, Content, Ad copies', link: '/marketplace?category=Marketing' },
          ].map((cat, i) => (
            <Link key={i} to={cat.link}>
              <GlassCard hoverEffect className="text-center p-8 flex flex-col items-center group">
                <div className="w-12 h-12 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400 group-hover:bg-gradient-to-tr group-hover:from-cyan-500 group-hover:to-blue-500 group-hover:text-slate-950 transition-all duration-300 mb-4">
                  <cat.icon className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-white mb-2">{cat.name}</h4>
                <p className="text-xs text-slate-500">{cat.desc}</p>
              </GlassCard>
            </Link>
          ))}
        </div>
      </section>

      {/* How it Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-900">
        <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-12">
          Unified Project Lifecycle
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            { step: '1', title: 'Post a Project', desc: 'Define budget, requirements, and deadlines. Any user can act as client.', icon: FileCheck },
            { step: '2', title: 'Collect Bids', desc: 'Freelancers apply, bidding their budget and times. Review and select.', icon: DollarSign },
            { step: '3', title: 'Escrow Locks', desc: 'Select a bid to freeze the funds. Contract shifts status to active.', icon: ShieldCheck },
            { step: '4', title: 'Upload & Complete', desc: 'Deliver files directly inside contracts. Accept and release escrow.', icon: Upload },
          ].map((item, i) => (
            <div key={i} className="relative flex flex-col items-center md:items-start text-center md:text-left">
              <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 text-sm font-bold text-cyan-400 flex items-center justify-center mb-4">
                {item.step}
              </div>
              <h4 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <item.icon className="w-4 h-4 text-slate-500" />
                <span>{item.title}</span>
              </h4>
              <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-900 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-10">
          What Our Users Say
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <GlassCard className="text-left p-6">
            <p className="text-sm text-slate-400 italic mb-4">
              "Being able to bid on React components while simultaneously hiring someone else to design my logo from the same account is fantastic. The unified model works flawlessly."
            </p>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-slate-800"></div>
              <div>
                <h5 className="text-sm font-bold text-white">Alice Client</h5>
                <span className="text-xs text-slate-500">Dual Active User</span>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="text-left p-6">
            <p className="text-sm text-slate-400 italic mb-4">
              "As a developer, I am always paranoid about clients disappearing. On SecureFreelance, I can see when escrow is funded. Once I submit my React bundle, they click complete, and I get paid."
            </p>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-slate-800"></div>
              <div>
                <h5 className="text-sm font-bold text-white">Bob Freelancer</h5>
                <span className="text-xs text-slate-500">React Specialist</span>
              </div>
            </div>
          </GlassCard>
        </div>
      </section>
    </div>
  );
};

export default Home;
