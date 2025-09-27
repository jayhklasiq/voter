import React, { useState, useEffect } from "react";
import { LogIn, User, Mail, Clock, ArrowLeft } from "lucide-react";
import OTPService from "../services/otpService";

interface LoginFormProps {
	onLogin: (email: string) => Promise<boolean>;
	onCheckEmail: (email: string) => boolean;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLogin, onCheckEmail }) => {
	const [email, setEmail] = useState("");
	const [otp, setOtp] = useState("");
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [step, setStep] = useState<"email" | "otp">("email");
	const [otpSent, setOtpSent] = useState(false);
	const [remainingTime, setRemainingTime] = useState(0);
	const [successMessage, setSuccessMessage] = useState("");
	const [otpService] = useState(() => OTPService.getInstance());

	// Countdown timer for OTP
	useEffect(() => {
		let interval: NodeJS.Timeout;

		if (otpSent && remainingTime > 0) {
			interval = setInterval(() => {
				const timeLeft = otpService.getRemainingTime(email);
				setRemainingTime(timeLeft);

				if (timeLeft <= 0) {
					setOtpSent(false);
				}
			}, 1000);
		}

		return () => {
			if (interval) {
				clearInterval(interval);
			}
		};
	}, [otpSent, remainingTime, email, otpService]);

	const handleEmailSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setIsLoading(true);

		if (!email) {
			setError("Please enter your email address");
			setIsLoading(false);
			return;
		}

		// First check if email exists in voters list
		const emailExists = onCheckEmail(email.trim());
		if (!emailExists) {
			setError("❌ Email not found in voter registry. Please check your email address or contact the administrator if you believe this is an error.");
			setIsLoading(false);
			return;
		}

		try {
			const result = await otpService.sendOTP(email.trim());

			if (result.success) {
				setOtpSent(true);
				setStep("otp");
				setRemainingTime(otpService.getRemainingTime(email.trim()));
				setError(""); // Clear any previous errors
				setSuccessMessage("✅ OTP sent successfully! Check your email.");
			} else {
				setError(result.message);
			}
		} catch (error) {
			setError("Failed to send OTP. Please try again.");
		}

		setIsLoading(false);
	};

	const handleOTPSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setSuccessMessage("");
		setIsLoading(true);

		if (!otp) {
			setError("Please enter the OTP");
			setIsLoading(false);
			return;
		}

		try {
			const result = otpService.verifyOTP(email.trim(), otp.trim());

			if (result.success) {
				const loginSuccess = await onLogin(email.trim());

				if (!loginSuccess) {
					setError("Authentication failed. Please try again.");
				}
			} else {
				setError(result.message);
			}
		} catch (error) {
			setError("Failed to verify OTP. Please try again.");
		}

		setIsLoading(false);
	};

	const handleResendOTP = async () => {
		setError("");
		setSuccessMessage("");
		setIsLoading(true);

		try {
			const result = await otpService.sendOTP(email.trim());

			if (result.success) {
				setOtpSent(true);
				setRemainingTime(otpService.getRemainingTime(email.trim()));
				setOtp(""); // Clear the OTP input
				setSuccessMessage("✅ OTP resent successfully! Check your email.");
			} else {
				setError(result.message);
			}
		} catch (error) {
			setError("Failed to resend OTP. Please try again.");
		}

		setIsLoading(false);
	};

	const handleBackToEmail = () => {
		setStep("email");
		setOtp("");
		setError("");
		setSuccessMessage("");
		setOtpSent(false);
		setRemainingTime(0);
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
			<div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
				<div className="text-center mb-8">
					<div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">{step === "email" ? <Mail className="w-8 h-8 text-blue-600" /> : <LogIn className="w-8 h-8 text-blue-600" />}</div>
					<h1 className="text-2xl font-bold text-gray-900 mb-2">SPE UNIBEN Elections</h1>
					<p className="text-gray-600">{step === "email" ? "Enter your email to receive OTP" : "Enter the OTP sent to your email"}</p>
				</div>

				{step === "email" ? (
					<form onSubmit={handleEmailSubmit} className="space-y-6">
						<div>
							<label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
								Email Address
							</label>
							<div className="relative">
								<User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
								<input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" placeholder="Enter your email" required />
							</div>
						</div>

						{error && (
							<div className="bg-red-50 border border-red-200 rounded-lg p-3">
								<p className="text-red-600 text-sm">{error}</p>
							</div>
						)}

						<button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center">
							{isLoading ? (
								<div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
							) : (
								<>
									<Mail className="w-5 h-5 mr-2" />
									Send OTP
								</>
							)}
						</button>
					</form>
				) : (
					<form onSubmit={handleOTPSubmit} className="space-y-6">
						<div>
							<label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
								Enter OTP
							</label>
							<div className="relative">
								<LogIn className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
								<input type="text" id="otp" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-center text-lg tracking-widest" placeholder="000000" maxLength={6} required />
							</div>
							<p className="text-sm text-gray-500 mt-1">
								OTP sent to: <span className="font-medium">{email}</span>
							</p>
						</div>

						{successMessage && (
							<div className="bg-green-50 border border-green-200 rounded-lg p-3">
								<p className="text-green-600 text-sm">{successMessage}</p>
							</div>
						)}

						{remainingTime > 0 && (
							<div className="flex items-center justify-center text-sm text-gray-600">
								<Clock className="w-4 h-4 mr-1" />
								OTP expires in {Math.floor(remainingTime / 60)}:{(remainingTime % 60).toString().padStart(2, "0")}
							</div>
						)}

						{error && (
							<div className="bg-red-50 border border-red-200 rounded-lg p-3">
								<p className="text-red-600 text-sm">{error}</p>
							</div>
						)}

						<div className="space-y-3">
							<button type="submit" disabled={isLoading || otp.length !== 6} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center">
								{isLoading ? (
									<div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
								) : (
									<>
										<LogIn className="w-5 h-5 mr-2" />
										Verify OTP
									</>
								)}
							</button>

							<div className="flex space-x-2">
								<button type="button" onClick={handleBackToEmail} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center">
									<ArrowLeft className="w-4 h-4 mr-2" />
									Back
								</button>

								<button type="button" onClick={handleResendOTP} disabled={isLoading || remainingTime > 0} className="flex-1 bg-green-100 hover:bg-green-200 disabled:bg-gray-100 disabled:text-gray-400 text-green-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center">
									<Mail className="w-4 h-4 mr-2" />
									Resend
								</button>
							</div>
						</div>
					</form>
				)}

				<div className="mt-6 p-4 bg-blue-50 rounded-lg">
					<p className="text-sm text-blue-700">
						<strong>Note:</strong> {step === "email" ? "Use the same email from your SPE registration." : "Check your email inbox and spam folder for the OTP."}
					</p>
				</div>
			</div>
		</div>
	);
};
