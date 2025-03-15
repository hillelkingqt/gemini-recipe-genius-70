
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
import { motion } from 'framer-motion';

const Auth: React.FC = () => {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const { signIn, signUp, session, failedLoginAttempts, setFailedLoginAttempts, resetPassword } = useAuth();
  const { toast } = useToast();
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');

  // Variants for animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.05,
        delayChildren: 0.2
      }
    },
    exit: {
      opacity: 0,
      transition: { 
        staggerChildren: 0.05,
        staggerDirection: -1 
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { 
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    },
    exit: { 
      y: -20, 
      opacity: 0,
      transition: {
        duration: 0.2
      }
    }
  };

  const logoVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { 
        type: "spring",
        stiffness: 500,
        damping: 30,
        delay: 0.1
      }
    },
    hovering: {
      scale: 1.05,
      rotate: [0, -5, 5, -5, 5, 0],
      transition: {
        duration: 0.5
      }
    }
  };
  
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
    } finally {
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
    
    const displayUsername = username.trim() || email.split('@')[0];
    
    setIsSubmitting(true);
    
    try {
      await signUp(email, password, displayUsername);
      toast({
        title: "Account Created",
        description: "Your account has been created successfully.",
      });
      setMode("signin");
    } catch (error) {
      console.error("Sign up error:", error);
      setErrorMessage("An error occurred while creating your account.");
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
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (showResetPassword) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-b from-green-50 to-white dark:from-gray-900/80 dark:to-gray-800/90 dark:bg-gradient-radial dark:bg-[size:200%_200%] dark:animate-gradient-background">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ 
            duration: 0.5, 
            type: "spring",
            stiffness: 200, 
            damping: 20 
          }}
          className="w-full max-w-md"
        >
          <Card className="border-none shadow-xl bg-white/90 dark:bg-gray-900/80 backdrop-blur-sm">
            <CardHeader className="space-y-1">
              <motion.div 
                className="flex items-center justify-center mb-2"
                initial="hidden"
                animate="visible"
                whileHover="hovering"
                variants={logoVariants}
              >
                <ChefHat className="h-10 w-10 text-recipe-green" />
              </motion.div>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.5 }}
              >
                <CardTitle className="text-2xl text-center">Reset Your Password</CardTitle>
                <CardDescription className="text-center">
                  {resetSent 
                    ? "Check your email for a password reset link" 
                    : "Enter your email address and we'll send you a reset link"}
                </CardDescription>
              </motion.div>
            </CardHeader>
            <CardContent>
              {!resetSent ? (
                <motion.form 
                  onSubmit={handleResetPassword} 
                  className="space-y-4"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <motion.div className="space-y-2" variants={itemVariants}>
                    <Label htmlFor="reset-email">Email</Label>
                    <div className="relative">
                      <motion.div 
                        className="absolute left-3 top-3 text-gray-400"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 500 }}
                      >
                        <Mail className="h-4 w-4" />
                      </motion.div>
                      <Input
                        id="reset-email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 transition-all duration-300 focus:ring-2 focus:ring-recipe-green/50 focus:scale-[1.01] dark:bg-gray-800/50"
                        required
                      />
                    </div>
                  </motion.div>
                  
                  <motion.div variants={itemVariants}>
                    <Button 
                      type="submit" 
                      className="w-full bg-recipe-green hover:bg-recipe-green/90 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group"
                      disabled={isSubmitting}
                    >
                      <motion.span 
                        className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"
                      />
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        "Send Reset Link"
                      )}
                    </Button>
                  </motion.div>
                </motion.form>
              ) : (
                <motion.div 
                  className="flex flex-col items-center space-y-4 py-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <motion.div 
                    className="rounded-full bg-green-100 p-3 dark:bg-green-900/30"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  >
                    <Mail className="h-8 w-8 text-recipe-green" />
                  </motion.div>
                  <motion.p 
                    className="text-center text-gray-600 dark:text-gray-300"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    We've sent an email to <strong>{email}</strong> with instructions to reset your password.
                  </motion.p>
                </motion.div>
              )}
            </CardContent>
            <CardFooter>
              <motion.div
                className="w-full"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  variant="ghost" 
                  className="w-full hover:bg-recipe-green/10 transition-all duration-300"
                  onClick={() => {
                    setShowResetPassword(false);
                    setFailedLoginAttempts(0);
                    setMode("signin");
                  }}
                >
                  Back to Sign In
                </Button>
              </motion.div>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 flex items-center justify-center p-4 bg-gradient-to-b from-green-50 to-white dark:from-gray-900/80 dark:to-gray-800/90 dark:bg-gradient-radial dark:bg-[size:200%_200%] dark:animate-gradient-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="border-none shadow-xl bg-white/90 backdrop-blur-sm dark:bg-gray-900/80 relative overflow-hidden">
            <motion.div 
              className="absolute inset-0 pointer-events-none opacity-20 dark:opacity-40"
              animate={{ 
                background: [
                  "radial-gradient(circle at 20% 20%, rgba(34, 197, 94, 0.2) 0%, transparent 70%)",
                  "radial-gradient(circle at 80% 80%, rgba(34, 197, 94, 0.2) 0%, transparent 70%)",
                  "radial-gradient(circle at 50% 50%, rgba(34, 197, 94, 0.2) 0%, transparent 70%)",
                  "radial-gradient(circle at 20% 20%, rgba(34, 197, 94, 0.2) 0%, transparent 70%)"
                ]
              }}
              transition={{ duration: 20, repeat: Infinity, repeatType: "loop" }}
            />
            
            <CardHeader className="space-y-1">
              <motion.div 
                className="flex items-center justify-center mb-4"
                initial="hidden"
                animate="visible"
                whileHover="hovering"
                variants={logoVariants}
              >
                <ChefHat className="h-12 w-12 text-recipe-green" />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <CardTitle className="text-2xl text-center">Recipe Genius</CardTitle>
                <CardDescription className="text-center">
                  {mode === "signin" 
                    ? "Sign in to access your personalized recipes" 
                    : "Create an account to save and share your recipes"}
                </CardDescription>
              </motion.div>
            </CardHeader>
            <CardContent>
              <Tabs value={mode} onValueChange={(value) => {
                if (value === "signin" || value === "signup") {
                  setMode(value);
                }
              }}>
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="signin">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>
                
                <motion.div
                  key={mode}
                  initial={{ opacity: 0, x: mode === "signin" ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: mode === "signin" ? 20 : -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <TabsContent value="signin" className="space-y-4">
                    <motion.form 
                      onSubmit={handleSignIn}
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                    >
                      <div className="space-y-4">
                        <motion.div className="space-y-2" variants={itemVariants}>
                          <Label htmlFor="signin-email">Email</Label>
                          <div className="relative">
                            <motion.div 
                              className="absolute left-3 top-3 text-gray-400"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.2, type: "spring", stiffness: 500 }}
                            >
                              <Mail className="h-4 w-4" />
                            </motion.div>
                            <Input
                              id="signin-email"
                              type="email"
                              placeholder="you@example.com"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="pl-10 transition-all duration-300 focus:ring-2 focus:ring-recipe-green/50 focus:scale-[1.01] dark:bg-gray-800/50"
                              required
                            />
                          </div>
                        </motion.div>
                        
                        <motion.div className="space-y-2" variants={itemVariants}>
                          <div className="flex items-center justify-between">
                            <Label htmlFor="signin-password">Password</Label>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                              <Button 
                                type="button" 
                                variant="link" 
                                className="text-xs text-recipe-green p-0 h-auto font-normal"
                                onClick={() => setShowResetPassword(true)}
                              >
                                Forgot password?
                              </Button>
                            </motion.div>
                          </div>
                          <div className="relative">
                            <motion.div 
                              className="absolute left-3 top-3 text-gray-400"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.2, type: "spring", stiffness: 500 }}
                            >
                              <Lock className="h-4 w-4" />
                            </motion.div>
                            <Input
                              id="signin-password"
                              type={showPassword ? "text" : "password"}
                              placeholder="••••••••"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className="pl-10 transition-all duration-300 focus:ring-2 focus:ring-recipe-green/50 focus:scale-[1.01] dark:bg-gray-800/50"
                              required
                            />
                            <motion.div 
                              className="absolute right-0 top-0"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10 text-gray-400"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </Button>
                            </motion.div>
                          </div>
                        </motion.div>
                        
                        <motion.div variants={itemVariants}>
                          <Button 
                            type="submit" 
                            className="w-full bg-recipe-green hover:bg-recipe-green/90 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group"
                            disabled={isSubmitting}
                          >
                            <motion.span 
                              className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"
                            />
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
                        </motion.div>
                      </div>
                    </motion.form>
                  </TabsContent>
                  
                  <TabsContent value="signup" className="space-y-4">
                    <motion.form 
                      onSubmit={handleSignUp}
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                    >
                      <div className="space-y-4">
                        <motion.div className="space-y-2" variants={itemVariants}>
                          <Label htmlFor="signup-email">Email</Label>
                          <div className="relative">
                            <motion.div 
                              className="absolute left-3 top-3 text-gray-400"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.2, type: "spring", stiffness: 500 }}
                            >
                              <Mail className="h-4 w-4" />
                            </motion.div>
                            <Input
                              id="signup-email"
                              type="email"
                              placeholder="you@example.com"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="pl-10 transition-all duration-300 focus:ring-2 focus:ring-recipe-green/50 focus:scale-[1.01] dark:bg-gray-800/50"
                              required
                            />
                          </div>
                        </motion.div>
                        
                        <motion.div className="space-y-2" variants={itemVariants}>
                          <Label htmlFor="username">Username (optional)</Label>
                          <div className="relative">
                            <motion.div 
                              className="absolute left-3 top-3 text-gray-400"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.2, type: "spring", stiffness: 500 }}
                            >
                              <UserPlus className="h-4 w-4" />
                            </motion.div>
                            <Input
                              id="username"
                              type="text"
                              placeholder="Your display name"
                              value={username}
                              onChange={(e) => setUsername(e.target.value)}
                              className="pl-10 transition-all duration-300 focus:ring-2 focus:ring-recipe-green/50 focus:scale-[1.01] dark:bg-gray-800/50"
                            />
                          </div>
                        </motion.div>
                        
                        <motion.div className="space-y-2" variants={itemVariants}>
                          <Label htmlFor="signup-password">Password</Label>
                          <div className="relative">
                            <motion.div 
                              className="absolute left-3 top-3 text-gray-400"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.2, type: "spring", stiffness: 500 }}
                            >
                              <Lock className="h-4 w-4" />
                            </motion.div>
                            <Input
                              id="signup-password"
                              type={showPassword ? "text" : "password"}
                              placeholder="••••••••"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className="pl-10 transition-all duration-300 focus:ring-2 focus:ring-recipe-green/50 focus:scale-[1.01] dark:bg-gray-800/50"
                              required
                            />
                            <motion.div 
                              className="absolute right-0 top-0"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10 text-gray-400"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </Button>
                            </motion.div>
                          </div>
                        </motion.div>
                        
                        <motion.div className="space-y-2" variants={itemVariants}>
                          <Label htmlFor="confirm-password">Confirm Password</Label>
                          <div className="relative">
                            <motion.div 
                              className="absolute left-3 top-3 text-gray-400"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.2, type: "spring", stiffness: 500 }}
                            >
                              <Lock className="h-4 w-4" />
                            </motion.div>
                            <Input
                              id="confirm-password"
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="••••••••"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              className="pl-10 transition-all duration-300 focus:ring-2 focus:ring-recipe-green/50 focus:scale-[1.01] dark:bg-gray-800/50"
                              required
                            />
                            <motion.div 
                              className="absolute right-0 top-0"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10 text-gray-400"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              >
                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </Button>
                            </motion.div>
                          </div>
                        </motion.div>
                        
                        <motion.div variants={itemVariants}>
                          <Button 
                            type="submit" 
                            className="w-full bg-recipe-green hover:bg-recipe-green/90 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group"
                            disabled={isSubmitting}
                          >
                            <motion.span 
                              className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"
                            />
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
                        </motion.div>
                      </div>
                    </motion.form>
                  </TabsContent>
                </motion.div>
              </Tabs>
            </CardContent>
            <CardFooter className="flex justify-center border-t pt-4">
              <motion.p 
                className="text-xs text-center text-gray-500 dark:text-gray-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                By signing up, you agree to our Terms of Service and Privacy Policy
              </motion.p>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
