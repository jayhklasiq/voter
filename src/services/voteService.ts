interface Vote {
  position: string;
  candidateEmail: string;
  voterEmail: string;
  timestamp: string;
}

interface VoteEntry {
  position: string;
  candidateEmail: string;
  id: string;
}

interface VoterVotes {
  voterEmail: string;
  timestamp: string;
  votes: VoteEntry[];
}

interface VoteSubmission {
  votes: Vote[];
  voterEmail: string;
}

interface VoteStats {
  totalVotes: number;
  lastUpdated: string;
  version: string;
}

class VoteService {
  private baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/votes';

  async checkBackendService(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  async submitVotes(votes: Vote[], voterEmail: string): Promise<{ success: boolean; message: string }> {
    try {
      const backendAvailable = await this.checkBackendService();

      if (backendAvailable) {
        // Submit via backend API
        const response = await fetch(this.baseUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            votes,
            voterEmail
          })
        });

        const result = await response.json();
        
        if (result.success) {
          return { success: true, message: result.message };
        } else {
          return { success: false, message: result.error };
        }
      } else {
        // Fallback to localStorage
        return this.submitVotesToLocalStorage(votes, voterEmail);
      }
    } catch (error) {
      // Fallback to localStorage
      return this.submitVotesToLocalStorage(votes, voterEmail);
    }
  }

  private submitVotesToLocalStorage(votes: Vote[], voterEmail: string): { success: boolean; message: string } {
    try {
      // Check if voter has already voted
      const existingVotes = this.getVotesFromLocalStorage();
      const hasVoted = existingVotes.some(voter => voter.voterEmail === voterEmail);
      
      if (hasVoted) {
        return { success: false, message: 'Voter has already cast a ballot' };
      }

      // Convert votes to new structure
      const voteEntries: VoteEntry[] = votes.map(vote => ({
        position: vote.position,
        candidateEmail: vote.candidateEmail,
        id: `vote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }));

      // Add new voter with their votes
      const newVoterVotes: VoterVotes = {
        voterEmail: voterEmail,
        timestamp: new Date().toISOString(),
        votes: voteEntries
      };

      const updatedVotes = [...existingVotes, newVoterVotes];
      localStorage.setItem('spe-votes', JSON.stringify(updatedVotes));
      
      return { success: true, message: 'Votes recorded successfully (localStorage)' };
    } catch (error) {
      console.error('❌ localStorage vote submission error:', error);
      return { success: false, message: 'Failed to record votes' };
    }
  }

  async checkVoteStatus(voterEmail: string): Promise<boolean> {
    try {
      const backendAvailable = await this.checkBackendService();

      if (backendAvailable) {
        // Check via backend API
        const response = await fetch(`${this.baseUrl}/check/${encodeURIComponent(voterEmail)}`);
        const result = await response.json();
        
        if (result.success) {
          return result.data.hasVoted;
        } else {
          return this.checkVoteStatusFromLocalStorage(voterEmail);
        }
      } else {
        // Fallback to localStorage
        return this.checkVoteStatusFromLocalStorage(voterEmail);
      }
    } catch (error) {
      return this.checkVoteStatusFromLocalStorage(voterEmail);
    }
  }

  private checkVoteStatusFromLocalStorage(voterEmail: string): boolean {
    const votes = this.getVotesFromLocalStorage();
    return votes.some(voter => voter.voterEmail === voterEmail);
  }

  async getVotes(): Promise<VoterVotes[]> {
    try {
      const backendAvailable = await this.checkBackendService();

      if (backendAvailable) {
        // Get from backend API
        const response = await fetch(this.baseUrl);
        const result = await response.json();
        
        if (result.success) {
          return result.data;
        } else {
          return this.getVotesFromLocalStorage();
        }
      } else {
        // Fallback to localStorage
        return this.getVotesFromLocalStorage();
      }
    } catch (error) {
      return this.getVotesFromLocalStorage();
    }
  }

  private getVotesFromLocalStorage(): VoterVotes[] {
    try {
      const savedVotes = localStorage.getItem('spe-votes');
      return savedVotes ? JSON.parse(savedVotes) : [];
    } catch (error) {
      return [];
    }
  }

  async getVoteStats(): Promise<VoteStats | null> {
    try {
      const backendAvailable = await this.checkBackendService();

      if (backendAvailable) {
        // Get from backend API
        const response = await fetch(`${this.baseUrl}/stats`);
        const result = await response.json();
        
        if (result.success) {
          return result.data;
        } else {
          return null;
        }
      } else {
        // Fallback to localStorage stats
        const votes = this.getVotesFromLocalStorage();
        const totalVoteEntries = votes.reduce((sum, voter) => sum + voter.votes.length, 0);
        return {
          totalVotes: totalVoteEntries,
          lastUpdated: new Date().toISOString(),
          version: "1.0.0"
        };
      }
    } catch (error) {
      return null;
    }
  }
}

export const voteService = new VoteService();
export type { Vote, VoteEntry, VoterVotes, VoteSubmission, VoteStats };
