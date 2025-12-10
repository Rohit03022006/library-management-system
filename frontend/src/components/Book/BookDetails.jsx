import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  BookOpen, User, Calendar, MapPin, 
  Tag, Globe, Hash, X, Bookmark,
  Loader2, Image as ImageIcon, Info, Layers
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

const BookDetails = ({ book, onClose, onBorrow }) => {
  const { user, hasPermission } = useAuth()
  const [borrowLoading, setBorrowLoading] = useState(false)

  const handleBorrowClick = async () => {
    setBorrowLoading(true)
    try {
      await onBorrow(book._id, book.title)
      onClose()
    } catch (error) {
    } finally {
      setBorrowLoading(false)
    }
  }

  const slideVariants = {
    hidden: { x: '100%', opacity: 0 },
    visible: { 
      x: 0, 
      opacity: 1, 
      transition: { type: 'spring', damping: 30, stiffness: 300 } 
    },
    exit: { 
      x: '100%', 
      opacity: 0, 
      transition: { duration: 0.3, ease: 'easeInOut' } 
    }
  }

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  }

  return (
    <AnimatePresence>
      <motion.div
        variants={backdropVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      <motion.div
        variants={slideVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="fixed inset-y-0 right-0 z-50 w-full max-w-md sm:max-w-lg bg-card border-l border-border shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-background/50 backdrop-blur-md sticky top-0 z-10">
          <h2 className="text-lg font-bold leading-tight flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Book Details
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-destructive/10 hover:text-destructive">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-background">
          <div className="space-y-8">
            <div className="flex flex-col items-center text-center space-y-4">
              <motion.div 
                className="w-32 h-48 sm:w-40 sm:h-60 rounded-lg shadow-xl overflow-hidden bg-muted border border-border relative group"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                {book.coverImage?.url ? (
                  <img 
                    src={book.coverImage.url} 
                    alt={`Cover of ${book.title}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50 flex flex-col items-center justify-center p-4">
                    <BookOpen className="h-10 w-10 text-muted-foreground/30 mb-2" />
                    <span className="text-xs text-muted-foreground/50 font-medium">No Cover</span>
                  </div>
                )}
                <div className="absolute top-2 right-2">
                   <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm border ${
                      book.status === 'available' 
                        ? 'bg-green-100 text-green-700 border-green-200' 
                        : 'bg-red-100 text-red-700 border-red-200'
                    }`}>
                      {book.status}
                   </span>
                </div>
              </motion.div>
              
              <div>
                <h1 className="text-2xl font-bold text-foreground leading-tight mb-1">{book.title}</h1>
                <p className="text-lg text-muted-foreground font-medium">by {book.author}</p>
              </div>

              <div className="flex flex-wrap justify-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/5 text-primary text-xs font-semibold border border-primary/10">
                  <Tag className="h-3 w-3" /> {book.genre}
                </span>
                {book.pages && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium border border-border">
                    <Layers className="h-3 w-3" /> {book.pages} pages
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium border border-border">
                   <Calendar className="h-3 w-3" /> {book.publishedYear}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="bg-card border border-border rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-foreground">{book.availableCopies}</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Available</p>
               </div>
               <div className="bg-card border border-border rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-foreground">{book.totalCopies}</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Total Copies</p>
               </div>
            </div>

            {book.description && (
              <div className="space-y-3">
                <h3 className="font-semibold text-foreground text-sm uppercase tracking-wider border-b border-border pb-2 flex items-center gap-2">
                  <Info className="h-4 w-4" /> About the Book
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {book.description}
                </p>
              </div>
            )}

            <div className="space-y-3">
              <h3 className="font-semibold text-foreground text-sm uppercase tracking-wider border-b border-border pb-2 flex items-center gap-2">
                <Layers className="h-4 w-4" /> Metadata
              </h3>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4 text-sm">
                <div>
                  <dt className="text-muted-foreground text-xs">ISBN</dt>
                  <dd className="font-medium font-mono text-foreground">{book.isbn}</dd>
                </div>
                <div>
                   <dt className="text-muted-foreground text-xs">Language</dt>
                   <dd className="font-medium text-foreground">{book.language || 'English'}</dd>
                </div>
                {book.publisher && (
                  <div className="sm:col-span-2">
                    <dt className="text-muted-foreground text-xs">Publisher</dt>
                    <dd className="font-medium text-foreground">{book.publisher}</dd>
                  </div>
                )}
                {book.location && (
                   <div className="sm:col-span-2 bg-muted/30 p-3 rounded-lg border border-border">
                      <dt className="text-muted-foreground text-xs mb-1 flex items-center gap-1"><MapPin className="h-3 w-3" /> Location</dt>
                      <dd className="font-medium text-foreground">
                         Shelf {book.location.shelf}, Row {book.location.row}
                      </dd>
                   </div>
                )}
              </dl>
            </div>

            {book.tags && book.tags.length > 0 && (
              <div className="space-y-3">
                 <h3 className="font-semibold text-foreground text-sm uppercase tracking-wider border-b border-border pb-2 flex items-center gap-2">
                    <Tag className="h-4 w-4" /> Keywords
                 </h3>
                 <div className="flex flex-wrap gap-2">
                    {book.tags.map((tag, i) => (
                       <span key={i} className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded border border-border">
                          #{tag}
                       </span>
                    ))}
                 </div>
              </div>
            )}
          </div>
        </div>
        <div className="border-t border-border p-4 sm:p-6 bg-background/80 backdrop-blur-md sticky bottom-0 z-10">
          <div className="flex gap-3">
             <Button variant="outline" className="flex-1" onClick={onClose}>Close</Button>
             {user && book.status === 'available' && hasPermission('member') ? (
                <Button 
                   className="flex-[2] bg-primary text-primary-foreground hover:bg-primary/90"
                   onClick={handleBorrowClick}
                   disabled={borrowLoading}
                >
                   {borrowLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Bookmark className="h-4 w-4 mr-2" />}
                   Borrow Now
                </Button>
             ) : (
                <Button disabled className="flex-[2] opacity-50 cursor-not-allowed">
                   {book.status === 'available' ? 'Login to Borrow' : 'Unavailable'}
                </Button>
             )}
          </div>
        </div>

      </motion.div>
    </AnimatePresence>
  )
}

export default BookDetails