import React from 'react';
import { BarChart3, Download, Users, Trophy } from 'lucide-react';
import { useVoting } from '../context/VotingContext';

const Results: React.FC = () => {
  const { elections, getElectionResults } = useVoting();

  const handleDownloadResults = (electionId: string, format: string) => {
    const election = elections.find(e => e.id === electionId);
    const results = getElectionResults(electionId);
    
    if (!election) return;

    const data = election.candidates.map(candidate => ({
      name: candidate.name,
      party: candidate.party,
      votes: results[candidate.id] || 0,
    }));

    if (format === 'csv') {
      const csv = [
        'Candidate,Party,Votes',
        ...data.map(row => `${row.name},${row.party},${row.votes}`)
      ].join('\n');
      
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${election.title.replace(/\s+/g, '_')}_results.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      const json = JSON.stringify({ election: election.title, results: data }, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${election.title.replace(/\s+/g, '_')}_results.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Election Results</h1>
          <p className="text-xl text-gray-600">Live vote counts and final results</p>
        </div>

        <div className="space-y-8">
          {elections.map((election) => {
            const results = getElectionResults(election.id);
            const totalVotes = Object.values(results).reduce((sum, votes) => sum + votes, 0);
            const sortedCandidates = election.candidates
              .map(candidate => ({
                ...candidate,
                votes: results[candidate.id] || 0,
                percentage: totalVotes > 0 ? ((results[candidate.id] || 0) / totalVotes) * 100 : 0,
              }))
              .sort((a, b) => b.votes - a.votes);

            const winner = sortedCandidates[0];

            return (
              <div key={election.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-white">{election.title}</h2>
                      <p className="text-blue-100 mt-1">{election.description}</p>
                    </div>
                    <div className="text-right text-white">
                      <div className="flex items-center">
                        <Users className="h-5 w-5 mr-2" />
                        <span className="font-semibold">{totalVotes} Total Votes</span>
                      </div>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${
                        election.status === 'active' ? 'bg-green-500' : 
                        election.status === 'completed' ? 'bg-gray-500' : 'bg-blue-500'
                      }`}>
                        {election.status.charAt(0).toUpperCase() + election.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-8">
                  {totalVotes > 0 && winner.votes > 0 && (
                    <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-lg p-6 mb-8">
                      <div className="flex items-center">
                        <Trophy className="h-8 w-8 text-yellow-600 mr-3" />
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">Leading Candidate</h3>
                          <p className="text-gray-600">
                            <span className="font-semibold">{winner.name}</span> ({winner.party}) - 
                            <span className="font-bold text-yellow-600 ml-1">
                              {winner.votes} votes ({winner.percentage.toFixed(1)}%)
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4 mb-8">
                    {sortedCandidates.map((candidate, index) => (
                      <div key={candidate.id} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <span className="text-2xl">{candidate.symbol}</span>
                              <div>
                                <h4 className="font-semibold text-gray-900">{candidate.name}</h4>
                                <p className="text-sm text-gray-600">{candidate.party}</p>
                              </div>
                            </div>
                            {index === 0 && candidate.votes > 0 && (
                              <Trophy className="h-5 w-5 text-yellow-500" />
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-gray-900">{candidate.votes}</p>
                            <p className="text-sm text-gray-600">{candidate.percentage.toFixed(1)}%</p>
                          </div>
                        </div>
                        
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className={`h-3 rounded-full transition-all duration-500 ${
                              index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                              index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-600' :
                              index === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-600' :
                              'bg-gradient-to-r from-blue-400 to-blue-600'
                            }`}
                            style={{ width: `${candidate.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {totalVotes === 0 && (
                    <div className="text-center py-8">
                      <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Votes Cast Yet</h3>
                      <p className="text-gray-600">Results will appear here once voting begins.</p>
                    </div>
                  )}

                  {totalVotes > 0 && (
                    <div className="flex flex-wrap gap-4 justify-center">
                      <button
                        onClick={() => handleDownloadResults(election.id, 'csv')}
                        className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <Download className="h-5 w-5 mr-2" />
                        Download CSV
                      </button>
                      <button
                        onClick={() => handleDownloadResults(election.id, 'json')}
                        className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Download className="h-5 w-5 mr-2" />
                        Download JSON
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {elections.length === 0 && (
          <div className="text-center py-12">
            <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No Election Results Available</h3>
            <p className="text-gray-600">Results will be displayed here once elections are created.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Results;