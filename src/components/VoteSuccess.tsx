import React, { useState, useEffect } from 'react';
import { CheckCircle, BarChart3, LogOut } from 'lucide-react';
import { VoteResults, Voter } from '../types/election';

interface VoteSuccessProps {
  currentVoter: Voter;
  results: VoteResults[];
  onLogout: () => void;
}

export const VoteSuccess: React.FC<VoteSuccessProps> = ({
  currentVoter,
  results,
  onLogout
}) => {
  const [showResults, setShowResults] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const totalVotes = results.reduce((sum, result) => sum + result.totalVotes, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-4xl">
        {/* Success Message */}
        <div className="text-center mb-8">
          <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Vote Submitted Successfully!</h1>
          <p className="text-gray-600 text-lg">
            Thank you, {currentVoter.fullName}, for participating in the SPE UNIBEN Chapter Elections.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Your vote has been securely recorded and will be counted in the final results.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4 mb-8">
          <button
            onClick={() => setShowResults(!showResults)}
            className="flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
          >
            <BarChart3 className="w-5 h-5 mr-2" />
            {showResults ? 'Hide Results' : 'View Current Results'}
          </button>
          <button
            onClick={onLogout}
            className="flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Logout {timeRemaining > 0 && `(${timeRemaining}s)`}
          </button>
        </div>

        {/* Results Section */}
        {showResults && (
          <div className="border-t pt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Current Election Results
            </h2>
            <p className="text-center text-gray-600 mb-8">
              Total votes cast: <span className="font-semibold">{totalVotes}</span>
            </p>

            <div className="space-y-8">
              {results
                .filter(result => result.totalVotes > 0)
                .map((result) => (
                  <div key={result.position} className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      {result.position}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Total votes: {result.totalVotes}
                    </p>

                    <div className="space-y-3">
                      {result.results.map((candidateResult, index) => (
                        <div
                          key={candidateResult.candidate.email}
                          className={`flex items-center justify-between p-3 rounded-lg ${
                            index === 0 && candidateResult.votes > 0
                              ? 'bg-green-100 border border-green-300'
                              : 'bg-white border border-gray-200'
                          }`}
                        >
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">
                              {candidateResult.candidate.full_name}
                            </p>
                            <p className="text-sm text-gray-600">
                              Level {candidateResult.candidate.level}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-gray-900">
                              {candidateResult.votes} votes
                            </p>
                            <p className="text-sm text-gray-600">
                              {candidateResult.percentage.toFixed(1)}%
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

              {results.filter(result => result.totalVotes === 0).length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-medium text-yellow-800 mb-2">Positions with No Votes Yet:</h4>
                  <ul className="list-disc list-inside text-sm text-yellow-700">
                    {results
                      .filter(result => result.totalVotes === 0)
                      .map(result => (
                        <li key={result.position}>{result.position}</li>
                      ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-6 border-t text-center">
          <p className="text-sm text-gray-500">
            SPE UNIBEN Chapter Elections • Secure & Transparent Voting
          </p>
        </div>
      </div>
    </div>
  );
};