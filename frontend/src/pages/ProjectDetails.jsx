import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { 
  Calendar, 
  DollarSign, 
  Tag, 
  User, 
  Clock, 
  FileText, 
  Check, 
  X, 
  ShieldAlert, 
  MessageSquare, 
  AlertCircle 
} from 'lucide-react';
import GlassCard from '../components/GlassCard';

const ProjectDetails = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [bids, setBids] = useState([]);
  const [hasApplied, setHasApplied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Freelancer Bidding Form State
  const [proposal, setProposal] = useState('');
  const [bidAmount, setBidAmount] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [bidSubmitLoading, setBidSubmitLoading] = useState(false);
  const [bidSubmitError, setBidSubmitError] = useState('');
  const [bidSubmitSuccess, setBidSubmitSuccess] = useState('');

  // Client Selection State
  const [hireLoadingId, setHireLoadingId] = useState(null);

  useEffect(() => {
    fetchProjectDetails();
  }, [id]);

  const fetchProjectDetails = async () => {
    setLoading(true);
    setError('');
    try {
      // 1. Get project details
      const projectRes = await API.get(`/projects/${id}`);
      const projectData = projectRes.data.project;
      setProject(projectData);

      if (isAuthenticated) {
        // 2. Check if current user is the client
        const isClient = projectData.clientId === user.id;

        if (isClient) {
          // Fetch bids for this project
          const bidsRes = await API.get(`/bids/project/${id}`);
          setBids(bidsRes.data.bids);
        } else {
          // Check if freelancer already applied
          const myBidsRes = await API.get('/bids/my-bids');
          const applied = myBidsRes.data.bids.some(b => b.projectId === parseInt(id));
          setHasApplied(applied);
          setBidAmount(projectData.budget);
        }
      }
    } catch (err) {
      console.error(err);
      setError('Could not retrieve project information.');
    } finally {
      setLoading(false);
    }
  };

  const handleBidSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setBidSubmitLoading(true);
    setBidSubmitError('');
    setBidSubmitSuccess('');

    try {
      await API.post('/bids', {
        projectId: id,
        proposal,
        bidAmount: parseFloat(bidAmount),
        deliveryTime: parseInt(deliveryTime)
      });
      setBidSubmitSuccess('Your proposal has been successfully submitted!');
      setHasApplied(true);
      // Refresh
      fetchProjectDetails();
    } catch (err) {
      setBidSubmitError(err.response?.data?.message || 'Failed to submit proposal.');
    } finally {
      setBidSubmitLoading(false);
    }
  };

  const handleAcceptBid = async (bidId) => {
    if (!window.confirm('Are you sure you want to hire this freelancer? This will create a binding contract and freeze funds in escrow.')) {
      return;
    }

    setHireLoadingId(bidId);
    try {
      const res = await API.put(`/bids/${bidId}/status`, { status: 'Accepted' });
      alert(res.data.message);
      navigate(`/dashboard`); // Go to dashboard to track active contracts
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to hire freelancer.');
    } finally {
      setHireLoadingId(null);
    }
  };

  const handleRejectBid = async (bidId) => {
    if (!window.confirm('Are you sure you want to reject this bid?')) {
      return;
    }

    try {
      await API.put(`/bids/${bidId}/status`, { status: 'Rejected' });
      // Refresh list
      const bidsRes = await API.get(`/bids/project/${id}`);
      setBids(bidsRes.data.bids);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject bid.');
    }
  };

  const handleMessageFreelancer = (freelancerId) => {
    navigate(`/messages?chatWith=${freelancerId}&proj=${id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-darkBg flex items-center justify-center text-slate-400">
        <div className="w-10 h-10 border-4 border-t-cyanAccent border-r-transparent border-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-rose-450 font-bold">
        {error || 'Project not found.'}
      </div>
    );
  }

  const isClient = isAuthenticated && project.clientId === user.id;
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Project Details Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center space-x-2">
            <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-cyan-950/50 border border-cyan-850 text-cyan-400">
              {project.category}
            </span>
            <span className={`px-3 py-0.5 rounded-full text-xs font-bold border ${
              project.status === 'Open' 
                ? 'bg-emerald-950/30 border-emerald-800 text-emerald-400'
                : project.status === 'In Progress'
                ? 'bg-amber-950/30 border-amber-800 text-amber-400'
                : 'bg-blue-950/30 border-blue-800 text-blue-400'
            }`}>
              {project.status}
            </span>
          </div>

          <h1 className="text-3xl font-extrabold text-white leading-tight">
            {project.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-sm text-slate-450 border-y border-slate-900 py-4">
            <div className="flex items-center space-x-1.5 text-emerald-400 font-bold">
              <DollarSign className="w-5 h-5" />
              <span>Est. Budget: ${parseFloat(project.budget).toLocaleString()}</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Calendar className="w-4.5 h-4.5 text-slate-500" />
              <span>Deadline: {new Date(project.deadline).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Clock className="w-4.5 h-4.5 text-slate-500" />
              <span>Posted: {new Date(project.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white mb-3">Project Description</h3>
            <p className="text-slate-300 leading-relaxed whitespace-pre-line text-sm sm:text-base">
              {project.description}
            </p>
          </div>

          {project.requiredSkills && (
            <div>
              <h4 className="text-sm font-bold text-slate-400 mb-2">Required Skills</h4>
              <div className="flex flex-wrap gap-2">
                {project.requiredSkills.split(',').map((skill, index) => (
                  <span key={index} className="text-xs bg-slate-900 border border-slate-850 px-3 py-1 rounded-full text-slate-300 font-medium">
                    {skill.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Freelancer bidding form OR Client bids listing */}
          <div className="pt-8 border-t border-slate-900">
            {!isAuthenticated ? (
              <div className="p-6 bg-slate-900/30 border border-slate-850 rounded-xl text-center">
                <ShieldAlert className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
                <p className="text-slate-300 font-medium mb-3">Want to apply to this project?</p>
                <Link to="/login" className="inline-block px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 font-bold rounded-lg text-sm">
                  Sign In to Place a Bid
                </Link>
              </div>
            ) : isClient ? (
              /* Client applicants review board */
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                  <User className="text-cyan-400 w-5 h-5" />
                  <span>Applicant Proposals ({bids.length})</span>
                </h2>

                {bids.length === 0 ? (
                  <div className="p-8 bg-slate-900/20 border border-slate-900 text-slate-500 text-center rounded-xl">
                    No proposals submitted yet.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bids.map((bid) => (
                      <GlassCard key={bid.id} className="border border-slate-900 relative">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 pb-4 mb-4">
                          <div className="flex items-center space-x-3">
                            <img
                              src={bid.freelancerImage ? (bid.freelancerImage.startsWith('http') ? bid.freelancerImage : `${API_BASE}${bid.freelancerImage}`) : '/uploads/default-avatar.png'}
                              alt={bid.freelancerName}
                              className="w-10 h-10 rounded-full border border-slate-800 object-cover"
                            />
                            <div>
                              <h4 className="text-sm font-bold text-white">{bid.freelancerName}</h4>
                              <p className="text-xs text-slate-500 truncate max-w-xs">{bid.freelancerSkills}</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-6 text-sm">
                            <div className="text-right">
                              <span className="text-xs text-slate-500 uppercase tracking-wider block">Bid Amount</span>
                              <span className="text-base font-bold text-emerald-400">${parseFloat(bid.bidAmount)}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-xs text-slate-500 uppercase tracking-wider block">Delivery</span>
                              <span className="text-sm font-bold text-white">{bid.deliveryTime} Days</span>
                            </div>
                          </div>
                        </div>

                        <div className="mb-6">
                          <h5 className="text-xs font-bold text-slate-450 uppercase tracking-wider mb-2 flex items-center gap-1">
                            <FileText className="w-3.5 h-3.5" />
                            <span>Proposal Message</span>
                          </h5>
                          <p className="text-sm text-slate-350 leading-relaxed whitespace-pre-line bg-slate-950/50 p-4 rounded-lg border border-slate-900">
                            {bid.proposal}
                          </p>
                        </div>

                        {bid.status === 'Pending' ? (
                          <div className="flex items-center justify-end space-x-3">
                            <button
                              onClick={() => handleMessageFreelancer(bid.freelancerId)}
                              className="px-4 py-2 rounded-lg bg-slate-900 border border-slate-850 hover:bg-slate-800 text-cyan-400 font-bold text-xs flex items-center space-x-1.5 cursor-pointer"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>Message</span>
                            </button>
                            <button
                              onClick={() => handleRejectBid(bid.id)}
                              className="px-4 py-2 rounded-lg bg-slate-950 hover:bg-rose-950/20 border border-rose-950 text-rose-450 font-bold text-xs flex items-center space-x-1.5 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Decline</span>
                            </button>
                            <button
                              disabled={hireLoadingId !== null}
                              onClick={() => handleAcceptBid(bid.id)}
                              className="px-5 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 font-bold text-xs flex items-center space-x-1.5 cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>{hireLoadingId === bid.id ? 'Hiring...' : 'Hire Freelancer'}</span>
                            </button>
                          </div>
                        ) : (
                          <div className="text-right">
                            <span className={`inline-block px-3 py-1 rounded text-xs font-bold ${
                              bid.status === 'Accepted'
                                ? 'bg-emerald-950 border border-emerald-800 text-emerald-400'
                                : 'bg-rose-950 border border-rose-800 text-rose-450'
                            }`}>
                              {bid.status}
                            </span>
                          </div>
                        )}
                      </GlassCard>
                    ))}
                  </div>
                )}
              </div>
            ) : hasApplied ? (
              /* Already Bid Message */
              <div className="p-6 bg-slate-900/30 border border-emerald-900/20 text-center rounded-xl">
                <Check className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
                <p className="text-slate-200 font-bold mb-1">Proposal Submitted</p>
                <p className="text-xs text-slate-500">
                  You have submitted a bid for this project. Keep an eye on your dashboard or active chat window for updates.
                </p>
              </div>
            ) : project.status !== 'Open' ? (
              /* Closed Project Warning */
              <div className="p-6 bg-slate-900/30 border border-slate-850 text-center rounded-xl text-slate-500">
                This project is already in progress and not accepting new proposals.
              </div>
            ) : (
              /* Freelancer Proposal Input Console */
              <div>
                <h2 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
                  <FileText className="text-cyan-400 w-5 h-5" />
                  <span>Submit Proposal</span>
                </h2>

                {bidSubmitError && (
                  <div className="mb-4 p-4 rounded-lg bg-rose-950/40 border border-rose-800/40 text-rose-300 text-sm flex items-start space-x-2">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span>{bidSubmitError}</span>
                  </div>
                )}

                {bidSubmitSuccess && (
                  <div className="mb-4 p-4 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 text-sm flex items-start space-x-2">
                    <Check className="w-5 h-5 shrink-0" />
                    <span>{bidSubmitSuccess}</span>
                  </div>
                )}

                <form onSubmit={handleBidSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-450 mb-2">
                      Describe your proposal and relevant experience
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={proposal}
                      onChange={(e) => setProposal(e.target.value)}
                      placeholder="Introduce yourself, explain how you would tackle the project, and mention your relevant experience..."
                      className="w-full bg-slate-900/60 border border-slate-800 focus:outline-none focus:border-cyan-500 text-slate-200 text-sm rounded-lg p-3 placeholder-slate-650"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-450 mb-2">
                        Bid Amount ($)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          required
                          min={1}
                          value={bidAmount}
                          onChange={(e) => setBidAmount(e.target.value)}
                          className="w-full pl-8 pr-4 py-2.5 bg-slate-900/60 border border-slate-800 focus:outline-none focus:border-cyan-500 text-slate-200 text-sm rounded-lg"
                        />
                        <DollarSign className="w-4 h-4 text-slate-600 absolute left-2.5 top-3" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-450 mb-2">
                        Estimated Delivery (Days)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          required
                          min={1}
                          value={deliveryTime}
                          onChange={(e) => setDeliveryTime(e.target.value)}
                          className="w-full pl-8 pr-4 py-2.5 bg-slate-900/60 border border-slate-800 focus:outline-none focus:border-cyan-500 text-slate-200 text-sm rounded-lg"
                          placeholder="e.g. 10"
                        />
                        <Clock className="w-4 h-4 text-slate-600 absolute left-2.5 top-3" />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={bidSubmitLoading}
                    className="w-full py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 font-bold text-sm transition-all hover:brightness-110 flex items-center justify-center space-x-2 cursor-pointer shadow-lg shadow-cyan-500/10"
                  >
                    <span>Submit Proposal</span>
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Client Bio Sidebar */}
        <div className="space-y-6">
          <GlassCard className="border border-slate-900">
            <h3 className="text-base font-bold text-white mb-4 uppercase tracking-wider text-slate-400">
              Client Information
            </h3>
            
            <div className="flex items-center space-x-3 mb-4">
              <img
                src={project.clientImage ? (project.clientImage.startsWith('http') ? project.clientImage : `${API_BASE}${project.clientImage}`) : '/uploads/default-avatar.png'}
                alt={project.clientName}
                className="w-12 h-12 rounded-full border border-slate-800 object-cover"
              />
              <div>
                <h4 className="text-sm font-bold text-white">{project.clientName}</h4>
                <p className="text-xs text-slate-500">{project.clientEmail}</p>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              {project.clientBio || "No details provided by this client."}
            </p>

            {isAuthenticated && project.clientId !== user.id && (
              <button
                onClick={() => handleMessageFreelancer(project.clientId)}
                className="w-full py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-cyan-400 font-bold text-xs rounded-lg flex items-center justify-center space-x-1.5 cursor-pointer transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Message Client</span>
              </button>
            )}
          </GlassCard>

          <GlassCard className="border border-slate-900">
            <h3 className="text-sm font-bold text-white mb-3 uppercase tracking-wider text-slate-400">
              Platform Guarantee
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Funds are backed by escrow verification. Once a project bid is accepted, the budget is locked until deliverables are submitted and reviewed.
            </p>
            <div className="text-[10px] text-cyan-400 font-bold flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
              <span>Secure Transactions Ensured</span>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;
