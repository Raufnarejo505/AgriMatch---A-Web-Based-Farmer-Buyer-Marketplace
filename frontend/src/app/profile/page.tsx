"use client";

import { FormEvent, useEffect, useState } from "react";

import Button from "@/components/Button";
import Card from "@/components/Card";
import DashboardShell from "@/components/DashboardShell";
import Input from "@/components/Input";
import { ErrorMessage, Loading } from "@/components/States";
import { ApiError, api } from "@/lib/api";
import { getUser, updateUser } from "@/lib/auth";
import type { User } from "@/types";

export default function ProfilePage() {
  const [profile, setProfile] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    api
      .get<User>("/api/users/me")
      .then((user) => {
        if (!active) return;
        setProfile(user);
        setName(user.name);
        setPhone(user.phone ?? "");
        setLocation(user.location ?? "");
        updateUser(user);
      })
      .catch((err) => {
        if (active) setError(err instanceof ApiError ? err.message : "Failed to load profile");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [reloadKey]);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    setSaving(true);
    try {
      const updated = await api.patch<User>("/api/users/me", {
        name: name.trim(),
        phone: phone.trim() || null,
        location: location.trim() || null,
        ...(password ? { password } : {}),
      });
      setProfile(updated);
      updateUser(updated);
      setName(updated.name);
      setPhone(updated.phone ?? "");
      setLocation(updated.location ?? "");
      setPassword("");
      setNotice("Profile updated");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to update profile");
    } finally {
      setSaving(false);
    }
  }

  const role = profile?.role ?? getUser()?.role;
  if (!role) return <Loading label="Loading profile..." />;

  return (
    <DashboardShell role={role} title="Profile">
      {loading ? (
        <Loading />
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          <Card title="Account">
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-gray-500">Email</dt>
                <dd className="font-medium text-gray-900">{profile?.email}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Role</dt>
                <dd className="font-medium capitalize text-gray-900">{profile?.role}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Status</dt>
                <dd className="font-medium capitalize text-gray-900">{profile?.status}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Member since</dt>
                <dd className="font-medium text-gray-900">
                  {profile ? new Date(profile.created_at).toLocaleDateString() : "-"}
                </dd>
              </div>
            </dl>
          </Card>
          <Card title="Edit profile" className="md:col-span-2">
            {error && <div className="mb-4"><ErrorMessage message={error} onRetry={() => setReloadKey((key) => key + 1)} /></div>}
            {notice && (
              <p className="mb-4 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                {notice}
              </p>
            )}
            <form onSubmit={save} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Full name" name="name" required minLength={2} value={name} onChange={(e) => setName(e.target.value)} />
                <Input label="Phone" name="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
                <Input label="Location" name="location" value={location} onChange={(e) => setLocation(e.target.value)} />
                <Input
                  label="New password (optional)"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save changes"}
              </Button>
            </form>
          </Card>
        </div>
      )}
    </DashboardShell>
  );
}
