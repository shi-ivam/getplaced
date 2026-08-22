import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { AlertCircle, Loader2, Sparkles, ShieldCheck } from "lucide-react";

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
      <Card className="bg-[#121212] border-gray-800 text-white">
        <CardHeader>
          <CardTitle className="text-2xl text-white">Login</CardTitle>
          <CardDescription className="text-gray-400">
            Enter your credentials below to access your getPlaced account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-800/60 bg-red-950/50 p-3 text-sm text-red-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-5">
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-gray-300">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="m@example.com"
                  required
                  className="bg-[#1c1c1c] border-gray-700 text-white placeholder:text-gray-500 focus:border-purple-500"
                />
              </div>

              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-gray-300">Password</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="bg-[#1c1c1c] border-gray-700 text-white placeholder:text-gray-500 focus:border-purple-500"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleAutofillDemo}
                className="w-full border-gray-700 bg-gray-900 hover:bg-gray-800 text-gray-300 hover:text-white text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                Fill Test User Credentials
              </Button>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-800 text-center space-y-2 text-xs text-gray-400">
              <div>
                Don&apos;t have an account?{" "}
                <Link to="/register" className="text-purple-400 underline underline-offset-4 hover:text-purple-300 font-semibold">
                  Sign up
                </Link>
              </div>
              <div className="flex items-center justify-center gap-4 text-[11px] text-gray-500">
                <Link to="/privacy" className="hover:text-gray-300 transition-colors">Privacy Policy</Link>
                <span>&bull;</span>
                <Link to="/terms" className="hover:text-gray-300 transition-colors">Terms of Service</Link>
                <span>&bull;</span>
                <a href={`mailto:${SUPPORT_EMAIL}`} className="hover:text-purple-400 transition-colors">Contact Support</a>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}