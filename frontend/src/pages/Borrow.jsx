import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Search, Filter, Plus, BookOpen, Users, Calendar,
  Clock, CheckCircle, AlertCircle, ArrowUpDown, Eye,
  MoreVertical, Bookmark, UserCheck, Download, RotateCcw,
  X, BookX, UserX, Library, BarChart3, TrendingUp,
  Activity, ArrowRight, Shield, DollarSign, MapPin,
  Hash, Tag, Mail, Phone, Loader, Bell, BellDot, QrCode
} from 'lucide-react'
import { borrowAPI, booksAPI, usersAPI } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'

const Borrow = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user, hasPermission } = useAuth()
  const [borrowRecords, setBorrowRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '')
  const [sortOption, setSortOption] = useState('newest')
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [showReturnModal, setShowReturnModal] = useState(false)
  const [showBorrowModal, setShowBorrowModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [availableBooks, setAvailableBooks] = useState([])
  const [availableUsers, setAvailableUsers] = useState([])
  const [stats, setStats] = useState({})
  const [actionLoading, setActionLoading] = useState(null)
  const [reqCount, setReqCount] = useState(0)
  const [showQRModal, setShowQRModal] = useState(false)
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [qrLoading, setQrLoading] = useState(false)

  const fetchAvailableData = async () => {
    try {
      const [booksResponse, usersResponse] = await Promise.all([
        booksAPI.getAll({ limit: 100 }),
        usersAPI.getAll({ limit: 100 })
      ])
      setAvailableBooks(booksResponse.books || [])
      setAvailableUsers(usersResponse.users || [])
    } catch (error) {
      console.error('Error fetching available data:', error)
    }
  }

  useEffect(() => {
    fetchAvailableData()
  }, [])

  useEffect(() => {
    fetchBorrowRecords()
    fetchStats()
  }, [searchTerm, statusFilter])

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

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    },
    hover: {
      scale: 1.02,
      transition: {
        duration: 0.2,
        ease: "easeInOut"
      }
    }
  }

  const fetchBorrowRecords = async () => {
    try {
      setLoading(true)
      const params = {
        page: 1,
        limit: 50,
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter && { status: statusFilter })
      }
      const response = await borrowAPI.getAll(params)
      setBorrowRecords(response.data.borrowRecords || [])
    } catch (error) {
      console.error('Error fetching borrow records:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await borrowAPI.getAll({ limit: 1000 })
      const allRecords = response.data.borrowRecords || []

      const totalBorrows = allRecords.length
      const activeBorrows = allRecords.filter(r => r.status === 'borrowed').length
      const overdueBorrows = allRecords.filter(r =>
        new Date(r.dueDate) < new Date() && r.status === 'borrowed'
      ).length
      const returnedBorrows = allRecords.filter(r => r.status === 'returned').length

      setStats({
        totalBorrows,
        activeBorrows,
        overdueBorrows,
        returnedBorrows
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const fetchRequestCount = async () => {
    try {
      setReqCount(0) 
    } catch (error) {
      console.error('Error fetching request count:', error)
      setReqCount(0)
    }
  }

  useEffect(() => {
    fetchRequestCount()
  }, [])

  const handleReturnBook = async (record) => {
    try {
      setActionLoading(record._id)
      await borrowAPI.return(record._id)
      await fetchBorrowRecords()
      await fetchStats()
      setShowReturnModal(false)
      setSelectedRecord(null)
      alert('Book returned successfully!')
    } catch (error) {
      console.error('Error returning book:', error)
      alert('Error returning book: ' + (error.response?.data?.error || 'Unknown error'))
    } finally {
      setActionLoading(null)
    }
  }

  const handleBorrowBook = async (borrowData) => {
    try {
      await borrowAPI.borrow(borrowData)
      await fetchBorrowRecords()
      await fetchStats()
      setShowBorrowModal(false)
      alert('Book borrowed successfully!')
    } catch (error) {
      console.error('Error borrowing book:', error)
      alert('Error borrowing book: ' + (error.response?.data?.error || 'Unknown error'))
    }
  }

  const handleViewDetails = (record) => {
    console.log('View details clicked:', record)
    setSelectedRecord(record)
    setShowDetailsModal(true)
    console.log('Modal state:', { showDetailsModal: true, selectedRecord: record })
  }

  const handleGenerateQR = async (book) => {
    try {
      setQrLoading(true)
      const response = await booksAPI.getQRCode(book._id)
      const url = URL.createObjectURL(response.data)
      setQrCodeUrl(url)
      setSelectedRecord({ ...selectedRecord, book })
      setShowQRModal(true)
    } catch (error) {
      console.error('Error generating QR code:', error)
      alert('Failed to generate QR code')
    } finally {
      setQrLoading(false)
    }
  }

  const getStatusBadge = (status, dueDate) => {
    const isOverdue = new Date(dueDate) < new Date() && status === 'borrowed'
    const actualStatus = isOverdue ? 'overdue' : status

    const dotColor = {
      borrowed: 'bg-blue-600',
      returned: 'bg-green-600',
      overdue: 'bg-red-600'
    }[actualStatus]

    const textColor = {
      borrowed: 'text-blue-800 dark:text-blue-300',
      returned: 'text-green-800 dark:text-green-300',
      overdue: 'text-red-800 dark:text-red-300'
    }[actualStatus]

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${textColor} bg-background border-border`}>
        <span className={`inline-block h-2 w-2 rounded-full mr-2 ${dotColor}`} />
        {actualStatus.charAt(0).toUpperCase() + actualStatus.slice(1)}
      </span>
    )
  }

  const calculateDaysOverdue = (dueDate) => {
    const today = new Date()
    const due = new Date(dueDate)
    const diffTime = today - due
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  }

  const calculateFine = (dueDate) => {
    const daysOverdue = calculateDaysOverdue(dueDate)
    return daysOverdue * 5 // $5 per day
  }

  const getDaysRemaining = (dueDate) => {
    const today = new Date()
    const due = new Date(dueDate)
    const diffTime = due - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  }

  const statsCards = [
    {
      title: 'Total Borrows',
      value: stats.totalBorrows || 0,
      icon: <BookOpen className="h-6 w-6 text-white" />,
      description: 'All time borrow records',
      color: 'bg-gradient-to-br from-blue-500 to-blue-600',
      trend: '+12%',
      trendPositive: true
    },
    {
      title: 'Active Borrows',
      value: stats.activeBorrows || 0,
      icon: <Bookmark className="h-6 w-6 text-white" />,
      description: 'Currently borrowed books',
      color: 'bg-gradient-to-br from-amber-500 to-amber-600',
      trend: '+5%',
      trendPositive: true
    },
    {
      title: 'Overdue Books',
      value: stats.overdueBorrows || 0,
      icon: <AlertCircle className="h-6 w-6 text-white" />,
      description: 'Books past due date',
      color: 'bg-gradient-to-br from-red-500 to-red-600',
      trend: '-2%',
      trendPositive: false
    },
    {
      title: 'Returned',
      value: stats.returnedBorrows || 0,
      icon: <CheckCircle className="h-6 w-6 text-white" />,
      description: 'Successfully returned',
      color: 'bg-gradient-to-br from-green-500 to-green-600',
      trend: '+8%',
      trendPositive: true
    }
  ]

  const BorrowRecordCard = ({ record }) => {
    const [showActions, setShowActions] = useState(false)
    const isOverdue = new Date(record.dueDate) < new Date() && record.status === 'borrowed'

    const cardHighlightClass = isOverdue ? 'ring-1 ring-red-200/60 dark:ring-red-900/50' : ''

    useEffect(() => {
      const handleClickOutside = () => {
        setShowActions(false)
      }

      if (showActions) {
        document.addEventListener('click', handleClickOutside)
        return () => document.removeEventListener('click', handleClickOutside)
      }
    }, [showActions])

    return (
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover="hover"
      >
        <Card
          className={`border-border bg-card/50 hover:shadow-lg transition-all duration-300 group cursor-pointer backdrop-blur-sm overflow-visible ${cardHighlightClass}`}
          onClick={() => handleViewDetails(record)}
        >
          <CardContent className="p-4 sm:p-6 overflow-visible">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-start gap-4 flex-1">
                <div className="w-12 h-16 sm:w-14 sm:h-20 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden bg-muted border border-border shadow-sm">
                  {record.book?.coverImage?.url ? (
                    <img
                      src={record.book.coverImage.url}
                      alt={`Cover of ${record.book.title}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary to-primary/80 flex flex-col items-center justify-center p-2">
                      <BookOpen className="h-5 w-5 text-primary-foreground mb-1" />
                      <span className="text-[10px] leading-tight text-primary-foreground/80 text-center line-clamp-2">
                        {record.book?.title}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                    <h3 className="font-semibold text-card-foreground text-sm sm:text-base truncate">
                      {record.book?.title}
                    </h3>
                    {getStatusBadge(record.status, record.dueDate)}
                  </div>
                  <p className="text-muted-foreground text-sm mb-2">by {record.book?.author}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{record.user?.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Due: {new Date(record.dueDate).toLocaleDateString()}</span>
                    </div>
                    {record.borrowDate && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>Borrowed: {new Date(record.borrowDate).toLocaleDateString()}</span>
                      </div>
                    )}
                    {isOverdue && (
                      <div className="flex items-center gap-1 text-red-600 font-semibold">
                        <AlertCircle className="h-4 w-4" />
                        <span>{calculateDaysOverdue(record.dueDate)} days overdue</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                {hasPermission('librarian') && record.status === 'borrowed' && (
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedRecord(record)
                      setShowReturnModal(true)
                    }}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Return
                  </Button>
                )}

                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-muted transition-colors duration-200"
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowActions(!showActions)
                    }}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>

                  <AnimatePresence>
                    {showActions && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        className="absolute right-0 bottom-full mb-2 bg-card border border-border rounded-lg shadow-lg z-50 w-48 backdrop-blur-sm"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="py-1">
                          <button
                            className="flex items-center w-full px-4 py-2 text-sm text-card-foreground hover:bg-muted transition-colors"
                            onClick={(e) => {
                              e.stopPropagation()
                              setShowActions(false)
                              handleViewDetails(record)
                            }}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </button>

                          <button
                            className="flex items-center w-full px-4 py-2 text-sm text-card-foreground hover:bg-muted transition-colors"
                            onClick={(e) => {
                              e.stopPropagation()
                              setShowActions(false)
                              handleGenerateQR(record.book)
                            }}
                            disabled={qrLoading}
                          >
                            {qrLoading ? (
                              <Loader className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <QrCode className="h-4 w-4 mr-2" />
                            )}
                            QR Code
                          </button>

                          {hasPermission('librarian') && record.status === 'borrowed' && (
                            <button
                              className="flex items-center w-full px-4 py-2 text-sm text-green-600 hover:bg-green-50 dark:hover:bg-green-950/30 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation()
                                setShowActions(false)
                                setSelectedRecord(record)
                                setShowReturnModal(true)
                              }}
                            >
                              <RotateCcw className="h-4 w-4 mr-2" />
                              Return Book
                            </button>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  const filteredRecords = borrowRecords.filter(r => {
    const matchesStatus = !statusFilter || statusFilter === '' ? true : (statusFilter === 'overdue' ? (new Date(r.dueDate) < new Date() && r.status === 'borrowed') : r.status === statusFilter)
    const q = searchTerm.trim().toLowerCase()
    const matchesSearch = !q || (
      (r.user?.name || '').toLowerCase().includes(q) ||
      (r.book?.title || '').toLowerCase().includes(q) ||
      (r.book?.isbn || '').toLowerCase().includes(q)
    )
    return matchesStatus && matchesSearch
  })

  const sortedRecords = [...filteredRecords].sort((a, b) => {
    switch (sortOption) {
      case 'oldest':
        return new Date(a.borrowDate) - new Date(b.borrowDate)
      case 'dueSoon':
        return new Date(a.dueDate) - new Date(b.dueDate)
      case 'overdueFirst':
        const aOver = new Date(a.dueDate) < new Date() && a.status === 'borrowed'
        const bOver = new Date(b.dueDate) < new Date() && b.status === 'borrowed'
        if (aOver && !bOver) return -1
        if (!aOver && bOver) return 1
        return new Date(b.borrowDate) - new Date(a.borrowDate)
      case 'newest':
      default:
        return new Date(b.borrowDate) - new Date(a.borrowDate)
    }
  })

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 sm:mb-8 gap-4"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Borrow Management</h1>
            <p className="text-muted-foreground text-sm sm:text-base mt-2">Manage book borrowing and returns efficiently</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            
              
              {hasPermission('librarian') && (
                <Button
                  className="bg-primary text-white hover:bg-primary/90 transition-colors "
                  onClick={() => {
                    fetchAvailableData()
                    setShowBorrowModal(true)
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">New Borrow</span>
                </Button>
              )}
           
          </div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 sm:mb-8"
        >
          {statsCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              variants={itemVariants}
              custom={index}
            >
              <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                        {stat.title}
                      </p>
                      <div className="flex items-baseline space-x-2 mt-1">
                        <p className="text-2xl font-bold text-gray-900">
                          {stat.value}
                        </p>
                        <span className={`text-xs font-medium ${stat.trendPositive ? 'text-green-600' : 'text-red-600'
                          }`}>
                          {stat.trend}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                    </div>
                    <div className={`p-3 rounded-full ${stat.color} shadow-md`}>
                      {stat.icon}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="border-border bg-card/50 backdrop-blur-sm mb-6 sm:mb-8">
            <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                          placeholder="Search by user, book title, or ISBN..."
                          className="pl-10 transition-colors bg-background"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        {['', 'borrowed', 'returned', 'overdue'].map(s => (
                          <button
                            key={s || 'all'}
                            onClick={() => setStatusFilter(s)}
                            className={`text-xs px-3 py-1 rounded-full border border-border bg-background text-primary transition-colors ${statusFilter === s ? 'bg-primary text-primary-foreground' : ''}`}
                          >
                            {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center gap-2 ml-auto">
                        <select
                          value={sortOption}
                          onChange={(e) => setSortOption(e.target.value)}
                          className="border border-border rounded-lg px-3 py-2 bg-background text-foreground text-sm"
                        >
                          <option value="newest">Newest</option>
                          <option value="oldest">Oldest</option>
                          <option value="dueSoon">Due Soon</option>
                          <option value="overdueFirst">Overdue First</option>
                        </select>

                        {(searchTerm || statusFilter) && (
                          <Button
                            variant="outline"
                            onClick={() => {
                              setSearchTerm('')
                              setStatusFilter('')
                            }}
                            className="transition-colors whitespace-nowrap text-sm"
                          >
                            Clear
                          </Button>
                        )}
                      </div>
                    </div>
            </CardContent>
          </Card>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4 overflow-visible"
          >
            {sortedRecords.map((record, index) => (
              <motion.div
                key={record._id}
                variants={itemVariants}
                custom={index}
              >
                <BorrowRecordCard record={record} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {!loading && sortedRecords.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="border-border bg-card/50 backdrop-blur-sm text-center py-12">
              <CardContent>
                <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-card-foreground mb-2">No borrow records found</h3>
                <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                  {searchTerm || statusFilter
                    ? 'No records match your search criteria. Try adjusting your filters.'
                    : 'No borrow records available in the system yet.'
                  }
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  {(searchTerm || statusFilter) && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchTerm('')
                        setStatusFilter('')
                      }}
                    >
                      Clear all filters
                    </Button>
                  )}
                  {hasPermission('librarian') && (
                    <Button
                      className="bg-primary hover:bg-primary/90 transition-colors"
                      onClick={() => {
                        fetchAvailableData()
                        setShowBorrowModal(true)
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Borrow
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <AnimatePresence>
          {showDetailsModal && selectedRecord && (
            <BorrowDetailsModal
              record={selectedRecord}
              onClose={() => {
                setShowDetailsModal(false)
                setSelectedRecord(null)
              }}
              onReturn={() => {
                setShowDetailsModal(false)
                setShowReturnModal(true)
              }}
              calculateFine={calculateFine}
              calculateDaysOverdue={calculateDaysOverdue}
              getDaysRemaining={getDaysRemaining}
              hasPermission={hasPermission}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showReturnModal && selectedRecord && (
            <ReturnModal
              record={selectedRecord}
              onConfirm={handleReturnBook}
              onCancel={() => {
                setShowReturnModal(false)
                setSelectedRecord(null)
              }}
              calculateFine={calculateFine}
              actionLoading={actionLoading}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showBorrowModal && (
            <BorrowModal
              availableBooks={availableBooks}
              availableUsers={availableUsers}
              onConfirm={handleBorrowBook}
              onCancel={() => setShowBorrowModal(false)}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showQRModal && selectedRecord?.book && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={() => {
                setShowQRModal(false)
                URL.revokeObjectURL(qrCodeUrl)
                setQrCodeUrl('')
              }}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-lg p-6 max-w-sm w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">QR Code</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowQRModal(false)
                      URL.revokeObjectURL(qrCodeUrl)
                      setQrCodeUrl('')
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-4">{selectedRecord.book.title}</p>
                  {qrCodeUrl && (
                    <img 
                      src={qrCodeUrl} 
                      alt="QR Code" 
                      className="w-48 h-48 mx-auto mb-4 border border-gray-200 rounded"
                    />
                  )}
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        const link = document.createElement('a')
                        link.href = qrCodeUrl
                        link.download = `qr-code-${selectedRecord.book.title.replace(/\s+/g, '-').toLowerCase()}.png`
                        link.click()
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download QR Code
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  )
}

const BorrowDetailsModal = ({
  record,
  onClose,
  onReturn,
  calculateFine,
  calculateDaysOverdue,
  getDaysRemaining,
  hasPermission
}) => {
  const isOverdue = new Date(record.dueDate) < new Date() && record.status === 'borrowed'
  const fineAmount = isOverdue ? calculateFine(record.dueDate) : 0
  const daysOverdue = calculateDaysOverdue(record.dueDate)
  const daysRemaining = getDaysRemaining(record.dueDate)

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 300
      }
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      transition: {
        duration: 0.2
      }
    }
  }

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  }

  return (
    <motion.div
      variants={backdropVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={(e) => e.stopPropagation()}
        className={"bg-card rounded-xl border border-border shadow-xl overflow-y-auto fixed inset-y-0 right-0 w-full max-w-xs p-4 md:static md:inset-auto md:mx-auto md:my-8 md:max-w-4xl md:w-full md:max-h-[90vh]"}
      >
        <Card className="border-0">
          <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-primary/10 to-accent/10 rounded-t-xl border-b">
            <CardTitle className="text-card-foreground">Borrow Record Details</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose} className="hover:bg-destructive/10 hover:text-destructive">
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-card-foreground text-lg border-b pb-2">Book Information</h3>

                <div className="flex items-start space-x-4">
                  <div className="w-16 h-24 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BookOpen className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-card-foreground text-lg">{record.book?.title}</h4>
                    <p className="text-muted-foreground">by {record.book?.author}</p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Hash className="h-4 w-4 mr-1" />
                        {record.book?.isbn}
                      </div>
                      <div className="flex items-center">
                        <Tag className="h-4 w-4 mr-1" />
                        {record.book?.genre}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-card-foreground">Published Year:</span>
                    <p className="text-muted-foreground">{record.book?.publishedYear}</p>
                  </div>
                  <div>
                    <span className="font-medium text-card-foreground">Publisher:</span>
                    <p className="text-muted-foreground">{record.book?.publisher || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-card-foreground">Language:</span>
                    <p className="text-muted-foreground">{record.book?.language || 'English'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-card-foreground">Edition:</span>
                    <p className="text-muted-foreground">{record.book?.edition || 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-card-foreground text-lg border-b pb-2">Borrower Information</h3>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-800 rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-card-foreground">{record.user?.name}</h4>
                    <p className="text-muted-foreground">{record.user?.membershipId}</p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-1" />
                        {record.user?.email}
                      </div>
                      {record.user?.phone && (
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-1" />
                          {record.user?.phone}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-card-foreground">Role:</span>
                    <p className="text-muted-foreground capitalize">{record.user?.role}</p>
                  </div>
                  <div>
                    <span className="font-medium text-card-foreground">Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${record.user?.isActive
                        ? 'bg-green-100 text-green-800 border border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800'
                        : 'bg-red-100 text-red-800 border border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800'
                      }`}>
                      {record.user?.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <h3 className="font-semibold text-card-foreground text-lg border-b pb-2">Borrow Details</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <Calendar className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="font-semibold text-blue-800 dark:text-blue-300">Borrow Date</span>
                  </div>
                  <p className="text-blue-700 dark:text-blue-400">{new Date(record.borrowDate).toLocaleDateString()}</p>
                  <p className="text-blue-600 dark:text-blue-500 text-sm">{new Date(record.borrowDate).toLocaleTimeString()}</p>
                </div>

                <div className={`border rounded-lg p-4 ${isOverdue
                    ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
                    : 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800'
                  }`}>
                  <div className="flex items-center mb-2">
                    <Clock className={`h-5 w-5 mr-2 ${isOverdue ? 'text-red-600' : 'text-amber-600'
                      }`} />
                    <span className={`font-semibold ${isOverdue ? 'text-red-800 dark:text-red-300' : 'text-amber-800 dark:text-amber-300'
                      }`}>
                      Due Date
                    </span>
                  </div>
                  <p className={isOverdue ? 'text-red-700 dark:text-red-400' : 'text-amber-700 dark:text-amber-400'}>
                    {new Date(record.dueDate).toLocaleDateString()}
                  </p>
                  <p className={`text-sm ${isOverdue ? 'text-red-600 dark:text-red-500' : 'text-amber-600 dark:text-amber-500'}`}>
                    {isOverdue
                      ? `${daysOverdue} days overdue`
                      : `${daysRemaining} days remaining`
                    }
                  </p>
                </div>

                <div className={`border rounded-lg p-4 ${record.status === 'returned'
                    ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800'
                    : 'bg-muted border-border'
                  }`}>
                  <div className="flex items-center mb-2">
                    {record.status === 'returned' ? (
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    ) : (
                      <BookOpen className="h-5 w-5 text-muted-foreground mr-2" />
                    )}
                    <span className={`font-semibold ${record.status === 'returned' ? 'text-green-800 dark:text-green-300' : 'text-card-foreground'
                      }`}>
                      Status
                    </span>
                  </div>
                  <p className={record.status === 'returned' ? 'text-green-700 dark:text-green-400' : 'text-card-foreground'}>
                    {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                  </p>
                  {record.returnDate && (
                    <p className="text-green-600 dark:text-green-500 text-sm">
                      Returned: {new Date(record.returnDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>

              {isOverdue && (
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <DollarSign className="h-5 w-5 text-red-600 mr-2" />
                    <span className="font-semibold text-red-800 dark:text-red-300">Overdue Fine</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-red-700 dark:text-red-400">Days Overdue:</span>
                      <p className="text-red-600 dark:text-red-500 font-semibold">{daysOverdue} days</p>
                    </div>
                    <div>
                      <span className="text-red-700 dark:text-red-400">Fine Rate:</span>
                      <p className="text-red-600 dark:text-red-500">$5 per day</p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-red-700 dark:text-red-400">Total Fine:</span>
                      <p className="text-red-600 dark:text-red-500 font-bold text-lg">${fineAmount}</p>
                    </div>
                  </div>
                </div>
              )}

              {record.fineAmount > 0 && (
                <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    <span className="font-semibold text-green-800 dark:text-green-300">Fine Paid</span>
                  </div>
                  <p className="text-green-700 dark:text-green-400 font-semibold">${record.fineAmount}</p>
                  <p className="text-green-600 dark:text-green-500 text-sm">Fine has been collected</p>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t mt-6">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              {hasPermission('librarian') && record.status === 'borrowed' && (
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={onReturn}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Return Book
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}

const ReturnModal = ({ record, onConfirm, onCancel, calculateFine, actionLoading }) => {
  const isOverdue = new Date(record.dueDate) < new Date() && record.status === 'borrowed'
  const fineAmount = isOverdue ? calculateFine(record.dueDate) : 0

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 300
      }
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      transition: {
        duration: 0.2
      }
    }
  }

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  }

  return (
    <motion.div
      variants={backdropVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
    >
      <motion.div
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="bg-card rounded-xl w-full max-w-md border border-border shadow-xl"
      >
        <Card className="border-0">
          <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-primary/10 to-accent/10 rounded-t-xl">
            <CardTitle className="text-card-foreground">Return Book</CardTitle>
            <Button variant="ghost" size="sm" onClick={onCancel} className="hover:bg-destructive/10 hover:text-destructive">
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2 flex items-center">
                <BookOpen className="h-4 w-4 mr-2" />
                Book Details
              </h4>
              <p className="text-blue-700 dark:text-blue-400 font-medium">{record.book?.title}</p>
              <p className="text-blue-600 dark:text-blue-500 text-sm">by {record.book?.author}</p>
              <p className="text-blue-600 dark:text-blue-500 text-sm">ISBN: {record.book?.isbn}</p>
            </div>

            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <h4 className="font-semibold text-amber-800 dark:text-amber-300 mb-2 flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Borrower Information
              </h4>
              <p className="text-amber-700 dark:text-amber-400 font-medium">{record.user?.name}</p>
              <p className="text-amber-600 dark:text-amber-500 text-sm">Membership: {record.user?.membershipId}</p>
              <p className="text-amber-600 dark:text-amber-500 text-sm">Due: {new Date(record.dueDate).toLocaleDateString()}</p>
            </div>

            {isOverdue && (
              <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <h4 className="font-semibold text-red-800 dark:text-red-300 mb-2 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Overdue Notice
                </h4>
                <p className="text-red-700 dark:text-red-400">This book is overdue by {Math.ceil((new Date() - new Date(record.dueDate)) / (1000 * 60 * 60 * 24))} days.</p>
                <p className="text-red-700 dark:text-red-400 font-semibold mt-2">Calculated Fine: ${fineAmount}</p>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="outline" onClick={onCancel} className="transition-colors">
                Cancel
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700 transition-colors"
                onClick={() => onConfirm(record)}
                disabled={actionLoading === record._id}
              >
                {actionLoading === record._id ? (
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                {actionLoading === record._id ? 'Processing...' : 'Confirm Return'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}

const BorrowModal = ({ availableBooks, availableUsers, onConfirm, onCancel }) => {
  const [formData, setFormData] = useState({
    userId: '',
    bookId: '',
    dueDate: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.userId || !formData.bookId || !formData.dueDate) {
      alert('Please fill in all fields')
      return
    }
    onConfirm(formData)
  }

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  useEffect(() => {
    const twoWeeksFromNow = new Date()
    twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 14)
    setFormData(prev => ({
      ...prev,
      dueDate: twoWeeksFromNow.toISOString().split('T')[0]
    }))
  }, [])

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 300
      }
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      transition: {
        duration: 0.2
      }
    }
  }

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  }

  return (
    <motion.div
      variants={backdropVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
    >
      <motion.div
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="bg-card rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-border shadow-xl"
      >
        <Card className="border-0">
          <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-primary/10 to-accent/10 rounded-t-xl">
            <CardTitle className="text-card-foreground">Borrow New Book</CardTitle>
            <Button variant="ghost" size="sm" onClick={onCancel} className="hover:bg-destructive/10 hover:text-destructive">
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="text-sm font-medium text-card-foreground mb-2 block">
                  Select User <span className="text-red-600">*</span>
                </label>
                <select
                  name="userId"
                  value={formData.userId}
                  onChange={handleChange}
                  className="w-full border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors bg-background text-foreground"
                  required
                >
                  <option value="">Choose a user...</option>
                  {availableUsers.map(user => (
                    <option key={user._id} value={user._id}>
                      {user.name} ({user.email}) - {user.membershipId}
                    </option>
                  ))}
                </select>
                <p className="text-muted-foreground text-xs mt-1">
                  Only active users are shown
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-card-foreground mb-2 block">
                  Select Book <span className="text-red-600">*</span>
                </label>
                <select
                  name="bookId"
                  value={formData.bookId}
                  onChange={handleChange}
                  className="w-full border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors bg-background text-foreground"
                  required
                >
                  <option value="">Choose a book...</option>
                  {availableBooks.map(book => (
                    <option key={book._id} value={book._id}>
                      {book.title} by {book.author} - {book.isbn} ({book.availableCopies} available)
                    </option>
                  ))}
                </select>
                <p className="text-muted-foreground text-xs mt-1">
                  Only available books are shown
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-card-foreground mb-2 block">
                  Due Date <span className="text-red-600">*</span>
                </label>
                <Input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="transition-colors bg-background"
                  required
                />
                <p className="text-muted-foreground text-xs mt-1">
                  Default: 2 weeks from today
                </p>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button variant="outline" type="button" onClick={onCancel} className="transition-colors">
                  Cancel
                </Button>
                <Button type="submit" className="bg-primary hover:bg-primary/90 transition-colors">
                  <Bookmark className="h-4 w-4 mr-2" />
                  Borrow Book
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}

export default Borrow