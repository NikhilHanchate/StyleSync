import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getStorageItem, setStorageItem, seedInitialData } from "../utils/storage";
import { supabase, isConfigured } from "../utils/supabaseClient";
import { api } from "../utils/api";
import { User, UserRole } from "../types";
import { Scissors, Lock, Mail, User as UserIcon, Sparkles, AlertCircle, ArrowRight, UserPlus, Info, Eye, EyeOff } from "lucide-react";
import { motion } from "motion/react";

export default function Auth() {
  const navigate = useNavigate();

  // Make sure seeded data exists right away
  useEffect(() => {
    seedInitialData();
    // If user is already active, auto-route them out
    const active = getStorageItem<User | null>("currentUser", null);
    if (active) {
      handleRedirection(active.role);
    }
  }, []);

  // Auth Modes
  const [isLogin, setIsLogin] = useState<boolean>(true);

  // Form Fields
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [role, setRole] = useState<UserRole>("user");

  // State feedback
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  // Password rules validation
  const rules = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[@$!%*?&]/.test(password),
    match: password.length > 0 && password === confirmPassword,
  };

  const isPasswordValid = Object.values(rules).every(Boolean);

  // Handler for role-based redirects
  const handleRedirection = (userRole: UserRole) => {
    if (userRole === "admin") navigate("/admin/dashboard");
    else if (userRole === "owner") navigate("/owner/dashboard");
    else navigate("/user/dashboard");
  };

  // Login handler
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email || !password) {
      setError("Please fill out all credential blanks.");
      return;
    }

    try {
      if (!isConfigured) {
        // Local authentication bypass
        const allUsers = getStorageItem<User[]>("users", []);
        const matchingUser = allUsers.find(
          (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
        );
        if (!matchingUser) {
          setError("Invalid credentials for local demo user.");
          return;
        }
        if (matchingUser.status === "suspended") {
          setError("This account has been suspended by the platform administrator.");
          return;
        }
        setStorageItem("currentUser", matchingUser);
        setSuccess(`[Demo Mode] Welcome back, ${matchingUser.name}!`);
        setTimeout(() => {
          handleRedirection(matchingUser.role);
        }, 850);
        return;
      }

      // Authenticate securely with Supabase
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      // Successful login via Supabase. Load live matching profile from our Express backend
      const allUsers = await api.getUsers();
      let matchingUser = allUsers.find(
        (u) => u.id === data.user?.id || u.email.toLowerCase() === email.toLowerCase()
      );

      // Security block: If the user was suspended by the administrator in db.json
      if (matchingUser && matchingUser.status === "suspended") {
        await supabase.auth.signOut();
        setError("This account has been suspended by the platform administrator.");
        return;
      }

      // Synchronize database if missing profile details (self-healing mechanism)
      if (!matchingUser && data.user) {
        const assignedRole: UserRole = email.toLowerCase() === "admin@stylesync.com" ? "admin" : "user";
        matchingUser = {
          id: data.user.id,
          name: name || data.user.email?.split("@")[0] || "Stylist",
          email: data.user.email || email,
          password: password,
          role: assignedRole,
          status: "active",
        };
        await api.registerUser(matchingUser);
      }

      if (matchingUser) {
        setStorageItem("currentUser", matchingUser);
        setSuccess(`Welcome back, Royal Master ${matchingUser.name}!`);
        setTimeout(() => {
          handleRedirection(matchingUser.role);
        }, 850);
      }
    } catch (err: any) {
      console.error(err);
      setError("Could not connect to authentication services.");
    }
  };

  // Register handler
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name || !email || !password || !confirmPassword) {
      setError("All credentials must be fully declared.");
      return;
    }

    if (!isPasswordValid) {
      setError("Passphrase must fulfill all security strength rules listed below.");
      return;
    }

    try {
      if (!isConfigured) {
        // Local registration bypass
        const allUsers = getStorageItem<User[]>("users", []);
        if (allUsers.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
          setError("An account with this email already exists locally.");
          return;
        }
        const newUser: User = {
          id: `usr_${Date.now()}`,
          name,
          email,
          password,
          role,
          status: "active",
        };
        allUsers.push(newUser);
        setStorageItem("users", allUsers);
        setStorageItem("currentUser", newUser);
        setSuccess("[Demo Mode] Account successfully forged!");
        setTimeout(() => {
          handleRedirection(newUser.role);
        }, 850);
        return;
      }

      // Sign up the user in Supabase
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role,
          },
        },
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      if (!data.user) {
        setError("Failed to create secure user credentials.");
        return;
      }

      // Create synchronized user profile record on the Node.js Express server database
      const newUser: User = {
        id: data.user.id, // Ensure unified, identical UUIDs across Supabase and db.json!
        name,
        email,
        password,
        role,
        status: "active",
      };

      const createdUser = await api.registerUser(newUser);

      // Save active session
      setStorageItem("currentUser", createdUser);
      setSuccess("Account successfully forged! Entering platform...");
      setTimeout(() => {
        handleRedirection(createdUser.role);
      }, 850);
    } catch (err: any) {
      console.error(err);
      setError("Could not connect to registration services.");
    }
  };

  // Demo Login Quick-Triggers with self-healing registration bypass
  const triggerDemoAccount = async (demoEmail: string) => {
    setError("");
    setEmail(demoEmail);
    setPassword("password");
    setIsLogin(true);
    
    setTimeout(async () => {
      try {
        if (!isConfigured) {
          const allUsers = getStorageItem<User[]>("users", []);
          const matchingUser = allUsers.find(u => u.email.toLowerCase() === demoEmail.toLowerCase());
          if (matchingUser) {
            setStorageItem("currentUser", matchingUser);
            setSuccess(`[Demo Mode] Logging in as ${matchingUser.name}...`);
            setTimeout(() => {
              handleRedirection(matchingUser.role);
            }, 700);
          } else {
            setError("Demo user not found in local storage.");
          }
          return;
        }

        // Attempt to log in with Supabase Auth
        let { data, error: authError } = await supabase.auth.signInWithPassword({
          email: demoEmail,
          password: "password",
        });

        // Self-Healing: If user is not yet created in a fresh Supabase instance, auto-sign up!
        if (authError && authError.message.includes("Invalid login credentials")) {
          const allUsers = await api.getUsers();
          const localUser = allUsers.find(u => u.email.toLowerCase() === demoEmail.toLowerCase());
          const demoName = localUser ? localUser.name : (demoEmail === "admin@stylesync.com" ? "Platform Admin" : "Salon Owner");
          const demoRole = demoEmail === "admin@stylesync.com" ? "admin" : (demoEmail === "owner@stylesync.com" ? "owner" : "user");

          const signUpResult = await supabase.auth.signUp({
            email: demoEmail,
            password: "password",
            options: {
              data: {
                name: demoName,
                role: demoRole,
              }
            }
          });

          if (signUpResult.data.user) {
            const retrySignIn = await supabase.auth.signInWithPassword({
              email: demoEmail,
              password: "password",
            });
            data = retrySignIn.data;
            authError = retrySignIn.error;
          }
        }

        if (authError) {
          setError(authError.message);
          return;
        }

        // Successfully verified. Lookup profile details from Node.js database
        const allUsers = await api.getUsers();
        let matchingUser = allUsers.find(
          (u) => u.id === data.user?.id || u.email.toLowerCase() === demoEmail.toLowerCase()
        );

        if (!matchingUser && data.user) {
          const demoRole = demoEmail === "admin@stylesync.com" ? "admin" : (demoEmail === "owner@stylesync.com" ? "owner" : "user");
          const demoName = demoEmail === "admin@stylesync.com" ? "Platform Admin" : "Salon Owner";
          matchingUser = {
            id: data.user.id,
            name: demoName,
            email: demoEmail,
            password: "password",
            role: demoRole,
            status: "active",
          };
          await api.registerUser(matchingUser);
        }

        if (matchingUser) {
          setStorageItem("currentUser", matchingUser);
          setSuccess(`Demo Bypass: Logging in as ${matchingUser.name}...`);
          setTimeout(() => {
            handleRedirection(matchingUser.role);
          }, 700);
        }
      } catch (err) {
        console.error(err);
        setError("Bypass connection failed.");
      }
    }, 150);
  };

  return (
    <div id="stylesync-auth-page" className="min-h-screen flex items-center justify-center p-4 py-16 relative overflow-hidden bg-radial from-[#151821] to-[#08090c]">
      
      {/* Visual background lights */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-amber-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-yellow-500/5 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        
        {/* Top Branding Header */}
        <div className="text-center space-y-2 select-none">
          <div className="inline-flex p-3 bg-gradient-to-tr from-amber-600 to-yellow-400 rounded-2xl shadow-xl shadow-amber-500/5 hover:scale-105 transition-transform duration-300">
            <Scissors className="w-8 h-8 text-[#08090c] stroke-[2.5]" />
          </div>
          <h1 className="font-serif text-4xl font-extrabold text-white tracking-widest">
            Style<span className="text-yellow-400">Sync</span>
          </h1>
          <p className="text-xs uppercase tracking-[0.3em] font-medium text-amber-500/80 font-mono">
            Elite Barbering & System Services
          </p>
        </div>

        {/* Central Auth Login/Register Box */}
        <div className="bg-zinc-900/90 border border-zinc-800/80 rounded-2xl shadow-2xl p-6 sm:p-8 backdrop-blur-md relative overflow-hidden">
          
          {/* Top header indicator bar */}
          <div className="flex border-b border-zinc-800 pb-4 mb-6">
            <button
              onClick={() => {
                setIsLogin(true);
                setError("");
              }}
              className={`flex-1 text-center font-bold text-sm uppercase tracking-wider pb-2 border-b-2 transition-all ${
                isLogin
                  ? "border-amber-500 text-amber-400"
                  : "border-transparent text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setIsLogin(false);
                setError("");
              }}
              className={`flex-1 text-center font-bold text-sm uppercase tracking-wider pb-2 border-b-2 transition-all ${
                !isLogin
                  ? "border-amber-500 text-amber-400"
                  : "border-transparent text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Join Club
            </button>
          </div>

          {/* Form error/success output messages */}
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2.5 p-3.5 bg-red-500/10 border border-red-500/35 rounded-xl text-red-400 text-xs text-[11px] font-sans font-medium mb-4"
            >
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}

          {success && (
            <motion.div 
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2.5 p-3.5 bg-emerald-500/10 border border-emerald-500/35 rounded-xl text-emerald-400 text-xs text-[11px] font-sans font-medium mb-4"
            >
              <Sparkles className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>{success}</span>
            </motion.div>
          )}

          {/* Core Interactive Forms */}
          {isLogin ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] sm:text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-1.5 font-mono">
                  Gentleman's Email ID
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    required
                    placeholder="name@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-amber-500/60 rounded-xl text-zinc-200 text-sm focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] sm:text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-1.5 font-mono">
                  Security Passphrase
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-amber-500/60 rounded-xl text-zinc-200 text-sm focus:outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-amber-400 transition-colors focus:outline-none cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-4 py-3 bg-gradient-to-r from-amber-600 to-yellow-500 hover:brightness-110 active:scale-[0.99] transition-all rounded-xl font-bold uppercase tracking-wider text-xs text-[#0a0c10] flex items-center justify-center gap-2 cursor-pointer"
              >
                Sign Into Club Account <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] sm:text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-1.5 font-mono">
                  Full Honorable Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                    <UserIcon className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="Arthur Pendragon"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-amber-500/60 rounded-xl text-zinc-200 text-sm focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] sm:text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-1.5 font-mono">
                  Grooming Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    required
                    placeholder="arthur@stylesync.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-amber-500/60 rounded-xl text-zinc-200 text-sm focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] sm:text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-1.5 font-mono">
                  Secret Grooming Passphrase
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Enter secure password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-amber-500/60 rounded-xl text-zinc-200 text-sm focus:outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-amber-400 transition-colors focus:outline-none cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] sm:text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-1.5 font-mono">
                  Confirm Secret Passphrase
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    placeholder="Repeat secret passphrase"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-amber-500/60 rounded-xl text-zinc-200 text-sm focus:outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-amber-400 transition-colors focus:outline-none cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Dynamic Password Rules indicators */}
              <div className="p-3.5 bg-zinc-950/40 border border-zinc-850 rounded-xl space-y-2 select-none">
                <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-zinc-500 block">Passcode Integrity Rules</span>
                
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px] font-sans">
                  
                  {/* Rule 1 */}
                  <div className="flex items-center gap-1.5 transition-colors duration-250">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${rules.length ? 'bg-emerald-400' : 'bg-red-500'}`} />
                    <span className={rules.length ? 'text-zinc-300' : 'text-zinc-500'}>Min 8 characters</span>
                  </div>

                  {/* Rule 2 */}
                  <div className="flex items-center gap-1.5 transition-colors duration-250">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${rules.uppercase ? 'bg-emerald-400' : 'bg-red-500'}`} />
                    <span className={rules.uppercase ? 'text-zinc-300' : 'text-zinc-500'}>Uppercase letter</span>
                  </div>

                  {/* Rule 3 */}
                  <div className="flex items-center gap-1.5 transition-colors duration-250">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${rules.lowercase ? 'bg-emerald-400' : 'bg-red-500'}`} />
                    <span className={rules.lowercase ? 'text-zinc-300' : 'text-zinc-500'}>Lowercase letter</span>
                  </div>

                  {/* Rule 4 */}
                  <div className="flex items-center gap-1.5 transition-colors duration-250">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${rules.number ? 'bg-emerald-400' : 'bg-red-500'}`} />
                    <span className={rules.number ? 'text-zinc-300' : 'text-zinc-500'}>Numerical digit</span>
                  </div>

                  {/* Rule 5 */}
                  <div className="flex items-center gap-1.5 transition-colors duration-250">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${rules.special ? 'bg-emerald-400' : 'bg-red-500'}`} />
                    <span className={rules.special ? 'text-zinc-300' : 'text-zinc-500'}>Special char (@$!%*?&)</span>
                  </div>

                  {/* Rule 6 */}
                  <div className="flex items-center gap-1.5 transition-colors duration-250">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${rules.match ? 'bg-emerald-400' : 'bg-red-500'}`} />
                    <span className={rules.match ? 'text-zinc-300' : 'text-zinc-500'}>Passwords match</span>
                  </div>

                </div>
              </div>

              <div>
                <label className="block text-[10px] sm:text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-1.5 font-mono">
                  Select User Alliance Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 hover:border-zinc-700/80 focus:border-amber-500 rounded-xl text-zinc-200 text-sm focus:outline-none transition-colors"
                >
                  <option value="user">User (Book Grooming Chairs)</option>
                  <option value="owner">Salon Owner (Manage Salons & Staff)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full mt-4 py-3 bg-gradient-to-r from-amber-600 to-yellow-500 hover:brightness-110 active:scale-[0.99] transition-all rounded-xl font-bold uppercase tracking-wider text-xs text-[#0a0c10] flex items-center justify-center gap-2 cursor-pointer"
              >
                Register Member Account <UserPlus className="w-4 h-4" />
              </button>
            </form>
          )}

        </div>

        {/* Quick Bypass / Demo Shortcut triggers */}
        <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-ea-2xl rounded-2xl p-4.5 space-y-3.5 shadow-xl relative overflow-hidden backdrop-blur-sm">
          <div className="flex items-center gap-2 text-zinc-400">
            <Info className="w-4 h-4 text-yellow-400" />
            <span className="text-[11px] uppercase tracking-wider font-bold">One-Tap Demo Portal Shortcuts</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              onClick={() => triggerDemoAccount("user@stylesync.com")}
              className="p-2.5 bg-zinc-950 hover:bg-zinc-800/80 border border-zinc-800/80 hover:border-zinc-700 rounded-xl text-left transition-all cursor-pointer group"
            >
              <div className="text-[9px] font-mono uppercase tracking-wider font-semibold text-zinc-4 text-zinc-400">Client Chair</div>
              <div className="text-xs font-bold text-emerald-400 group-hover:text-emerald-300 mt-0.5 truncate">Arthur Pendragon</div>
            </button>
            
            <button
              onClick={() => triggerDemoAccount("owner@stylesync.com")}
              className="p-2.5 bg-zinc-950 hover:bg-zinc-800/80 border border-zinc-800/80 hover:border-zinc-700 rounded-xl text-left transition-all cursor-pointer group"
            >
              <div className="text-[9px] font-mono uppercase tracking-wider font-semibold text-zinc-4 text-zinc-400">Salon Partner</div>
              <div className="text-xs font-bold text-yellow-400 group-hover:text-yellow-300 mt-0.5 truncate font-mono">owner@stylesync</div>
            </button>
            
            <button
              onClick={() => triggerDemoAccount("admin@stylesync.com")}
              className="p-2.5 bg-zinc-950 hover:bg-zinc-800/80 border border-zinc-800/80 hover:border-zinc-700 rounded-xl text-left transition-all cursor-pointer group"
            >
              <div className="text-[9px] font-mono uppercase tracking-wider font-semibold text-zinc-4 text-zinc-400">Platform Admin</div>
              <div className="text-xs font-bold text-amber-500 group-hover:text-amber-400 mt-0.5 truncate font-mono">admin@stylesync</div>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
