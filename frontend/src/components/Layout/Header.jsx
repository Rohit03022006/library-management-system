import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Navbar from "@/components/Layout/Navbar";
import {
  BookOpen,
  User,
  LogOut,
  Menu,
  X,
  Moon,
  Sun,
  Sparkles
} from "lucide-react";

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const getInitials = (name = "") =>
    name
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0]?.toUpperCase())
      .slice(0, 2)
      .join("") || "U";

  const getAvatarUrl = (user) => {
    if (!user || !user.avatar) return null;
    
    if (typeof user.avatar === 'string') {
      return user.avatar; 
    } else if (user.avatar.url) {
      return user.avatar.url; 
    } else if (user.avatar.thumbnailUrl) {
      return user.avatar.thumbnailUrl; 
    }
    
    return null;
  };

  const handleLogout = () => {
    logout();
    navigate("/");
    setMobileMenuOpen(false);
  };

  const avatarUrl = getAvatarUrl(user);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-primary-foreground/10 bg-primary/95 text-primary-foreground shadow-sm backdrop-blur-md transition-all">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          <Link to="/" className="group flex items-center space-x-2.5 outline-none">
            <motion.div 
              whileHover={{ rotate: 10, scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="bg-primary-foreground/10 p-2 rounded-xl transition-colors group-hover:bg-primary-foreground/20"
            >
              <BookOpen className="h-6 w-6 sm:h-7 sm:w-7 text-primary-foreground" />
            </motion.div>
            <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight leading-none group-hover:text-white/90 transition-colors">LibraFlow</span>
                <span className="text-[10px] font-medium opacity-60 uppercase tracking-widest">Library OS</span>
            </div>
          </Link>

          <div className="hidden md:block">
             <Navbar variant="desktop" />
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleDarkMode}
              className="relative p-2 rounded-full hover:bg-primary-foreground/10 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-foreground/20"
              title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={darkMode ? "dark" : "light"}
                  initial={{ y: -20, opacity: 0, rotate: -90 }}
                  animate={{ y: 0, opacity: 1, rotate: 0 }}
                  exit={{ y: 20, opacity: 0, rotate: 90 }}
                  transition={{ duration: 0.2 }}
                >
                  {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </motion.div>
              </AnimatePresence>
            </motion.button>

            {user ? (
              <div className="flex items-center pl-4 border-l border-primary-foreground/10 space-x-3">
                <div className="flex items-center space-x-3 bg-primary-foreground/10 rounded-full pl-1 pr-1.5 py-1 border border-primary-foreground/5 transition-all hover:bg-primary-foreground/15 hover:border-primary-foreground/10">
                    <Avatar className="h-8 w-8 border-2 border-primary/50">
                      <AvatarImage 
                        src={avatarUrl} 
                        alt={user.name}
                        className="object-cover"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                      <AvatarFallback className="bg-gradient-to-br from-accent to-accent/80 text-accent-foreground text-xs font-bold">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col text-left pr-2">
                      <span className="text-sm font-semibold leading-none truncate max-w-[100px]">
                        {user.name}
                      </span>
                      <span className="text-[10px] opacity-70 capitalize leading-tight">
                        {user.role}
                      </span>
                    </div>
                </div>
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleLogout}
                  className="rounded-full h-9 w-9 text-primary-foreground/70 hover:text-red-300 hover:bg-red-500/20 transition-all"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="hover:bg-primary-foreground/10 font-medium">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-semibold shadow-md transition-transform active:scale-95">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2 md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              className="rounded-full hover:bg-primary-foreground/10"
            >
               {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-primary-foreground/10"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
               <AnimatePresence mode="wait">
                  {mobileMenuOpen ? (
                    <motion.div
                        key="close"
                        initial={{ opacity: 0, rotate: -90 }}
                        animate={{ opacity: 1, rotate: 0 }}
                        exit={{ opacity: 0, rotate: 90 }}
                    >
                        <X className="h-6 w-6" />
                    </motion.div>
                  ) : (
                    <motion.div
                        key="menu"
                        initial={{ opacity: 0, rotate: 90 }}
                        animate={{ opacity: 1, rotate: 0 }}
                        exit={{ opacity: 0, rotate: -90 }}
                    >
                        <Menu className="h-6 w-6" />
                    </motion.div>
                  )}
               </AnimatePresence>
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="md:hidden overflow-hidden"
            >
              <div className="border-t border-primary-foreground/10 py-4 space-y-4">
                <Navbar 
                  variant="mobile" 
                  onItemClick={() => setMobileMenuOpen(false)} 
                />

                {user ? (
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="pt-4 border-t border-primary-foreground/10 mx-2"
                  >
                    <div className="bg-primary-foreground/5 rounded-xl p-4 mb-4 backdrop-blur-sm">
                        <div className="flex items-center space-x-4 mb-4">
                            <Avatar className="h-12 w-12 border-2 border-primary-foreground/20">
                                <AvatarImage 
                                    src={avatarUrl} 
                                    alt={user.name} 
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                />
                                <AvatarFallback className="bg-accent text-accent-foreground font-bold">
                                    {getInitials(user.name)}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <span className="block text-lg font-bold">{user.name}</span>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent/20 text-accent-foreground border border-accent/20 capitalize mt-1">
                                    {user.role}
                                </span>
                            </div>
                        </div>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleLogout}
                            className="w-full bg-red-500/10 text-red-200 hover:bg-red-500/20 hover:text-red-100 border border-red-500/20"
                        >
                            <LogOut className="h-4 w-4 mr-2" />
                            Sign Out
                        </Button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="pt-4 border-t border-primary-foreground/10 flex flex-col space-y-3 px-2"
                  >
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button variant="ghost" className="w-full justify-start hover:bg-primary-foreground/10 text-lg h-12">
                        Log In
                      </Button>
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button className="w-full bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-bold h-12">
                        Create Account
                      </Button>
                    </Link>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default Header;