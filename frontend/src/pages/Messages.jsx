import React, { useState, useEffect, useContext, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Send, MessageSquare, Loader2, Sparkles, User } from 'lucide-react';
import GlassCard from '../components/GlassCard';

const Messages = () => {
  const { user } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeChatUser, setActiveChatUser] = useState(null);
  const [newMessageText, setNewMessageText] = useState('');
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMsg, setSendingMsg] = useState(false);
  const messagesEndRef = useRef(null);

  // Read URL query params
  const chatWithParam = searchParams.get('chatWith');
  const projectParam = searchParams.get('proj');

  useEffect(() => {
    fetchChats(true);
  }, []);

  // Poll chats list and active thread every 3 seconds for live-feeling communications
  useEffect(() => {
    if (!activeChatUser) return;
    const interval = setInterval(() => {
      fetchMessageThread(activeChatUser.id, false);
    }, 3000);

    return () => clearInterval(interval);
  }, [activeChatUser]);

  const fetchChats = async (initial = false) => {
    if (initial) setLoadingChats(true);
    try {
      const res = await API.get('/messages/users');
      setChats(res.data.chats);

      // Handle direct redirect chat from Project Details page
      if (initial && chatWithParam) {
        const parsedId = parseInt(chatWithParam);
        const existingChat = res.data.chats.find(c => c.id === parsedId);

        if (existingChat) {
          handleSelectChat(existingChat);
        } else {
          // If they haven't chatted yet, fetch user details to render a blank conversation panel
          try {
            const userRes = await API.get('/auth/me'); // Just to fetch user details or similar. We can fetch user from a general profile route. Since there isn't a direct getUser endpoint, we can fallback to finding their details. Let's make a call to a mock endpoint or we can fetch all users as admin, or fetch details. Wait, we can fetch all users from database or select details.
            // Let's create a temp blank chat user state
            const tempUserRes = await API.get(`/projects/${projectParam}`);
            const proj = tempUserRes.data.project;
            
            const tempUser = {
              id: parsedId,
              fullName: proj.clientId === parsedId ? proj.clientName : 'Freelancer',
              profileImage: proj.clientId === parsedId ? proj.clientImage : '/uploads/default-avatar.png',
              skills: ''
            };
            setActiveChatUser(tempUser);
            fetchMessageThread(parsedId, true);
          } catch (e) {
            console.error('Failed to resolve redirect user:', e);
          }
        }
      } else if (initial && res.data.chats.length > 0) {
        // Autoload first active conversation
        handleSelectChat(res.data.chats[0]);
      }
    } catch (err) {
      console.error('Failed to fetch chats:', err);
    } finally {
      if (initial) setLoadingChats(false);
    }
  };

  const fetchMessageThread = async (otherUserId, showLoading = false) => {
    if (showLoading) setLoadingMessages(true);
    try {
      const res = await API.get(`/messages/thread/${otherUserId}`);
      setMessages(res.data.messages);
    } catch (err) {
      console.error('Failed to load message thread:', err);
    } finally {
      if (showLoading) setLoadingMessages(false);
    }
  };

  const handleSelectChat = (chatPartner) => {
    setActiveChatUser(chatPartner);
    setNewMessageText('');
    fetchMessageThread(chatPartner.id, true);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessageText.trim() || !activeChatUser) return;

    setSendingMsg(true);
    try {
      const res = await API.post('/messages', {
        receiverId: activeChatUser.id,
        projectId: projectParam || null,
        messageText: newMessageText.trim()
      });

      // Append locally and clean field
      setMessages(prev => [...prev, res.data.msg]);
      setNewMessageText('');
      
      // Update chats list to show latest message immediately
      fetchChats(false);
    } catch (err) {
      console.error(err);
      alert('Failed to send message.');
    } finally {
      setSendingMsg(false);
    }
  };

  // Scroll chat thread to bottom on message updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex items-center space-x-3 mb-6">
        <MessageSquare className="text-cyan-400 w-8 h-8" />
        <div>
          <h1 className="text-3xl font-extrabold text-white">Chat Workspace</h1>
          <p className="text-slate-400 mt-1">Direct messaging between clients and freelancers.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-[500px]">
        {/* Left Side Pane: Chat List */}
        <div className="lg:col-span-1 flex flex-col h-full">
          <GlassCard className="border border-slate-900 flex-1 flex flex-col p-4">
            <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider text-slate-450">
              Active Conversations
            </h3>

            {loadingChats ? (
              <div className="flex flex-col items-center justify-center flex-1 py-10 text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
              </div>
            ) : chats.length === 0 && !chatWithParam ? (
              <div className="flex flex-col items-center justify-center flex-1 py-10 text-slate-600 text-center">
                <MessageSquare className="w-10 h-10 mb-3" />
                <span className="text-sm">No conversations yet.</span>
              </div>
            ) : (
              <div className="space-y-2 flex-1 overflow-y-auto max-h-[500px]">
                {/* Temp redirect user if they aren't in active lists */}
                {activeChatUser && !chats.some(c => c.id === activeChatUser.id) && (
                  <button
                    onClick={() => handleSelectChat(activeChatUser)}
                    className="w-full text-left p-3 rounded-xl border border-cyan-500/20 bg-cyan-950/10 flex items-center space-x-3"
                  >
                    <img
                      src={activeChatUser.profileImage ? (activeChatUser.profileImage.startsWith('http') ? activeChatUser.profileImage : `${API_BASE}${activeChatUser.profileImage}`) : '/uploads/default-avatar.png'}
                      alt={activeChatUser.fullName}
                      className="w-10 h-10 rounded-full border border-cyan-500/20 object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-cyan-400 truncate">{activeChatUser.fullName}</h4>
                      </div>
                      <p className="text-xs text-slate-450 italic truncate">Drafting first message...</p>
                    </div>
                  </button>
                )}

                {chats.map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => handleSelectChat(chat)}
                    className={`w-full text-left p-3 rounded-xl flex items-center space-x-3 transition-all cursor-pointer ${
                      activeChatUser?.id === chat.id
                        ? 'bg-slate-900 border border-slate-800 text-white'
                        : 'hover:bg-slate-900/40 border border-transparent text-slate-400'
                    }`}
                  >
                    <img
                      src={chat.profileImage ? (chat.profileImage.startsWith('http') ? chat.profileImage : `${API_BASE}${chat.profileImage}`) : '/uploads/default-avatar.png'}
                      alt={chat.fullName}
                      className="w-10 h-10 rounded-full border border-slate-850 object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-slate-200 truncate">{chat.fullName}</h4>
                        <span className="text-[10px] text-slate-500">
                          {chat.lastMessageTime ? new Date(chat.lastMessageTime).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 truncate mt-1">
                        {chat.lastMessage || 'No messages yet.'}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </GlassCard>
        </div>

        {/* Right Side Pane: Chat View Window */}
        <div className="lg:col-span-2 flex flex-col h-full">
          <GlassCard className="border border-slate-900 flex-1 flex flex-col p-4 justify-between h-full">
            {activeChatUser ? (
              <>
                {/* Active user header */}
                <div className="flex items-center space-x-3 border-b border-slate-900 pb-3 mb-4">
                  <img
                    src={activeChatUser.profileImage ? (activeChatUser.profileImage.startsWith('http') ? activeChatUser.profileImage : `${API_BASE}${activeChatUser.profileImage}`) : '/uploads/default-avatar.png'}
                    alt={activeChatUser.fullName}
                    className="w-10 h-10 rounded-full border border-slate-850 object-cover"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-white">{activeChatUser.fullName}</h3>
                    <p className="text-xs text-slate-500 truncate max-w-sm">
                      {activeChatUser.skills || 'Unified Secure User'}
                    </p>
                  </div>
                </div>

                {/* Messages Log container */}
                <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4 max-h-[400px] min-h-[300px] chat-scroll">
                  {loadingMessages ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400">
                      <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-600 text-center py-20">
                      <Sparkles className="w-8 h-8 mb-2" />
                      <p className="text-sm font-medium">This is the start of your message thread.</p>
                      <p className="text-xs">Type below to negotiate proposal terms securely.</p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMe = msg.senderId === user.id;
                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                        >
                          <div
                            className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                              isMe
                                ? 'bg-gradient-to-tr from-cyan-500 to-blue-500 text-slate-950 font-medium rounded-tr-none'
                                : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                            }`}
                          >
                            {msg.messageText}
                          </div>
                          <span className="text-[9px] text-slate-600 mt-1 px-1">
                            {new Date(msg.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message input bar */}
                <form onSubmit={handleSendMessage} className="relative mt-auto border-t border-slate-900 pt-3">
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      required
                      value={newMessageText}
                      onChange={(e) => setNewMessageText(e.target.value)}
                      placeholder={`Send a secure message to ${activeChatUser.fullName.split(' ')[0]}...`}
                      className="w-full pl-4 pr-12 py-3 bg-slate-900/60 border border-slate-800 focus:outline-none focus:border-cyan-500 text-slate-200 text-sm rounded-xl"
                    />
                    <button
                      type="submit"
                      disabled={sendingMsg || !newMessageText.trim()}
                      className="absolute right-2 p-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:brightness-110 text-slate-950 rounded-lg cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-4.5 h-4.5" />
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 text-center py-24">
                <MessageSquare className="w-16 h-16 text-slate-700 mb-4 animate-bounce" />
                <h4 className="text-white font-bold text-base mb-1">No Active Chat Selected</h4>
                <p className="text-xs max-w-xs leading-relaxed">
                  Select a chat thread from the left bar or click Message from a details page to coordinate operations.
                </p>
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default Messages;
