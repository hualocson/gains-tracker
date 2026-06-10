"use client";
import { useState } from "react";

import { useRouter } from "next/navigation";

export default function Login() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {router.push("/");}
    else {setError(true);}
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <form onSubmit={submit} className="w-full max-w-xs space-y-4">
        <h1 className="text-xl font-bold">Gains Tracker</h1>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full rounded border p-3"
        />
        {error && <p className="text-sm text-red-600">Wrong password</p>}
        <button className="w-full rounded bg-black p-3 text-white">
          Enter
        </button>
      </form>
    </main>
  );
}
