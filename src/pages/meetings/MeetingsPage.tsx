import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Calendar, Clock, Video, Phone, MapPin, CheckCircle, XCircle } from 'lucide-react';
import { meetingAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { format } from 'date-fns';


export const MeetingsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'completed'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMeetings();
  }, [filter]);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const params = filter === 'all' ? {} : { status: filter };
      const response = await meetingAPI.getUserMeetings(params);
      setMeetings(response.data.data);
    } catch (error) {
      toast.error('Failed to load meetings');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (meetingId: string, status: 'accepted' | 'rejected' | 'cancelled') => {
    try {
      await meetingAPI.updateMeetingStatus(meetingId, status);
      toast.success(`Meeting ${status} successfully`);
      fetchMeetings();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update meeting');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: any = {
      pending: 'default',
      accepted: 'success',
      rejected: 'error',
      completed: 'secondary',
      cancelled: 'error'
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  const getMeetingIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-5 h-5" />;
      case 'phone': return <Phone className="w-5 h-5" />;
      case 'in-person': return <MapPin className="w-5 h-5" />;
      default: return <Calendar className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 mt-4">Loading meetings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Meetings</h1>
          <p className="text-gray-600 mt-2">Manage your scheduled meetings</p>
        </div>
      </div>

      <div className="flex gap-2">
        {['all', 'pending', 'accepted', 'completed'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            className={`px-4 py-2 rounded-lg font-medium ${filter === f
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {meetings.length === 0 ? (
        <Card className="p-12 text-center">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">No meetings found</p>
          <p className="text-gray-500 text-sm mt-2">
            {filter === 'all'
              ? 'Visit investor or entrepreneur profiles to request meetings'
              : `No ${filter} meetings`}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {meetings.map((meeting) => {
            const isRequester = meeting.requestedBy._id === user?.id;
            const otherUser = isRequester ? meeting.requestedTo : meeting.requestedBy;
            const isPending = meeting.status === 'pending';
            const canRespond = !isRequester && isPending;

            return (
              <Card key={meeting._id} className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{meeting.title}</h3>
                      {getStatusBadge(meeting.status)}
                    </div>

                    <p className="text-gray-600 mb-3">{meeting.description}</p>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(meeting.scheduledDate), 'MMM dd, yyyy')}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {format(new Date(meeting.scheduledDate), 'hh:mm a')} ({meeting.duration} min)
                      </div>
                      <div className="flex items-center gap-2">
                        {getMeetingIcon(meeting.meetingType)}
                        {meeting.meetingType}
                      </div>
                    </div>

                    <div className="mt-3 text-sm">
                      <span className="text-gray-600">
                        {isRequester ? 'With: ' : 'From: '}
                      </span>
                      <span className="font-medium text-gray-900">{otherUser.name}</span>
                      <span className="text-gray-500 ml-2">({otherUser.role})</span>
                    </div>

                    {meeting.meetingLink && meeting.status === 'accepted' && (
                      <div className="mt-3 flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => navigate(`/video/${meeting._id}`)}
                          className="flex items-center gap-2"
                        >
                          <Video className="w-4 h-4" />
                          Join Video Call
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {canRespond && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleStatusUpdate(meeting._id, 'accepted')}
                          className="flex items-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusUpdate(meeting._id, 'rejected')}
                          className="flex items-center gap-2"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </Button>
                      </>
                    )}
                    {isRequester && isPending && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusUpdate(meeting._id, 'cancelled')}
                      >
                        Cancel
                      </Button>
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