"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/axios";

export default function Register() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!form.name || !form.email || !form.password) {
      setError("All fields are required.");
      setLoading(false);
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    try {
      const res = await api.post("/api/auth/register", form);

      if (res.status === 200 || res.status === 201) {
        const loginRes = await api.post("/api/auth/login", {
          email: form.email,
          password: form.password
        });

        if (loginRes.status === 200) {
          router.push("/dashboard");
          router.refresh();
        } else {
          router.push("/login");
        }
      } else {
        setError(res.data?.error || "Something went wrong");
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      if (err.response?.status === 409) {
        setError("Email already registered");
      } else {
        setError(err.response?.data?.error || "Something went wrong");
      }
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans p-4">
      <div className="w-full max-w-md bg-white p-6 sm:p-8 rounded shadow">
        <h1 className="text-xl sm:text-2xl font-bold mb-6 text-center">Register</h1>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={handleChange}
            className="border p-2 sm:p-2.5 rounded text-sm sm:text-base"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="border p-2 sm:p-2.5 rounded text-sm sm:text-base"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="border p-2 sm:p-2.5 rounded text-sm sm:text-base"
          />
          {error && <p className="text-red-500 text-xs sm:text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 text-white p-2.5 sm:p-3 rounded hover:bg-blue-600 text-sm sm:text-base"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <div className="mt-4 text-center text-xs sm:text-sm">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-500 hover:underline">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
