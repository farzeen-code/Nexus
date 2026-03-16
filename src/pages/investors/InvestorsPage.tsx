import React, { useState, useEffect } from 'react';

import { InvestorCard } from '../../components/investor/InvestorCard';
import { Input } from '../../components/ui/Input';
import { Search } from 'lucide-react';
import { userAPI } from '../../services/api';
import { Investor } from '../../types';
import toast from 'react-hot-toast';

export const InvestorsPage: React.FC = () => {
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [filteredInvestors, setFilteredInvestors] = useState<Investor[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch investors on component mount
  useEffect(() => {
    const fetchInvestors = async () => {
      try {
        setLoading(true);
        const response = await userAPI.getAllInvestors();
        setInvestors(response.data.data);
        setFilteredInvestors(response.data.data);
      } catch (error: any) {
        console.error('Failed to fetch investors:', error);
        toast.error('Failed to load investors');
      } finally {
        setLoading(false);
      }
    };

    fetchInvestors();
  }, []);

  // Filter investors based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredInvestors(investors);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = investors.filter((investor) => {
      return (
        investor.name.toLowerCase().includes(query) ||
        investor.investmentInterests?.some(interest => 
          interest.toLowerCase().includes(query)
        ) ||
        investor.location?.toLowerCase().includes(query)
      );
    });
    setFilteredInvestors(filtered);
  }, [searchQuery, investors]);

  return (
    
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Investors</h1>
          <p className="text-gray-600 mt-2">
            Discover investors looking for innovative opportunities
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search by name, interests, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading investors...</p>
          </div>
        )}

        {/* No Results */}
        {!loading && filteredInvestors.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">
              {searchQuery
                ? 'No investors found matching your search.'
                : 'No investors available yet.'}
            </p>
          </div>
        )}

        {/* Investors Grid */}
        {!loading && filteredInvestors.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInvestors.map((investor) => (
              <InvestorCard key={investor.id} investor={investor} />
            ))}
          </div>
        )}

        {/* Results Count */}
        {!loading && filteredInvestors.length > 0 && (
          <div className="text-sm text-gray-600 text-center">
            Showing {filteredInvestors.length} of {investors.length} investors
          </div>
        )}
      </div>
    
  );
};