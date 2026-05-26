import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import { 
  Users, 
  Briefcase, 
  FileText, 
  Trash2, 
  ShieldAlert, 
  Lock, 
  UserMinus, 
  CheckCircle 
} from 'lucide-react';
import GlassCard from '../components/GlassCard';

const AdminPanel = () => {
  const { user } = useContext(AuthContext);

  const [activeTab, setActiveTab] = useState('users');
  const [usersList, setUsersList] = useState([]);
  const [projectsList, setProjectsList] = useState([]);
  const [contractsList, setContractsList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, [activeTab]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'users') {
        const res = await API.get('/admin/users');
        setUsersList(res.data.users);
      } else if (activeTab === 'projects') {
        const res = await API.get('/admin/projects');
        setProjectsList(res.data.projects);
      } else if (activeTab === 'contracts') {
        const res = await API.get('/admin/contracts');
        setContractsList(res.data.contracts);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to retrieve administrative data records.');
    } finally {
      setLoading(false);
    }
  };

  const handleBanUser = async (targetId) => {
    if (!window.confirm('Are you absolutely sure you want to ban and permanently delete this user account? All their active projects and contracts will be purged from the database.')) {
      return;
    }

    try {
      const res = await API.delete(`/admin/users/${targetId}`);
      alert(res.data.message);
      // Refresh list
      fetchAdminData();
    } catch (err) {
      alert(err.response?.data?.message || 'Banning user failed.');
    }
  };

  const handleRemoveProject = async (projId) => {
    if (!window.confirm('Are you sure you want to delete this project as spam? This action is irreversible.')) {
      return;
    }

    try {
      const res = await API.delete(`/admin/projects/${projId}`);
      alert(res.data.message);
      // Refresh list
      fetchAdminData();
    } catch (err) {
      alert(err.response?.data?.message || 'Deleting project failed.');
    }
  };

  if (!user || user.isAdmin !== 1) {
    return (
      <div className="min-h-screen bg-darkBg flex items-center justify-center text-rose-400 font-bold p-4">
        Access Denied. Admin Privileges Required.
      </div>
    );
  }

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-8">
        <ShieldAlert className="text-rose-450 w-8 h-8" />
        <div>
          <h1 className="text-3xl font-extrabold text-white">Platform Administration</h1>
          <p className="text-slate-400 mt-1">Spam moderation console and live escrow audits.</p>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="flex space-x-4 border-b border-slate-900 pb-4 mb-8">
        {[
          { id: 'users', label: 'User Directory', icon: Users },
          { id: 'projects', label: 'Moderation Projects', icon: Briefcase },
          { id: 'contracts', label: 'Escrow Transactions', icon: FileText },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-slate-900 border border-slate-800 text-white'
                : 'bg-slate-950 text-slate-450 hover:text-white hover:bg-slate-900/30'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Main Table Display */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-t-cyanAccent border-r-transparent border-slate-800 rounded-full animate-spin"></div>
        </div>
      ) : (
        <GlassCard className="border border-slate-900 p-0 overflow-hidden">
          {activeTab === 'users' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-900 text-xs text-slate-500 font-bold uppercase tracking-wider">
                    <th className="px-6 py-4">User Details</th>
                    <th className="px-6 py-4">Skills</th>
                    <th className="px-6 py-4">Admin Status</th>
                    <th className="px-6 py-4">Registered Date</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900 text-sm">
                  {usersList.map((usr) => (
                    <tr key={usr.id} className="hover:bg-slate-900/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={usr.profileImage ? (usr.profileImage.startsWith('http') ? usr.profileImage : `${API_BASE}${usr.profileImage}`) : '/uploads/default-avatar.png'}
                            alt={usr.fullName}
                            className="w-9 h-9 rounded-full object-cover border border-slate-850"
                          />
                          <div>
                            <span className="block font-bold text-white">{usr.fullName}</span>
                            <span className="text-xs text-slate-500">{usr.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-400 max-w-xs truncate">
                        {usr.skills || 'None declared'}
                      </td>
                      <td className="px-6 py-4">
                        {usr.isAdmin === 1 ? (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-rose-950/40 text-rose-400 border border-rose-900 font-bold">
                            Administrator
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-slate-900 text-slate-500 border border-slate-800">
                            General User
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">
                        {new Date(usr.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {usr.isAdmin !== 1 && (
                          <button
                            onClick={() => handleBanUser(usr.id)}
                            className="p-2 bg-slate-950 hover:bg-rose-950/20 text-rose-450 border border-rose-950/40 rounded-lg cursor-pointer transition-colors"
                            title="Ban User"
                          >
                            <UserMinus className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-900 text-xs text-slate-500 font-bold uppercase tracking-wider">
                    <th className="px-6 py-4">Project Title</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Client</th>
                    <th className="px-6 py-4">Budget</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900 text-sm">
                  {projectsList.map((proj) => (
                    <tr key={proj.id} className="hover:bg-slate-900/20 transition-colors">
                      <td className="px-6 py-4 font-bold text-white">
                        <Link to={`/project/${proj.id}`} className="hover:text-cyan-400 transition-colors">
                          {proj.title}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-400">{proj.category}</td>
                      <td className="px-6 py-4 text-slate-350">{proj.clientName}</td>
                      <td className="px-6 py-4 text-emerald-400 font-semibold">${parseFloat(proj.budget)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                          proj.status === 'Open'
                            ? 'bg-emerald-950/30 border-emerald-900 text-emerald-450'
                            : proj.status === 'In Progress'
                            ? 'bg-amber-950/30 border-amber-905 text-amber-450'
                            : 'bg-blue-950/30 border-blue-900 text-blue-450'
                        }`}>
                          {proj.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleRemoveProject(proj.id)}
                          className="p-2 bg-slate-950 hover:bg-rose-950/20 text-rose-450 border border-rose-950/40 rounded-lg cursor-pointer transition-colors"
                          title="Purge Spam"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'contracts' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-900 text-xs text-slate-500 font-bold uppercase tracking-wider">
                    <th className="px-6 py-4">Project Contract</th>
                    <th className="px-6 py-4">Client</th>
                    <th className="px-6 py-4">Freelancer</th>
                    <th className="px-6 py-4">Agreed Sum</th>
                    <th className="px-6 py-4">Escrow Status</th>
                    <th className="px-6 py-4">Delivery Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900 text-sm">
                  {contractsList.map((cnt) => (
                    <tr key={cnt.id} className="hover:bg-slate-900/20 transition-colors">
                      <td className="px-6 py-4">
                        <span className="block font-bold text-white">{cnt.projectTitle}</span>
                        <span className="text-[10px] text-slate-500">Contract ID: {cnt.id}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-350">{cnt.clientName}</td>
                      <td className="px-6 py-4 text-slate-350">{cnt.freelancerName}</td>
                      <td className="px-6 py-4 text-emerald-400 font-bold">${parseFloat(cnt.agreedAmount)}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                          cnt.paymentStatus === 'Released'
                            ? 'bg-emerald-950/30 border-emerald-900 text-emerald-450'
                            : 'bg-slate-900 border-slate-800 text-slate-400'
                        }`}>
                          {cnt.paymentStatus === 'Released' ? <CheckCircle className="w-3 h-3 text-emerald-400 mr-0.5" /> : <Lock className="w-2.5 h-2.5 mr-0.5" />}
                          <span>{cnt.paymentStatus === 'Released' ? 'Released' : 'Locked Escrow'}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase border ${
                          cnt.contractStatus === 'Completed'
                            ? 'bg-emerald-950/20 border-emerald-800 text-emerald-400'
                            : cnt.contractStatus === 'Submitted'
                            ? 'bg-amber-950/20 border-amber-800 text-amber-400'
                            : 'bg-slate-900 border-slate-800 text-slate-450'
                        }`}>
                          {cnt.contractStatus}
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
    </div>
  );
};

export default AdminPanel;
