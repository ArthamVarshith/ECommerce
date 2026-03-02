import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/layout/Layout";
import { motion } from "framer-motion";

const RegisterPage = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await signUp(email, password, fullName);
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="font-display text-3xl text-foreground mb-4">Check your email</h1>
          <p className="font-body text-sm text-muted-foreground max-w-sm mx-auto">
            We've sent a confirmation link to <strong>{email}</strong>. Please verify your email to complete registration.
          </p>
          <Link to="/login" className="font-body text-sm text-foreground underline mt-6 inline-block">
            Go to login
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <h1 className="font-display text-3xl lg:text-4xl text-foreground text-center mb-2">Create Account</h1>
          <p className="font-body text-sm text-muted-foreground text-center mb-10">
            Join ATELIER for an elevated shopping experience
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-destructive/10 text-destructive font-body text-sm p-3 rounded">
                {error}
              </div>
            )}
            <div>
              <label className="font-body text-xs tracking-[0.15em] uppercase text-muted-foreground mb-2 block">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full bg-transparent border border-border px-4 py-3 font-body text-sm text-foreground focus:outline-none focus:border-foreground transition-colors"
              />
            </div>
            <div>
              <label className="font-body text-xs tracking-[0.15em] uppercase text-muted-foreground mb-2 block">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-transparent border border-border px-4 py-3 font-body text-sm text-foreground focus:outline-none focus:border-foreground transition-colors"
              />
            </div>
            <div>
              <label className="font-body text-xs tracking-[0.15em] uppercase text-muted-foreground mb-2 block">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full bg-transparent border border-border px-4 py-3 font-body text-sm text-foreground focus:outline-none focus:border-foreground transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-foreground text-background font-body text-xs tracking-[0.2em] uppercase py-4 hover:bg-foreground/90 transition-colors disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="font-body text-sm text-muted-foreground text-center mt-8">
            Already have an account?{" "}
            <Link to="/login" className="text-foreground underline hover:no-underline">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </Layout>
  );
};

export default RegisterPage;
