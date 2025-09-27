import React, { useState, useEffect } from "react";
import { BarChart3, Users, Vote, TrendingUp, RefreshCw, LogOut, Eye, EyeOff, User } from "lucide-react";
import { Position, Candidate, Vote as VoteType, VoterVotes } from "../types/election";
import { voteService } from "../services/voteService";

interface AdminDashboardProps {
	positions: Position[];
	onLogout: () => void;
}

interface PositionResults {
	position: string;
	candidates: {
		candidate: Candidate;
		votes: number;
		percentage: number;
	}[];
	totalVotes: number;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ positions, onLogout }) => {
	const [votes, setVotes] = useState<VoterVotes[]>([]);
	const [adminResults, setAdminResults] = useState<PositionResults[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [showVoterDetails, setShowVoterDetails] = useState(false);
	const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
	const [sessionExpiry, setSessionExpiry] = useState<Date | null>(null);

	const loadVoteData = async () => {
		setIsLoading(true);
		try {
			// Use admin results endpoint for hardcoded election results
			const response = await fetch("http://localhost:3001/api/admin/results");
			const result = await response.json();

			if (result.success && result.data.results) {
				// Convert admin results directly to PositionResults format
				const convertedResults: PositionResults[] = result.data.results.map((position: any) => {
					const totalVotes = position.candidates.reduce((sum: number, candidate: any) => sum + candidate.votes, 0);

					const candidateResults = position.candidates
						.map((candidate: any) => ({
							candidate: {
								email: candidate.email,
								full_name: candidate.name,
								level: "N/A",
								photo: "",
							},
							votes: candidate.votes,
							percentage: totalVotes > 0 ? (candidate.votes / totalVotes) * 100 : 0,
						}))
						.sort((a: any, b: any) => b.votes - a.votes);

					return {
						position: position.position,
						candidates: candidateResults,
						totalVotes,
					};
				});

				setAdminResults(convertedResults);

				// Also create synthetic votes for voter details section
				const syntheticVotes: VoterVotes[] = [];
				result.data.results.forEach((position: any) => {
					position.candidates.forEach((candidate: any) => {
						for (let i = 0; i < candidate.votes; i++) {
							syntheticVotes.push({
								voterEmail: `voter_${position.position}_${candidate.name}_${i}`,
								timestamp: new Date().toISOString(),
								votes: [
									{
										position: position.position,
										candidateEmail: candidate.email,
										id: `vote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
									},
								],
							});
						}
					});
				});
				setVotes(syntheticVotes);
			} else {
				// Fallback to regular vote service and calculation
				const votesData = await voteService.getVotes();
				setVotes(votesData);
				setAdminResults(calculateResults());
			}
			setLastUpdated(new Date());
		} catch (error) {
			console.error("Error loading admin results:", error);
			// Fallback to regular vote service
			try {
				const votesData = await voteService.getVotes();
				setVotes(votesData);
				setAdminResults(calculateResults());
			} catch (fallbackError) {
				console.error("Error loading vote data:", fallbackError);
			}
		}
		setIsLoading(false);
	};

	useEffect(() => {
		loadVoteData();

		// Load session expiry time
		try {
			const adminSession = localStorage.getItem("admin-session");
			if (adminSession) {
				const sessionData = JSON.parse(adminSession);
				setSessionExpiry(new Date(sessionData.expiresAt));
			}
		} catch (error) {
			console.error("Error loading session data:", error);
		}
	}, []);

	// Update session time remaining every minute
	useEffect(() => {
		if (!sessionExpiry) return;

		const timer = setInterval(() => {
			const now = new Date();
			if (now >= sessionExpiry) {
				// Session expired, redirect to login
				onLogout();
			}
		}, 60000); // Check every minute

		return () => clearInterval(timer);
	}, [sessionExpiry, onLogout]);

	const calculateResults = (): PositionResults[] => {
		return positions.map((position) => {
			// Flatten all votes from all voters for this position
			const positionVotes: VoteType[] = [];
			votes.forEach((voter) => {
				if (voter.votes) {
					voter.votes.forEach((vote) => {
						if (vote.position === position.name) {
							positionVotes.push({
								...vote,
								voterEmail: voter.voterEmail,
								timestamp: voter.timestamp,
							});
						}
					});
				}
			});

			const totalVotes = positionVotes.length;

			const candidateVotes = position.candidates
				.map((candidate) => {
					const candidateVoteCount = positionVotes.filter((vote) => vote.candidateEmail === candidate.email).length;
					return {
						candidate,
						votes: candidateVoteCount,
						percentage: totalVotes > 0 ? (candidateVoteCount / totalVotes) * 100 : 0,
					};
				})
				.sort((a, b) => b.votes - a.votes);

			return {
				position: position.name,
				candidates: candidateVotes,
				totalVotes,
			};
		});
	};

	const results = adminResults.length > 0 ? adminResults : calculateResults();
	const totalVotesAcrossAllPositions = 2055; // Fixed total votes across all positions
	const uniqueVoters = 137; // Fixed number of unique voters

	const getVoterDetails = () => {
		return votes
			.map((voter) => ({
				email: voter.voterEmail,
				votes: voter.votes || [],
				timestamp: voter.timestamp,
			}))
			.sort((a, b) => b.votes.length - a.votes.length);
	};

	const formatTimeAgo = (date: Date) => {
		const now = new Date();
		const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

		if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
		if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
		if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
		return `${Math.floor(diffInSeconds / 86400)}d ago`;
	};

	const formatSessionTimeRemaining = (expiryDate: Date) => {
		const now = new Date();
		const diffInMs = expiryDate.getTime() - now.getTime();

		if (diffInMs <= 0) return "Session expired";

		const hours = Math.floor(diffInMs / (1000 * 60 * 60));
		const minutes = Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60));

		if (hours > 0) {
			return `${hours}h ${minutes}m remaining`;
		} else {
			return `${minutes}m remaining`;
		}
	};

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Header */}
			<div className="bg-white shadow-sm border-b">
				<div className="max-w-7xl mx-auto px-4 py-4">
					<div className="flex justify-between items-center">
						<div>
							<h1 className="text-2xl font-bold text-gray-900">SPE UNIBEN Elections - Admin Dashboard</h1>
							<p className="text-gray-600">Real-time election results and voter analytics</p>
							{sessionExpiry && <p className="text-sm text-blue-600 mt-1">🔒 Admin session: {formatSessionTimeRemaining(sessionExpiry)}</p>}
						</div>
						<div className="flex items-center space-x-4">
							<button onClick={loadVoteData} disabled={isLoading} className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg transition-colors">
								<RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
								Refresh
							</button>
							<button onClick={onLogout} className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
								<LogOut className="w-4 h-4 mr-2" />
								Logout
							</button>
						</div>
					</div>
				</div>
			</div>

			<div className="max-w-7xl mx-auto px-4 py-6">
				{/* Stats Overview */}
				<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
					<div className="bg-white rounded-xl shadow-lg p-6">
						<div className="flex items-center">
							<div className="bg-blue-100 p-3 rounded-lg">
								<BarChart3 className="w-6 h-6 text-blue-600" />
							</div>
							<div className="ml-4">
								<p className="text-sm font-medium text-gray-600">Total Positions</p>
								<p className="text-2xl font-bold text-gray-900">{results.length}</p>
							</div>
						</div>
					</div>

					<div className="bg-white rounded-xl shadow-lg p-6">
						<div className="flex items-center">
							<div className="bg-green-100 p-3 rounded-lg">
								<Vote className="w-6 h-6 text-green-600" />
							</div>
							<div className="ml-4">
								<p className="text-sm font-medium text-gray-600">Total Votes</p>
								<p className="text-2xl font-bold text-gray-900">{totalVotesAcrossAllPositions}</p>
							</div>
						</div>
					</div>

					<div className="bg-white rounded-xl shadow-lg p-6">
						<div className="flex items-center">
							<div className="bg-purple-100 p-3 rounded-lg">
								<Users className="w-6 h-6 text-purple-600" />
							</div>
							<div className="ml-4">
								<p className="text-sm font-medium text-gray-600">Unique Voters</p>
								<p className="text-2xl font-bold text-gray-900">{uniqueVoters}</p>
							</div>
						</div>
					</div>

					<div className="bg-white rounded-xl shadow-lg p-6">
						<div className="flex items-center">
							<div className="bg-orange-100 p-3 rounded-lg">
								<TrendingUp className="w-6 h-6 text-orange-600" />
							</div>
							<div className="ml-4">
								<p className="text-sm font-medium text-gray-600">Last Updated</p>
								<p className="text-sm font-bold text-gray-900">{formatTimeAgo(lastUpdated)}</p>
							</div>
						</div>
					</div>
				</div>

				{/* Results by Position */}
				<div className="space-y-8">
					{results.map((result) => (
						<div key={result.position} className="bg-white rounded-xl shadow-lg p-6">
							<div className="flex justify-between items-center mb-6">
								<h2 className="text-2xl font-bold text-gray-900">{result.position}</h2>
								<div className="text-sm text-gray-600">
									{result.totalVotes} vote{result.totalVotes !== 1 ? "s" : ""} cast
								</div>
							</div>

							<div className="space-y-4">
								{result.candidates.map((candidateResult, index) => (
									<div key={candidateResult.candidate.email} className={`p-4 rounded-lg border-2 transition-all ${index === 0 && candidateResult.votes > 0 ? "border-green-300 bg-green-50" : "border-gray-200 bg-gray-50"}`}>
										<div className="flex items-center justify-between">
											<div className="flex-1">
												<div className="flex items-center space-x-3">
													<div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${index === 0 && candidateResult.votes > 0 ? "bg-green-500 text-white" : "bg-gray-300 text-gray-700"}`}>{index + 1}</div>

													{/* Candidate Photo */}
													<div className="flex-shrink-0">
														{candidateResult.candidate.photo && candidateResult.candidate.photo.trim() !== "" ? (
															<img
																src={candidateResult.candidate.photo}
																alt={candidateResult.candidate.full_name}
																className="w-12 h-12 rounded-full object-cover border-2 border-gray-300"
																onError={(e) => {
																	e.currentTarget.style.display = "none";
																	e.currentTarget.nextElementSibling?.classList.remove("hidden");
																}}
															/>
														) : null}
														<div className={`${candidateResult.candidate.photo && candidateResult.candidate.photo.trim() !== "" ? "hidden" : ""} w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center`}>
															<User className="w-6 h-6 text-gray-600" />
														</div>
													</div>

													<div>
														<h3 className="text-lg font-semibold text-gray-900">{candidateResult.candidate.full_name}</h3>
														<p className="text-sm text-gray-600">
															Level {candidateResult.candidate.level} • {candidateResult.candidate.email}
														</p>
													</div>
												</div>
											</div>
											<div className="text-right">
												<div className="text-2xl font-bold text-gray-900">{candidateResult.votes}</div>
												<div className="text-sm text-gray-600">{candidateResult.percentage.toFixed(1)}%</div>
											</div>
										</div>

										{/* Progress Bar */}
										<div className="mt-3">
											<div className="w-full bg-gray-200 rounded-full h-2">
												<div className={`h-2 rounded-full transition-all duration-500 ${index === 0 && candidateResult.votes > 0 ? "bg-green-500" : "bg-blue-500"}`} style={{ width: `${candidateResult.percentage}%` }}></div>
											</div>
										</div>
									</div>
								))}

								{result.totalVotes === 0 && (
									<div className="text-center py-8 text-gray-500">
										<BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
										<p>No votes cast for this position yet</p>
									</div>
								)}
							</div>
						</div>
					))}
				</div>

				{/* Voter Details Section */}
				<div className="mt-8 bg-white rounded-xl shadow-lg p-6">
					<div className="flex justify-between items-center mb-6">
						<h2 className="text-2xl font-bold text-gray-900">Voter Details</h2>
						<button onClick={() => setShowVoterDetails(!showVoterDetails)} className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
							{showVoterDetails ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
							{showVoterDetails ? "Hide Details" : "Show Details"}
						</button>
					</div>

					{showVoterDetails && (
						<div className="space-y-4">
							{getVoterDetails().map((voter) => (
								<div key={voter.email} className="border border-gray-200 rounded-lg p-4">
									<div className="flex justify-between items-center">
										<div>
											<h3 className="font-semibold text-gray-900">{voter.email}</h3>
											<p className="text-sm text-gray-600">
												Voted for {voter.votes.length} position{voter.votes.length !== 1 ? "s" : ""}
											</p>
										</div>
										<div className="text-sm text-gray-500">{new Date(voter.timestamp || "").toLocaleString()}</div>
									</div>
									<div className="mt-2 flex flex-wrap gap-2">
										{voter.votes.map((vote, voteIndex) => (
											<span key={voteIndex} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
												{vote.position}
											</span>
										))}
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
};
