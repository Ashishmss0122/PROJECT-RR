import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import { 
  LayoutDashboard, 
  PlusCircle, 
  FileText, 
  Briefcase, 
  DollarSign, 
  Upload, 
  Download, 
  CheckCircle, 
  MessageSquare, 
  Loader2, 
  ArrowUpRight, 
  ArrowDownLeft, 
  AlertCircle, 
  Clock,
  Eye
} from 'lucide-react';
import GlassCard from '../components/GlassCard';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview');
  
  // Dashboard overall data states
  const [postedProjects, setPostedProjects] = useState([]);
  const [bids, setBids] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [ledger, setLedger] = useState([]);
  
  // Dynamic metrics
  const [stats, setStats] = useState({
    spent: 0,
    earned: 0,
    activeContracts: 0,
    openBids: 0
  });

  // Client Post Project Form State
  const [postForm, setPostForm] = useState({
    title: '',
    description: '',
    budget: '',
    deadline: '',
    requiredSkills: '',
    category: 'Development'
  });
  const [postLoading, setPostLoading] = useState(false);
  const [postMessage, setPostMessage] = useState({ type: '', text: '' });

  // File submission upload states
  const [uploadLoadingId, setUploadLoadingId] = useState(null);
  const [contractDetails, setContractDetails] = useState({});

  // Applicants view overlay modal state
  const [focusedProject, setFocusedProject] = useState(null);
  const [projectBids, setProjectBids] = useState([]);
  const [loadingBids, setLoadingBids] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, [activeTab]);

  const fetchDashboardData = async () => {
    try {
      // 1. Fetch user's posted projects
      const postedRes = await API.get('/projects/my-posts');
      setPostedProjects(postedRes.data.projects);

      // 2. Fetch user's bids
      const bidsRes = await API.get('/bids/my-bids');
      setBids(bidsRes.data.bids);

      // 3. Fetch user's contracts
      const contractsRes = await API.get('/contracts/my-contracts');
      setContracts(contractsRes.data.contracts);

      // 4. Fetch user's ledger
      const ledgerRes = await API.get('/payments/my-ledger');
      setLedger(ledgerRes.data.ledger);

      // Calculate stats
      let totalSpent = 0;
      let totalEarned = 0;
      let activeCount = 0;

      contractsRes.data.contracts.forEach(c => {
        if (c.contractStatus === 'Active' || c.contractStatus === 'Submitted') {
          activeCount++;
        }
        if (c.contractStatus === 'Completed') {
          if (c.clientId === user.id) {
            totalSpent += parseFloat(c.agreedAmount);
          }
          if (c.freelancerId === user.id) {
            totalEarned += parseFloat(c.agreedAmount);
          }
        }
      });

      setStats({
        spent: totalSpent,
        earned: totalEarned,
        activeContracts: activeCount,
        openBids: bidsRes.data.bids.filter(b => b.status === 'Pending').length
      });

      // Load files for active contracts in background
      contractsRes.data.contracts.forEach(async (c) => {
        if (c.contractStatus === 'Active' || c.contractStatus === 'Submitted') {
          try {
            const detailRes = await API.get(`/contracts/${c.id}`);
            setContractDetails(prev => ({
              ...prev,
              [c.id]: detailRes.data.contract
            }));
          } catch (e) {
            console.error(e);
          }
        }
      });

    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    }
  };

  const handlePostProjectSubmit = async (e) => {
    e.preventDefault();
    setPostLoading(true);
    setPostMessage({ type: '', text: '' });

    try {
      await API.post('/projects', postForm);
      setPostMessage({ type: 'success', text: 'Project posted successfully to marketplace!' });
      setPostForm({
        title: '',
        description: '',
        budget: '',
        deadline: '',
        requiredSkills: '',
        category: 'Development'
      });
      fetchDashboardData();
    } catch (err) {
      setPostMessage({ type: 'error', text: err.response?.data?.message || 'Failed to post project.' });
    } finally {
      setPostLoading(false);
    }
  };

  const handleViewApplicants = async (proj) => {
    setFocusedProject(proj);
    setLoadingBids(true);
    try {
      const res = await API.get(`/bids/project/${proj.id}`);
      setProjectBids(res.data.bids);
    } catch (err) {
      console.error(err);
      alert('Failed to load project applicants.');
      setFocusedProject(null);
    } finally {
      setLoadingBids(false);
    }
  };

  const handleHireApplicant = async (bidId) => {
    if (!window.confirm('Hire this applicant? This activates contract escrow.')) return;
    try {
      await API.put(`/bids/${bidId}/status`, { status: 'Accepted' });
      alert('Contract established successfully.');
      setFocusedProject(null);
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to hire applicant.');
    }
  };

  const handleUploadWork = async (e, contractId) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadLoadingId(contractId);
    const formData = new FormData();
    formData.append('workFile', file);

    try {
      // 1. Upload work deliverable file
      await API.post(`/files/upload/${contractId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      // 2. Submit contract state update
      await API.put(`/contracts/${contractId}/submit`);
      alert('Work uploaded and contract submitted successfully.');
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Upload failed.');
    } finally {
      setUploadLoadingId(null);
    }
  };

  const handleDownloadFile = async (fileId, fileName) => {
    try {
      const response = await API.get(`/files/download/${fileId}`, {
        responseType: 'blob'
      });
      // Create HTML download anchor
      const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      alert('Failed to download work file.');
    }
  };

  const handleReleaseEscrow = async (contractId) => {
    if (!window.confirm('Are you sure you want to release the escrow payment to this freelancer? This will mark the project contract as Completed.')) {
      return;
    }

    try {
      await API.put(`/contracts/${contractId}/complete`);
      alert('Escrow released and contract marked completed.');
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to complete contract.');
    }
  };

  const handleDeleteProject = async (projId) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      await API.delete(`/projects/${projId}`);
      alert('Project deleted successfully.');
      fetchDashboardData();
    } catch (err) {
      alert('Failed to delete project.');
    }
  };

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">
      
      {/* Welcome Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
            <LayoutDashboard className="text-cyan-400 w-8 h-8" />
            <span>Workspace Dashboard</span>
          </h1>
          <p className="text-slate-400 mt-1">Hello, {user.fullName}. Manage your client and freelancer operations.</p>
        </div>
      </div>

      {/* Metrics Stats Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <GlassCard className="p-4 border border-slate-900 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold block">Earned (Freelancer)</span>
            <span className="text-xl sm:text-2xl font-extrabold text-emerald-400 mt-1 block">${stats.earned.toLocaleString()}</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-950/20 text-emerald-400 border border-emerald-900/30 flex items-center justify-center">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </GlassCard>

        <GlassCard className="p-4 border border-slate-900 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold block">Spent (Client)</span>
            <span className="text-xl sm:text-2xl font-extrabold text-white mt-1 block">${stats.spent.toLocaleString()}</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-slate-900 text-slate-400 border border-slate-800 flex items-center justify-center">
            <ArrowDownLeft className="w-5 h-5" />
          </div>
        </GlassCard>

        <GlassCard className="p-4 border border-slate-900 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold block">Active Contracts</span>
            <span className="text-xl sm:text-2xl font-extrabold text-cyan-400 mt-1 block">{stats.activeContracts}</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-cyan-950/20 text-cyan-400 border border-cyan-900/30 flex items-center justify-center">
            <CheckCircle className="w-5 h-5" />
          </div>
        </GlassCard>

        <GlassCard className="p-4 border border-slate-900 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold block">Submitted Bids</span>
            <span className="text-xl sm:text-2xl font-extrabold text-blue-400 mt-1 block">{stats.openBids}</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-950/20 text-blue-400 border border-blue-900/30 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
        </GlassCard>
      </div>

      {/* Tabs Menu Panel */}
      <div className="flex space-x-2 border-b border-slate-900 pb-3 mb-8 overflow-x-auto">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'posted', label: 'My Posted Jobs' },
          { id: 'applied', label: 'My Applications' },
          { id: 'contracts', label: 'Escrow Contracts' },
          { id: 'payments', label: 'Financial Ledger' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
              activeTab === tab.id 
                ? 'bg-slate-900 border border-slate-800 text-white'
                : 'bg-transparent text-slate-500 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT PANELS */}
      
      {/* 1. OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Post Project Console Form */}
          <div className="lg:col-span-1">
            <GlassCard className="border border-slate-900">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center space-x-2">
                <PlusCircle className="text-cyan-400 w-5 h-5" />
                <span>Post a New Project</span>
              </h3>

              {postMessage.text && (
                <div className={`mb-4 p-4 rounded-lg text-xs border flex items-start space-x-2 ${
                  postMessage.type === 'success' 
                    ? 'bg-emerald-950/40 border-emerald-800/40 text-emerald-300'
                    : 'bg-rose-950/40 border-rose-800/40 text-rose-350'
                }`}>
                  {postMessage.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                  <span>{postMessage.text}</span>
                </div>
              )}

              <form onSubmit={handlePostProjectSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Project Title</label>
                  <input
                    type="text"
                    required
                    value={postForm.title}
                    onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900/60 border border-slate-850 focus:outline-none focus:border-cyan-500 text-slate-200 text-xs rounded-lg"
                    placeholder="e.g. Build React Dashboard"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Category</label>
                  <select
                    value={postForm.category}
                    onChange={(e) => setPostForm({ ...postForm, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-850 focus:outline-none focus:border-cyan-500 text-slate-200 text-xs rounded-lg cursor-pointer"
                  >
                    <option value="Development">Development</option>
                    <option value="Design">Creative Design</option>
                    <option value="Database">Database Management</option>
                    <option value="Writing">Content Writing</option>
                    <option value="Marketing">Growth Marketing</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Budget ($)</label>
                    <input
                      type="number"
                      required
                      min={10}
                      value={postForm.budget}
                      onChange={(e) => setPostForm({ ...postForm, budget: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900/60 border border-slate-850 focus:outline-none focus:border-cyan-500 text-slate-200 text-xs rounded-lg"
                      placeholder="e.g. 500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Deadline</label>
                    <input
                      type="date"
                      required
                      value={postForm.deadline}
                      onChange={(e) => setPostForm({ ...postForm, deadline: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900/60 border border-slate-850 focus:outline-none focus:border-cyan-500 text-slate-200 text-xs rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Required Skills (Comma Separated)</label>
                  <input
                    type="text"
                    value={postForm.requiredSkills}
                    onChange={(e) => setPostForm({ ...postForm, requiredSkills: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900/60 border border-slate-850 focus:outline-none focus:border-cyan-500 text-slate-200 text-xs rounded-lg"
                    placeholder="React, CSS, MySQL"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Description</label>
                  <textarea
                    required
                    rows={4}
                    value={postForm.description}
                    onChange={(e) => setPostForm({ ...postForm, description: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900/60 border border-slate-850 focus:outline-none focus:border-cyan-500 text-slate-200 text-xs rounded-lg placeholder-slate-600"
                    placeholder="Describe tasks, objectives, and deliverables..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={postLoading}
                  className="w-full py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 hover:brightness-110 text-slate-950 font-bold text-xs transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow-lg shadow-cyan-500/10"
                >
                  {postLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Publish Job Posting</span>}
                </button>
              </form>
            </GlassCard>
          </div>

          {/* Quick Active Contracts List */}
          <div className="lg:col-span-2 space-y-6">
            <GlassCard className="border border-slate-900">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center space-x-2">
                <Clock className="text-cyan-400 w-5 h-5" />
                <span>Recent Active Escrow Contracts</span>
              </h3>

              {contracts.filter(c => c.contractStatus !== 'Completed').length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs border border-dashed border-slate-900 rounded-lg">
                  No active projects at the moment. Browse the marketplace or post jobs to start contract escrows.
                </div>
              ) : (
                <div className="space-y-4">
                  {contracts
                    .filter(c => c.contractStatus !== 'Completed')
                    .slice(0, 3)
                    .map(c => {
                      const isClient = c.clientId === user.id;
                      return (
                        <div key={c.id} className="p-4 rounded-xl border border-slate-900 bg-slate-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Project Name</span>
                            <h4 className="text-sm font-bold text-white mt-0.5">{c.projectTitle}</h4>
                            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-450 mt-1.5">
                              <span>Role: <strong className="text-cyan-400">{isClient ? 'Client' : 'Freelancer'}</strong></span>
                              <span>•</span>
                              <span>Partner: <strong>{isClient ? c.freelancerName : c.clientName}</strong></span>
                              <span>•</span>
                              <span>Locked Sum: <strong className="text-emerald-400">${parseFloat(c.agreedAmount)}</strong></span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 self-end sm:self-center">
                            <button
                              onClick={() => {
                                setActiveTab('contracts');
                              }}
                              className="px-4 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-cyan-400 text-xs font-bold rounded-lg cursor-pointer transition-colors"
                            >
                              Manage Escrow
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </GlassCard>

            {/* Quick Actions Guide */}
            <GlassCard className="border border-slate-900 bg-slate-950/10 p-6 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center md:text-left">
                <h4 className="text-sm font-bold text-white flex items-center justify-center md:justify-start gap-1">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>Looking for Freelance Opportunities?</span>
                </h4>
                <p className="text-xs text-slate-450">Submit custom proposals to client listings on the public board.</p>
              </div>
              <Link to="/marketplace" className="px-5 py-2.5 rounded-lg bg-slate-900 border border-slate-800 text-cyan-400 font-bold text-xs hover:text-white hover:bg-slate-850 cursor-pointer transition-all">
                Browse Marketplace
              </Link>
            </GlassCard>
          </div>
        </div>
      )}

      {/* 2. MY POSTED PROJECTS TAB */}
      {activeTab === 'posted' && (
        <GlassCard className="border border-slate-900 p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-900 bg-slate-950/20">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-450">
              Published Project Postings
            </h3>
          </div>

          {postedProjects.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-sm">
              You haven't posted any projects yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/40 border-b border-slate-900 text-xs text-slate-500 font-bold uppercase tracking-wider">
                    <th className="px-6 py-4">Title</th>
                    <th className="px-6 py-4">Budget</th>
                    <th className="px-6 py-4">Required Skills</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Applications</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900 text-sm">
                  {postedProjects.map(proj => (
                    <tr key={proj.id} className="hover:bg-slate-900/20 transition-colors">
                      <td className="px-6 py-4 font-bold text-white max-w-xs truncate">
                        <Link to={`/project/${proj.id}`} className="hover:text-cyan-400 transition-colors">
                          {proj.title}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-emerald-450 font-bold">${parseFloat(proj.budget)}</td>
                      <td className="px-6 py-4 text-xs text-slate-400 truncate max-w-[150px]">
                        {proj.requiredSkills || 'Any'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase border ${
                          proj.status === 'Open'
                            ? 'bg-emerald-950/30 border-emerald-900 text-emerald-450'
                            : proj.status === 'In Progress'
                            ? 'bg-amber-950/30 border-amber-900 text-amber-450'
                            : 'bg-blue-950/30 border-blue-900 text-blue-450'
                        }`}>
                          {proj.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {proj.status === 'Open' ? (
                          <button
                            onClick={() => handleViewApplicants(proj)}
                            className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center space-x-1 text-xs cursor-pointer focus:outline-none"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Bids ({proj.applicantCount})</span>
                          </button>
                        ) : (
                          <span className="text-xs text-slate-500">N/A (Accepted)</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {proj.status === 'Open' && (
                          <button
                            onClick={() => handleDeleteProject(proj.id)}
                            className="p-1.5 bg-slate-950 hover:bg-rose-950/20 text-rose-450 border border-rose-950/40 rounded-lg cursor-pointer transition-all"
                            title="Delete project"
                          >
                            <AlertCircle className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </GlassCard>
      )}

      {/* 3. MY APPLICATIONS TAB */}
      {activeTab === 'applied' && (
        <GlassCard className="border border-slate-900 p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-900 bg-slate-950/20">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-450">
              Submitted Job Applications & Proposals
            </h3>
          </div>

          {bids.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-sm">
              You haven't bid on any projects yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/40 border-b border-slate-900 text-xs text-slate-500 font-bold uppercase tracking-wider">
                    <th className="px-6 py-4">Project</th>
                    <th className="px-6 py-4">Client</th>
                    <th className="px-6 py-4">My Bid Amount</th>
                    <th className="px-6 py-4">Delivery Time</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900 text-sm">
                  {bids.map(bid => (
                    <tr key={bid.id} className="hover:bg-slate-900/20 transition-colors">
                      <td className="px-6 py-4 font-bold text-white">
                        <Link to={`/project/${bid.projectId}`} className="hover:text-cyan-400 transition-colors">
                          {bid.projectTitle}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-slate-350">{bid.clientName}</td>
                      <td className="px-6 py-4 text-emerald-450 font-bold">${parseFloat(bid.bidAmount)}</td>
                      <td className="px-6 py-4 text-slate-400">{bid.deliveryTime} Days</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                          bid.status === 'Accepted'
                            ? 'bg-emerald-950 border border-emerald-800 text-emerald-400'
                            : bid.status === 'Rejected'
                            ? 'bg-rose-950 border border-rose-800 text-rose-400'
                            : 'bg-slate-900 border border-slate-800 text-slate-400'
                        }`}>
                          {bid.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </GlassCard>
      )}

      {/* 4. ACTIVE CONTRACTS TAB (Detailed Escrow workflows) */}
      {activeTab === 'contracts' && (
        <div className="space-y-6">
          {contracts.length === 0 ? (
            <GlassCard className="border border-slate-900 p-8 text-center text-slate-550 text-sm">
              You do not have any active or completed contract items.
            </GlassCard>
          ) : (
            contracts.map(c => {
              const isClient = c.clientId === user.id;
              const details = contractDetails[c.id] || {};
              const filesList = details.files || [];

              return (
                <GlassCard key={c.id} className="border border-slate-900">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-900 pb-4 mb-4">
                    <div>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-950 border border-slate-800 text-slate-500 uppercase font-bold">
                        Contract #{c.id}
                      </span>
                      <h3 className="text-lg font-bold text-white mt-2">{c.projectTitle}</h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Client: <strong className="text-slate-350">{c.clientName}</strong> | Freelancer: <strong className="text-slate-350">{c.freelancerName}</strong>
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs">
                      <div>
                        <span className="text-slate-500 block uppercase font-bold text-[9px]">Agreed Funds</span>
                        <span className="text-base font-extrabold text-emerald-400 mt-0.5 block">${parseFloat(c.agreedAmount)}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block uppercase font-bold text-[9px]">Delivery Date</span>
                        <span className="text-xs text-slate-300 font-bold mt-1 block">{new Date(c.deliveryDate).toLocaleDateString()}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block uppercase font-bold text-[9px]">Contract Status</span>
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase border mt-1 ${
                          c.contractStatus === 'Completed'
                            ? 'bg-emerald-950 border border-emerald-800 text-emerald-400'
                            : c.contractStatus === 'Submitted'
                            ? 'bg-amber-950 border border-amber-800 text-amber-400'
                            : 'bg-slate-900 border border-slate-850 text-slate-400'
                        }`}>
                          {c.contractStatus}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Escrow State Alert Info */}
                  <div className="p-3 bg-slate-950/40 rounded-lg border border-slate-900 text-xs text-slate-400 flex items-center space-x-2 mb-6">
                    <DollarSign className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>
                      {c.contractStatus === 'Completed' ? (
                        <strong className="text-emerald-400">Escrow released. Payments complete.</strong>
                      ) : (
                        <span>Escrow status: <strong className="text-cyan-400">Locked</strong>. Payments will release upon client verification.</span>
                      )}
                    </span>
                  </div>

                  {/* Submission and file upload panel */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left col: Deliverable list */}
                    <div>
                      <h4 className="text-xs font-bold uppercase text-slate-400 mb-3 tracking-wider">
                        Submitted Work Deliverables ({filesList.length})
                      </h4>

                      {filesList.length === 0 ? (
                        <p className="text-xs text-slate-550 italic bg-slate-950/20 p-4 rounded-lg border border-slate-900/50">
                          No work assets delivered yet.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {filesList.map(file => (
                            <div key={file.id} className="p-3 rounded-lg border border-slate-900 bg-slate-950/40 flex items-center justify-between gap-4">
                              <div className="min-w-0">
                                <span className="text-xs font-semibold text-slate-300 block truncate" title={file.fileName}>
                                  {file.fileName}
                                </span>
                                <span className="text-[9px] text-slate-500 block mt-0.5">
                                  Uploaded by {file.uploadedByName} on {new Date(file.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <button
                                onClick={() => handleDownloadFile(file.id, file.fileName)}
                                className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-cyan-400 rounded-lg cursor-pointer transition-colors"
                                title="Secure Download"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Right col: Escrow state toggles */}
                    <div className="flex flex-col justify-center p-6 bg-slate-900/10 border border-slate-900 rounded-xl">
                      {!isClient ? (
                        /* Freelancer Submission Actions */
                        c.contractStatus !== 'Completed' ? (
                          <div className="space-y-4 text-center md:text-left">
                            <div className="space-y-1">
                              <h5 className="text-xs font-bold text-white flex items-center justify-center md:justify-start gap-1">
                                <Upload className="w-3.5 h-3.5 text-cyan-400" />
                                <span>Deliver Work Assets</span>
                              </h5>
                              <p className="text-[10px] text-slate-500">Upload code files, layouts, or assets directly. This flags the contract as submitted.</p>
                            </div>
                            <label className="inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:brightness-110 text-slate-950 font-bold text-xs rounded-lg cursor-pointer transition-all">
                              {uploadLoadingId === c.id ? (
                                <>
                                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                                  <span>Uploading...</span>
                                </>
                              ) : (
                                <span>Choose file to upload</span>
                              )}
                              <input
                                type="file"
                                onChange={(e) => handleUploadWork(e, c.id)}
                                className="hidden"
                                disabled={uploadLoadingId !== null}
                              />
                            </label>
                          </div>
                        ) : (
                          <div className="text-center md:text-left text-xs text-emerald-450 font-bold flex items-center gap-1">
                            <CheckCircle className="w-4 h-4" />
                            <span>This contract was successfully completed and funds are delivered.</span>
                          </div>
                        )
                      ) : (
                        /* Client Release Escrow Actions */
                        c.contractStatus !== 'Completed' ? (
                          <div className="space-y-4">
                            <div className="space-y-1">
                              <h5 className="text-xs font-bold text-white">Escrow Payment Controller</h5>
                              <p className="text-[10px] text-slate-500">Ensure the submitted deliverables are acceptable. Releasing funds completes the contract and pays the freelancer.</p>
                            </div>
                            <button
                              onClick={() => handleReleaseEscrow(c.id)}
                              className="w-full py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:brightness-110 text-slate-950 font-bold text-xs rounded-lg flex items-center justify-center space-x-1.5 cursor-pointer shadow-lg transition-all"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Release Funds / Complete Contract</span>
                            </button>
                          </div>
                        ) : (
                          <div className="text-center md:text-left text-xs text-emerald-450 font-bold flex items-center gap-1">
                            <CheckCircle className="w-4 h-4" />
                            <span>This contract was successfully completed and funds are delivered.</span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </GlassCard>
              );
            })
          )}
        </div>
      )}

      {/* 5. PAYMENTS LEDGER TAB */}
      {activeTab === 'payments' && (
        <GlassCard className="border border-slate-900 p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-900 bg-slate-950/20">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-450">
              Escrow Ledgers and Balances Auditing
            </h3>
          </div>

          {ledger.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-sm">
              No transaction history found on this account.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/40 border-b border-slate-900 text-xs text-slate-500 font-bold uppercase tracking-wider">
                    <th className="px-6 py-4">Transaction Date</th>
                    <th className="px-6 py-4">Project Item</th>
                    <th className="px-6 py-4">Transaction Flow</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900 text-sm">
                  {ledger.map(tx => {
                    const isOutflow = tx.clientId === user.id;
                    return (
                      <tr key={tx.id} className="hover:bg-slate-900/20 transition-colors">
                        <td className="px-6 py-4 text-xs text-slate-500">
                          {new Date(tx.createdAt).toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className="block font-bold text-white">{tx.projectTitle}</span>
                          <span className="text-[10px] text-slate-500">Contract ID: {tx.contractId}</span>
                        </td>
                        <td className="px-6 py-4">
                          {isOutflow ? (
                            <span className="text-xs text-slate-400">
                              Payment Out (Client to <strong>{tx.freelancerName}</strong>)
                            </span>
                          ) : (
                            <span className="text-xs text-emerald-450">
                              Payment In (Freelancer from <strong>{tx.clientName}</strong>)
                            </span>
                          )}
                        </td>
                        <td className={`px-6 py-4 font-bold ${isOutflow ? 'text-white' : 'text-emerald-450'}`}>
                          {isOutflow ? '-' : '+'}${parseFloat(tx.amount)}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                            tx.paymentStatus === 'Released'
                              ? 'bg-emerald-950/30 border-emerald-900 text-emerald-450'
                              : 'bg-slate-900 border-slate-800 text-slate-400'
                          }`}>
                            {tx.paymentStatus}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </GlassCard>
      )}

      {/* APPLICANT BIDS DIALOG MODAL (Overlays dashboard screen) */}
      {focusedProject && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <GlassCard className="max-w-2xl w-full border border-slate-800 bg-slate-950 shadow-2xl p-6 relative animate-fadeIn max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setFocusedProject(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-2 truncate pr-6">
              Applicants for "{focusedProject.title}"
            </h3>
            <p className="text-xs text-slate-400 mb-6">Review candidate statements and award contracts.</p>

            {loadingBids ? (
              <div className="flex justify-center py-10">
                <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
              </div>
            ) : projectBids.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-xs">
                No active applications on this job post yet.
              </div>
            ) : (
              <div className="space-y-4">
                {projectBids.map(bid => (
                  <div key={bid.id} className="p-4 rounded-xl border border-slate-900 bg-slate-900/20 space-y-3">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex items-center space-x-2.5">
                        <img 
                          src={bid.freelancerImage ? (bid.freelancerImage.startsWith('http') ? bid.freelancerImage : `${API_BASE}${bid.freelancerImage}`) : '/uploads/default-avatar.png'}
                          alt={bid.freelancerName}
                          className="w-8 h-8 rounded-full object-cover border border-slate-800"
                        />
                        <div>
                          <h4 className="text-xs font-bold text-white">{bid.freelancerName}</h4>
                          <span className="text-[10px] text-slate-500 truncate block max-w-xs">{bid.freelancerSkills}</span>
                        </div>
                      </div>
                      
                      <div className="text-right text-xs">
                        <div className="font-bold text-emerald-450">${parseFloat(bid.bidAmount)}</div>
                        <div className="text-[10px] text-slate-500">{bid.deliveryTime} Days delivery</div>
                      </div>
                    </div>

                    <div className="text-xs text-slate-350 leading-relaxed bg-slate-950 p-3 rounded-lg border border-slate-900/50">
                      {bid.proposal}
                    </div>

                    <div className="flex justify-end space-x-2 pt-2 border-t border-slate-900/30">
                      <button
                        onClick={() => navigate(`/messages?chatWith=${bid.freelancerId}&proj=${focusedProject.id}`)}
                        className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 text-cyan-400 font-bold text-[10px] flex items-center space-x-1 cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Chat</span>
                      </button>
                      <button
                        onClick={() => handleHireApplicant(bid.id)}
                        className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 font-bold text-[10px] flex items-center space-x-1 cursor-pointer"
                      >
                        <CheckCircle className="w-3.5 h-3.5 text-slate-950" />
                        <span>Hire Freelancer</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
