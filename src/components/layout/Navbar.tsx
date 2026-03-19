import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { 
  Bell, 
  MessageCircle, 
  User, 
  LogOut, 
  LayoutDashboard,
  Menu,
  X,
  Calendar,
  Briefcase
} from 'lucide-react';
import { messageAPI, meetingAPI, collaborationAPI } from '../../services/api';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [pendingMeetings, setPendingMeetings] = useState(0);
  const [pendingProposals, setPendingProposals] = useState(0);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 10000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const [messagesRes, meetingsRes, proposalsRes] = await Promise.all([
        messageAPI.getUnreadCount().catch(() => ({ data: { data: { unreadCount: 0 } } })),
        meetingAPI.getUserMeetings({ status: 'pending', type: 'received' }).catch(() => ({ data: { count: 0 } })),
        collaborationAPI.getRequests({ type: 'received', status: 'pending' }).catch(() => ({ data: { count: 0 } }))
      ]);

      setUnreadMessages(messagesRes.data.data.unreadCount);
      setPendingMeetings(meetingsRes.data.count || 0);
      setPendingProposals(proposalsRes.data.count || 0);
    } catch (error) {
      console.error('Failed to fetch notifications');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  const NotificationBadge = ({ count }: { count: number }) => {
    if (count === 0) return null;
    return (
      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
        {count > 9 ? '9+' : count}
      </span>
    );
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to={`/dashboard/${user.role}`} className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">N</span>
              </div>
              <span className="text-xl font-bold text-gray-900 hidden sm:block">
                Business Nexus
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link
              to={`/dashboard/${user.role}`}
              className="text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100"
              title="Dashboard"
            >
              <LayoutDashboard className="w-5 h-5" />
            </Link>

            <Link
              to="/meetings"
              className="relative text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100"
              title="Meetings"
            >
              <Calendar className="w-5 h-5" />
              <NotificationBadge count={pendingMeetings} />
            </Link>

            {user.role === 'investor' && (
              <Link
                to="/deals"
                className="relative text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100"
                title="Proposals"
              >
                <Briefcase className="w-5 h-5" />
                <NotificationBadge count={pendingProposals} />
              </Link>
            )}

            <Link
              to="/messages"
              className="relative text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100"
              title="Messages"
            >
              <MessageCircle className="w-5 h-5" />
              <NotificationBadge count={unreadMessages} />
            </Link>

            <Link
              to="/notifications"
              className="text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
            </Link>

            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100"
              >
                <Avatar src={user.avatarUrl} alt={user.name} size="sm" />
                <span className="text-sm font-medium text-gray-700 hidden lg:block">
                  {user.name}
                </span>
              </button>

              {showUserMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                    <Link
                      to={`/profile/${user.role}/${user.id}`}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <User className="w-4 h-4" />
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="text-gray-600 hover:text-gray-900 p-2"
            >
              {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {showMobileMenu && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-3 space-y-2">
            <Link
              to={`/dashboard/${user.role}`}
              className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              onClick={() => setShowMobileMenu(false)}
            >
              <LayoutDashboard className="w-5 h-5" />
              Dashboard
            </Link>

            <Link
              to="/meetings"
              className="flex items-center justify-between px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              onClick={() => setShowMobileMenu(false)}
            >
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Meetings
              </div>
              {pendingMeetings > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold rounded-full px-2 py-1">
                  {pendingMeetings}
                </span>
              )}
            </Link>

            {user.role === 'investor' && (
              <Link
                to="/deals"
                className="flex items-center justify-between px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                onClick={() => setShowMobileMenu(false)}
              >
                <div className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Proposals
                </div>
                {pendingProposals > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold rounded-full px-2 py-1">
                    {pendingProposals}
                  </span>
                )}
              </Link>
            )}

            <Link
              to="/messages"
              className="flex items-center justify-between px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              onClick={() => setShowMobileMenu(false)}
            >
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Messages
              </div>
              {unreadMessages > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold rounded-full px-2 py-1">
                  {unreadMessages}
                </span>
              )}
            </Link>

            <Link
              to="/notifications"
              className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              onClick={() => setShowMobileMenu(false)}
            >
              <Bell className="w-5 h-5" />
              Notifications
            </Link>

            <Link
              to={`/profile/${user.role}/${user.id}`}
              className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              onClick={() => setShowMobileMenu(false)}
            >
              <User className="w-5 h-5" />
              Profile
            </Link>

            <button
              onClick={() => {
                setShowMobileMenu(false);
                handleLogout();
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-gray-100 rounded-lg"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};