import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NODE_API_URL } from "@/config/api";

export function RegisterForm(props) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { className, ...rest } = props;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await axios.post(
        `${NODE_API_URL}/api/users/`,
        {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
        },
        { withCredentials: true }
      );
      navigate("/onboarding");
    } catch (err) {
      console.error("Registration error:", err);
      setError(
        err.response?.data?.message || "Registration failed. Please check your details and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...rest}>
      <Card className="bg-zinc-900/70 border-zinc-800 text-zinc-100 shadow-xl">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-xl font-bold text-white tracking-tight">Create Account</CardTitle>
          <CardDescription className="text-xs text-zinc-400">
            Enter your details to create an account
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
                <Label htmlFor="name" className="text-xs font-medium text-zinc-300">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Abhishek Kumar"
                  required
                  className="bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus:border-purple-500 text-xs"
                />
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="email" className="text-xs font-medium text-zinc-300">Email Address</Label>
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
                <Label htmlFor="password" className="text-xs font-medium text-zinc-300">Password</Label>
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
                    Creating account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </div>

            <div className="mt-5 text-center text-xs text-zinc-400">
              Already have an account?{" "}
              <Link to="/login" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
                Sign in
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}