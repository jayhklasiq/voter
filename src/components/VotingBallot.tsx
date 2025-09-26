import React, { useState } from 'react';
import { Vote, CheckCircle, LogOut } from 'lucide-react';
import { Position, Voter } from '../types/election';
import { CandidateCard } from './CandidateCard';

interface VotingBallotProps {
  positions: Position[];
  currentVoter: Voter;
  onSubmitVotes: (votes: Record<string, string>) => boolean;
  onLogout: () => void;
}

export const VotingBallot: React.FC<VotingBallotProps> = ({
  positions,
  currentVoter,
  onSubmitVotes,
  onLogout
}) => {
  const [selectedVotes, setSelectedVotes] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleCandidateSelect = (position: string, candidateEmail: string) => {
    setSelectedVotes(prev => ({
      ...prev,
      [position]: candidateEmail
    }));
  };

  const handleSubmit = () => {
    if (Object.keys(selectedVotes).length === 0) {
      alert('Please select at least one candidate before submitting your ballot.');
      return;
    }
    setShowConfirmation(true);
  };

  const confirmSubmit = async () => {
    setIsSubmitting(true);
    const success = onSubmitVotes(selectedVotes);
    
    if (success) {
      alert('Your votes have been successfully recorded!');
    } else {
      alert('There was an error submitting your votes. Please try again.');
    }
    
    setIsSubmitting(false);
    setShowConfirmation(false);
  };

  const activePositions = positions.filter(position => position.candidates.length > 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">SPE UNIBEN Chapter Elections</h1>
              <p className="text-gray-600">Welcome, {currentVoter.fullName}</p>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <LogOut className="w-5 h-5 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Voting Instructions */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <h2 className="text-lg font-semibold text-blue-900 mb-2">Voting Instructions</h2>
          <ul className="text-blue-800 text-sm space-y-1">
            <li>• Select one candidate per position by clicking on their card</li>
            <li>• You can vote for multiple positions or skip positions you don't want to vote for</li>
            <li>• Review your selections carefully before submitting</li>
            <li>• Once submitted, your votes cannot be changed</li>
          </ul>
        </div>

        {/* Positions */}
        <div className="space-y-10">
          {activePositions.map((position) => (
            <div key={position.name} className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-3">
                {position.name}
              </h2>
              
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
                {position.candidates.map((candidate) => (
                  <CandidateCard
                    key={candidate.email}
                    candidate={candidate}
                    position={position.name}
                    isSelected={selectedVotes[position.name] === candidate.email}
                    onSelect={() => handleCandidateSelect(position.name, candidate.email)}
                  />
                ))}
              </div>
              
              {selectedVotes[position.name] && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center text-green-700">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    <span className="font-medium">
                      Selected: {position.candidates.find(c => c.email === selectedVotes[position.name])?.full_name}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Submit Section */}
        <div className="mt-10 bg-white rounded-xl shadow-lg p-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Ready to Submit Your Ballot?</h3>
            <p className="text-gray-600 mb-6">
              You have selected candidates for {Object.keys(selectedVotes).length} out of {activePositions.length} positions.
            </p>
            
            <div className="flex justify-center space-x-4">
              <button
                onClick={onLogout}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel & Logout
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg transition-colors font-medium flex items-center"
              >
                <Vote className="w-5 h-5 mr-2" />
                Submit Ballot
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Confirm Your Vote</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to submit your ballot? This action cannot be undone.
            </p>
            
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-2">Your Selections:</h4>
              <div className="space-y-2">
                {Object.entries(selectedVotes).map(([position, candidateEmail]) => {
                  const candidate = positions
                    .find(p => p.name === position)
                    ?.candidates.find(c => c.email === candidateEmail);
                  return (
                    <div key={position} className="text-sm">
                      <span className="font-medium">{position}:</span> {candidate?.full_name}
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={() => setShowConfirmation(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Review Ballot
              </button>
              <button
                onClick={confirmSubmit}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg transition-colors"
              >
                {isSubmitting ? 'Submitting...' : 'Confirm & Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};