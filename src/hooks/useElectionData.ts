import { useState, useEffect } from 'react';
import { Position, Voter, Vote, VoteResults, Candidate } from '../types/election';
import candidatesData from '../../data/candidate.json';
import votersData from '../../data/voters.json';

export const useElectionData = () => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [voters, setVoters] = useState<Voter[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [currentVoter, setCurrentVoter] = useState<Voter | null>(null);
  const [hasVoted, setHasVoted] = useState<boolean>(false);

  useEffect(() => {
    // Load positions and candidates
    const positionsList = Object.entries(candidatesData.positions).map(([name, candidates]) => ({
      name,
      candidates: candidates as Candidate[]
    }));
    setPositions(positionsList);

    // Load voters
    setVoters(votersData as Voter[]);

    // Load existing votes from localStorage
    const savedVotes = localStorage.getItem('spe-votes');
    if (savedVotes) {
      setVotes(JSON.parse(savedVotes));
    }

    // Check if current voter has voted
    const currentVoterEmail = localStorage.getItem('current-voter-email');
    if (currentVoterEmail && savedVotes) {
      const existingVotes = JSON.parse(savedVotes);
      const voterHasVoted = existingVotes.some((vote: Vote) => vote.voterEmail === currentVoterEmail);
      setHasVoted(voterHasVoted);
    }
  }, []);

  const authenticateVoter = (email: string, matriculationNumber: string): boolean => {
    const voter = voters.find(v => 
      v.email.toLowerCase() === email.toLowerCase() && 
      v.matriculationNumber.toLowerCase() === matriculationNumber.toLowerCase()
    );
    
    if (voter) {
      setCurrentVoter(voter);
      localStorage.setItem('current-voter-email', voter.email);
      
      // Check if this voter has already voted
      const voterHasVoted = votes.some(vote => vote.voterEmail === voter.email);
      setHasVoted(voterHasVoted);
      
      return true;
    }
    return false;
  };

  const submitVotes = (selectedVotes: Record<string, string>): boolean => {
    if (!currentVoter || hasVoted) return false;

    const newVotes: Vote[] = Object.entries(selectedVotes).map(([position, candidateEmail]) => ({
      position,
      candidateEmail,
      voterEmail: currentVoter.email,
      timestamp: new Date().toISOString()
    }));

    const updatedVotes = [...votes, ...newVotes];
    setVotes(updatedVotes);
    localStorage.setItem('spe-votes', JSON.stringify(updatedVotes));
    setHasVoted(true);
    
    return true;
  };

  const getResults = (): VoteResults[] => {
    return positions.map(position => {
      const positionVotes = votes.filter(vote => vote.position === position.name);
      const totalVotes = positionVotes.length;
      
      const candidateVotes = position.candidates.map(candidate => {
        const candidateVoteCount = positionVotes.filter(vote => vote.candidateEmail === candidate.email).length;
        return {
          candidate,
          votes: candidateVoteCount,
          percentage: totalVotes > 0 ? (candidateVoteCount / totalVotes) * 100 : 0
        };
      }).sort((a, b) => b.votes - a.votes);

      return {
        position: position.name,
        results: candidateVotes,
        totalVotes
      };
    });
  };

  const logout = () => {
    setCurrentVoter(null);
    setHasVoted(false);
    localStorage.removeItem('current-voter-email');
  };

  return {
    positions,
    voters,
    votes,
    currentVoter,
    hasVoted,
    authenticateVoter,
    submitVotes,
    getResults,
    logout
  };
};