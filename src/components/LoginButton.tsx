"use client";

import { signIn } from "next-auth/react";

export default function LoginButton() {
  return (
    <button
      onClick={() => signIn("forty-two", { callbackUrl: "/dashboard" })}
      className="glass-button w-full flex items-center justify-center gap-3"
    >
      <svg
        viewBox="0 0 24 24"
        className="w-5 h-5 fill-current"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2z" />
        <path d="M8 8l4 4-4 4M12 8l4 4-4 4" />
      </svg>
      Login with 42 Intra
    </button>
  );
}
