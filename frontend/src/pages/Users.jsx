import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Search, Filter, Plus, User as UserIcon, Mail, Phone, MapPin,
  Eye, Edit, Trash2, UserCheck, UserX, Download, Users as UsersIcon,
  Shield, Calendar, MoreVertical, BookOpen, AlertCircle, TrendingUp,
  Activity, Bookmark, Library, QrCode, Loader, X
} from 'lucide-react'
import { usersAPI } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import UserDetailsModal from '@/components/User/UserDetailsModal'
import UserForm from '@/components/User/UserForm'

const Users = () => {
  const { user: currentUser, hasPermission } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [stats, setStats] = useState({})
  const [selectedUser, setSelectedUser] = useState(null)
  const [showUserModal, setShowUserModal] = useState(false)
  const [showUserForm, setShowUserForm] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [actionLoading, setActionLoading] = useState(null)
  const [statsLoading, setStatsLoading] = useState(true)
  const [showQRModal, setShowQRModal] = useState(false)
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [qrLoading, setQrLoading] = useState(false)

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

  useEffect(() => {
    fetchUsers()
    fetchStats()
  }, [searchTerm, selectedRole, selectedStatus])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const params = {
        page: 1,
        limit: 50,
        ...(searchTerm && { search: searchTerm }),
        ...(selectedRole && { role: selectedRole }),
        ...(selectedStatus && { status: selectedStatus })
      }
      const response = await usersAPI.getAll(params)
      setUsers(response.data.users)
    } catch (error) {
      console.error('Error fetching users:', error)
      alert('Error fetching users: ' + (error.response?.data?.error || 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      setStatsLoading(true)
      const response = await usersAPI.getStats()
      setStats(response.data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setStatsLoading(false)
    }
  }

  const handleViewUser = (user) => {
    setSelectedUser(user)
    setShowUserModal(true)
  }

  const handleEditUser = (user) => {
    setEditingUser(user)
    setShowUserForm(true)
  }

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) return
    
    try {
      setActionLoading(userId)
      await usersAPI.delete(userId)
      setUsers(users.filter(user => user._id !== userId))
      fetchStats()
      alert(`${userName} has been deleted successfully`)
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('Error deleting user: ' + (error.response?.data?.error || 'Unknown error'))
    } finally {
      setActionLoading(null)
    }
  }

  const handleToggleStatus = async (userId, currentStatus, userName) => {
    try {
      setActionLoading(userId)
      if (currentStatus) {
        await usersAPI.deactivate(userId)
        alert(`${userName} has been deactivated`)
      } else {
        await usersAPI.activate(userId)
        alert(`${userName} has been activated`)
      }
      fetchUsers()
      fetchStats() 
    } catch (error) {
      console.error('Error updating user status:', error)
      alert('Error updating user status: ' + (error.response?.data?.error || 'Unknown error'))
    } finally {
      setActionLoading(null)
    }
  }

  const handleUserUpdate = (updatedUser) => {
    setUsers(users.map(user => 
      user._id === updatedUser._id ? updatedUser : user
    ))
    fetchStats()
  }

  const handleAddUser = () => {
    setEditingUser(null)
    setShowUserForm(true)
  }

  const handleSaveUser = async (userData) => {
    try {
      let response
      if (editingUser) {
        response = await usersAPI.update(editingUser._id, userData)
      } else {
        response = await usersAPI.register(userData)
      }

      const savedUser = response.data.user || response.data
      
      if (editingUser) {
        setUsers(users.map(user => user._id === savedUser._id ? savedUser : user))
      } else {
        setUsers([savedUser, ...users])
      }
      
      setShowUserForm(false)
      setEditingUser(null)
      fetchStats() 
      
      alert(`User ${editingUser ? 'updated' : 'created'} successfully!`)
    } catch (error) {
      console.error('Error saving user:', error)
      alert('Error saving user: ' + (error.response?.data?.error || 'Unknown error'))
    }
  }

  const handleGenerateQR = async (user) => {
    try {
      setQrLoading(true)
      const response = await usersAPI.getQRCode(user._id)
      const url = URL.createObjectURL(response.data)
      setQrCodeUrl(url)
      setSelectedUser(user)
      setShowQRModal(true)
    } catch (error) {
      console.error('Error generating QR code:', error)
      alert('Failed to generate QR code')
    } finally {
      setQrLoading(false)
    }
  }

  const getRoleBadge = (role) => {
    const roleStyles = {
      admin: 'bg-purple-100 text-purple-800 border-purple-200',
      librarian: 'bg-blue-100 text-blue-800 border-blue-200',
      member: 'bg-green-100 text-green-800 border-green-200'
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${roleStyles[role]}`}>
        {role}
      </span>
    )
  }

  const getStatusBadge = (isActive) => (
    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
      isActive 
        ? 'bg-green-100 text-green-800 border-green-200' 
        : 'bg-red-100 text-red-800 border-red-200'
    }`}>
      {isActive ? 'Active' : 'Inactive'}
    </span>
  )

  const statsCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers || 0,
      icon: <UsersIcon className="h-6 w-6 text-black" />,
      description: 'All registered users',
      color: 'bg-gradient-to-br from-white-500 to-white-600',
      trend: '+12%',
      trendPositive: true
    },
    {
      title: 'Active Users',
      value: stats.activeUsers || 0,
      icon: <UserCheck className="h-6 w-6 text-black" />,
      description: 'Currently active accounts',
      color: 'bg-gradient-to-br from-green-500 to-green-600',
      trend: '+5%',
      trendPositive: true
    },
    {
      title: 'Administrators',
      value: stats.adminUsers || 0,
      icon: <Shield className="h-6 w-6 text-black" />,
      description: 'System administrators',
      color: 'bg-gradient-to-br from-purple-500 to-purple-600',
      trend: '0%',
      trendPositive: true
    },
    {
      title: 'Librarians',
      value: stats.librarianUsers || 0,
      icon: <Library className="h-6 w-6 text-black" />,
      description: 'Library staff members',
      color: 'bg-gradient-to-br from-blue-500 to-blue-600',
      trend: '+2%',
      trendPositive: true
    },
    {
      title: 'Members',
      value: stats.memberUsers || 0,
      icon: <UserIcon className="h-6 w-6 text-black" />,
      description: 'Library members',
      color: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
      trend: '+8%',
      trendPositive: true
    },
    {
      title: 'Active Borrowers',
      value: stats.usersWithActiveBorrows || 0,
      icon: <Bookmark className="h-6 w-6 text-black" />,
      description: 'Users with active borrows',
      color: 'bg-gradient-to-br from-orange-500 to-orange-600',
      trend: '+15%',
      trendPositive: true
    }
  ]

  const UserCard = ({ user }) => {
    const [showActions, setShowActions] = useState(false)

    return (
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover="hover"
      >
        <Card className="border-gray-200 hover:shadow-lg transition-all duration-300 hover:border-delft-300 group">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-delft-600 to-delft-800 rounded-full flex items-center justify-center">
                  <UserIcon className="h-6 w-6 text-bone" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{user.name}</h3>
                  <p className="text-sm text-gray-600">{user.membershipId}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {getRoleBadge(user.role)}
                {getStatusBadge(user.isActive)}
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="truncate">{user.email}</span>
              </div>
              {user.phone && (
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="truncate">{user.phone}</span>
                </div>
              )}
              {user.address && (
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="truncate">{user.address}</span>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-gray-100">
              <div className="text-xs text-gray-500 flex items-center">
                <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
                Joined {new Date(user.createdAt).toLocaleDateString()}
              </div>
              
              <div className="relative">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowActions(!showActions)
                  }}
                  disabled={actionLoading === user._id}
                >
                  {actionLoading === user._id ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-delft-700"></div>
                  ) : (
                    <MoreVertical className="h-4 w-4" />
                  )}
                </Button>
                
                {showActions && (
                  <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-lg shadow-lg z-10 w-48">
                    <div className="py-1">
                      <button
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation()
                          setShowActions(false)
                          handleViewUser(user)
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </button>
                      
                      <button
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation()
                          setShowActions(false)
                          handleGenerateQR(user)
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
                      
                      {hasPermission('admin') && (
                        <>
                          <button
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation()
                              setShowActions(false)
                              handleEditUser(user)
                            }}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit User
                          </button>
                          
                          <button
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation()
                              setShowActions(false)
                              handleToggleStatus(user._id, user.isActive, user.name)
                            }}
                            disabled={actionLoading === user._id}
                          >
                            {user.isActive ? (
                              <>
                                <UserX className="h-4 w-4 mr-2 text-red-600" />
                                <span className="text-red-600">Deactivate</span>
                              </>
                            ) : (
                              <>
                                <UserCheck className="h-4 w-4 mr-2 text-green-600" />
                                <span className="text-green-600">Activate</span>
                              </>
                            )}
                          </button>
                          
                          {currentUser._id !== user._id && (
                            <button
                              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation()
                                setShowActions(false)
                                handleDeleteUser(user._id, user.name)
                              }}
                              disabled={actionLoading === user._id}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete User
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  useEffect(() => {
    const handleClickOutside = () => {
      const dropdowns = document.querySelectorAll('[data-dropdown]')
      dropdowns.forEach(dropdown => {
        dropdown.style.display = 'none'
      })
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-delft-800">User Management</h1>
            <p className="text-gray-600 mt-2">Manage library members and staff accounts with ease</p>
          </div>
          <div className="flex space-x-3 mt-4 lg:mt-0">
            {hasPermission('admin') && (
              <Button 
                className="bg-primary text-white  hover:bg-primary/90 transition-colors"
                onClick={handleAddUser}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            )}
          </div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8"
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
                          {statsLoading ? (
                            <div className="animate-pulse bg-gray-200 h-7 w-12 rounded"></div>
                          ) : (
                            stat.value
                          )}
                        </p>
                        <span className={`text-xs font-medium ${
                          stat.trendPositive ? 'text-green-600' : 'text-red-600'
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
          <Card className="border-gray-200 mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search users by name, email, or membership ID..."
                    className="pl-10 border-gray-300 focus:border-delft-500 transition-colors"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="relative flex-1">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <select
                    className="w-full border border-gray-300 rounded-md pl-10 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-delft-500 focus:border-delft-500 appearance-none bg-white transition-colors"
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                  >
                    <option value="">All Roles</option>
                    <option value="admin">Admin</option>
                    <option value="librarian">Librarian</option>
                    <option value="member">Member</option>
                  </select>
                </div>

                <div className="relative flex-1">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <select
                    className="w-full border border-gray-300 rounded-md pl-10 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-delft-500 focus:border-delft-500 appearance-none bg-white transition-colors"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                {(searchTerm || selectedRole || selectedStatus) && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm('')
                      setSelectedRole('')
                      setSelectedStatus('')
                    }}
                    className="border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-delft-700"></div>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {users.map((user, index) => (
              <motion.div
                key={user._id}
                variants={itemVariants}
                custom={index}
                className="cursor-pointer"
                onClick={() => handleViewUser(user)}
              >
                <UserCard user={user} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {!loading && users.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="border-gray-200 text-center py-16">
              <CardContent>
                <UsersIcon className="h-20 w-20 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No users found</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  {searchTerm || selectedRole || selectedStatus
                    ? 'No users match your search criteria. Try adjusting your filters or search term.'
                    : 'Get started by adding your first user to the system.'
                  }
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  {(searchTerm || selectedRole || selectedStatus) && (
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setSearchTerm('')
                        setSelectedRole('')
                        setSelectedStatus('')
                      }}
                      className="border-delft-300 text-delft-700 hover:bg-delft-50 transition-colors"
                    >
                      Clear all filters
                    </Button>
                  )}
                  {hasPermission('admin') && (
                    <Button 
                      className="bg-delft-700 hover:bg-delft-800 transition-colors"
                      onClick={handleAddUser}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add First User
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {!loading && users.length > 0 && users.length >= 50 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-center mt-8"
          >
            <Button 
              variant="outline" 
              className="border-delft-300 text-delft-700 hover:bg-delft-50 transition-colors"
              onClick={fetchUsers}
            >
              Load More Users
            </Button>
          </motion.div>
        )}

        <UserDetailsModal
          user={selectedUser}
          isOpen={showUserModal}
          onClose={() => {
            setShowUserModal(false)
            setSelectedUser(null)
          }}
          onUserUpdate={handleUserUpdate}
        />

        {showUserForm && (
          <UserForm
            user={editingUser}
            onSave={handleSaveUser}
            onCancel={() => {
              setShowUserForm(false)
              setEditingUser(null)
            }}
          />
        )}

        {showQRModal && selectedUser && (
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
                <h3 className="text-lg font-semibold">User QR Code</h3>
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
                <p className="text-sm text-gray-600 mb-4">{selectedUser.name}</p>
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
                      link.download = `qr-code-${selectedUser.name.replace(/\s+/g, '-').toLowerCase()}.png`
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
      </div>
    </div>
  )
}

export default Users