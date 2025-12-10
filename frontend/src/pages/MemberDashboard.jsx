import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  BookOpen, Bookmark, CheckCircle, Clock, TrendingUp, 
  Star, ArrowRight, Search, History, User, AlertCircle, 
  Loader2, Calendar, ChevronRight
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { borrowAPI } from '@/lib/api'
import { Link } from 'react-router-dom'

const MemberDashboard = () => {
  const { user } = useAuth()
  const [borrowHistory, setBorrowHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('current')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await borrowAPI.getAll({ userId: user._id, limit: 100 })
        setBorrowHistory(res.data.borrowRecords || [])
      } catch (err) {
        console.error('Error loading member borrow history:', err)
      } finally {
        setLoading(false)
      }
    }

    if (user?._id) {
      fetchData()
    }
  }, [user])

  const booksRead = borrowHistory.filter(r => r.status === 'returned')
  const currentlyReading = borrowHistory.filter(r => r.status === 'borrowed')
  const overdueBooks = borrowHistory.filter(r => 
    r.status === 'borrowed' && new Date(r.dueDate) < new Date()
  )

  const getDaysRemaining = (dueDate) => {
    const today = new Date()
    const due = new Date(dueDate)
    const diffTime = due - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground animate-pulse">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Welcome back, {user?.name?.split(' ')[0]}. Here's your reading overview.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-full border border-border">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">
              Member since {new Date(user?.createdAt).getFullYear()}
            </span>
          </div>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          {[
            { label: 'Books Read', value: booksRead.length, icon: CheckCircle },
            { label: 'Reading Now', value: currentlyReading.length, icon: BookOpen },
            { label: 'Overdue', value: overdueBooks.length, icon: AlertCircle, alert: overdueBooks.length > 0 },
            { label: 'Total Borrows', value: borrowHistory.length, icon: TrendingUp }
          ].map((stat, index) => (
            <motion.div key={stat.label} variants={itemVariants}>
              <Card className={`border transition-all hover:shadow-md group relative overflow-hidden ${stat.alert ? 'border-destructive/50 bg-destructive/5' : 'border-border bg-card hover:border-primary/50'}`}>
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 ${stat.alert ? 'bg-destructive' : 'bg-primary'}`} />
                <CardContent className="p-5 flex items-center justify-between relative">
                  <div>
                    <p className={`text-xs font-medium uppercase tracking-wider mb-1 ${stat.alert ? 'text-destructive' : 'text-muted-foreground'}`}>
                      {stat.label}
                    </p>
                    <p className={`text-3xl font-bold ${stat.alert ? 'text-destructive' : 'text-foreground'}`}>
                      {stat.value}
                    </p>
                  </div>
                  <div className={`p-2.5 rounded-xl ${stat.alert ? 'bg-destructive/10 text-destructive' : 'bg-primary/5 text-primary'}`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border border-border bg-card shadow-sm min-h-[500px]">
              <CardHeader className="border-b border-border/50 pb-0 px-6">
                <div className="flex items-center justify-between mb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Bookmark className="h-5 w-5 text-primary" /> My Bookshelf
                  </CardTitle>
                  <Button variant="outline" size="sm" asChild className="h-8">
                    <Link to="/books">
                      <Search className="h-3 w-3 mr-2" />
                      Browse Library
                    </Link>
                  </Button>
                </div>

                <div className="flex gap-6">
                  {['current', 'history'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`
                        relative pb-3 text-sm font-medium transition-colors capitalize
                        ${activeTab === tab ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}
                      `}
                    >
                      {tab === 'current' ? 'Current Reads' : 'Reading History'}
                      {activeTab === tab && (
                        <motion.div 
                          layoutId="activeTab"
                          className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary"
                        />
                      )}
                    </button>
                  ))}
                </div>
              </CardHeader>

              <CardContent className="p-6">
                <AnimatePresence mode="wait">
                  {activeTab === 'current' ? (
                    <motion.div
                      key="current"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-4"
                    >
                      {currentlyReading.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                            <BookOpen className="h-8 w-8 text-muted-foreground opacity-50" />
                          </div>
                          <h3 className="text-lg font-semibold mb-2">No active reads</h3>
                          <p className="text-muted-foreground max-w-xs mb-6">
                            You don't have any books checked out right now. Explore the catalog to find your next adventure.
                          </p>
                          <Button asChild>
                            <Link to="/books">Browse Catalog</Link>
                          </Button>
                        </div>
                      ) : (
                        currentlyReading.map((record) => {
                          const daysLeft = getDaysRemaining(record.dueDate)
                          const isOverdue = daysLeft < 0
                          
                          return (
                            <div key={record._id} className="group flex flex-col sm:flex-row gap-4 p-4 rounded-xl border border-border bg-background hover:border-primary/30 hover:shadow-sm transition-all">
                             
                              <div className="w-full sm:w-20 h-28 bg-muted rounded-lg flex items-center justify-center shrink-0 overflow-hidden relative">
                                {record.book?.coverImage ? (
                                  <img src={record.book.coverImage} alt="Cover" className="w-full h-full object-cover" />
                                ) : (
                                  <BookOpen className="h-8 w-8 text-muted-foreground/30" />
                                )}
                                {isOverdue && (
                                  <div className="absolute top-0 right-0 bg-destructive text-destructive-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-bl-lg">
                                    LATE
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex-1 flex flex-col justify-between">
                                <div>
                                  <div className="flex justify-between items-start">
                                    <h4 className="font-bold text-lg leading-tight mb-1 group-hover:text-primary transition-colors">
                                      {record.book?.title}
                                    </h4>
                                    <span className={`text-xs font-mono px-2 py-1 rounded border ${isOverdue ? 'bg-destructive/10 text-destructive border-destructive/20' : 'bg-secondary text-secondary-foreground border-border'}`}>
                                      {isOverdue ? `${Math.abs(daysLeft)} Days Late` : `${daysLeft} Days Left`}
                                    </span>
                                  </div>
                                  <p className="text-sm text-muted-foreground">by {record.book?.author}</p>
                                </div>
                                
                                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                                  <div className="flex items-center gap-2">
                                    <Calendar className="h-3.5 w-3.5" />
                                    <span>Due: {new Date(record.dueDate).toLocaleDateString()}</span>
                                  </div>
                                  <Button variant="ghost" size="sm" className="h-7 text-xs hover:bg-primary hover:text-primary-foreground">
                                    View Details <ChevronRight className="h-3 w-3 ml-1" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )
                        })
                      )}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="history"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-2"
                    >
                      {booksRead.length === 0 ? (
                        <div className="py-12 text-center text-muted-foreground">No reading history yet.</div>
                      ) : (
                        booksRead.map((record) => (
                          <div key={record._id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-background/50 hover:bg-muted/30 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 bg-muted rounded flex items-center justify-center shrink-0">
                                <CheckCircle className="h-5 w-5 text-green-500" />
                              </div>
                              <div>
                                <p className="font-medium text-sm">{record.book?.title}</p>
                                <p className="text-xs text-muted-foreground">Returned on {new Date(record.returnDate).toLocaleDateString()}</p>
                              </div>
                            </div>
                            {record.fineAmount > 0 ? (
                              <span className="text-xs font-bold text-destructive">-${record.fineAmount} Fine</span>
                            ) : (
                              <span className="text-xs font-medium text-green-600 bg-green-500/10 px-2 py-1 rounded">On Time</span>
                            )}
                          </div>
                        ))
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">

            <Card className="border border-border bg-card shadow-sm">
              <CardHeader className="pb-3 border-b border-border/50">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="p-4 grid grid-cols-1 gap-2">
                <Button variant="outline" className="justify-start h-12 border-border hover:bg-primary hover:text-primary-foreground group" asChild>
                  <Link to="/books">
                    <div className="p-1.5 bg-muted group-hover:bg-primary-foreground/20 rounded mr-3 transition-colors">
                      <Search className="h-4 w-4" />
                    </div>
                    Find a Book
                  </Link>
                </Button>
                <Button variant="outline" className="justify-start h-12 border-border hover:bg-primary hover:text-primary-foreground group" asChild>
                  <Link to="/profile">
                    <div className="p-1.5 bg-muted group-hover:bg-primary-foreground/20 rounded mr-3 transition-colors">
                      <User className="h-4 w-4" />
                    </div>
                    Manage Profile
                  </Link>
                </Button>
                <Button variant="outline" className="justify-start h-12 border-border hover:bg-primary hover:text-primary-foreground group">
                  <div className="p-1.5 bg-muted group-hover:bg-primary-foreground/20 rounded mr-3 transition-colors">
                    <History className="h-4 w-4" />
                  </div>
                  Export History
                </Button>
              </CardContent>
            </Card>

            <Card className="border border-border bg-gradient-to-br from-card to-muted/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Star className="h-5 w-5 fill-foreground text-foreground" /> 
                  Library Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3 items-start">
                  <div className="mt-1 h-2 w-2 rounded-full bg-primary shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Avoid fines:</strong> Renew your books up to 3 days before the due date online.
                  </p>
                </div>
                <div className="flex gap-3 items-start">
                  <div className="mt-1 h-2 w-2 rounded-full bg-primary shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">New Arrivals:</strong> Check out the science fiction section this Friday!
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-xs text-center text-muted-foreground italic">
                    "Reading is essential for those who seek to rise above the ordinary."
                  </p>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  )
}

export default MemberDashboard