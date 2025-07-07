import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, Clock, Vote } from 'lucide-react';
import { useVoting } from '../context/VotingContext';
import { useAuth } from '../context/AuthContext';

const Elections: React.FC = () => {
  const { elections } = useVoting();
  const { user } = useAuth();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'upcoming':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Clock className="h-4 w-4" />;
      case 'upcoming':
        return <Calendar className="h-4 w-4" />;
      case 'completed':
        return <Vote className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Active Elections</h1>
          <p className="text-xl text-gray-600">
            Welcome back, <span className="font-semibold">{user?.name}</span>. Here are the available elections.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {elections.map((election) => (
            <div
              key={election.id}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                      election.status
                    )}`}
                  >
                    {getStatusIcon(election.status)}
                    <span className="ml-1 capitalize">{election.status}</span>
                  </span>
                  <div className="flex items-center text-gray-500">
                    <Users className="h-4 w-4 mr-1" />
                    <span className="text-sm">{election.candidates.length} candidates</span>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-3">{election.title}</h3>
                <p className="text-gray-600 mb-4">{election.description}</p>

                <div className="space-y-2 mb-6">
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>Start: {new Date(election.startDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>End: {new Date(election.endDate).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Candidates:</h4>
                  <div className="space-y-1">
                    {election.candidates.slice(0, 3).map((candidate) => (
                      <div key={candidate.id} className="flex items-center text-sm text-gray-600">
                        <span className="mr-2">{candidate.symbol}</span>
                        <span>{candidate.name}</span>
                        <span className="ml-auto text-xs text-gray-500">({candidate.party})</span>
                      </div>
                    ))}
                    {election.candidates.length > 3 && (
                      <p className="text-xs text-gray-500">
                        +{election.candidates.length - 3} more candidates
                      </p>
                    )}
                  </div>
                </div>

                {election.status === 'active' ? (
                  <Link
                    to={`/vote/${election.id}`}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105 flex items-center justify-center"
                  >
                    <Vote className="h-5 w-5 mr-2" />
                    Cast Your Vote
                  </Link>
                ) : election.status === 'upcoming' ? (
                  <button
                    disabled
                    className="w-full bg-gray-300 text-gray-500 py-3 px-4 rounded-lg font-medium cursor-not-allowed"
                  >
                    Election Not Started
                  </button>
                ) : (
                  <Link
                    to="/results"
                    className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-700 transition-colors flex items-center justify-center"
                  >
                    View Results
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>

        {elections.length === 0 && (
          <div className="text-center py-12">
            <Vote className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No Elections Available</h3>
            <p className="text-gray-600">Check back later for upcoming elections.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Elections;