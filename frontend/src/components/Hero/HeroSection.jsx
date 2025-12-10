import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { BookOpen, Users, BarChart3, ArrowRight, Play, Star, Shield, Zap, CheckCircle2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

const HeroSection = () => {
  const { user } = useAuth()
  const scrollRefs = useRef([])
  const [currentFeature, setCurrentFeature] = useState(0)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
          }
        })
      },
      { threshold: 0.1 }
    )

    scrollRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref)
    })

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const features = [
    {
      icon: <BookOpen className="h-6 w-6 text-white" />,
      title: 'Smart Digital Catalog',
      description: 'AI-powered search and recommendation system with thousands of books.',
      color: 'from-blue-500 to-cyan-500',
      bg_color: 'bg-blue-500'
    },
    {
      icon: <Users className="h-6 w-6 text-white" />,
      title: 'Member Management',
      description: 'Streamlined user management with automated notifications and reminders.',
      color: 'from-purple-500 to-pink-500',
      bg_color: 'bg-purple-500'
    },
    {
      icon: <BarChart3 className="h-6 w-6 text-white" />,
      title: 'Advanced Analytics',
      description: 'Real-time insights and predictive analytics for better decision making.',
      color: 'from-emerald-500 to-green-500',
      bg_color: 'bg-emerald-500'
    },
    {
      icon: <Shield className="h-6 w-6 text-white" />,
      title: 'Secure & Reliable',
      description: 'Enterprise-grade security with 99.9% uptime guarantee.',
      color: 'from-orange-500 to-red-500',
      bg_color: 'bg-orange-500'
    }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden relative selection:bg-primary/20">      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute -top-[10%] -right-[10%] w-[500px] h-[500px] bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
          animate={{ 
            scale: [1, 1.2, 1],
            x: [0, -20, 0],
            y: [0, 20, 0]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute top-[20%] -left-[10%] w-[400px] h-[400px] bg-purple-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
          animate={{ 
            scale: [1.2, 1, 1.2],
            x: [0, 20, 0],
            y: [0, -20, 0]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-[10%] left-[20%] w-[600px] h-[600px] bg-blue-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
          animate={{ 
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="container mx-auto px-4 pt-20 sm:pt-28 pb-12 sm:pb-16 relative z-10">
        <div className="text-center mb-16 lg:mb-24">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center"
          >
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center px-4 py-1.5 rounded-full bg-background border border-border shadow-sm mb-8 backdrop-blur-sm hover:border-primary/50 transition-colors cursor-default"
            >
              <span className="relative flex h-2 w-2 mr-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-sm font-medium text-muted-foreground">LibraFlow is now live</span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-6xl md:text-7xl font-extrabold mb-6 tracking-tight leading-[1.1]"
            >
              Library Management
              <br className="hidden sm:block" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-primary bg-300% animate-gradient">
                 Reimagined for Humans
              </span>
            </motion.h1>
            
            <motion.p
              variants={itemVariants}
              className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              Streamline operations, engage members, and unlock powerful insights with an AI-driven system designed for the modern age.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
            >
              <Link to={user ? "/dashboard" : "/register"} className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto text-lg h-12 px-8 shadow-lg shadow-primary/25 rounded-xl font-semibold">
                  {user ? 'Go to Dashboard' : 'Get Started Free'}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/about" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg h-12 px-8 rounded-xl bg-background/50 backdrop-blur-sm border-border hover:bg-background/80">
                  <Play className="h-4 w-4 mr-2 fill-foreground" />
                  Watch Demo
                </Button>
              </Link>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="mt-12 pt-8 border-t border-border/50 grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-4 text-sm font-medium text-muted-foreground"
            >
               <div className="flex items-center justify-center gap-2">
                  <Shield className="h-4 w-4 text-emerald-500" /> SOC2 Compliant
               </div>
               <div className="flex items-center justify-center gap-2">
                  <Zap className="h-4 w-4 text-amber-500" />  100ms Latency
               </div>
               <div className="flex items-center justify-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" /> 4.9/5 Rating
               </div>
               <div className="flex items-center justify-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-500" /> 99.9% Uptime
               </div>
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-6xl mx-auto"
        >
          <div className="relative group">
            <div className={`absolute -inset-1 bg-gradient-to-r ${features[currentFeature].color} rounded-[2rem] blur opacity-20 group-hover:opacity-30 transition duration-1000`}></div>
            
            <div className="relative bg-card rounded-[1.75rem] border border-border shadow-2xl overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                
                <div className="p-8 sm:p-12 flex flex-col justify-center relative overflow-hidden">
                   <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${features[currentFeature].color} opacity-5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2`}></div>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentFeature}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.4 }}
                      className="relative z-10"
                    >
                      <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${features[currentFeature].color} shadow-lg mb-6`}>
                        {features[currentFeature].icon}
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-bold mb-4 text-foreground">
                        {features[currentFeature].title}
                      </h3>
                      <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                        {features[currentFeature].description}
                      </p>
                    </motion.div>
                  </AnimatePresence>

                  <div className="flex space-x-3 mt-auto pt-4">
                    {features.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentFeature(index)}
                        className="group/indicator relative h-2 cursor-pointer py-2"
                        aria-label={`Go to slide ${index + 1}`}
                      >
                         <div className={`h-1.5 rounded-full transition-all duration-500 ease-out ${
                          index === currentFeature 
                            ? `w-12 ${features[currentFeature].bg_color}` 
                            : 'w-2 bg-muted-foreground/30 group-hover/indicator:bg-muted-foreground/50'
                        }`} />
                      </button>
                    ))}
                  </div>
                </div>

<div className="bg-muted/30 border-l border-border/50 p-8 sm:p-12 flex items-center justify-center relative overflow-hidden">
    <div className="w-full max-w-md aspect-[4/3] bg-background rounded-xl border border-border/60 shadow-2xl flex flex-col overflow-hidden relative z-10">
        <div className="h-8 border-b border-border/50 flex items-center justify-between px-4 bg-muted/40">
            <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400/80"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400/80"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-green-400/80"></div>
            </div>
            <div className="h-4 w-32 bg-background border border-border/50 rounded flex items-center px-2">
                <span className="text-[6px] text-muted-foreground">libraflow.app/dashboard</span>
            </div>
            <div className="w-2.5"></div> 
        </div>
        
        <div className="flex-1 flex overflow-hidden">
            
            <div className="w-16 border-r border-border/50 bg-muted/20 flex flex-col items-center py-4 gap-4">
                <div className={`w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary`}>
                    <div className="w-4 h-4 rounded bg-current opacity-50" />
                </div>
                <div className="w-full px-3 space-y-2">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-8 w-full rounded-md bg-transparent hover:bg-muted/50 transition-colors flex items-center justify-center">
                             <div className="w-4 h-1.5 rounded-full bg-muted-foreground/20" />
                        </div>
                    ))}
                </div>
            </div>
            
            <div className="flex-1 p-5 flex flex-col gap-4 bg-background/50">
                
                <div className="flex justify-between items-end mb-1">
                    <div>
                        <div className="text-[10px] font-semibold text-foreground">
                            {features[currentFeature].title.split(' ')[0]} Overview
                        </div>
                        <div className="text-[8px] text-muted-foreground">Updated just now</div>
                    </div>
                    <div className={`h-6 w-6 rounded-full ${features[currentFeature].bg_color} opacity-20 flex items-center justify-center`}>
                        <div className="w-3 h-3 bg-current rounded-full opacity-50" />
                    </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 h-full">
                    
                    <motion.div 
                        key={`card-1-${currentFeature}`}
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="rounded-lg border border-border/60 bg-card p-3 flex flex-col justify-between shadow-sm"
                    >
                        <div className="flex items-start justify-between">
                             <div className="text-[8px] font-medium text-muted-foreground">Total Active</div>
                             <div className={`text-[8px] font-bold ${features[currentFeature].color.split(' ')[0].replace('from-', 'text-')}`}>+12%</div>
                        </div>
                        <div className="text-xl font-bold tracking-tight text-foreground">
                            {currentFeature === 0 ? '14,203' : currentFeature === 1 ? '8,420' : '99.9%'}
                        </div>
                        <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                            <motion.div 
                                className={`h-full ${features[currentFeature].bg_color}`} 
                                initial={{ width: "0%" }}
                                animate={{ width: "65%" }}
                                transition={{ duration: 1, ease: "easeOut" }}
                            />
                        </div>
                    </motion.div>

                    <motion.div 
                        key={`card-2-${currentFeature}`}
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.15 }}
                        className="rounded-lg border border-border/60 bg-card p-3 flex flex-col justify-between shadow-sm"
                    >
                         <div className="text-[8px] font-medium text-muted-foreground">
                            {currentFeature === 0 ? 'Borrowed' : currentFeature === 1 ? 'New Users' : 'Requests'}
                         </div>
                         <div className="flex items-end gap-1 h-8">
                            <div className="w-1/5 h-[40%] bg-foreground/10 rounded-t-sm"></div>
                            <div className="w-1/5 h-[70%] bg-foreground/20 rounded-t-sm"></div>
                            <div className={`w-1/5 h-[50%] ${features[currentFeature].bg_color} opacity-50 rounded-t-sm`}></div>
                            <div className={`w-1/5 h-[90%] ${features[currentFeature].bg_color} rounded-t-sm`}></div>
                            <div className="w-1/5 h-[60%] bg-foreground/10 rounded-t-sm"></div>
                         </div>
                    </motion.div>

                    <motion.div 
                        key={`card-3-${currentFeature}`}
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="col-span-2 rounded-lg border border-border/60 bg-card p-3 flex flex-col gap-2 shadow-sm"
                    >
                        <div className="text-[8px] font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Recent Activity</div>
                        
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded bg-muted flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <div className="h-1.5 w-16 bg-foreground/10 rounded mb-1" />
                                <div className="h-1 w-10 bg-muted-foreground/20 rounded" />
                            </div>
                            <div className="h-1.5 w-8 bg-muted rounded" />
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded bg-muted flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <div className="h-1.5 w-20 bg-foreground/10 rounded mb-1" />
                                <div className="h-1 w-8 bg-muted-foreground/20 rounded" />
                            </div>
                            <div className="h-1.5 w-8 bg-muted rounded" />
                        </div>
                    </motion.div>
                    
                </div>
            </div>
        </div>
    </div>

    <motion.div 
        className={`absolute top-8 right-8 w-24 h-24 rounded-full blur-3xl opacity-40 ${features[currentFeature].bg_color}`}
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 4, repeat: Infinity }}
    />
</div>

              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default HeroSection