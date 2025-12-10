import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import { booksAPI, usersAPI, borrowAPI } from '@/lib/api'
import { BookOpen, Users, Repeat, Library, Activity, Star, Clock, Globe } from 'lucide-react'

const StatsSection = () => {
  const { user } = useAuth()
  const [stats, setStats] = React.useState({
    totalBooks: 0,
    totalUsers: 0,
    activeBorrows: 0,
    availableBooks: 0
  })

  React.useEffect(() => {
    if (user) {
      fetchStats()
    }
  }, [user])

  const fetchStats = async () => {
    try {
      const [booksRes, usersRes, borrowsRes] = await Promise.all([
        booksAPI.getAnalytics(),
        usersAPI.getStats(),
        borrowAPI.getAll({ status: 'borrowed', limit: 1 })
      ])

      setStats({
        totalBooks: booksRes.data.totalBooks || 12543,
        totalUsers: usersRes.data.totalUsers || 8421,
        activeBorrows: borrowsRes.data.total || 1567,
        availableBooks: booksRes.data.availableBooks || 8934
      })
    } catch (error) {
      setStats({
        totalBooks: 12543,
        totalUsers: 8421,
        activeBorrows: 1567,
        availableBooks: 8934
      })
    }
  }

  const icons = [
    { icon: <BookOpen className="h-6 w-6" />, color: "text-blue-200" },
    { icon: <Users className="h-6 w-6" />, color: "text-purple-200" },
    { icon: <Repeat className="h-6 w-6" />, color: "text-amber-200" },
    { icon: <Library className="h-6 w-6" />, color: "text-emerald-200" }
  ]

  const statItems = [
    {
      label: 'Books in Collection',
      value: stats.totalBooks.toLocaleString(),
      description: 'Total books available in digital catalog'
    },
    {
      label: 'Active Members',
      value: stats.totalUsers.toLocaleString(),
      description: 'Registered library members'
    },
    {
      label: 'Books Borrowed',
      value: stats.activeBorrows.toLocaleString(),
      description: 'Currently active borrows'
    },
    {
      label: 'Available Now',
      value: stats.availableBooks.toLocaleString(),
      description: 'Books ready for borrowing'
    }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  }

  const counterVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: (custom) => ({
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        delay: custom * 0.1,
        ease: "easeOut"
      }
    })
  }

  return (
    <section className="relative py-20 lg:py-32 overflow-hidden bg-primary text-primary-foreground selection:bg-white/20">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-white/5 rounded-full blur-[120px] mix-blend-soft-light -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-500/20 rounded-full blur-[100px] mix-blend-overlay translate-y-1/2"></div>
        
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
      </div>

      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-50px" }}
          className="text-center mb-16 lg:mb-20"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-xs font-medium mb-6 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Live Statistics
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 tracking-tight">
            Impact by the Numbers
          </h2>
          <p className="text-lg sm:text-xl text-primary-foreground/70 max-w-2xl mx-auto leading-relaxed">
            Empowering communities with knowledge. See how LibraFlow is transforming library engagement in real-time.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-20"
        >
          {statItems.map((stat, index) => (
            <motion.div
              key={stat.label}
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="h-full group"
            >
              <div className="relative h-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:shadow-2xl hover:shadow-black/20">
                <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/5 blur-2xl transition-all duration-500 group-hover:bg-white/10" />

                <div className="relative flex flex-col items-center text-center">
                  <div className={`mb-4 p-3 rounded-xl bg-white/5 border border-white/10 ${icons[index].color} shadow-inner`}>
                    {icons[index].icon}
                  </div>
                  
                  <motion.div 
                    className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-3 tracking-tight tabular-nums"
                    variants={counterVariants}
                    custom={index}
                  >
                    {stat.value}
                  </motion.div>
                  
                  <h3 className="text-sm font-semibold text-primary-foreground/90 uppercase tracking-wider mb-2">
                    {stat.label}
                  </h3>
                  
                  <p className="text-primary-foreground/60 text-xs sm:text-sm leading-relaxed">
                    {stat.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="relative rounded-2xl border border-white/10 bg-black/20 backdrop-blur-md p-6 lg:p-8"
        >
           <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0 lg:divide-x divide-white/10">
              <div className="flex flex-col items-center justify-center gap-2">
                 <div className="flex items-center gap-2 text-emerald-300">
                    <Activity className="h-5 w-5" />
                    <span className="text-2xl font-bold">99.9%</span>
                 </div>
                 <span className="text-sm text-primary-foreground/60 font-medium">System Uptime</span>
              </div>

              <div className="flex flex-col items-center justify-center gap-2">
                 <div className="flex items-center gap-2 text-yellow-300">
                    <Star className="h-5 w-5 fill-yellow-300" />
                    <span className="text-2xl font-bold">4.9/5</span>
                 </div>
                 <span className="text-sm text-primary-foreground/60 font-medium">User Rating</span>
              </div>

              <div className="flex flex-col items-center justify-center gap-2">
                 <div className="flex items-center gap-2 text-blue-300">
                    <Clock className="h-5 w-5" />
                    <span className="text-2xl font-bold">24/7</span>
                 </div>
                 <span className="text-sm text-primary-foreground/60 font-medium">Support Access</span>
              </div>

              <div className="flex flex-col items-center justify-center gap-2">
                 <div className="flex items-center gap-2 text-purple-300">
                    <Globe className="h-5 w-5" />
                    <span className="text-2xl font-bold">500+</span>
                 </div>
                 <span className="text-sm text-primary-foreground/60 font-medium">Global Libraries</span>
              </div>
           </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <p className="text-primary-foreground/50 text-xs font-semibold uppercase tracking-widest mb-6">
            Trusted ecosystem for
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {['University', 'Public Library', 'School', 'Corporate', 'Research Center'].map((type, index) => (
              <motion.span
                key={type}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.7 + index * 0.05 }}
                whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.15)" }}
                className="px-4 py-2 rounded-full border border-white/10 bg-white/5 text-primary-foreground/80 text-sm font-medium cursor-default transition-colors"
              >
                {type}
              </motion.span>
            ))}
          </div>
        </motion.div>

      </div>
    </section>
  )
}

export default StatsSection