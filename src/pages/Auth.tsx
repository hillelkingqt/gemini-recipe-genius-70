
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';

import {
  Moon,
  Sun,
  CookingPot,
  Mail,
  Lock,
  User,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

const ForgotPassword = ({ onBack }: { onBack: () => void }) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { resetPassword } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: 'Error',
        description: 'Please enter your email address',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await resetPassword(email);
      setIsSuccess(true);
    } catch (error) {
      console.error('Error resetting password:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence mode="wait">
      {isSuccess ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3 }}
          className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg text-center space-y-4"
        >
          <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
          <h3 className="text-xl font-semibold text-green-700 dark:text-green-300">
            Password Reset Email Sent!
          </h3>
          <p className="text-green-600 dark:text-green-400">
            Please check your email for instructions to reset your password.
          </p>
          <Button 
            onClick={onBack} 
            variant="outline" 
            className="mt-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Sign In
          </Button>
        </motion.div>
      ) : (
        <motion.form
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div className="text-center mb-6">
            <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-full inline-flex">
              <Lock className="h-6 w-6 text-orange-500" />
            </div>
            <h3 className="mt-2 text-xl font-bold">Forgot Password</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Enter your email and we'll send you a link to reset your password
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="reset-email" className="flex items-center text-gray-700 dark:text-gray-300">
              <Mail className="w-4 h-4 mr-2" />
              Email Address
            </Label>
            <Input
              id="reset-email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-gray-300 dark:border-gray-600 focus:ring-recipe-green focus:border-recipe-green"
            />
          </div>
          
          <Button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Mail className="w-4 h-4 mr-2" />
            )}
            Send Reset Link
          </Button>
          
          <Button 
            onClick={onBack} 
            variant="ghost" 
            type="button"
            className="w-full mt-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Sign In
          </Button>
        </motion.form>
      )}
    </AnimatePresence>
  );
};

