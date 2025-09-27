import React from "react";
import { Clock, LogOut } from "lucide-react";
import { Voter } from "../types/election";

interface VotingClosedProps {
	currentVoter: Voter;
	onLogout: () => void;
}

export const VotingClosed: React.FC<VotingClosedProps> = ({ currentVoter, onLogout }) => {
	const deadline = new Date("2025-09-27T11:30:00Z"); // September 27, 2025 at 11:30 AM GMT
	const now = new Date();
	const timeRemaining = deadline.getTime() - now.getTime();

	const formatTimeRemaining = () => {
		if (timeRemaining <= 0) {
			return "Voting has closed";
		}

		const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
		const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
		const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));

		if (days > 0) {
			return `${days} day${days !== 1 ? "s" : ""}, ${hours} hour${hours !== 1 ? "s" : ""} remaining`;
		} else if (hours > 0) {
			return `${hours} hour${hours !== 1 ? "s" : ""}, ${minutes} minute${minutes !== 1 ? "s" : ""} remaining`;
		} else {
			return `${minutes} minute${minutes !== 1 ? "s" : ""} remaining`;
		}
	};

	return (
		<div className="min-h-screen bg-gray-50 flex items-center justify-center">
			<div className="max-w-md w-full mx-4">
				<div className="bg-white rounded-xl shadow-lg p-8 text-center">
					<div className="mb-6">
						<div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
							<Clock className="w-8 h-8 text-red-600" />
						</div>
						<h1 className="text-2xl font-bold text-gray-900 mb-2">{timeRemaining <= 0 ? "Voting Has Closed" : "Voting Will Close Soon"}</h1>
						<p className="text-gray-600 mb-4">{timeRemaining <= 0 ? "The voting period for SPE UNIBEN Chapter Elections has ended." : "The voting period will end on September 27, 2025 at 11:30 AM GMT."}</p>
						<div className="bg-gray-100 rounded-lg p-4 mb-6">
							<p className="text-sm text-gray-600 mb-1">Time {timeRemaining <= 0 ? "ended" : "remaining"}:</p>
							<p className="text-lg font-semibold text-gray-900">{formatTimeRemaining()}</p>
						</div>
					</div>

					<div className="space-y-4">
						<div className="text-sm text-gray-600">
							<p className="mb-2">
								Welcome, <span className="font-medium">{currentVoter.fullName}</span>
							</p>
							{timeRemaining > 0 && <p>Please return before the deadline to cast your vote.</p>}
						</div>

						<button onClick={onLogout} className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
							<LogOut className="w-4 h-4 mr-2" />
							Logout
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};
