import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import API from '../services/api';
import { Search, Briefcase, Calendar, DollarSign, Filter, Sparkles } from 'lucide-react';
import GlassCard from '../components/GlassCard';

const CATEGORIES = ['All', 'Development', 'Design', 'Database', 'Writing', 'Marketing'];

const Marketplace = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Read search criteria from URL
  const searchVal = searchParams.get('search') || '';
  const categoryVal = searchParams.get('category') || 'All';

  const [searchInput, setSearchInput] = useState(searchVal);

  useEffect(() => {
    fetchProjects();
  }, [searchParams]);

  const fetchProjects = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (searchVal) params.search = searchVal;
      if (categoryVal && categoryVal !== 'All') params.category = categoryVal;

      const res = await API.get('/projects', { params });
      setProjects(res.data.projects);
    } catch (err) {
      console.error(err);
      setError('Could not retrieve project listings.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const newParams = {};
    if (searchInput.trim()) newParams.search = searchInput.trim();
    if (categoryVal !== 'All') newParams.category = categoryVal;
    setSearchParams(newParams);
  };

  const handleCategorySelect = (category) => {
    const newParams = {};
    if (searchVal) newParams.search = searchVal;
    if (category !== 'All') newParams.category = category;
    setSearchParams(newParams);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
            <Briefcase className="text-cyan-400 w-8 h-8" />
            <span>Project Marketplace</span>
          </h1>
          <p className="text-slate-400 mt-1">Browse and apply to verified secure contracts.</p>
        </div>
      </div>

      {/* Search & Category Filter Section */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        {/* Search Bar */}
        <div className="lg:col-span-3">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              placeholder="Search by keywords (e.g. React, SaaS, logo, backend)..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-11 pr-32 py-3 bg-slate-900/60 border border-slate-800 focus:outline-none focus:border-cyan-500 text-slate-200 text-sm rounded-xl transition-all"
            />
            <Search className="w-5 h-5 text-slate-500 absolute left-4 top-3.5" />
            <button
              type="submit"
              className="absolute right-2.5 top-2 py-1.5 px-5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:brightness-110 text-slate-950 font-bold text-xs rounded-lg transition-all cursor-pointer"
            >
              Search
            </button>
          </form>
        </div>

        {/* Filter Indicator */}
        <div className="flex items-center space-x-2 text-slate-400 text-sm py-2 lg:py-0">
          <Filter className="w-4 h-4 text-cyan-400" />
          <span className="font-semibold text-slate-350">Active Filters:</span>
          <span className="bg-slate-900 border border-slate-800 text-cyan-400 text-xs px-2.5 py-0.5 rounded-full">
            {categoryVal}
          </span>
        </div>
      </div>

      {/* Category Horizontal Filter Tags */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-4 mb-8 border-b border-slate-900 scroll-smooth">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategorySelect(cat)}
            className={`px-4.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              categoryVal === cat
                ? 'bg-gradient-to-tr from-cyan-500 to-blue-500 text-slate-950 shadow-md shadow-cyan-500/10'
                : 'bg-slate-900/60 border border-slate-850 text-slate-400 hover:text-white hover:border-slate-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Main Board */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <div className="w-12 h-12 border-4 border-t-cyanAccent border-r-transparent border-slate-800 rounded-full animate-spin"></div>
          <span className="mt-4 text-sm animate-pulse">Syncing jobs...</span>
        </div>
      ) : error ? (
        <div className="text-center py-20 text-rose-400 font-semibold">{error}</div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/25 border border-slate-900 rounded-2xl p-8 max-w-xl mx-auto">
          <Sparkles className="w-10 h-10 text-slate-600 mx-auto mb-4" />
          <h3 className="text-white font-bold text-lg mb-2">No Projects Found</h3>
          <p className="text-sm text-slate-400">
            We couldn't find any open projects matching your search. Try adjusting your filters or search keywords.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((proj) => (
            <GlassCard key={proj.id} hoverEffect className="flex flex-col h-full justify-between">
              <div>
                {/* Category & Badge */}
                <div className="flex items-center justify-between mb-4">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-950/50 border border-cyan-850 text-cyan-400">
                    {proj.category}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {new Date(proj.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-white mb-2 line-clamp-1 group-hover:text-cyan-400">
                  {proj.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-slate-450 line-clamp-3 mb-6 leading-relaxed">
                  {proj.description}
                </p>

                {/* Requirements */}
                {proj.requiredSkills && (
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {proj.requiredSkills.split(',').map((skill, index) => (
                      <span
                        key={index}
                        className="text-[10px] bg-slate-900 border border-slate-850 px-2 py-0.5 rounded text-slate-400 font-medium"
                      >
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer row */}
              <div className="border-t border-slate-900 pt-4 mt-auto">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-1 text-emerald-400">
                    <DollarSign className="w-4.5 h-4.5" />
                    <span className="text-base font-bold tracking-tight">
                      {parseFloat(proj.budget).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-slate-500 text-xs">
                    <Calendar className="w-4 h-4" />
                    <span>Due {new Date(proj.deadline).toLocaleDateString()}</span>
                  </div>
                </div>

                <Link
                  to={`/project/${proj.id}`}
                  className="w-full block text-center py-2 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 text-cyan-400 hover:text-white font-bold text-xs transition-all cursor-pointer"
                >
                  View Details
                </Link>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
};

export default Marketplace;
