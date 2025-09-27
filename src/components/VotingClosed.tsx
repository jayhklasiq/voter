import React from "react";
import { Clock, LogOut } from "lucide-react";
import { Voter } from "../types/election";

interface VotingClosedProps {
	currentVoter: Voter;
	onLogout: () => void;
}

export const VotingClosed: React.FC<VotingClosedProps> = ({ currentVoter, onLogout }) => {
	return (
		<div className="min-h-screen bg-gray-50 flex items-center justify-center">
			<div className="max-w-md w-full mx-4">
				<div className="bg-white rounded-xl shadow-lg p-8 text-center">
					<div className="mb-6">
						<div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
							<Clock className="w-8 h-8 text-red-600" />
						</div>
						<h1 className="text-2xl font-bold text-gray-900 mb-2">Voting Has Closed</h1>
						<p className="text-gray-600 mb-4">The voting period for SPE UNIBEN Chapter Elections has ended. No further votes can be cast.</p>
						<div className="bg-gray-100 rounded-lg p-4 mb-6">
							<p className="text-sm text-gray-600 mb-1">Status:</p>
							<p className="text-lg font-semibold text-red-600">Voting Permanently Closed</p>
						</div>
					</div>

					<div className="space-y-4">
						<div className="text-sm text-gray-600">
							<p className="mb-2">
								Welcome, <span className="font-medium">{currentVoter.fullName}</span>
							</p>
							<p>Thank you for your participation in the SPE UNIBEN Chapter Elections.</p>
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
