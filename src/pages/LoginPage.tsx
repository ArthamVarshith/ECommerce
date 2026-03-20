import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getAuthErrorMessage } from "@/lib/firebaseErrors";
import Layout from "@/components/layout/Layout";
import { motion } from "framer-motion";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signIn(email, password);
      navigate("/");
    } catch (err: unknown) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <h1 className="font-display text-3xl lg:text-4xl text-foreground text-center mb-2">Welcome Back</h1>
          <p className="font-body text-sm text-muted-foreground text-center mb-10">
            Sign in to your account
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-destructive/10 text-destructive font-body text-sm p-3 rounded">
                {error}
              </div>
            )}
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
                className="w-full bg-transparent border border-border px-4 py-3 font-body text-sm text-foreground focus:outline-none focus:border-foreground transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-foreground text-background font-body text-xs tracking-[0.2em] uppercase py-4 hover:bg-foreground/90 transition-colors disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="font-body text-sm text-muted-foreground text-center mt-8">
            Don't have an account?{" "}
            <Link to="/register" className="text-foreground underline hover:no-underline">
              Create one
            </Link>
          </p>
        </motion.div>
      </div>
    </Layout>
  );
};

export default LoginPage;
