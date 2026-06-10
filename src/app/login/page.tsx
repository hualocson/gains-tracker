"use client";
import { useState } from "react";

import { useRouter } from "next/navigation";

import { Dumbbell } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
    if (res.ok) {
      router.push("/");
    } else {
      setError(true);
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center px-5">
      <div className="w-full max-w-xs space-y-7">
        <div className="space-y-4 text-center">
          <span className="bg-card mx-auto flex size-14 items-center justify-center rounded-2xl border">
            <Dumbbell className="text-primary size-7" aria-hidden="true" />
          </span>
          <div className="space-y-1.5">
            <h1 className="text-2xl font-bold tracking-tight">Gains Tracker</h1>
            <p className="text-muted-foreground text-sm">
              Enter your password to pick up where you left off.
            </p>
          </div>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <Input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(false);
            }}
            placeholder="Password"
            autoFocus
            aria-invalid={error}
          />
          {error && (
            <p className="text-destructive text-sm">
              That password didn&apos;t match. Try again.
            </p>
          )}
          <Button type="submit" className="w-full">
            Enter
          </Button>
        </form>
      </div>
    </main>
  );
}
