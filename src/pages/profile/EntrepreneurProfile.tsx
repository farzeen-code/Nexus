import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { MapPin, Calendar, Users, DollarSign, Building, ArrowLeft, MessageCircle } from 'lucide-react';
import { userAPI } from '../../services/api';
import { Entrepreneur } from '../../types';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { MeetingRequestModal } from '../../components/meetings/MeetingRequestModal';

export const EntrepreneurProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [entrepreneur, setEntrepreneur] = useState<Entrepreneur | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMeetingModal, setShowMeetingModal] = useState(false);

  useEffect(() => {
    const fetchEntrepreneur = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const response = await userAPI.getUserById(id);
        
        if (response.data.data.role !== 'entrepreneur') {
          toast.error('This is not an entrepreneur profile');
          navigate('/entrepreneurs');
          return;
        }

        setEntrepreneur(response.data.data as Entrepreneur);
      } catch (error: any) {
        console.error('Failed to fetch entrepreneur:', error);
        toast.error('Entrepreneur not found');
        navigate('/entrepreneurs');
      } finally {
        setLoading(false);
      }
    };

    fetchEntrepreneur();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 mt-4">Loading profile...</p>
      </div>
    );
  }

  if (!entrepreneur) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 text-lg">Entrepreneur not found</p>
        <Button onClick={() => navigate('/entrepreneurs')} className="mt-4">
          Back to Entrepreneurs
        </Button>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === entrepreneur.id;

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        onClick={() => navigate('/entrepreneurs')}
        className="flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Entrepreneurs
      </Button>

      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <Avatar
            src={entrepreneur.avatarUrl}
            alt={entrepreneur.name}
            size="xl"
            isOnline={entrepreneur.isOnline}
          />
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{entrepreneur.name}</h1>
                {entrepreneur.startupName && (
                  <p className="text-lg text-blue-600 font-semibold mt-1">
                    {entrepreneur.startupName}
                  </p>
                )}
                {entrepreneur.bio && (
                  <p className="text-gray-600 mt-2">{entrepreneur.bio}</p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-4 mt-4">
              {entrepreneur.location && (
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{entrepreneur.location}</span>
                </div>
              )}
              {entrepreneur.industry && (
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-gray-600" />
                  <Badge variant="secondary">{entrepreneur.industry}</Badge>
                </div>
              )}
              {entrepreneur.foundedYear && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>Founded {entrepreneur.foundedYear}</span>
                </div>
              )}
              {entrepreneur.teamSize && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>{entrepreneur.teamSize} team members</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {entrepreneur.pitchSummary && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Pitch Summary</h2>
            <p className="text-gray-700 leading-relaxed">{entrepreneur.pitchSummary}</p>
          </Card>
        )}

        {entrepreneur.fundingNeeded && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Funding Details</h2>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Seeking Investment</p>
                <p className="text-2xl font-bold text-gray-900">{entrepreneur.fundingNeeded}</p>
              </div>
            </div>
          </Card>
        )}
      </div>

      {!isOwnProfile && currentUser?.role === 'investor' && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Connect</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Button 
              className="flex items-center justify-center gap-2"
              onClick={() => setShowMeetingModal(true)}
            >
              Request Meeting
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center justify-center gap-2"
              onClick={() => navigate(`/chat/${entrepreneur.id}`)}
            >
              <MessageCircle className="w-4 h-4" />
              Send Message
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate(`/deals`)}
            >
              View Proposals
            </Button>
          </div>
        </Card>
      )}

      {isOwnProfile && (
        <Card className="p-6 bg-blue-50 border-blue-200">
          <p className="text-blue-800">This is your profile. You can edit it in Settings.</p>
        </Card>
      )}

      <MeetingRequestModal
        isOpen={showMeetingModal}
        onClose={() => setShowMeetingModal(false)}
        recipientId={entrepreneur.id}
        recipientName={entrepreneur.name}
      />
    </div>
  );
};