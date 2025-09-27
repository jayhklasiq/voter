import { useState, useEffect } from 'react';
import { Position, Voter, Vote, VoteResults, Candidate } from '../types/election';
import { voteService } from '../services/voteService';
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

    // Load votes and check vote status
    const loadVotesAndCheckStatus = async () => {
      try {
        const votesData = await voteService.getVotes();
        setVotes(votesData);

        // Check if current voter has voted
        const currentVoterEmail = localStorage.getItem('current-voter-email');
        if (currentVoterEmail) {
          const voterHasVoted = await voteService.checkVoteStatus(currentVoterEmail);
          setHasVoted(voterHasVoted);
        }
      } catch (error) {
        // Silently handle error
      }
    };

    loadVotesAndCheckStatus();
  }, []);

  const checkEmailExists = (email: string): boolean => {
    return voters.some(v => 
      v.email.toLowerCase() === email.toLowerCase()
    );
  };

	const authenticateVoter = async (email: string): Promise<boolean> => {
		const voter = voters.find(v =>
			v.email.toLowerCase() === email.toLowerCase()
		);

		if (voter) {
			setCurrentVoter(voter);
			localStorage.setItem('current-voter-email', voter.email);

			// Check if this voter has already voted
			try {
				const voterHasVoted = await voteService.checkVoteStatus(voter.email);
				setHasVoted(voterHasVoted);
			} catch (error) {
				// Fallback to local check
				const voterHasVoted = votes.some(vote => vote.voterEmail === voter.email);
				setHasVoted(voterHasVoted);
			}

			return true;
		}
		return false;
	};

	const checkAdminSession = (): boolean => {
		try {
			const adminSession = localStorage.getItem('admin-session');
			if (!adminSession) return false;

			const sessionData = JSON.parse(adminSession);
			const now = Date.now();
			const sessionExpiry = sessionData.expiresAt;

			// Check if session is still valid (24 hours)
			if (now < sessionExpiry) {
				// Session is still valid, restore admin user
				const adminVoter = voters.find(v => v.email.toLowerCase() === sessionData.email.toLowerCase());
				if (adminVoter) {
					setCurrentVoter(adminVoter);
					return true;
				}
			} else {
				// Session expired, clear it
				localStorage.removeItem('admin-session');
			}
		} catch (error) {
			localStorage.removeItem('admin-session');
		}
		return false;
	};

	const createAdminSession = (email: string): void => {
		const sessionData = {
			email: email,
			expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours from now
		};
		localStorage.setItem('admin-session', JSON.stringify(sessionData));
	};

  const submitVotes = async (selectedVotes: Record<string, string>): Promise<boolean> => {
    if (!currentVoter || hasVoted) return false;

    const newVotes: Vote[] = Object.entries(selectedVotes).map(([position, candidateEmail]) => ({
      position,
      candidateEmail,
      voterEmail: currentVoter.email,
      timestamp: new Date().toISOString()
    }));

    try {
      const result = await voteService.submitVotes(newVotes, currentVoter.email);
      
      if (result.success) {
        // Update local state
        const updatedVotes = [...votes, ...newVotes];
        setVotes(updatedVotes);
        setHasVoted(true);
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
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
    localStorage.removeItem('admin-session');
  };

  return {
    positions,
    voters,
    votes,
    currentVoter,
    hasVoted,
    checkEmailExists,
    authenticateVoter,
    submitVotes,
    getResults,
    logout,
    checkAdminSession,
    createAdminSession
  };
};