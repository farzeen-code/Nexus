import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { Video, VideoOff, Mic, MicOff, PhoneOff, Monitor } from 'lucide-react';
import { meetingAPI, userAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export const VideoCallPage: React.FC = () => {
  const { meetingId } = useParams<{ meetingId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [meeting, setMeeting] = useState<any>(null);
  const [otherUser, setOtherUser] = useState<any>(null);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (meetingId) {
      fetchMeeting();
    }
  }, [meetingId]);

  const fetchMeeting = async () => {
    try {
      setLoading(true);
      const response = await meetingAPI.getMeetingById(meetingId!);
      const meetingData = response.data.data;
      
      if (meetingData.status !== 'accepted') {
        toast.error('Meeting is not accepted yet');
        navigate('/meetings');
        return;
      }

      setMeeting(meetingData);
      
      const other = meetingData.requestedBy._id === user?.id 
        ? meetingData.requestedTo 
        : meetingData.requestedBy;
      setOtherUser(other);
    } catch (error) {
      toast.error('Failed to load meeting');
      navigate('/meetings');
    } finally {
      setLoading(false);
    }
  };

  const handleEndCall = () => {
    navigate('/meetings');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="text-white mt-4">Connecting to call...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <div className="flex-1 relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            {otherUser && (
              <>
                <Avatar
                  src={otherUser.avatarUrl}
                  alt={otherUser.name}
                  size="xl"
                />
                <h2 className="text-2xl font-bold text-white mt-4">{otherUser.name}</h2>
                <p className="text-gray-400 mt-2">{meeting?.title}</p>
                <p className="text-green-400 mt-4 text-sm">Connected</p>
              </>
            )}
          </div>
        </div>

        <div className="absolute bottom-24 right-8">
          <div className="w-48 h-36 bg-gray-800 rounded-lg overflow-hidden border-2 border-gray-700 shadow-xl">
            <div className="w-full h-full flex items-center justify-center">
              <Avatar
                src={user?.avatarUrl}
                alt={user?.name || ''}
                size="lg"
              />
            </div>
          </div>
          <p className="text-white text-xs text-center mt-2">You</p>
        </div>
      </div>

      <div className="bg-gray-800 border-t border-gray-700 p-6">
        <div className="max-w-md mx-auto flex items-center justify-center gap-4">
          <button
            onClick={() => setIsAudioOn(!isAudioOn)}
            className={`p-4 rounded-full transition-colors ${
              isAudioOn 
                ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
            title={isAudioOn ? 'Mute' : 'Unmute'}
          >
            {isAudioOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
          </button>

          <button
            onClick={() => setIsVideoOn(!isVideoOn)}
            className={`p-4 rounded-full transition-colors ${
              isVideoOn 
                ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
            title={isVideoOn ? 'Turn off video' : 'Turn on video'}
          >
            {isVideoOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
          </button>

          <button
            className="p-4 rounded-full bg-gray-700 hover:bg-gray-600 text-white transition-colors"
            title="Share screen"
          >
            <Monitor className="w-6 h-6" />
          </button>

          <button
            onClick={handleEndCall}
            className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors"
            title="End call"
          >
            <PhoneOff className="w-6 h-6" />
          </button>
        </div>

        <div className="text-center mt-4">
          <p className="text-gray-400 text-sm">
            Video calling is in beta. Full integration coming soon.
          </p>
        </div>
      </div>

      <div className="absolute top-4 left-4">
        <Card className="p-3 bg-gray-800 bg-opacity-90 border-gray-700">
          <p className="text-white text-sm font-medium">{meeting?.title}</p>
          <p className="text-gray-400 text-xs mt-1">{meeting?.duration} minutes</p>
        </Card>
      </div>
    </div>
  );
};