const Auth: React.FC = () => {
  const { signIn, signUp, user, isLoading, failedLoginAttempts, setFailedLoginAttempts } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { isDarkMode, toggleDarkMode } = useTheme();

  // Active tab
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>(
    location.state?.mode === 'signup' ? 'signup' : 'signin'
  );

  // Show forgot password form
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  // Sign in form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showSignInPassword, setShowSignInPassword] = useState(false);

  // Sign up form
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [showSignUpConfirmPassword, setShowSignUpConfirmPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    if (user && !isLoading) {
      navigate('/');
    }
  }, [user, isLoading, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.clear();
    if (!email || !password) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }
    setIsSubmitting(true);
    try {
      await signIn(email, password);
    } catch (error) {
      console.error('Sign in error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newEmail || !newPassword || !confirmPassword || !username) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: 'Error',
        description: 'Password must be at least 6 characters long',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await signUp(newEmail, newPassword, username);
      setShowSuccessMessage(true);

      // Copy values to sign in form
      setEmail(newEmail);
      setPassword(newPassword);

      // Reset sign up form
      setNewEmail('');
      setNewPassword('');
      setConfirmPassword('');
      setUsername('');

      // After 5 seconds, hide the message and switch to the sign in tab
      setTimeout(() => {
        setShowSuccessMessage(false);
        setActiveTab('signin');
      }, 5000);
    } catch (error) {
      console.error('Sign up error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check for multiple failed login attempts
  useEffect(() => {
    if (failedLoginAttempts >= 2) {
      setShowForgotPassword(true);
    }
  }, [failedLoginAttempts]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-recipe-green mb-4" />
          <p className="text-lg text-gray-600 dark:text-gray-400">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 p-4">
      {/* Dark Mode Toggle */}
      <div className="absolute top-4 right-4">
        <motion.button
          onClick={toggleDarkMode}
          className="p-2 rounded-full border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Toggle Dark Mode"
        >
          {isDarkMode ? 
            <motion.div
              initial={{ rotate: -30, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Sun className="w-5 h-5 text-yellow-400" />
            </motion.div> : 
            <motion.div
              initial={{ rotate: 30, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Moon className="w-5 h-5 text-gray-800" />
            </motion.div>
          }
        </motion.button>
      </div>
      
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full mx-auto"
      >
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <motion.div
            className="flex justify-center"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <motion.div
              whileHover={{ rotate: [0, -10, 10, -10, 0], transition: { duration: 0.5 } }}
            >
              <CookingPot className="h-16 w-16 text-recipe-green dark:text-green-400" />
            </motion.div>
          </motion.div>
          <motion.h1
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-4 text-3xl font-bold tracking-tight text-gray-900 dark:text-white"
          >
            Recipe Genius
          </motion.h1>
          <motion.p
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-2 text-gray-600 dark:text-gray-400"
          >
            Your personal recipe assistant
          </motion.p>
        </div>
        
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5, type: "spring", stiffness: 100 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700"
        >
          {showForgotPassword ? (
            <div className="p-6">
              <ForgotPassword onBack={() => {
                setShowForgotPassword(false);
                setFailedLoginAttempts(0);
              }} />
            </div>
          ) : (
            <Tabs
              value={activeTab}
              onValueChange={(value) => setActiveTab(value as 'signin' | 'signup')}
              className="w-full"
            >
              <TabsList className="grid grid-cols-2 w-full rounded-none">
                <TabsTrigger
                  value="signin"
                  className="py-4 data-[state=active]:bg-gray-50 dark:data-[state=active]:bg-gray-700"
                >
                  Sign In
                </TabsTrigger>
                <TabsTrigger
                  value="signup"
                  className="py-4 data-[state=active]:bg-gray-50 dark:data-[state=active]:bg-gray-700"
                >
                  Create Account
                </TabsTrigger>
              </TabsList>
              <div className="p-6">
                <AnimatePresence mode="wait">
                  {showSuccessMessage ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3 }}
                      className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg text-center space-y-4"
                    >
                      <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
                      <h3 className="text-xl font-semibold text-green-700 dark:text-green-300">
                        Account Created!
                      </h3>
                      <p className="text-green-600 dark:text-green-400">
                        Your account has been created. Please check your email to confirm your registration.
                      </p>
                      <p className="text-sm text-green-500 dark:text-green-500">
                        Redirecting to sign in...
                      </p>
                    </motion.div>
                  ) : (
                    <>
                      {/* Sign In Tab */}
                      <TabsContent value="signin" className="mt-0">
                        <motion.form
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          exit={{ x: 20, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          onSubmit={handleSignIn}
                        >
                          <div className="space-y-4">
                            {/* Failed login attempts warning */}
                            {failedLoginAttempts > 0 && (
                              <motion.div 
                                className="bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 rounded-md p-3 flex items-start"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                transition={{ duration: 0.3 }}
                              >
                                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                                <div className="text-sm">
                                  <p>Login attempt failed. Please try again with the correct credentials.</p>
                                  {failedLoginAttempts > 1 && (
                                    <p className="mt-1">
                                      <button 
                                        onClick={() => setShowForgotPassword(true)}
                                        className="text-amber-900 dark:text-amber-100 underline font-medium"
                                      >
                                        Forgot your password?
                                      </button>
                                    </p>
                                  )}
                                </div>
                              </motion.div>
                            )}
                            
                            {/* Email Field */}
                            <div className="space-y-2">
                              <Label htmlFor="email" className="flex items-center text-gray-700 dark:text-gray-300">
                                <Mail className="w-4 h-4 mr-2" />
                                Email
                              </Label>
                              <Input
                                id="email"
                                type="email"
                                placeholder="your@email.com"
                                autoComplete="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full h-10 border-gray-300 dark:border-gray-600 focus:ring-recipe-green focus:border-recipe-green"
                              />
                            </div>
                            {/* Password Field */}
                            <div className="space-y-2">
                              <Label htmlFor="password" className="flex items-center text-gray-700 dark:text-gray-300">
                                <Lock className="w-4 h-4 mr-2" />
                                Password
                              </Label>
                              <div className="relative">
                                <Input
                                  id="password"
                                  type={showSignInPassword ? "text" : "password"}
                                  placeholder="••••••••"
                                  autoComplete="current-password"
                                  value={password}
                                  onChange={(e) => setPassword(e.target.value)}
                                  className="w-full h-10 pr-10 border-gray-300 dark:border-gray-600 focus:ring-recipe-green focus:border-recipe-green"
                                />
                                <motion.button
                                  type="button"
                                  onClick={() => setShowSignInPassword((prev) => !prev)}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none"
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                >
                                  <AnimatePresence mode="wait">
                                    {showSignInPassword ? (
                                      <motion.div
                                        key="eye-off"
                                        initial={{ opacity: 0, rotate: 20 }}
                                        animate={{ opacity: 1, rotate: 0 }}
                                        exit={{ opacity: 0, rotate: -20 }}
                                        transition={{ duration: 0.2 }}
                                      >
                                        <EyeOff className="w-5 h-5" />
                                      </motion.div>
                                    ) : (
                                      <motion.div
                                        key="eye"
                                        initial={{ opacity: 0, rotate: -20 }}
                                        animate={{ opacity: 1, rotate: 0 }}
                                        exit={{ opacity: 0, rotate: 20 }}
                                        transition={{ duration: 0.2 }}
                                      >
                                        <Eye className="w-5 h-5" />
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </motion.button>
                              </div>
                              <div className="flex justify-end">
                                <button
                                  type="button"
                                  onClick={() => setShowForgotPassword(true)}
                                  className="text-sm text-recipe-green hover:underline dark:text-green-400"
                                >
                                  Forgot password?
                                </button>
                              </div>
                            </div>
                            <motion.div
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <Button
                                type="submit"
                                className="w-full bg-recipe-green hover:bg-recipe-green/90 text-white"
                                disabled={isSubmitting}
                              >
                                {isSubmitting ? (
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                  <ArrowRight className="w-4 h-4 mr-2" />
                                )}
                                Sign In
                              </Button>
                            </motion.div>
                          </div>
                        </motion.form>
                      </TabsContent>
                      {/* Create Account Tab */}
                      <TabsContent value="signup" className="mt-0">
                        <motion.form
                          initial={{ x: 20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          exit={{ x: -20, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          onSubmit={handleSignUp}
                        >
                          <div className="space-y-4">
                            {/* Username Field */}
                            <div className="space-y-2">
                              <Label htmlFor="username" className="flex items-center text-gray-700 dark:text-gray-300">
                                <User className="w-4 h-4 mr-2" />
                                Username
                              </Label>
                              <Input
                                id="username"
                                placeholder="johndoe"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full border-gray-300 dark:border-gray-600 focus:ring-recipe-green focus:border-recipe-green"
                              />
                            </div>
                            {/* Email Field */}
                            <div className="space-y-2">
                              <Label htmlFor="new-email" className="flex items-center text-gray-700 dark:text-gray-300">
                                <Mail className="w-4 h-4 mr-2" />
                                Email
                              </Label>
                              <Input
                                id="new-email"
                                type="email"
                                placeholder="your@email.com"
                                autoComplete="email"
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                className="w-full border-gray-300 dark:border-gray-600 focus:ring-recipe-green focus:border-recipe-green"
                              />
                            </div>
                            {/* Password Field */}
                            <div className="space-y-2">
                              <Label htmlFor="new-password" className="flex items-center text-gray-700 dark:text-gray-300">
                                <Lock className="w-4 h-4 mr-2" />
                                Password
                              </Label>
                              <div className="relative">
                                <Input
                                  id="new-password"
                                  type={showSignUpPassword ? 'text' : 'password'}
                                  placeholder="••••••••"
                                  autoComplete="new-password"
                                  value={newPassword}
                                  onChange={(e) => setNewPassword(e.target.value)}
                                  className="w-full h-10 pr-10 border-gray-300 dark:border-gray-600 focus:ring-recipe-green focus:border-recipe-green"
                                />
                                <motion.button
                                  type="button"
                                  onClick={() => setShowSignUpPassword((prev) => !prev)}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none"
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                >
                                  <AnimatePresence mode="wait">
                                    {showSignUpPassword ? (
                                      <motion.div
                                        key="eye-off"
                                        initial={{ opacity: 0, rotate: 20 }}
                                        animate={{ opacity: 1, rotate: 0 }}
                                        exit={{ opacity: 0, rotate: -20 }}
                                        transition={{ duration: 0.2 }}
                                      >
                                        <EyeOff className="w-5 h-5" />
                                      </motion.div>
                                    ) : (
                                      <motion.div
                                        key="eye"
                                        initial={{ opacity: 0, rotate: -20 }}
                                        animate={{ opacity: 1, rotate: 0 }}
                                        exit={{ opacity: 0, rotate: 20 }}
                                        transition={{ duration: 0.2 }}
                                      >
                                        <Eye className="w-5 h-5" />
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </motion.button>
                              </div>
                            </div>
                            {/* Confirm Password Field */}
                            <div className="space-y-2">
                              <Label htmlFor="confirm-password" className="flex items-center text-gray-700 dark:text-gray-300">
                                <Lock className="w-4 h-4 mr-2" />
                                Confirm Password
                              </Label>
                              <div className="relative">
                                <Input
                                  id="confirm-password"
                                  type={showSignUpConfirmPassword ? 'text' : 'password'}
                                  placeholder="••••••••"
                                  autoComplete="new-password"
                                  value={confirmPassword}
                                  onChange={(e) => setConfirmPassword(e.target.value)}
                                  className="w-full h-10 pr-10 border-gray-300 dark:border-gray-600 focus:ring-recipe-green focus:border-recipe-green"
                                />
                                <motion.button
                                  type="button"
                                  onClick={() => setShowSignUpConfirmPassword((prev) => !prev)}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none"
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                >
                                  <AnimatePresence mode="wait">
                                    {showSignUpConfirmPassword ? (
                                      <motion.div
                                        key="eye-off"
                                        initial={{ opacity: 0, rotate: 20 }}
                                        animate={{ opacity: 1, rotate: 0 }}
                                        exit={{ opacity: 0, rotate: -20 }}
                                        transition={{ duration: 0.2 }}
                                      >
                                        <EyeOff className="w-5 h-5" />
                                      </motion.div>
                                    ) : (
                                      <motion.div
                                        key="eye"
                                        initial={{ opacity: 0, rotate: -20 }}
                                        animate={{ opacity: 1, rotate: 0 }}
                                        exit={{ opacity: 0, rotate: 20 }}
                                        transition={{ duration: 0.2 }}
                                      >
                                        <Eye className="w-5 h-5" />
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </motion.button>
                              </div>
                            </div>
                            <motion.div
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <Button
                                type="submit"
                                className="w-full bg-recipe-green hover:bg-recipe-green/90 text-white"
                                disabled={isSubmitting}
                              >
                                {isSubmitting ? (
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                  <ArrowRight className="w-4 h-4 mr-2" />
                                )}
                                Create Account
                              </Button>
                            </motion.div>
                          </div>
                        </motion.form>
                      </TabsContent>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </Tabs>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400"
        >
          <p>By signing in, you agree to our Terms of Service and Privacy Policy.</p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Auth;
