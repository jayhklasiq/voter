import React, { useState } from "react";
import { Vote, CheckCircle, LogOut } from "lucide-react";
import { Position, Voter } from "../types/election";
import { CandidateCard } from "./CandidateCard";

interface VotingBallotProps {
	positions: Position[];
	currentVoter: Voter;
	onSubmitVotes: (votes: Record<string, string>) => Promise<boolean>;
	onLogout: () => void;
}

export const VotingBallot: React.FC<VotingBallotProps> = ({ positions, currentVoter, onSubmitVotes, onLogout }) => {
	const [selectedVotes, setSelectedVotes] = useState<Record<string, string>>({});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [showConfirmation, setShowConfirmation] = useState(false);

	const handleCandidateSelect = (position: string, candidateEmail: string) => {
		setSelectedVotes((prev) => ({
			...prev,
			[position]: candidateEmail,
		}));
	};

	const handleSubmit = () => {
		// Check if all positions have been voted on
		const activePositions = positions.filter((position) => position.candidates.length > 0);
		const votedPositions = Object.keys(selectedVotes);
		const missingPositions = activePositions.filter((pos) => !votedPositions.includes(pos.name));

		if (votedPositions.length === 0) {
			alert("Please select at least one candidate before submitting your ballot.");
			return;
		}

		if (missingPositions.length > 0) {
			const missingPositionNames = missingPositions.map((pos) => pos.name).join(", ");
			alert(`Please vote on all positions before submitting. You still need to vote for: ${missingPositionNames}`);
			return;
		}

		setShowConfirmation(true);
	};

	const confirmSubmit = async () => {
		setIsSubmitting(true);
		const success = await onSubmitVotes(selectedVotes);

		if (success) {
			alert("Your votes have been successfully recorded!");
		} else {
			alert("There was an error submitting your votes. Please try again.");
		}

		setIsSubmitting(false);
		setShowConfirmation(false);
	};

	const activePositions = positions.filter((position) => position.candidates.length > 0);
	const votedPositions = Object.keys(selectedVotes);
	const allPositionsVoted = votedPositions.length === activePositions.length;
	const progressPercentage = activePositions.length > 0 ? (votedPositions.length / activePositions.length) * 100 : 0;

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Header */}
			<div className="bg-white shadow-sm border-b">
				<div className="max-w-6xl mx-auto px-4 py-4">
					<div className="flex justify-between items-center">
						<div>
							<h1 className="text-2xl font-bold text-gray-900">SPE UNIBEN Chapter Elections</h1>
							<p className="text-gray-600">Welcome, {currentVoter.fullName}</p>
						</div>
						<button onClick={onLogout} className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors">
							<LogOut className="w-5 h-5 mr-2" />
							Logout
						</button>
					</div>
				</div>
			</div>

			{/* Voting Instructions */}
			<div className="max-w-6xl mx-auto px-4 py-6">
				<div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
					<h2 className="text-lg font-semibold text-blue-900 mb-2">Voting Instructions</h2>
					<ul className="text-blue-800 text-sm space-y-1">
						<li>• Select one candidate per position by clicking on their card</li>
						<li>• You can vote for multiple positions or skip positions you don't want to vote for</li>
						<li>• Review your selections carefully before submitting</li>
						<li>• Once submitted, your votes cannot be changed</li>
					</ul>
				</div>

				{/* Positions */}
				<div className="space-y-10">
					{activePositions.map((position) => {
						const isVoted = selectedVotes[position.name];
						return (
							<div key={position.name} className={`bg-white rounded-xl shadow-lg p-6 border-2 transition-all duration-200 ${isVoted ? "border-green-200 bg-green-50" : "border-gray-200 hover:border-blue-200"}`}>
								<div className="flex items-center justify-between mb-6 border-b pb-3">
									<h2 className="text-2xl font-bold text-gray-900">{position.name}</h2>
									<div className={`px-3 py-1 rounded-full text-sm font-medium ${isVoted ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{isVoted ? "✓ Voted" : "Pending"}</div>
								</div>

								<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
									{position.candidates.map((candidate) => (
										<CandidateCard key={candidate.email} candidate={candidate} position={position.name} isSelected={selectedVotes[position.name] === candidate.email} onSelect={() => handleCandidateSelect(position.name, candidate.email)} />
									))}
								</div>

								{selectedVotes[position.name] && (
									<div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
										<div className="flex items-center text-green-700">
											<CheckCircle className="w-5 h-5 mr-2" />
											<span className="font-medium">Selected: {position.candidates.find((c) => c.email === selectedVotes[position.name])?.full_name}</span>
										</div>
									</div>
								)}
							</div>
						);
					})}
				</div>

				{/* Submit Section */}
				<div className="mt-10 bg-white rounded-xl shadow-lg p-6">
					<div className="text-center">
						<h3 className="text-xl font-semibold text-gray-900 mb-4">{allPositionsVoted ? "Ready to Submit Your Ballot?" : "Complete Your Ballot"}</h3>

						{/* Progress Bar */}
						<div className="mb-6">
							<div className="flex justify-between text-sm text-gray-600 mb-2">
								<span>Progress</span>
								<span>
									{votedPositions.length} of {activePositions.length} positions voted
								</span>
							</div>
							<div className="w-full bg-gray-200 rounded-full h-3">
								<div className={`h-3 rounded-full transition-all duration-300 ${allPositionsVoted ? "bg-green-500" : "bg-blue-500"}`} style={{ width: `${progressPercentage}%` }}></div>
							</div>
						</div>

						<p className="text-gray-600 mb-6">{allPositionsVoted ? "✅ All positions completed! You can now submit your ballot." : `⚠️ Please vote on all ${activePositions.length} positions before submitting.`}</p>

						<div className="flex justify-center space-x-4">
							<button onClick={onLogout} className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
								Cancel & Logout
							</button>
							<button onClick={handleSubmit} disabled={isSubmitting || !allPositionsVoted} className={`px-8 py-3 rounded-lg transition-colors font-medium flex items-center ${allPositionsVoted ? "bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white" : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}>
								<Vote className="w-5 h-5 mr-2" />
								{allPositionsVoted ? "Submit Ballot" : "Complete All Positions First"}
							</button>
						</div>
					</div>
				</div>
			</div>

			{/* Confirmation Modal */}
			{showConfirmation && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
					<div className="bg-white rounded-xl p-6 max-w-md w-full">
						<h3 className="text-xl font-bold text-gray-900 mb-4">Confirm Your Vote</h3>
						<p className="text-gray-600 mb-6">Are you sure you want to submit your ballot? This action cannot be undone.</p>

						<div className="mb-6">
							<h4 className="font-semibold text-gray-900 mb-2">Your Selections:</h4>
							<div className="space-y-2">
								{Object.entries(selectedVotes).map(([position, candidateEmail]) => {
									const candidate = positions.find((p) => p.name === position)?.candidates.find((c) => c.email === candidateEmail);
									return (
										<div key={position} className="text-sm">
											<span className="font-medium">{position}:</span> {candidate?.full_name}
										</div>
									);
								})}
							</div>
						</div>

						<div className="flex space-x-4">
							<button onClick={() => setShowConfirmation(false)} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
								Review Ballot
							</button>
							<button onClick={confirmSubmit} disabled={isSubmitting} className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg transition-colors">
								{isSubmitting ? "Submitting..." : "Confirm & Submit"}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};
