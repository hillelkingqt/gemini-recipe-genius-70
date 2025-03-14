import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { Eye, EyeOff, Lock, Mail, UserPlus, Loader2, ChefHat, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Auth: React.FC = () => {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const { signIn, signUp, session, failedLoginAttempts, setFailedLoginAttempts } = useAuth();
  const { toast } = useToast();
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');

  
  useEffect(() => {
    if (session) {
      navigate('/');
    }
  }, [session, navigate]);
  
  useEffect(() => {
    if (failedLoginAttempts >= 2) {
      setShowResetPassword(true);
    }
  }, [failedLoginAttempts]);
  
  const validateEmail = (email: string) => {
    return /\S+@\S+\.\S+/.test(email);
  };
  
  const validatePassword = (password: string) => {
    return password.length >= 6;
  };
  
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }
    
    if (!validatePassword(password)) {
      toast({
        title: "Invalid Password",
        description: "Password must be at least 6 characters.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await signIn(email, password);
      // Successful login will redirect via useEffect
    } catch (error) {
      console.error("Sign in error:", error);
      setErrorMessage("Invalid email or password.");
      setIsSubmitting(false);
    }
  };
  
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }
    
    if (!validatePassword(password)) {
      toast({
        title: "Invalid Password",
        description: "Password must be at least 6 characters.",
        variant: "destructive",
      });
      return;
    }
    
    if (password !== confirmPassword) {
      toast({
        title: "Passwords Do Not Match",
        description: "Please ensure your passwords match.",
        variant: "destructive",
      });
      return;
    }
    
    if (!username.trim()) {
      setUsername(email.split('@')[0]); // Use email prefix as default username
    }
    
    setIsSubmitting(true);
    
    try {
      await signup(email, password, username.trim() || email.split('@')[0]);
      toast({
        title: "Account Created",
        description: "Please check your email to verify your account.",
      });
      setMode("signin");
    } catch (error) {
      console.error("Sign up error:", error);
      setErrorMessage("An error occurred while creating your account.");
      setIsSubmitting(false);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await resetPassword(email);
      setResetSent(true);
    } catch (error) {
      console.error("Reset password error:", error);
      setErrorMessage("An error occurred while sending the reset link.");
      setIsSubmitting(false);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-recipe-green" />
      </div>
    );
  }
  
  if (showResetPassword) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-gray-800">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md"
        >
          <Card className="border-none shadow-xl bg-white/90 backdrop-blur-sm dark:bg-gray-900/90">
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-center mb-2">
                <ChefHat className="h-10 w-10 text-recipe-green" />
              </div>
              <CardTitle className="text-2xl text-center">Reset Your Password</CardTitle>
              <CardDescription className="text-center">
                {resetSent 
                  ? "Check your email for a password reset link" 
                  : "Enter your email address and we'll send you a reset link"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!resetSent ? (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reset-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="reset-email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-recipe-green hover:bg-recipe-green/90"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      "Send Reset Link"
                    )}
                  </Button>
                </form>
              ) : (
                <div className="flex flex-col items-center space-y-4 py-4">
                  <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/30">
                    <Mail className="h-8 w-8 text-recipe-green" />
                  </div>
                  <p className="text-center text-gray-600 dark:text-gray-300">
                    We've sent an email to <strong>{email}</strong> with instructions to reset your password.
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                variant="ghost" 
                className="w-full"
                onClick={() => {
                  setShowResetPassword(false);
                  setFailedLoginAttempts(0);
                  setMode("signin");
                }}
              >
                Back to Sign In
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 flex items-center justify-center p-4 bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-gray-800">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="border-none shadow-xl bg-white/90 backdrop-blur-sm dark:bg-gray-900/90">
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-center mb-4">
                <ChefHat className="h-12 w-12 text-recipe-green" />
              </div>
              <CardTitle className="text-2xl text-center">Recipe Genius</CardTitle>
              <CardDescription className="text-center">
                {mode === "signin" 
                  ? "Sign in to access your personalized recipes" 
                  : "Create an account to save and share your recipes"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="signin" value={mode} onValueChange={setMode}>
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="signin">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>
                
                <AnimatePresence mode="wait">
                  <motion.div
                    key={mode}
                    initial={{ opacity: 0, x: mode === "signin" ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: mode === "signin" ? 20 : -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <TabsContent value="signin" className="space-y-4">
                      <form onSubmit={handleSignIn}>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="signin-email">Email</Label>
                            <div className="relative">
                              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                              <Input
                                id="signin-email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-recipe-green/50"
                                required
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label htmlFor="signin-password">Password</Label>
                              <Button 
                                type="button" 
                                variant="link" 
                                className="text-xs text-recipe-green p-0 h-auto font-normal"
                                onClick={() => setShowResetPassword(true)}
                              >
                                Forgot password?
                              </Button>
                            </div>
                            <div className="relative">
                              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                              <Input
                                id="signin-password"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-recipe-green/50"
                                required
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-0 top-0 h-10 w-10 text-gray-400"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </Button>
                            </div>
                          </div>
                          
                          <Button 
                            type="submit" 
                            className="w-full bg-recipe-green hover:bg-recipe-green/90 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Signing in...
                              </>
                            ) : (
                              <>
                                Sign In
                                <ArrowRight className="ml-2 h-4 w-4" />
                              </>
                            )}
                          </Button>
                        </div>
                      </form>
                    </TabsContent>
                    
                    <TabsContent value="signup" className="space-y-4">
                      <form onSubmit={handleSignUp}>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="signup-email">Email</Label>
                            <div className="relative">
                              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                              <Input
                                id="signup-email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-recipe-green/50"
                                required
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="username">Username (optional)</Label>
                            <div className="relative">
                              <UserPlus className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                              <Input
                                id="username"
                                type="text"
                                placeholder="Your display name"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-recipe-green/50"
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="signup-password">Password</Label>
                            <div className="relative">
                              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                              <Input
                                id="signup-password"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-recipe-green/50"
                                required
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-0 top-0 h-10 w-10 text-gray-400"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </Button>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="confirm-password">Confirm Password</Label>
                            <div className="relative">
                              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                              <Input
                                id="confirm-password"
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-recipe-green/50"
                                required
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-0 top-0 h-10 w-10 text-gray-400"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              >
                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </Button>
                            </div>
                          </div>
                          
                          <Button 
                            type="submit" 
                            className="w-full bg-recipe-green hover:bg-recipe-green/90 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating account...
                              </>
                            ) : (
                              <>
                                Create Account
                                <UserPlus className="ml-2 h-4 w-4" />
                              </>
                            )}
                          </Button>
                        </div>
                      </form>
                    </TabsContent>
                  </motion.div>
                </AnimatePresence>
              </Tabs>
            </CardContent>
            <CardFooter className="flex justify-center border-t pt-4">
              <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                By signing up, you agree to our Terms of Service and Privacy Policy
              </p>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
