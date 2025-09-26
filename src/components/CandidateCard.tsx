import React from 'react';
import { ExternalLink, User } from 'lucide-react';
import { Candidate } from '../types/election';

interface CandidateCardProps {
  candidate: Candidate;
  position: string;
  isSelected: boolean;
  onSelect: () => void;
}

export const CandidateCard: React.FC<CandidateCardProps> = ({
  candidate,
  position,
  isSelected,
  onSelect
}) => {
  const hasPhoto = candidate.photo && candidate.photo.trim() !== '';
  const hasLinkedIn = candidate.linkedin && candidate.linkedin.trim() !== '' && candidate.linkedin !== 'Account Name :Phronesis Oghenerukevwe Umukoro,cant access my account link for now';

  return (
    <div
      className={`bg-white rounded-xl shadow-lg p-6 cursor-pointer transition-all duration-300 border-2 ${
        isSelected
          ? 'border-blue-500 bg-blue-50 transform scale-105'
          : 'border-gray-200 hover:border-blue-300 hover:shadow-xl'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          {hasPhoto ? (
            <img
              src={candidate.photo}
              alt={candidate.full_name}
              className="w-16 h-16 rounded-full object-cover border-2 border-gray-300"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <div className={`${hasPhoto ? 'hidden' : ''} w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center`}>
            <User className="w-8 h-8 text-gray-600" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {candidate.full_name}
          </h3>
          <p className="text-sm text-blue-600 font-medium mb-2">
            Level {candidate.level}
          </p>
          
          {candidate.reason && (
            <p className="text-gray-700 text-sm leading-relaxed mb-3">
              {candidate.reason}
            </p>
          )}

          {hasLinkedIn && (
            <a
              href={candidate.linkedin.startsWith('http') ? candidate.linkedin : `https://linkedin.com/in/${candidate.linkedin}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="w-4 h-4 mr-1" />
              LinkedIn Profile
            </a>
          )}
        </div>

        <div className="flex-shrink-0">
          <div
            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
              isSelected
                ? 'border-blue-500 bg-blue-500'
                : 'border-gray-300 bg-white'
            }`}
          >
            {isSelected && (
              <div className="w-3 h-3 rounded-full bg-white"></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};