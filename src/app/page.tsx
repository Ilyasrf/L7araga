"use client";

import { signIn, useSession } from "next-auth/react";
import { redirect } from "next/navigation";

export default function LoginPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <main className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="text-zinc-500">Loading...</div>
      </main>
    );
  }

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-zinc-50 px-4">
      <div className="max-w-md w-full bg-white p-8 border border-zinc-200 shadow-sm rounded-lg text-center">
        <h1 className="text-2xl font-semibold text-zinc-900 mb-2">Students Tracker</h1>
        <p className="text-zinc-500 mb-8">Track where your fellow 1337 students are right now</p>
        
        <button
          onClick={() => signIn("42-school")}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-4 rounded transition-colors"
        >
          Sign in with 42 Intra
        </button>
      </div>
    </main>
  );
}
