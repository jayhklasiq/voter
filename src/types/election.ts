export interface Candidate {
  timestamp: string;
  email: string;
  photo: string;
  full_name: string;
  level: string;
  original_position?: string;
  reason: string;
  linkedin: string;
}

export interface Position {
  name: string;
  candidates: Candidate[];
}

export interface Voter {
  email: string;
  fullName: string;
  matriculationNumber: string;
  jambRegistrationNumber: string;
  speNumber: string;
}

export interface OTPData {
  email: string;
  otp: string;
  expiresAt: number;
}

export interface Vote {
  position: string;
  candidateEmail: string;
  voterEmail: string;
  timestamp: string;
}

export interface VoteEntry {
  position: string;
  candidateEmail: string;
  id: string;
}

export interface VoterVotes {
  voterEmail: string;
  timestamp: string;
  votes: VoteEntry[];
}

export interface VoteResults {
  position: string;
  results: Array<{
    candidate: Candidate;
    votes: number;
    percentage: number;
  }>;
  totalVotes: number;
}