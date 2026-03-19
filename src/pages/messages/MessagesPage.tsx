import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { MessageCircle, Search } from 'lucide-react';
import { messageAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

export const MessagesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await messageAPI.getConversations();
      setConversations(response.data.data);
    } catch (error) {
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const handleConversationClick = (userId: string) => {
    navigate(`/chat/${userId}`);
  };

  const filteredConversations = conversations.filter(conv => {
    const otherUser = conv.sender._id === user?.id ? conv.receiver : conv.sender;
    return otherUser.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 mt-4">Loading messages...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
        <p className="text-gray-600 mt-2">Your conversations</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {filteredConversations.length === 0 ? (
        <Card className="p-12 text-center">
          <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">No conversations yet</p>
          <p className="text-gray-500 text-sm mt-2">
            Visit investor or entrepreneur profiles to start messaging
          </p>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredConversations.map((conv) => {
            const otherUser = conv.sender._id === user?.id ? conv.receiver : conv.sender;
            const isUnread = conv.receiver._id === user?.id && !conv.isRead;

            return (
              <Card
                key={conv._id}
                className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                  isUnread ? 'bg-blue-50 border-blue-200' : ''
                }`}
                onClick={() => handleConversationClick(otherUser._id)}
              >
                <div className="flex items-center gap-4">
                  <Avatar
                    src={otherUser.avatarUrl}
                    alt={otherUser.name}
                    size="md"
                    isOnline={otherUser.isOnline}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className={`font-semibold ${isUnread ? 'text-gray-900' : 'text-gray-800'}`}>
                        {otherUser.name}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(conv.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className={`text-sm truncate ${isUnread ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
                        {conv.sender._id === user?.id ? 'You: ' : ''}{conv.content}
                      </p>
                      {isUnread && (
                        <Badge variant="primary" className="ml-2">New</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};