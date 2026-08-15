"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(event.currentTarget);
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        email: form.get("email"),
        password: form.get("password"),
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Signup failed.");
      return;
    }

    router.push("/tasks");
    router.refresh();
  }

  return (
    <div className="auth">
      <h1>Internal Portal</h1>
      <p className="muted">Create your account</p>

      <form onSubmit={onSubmit}>
        {error ? <p className="error">{error}</p> : null}

        <label>
          Name
          <input name="name" type="text" required autoComplete="name" />
        </label>

        <label>
          Email
          <input name="email" type="email" required autoComplete="email" />
        </label>

        <label>
          Password
          <input
            name="password"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
          />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? "Please wait..." : "Sign up"}
        </button>
      </form>

      <p className="hint">
        Already have an account? <Link href="/login">Login</Link>
      </p>
    </div>
  );
}
