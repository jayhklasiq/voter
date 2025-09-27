import React from "react";
import { LoginForm } from "./components/LoginForm";
import { VotingBallot } from "./components/VotingBallot";
import { VoteSuccess } from "./components/VoteSuccess";
import { AdminDashboard } from "./components/AdminDashboard";
import { VotingClosed } from "./components/VotingClosed";
import { useElectionData } from "./hooks/useElectionData";

function App() {
	const { positions, currentVoter, hasVoted, checkEmailExists, authenticateVoter, submitVotes, getResults, logout, checkAdminSession, createAdminSession } = useElectionData();
	const [isInitialized, setIsInitialized] = React.useState(false);

	// Admin email list (in production, this should be in a secure config)
	const adminEmails = ["favour.thomas@eng.uniben.edu", "promise.owie@eng.uniben.edu", "osemudiamenmonday2@gmail.com", "klasik@byui.edu"];

	const isAdmin = currentVoter && adminEmails.includes(currentVoter.email.toLowerCase());

	// Voting deadline: September 27, 2025 at 11:30 AM GMT
	const votingDeadline = new Date("2025-09-27T11:30:00Z");
	const isVotingClosed = new Date() > votingDeadline;

	// Check for existing admin session on app load
	React.useEffect(() => {
		const hasValidAdminSession = checkAdminSession();
		setIsInitialized(true);
	}, [checkAdminSession]);

	// Show loading while checking for admin sessions
	if (!isInitialized) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
					<p className="text-gray-600">Loading...</p>
				</div>
			</div>
		);
	}

	// Enhanced authentication function that creates admin sessions
	const handleAuthentication = async (email: string): Promise<boolean> => {
		const success = await authenticateVoter(email);
		if (success && adminEmails.includes(email.toLowerCase())) {
			createAdminSession(email);
		}
		return success;
	};

	// Show login form if user is not authenticated
	if (!currentVoter) {
		return <LoginForm onLogin={handleAuthentication} onCheckEmail={checkEmailExists} />;
	}

	// Show admin dashboard if user is admin (admins don't vote, they just view results)
	if (isAdmin) {
		return <AdminDashboard positions={positions} onLogout={logout} />;
	}

	// Show voting closed page if voting deadline has passed
	if (isVotingClosed) {
		return <VotingClosed currentVoter={currentVoter} onLogout={logout} />;
	}

	// Show success page if user has already voted
	if (hasVoted) {
		return <VoteSuccess currentVoter={currentVoter} onLogout={logout} />;
	}

	// Show voting ballot
	return <VotingBallot positions={positions} currentVoter={currentVoter} onSubmitVotes={submitVotes} onLogout={logout} />;
}

export default App;
