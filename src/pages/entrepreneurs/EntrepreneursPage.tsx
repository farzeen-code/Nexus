import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { EntrepreneurCard } from '../../components/entrepreneur/EntrepreneurCard';
import { Input } from '../../components/ui/Input';
import { Search } from 'lucide-react';
import { userAPI } from '../../services/api';
import { Entrepreneur } from '../../types';
import toast from 'react-hot-toast';

export const EntrepreneursPage: React.FC = () => {
  const [entrepreneurs, setEntrepreneurs] = useState<Entrepreneur[]>([]);
  const [filteredEntrepreneurs, setFilteredEntrepreneurs] = useState<Entrepreneur[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch entrepreneurs on component mount
  useEffect(() => {
    const fetchEntrepreneurs = async () => {
      try {
        setLoading(true);
        const response = await userAPI.getAllEntrepreneurs();
        setEntrepreneurs(response.data.data);
        setFilteredEntrepreneurs(response.data.data);
      } catch (error: any) {
        console.error('Failed to fetch entrepreneurs:', error);
        toast.error('Failed to load entrepreneurs');
      } finally {
        setLoading(false);
      }
    };

    fetchEntrepreneurs();
  }, []);

  // Filter entrepreneurs based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredEntrepreneurs(entrepreneurs);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = entrepreneurs.filter((entrepreneur) => {
      return (
        entrepreneur.name.toLowerCase().includes(query) ||
        entrepreneur.startupName?.toLowerCase().includes(query) ||
        entrepreneur.industry?.toLowerCase().includes(query) ||
        entrepreneur.location?.toLowerCase().includes(query)
      );
    });
    setFilteredEntrepreneurs(filtered);
  }, [searchQuery, entrepreneurs]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Entrepreneurs</h1>
          <p className="text-gray-600 mt-2">
            Connect with innovative entrepreneurs seeking investment
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search by name, startup, industry, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading entrepreneurs...</p>
          </div>
        )}

        {/* No Results */}
        {!loading && filteredEntrepreneurs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">
              {searchQuery
                ? 'No entrepreneurs found matching your search.'
                : 'No entrepreneurs available yet.'}
            </p>
          </div>
        )}

        {/* Entrepreneurs Grid */}
        {!loading && filteredEntrepreneurs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEntrepreneurs.map((entrepreneur) => (
              <EntrepreneurCard key={entrepreneur.id} entrepreneur={entrepreneur} />
            ))}
          </div>
        )}

        {/* Results Count */}
        {!loading && filteredEntrepreneurs.length > 0 && (
          <div className="text-sm text-gray-600 text-center">
            Showing {filteredEntrepreneurs.length} of {entrepreneurs.length} entrepreneurs
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};