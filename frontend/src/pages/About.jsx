import React from 'react'
import { motion } from 'framer-motion'
import { 
  Users, Target, Eye, Heart, BookOpen, Globe, Shield, Zap, 
  ArrowRight, Linkedin, Twitter, Mail 
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button' 


const values = [
  {
    icon: <Target className="h-6 w-6 text-primary" />,
    title: 'Our Mission',
    description: 'To revolutionize library management through innovative, user-centric technology solutions.'
  },
  {
    icon: <Eye className="h-6 w-6 text-primary" />,
    title: 'Our Vision',
    description: 'Creating seamless, borderless library experiences for the digital-native generation.'
  },
  {
    icon: <Heart className="h-6 w-6 text-primary" />,
    title: 'Our Values',
    description: 'We believe in radical innovation, universal accessibility, and community-driven development.'
  }
]

const stats = [
  { number: '500+', label: 'Libraries Served' },
  { number: '50K+', label: 'Books Managed' },
  { number: '99.9%', label: 'Uptime SLA' },
  { number: '24/7', label: 'Expert Support' }
]

const team = [
  { name: 'John Doe', role: 'Founder & CEO', image: '/api/placeholder/150/150' },
  { name: 'Jane Smith', role: 'Head of Engineering', image: '/api/placeholder/150/150' },
  { name: 'Mike Johnson', role: 'Lead Designer', image: '/api/placeholder/150/150' },
  { name: 'Sarah Wilson', role: 'Product Strategy', image: '/api/placeholder/150/150' }
]

const features = [
  {
    icon: <BookOpen className="h-5 w-5" />,
    title: 'Smart Catalog',
    description: 'AI-powered search & recommendations'
  },
  {
    icon: <Globe className="h-5 w-5" />,
    title: 'Cloud Native',
    description: 'Access your library from any device'
  },
  {
    icon: <Shield className="h-5 w-5" />,
    title: 'Bank-Grade Security',
    description: 'SOC2 compliant data protection'
  },
  {
    icon: <Zap className="h-5 w-5" />,
    title: 'Instant Sync',
    description: 'Real-time inventory updates'
  }
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
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

const About = () => {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <section className="relative bg-primary text-primary-foreground pt-20 pb-24 lg:pt-32 lg:pb-40 overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl translate-x-1/2 translate-y-1/2"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-4xl mx-auto"
          >
            <motion.div variants={itemVariants} className="inline-block mb-4 px-4 py-1.5 rounded-full bg-primary-foreground/10 border border-primary-foreground/20 text-sm font-medium backdrop-blur-sm">
              Reimagining Library Tech
            </motion.div>
            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight mb-6"
            >
              About <span className="text-accent-foreground/90">LibraFlow</span>
            </motion.h1>
            <motion.p
              variants={itemVariants}
              className="text-lg sm:text-xl lg:text-2xl text-primary-foreground/80 max-w-2xl mx-auto leading-relaxed mb-8"
            >
              We are building the operating system for modern libraries. 
              Empowering communities with knowledge, one digital solution at a time.
            </motion.p>
          </motion.div>
        </div>
      </section>

      <section className="relative -mt-16 mb-12 lg:mb-20 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="bg-card rounded-2xl shadow-xl border border-border p-8 lg:p-12 grid grid-cols-2 lg:grid-cols-4 gap-8 divide-x-0 lg:divide-x divide-border"
          >
            {stats.map((stat, index) => (
              <div key={index} className="text-center px-4">
                <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-primary mb-2 tracking-tight">
                  {stat.number}
                </div>
                <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
                Our Story
              </h2>
              <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
                <p>
                  Founded in 2024, LibraFlow emerged from a simple observation: 
                  <span className="text-foreground font-medium"> traditional library management systems were stuck in the 90s.</span>
                </p>
                <p>
                  We set out to create a solution that combines powerful functionality with the intuitive design of the consumer apps you use every day. We believe librarians shouldn't have to fight their software to do their jobs.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                    {features.map((feature, i) => (
                        <div key={i} className="flex items-start space-x-3">
                            <div className="mt-1 p-1 bg-primary/10 rounded text-primary">
                                {feature.icon}
                            </div>
                            <div>
                                <h4 className="font-semibold text-sm text-foreground">{feature.title}</h4>
                                <p className="text-xs text-muted-foreground">{feature.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-primary to-purple-500 rounded-2xl blur-2xl opacity-20 transform rotate-3"></div>
              <div className="relative bg-card rounded-2xl border border-border shadow-2xl overflow-hidden aspect-square sm:aspect-[4/3] flex items-center justify-center">
                 <div className="text-center p-8">
                    <motion.div 
                        animate={{ y: [0, -10, 0] }}
                        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                    >
                        <BookOpen className="h-24 w-24 text-primary/80 mx-auto mb-6" />
                    </motion.div>
                    <h3 className="text-2xl font-bold mb-2">Modern Infrastructure</h3>
                    <p className="text-muted-foreground">Connecting {stats[0].number} libraries worldwide</p>
                 </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24 bg-muted/40">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Core Principles</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">The values that guide our product roadmap and company culture.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                whileHover={{ y: -10, scale: 1.03 }}
              >
                <Card className="h-full border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card transition-colors duration-300">
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                      {value.icon}
                    </div>
                    <CardTitle className="text-xl">{value.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Meet the Team</h2>
            <p className="text-muted-foreground text-lg">Built by book lovers and code wizards.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group relative"
              >
                <div className="relative overflow-hidden rounded-xl bg-muted aspect-square mb-4">
<div className="w-full h-full bg-primary/20 flex items-center justify-center">
                    <Users className="w-1/2 h-1/2 text-primary/50" />
                  </div>
                  <div className="absolute inset-0 bg-primary/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                    <a href="#" className="p-2 bg-white rounded-full text-primary hover:text-primary-foreground hover:bg-primary border border-transparent hover:border-white transition-all duration-300 ease-in-out transform hover:scale-110">
                        <Linkedin size={18} />
                    </a>
                    <a href="#" className="p-2 bg-white rounded-full text-primary hover:text-primary-foreground hover:bg-primary border border-transparent hover:border-white transition-all duration-300 ease-in-out transform hover:scale-110">
                        <Twitter size={18} />
                    </a>
                    <a href="#" className="p-2 bg-white rounded-full text-primary hover:text-primary-foreground hover:bg-primary border border-transparent hover:border-white transition-all duration-300 ease-in-out transform hover:scale-110">
                        <Mail size={18} />
                    </a>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-foreground">{member.name}</h3>
                <p className="text-primary font-medium text-sm">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-white opacity-10"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-white opacity-5"></div>

        <div className="container mx-auto px-4 relative z-10 text-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
            >
                <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to Modernize Your Library?</h2>
                <p className="text-primary-foreground/80 text-lg md:text-xl max-w-2xl mx-auto mb-8">
                    Join 500+ institutions transforming their management systems today.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button size="lg" variant="secondary" className="font-semibold text-lg px-8">
                        Get Started
                    </Button>
                    <Button size="lg" variant="outline" className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary font-semibold text-lg px-8">
                        Contact Sales <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                </div>
            </motion.div>
        </div>
      </section>

    </div>
  )
}

export default About