import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { AlertCircle, Loader2, Sparkles } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NODE_API_URL, SUPPORT_EMAIL } from "@/config/api";

export function LoginForm(props) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { className, ...rest } = props;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await axios.post(
        `${NODE_API_URL}/api/users/auth`,
        {
          email: email.trim().toLowerCase(),
          password,
        },
        { withCredentials: true }
      );
      if (res.data && res.data.onboardingCompleted === false) {
        navigate("/onboarding");
      } else {
        navigate("/app");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(
        err.response?.data?.message || "Invalid email or password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAutofillDemo = () => {
    setEmail("test@example.com");
    setPassword("password123");
    setError("");
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...rest}>
      <Card className="bg-zinc-900/70 border-zinc-800 text-zinc-100 shadow-xl">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-xl font-bold text-white tracking-tight">Sign In</CardTitle>
          <CardDescription className="text-xs text-zinc-400">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-rose-800/50 bg-rose-950/40 p-2.5 text-xs text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="email" className="text-xs font-medium text-zinc-300">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="m@example.com"
                  required
                  className="bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus:border-purple-500 text-xs"
                />
              </div>

              <div className="grid gap-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-medium text-zinc-300">Password</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus:border-purple-500 text-xs"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs py-2 rounded-lg cursor-pointer transition-colors"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleAutofillDemo}
                className="w-full border-zinc-800 bg-zinc-950 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                Fill Demo Credentials
              </Button>
            </div>

            <div className="mt-5 pt-4 border-t border-zinc-800 text-center space-y-2 text-xs text-zinc-400">
              <div>
                Don&apos;t have an account?{" "}
                <Link to="/register" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
                  Sign up
                </Link>
              </div>
              <div className="flex items-center justify-center gap-3 text-[11px] text-zinc-500">
                <Link to="/privacy" className="hover:text-zinc-400 transition-colors">Privacy</Link>
                <span>·</span>
                <Link to="/terms" className="hover:text-zinc-400 transition-colors">Terms</Link>
                <span>·</span>
                <a href={`mailto:${SUPPORT_EMAIL}`} className="hover:text-zinc-400 transition-colors">Support</a>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}