import React, { useState, useEffect } from "react";
import { CheckCircle, LogOut } from "lucide-react";
import { Voter } from "../types/election";

interface VoteSuccessProps {
	currentVoter: Voter;
	onLogout: () => void;
}

export const VoteSuccess: React.FC<VoteSuccessProps> = ({ currentVoter, onLogout }) => {
	const [timeRemaining, setTimeRemaining] = useState(10);

	useEffect(() => {
		const timer = setInterval(() => {
			setTimeRemaining((prev) => {
				if (prev <= 1) {
					clearInterval(timer);
					return 0;
				}
				return prev - 1;
			});
		}, 1000);

		return () => clearInterval(timer);
	}, []);

	return (
		<div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
			<div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-4xl">
				{/* Success Message */}
				<div className="text-center mb-8">
					<div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
						<CheckCircle className="w-12 h-12 text-green-600" />
					</div>
					<h1 className="text-3xl font-bold text-gray-900 mb-2">Vote Submitted Successfully!</h1>
					<p className="text-gray-600 text-lg">Thank you, {currentVoter.fullName}, for participating in the SPE UNIBEN Chapter Elections.</p>
					<p className="text-sm text-gray-500 mt-2">Your vote has been securely recorded and will be counted in the final results.</p>
				</div>

				{/* Action Buttons */}
				<div className="flex justify-center mb-8">
					<button onClick={onLogout} className="flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
						<LogOut className="w-5 h-5 mr-2" />
						Logout {timeRemaining > 0 && `(${timeRemaining}s)`}
					</button>
				</div>

				{/* Footer */}
				<div className="mt-8 pt-6 border-t text-center">
					<p className="text-sm text-gray-500">SPE UNIBEN Chapter Elections • Secure & Transparent Voting</p>
				</div>
			</div>
		</div>
	);
};
