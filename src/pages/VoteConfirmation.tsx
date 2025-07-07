import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { CheckCircle, Download, Home } from 'lucide-react';

const VoteConfirmation: React.FC = () => {
  const location = useLocation();
  const { candidateName, electionTitle } = location.state || {};

  const handleDownloadReceipt = () => {
    // Simulate download
    const receiptData = {
      timestamp: new Date().toISOString(),
      election: electionTitle,
      candidate: candidateName,
      voteId: `VOTE-${Date.now()}`,
    };
    
    const blob = new Blob([JSON.stringify(receiptData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vote-receipt.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-4">Vote Cast Successfully!</h2>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">Vote Details</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Election:</strong> {electionTitle}</p>
              <p><strong>Candidate:</strong> {candidateName}</p>
              <p><strong>Vote ID:</strong> VOTE-{Date.now()}</p>
              <p><strong>Timestamp:</strong> {new Date().toLocaleString()}</p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>Thank you for participating in democracy!</strong><br />
              Your vote has been securely recorded and will be counted in the final results.
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleDownloadReceipt}
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Download className="h-5 w-5 mr-2" />
              Download Vote Receipt
            </button>

            <Link
              to="/results"
              className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              View Results
            </Link>

            <Link
              to="/"
              className="w-full flex items-center justify-center px-4 py-3 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <Home className="h-5 w-5 mr-2" />
              Return Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoteConfirmation;