import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { 
  BookOpen, Users, BarChart3, Shield, Zap, 
  Smartphone, Cloud, Lock, Globe, Sparkles, ArrowRight
} from 'lucide-react'

const FeaturesSection = () => {
  const features = [
    {
      icon: <BookOpen className="h-6 w-6" />,
      title: 'Digital Catalog',
      description: 'AI-powered search with intelligent recommendations, fuzzy matching, and real-time availability tracking.',
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      border: 'group-hover:border-blue-500/50'
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: 'Member Portal',
      description: 'Self-service portal allowing users to manage loans, hold reservations, and pay fines securely online.',
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
      border: 'group-hover:border-purple-500/50'
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: 'Deep Analytics',
      description: 'Visual dashboards providing actionable insights into circulation trends, inventory health, and member activity.',
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
      border: 'group-hover:border-emerald-500/50'
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: 'Enterprise Security',
      description: 'Bank-grade encryption, role-based access control (RBAC), and automated hourly off-site backups.',
      color: 'text-rose-500',
      bg: 'bg-rose-500/10',
      border: 'group-hover:border-rose-500/50'
    },
    {
      icon: <Smartphone className="h-6 w-6" />,
      title: 'Mobile First',
      description: 'A responsive Progressive Web App (PWA) experience that works flawlessly on tablets and smartphones.',
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
      border: 'group-hover:border-amber-500/50'
    },
    {
      icon: <Cloud className="h-6 w-6" />,
      title: 'Cloud Native',
      description: 'Zero maintenance infrastructure built on AWS with 99.9% uptime SLA and instant global scaling.',
      color: 'text-cyan-500',
      bg: 'bg-cyan-500/10',
      border: 'group-hover:border-cyan-500/50'
    }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  }

  return (
    <section className="relative py-24 lg:py-32 px-4 overflow-hidden bg-background">
      
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl opacity-50 mix-blend-multiply filter"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl opacity-50 mix-blend-multiply filter"></div>
        
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      </div>

      <div className="container mx-auto max-w-7xl relative z-10">
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-50px" }}
          className="text-center mb-16 lg:mb-24"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-primary text-sm font-semibold mb-6 shadow-sm backdrop-blur-sm"
          >
            <Sparkles className="h-4 w-4" />
            <span>Core Capabilities</span>
          </motion.div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground mb-6 tracking-tight leading-[1.1]">
            Everything you need to <br className="hidden md:block" />
            run a <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-primary bg-300% animate-gradient">Modern Library</span>
          </h2>
          
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            We've reimagined the library management stack from the ground up. Powerful, intuitive, and built for the future.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              className="h-full"
            >
              <div className={`group relative h-full rounded-3xl bg-card border border-border/50 hover:border-border transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 overflow-hidden flex flex-col`}>
                
                <div className="absolute inset-0 opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500 pointer-events-none bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-[size:16px_16px] dark:bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)]"></div>
                
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-${feature.color.split('-')[1]}-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>

                <div className="p-8 flex flex-col h-full relative z-10">

<div className="mb-6">
                    <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl ${feature.bg} ${feature.color} transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-sm`}>
                      {feature.icon}
                    </div>
                  </div>
                  
                  
                  <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors duration-300">
                    {feature.title}
                  </h3>
                  
                  <p className="text-muted-foreground leading-relaxed text-sm sm:text-base mb-8 flex-grow">
                    {feature.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default FeaturesSection