import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, ComposedChart
} from 'recharts'
import { 
  BookOpen, Users, Calendar, TrendingUp, 
  AlertCircle, Clock, CheckCircle, XCircle,
  Search, Filter, Download, Plus, Bookmark,
  UserCheck, UserX, DollarSign, BarChart3,
  ArrowUp, ArrowDown, RefreshCw, Eye,
  Library, Shield, Zap, Target,
  Sparkles, Rocket, Crown, Star,
  BookText,
  Activity
} from 'lucide-react'
import { booksAPI, borrowAPI, usersAPI } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'

const defaultDashboardData = {
  totalBooks: 0,
  availableBooks: 0,
  borrowedBooks: 0,
  lowStockBooks: 0,
  totalUsers: 0,
  activeUsers: 0,
  adminUsers: 0,
  librarianUsers: 0,
  totalBorrows: 0,
  activeBorrows: 0,
  returnedBorrows: 0,
  overdueBorrows: 0,
  totalFines: 0,
  pendingFines: 0,
  collectedFines: 0,
  genreDistribution: [],
  yearlyStats: [],
  monthlyTrends: [],
  popularBooks: [],
  userActivity: []
}

const Dashboard = () => {
  const { user, hasPermission } = useAuth()
  const [dashboardData, setDashboardData] = useState(defaultDashboardData)
  const [recentBooks, setRecentBooks] = useState([])
  const [recentBorrows, setRecentBorrows] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [timeRange, setTimeRange] = useState('week')

  useEffect(() => {
    fetchDashboardData()
    
    const interval = setInterval(fetchDashboardData, 30000)
    return () => clearInterval(interval)
  }, [timeRange])

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true)

      const [booksRes, borrowsRes, usersRes, borrowStatsRes] = await Promise.all([
        booksAPI.getAll({ page: 1, limit: 5, sortBy: 'createdAt', sortOrder: 'desc' }),
        borrowAPI.getAll({ page: 1, limit: 5, sortBy: 'borrowDate', sortOrder: 'desc' }),
        usersAPI.getStats(),
        borrowAPI.getAll({ 
          page: 1, 
          limit: 1000,
          startDate: getStartDate(timeRange)
        })
      ])

      let analyticsData = {
        totalBooks: 0,
        availableBooks: 0,
        lowStockBooks: 0,
        genreDistribution: [],
        yearlyStats: []
      }

      try {
        const analyticsRes = await booksAPI.getAnalytics()
        analyticsData = {
          totalBooks: analyticsRes.data.totalBooks || 0,
          availableBooks: analyticsRes.data.availableBooks || 0,
          lowStockBooks: analyticsRes.data.lowStockBooks || 0,
          genreDistribution: analyticsRes.data.genreDistribution || [],
          yearlyStats: analyticsRes.data.yearlyStats || []
        }
      } catch (analyticsError) {
        if (analyticsError.response?.status !== 403) {
          throw analyticsError
        }
      }

      const borrowStats = borrowStatsRes.data.borrowRecords || []
      const currentDate = new Date()
      
      const overdueBorrows = borrowStats.filter(record => 
        new Date(record.dueDate) < currentDate && record.status === 'borrowed'
      ).length

      const totalFines = borrowStats.reduce((sum, record) => sum + (record.fineAmount || 0), 0)
      const pendingFines = borrowStats
        .filter(record => record.fineAmount > 0 && record.status !== 'returned')
        .reduce((sum, record) => sum + (record.fineAmount || 0), 0)

      setRecentBooks(booksRes.data.books || [])
      setRecentBorrows(borrowsRes.data.borrowRecords || [])
      
      setDashboardData({
        totalBooks: analyticsData.totalBooks,
        availableBooks: analyticsData.availableBooks,
        borrowedBooks: Math.max(analyticsData.totalBooks - analyticsData.availableBooks, 0),
        lowStockBooks: analyticsData.lowStockBooks,
        
        totalUsers: usersRes.data.totalUsers || 0,
        activeUsers: usersRes.data.activeUsers || 0,
        adminUsers: usersRes.data.adminUsers || 0,
        librarianUsers: usersRes.data.librarianUsers || 0,
        
        totalBorrows: borrowStats.length,
        activeBorrows: borrowStats.filter(b => b.status === 'borrowed').length,
        returnedBorrows: borrowStats.filter(b => b.status === 'returned').length,
        overdueBorrows,
        
        totalFines,
        pendingFines,
        collectedFines: totalFines - pendingFines,
        
        genreDistribution: analyticsData.genreDistribution,
        yearlyStats: analyticsData.yearlyStats,
        monthlyTrends: generateMonthlyTrends(borrowStats),
        popularBooks: getPopularBooks(borrowStats),
        userActivity: getUserActivity(borrowStats)
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setDashboardData(defaultDashboardData)
      setRecentBooks([])
      setRecentBorrows([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const getStartDate = (range) => {
    const now = new Date()
    switch (range) {
      case 'week':
        return new Date(now.setDate(now.getDate() - 7)).toISOString()
      case 'month':
        return new Date(now.setMonth(now.getMonth() - 1)).toISOString()
      case 'quarter':
        return new Date(now.setMonth(now.getMonth() - 3)).toISOString()
      case 'year':
        return new Date(now.setFullYear(now.getFullYear() - 1)).toISOString()
      default:
        return new Date(now.setMonth(now.getMonth() - 1)).toISOString()
    }
  }

  const generateMonthlyTrends = (borrowStats) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const currentYear = new Date().getFullYear()
    
    return months.map((month, index) => {
      const monthBorrows = borrowStats.filter(record => {
        const recordDate = new Date(record.borrowDate)
        return recordDate.getMonth() === index && recordDate.getFullYear() === currentYear
      })
      
      const monthReturns = borrowStats.filter(record => {
        const recordDate = new Date(record.returnDate || record.dueDate)
        return recordDate.getMonth() === index && recordDate.getFullYear() === currentYear
      })

      return {
        name: month,
        borrows: monthBorrows.length,
        returns: monthReturns.length,
        fines: monthBorrows.reduce((sum, record) => sum + (record.fineAmount || 0), 0)
      }
    })
  }

  const getPopularBooks = (borrowStats) => {
    const bookCount = {}
    borrowStats.forEach(record => {
      if (record.book && record.book.title) {
        bookCount[record.book.title] = (bookCount[record.book.title] || 0) + 1
      }
    })
    
    return Object.entries(bookCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([title, count]) => ({ name: title, value: count }))
  }

  const getUserActivity = (borrowStats) => {
    const userActivity = {}
    borrowStats.forEach(record => {
      if (record.user && record.user.name) {
        userActivity[record.user.name] = (userActivity[record.user.name] || 0) + 1
      }
    })
    
    return Object.entries(userActivity)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, borrows: count }))
  }

  const StatIcon = ({ icon: Icon, className = "" }) => (
    <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${className}`} />
  )

  const statCards = [
    {
      title: 'Total Books',
      value: dashboardData.totalBooks || 0,
      icon: <StatIcon icon={Library} />,
      color: 'from-primary to-primary/80',
      gradient: 'bg-gradient-to-br',
      change: '+12%',
      trend: 'up',
      description: 'In library collection',
      link: '/books'
    },
    {
      title: 'Available Books',
      value: dashboardData.availableBooks || 0,
      icon: <StatIcon icon={CheckCircle} />,
      color: 'from-green-500 to-green-600',
      gradient: 'bg-gradient-to-br',
      change: '+5%',
      trend: 'up',
      description: 'Ready to borrow',
      link: '/books'
    },
    {
      title: 'Total Members',
      value: dashboardData.totalUsers || 0,
      icon: <StatIcon icon={Users} />,
      color: 'from-blue-500 to-blue-600',
      gradient: 'bg-gradient-to-br',
      change: '+8%',
      trend: 'up',
      description: 'Registered users',
      link: '/users'
    },
    {
      title: 'Active Borrows',
      value: dashboardData.activeBorrows || 0,
      icon: <StatIcon icon={Bookmark} />,
      color: 'from-amber-500 to-amber-600',
      gradient: 'bg-gradient-to-br',
      change: '+3%',
      trend: 'up',
      description: 'Currently borrowed',
      link: '/borrow'
    },
    {
      title: 'Overdue Books',
      value: dashboardData.overdueBorrows || 0,
      icon: <StatIcon icon={AlertCircle} />,
      color: 'from-red-500 to-red-600',
      gradient: 'bg-gradient-to-br',
      change: '-2%',
      trend: 'down',
      description: 'Need attention',
      link: '/borrow?status=overdue'
    },
    {
      title: 'Total Fines',
      value: `$${dashboardData.totalFines || 0}`,
      icon: <StatIcon icon={DollarSign} />,
      color: 'from-purple-500 to-purple-600',
      gradient: 'bg-gradient-to-br',
      change: '+15%',
      trend: 'up',
      description: 'Collected amount',
      link: '/reports'
    }
  ]

  const quickActions = [
    {
      title: 'Add Book',
      icon: <Plus className="h-4 w-4 sm:h-5 sm:w-5" />,
      description: 'Add new book to catalog',
      link: '/books?action=add',
      color: 'bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-primary-foreground',
      permission: 'librarian',
      badge: 'New'
    },
    {
      title: 'Manage Users',
      icon: <Users className="h-4 w-4 sm:h-5 sm:w-5" />,
      description: 'View and manage users',
      link: '/users',
      color: 'bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-primary-foreground',
      permission: 'librarian'
    },
    {
      title: 'View Catalog',
      icon: <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />,
      description: 'Browse book collection',
      link: '/books',
      color: 'bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-primary-foreground'
    },
    {
      title: 'Borrow Book',
      icon: <Bookmark className="h-4 w-4 sm:h-5 sm:w-5" />,
      description: 'Process new borrow',
      link: '/borrow?action=new',
      color: 'bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-primary-foreground',
      permission: 'librarian'
    },
    {
      title: 'Return Book',
      icon: <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />,
      description: 'Process book return',
      link: '/borrow?action=return',
      color: 'bg-gradient-to-br from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-primary-foreground',
      permission: 'librarian',
      badge: 'Quick'
    },
    {
      title: 'View Analytics',
      icon: <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" />,
      description: 'Detailed analytics',
      link: '/analytics',
      color: 'bg-gradient-to-br from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-primary-foreground',
      permission: 'librarian'
    },
    {
      title: 'My Profile',
      icon: <UserCheck className="h-4 w-4 sm:h-5 sm:w-5" />,
      description: 'Update personal info',
      link: '/profile',
      color: 'bg-gradient-to-br from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-primary-foreground'
    }
  ]

  const filteredQuickActions = quickActions.filter(action => 
    !action.permission || hasPermission(action.permission)
  )

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  }

  const cardHoverVariants = {
    rest: { 
      scale: 1,
      y: 0
    },
    hover: { 
      scale: 1.02,
      y: -2,
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 border-4 border-muted border-t-primary rounded-full mx-auto mb-4"
            />
            <Sparkles className="h-6 w-6 text-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-foreground font-semibold"
          >
            Loading your library dashboard...
          </motion.p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8"
        >
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-card rounded-xl shadow-sm border border-border">
                  <Crown className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
                    Dashboard
                  </h1>
                  <p className="text-muted-foreground text-sm sm:text-base flex flex-wrap items-center gap-1 sm:gap-2">
                    <span>Welcome back,</span>
                    <span className="font-semibold text-primary">{user?.name}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Zap className="h-3 w-3 sm:h-4 sm:w-4 text-accent" />
                      Here's what's happening today
                    </span>
                    {refreshing && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-accent flex items-center gap-1 text-sm"
                      >
                        <RefreshCw className="h-3 w-3 animate-spin" />
                        Updating...
                      </motion.span>
                    )}
                  </p>
                </div>
              </div>
            </div>
            
            <motion.div 
              className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="border border-border rounded-lg pl-10 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary appearance-none bg-background text-foreground text-sm cursor-pointer"
              >
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="quarter">Last Quarter</option>
                <option value="year">Last Year</option>
              </select>
              <Button 
                variant="outline" 
                size="sm"
                onClick={fetchDashboardData}
                disabled={refreshing}
                className="h-10"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline ml-2">Refresh</span>
              </Button>
            </motion.div>
          </div>
        </motion.div>

        
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4 mb-6 sm:mb-8"
        >
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              variants={itemVariants}
              whileHover="hover"
              initial="rest"
              animate="rest"
              className="h-full"
            >
              <motion.div
                variants={cardHoverVariants}
              >
                <Link to={stat.link}>
                  <Card className="border-border bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300 group overflow-hidden relative h-full">
                    
                    <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 ${stat.gradient} ${stat.color}`} />
                    
                    <CardContent className="p-4 sm:p-5 relative">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1 truncate">{stat.title}</p>
                          <p className="text-xl sm:text-2xl font-bold text-card-foreground mb-2">{stat.value}</p>
                          <div className="flex items-center gap-2">
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              className={`flex items-center px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                                stat.trend === 'up' 
                                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' 
                                  : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                              }`}
                            >
                              {stat.trend === 'up' ? (
                                <ArrowUp className="h-3 w-3 mr-1" />
                              ) : (
                                <ArrowDown className="h-3 w-3 mr-1" />
                              )}
                              {stat.change}
                            </motion.div>
                            <span className="text-xs text-muted-foreground truncate hidden xs:block">{stat.description}</span>
                          </div>
                        </div>
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          className={`p-2 sm:p-3 rounded-xl ${stat.gradient} ${stat.color} text-primary-foreground shadow-lg group-hover:shadow-xl transition-shadow duration-300 flex-shrink-0 ml-2`}
                        >
                          {stat.icon}
                        </motion.div>
                      </div>
                      
                      <div className="mt-3 w-full bg-muted rounded-full h-1">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: '70%' }}
                          transition={{ delay: index * 0.1 + 0.5, duration: 1 }}
                          className={`h-1 rounded-full ${stat.gradient} ${stat.color}`}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8"
        >
          
          <motion.div variants={itemVariants} className="min-h-[400px] sm:min-h-[450px]">
            <Card className="border-border bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300 h-full">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  </div>
                  <CardTitle className="text-card-foreground text-lg sm:text-xl">Library Activity Trend</CardTitle>
                </div>
                <div className="hidden sm:flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-primary rounded-full mr-2"></div>
                    Borrows
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    Returns
                  </div>
                </div>
              </CardHeader>
              <CardContent className="h-[300px] sm:h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={dashboardData.monthlyTrends}>
                    <defs>
                      <linearGradient id="borrowsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="returnsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        color: 'hsl(var(--card-foreground))'
                      }}
                    />
                    <Legend />
                    <Bar 
                      dataKey="borrows" 
                      fill="url(#borrowsGradient)" 
                      name="Books Borrowed"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar 
                      dataKey="returns" 
                      fill="url(#returnsGradient)" 
                      name="Books Returned"
                      radius={[4, 4, 0, 0]}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="fines" 
                      stroke="hsl(var(--accent))" 
                      strokeWidth={2} 
                      name="Fines Collected"
                      dot={{ fill: 'hsl(var(--accent))', strokeWidth: 2, r: 4 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          
          <motion.div variants={itemVariants} className="min-h-[400px] sm:min-h-[450px]">
            <Card className="border-border bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300 h-full">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-accent/10 rounded-lg">
                    <BookText className="h-4 w-4 sm:h-5 sm:w-5 text-accent" />
                  </div>
                  <CardTitle className="text-card-foreground text-lg sm:text-xl">Genre Distribution</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="h-[300px] sm:h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dashboardData.genreDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      innerRadius={40}
                      paddingAngle={2}
                      dataKey="count"
                    >
                      {dashboardData.genreDistribution.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={[
                            'hsl(var(--primary))',
                            'hsl(var(--primary))',
                            'hsl(var(--primary))',
                            'hsl(var(--primary))',
                            'hsl(var(--primary))',
                            'hsl(var(--primary))',
                            'hsl(var(--primary))',
                            'hsl(var(--primary))'
                          ][index % 8]} 
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [`${value} books`, 'Count']}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        color: 'hsl(var(--card-foreground))'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8"
        >
          
          <motion.div variants={itemVariants} className="min-h-[350px]">
            <Card className="border-border bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300 h-full">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900/20 rounded-lg">
                    <Star className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <CardTitle className="text-card-foreground text-lg sm:text-xl">Most Popular Books</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="h-[250px] sm:h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dashboardData.popularBooks}>
                    <defs>
                      <linearGradient id="popularGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.2}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45} 
                      textAnchor="end" 
                      height={60}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                    />
                    <YAxis 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        color: 'hsl(var(--card-foreground))'
                      }}
                    />
                    <Bar 
                      dataKey="value" 
                      fill="url(#popularGradient)" 
                      name="Borrow Count"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          
          <motion.div variants={itemVariants} className="min-h-[350px]">
            <Card className="border-border bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300 h-full">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-cyan-100 dark:bg-cyan-900/20 rounded-lg">
                    <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <CardTitle className="text-card-foreground text-lg sm:text-xl">Most Active Users</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="h-[250px] sm:h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dashboardData.userActivity}>
                    <defs>
                      <linearGradient id="activeGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.2}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45} 
                      textAnchor="end" 
                      height={60}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                    />
                    <YAxis 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        color: 'hsl(var(--card-foreground))'
                      }}
                    />
                    <Bar 
                      dataKey="borrows" 
                      fill="url(#activeGradient)" 
                      name="Books Borrowed"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8"
        >
          
          <motion.div variants={itemVariants}>
            <Card className="border-border bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                    <Plus className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <CardTitle className="text-card-foreground text-lg sm:text-xl">Recently Added Books</CardTitle>
                </div>
                {hasPermission('librarian', 'admin') && (
                  <Link to="/books?action=add">
                    <Button size="sm" className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200">
                      <Plus className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Add Book</span>
                    </Button>
                  </Link>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentBooks.map((book, index) => (
                    <motion.div
                      key={book._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ x: 4 }}
                      className="flex items-center gap-3 p-3 hover:bg-accent/5 rounded-lg border border-border hover:shadow-md transition-all duration-200 group"
                    >
                      <div className="w-8 h-12 sm:w-10 sm:h-14 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg group-hover:shadow-xl transition-shadow duration-200 overflow-hidden bg-muted border border-border">
                        {book.coverImage?.url ? (
                          <img
                            src={book.coverImage.url}
                            alt={`Cover of ${book.title}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                            <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-card-foreground text-sm truncate group-hover:text-primary transition-colors">
                          {book.title}
                        </h4>
                        <p className="text-xs text-muted-foreground truncate">by {book.author}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            book.status === 'available' 
                              ? 'bg-green-100 text-green-800 border border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800' 
                              : 'bg-red-100 text-red-800 border border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800'
                          }`}>
                            {book.status}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {book.availableCopies}/{book.totalCopies} available
                          </span>
                        </div>
                      </div>
                      <Link to={`/books/${book._id}`}>
                        <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                    </motion.div>
                  ))}
                  {recentBooks.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-8 text-muted-foreground"
                    >
                      <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">No books added recently</p>
                    </motion.div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          
          <motion.div variants={itemVariants}>
            <Card className="border-border bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <Bookmark className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <CardTitle className="text-card-foreground text-lg sm:text-xl">Recent Borrow Activity</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentBorrows.map((record, index) => (
                    <motion.div
                      key={record._id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ x: -4 }}
                      className="flex items-center justify-between p-3 hover:bg-accent/5 rounded-lg border border-border hover:shadow-md transition-all duration-200 group"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        
                        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg overflow-hidden bg-muted border border-border">
                          {record.user?.avatar?.url ? (
                            <img
                              src={record.user.avatar.url}
                              alt={record.user.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-xs font-semibold text-primary-foreground bg-gradient-to-br from-blue-500 to-blue-600 w-full h-full flex items-center justify-center">
                              {record.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                            </span>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-card-foreground text-sm truncate group-hover:text-blue-600 transition-colors">
                            {record.user?.name}
                          </h4>
                          <p className="text-xs text-muted-foreground truncate">{record.book?.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(record.borrowDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                          record.status === 'overdue' 
                            ? 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800'
                            : record.status === 'returned'
                            ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800'
                            : 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800'
                        }`}>
                          {record.status}
                        </span>
                        <p className="text-xs text-muted-foreground mt-1">
                          Due {new Date(record.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                  {recentBorrows.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-8 text-muted-foreground"
                    >
                      <Bookmark className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">No recent borrow activity</p>
                    </motion.div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <Card className="border-border bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-gradient-to-br from-primary to-primary/80 rounded-lg">
                  <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground" />
                </div>
                <CardTitle className="text-card-foreground text-lg sm:text-xl">Quick Actions</CardTitle>
              </div>
              <p className="text-sm text-muted-foreground">Frequently used actions and shortcuts</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
                {filteredQuickActions.map((action, index) => (
                  <motion.div
                    key={action.title}
                    variants={itemVariants}
                    whileHover={{ 
                      scale: 1.05,
                      y: -2,
                      transition: { type: "spring", stiffness: 400 }
                    }}
                    whileTap={{ scale: 0.95 }}
                    className="relative"
                  >
                    <Link to={action.link}>
                      <Button className={`w-full h-16 sm:h-20 flex flex-col items-center justify-center ${action.color} hover:shadow-xl transition-all duration-200 relative overflow-hidden group p-2`}>
                        
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-foreground/20 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                        
                        <div className="flex flex-col items-center space-y-1 sm:space-y-2 relative z-10">
                          {action.icon}
                          <span className="text-xs font-medium text-center leading-tight">
                            {action.title}
                          </span>
                        </div>
                        
                        
                        {action.badge && (
                          <div className="absolute -top-1 -right-1">
                            <span className="bg-accent text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
                              {action.badge}
                            </span>
                          </div>
                        )}
                      </Button>
                    </Link>
                    <p className="text-xs text-muted-foreground text-center mt-2 hidden sm:block">
                      {action.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        
        <motion.div
          variants={itemVariants}
          className="mt-6"
        >
          <Card className="border-border bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-card rounded-lg border border-border">
                  <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
                <CardTitle className="text-card-foreground text-lg sm:text-xl">System Status</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                {[
                  { 
                    status: 'Operational', 
                    icon: CheckCircle, 
                    color: 'text-green-600',
                    bgColor: 'bg-green-100 dark:bg-green-900/20',
                    description: 'All systems normal',
                    value: '100%'
                  },
                  { 
                    status: 'Response Time', 
                    icon: Clock, 
                    color: 'text-blue-600',
                    bgColor: 'bg-blue-100 dark:bg-blue-900/20',
                    description: 'Average response',
                    value: '< 200ms'
                  },
                  { 
                    status: 'Uptime', 
                    icon: TrendingUp, 
                    color: 'text-amber-600',
                    bgColor: 'bg-amber-100 dark:bg-amber-900/20',
                    description: 'This month',
                    value: '99.9%'
                  },
                  { 
                    status: 'Active Sessions', 
                    icon: Users, 
                    color: 'text-purple-600',
                    bgColor: 'bg-purple-100 dark:bg-purple-900/20',
                    description: 'Current users',
                    value: `${dashboardData.activeUsers || 0}`
                  }
                ].map((item, index) => (
                  <motion.div
                    key={item.status}
                    whileHover={{ scale: 1.02 }}
                    className="p-3 sm:p-4 bg-card rounded-lg border border-border shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 ${item.bgColor} rounded-lg`}>
                        <item.icon className={`h-4 w-4 sm:h-6 sm:w-6 ${item.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-card-foreground text-sm sm:text-base">{item.status}</p>
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                        <p className={`text-base sm:text-lg font-bold ${item.color} mt-1`}>{item.value}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

export default Dashboard
