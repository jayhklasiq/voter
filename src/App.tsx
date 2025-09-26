import React from 'react';
import { LoginForm } from './components/LoginForm';
import { VotingBallot } from './components/VotingBallot';
import { VoteSuccess } from './components/VoteSuccess';
import { useElectionData } from './hooks/useElectionData';

function App() {
  const {
    positions,
    currentVoter,
    hasVoted,
    authenticateVoter,
    submitVotes,
    getResults,
    logout
  } = useElectionData();

  // Show login form if user is not authenticated
  if (!currentVoter) {
    return <LoginForm onLogin={authenticateVoter} />;
  }

  // Show success page if user has already voted
  if (hasVoted) {
    return (
      <VoteSuccess
        currentVoter={currentVoter}
        results={getResults()}
        onLogout={logout}
      />
    );
  }

  // Show voting ballot
  return (
    <VotingBallot
      positions={positions}
      currentVoter={currentVoter}
      onSubmitVotes={submitVotes}
      onLogout={logout}
    />
  );
}

export default App;