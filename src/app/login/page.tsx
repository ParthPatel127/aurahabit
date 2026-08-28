"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, Sparkles, ArrowRight, Sun, Moon, KeyRound, CheckCircle2, ArrowLeft, X, ShieldCheck, RefreshCw } from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";

export default function LoginPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  // Login Form States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Forgot Password Wizard States (Step 1: Email -> Step 2: OTP -> Step 3: New Password -> Step 4: Success)
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3 | 4>(1);
  const [resetEmail, setResetEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState("");
  const [otpBanner, setOtpBanner] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError(res.error || "Invalid email or password");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: any) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenForgotModal = () => {
    setWizardStep(1);
    setResetEmail(email || "");
    setOtpCode("");
    setNewPassword("");
    setConfirmPassword("");
    setResetError("");
    setOtpBanner("");
    setShowForgotModal(true);
  };

  // STEP 1: Send 6-digit OTP to Email
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError("");
    setOtpBanner("");

    if (!resetEmail) {
      setResetError("Please enter your registered email address.");
      return;
    }

    setResetLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail }),
      });

      const data = await res.json();

      if (!res.ok) {
        setResetError(data.error || "Account not found or failed to send OTP.");
      } else {
        if (data.code) {
          setOtpBanner(`Your OTP Code is: ${data.code} (Valid for 15 mins)`);
        }
        setWizardStep(2);
      }
    } catch (err: any) {
      setResetError("Failed to request OTP code.");
    } finally {
      setResetLoading(false);
    }
  };

  // STEP 2: Verify 6-digit OTP Code
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError("");

    if (!otpCode || otpCode.trim().length !== 6) {
      setResetError("Please enter a valid 6-digit OTP code.");
      return;
    }

    setResetLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: resetEmail,
          code: otpCode.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setResetError(data.error || "Invalid or expired OTP code.");
      } else {
        setWizardStep(3);
      }
    } catch (err: any) {
      setResetError("An error occurred while verifying the OTP code.");
    } finally {
      setResetLoading(false);
    }
  };

  // STEP 3: Submit New Password & Confirm Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError("");

    if (newPassword.length < 6) {
      setResetError("New password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setResetError("New password and confirm password do not match.");
      return;
    }

    setResetLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: resetEmail,
          code: otpCode.trim(),
          newPassword: newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setResetError(data.error || "Failed to update password.");
      } else {
        // Pre-fill login email and password
        setEmail(resetEmail);
        setPassword(newPassword);
        setWizardStep(4);
      }
    } catch (err: any) {
      setResetError("An error occurred while resetting your password.");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-200">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top right theme toggle */}
      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors z-20"
        title="Toggle Theme"
      >
        {theme === "dark" ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
      </button>

      {/* Main Login Card - Solid High Contrast Pure White or Pure Dark */}
      <div className="w-full max-w-md p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-emerald-600 flex items-center justify-center text-2xl mx-auto shadow-md shadow-emerald-500/20 mb-3 text-white">
            ⚡
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome to AuraHabit</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Sign in to track your habits & streak achievements</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 dark:text-slate-500" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 dark:text-slate-500" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-slate-300 dark:border-slate-800 text-emerald-600 focus:ring-emerald-500"
              />
              Remember Me
            </label>
            <button
              type="button"
              onClick={handleOpenForgotModal}
              className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline cursor-pointer focus:outline-none"
            >
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? "Signing in..." : "Sign In"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Don't have an account?{" "}
            <Link href="/register" className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
      </div>

      {/* Forgot Password 3-Step Wizard Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 relative">
            <button
              onClick={() => setShowForgotModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Wizard Header Progress */}
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3">
                {wizardStep === 1 && <Mail className="w-6 h-6" />}
                {wizardStep === 2 && <KeyRound className="w-6 h-6" />}
                {wizardStep === 3 && <Lock className="w-6 h-6" />}
                {wizardStep === 4 && <CheckCircle2 className="w-6 h-6 text-emerald-500" />}
              </div>

              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {wizardStep === 1 && "Forgot Password"}
                {wizardStep === 2 && "Enter OTP Code"}
                {wizardStep === 3 && "Set New Password"}
                {wizardStep === 4 && "Password Reset Successful"}
              </h2>

              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {wizardStep === 1 && "Step 1 of 3: Enter your registered email address to receive a 6-digit OTP code."}
                {wizardStep === 2 && `Step 2 of 3: Enter the 6-digit OTP code sent to ${resetEmail}`}
                {wizardStep === 3 && "Step 3 of 3: Enter your new password and confirm it."}
                {wizardStep === 4 && "Your password has been updated! Click below to sign in."}
              </p>

              {/* Step indicator bar */}
              {wizardStep < 4 && (
                <div className="flex items-center justify-center gap-1.5 mt-4">
                  <div className={`h-1.5 rounded-full transition-all duration-300 ${wizardStep >= 1 ? "w-8 bg-emerald-500" : "w-3 bg-slate-200 dark:bg-slate-800"}`} />
                  <div className={`h-1.5 rounded-full transition-all duration-300 ${wizardStep >= 2 ? "w-8 bg-emerald-500" : "w-3 bg-slate-200 dark:bg-slate-800"}`} />
                  <div className={`h-1.5 rounded-full transition-all duration-300 ${wizardStep >= 3 ? "w-8 bg-emerald-500" : "w-3 bg-slate-200 dark:bg-slate-800"}`} />
                </div>
              )}
            </div>

            {resetError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold text-center">
                {resetError}
              </div>
            )}

            {/* STEP 1: Enter Email */}
            {wizardStep === 1 && (
              <form onSubmit={handleSendOTP} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Registered Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 dark:text-slate-500" />
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="w-1/3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="w-2/3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {resetLoading ? "Sending OTP..." : "Send OTP Code"}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: Enter & Verify OTP */}
            {wizardStep === 2 && (
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                {otpBanner && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold text-center flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{otpBanner}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Enter 6-Digit Security OTP
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 dark:text-slate-500" />
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="e.g. 849201"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-mono text-sm tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setWizardStep(1)}
                    className="w-1/3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Change Email
                  </button>
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="w-2/3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {resetLoading ? "Verifying OTP..." : "Verify OTP Code"}
                    <ShieldCheck className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: Enter New Password & Confirm Password */}
            {wizardStep === 3 && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 dark:text-slate-500" />
                    <input
                      type="password"
                      required
                      placeholder="At least 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 dark:text-slate-500" />
                    <input
                      type="password"
                      required
                      placeholder="Re-enter new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setWizardStep(2)}
                    className="w-1/3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to OTP
                  </button>
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="w-2/3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {resetLoading ? "Updating..." : "Reset Password"}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

            {/* STEP 4: Success & Auto-Fill Sign In */}
            {wizardStep === 4 && (
              <div className="space-y-4 text-center">
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium space-y-2">
                  <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500" />
                  <p className="font-semibold text-sm">Password Reset Complete!</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Your password has been updated securely. Your login details have been pre-filled below.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ArrowRight className="w-4 h-4" /> Sign In Now
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
