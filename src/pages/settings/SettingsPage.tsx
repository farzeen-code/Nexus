import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Avatar } from '../../components/ui/Avatar';
import { useAuth } from '../../context/AuthContext';
import { User, Building2, MapPin, DollarSign, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';

export const SettingsPage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    location: user?.location || '',
    avatarUrl: user?.avatarUrl || '',
    startupName: user?.startupName || '',
    pitchSummary: user?.pitchSummary || '',
    fundingNeeded: user?.fundingNeeded || '',
    industry: user?.industry || '',
    foundedYear: user?.foundedYear || '',
    teamSize: user?.teamSize || '',
    investmentInterests: user?.investmentInterests?.join(', ') || '',
    investmentStage: user?.investmentStage?.join(', ') || '',
    portfolioCompanies: user?.portfolioCompanies?.join(', ') || '',
    totalInvestments: user?.totalInvestments || 0,
    minimumInvestment: user?.minimumInvestment || '',
    maximumInvestment: user?.maximumInvestment || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const updates: any = {
        name: formData.name,
        bio: formData.bio,
        location: formData.location,
        avatarUrl: formData.avatarUrl
      };

      if (user?.role === 'entrepreneur') {
        updates.startupName = formData.startupName;
        updates.pitchSummary = formData.pitchSummary;
        updates.fundingNeeded = formData.fundingNeeded;
        updates.industry = formData.industry;
        updates.foundedYear = formData.foundedYear;
        updates.teamSize = formData.teamSize;
      } else if (user?.role === 'investor') {
        updates.investmentInterests = formData.investmentInterests
          .split(',')
          .map(s => s.trim())
          .filter(Boolean);
        updates.investmentStage = formData.investmentStage
          .split(',')
          .map(s => s.trim())
          .filter(Boolean);
        updates.portfolioCompanies = formData.portfolioCompanies
          .split(',')
          .map(s => s.trim())
          .filter(Boolean);
        updates.totalInvestments = Number(formData.totalInvestments);
        updates.minimumInvestment = formData.minimumInvestment;
        updates.maximumInvestment = formData.maximumInvestment;
      }

      await updateProfile(updates);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">Manage your account and profile settings</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            Basic Information
          </h2>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar
                src={formData.avatarUrl}
                alt={formData.name}
                size="xl"
              />
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Avatar URL
                </label>
                <Input
                  type="url"
                  value={formData.avatarUrl}
                  onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                  placeholder="https://example.com/avatar.jpg"
                />
                <p className="text-xs text-gray-500 mt-1">Enter a URL to your profile picture</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bio
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell us about yourself..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <MapPin className="w-4 h-4 inline mr-1" />
                Location
              </label>
              <Input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., San Francisco, CA"
              />
            </div>
          </div>
        </Card>

        {user?.role === 'entrepreneur' && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Startup Information
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Startup Name
                </label>
                <Input
                  type="text"
                  value={formData.startupName}
                  onChange={(e) => setFormData({ ...formData, startupName: e.target.value })}
                  placeholder="Your company name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Industry
                </label>
                <Input
                  type="text"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  placeholder="e.g., FinTech, HealthTech, SaaS"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Founded Year
                  </label>
                  <Input
                    type="text"
                    value={formData.foundedYear}
                    onChange={(e) => setFormData({ ...formData, foundedYear: e.target.value })}
                    placeholder="2024"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Team Size
                  </label>
                  <Input
                    type="text"
                    value={formData.teamSize}
                    onChange={(e) => setFormData({ ...formData, teamSize: e.target.value })}
                    placeholder="e.g., 5-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pitch Summary
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  value={formData.pitchSummary}
                  onChange={(e) => setFormData({ ...formData, pitchSummary: e.target.value })}
                  placeholder="Describe your startup and what problem you're solving..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  Funding Needed
                </label>
                <Input
                  type="text"
                  value={formData.fundingNeeded}
                  onChange={(e) => setFormData({ ...formData, fundingNeeded: e.target.value })}
                  placeholder="e.g., $500K - $1M"
                />
              </div>
            </div>
          </Card>
        )}

        {user?.role === 'investor' && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              Investment Information
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Investment Interests
                </label>
                <Input
                  type="text"
                  value={formData.investmentInterests}
                  onChange={(e) => setFormData({ ...formData, investmentInterests: e.target.value })}
                  placeholder="e.g., FinTech, HealthTech, AI (comma-separated)"
                />
                <p className="text-xs text-gray-500 mt-1">Separate multiple interests with commas</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Investment Stage
                </label>
                <Input
                  type="text"
                  value={formData.investmentStage}
                  onChange={(e) => setFormData({ ...formData, investmentStage: e.target.value })}
                  placeholder="e.g., Seed, Series A, Series B (comma-separated)"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum Investment
                  </label>
                  <Input
                    type="text"
                    value={formData.minimumInvestment}
                    onChange={(e) => setFormData({ ...formData, minimumInvestment: e.target.value })}
                    placeholder="e.g., $50K"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Maximum Investment
                  </label>
                  <Input
                    type="text"
                    value={formData.maximumInvestment}
                    onChange={(e) => setFormData({ ...formData, maximumInvestment: e.target.value })}
                    placeholder="e.g., $2M"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Investments Made
                </label>
                <Input
                  type="number"
                  value={formData.totalInvestments}
                  onChange={(e) => setFormData({ ...formData, totalInvestments: Number(e.target.value) })}
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Portfolio Companies
                </label>
                <Input
                  type="text"
                  value={formData.portfolioCompanies}
                  onChange={(e) => setFormData({ ...formData, portfolioCompanies: e.target.value })}
                  placeholder="e.g., Company A, Company B (comma-separated)"
                />
              </div>
            </div>
          </Card>
        )}

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => window.location.reload()}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
};