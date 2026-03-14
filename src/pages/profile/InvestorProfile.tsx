import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { MapPin, DollarSign, TrendingUp, Briefcase, ArrowLeft, MessageCircle } from 'lucide-react';
import { userAPI } from '../../services/api';
import { Investor } from '../../types';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

export const InvestorProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [investor, setInvestor] = useState<Investor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvestor = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const response = await userAPI.getUserById(id);
        
        if (response.data.data.role !== 'investor') {
          toast.error('This is not an investor profile');
          navigate('/investors');
          return;
        }

        setInvestor(response.data.data as Investor);
      } catch (error: any) {
        console.error('Failed to fetch investor:', error);
        toast.error('Investor not found');
        navigate('/investors');
      } finally {
        setLoading(false);
      }
    };

    fetchInvestor();
  }, [id, navigate]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading profile...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!investor) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">Investor not found</p>
          <Button onClick={() => navigate('/investors')} className="mt-4">
            Back to Investors
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const isOwnProfile = currentUser?.id === investor.id;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/investors')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Investors
        </Button>

        {/* Profile Header */}
        <Card className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <Avatar
              src={investor.avatarUrl}
              alt={investor.name}
              size="xl"
              isOnline={investor.isOnline}
            />
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{investor.name}</h1>
                  {investor.bio && (
                    <p className="text-gray-600 mt-2">{investor.bio}</p>
                  )}
                </div>
                {!isOwnProfile && (
                  <Button className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    Send Message
                  </Button>
                )}
              </div>

              <div className="flex flex-wrap gap-4 mt-4">
                {investor.location && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{investor.location}</span>
                  </div>
                )}
                {investor.totalInvestments > 0 && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Briefcase className="w-4 h-4" />
                    <span>{investor.totalInvestments} investments</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Investment Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Investment Interests */}
          {investor.investmentInterests && investor.investmentInterests.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Investment Interests</h2>
              <div className="flex flex-wrap gap-2">
                {investor.investmentInterests.map((interest, index) => (
                  <Badge key={index} variant="primary">{interest}</Badge>
                ))}
              </div>
            </Card>
          )}

          {/* Investment Stage */}
          {investor.investmentStage && investor.investmentStage.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Investment Stage</h2>
              <div className="flex flex-wrap gap-2">
                {investor.investmentStage.map((stage, index) => (
                  <Badge key={index} variant="secondary">{stage}</Badge>
                ))}
              </div>
            </Card>
          )}

          {/* Investment Range */}
          {(investor.minimumInvestment || investor.maximumInvestment) && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Investment Range</h2>
              <div className="space-y-3">
                {investor.minimumInvestment && (
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Minimum</p>
                      <p className="font-semibold text-gray-900">{investor.minimumInvestment}</p>
                    </div>
                  </div>
                )}
                {investor.maximumInvestment && (
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Maximum</p>
                      <p className="font-semibold text-gray-900">{investor.maximumInvestment}</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Portfolio Companies */}
          {investor.portfolioCompanies && investor.portfolioCompanies.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Portfolio Companies</h2>
              <ul className="space-y-2">
                {investor.portfolioCompanies.map((company, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full" />
                    <span className="text-gray-700">{company}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>

        {/* Contact Actions */}
        {!isOwnProfile && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Get in Touch</h2>
            <div className="flex gap-4">
              <Button className="flex-1">Request Meeting</Button>
              <Button variant="outline" className="flex-1">Send Pitch Deck</Button>
            </div>
          </Card>
        )}

        {isOwnProfile && (
          <Card className="p-6 bg-blue-50 border-blue-200">
            <p className="text-blue-800">This is your profile. You can edit it in Settings.</p>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};