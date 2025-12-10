import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  User, Mail, Phone, MapPin, Save, X, Loader, 
  Camera, Lock, Eye, EyeOff, Shield
} from 'lucide-react'
import { usersAPI } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'

const UserForm = ({ user, onSave, onCancel }) => {
  const { user: currentUser } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'member',
    phone: '',
    address: ''
  })
  const [avatarFile, setAvatarFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [formErrors, setFormErrors] = useState({})

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: '',
        confirmPassword: '',
        role: user.role || 'member',
        phone: user.phone || '',
        address: user.address || ''
      })
    }
  }, [user])

  const validateForm = () => {
    const errors = {}
    if (!formData.name.trim()) errors.name = 'Name is required'
    if (!formData.email.trim()) errors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email is invalid'
    
    if (!user && !formData.password) errors.password = 'Password is required'
    if (formData.password && formData.password.length < 6) errors.password = 'Password must be at least 6 characters'
    if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'Passwords do not match'
    
    if (formData.phone && !/^\+?[\d\s-]{10,}$/.test(formData.phone)) errors.phone = 'Invalid phone number'

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/[^\d+\s-]/g, '')
    setFormData(prev => ({ ...prev, phone: value }))
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setFormErrors(prev => ({ ...prev, avatar: 'Image size should be less than 5MB' }))
        return
      }
      setAvatarFile(file)
      setFormErrors(prev => ({ ...prev, avatar: '' }))
    }
  }

  const removeAvatar = () => {
    setAvatarFile(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      setLoading(true)
      setError('')

      const payload = new FormData()
      Object.keys(formData).forEach(key => {
        if (key === 'password' || key === 'confirmPassword') {
          if (formData[key]) payload.append(key, formData[key])
        } else {
          payload.append(key, formData[key])
        }
      })
      
      if (avatarFile) {
        payload.append('avatar', avatarFile)
      }

      let savedUser
      if (user) {
        const response = await usersAPI.update(user._id, payload)
        savedUser = response.data.user
      } else {
        const response = await usersAPI.create(payload)
        savedUser = response.data.user
      }

      onSave(savedUser)
    } catch (err) {
      console.error('Error saving user:', err)
      setError(err.response?.data?.error || 'Failed to save user')
    } finally {
      setLoading(false)
    }
  }

  const getRoleOptions = () => {
    const roles = [
      { value: 'member', label: 'Member' },
      { value: 'librarian', label: 'Librarian' },
      { value: 'admin', label: 'Administrator' }
    ]
    
    if (currentUser?.role !== 'admin') {
      return roles.filter(r => r.value === 'member')
    }
    return roles
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onCancel}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <Card className="border-border bg-card shadow-none">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border bg-muted/20 px-6 py-4 sticky top-0 z-10 backdrop-blur-md">
            <div>
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                {user ? 'Edit User' : 'Add New User'}
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                {user ? `Update details for ${user.name}` : 'Create a new account'}
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={onCancel} className="hover:bg-destructive/10 hover:text-destructive">
              <X className="h-5 w-5" />
            </Button>
          </CardHeader>
          
          <CardContent className="p-6 sm:p-8">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg p-3 mb-6 flex items-center gap-2"
              >
                <div className="h-1.5 w-1.5 rounded-full bg-destructive" />
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Basic Info Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground border-b border-border pb-2 mb-4">
                  Profile Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Avatar Upload */}
                  <div className="col-span-1 md:col-span-2 flex flex-col items-center sm:items-start gap-4 p-4 border border-dashed border-border rounded-lg bg-muted/10">
                    <div className="flex items-center gap-4 w-full">
                      <div className="relative group shrink-0">
                        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center border-2 border-border overflow-hidden">
                          {avatarFile ? (
                            <img src={URL.createObjectURL(avatarFile)} alt="Preview" className="h-full w-full object-cover" />
                          ) : (
                            <User className="h-8 w-8 text-muted-foreground" />
                          )}
                        </div>
                        <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer">
                          <Camera className="h-5 w-5 text-white" />
                          <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                        </label>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">Profile Photo</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Supports JPG, PNG (Max 5MB)</p>
                        {avatarFile && (
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded truncate max-w-[150px]">
                              {avatarFile.name}
                            </span>
                            <button type="button" onClick={removeAvatar} className="text-xs text-destructive hover:underline">
                              Remove
                            </button>
                          </div>
                        )}
                        {formErrors.avatar && <p className="text-xs text-destructive mt-1">{formErrors.avatar}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Name */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Full Name <span className="text-destructive">*</span></label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`pl-9 ${formErrors.name ? 'border-destructive' : ''}`}
                        placeholder="John Doe"
                      />
                    </div>
                    {formErrors.name && <p className="text-xs text-destructive">{formErrors.name}</p>}
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email Address <span className="text-destructive">*</span></label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`pl-9 ${formErrors.email ? 'border-destructive' : ''}`}
                        placeholder="john@example.com"
                      />
                    </div>
                    {formErrors.email && <p className="text-xs text-destructive">{formErrors.email}</p>}
                  </div>
                </div>
              </div>

              {/* Security Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground border-b border-border pb-2 mb-4">
                  Security & Access
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Password */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Password {!user && <span className="text-destructive">*</span>}</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleChange}
                        className={`pl-9 pr-10 ${formErrors.password ? 'border-destructive' : ''}`}
                        placeholder={user ? "Leave empty to keep current" : "Min. 6 characters"}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {formErrors.password && <p className="text-xs text-destructive">{formErrors.password}</p>}
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Confirm Password {!user && <span className="text-destructive">*</span>}</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className={`pl-9 pr-10 ${formErrors.confirmPassword ? 'border-destructive' : ''}`}
                        placeholder="Re-enter password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {formErrors.confirmPassword && <p className="text-xs text-destructive">{formErrors.confirmPassword}</p>}
                  </div>
                </div>
              </div>

              {/* Role & Contact Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground border-b border-border pb-2 mb-4">
                  Additional Details
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Role */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Role <span className="text-destructive">*</span></label>
                    <div className="relative">
                      <Shield className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className="w-full h-10 pl-9 pr-3 rounded-md border border-input bg-background text-sm focus:ring-1 focus:ring-ring"
                      >
                        {getRoleOptions().map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Phone</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        name="phone"
                        value={formData.phone}
                        onChange={handlePhoneChange}
                        className={`pl-9 ${formErrors.phone ? 'border-destructive' : ''}`}
                        placeholder="(123) 456-7890"
                      />
                    </div>
                    {formErrors.phone && <p className="text-xs text-destructive">{formErrors.phone}</p>}
                  </div>

                  {/* Address (Full Width) */}
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-sm font-medium">Address</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className="pl-9"
                        placeholder="123 Main St, City, Country"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex justify-end gap-3 pt-6 border-t border-border mt-8">
                <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="bg-primary text-primary-foreground hover:bg-primary/90 min-w-[120px]">
                  {loading ? <Loader className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                  {user ? 'Update User' : 'Create User'}
                </Button>
              </div>

            </form>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}

export default UserForm