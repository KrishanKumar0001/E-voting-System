import React, { useState } from 'react';
import { Users, Vote, BarChart3, Plus, Settings, Download, AlertCircle } from 'lucide-react';
import { useVoting } from '../context/VotingContext';
import { useAuth } from '../context/AuthContext';

const AdminDashboard: React.FC = () => {
  const { elections, votes, addElection, addCandidate, getElectionResults } = useVoting();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [showCreateElection, setShowCreateElection] = useState(false);
  const [showAddCandidate, setShowAddCandidate] = useState(false);
  const [selectedElectionId, setSelectedElectionId] = useState('');

  const [newElection, setNewElection] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
  });

  const [newCandidate, setNewCandidate] = useState({
    name: '',
    party: '',
    symbol: '',
    aadharId: '',
  });

  const totalVoters = 1247; // Mock data
  const totalCandidates = elections.reduce((sum, election) => sum + election.candidates.length, 0);
  const totalVotes = votes.length;

  const handleCreateElection = (e: React.FormEvent) => {
    e.preventDefault();
    const election = {
      id: Date.now().toString(),
      ...newElection,
      status: 'upcoming' as const,
      candidates: [],
    };
    addElection(election);
    setNewElection({ title: '', description: '', startDate: '', endDate: '' });
    setShowCreateElection(false);
  };

  const handleAddCandidate = (e: React.FormEvent) => {
    e.preventDefault();
    const candidate = {
      id: Date.now().toString(),
      ...newCandidate,
    };
    addCandidate(selectedElectionId, candidate);
    setNewCandidate({ name: '', party: '', symbol: '', aadharId: '' });
    setShowAddCandidate(false);
    setSelectedElectionId('');
  };

  const handleExportVotes = () => {
    const exportData = votes.map(vote => ({
      voteId: vote.id,
      timestamp: vote.timestamp,
      electionId: vote.electionId,
      candidateId: vote.candidateId,
    }));

    const csv = [
      'Vote ID,Timestamp,Election ID,Candidate ID',
      ...exportData.map(row => `${row.voteId},${row.timestamp},${row.electionId},${row.candidateId}`)
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'all_votes_export.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome back, {user?.name}</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleExportVotes}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="h-5 w-5 mr-2" />
                Export Data
              </button>
              <Settings className="h-8 w-8 text-gray-400 cursor-pointer hover:text-gray-600" />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 rounded-lg p-3">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Voters</p>
                <p className="text-2xl font-bold text-gray-900">{totalVoters.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="bg-green-100 rounded-lg p-3">
                <Vote className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Votes</p>
                <p className="text-2xl font-bold text-gray-900">{totalVotes}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 rounded-lg p-3">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Candidates</p>
                <p className="text-2xl font-bold text-gray-900">{totalCandidates}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="bg-orange-100 rounded-lg p-3">
                <BarChart3 className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Elections</p>
                <p className="text-2xl font-bold text-gray-900">{elections.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-lg mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {['overview', 'elections', 'candidates', 'voters'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${
                    activeTab === tab
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                    <div className="space-y-3">
                      <div className="flex items-center text-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                        <span className="text-gray-600">12 new votes cast in the last hour</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                        <span className="text-gray-600">3 new voter registrations</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                        <span className="text-gray-600">Presidential Election 2024 is active</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Voter Database</span>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Online</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Voting System</span>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Active</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Security Checks</span>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Passed</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'elections' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Election Management</h3>
                  <button
                    onClick={() => setShowCreateElection(true)}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Create Election
                  </button>
                </div>

                <div className="space-y-4">
                  {elections.map((election) => {
                    const results = getElectionResults(election.id);
                    const totalVotes = Object.values(results).reduce((sum, votes) => sum + votes, 0);

                    return (
                      <div key={election.id} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900">{election.title}</h4>
                            <p className="text-gray-600">{election.description}</p>
                          </div>
                          <div className="text-right">
                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                              election.status === 'active' ? 'bg-green-100 text-green-800' :
                              election.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {election.status.charAt(0).toUpperCase() + election.status.slice(1)}
                            </span>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div>
                            <strong>Start Date:</strong> {new Date(election.startDate).toLocaleDateString()}
                          </div>
                          <div>
                            <strong>End Date:</strong> {new Date(election.endDate).toLocaleDateString()}
                          </div>
                          <div>
                            <strong>Total Votes:</strong> {totalVotes}
                          </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            {election.candidates.length} candidates registered
                          </span>
                          <button
                            onClick={() => {
                              setSelectedElectionId(election.id);
                              setShowAddCandidate(true);
                            }}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                          >
                            Add Candidate
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'candidates' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Candidate Overview</h3>
                <div className="space-y-6">
                  {elections.map((election) => (
                    <div key={election.id} className="border border-gray-200 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">{election.title}</h4>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {election.candidates.map((candidate) => (
                          <div key={candidate.id} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center space-x-3">
                              <span className="text-2xl">{candidate.symbol}</span>
                              <div>
                                <h5 className="font-medium text-gray-900">{candidate.name}</h5>
                                <p className="text-sm text-gray-600">{candidate.party}</p>
                                <p className="text-xs text-gray-500">Aadhar: {candidate.aadharId}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'voters' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Voter Management</h3>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                    <span className="text-yellow-800 text-sm">
                      Voter data is anonymized for privacy protection. Individual voter information is not displayed.
                    </span>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900 mb-2">Registration Stats</h4>
                    <div className="text-3xl font-bold text-blue-600">{totalVoters}</div>
                    <p className="text-gray-600 text-sm">Total registered voters</p>
                  </div>
                  
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900 mb-2">Voter Turnout</h4>
                    <div className="text-3xl font-bold text-green-600">
                      {totalVoters > 0 ? ((totalVotes / totalVoters) * 100).toFixed(1) : 0}%
                    </div>
                    <p className="text-gray-600 text-sm">Participation rate</p>
                  </div>
                  
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900 mb-2">New Registrations</h4>
                    <div className="text-3xl font-bold text-purple-600">23</div>
                    <p className="text-gray-600 text-sm">This week</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Create Election Modal */}
        {showCreateElection && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Create New Election</h3>
              <form onSubmit={handleCreateElection} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={newElection.title}
                    onChange={(e) => setNewElection({ ...newElection, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={newElection.description}
                    onChange={(e) => setNewElection({ ...newElection, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={newElection.startDate}
                    onChange={(e) => setNewElection({ ...newElection, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={newElection.endDate}
                    onChange={(e) => setNewElection({ ...newElection, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateElection(false)}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                  >
                    Create Election
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Candidate Modal */}
        {showAddCandidate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Add New Candidate</h3>
              <form onSubmit={handleAddCandidate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={newCandidate.name}
                    onChange={(e) => setNewCandidate({ ...newCandidate, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Party</label>
                  <input
                    type="text"
                    value={newCandidate.party}
                    onChange={(e) => setNewCandidate({ ...newCandidate, party: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Symbol (Emoji)</label>
                  <input
                    type="text"
                    value={newCandidate.symbol}
                    onChange={(e) => setNewCandidate({ ...newCandidate, symbol: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="🟢"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Aadhar ID</label>
                  <input
                    type="text"
                    value={newCandidate.aadharId}
                    onChange={(e) => setNewCandidate({ ...newCandidate, aadharId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="XXXX-XXXX-XXXX"
                    required
                  />
                </div>
                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddCandidate(false);
                      setSelectedElectionId('');
                    }}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                  >
                    Add Candidate
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;