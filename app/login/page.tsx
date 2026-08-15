"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(event.currentTarget);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.get("email"),
        password: form.get("password"),
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Login failed.");
      return;
    }

    router.push("/tasks");
    router.refresh();
  }

  return (
    <div className="auth">
      <h1>Internal Portal</h1>
      <p className="muted" style={{ marginBottom: 16 }}>
        Login
      </p>

      <form onSubmit={onSubmit}>
        {error ? <p className="error">{error}</p> : null}

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
            autoComplete="current-password"
          />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? "Please wait..." : "Login"}
        </button>
      </form>

      <p className="hint">
        No account? <Link href="/signup">Sign up</Link>
      </p>
    </div>
  );
}
