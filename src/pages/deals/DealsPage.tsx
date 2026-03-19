import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { Briefcase, CheckCircle, XCircle, Eye } from 'lucide-react';
import { collaborationAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

export const DealsPage: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');
  const [viewType, setViewType] = useState<'all' | 'sent' | 'received'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, [filter, viewType]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const params: any = { type: viewType };
      if (filter !== 'all') params.status = filter;
      
      const response = await collaborationAPI.getRequests(params);
      setRequests(response.data.data);
    } catch (error) {
      toast.error('Failed to load collaboration requests');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (requestId: string, status: 'accepted' | 'rejected' | 'under_review') => {
    try {
      await collaborationAPI.updateStatus(requestId, status);
      toast.success(`Request ${status} successfully`);
      fetchRequests();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update request');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: any = {
      pending: 'default',
      accepted: 'success',
      rejected: 'error',
      under_review: 'secondary'
    };
    return <Badge variant={variants[status] || 'default'}>{status.replace('_', ' ')}</Badge>;
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 mt-4">Loading deals...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {user?.role === 'entrepreneur' ? 'Investment Proposals' : 'Deal Flow'}
        </h1>
        <p className="text-gray-600 mt-2">
          {user?.role === 'entrepreneur' 
            ? 'Manage your investment proposals to investors'
            : 'Review collaboration requests from entrepreneurs'}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="flex gap-2">
          {['all', 'sent', 'received'].map((type) => (
            <button
              key={type}
              onClick={() => setViewType(type as any)}
              className={`px-4 py-2 rounded-lg font-medium ${
                viewType === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex gap-2 ml-auto">
          {['all', 'pending', 'accepted', 'rejected'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-4 py-2 rounded-lg font-medium ${
                filter === f
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {requests.length === 0 ? (
        <Card className="p-12 text-center">
          <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">No collaboration requests found</p>
          <p className="text-gray-500 text-sm mt-2">
            {user?.role === 'entrepreneur'
              ? 'Visit investor profiles to send investment proposals'
              : 'Entrepreneurs will send you collaboration requests'}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => {
            const isSender = request.entrepreneur._id === user?.id;
            const otherUser = isSender ? request.investor : request.entrepreneur;
            const canRespond = !isSender && request.status === 'pending';

            return (
              <Card key={request._id} className="p-6">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex gap-4 flex-1">
                    <Avatar
                      src={otherUser.avatarUrl}
                      alt={otherUser.name}
                      size="md"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{request.title}</h3>
                        {getStatusBadge(request.status)}
                      </div>

                      <p className="text-sm text-gray-600 mb-2">
                        {isSender ? 'To: ' : 'From: '}
                        <span className="font-medium text-gray-900">{otherUser.name}</span>
                        {request.entrepreneur.startupName && (
                          <span className="text-gray-500"> • {request.entrepreneur.startupName}</span>
                        )}
                      </p>

                      <p className="text-gray-700 mb-3">{request.description}</p>

                      <div className="flex flex-wrap gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Amount: </span>
                          <span className="font-semibold text-gray-900">{request.requestedAmount}</span>
                        </div>
                        {request.equity && (
                          <div>
                            <span className="text-gray-600">Equity: </span>
                            <span className="font-semibold text-gray-900">{request.equity}</span>
                          </div>
                        )}
                        <div>
                          <span className="text-gray-500">
                            {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                      </div>

                      {request.message && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700">{request.message}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {canRespond && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleStatusUpdate(request._id, 'under_review')}
                          className="flex items-center gap-2"
                          variant="outline"
                        >
                          <Eye className="w-4 h-4" />
                          Review
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleStatusUpdate(request._id, 'accepted')}
                          className="flex items-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusUpdate(request._id, 'rejected')}
                          className="flex items-center gap-2"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </Button>
                      </>
                    )}
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