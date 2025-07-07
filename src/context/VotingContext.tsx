import React, { createContext, useContext, useState } from 'react';

interface Candidate {
  id: string;
  name: string;
  party: string;
  symbol: string;
  aadharId: string;
  image?: string;
}

interface Election {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'active' | 'completed';
  candidates: Candidate[];
}

interface Vote {
  id: string;
  voterId: string;
  candidateId: string;
  electionId: string;
  timestamp: string;
}

interface VotingContextType {
  elections: Election[];
  votes: Vote[];
  addElection: (election: Election) => void;
  addCandidate: (electionId: string, candidate: Candidate) => void;
  castVote: (vote: Omit<Vote, 'id' | 'timestamp'>) => void;
  getElectionResults: (electionId: string) => { [candidateId: string]: number };
}

const VotingContext = createContext<VotingContextType | undefined>(undefined);

export const useVoting = () => {
  const context = useContext(VotingContext);
  if (context === undefined) {
    throw new Error('useVoting must be used within a VotingProvider');
  }
  return context;
};

// Mock data for demonstration
const mockElections: Election[] = [
  {
    id: '1',
    title: 'Presidential Election 2024',
    description: 'Choose the next President of the Republic',
    startDate: '2024-01-15',
    endDate: '2024-01-16',
    status: 'active',
    candidates: [
      {
        id: '1',
        name: 'John Anderson',
        party: 'Democratic Party',
        symbol: '🔵',
        aadharId: '1234-5678-9012',
      },
      {
        id: '2',
        name: 'Sarah Wilson',
        party: 'Republican Party',
        symbol: '🔴',
        aadharId: '2345-6789-0123',
      },
      {
        id: '3',
        name: 'Michael Chen',
        party: 'Independent',
        symbol: '🟢',
        aadharId: '3456-7890-1234',
      },
    ],
  },
  {
    id: '2',
    title: 'Senate Election 2024',
    description: 'Select your state representatives',
    startDate: '2024-02-01',
    endDate: '2024-02-02',
    status: 'upcoming',
    candidates: [
      {
        id: '4',
        name: 'Robert Davis',
        party: 'Democratic Party',
        symbol: '🔵',
        aadharId: '4567-8901-2345',
      },
      {
        id: '5',
        name: 'Emily Johnson',
        party: 'Republican Party',
        symbol: '🔴',
        aadharId: '5678-9012-3456',
      },
    ],
  },
];

export const VotingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [elections, setElections] = useState<Election[]>(mockElections);
  const [votes, setVotes] = useState<Vote[]>([]);

  const addElection = (election: Election) => {
    setElections(prev => [...prev, election]);
  };

  const addCandidate = (electionId: string, candidate: Candidate) => {
    setElections(prev =>
      prev.map(election =>
        election.id === electionId
          ? { ...election, candidates: [...election.candidates, candidate] }
          : election
      )
    );
  };

  const castVote = (vote: Omit<Vote, 'id' | 'timestamp'>) => {
    const newVote: Vote = {
      ...vote,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    };
    setVotes(prev => [...prev, newVote]);
  };

  const getElectionResults = (electionId: string) => {
    const electionVotes = votes.filter(vote => vote.electionId === electionId);
    const results: { [candidateId: string]: number } = {};
    
    electionVotes.forEach(vote => {
      results[vote.candidateId] = (results[vote.candidateId] || 0) + 1;
    });
    
    return results;
  };

  const value = {
    elections,
    votes,
    addElection,
    addCandidate,
    castVote,
    getElectionResults,
  };

  return <VotingContext.Provider value={value}>{children}</VotingContext.Provider>;
};