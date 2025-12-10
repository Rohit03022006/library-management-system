import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Home, ArrowLeft, FileQuestion, Search } from 'lucide-react'

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground relative overflow-hidden p-4">
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
        <span className="text-[20rem] font-black text-muted/20 opacity-50 transform -rotate-12 translate-y-10">
          404
        </span>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-lg"
      >
        <Card className="border border-border shadow-2xl bg-card/80 backdrop-blur-xl">
          <CardContent className="flex flex-col items-center text-center p-12">
            
            <motion.div 
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              transition={{ 
                repeat: Infinity, 
                repeatType: "reverse", 
                duration: 2, 
                ease: "easeInOut" 
              }}
              className="bg-muted p-4 rounded-full mb-6"
            >
              <FileQuestion className="h-12 w-12 text-muted-foreground" />
            </motion.div>

            <h1 className="text-4xl font-extrabold tracking-tight mb-3">Page Not Found</h1>
            <p className="text-muted-foreground mb-8 leading-relaxed max-w-xs mx-auto">
              We couldn't find the page you were looking for. It might have been removed or the link is broken.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Button asChild className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary h-11">
                <Link to="/">
                  <Home className="h-4 w-4 mr-2" />
                  Back Home
                </Link>
              </Button>
              <Button variant="outline" asChild className="flex-1 h-11 border-input hover:text-primary hover:bg-muted">
                <Link to="/books">
                  <Search className="h-4 w-4 mr-2" />
                  Browse Library
                </Link>
              </Button>
            </div>

          </CardContent>
        </Card>
        
        <div className="text-center mt-8">
          <Link 
            to="/contact" 
            className="text-sm text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline"
          >
            Report a problem
          </Link>
        </div>

      </motion.div>
    </div>
  )
}

export default NotFound