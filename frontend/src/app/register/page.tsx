"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import Button from "@/components/Button";
import Card from "@/components/Card";
import Input from "@/components/Input";
import { ErrorMessage } from "@/components/States";
import { ApiError, api } from "@/lib/api";
import { roleHome, setAuth } from "@/lib/auth";
import type { AuthResponse, SignupRole } from "@/types";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<SignupRole>("farmer");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      const data = await api.post<AuthResponse>("/api/auth/register", {
        name,
        email,
        password,
        role,
        phone: phone || null,
        location: location || null,
      });
      setAuth(data.access_token, data.user);
      router.replace(roleHome[data.user.role]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to register");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-green-700">AgriMatch</h1>
          <p className="mt-1 text-sm text-gray-600">Create your account</p>
        </div>
        <Card>
          <form onSubmit={onSubmit} className="space-y-4">
            {error && <ErrorMessage message={error} />}
            <Input
              label="Full name"
              name="name"
              required
              minLength={2}
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
            <Input
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <Input
              label="Password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <div>
              <span className="mb-1 block text-sm font-medium text-gray-700">I am a</span>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={role === "farmer" ? "primary" : "secondary"}
                  onClick={() => setRole("farmer")}
                >
                  Farmer
                </Button>
                <Button
                  type="button"
                  variant={role === "buyer" ? "primary" : "secondary"}
                  onClick={() => setRole("buyer")}
                >
                  Buyer
                </Button>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Phone (optional)"
                name="phone"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
              />
              <Input
                label="Location (optional)"
                name="location"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating account..." : "Create account"}
            </Button>
          </form>
        </Card>
        <p className="mt-4 text-center text-sm text-gray-600">
          Already registered?{" "}
          <Link href="/login" className="font-medium text-green-700 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
