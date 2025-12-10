import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  User, Mail, Phone, MapPin, Calendar, BookOpen, 
  Edit3, Save, X, Trash2, UserCheck, UserX, 
  Shield, Clock, CheckCircle, AlertCircle,
  Bookmark, History, Download, Mail as MailIcon,
  Search, Loader2, CreditCard
} from 'lucide-react'
import { usersAPI, borrowAPI } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'

const UserDetailsModal = ({ user, isOpen, onClose, onUserUpdate }) => {
  const { hasPermission } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [borrowHistory, setBorrowHistory] = useState([])
  const [currentBorrows, setCurrentBorrows] = useState([])
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({})
  const [stats, setStats] = useState({})
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [actionLoading, setActionLoading] = useState(null)

  useEffect(() => {
    if (isOpen && user) {
      fetchUserDetails()
      setFormData(user)
    }
  }, [isOpen, user])

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

  const fetchUserDetails = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      const [borrowsRes, currentRes] = await Promise.all([
        borrowAPI.getAll({ userId: user._id, limit: 100 }),
        borrowAPI.getAll({ userId: user._id, status: 'borrowed' })
      ])

      setBorrowHistory(borrowsRes.data.borrowRecords || [])
      setCurrentBorrows(currentRes.data.borrowRecords || [])
      
      const totalBorrowed = borrowsRes.data.borrowRecords?.length || 0
      const totalReturned = borrowsRes.data.borrowRecords?.filter(b => b.status === 'returned').length || 0
      const totalOverdue = borrowsRes.data.borrowRecords?.filter(b => b.status === 'overdue').length || 0
      const totalFines = borrowsRes.data.borrowRecords?.reduce((sum, b) => sum + (b.fineAmount || 0), 0) || 0

      setStats({
        totalBorrowed,
        totalReturned,
        totalOverdue,
        totalFines,
        currentBorrows: currentRes.data.borrowRecords?.length || 0
      })
    } catch (error) {
      console.error('Error fetching user details:', error)
      alert('Error fetching user details: ' + (error.response?.data?.error || 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setActionLoading('save')
      const response = await usersAPI.update(user._id, formData)
      onUserUpdate(response.data.user)
      setEditing(false)
      alert('User updated successfully!')
    } catch (error) {
      console.error('Error updating user:', error)
      alert('Error updating user: ' + (error.response?.data?.error || 'Unknown error'))
    } finally {
      setActionLoading(null)
    }
  }

  const handleCancel = () => {
    setFormData(user)
    setEditing(false)
  }

  const handleDeleteUser = async () => {
    if (!window.confirm(`Are you sure you want to delete ${user.name}? This action cannot be undone.`)) {
      return
    }

    try {
      setActionLoading('delete')
      await usersAPI.delete(user._id)
      onClose()
      alert('User deleted successfully!')
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('Error deleting user: ' + (error.response?.data?.error || 'Unknown error'))
    } finally {
      setActionLoading(null)
    }
  }

  const handleToggleStatus = async () => {
    try {
      setActionLoading('status')
      const action = user.isActive ? 'deactivate' : 'activate'
      const response = await usersAPI[action](user._id)
      onUserUpdate(response.data.user)
      alert(`User ${user.isActive ? 'deactivated' : 'activated'} successfully!`)
    } catch (error) {
      console.error('Error toggling user status:', error)
      alert('Error updating user status: ' + (error.response?.data?.error || 'Unknown error'))
    } finally {
      setActionLoading(null)
    }
  }

  const handleReturnBook = async (borrowId, bookTitle) => {
    try {
      setActionLoading(borrowId)
      await borrowAPI.return(borrowId)
      alert(`"${bookTitle}" has been returned successfully!`)
      fetchUserDetails() 
    } catch (error) {
      console.error('Error returning book:', error)
      alert('Error returning book: ' + (error.response?.data?.error || 'Unknown error'))
    } finally {
      setActionLoading(null)
    }
  }

 const getStatusBadge = (status) => {
    const styles = {
      borrowed: 'bg-primary/10 text-primary border-primary/20',
      returned: 'bg-muted text-muted-foreground border-transparent',
      overdue: 'bg-destructive/10 text-destructive border-destructive/20'
    }
    return (
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${styles[status]}`}>
        {status}
      </span>
    )
  }

  const getRoleBadge = (role) => {
    const roleStyles = {
      admin: 'bg-purple-100 text-purple-800 border border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800',
      librarian: 'bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
      member: 'bg-green-100 text-green-800 border border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800'
    }
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${roleStyles[role]}`}>
        {role}
      </span>
    )
  }

 const filteredBorrowHistory = borrowHistory.filter(record => {
    const matchesSearch = !searchTerm || 
      record.book?.title?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const statCards = [
    {
      title: 'Total Borrowed',
      value: stats.totalBorrowed,
      icon: <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />,
      color: 'bg-blue-500',
      description: 'All time borrows'
    },
    {
      title: 'Currently Borrowed',
      value: stats.currentBorrows,
      icon: <Bookmark className="h-4 w-4 sm:h-5 sm:w-5" />,
      color: 'bg-amber-500',
      description: 'Active borrows'
    },
    {
      title: 'Books Returned',
      value: stats.totalReturned,
      icon: <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />,
      color: 'bg-green-500',
      description: 'Successfully returned'
    },
    {
      title: 'Total Fines',
      value: `$${stats.totalFines}`,
      icon: <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5" />,
      color: 'bg-red-500',
      description: 'Outstanding fines'
    }
  ]

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 300
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.9, 
      y: 20,
      transition: {
        duration: 0.2
      }
    }
  }

  if (!user) return null

  return (
   <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Slide-Over Panel */}
          <motion.div
            variants={slideVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-y-0 right-0 z-50 w-full max-w-2xl bg-card border-l border-border shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-background/50 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center border border-border">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <h2 className="text-lg font-bold leading-tight">{user.name}</h2>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {hasPermission('admin') && (
                  <Button variant="outline" size="sm" onClick={() => setEditing(!editing)}>
                    <Edit3 className="h-4 w-4 mr-2" /> {editing ? 'Cancel' : 'Edit'}
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-background">
              
              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Card className="border border-border shadow-sm bg-card">
                  <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                    <BookOpen className="h-5 w-5 text-primary mb-2 opacity-80" />
                    <span className="text-2xl font-bold">{stats.totalBorrowed}</span>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Total</span>
                  </CardContent>
                </Card>
                <Card className="border border-border shadow-sm bg-primary/5">
                  <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                    <Bookmark className="h-5 w-5 text-primary mb-2 opacity-80" />
                    <span className="text-2xl font-bold">{stats.currentBorrows}</span>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Active</span>
                  </CardContent>
                </Card>
                <Card className="border border-border shadow-sm bg-card">
                  <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                    <CheckCircle className="h-5 w-5 text-muted-foreground mb-2 opacity-80" />
                    <span className="text-2xl font-bold">{stats.totalReturned}</span>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Returned</span>
                  </CardContent>
                </Card>
                <Card className={`border shadow-sm ${stats.totalFines > 0 ? 'border-destructive/30 bg-destructive/5' : 'border-border bg-card'}`}>
                  <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                    <CreditCard className={`h-5 w-5 mb-2 opacity-80 ${stats.totalFines > 0 ? 'text-destructive' : 'text-muted-foreground'}`} />
                    <span className={`text-2xl font-bold ${stats.totalFines > 0 ? 'text-destructive' : ''}`}>${stats.totalFines}</span>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Fines</span>
                  </CardContent>
                </Card>
              </div>

              {/* Tabs */}
              <div className="flex items-center border-b border-border">
                {['overview', 'current', 'history'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors capitalize ${
                      activeTab === tab 
                        ? 'border-primary text-primary' 
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="min-h-[300px]">
                {loading ? (
                  <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
                ) : (
                  <>
                    {activeTab === 'overview' && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-muted-foreground uppercase">Phone</label>
                            <p className="text-sm font-medium">{user.phone || 'N/A'}</p>
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-muted-foreground uppercase">Address</label>
                            <p className="text-sm font-medium">{user.address || 'N/A'}</p>
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-muted-foreground uppercase">Member Since</label>
                            <p className="text-sm font-medium">{new Date(user.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-muted-foreground uppercase">Status</label>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${user.isActive ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                              {user.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'current' && (
                      <div className="space-y-3">
                        {currentBorrows.length === 0 ? (
                          <div className="text-center py-10 text-muted-foreground text-sm">No active loans.</div>
                        ) : (
                          currentBorrows.map(record => (
                            <div key={record._id} className="flex items-center justify-between p-3 border border-border rounded-lg bg-card hover:border-primary/30 transition-colors">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-8 bg-muted rounded border border-border flex items-center justify-center">
                                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <div>
                                  <p className="text-sm font-semibold">{record.book?.title}</p>
                                  <p className="text-xs text-muted-foreground">Due: {new Date(record.dueDate).toLocaleDateString()}</p>
                                </div>
                              </div>
                              <Button size="sm" variant="outline" onClick={() => handleReturnBook(record._id)}>
                                Return
                              </Button>
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    {activeTab === 'history' && (
                      <div className="space-y-4">
                        <div className="relative">
                          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input 
                            placeholder="Search history..." 
                            className="pl-9 h-9 text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          {filteredBorrowHistory.length === 0 ? (
                            <div className="text-center py-10 text-muted-foreground text-sm">No history found.</div>
                          ) : (
                            filteredBorrowHistory.map(record => (
                              <div key={record._id} className="flex items-center justify-between p-3 border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                                <div className="flex items-center gap-3">
                                  <div className={`w-1.5 h-1.5 rounded-full ${record.status === 'returned' ? 'bg-muted-foreground' : 'bg-primary'}`} />
                                  <div>
                                    <p className="text-sm font-medium">{record.book?.title}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {new Date(record.borrowDate).toLocaleDateString()} - {record.returnDate ? new Date(record.returnDate).toLocaleDateString() : 'Now'}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  {getStatusBadge(record.status)}
                                  {record.fineAmount > 0 && (
                                    <p className="text-xs text-destructive font-bold mt-0.5">${record.fineAmount}</p>
                                  )}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Footer Actions */}
            {hasPermission('admin') && (
              <div className="p-4 border-t border-border bg-muted/20 flex justify-between items-center sticky bottom-0 backdrop-blur-sm">
                <Button variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={handleDeleteUser}>
                  <Trash2 className="h-4 w-4 mr-2" /> Delete User
                </Button>
                <div className="flex gap-2">
                  {user.isActive ? (
                    <Button variant="outline" onClick={handleToggleStatus}>Deactivate</Button>
                  ) : (
                    <Button onClick={handleToggleStatus}>Activate</Button>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default UserDetailsModal