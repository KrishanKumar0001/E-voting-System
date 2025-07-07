import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Vote, CheckCircle, AlertTriangle, Lock } from 'lucide-react';
import { useVoting } from '../context/VotingContext';
import { useAuth } from '../context/AuthContext';

const VotingBooth: React.FC = () => {
  const { electionId } = useParams<{ electionId: string }>();
  const navigate = useNavigate();
  const { elections, castVote } = useVoting();
  const { user } = useAuth();
  
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const election = elections.find(e => e.id === electionId);

  if (!election) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Election Not Found</h2>
          <button
            onClick={() => navigate('/elections')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Elections
          </button>
        </div>
      </div>
    );
  }

  const selectedCandidateInfo = election.candidates.find(c => c.id === selectedCandidate);

  const handleVoteSubmit = () => {
    if (!selectedCandidate || !user) return;

    setIsSubmitting(true);
    
    // Simulate voting process
    setTimeout(() => {
      castVote({
        voterId: user.id,
        candidateId: selectedCandidate,
        electionId: election.id,
      });
      
      setIsSubmitting(false);
      navigate('/vote-confirmation', { 
        state: { 
          candidateName: selectedCandidateInfo?.name,
          electionTitle: election.title 
        }
      });
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{election.title}</h1>
              <p className="text-gray-600 mt-1">{election.description}</p>
            </div>
            <div className="flex items-center text-green-600">
              <Lock className="h-5 w-5 mr-2" />
              <span className="text-sm font-medium">Secure Voting</span>
            </div>
          </div>
        </div>

        {/* Voter Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-blue-600 mr-2" />
            <span className="text-blue-800">
              <strong>Voter:</strong> {user?.name} (ID: {user?.voterId})
            </span>
          </div>
        </div>

        {/* Candidates */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Select Your Candidate</h2>
          
          <div className="grid gap-4">
            {election.candidates.map((candidate) => (
              <div
                key={candidate.id}
                className={`border-2 rounded-lg p-6 cursor-pointer transition-all hover:shadow-md ${
                  selectedCandidate === candidate.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedCandidate(candidate.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-4xl">{candidate.symbol}</div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{candidate.name}</h3>
                      <p className="text-gray-600">{candidate.party}</p>
                      <p className="text-sm text-gray-500">Aadhar: {candidate.aadharId}</p>
                    </div>
                  </div>
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      selectedCandidate === candidate.id
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}
                  >
                    {selectedCandidate === candidate.id && (
                      <CheckCircle className="h-4 w-4 text-white" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Vote Button */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-amber-600">
              <AlertTriangle className="h-5 w-5 mr-2" />
              <span className="text-sm">
                Once submitted, your vote cannot be changed. Please review your selection carefully.
              </span>
            </div>
            <button
              onClick={() => setShowConfirmModal(true)}
              disabled={!selectedCandidate}
              className="bg-green-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Submit Vote
            </button>
          </div>
        </div>

        {/* Confirmation Modal */}
        {showConfirmModal && selectedCandidateInfo && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full">
              <div className="text-center">
                <Vote className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Confirm Your Vote</h3>
                
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <p className="text-sm text-gray-600 mb-2">You are voting for:</p>
                  <div className="flex items-center justify-center space-x-3">
                    <span className="text-2xl">{selectedCandidateInfo.symbol}</span>
                    <div className="text-left">
                      <p className="font-semibold text-gray-900">{selectedCandidateInfo.name}</p>
                      <p className="text-sm text-gray-600">{selectedCandidateInfo.party}</p>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-6">
                  This action cannot be undone. Are you sure you want to cast your vote?
                </p>

                <div className="flex space-x-4">
                  <button
                    onClick={() => setShowConfirmModal(false)}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleVoteSubmit}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Casting Vote...
                      </>
                    ) : (
                      'Confirm Vote'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VotingBooth;