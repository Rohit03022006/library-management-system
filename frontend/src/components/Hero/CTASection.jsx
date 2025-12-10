import React from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { ArrowRight, Star, CheckCircle2, Quote } from 'lucide-react'

const CTASection = () => {
  const { user } = useAuth()

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Director @ City Library",
      content: "LibraFlow transformed our operations. We've seen a 40% increase in engagement!",
      avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d"
    },
    {
      name: "Michael Chen",
      role: "Head of IT, UniTech",
      content: "The API integration was seamless. Best documentation I've seen in years.",
      avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d"
    }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  }

  return (
    <section className="relative py-24 lg:py-32 overflow-hidden bg-black text-white">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-950 to-black"></div>
        
        <motion.div 
          animate={{ scale: [1, 1.2, 1], x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-white/5 rounded-full blur-[120px]"
        />
        <motion.div 
          animate={{ scale: [1.2, 1, 1.2], x: [0, -50, 0], y: [0, -30, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-neutral-800/10 rounded-full blur-[120px]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="text-center lg:text-left"
          >
            <motion.div variants={itemVariants} className="flex items-center justify-center lg:justify-start -space-x-3 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-black bg-neutral-900 flex items-center justify-center overflow-hidden">
                   <img src={`https://i.pravatar.cc/150?u=${i + 20}`} alt="User" className="w-full h-full object-cover grayscale opacity-80" />
                </div>
              ))}
              <div className="w-10 h-10 rounded-full border-2 border-black bg-neutral-900 text-white text-xs font-bold flex items-center justify-center">
                2k+
              </div>
              <div className="ml-4 flex items-center gap-1">
                 <div className="flex text-white">
                    {[1,2,3,4,5].map(s => <Star key={s} className="w-3 h-3 fill-current" />)}
                 </div>
                 <span className="text-neutral-400 text-xs font-medium">from happy librarians</span>
              </div>
            </motion.div>

            <motion.h2
              variants={itemVariants}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6 tracking-tight leading-tight"
            >
              Ready to modernize <br />
              your <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-200 to-neutral-500">workflow?</span>
            </motion.h2>
            
            <motion.p
              variants={itemVariants}
              className="text-lg sm:text-xl text-neutral-400 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed"
            >
              Join the fastest-growing library management platform. 
              Start your 14-day free trial today. No credit card required.
            </motion.p>
            
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-10"
            >
              <Link to={user ? "/dashboard" : "/register"} className="w-full sm:w-auto">
                <Button 
                  size="xl" 
                  className="w-full sm:w-auto bg-white text-black hover:bg-neutral-200 hover:scale-105 transition-all duration-300 font-bold h-14 px-8 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.1)] relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-neutral-300/40 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                  <span className="relative flex items-center">
                    {user ? 'Go to Dashboard' : 'Get Started Now'}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </span>
                </Button>
              </Link>
              <Link to="/contact" className="w-full sm:w-auto">
                <Button 
                  variant="outline" 
                  size="xl"
                  className="w-full sm:w-auto border-neutral-700 text-white bg-transparent hover:bg-white hover:text-black h-14 px-8 rounded-full font-semibold transition-colors"
                >
                  Book a Demo
                </Button>
              </Link>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-3 text-sm text-neutral-400 font-medium"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-white" />
                <span>Instant Setup</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-white" />
                <span>Cancel Anytime</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-white" />
                <span>24/7 Support</span>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative hidden lg:block"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent rounded-full blur-2xl"></div>

            <div className="relative space-y-6">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ x: index % 2 === 0 ? -20 : 20, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 + (index * 0.1) }}
                  whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                  className={`bg-neutral-900/50 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-2xl max-w-md ${index % 2 !== 0 ? 'ml-auto' : ''}`}
                >
                  <Quote className="h-8 w-8 text-neutral-600 mb-3 absolute top-6 right-6" />
                  <p className="text-neutral-200 text-lg leading-relaxed mb-4 font-medium">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center gap-4">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full border-2 border-white/10 grayscale"
                    />
                    <div>
                      <div className="font-bold text-white">{testimonial.name}</div>
                      <div className="text-sm text-neutral-500">{testimonial.role}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
          
        </div>
      </div>
    </section>
  )
}

export default CTASection