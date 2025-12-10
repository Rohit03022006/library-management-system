import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  User, Mail, Phone, MapPin, Calendar, BookOpen,
  Edit3, Save, X, Camera, Shield, History, Loader2,
  CheckCircle, Clock, CreditCard
} from 'lucide-react'
import { usersAPI, borrowAPI } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const Profile = () => {
  const { user, logout } = useAuth()
  const [profile, setProfile] = useState(null)
  const [borrowHistory, setBorrowHistory] = useState([])
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({})
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState('')
  const [saving, setSaving] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => {
    fetchProfileData()
  }, [])

  const booksReadCount = borrowHistory.filter(record => record.status === 'returned').length
  const currentlyReadingCount = borrowHistory.filter(record => record.status === 'borrowed').length
  const totalFines = borrowHistory.reduce((acc, curr) => acc + (curr.fineAmount || 0), 0)

  const fetchProfileData = async () => {
    try {
      const [profileRes, borrowsRes] = await Promise.all([
        usersAPI.getProfile(),
        borrowAPI.getAll({ userId: user._id, limit: 10 })
      ])
      
      setProfile(profileRes.data.user)
      setBorrowHistory(borrowsRes.data.borrowRecords)
      setFormData(profileRes.data.user)
      setAvatarPreview(profileRes.data.user?.avatar?.url || '')
    } catch (error) {
      console.error('Error fetching profile data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const payload = new FormData()
      const updatableFields = ['name', 'email', 'phone', 'address']
      updatableFields.forEach((field) => {
        if (formData[field] !== undefined && formData[field] !== null) {
          payload.append(field, formData[field])
        }
      })
      if (avatarFile) {
        payload.append('avatar', avatarFile)
      }

      const response = await usersAPI.updateProfile(payload)
      setProfile(response.data.user)
      setFormData(response.data.user)
      setAvatarPreview(response.data.user?.avatar?.url || '')
      setAvatarFile(null)
      setEditing(false)
    } catch (error) {
      console.error('Error updating profile:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setFormData(profile)
    setAvatarPreview(profile?.avatar?.url || '')
    setAvatarFile(null)
    setEditing(false)
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)

    const reader = new FileReader()
    reader.onload = () => setAvatarPreview(reader.result)
    reader.readAsDataURL(file)
  }

  const getInitials = (name = '') => {
    return name
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0]?.toUpperCase())
      .slice(0, 2)
      .join('') || 'U'
  }

  const getStatusBadge = (status) => {
    const styles = {
      borrowed: 'bg-primary/10 text-primary border-primary/20',
      returned: 'bg-muted text-muted-foreground border-transparent',
      overdue: 'bg-destructive/10 text-destructive border-destructive/20'
    }
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || styles.returned} capitalize`}>
        {status}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
          <p className="text-muted-foreground">Manage your account settings and view borrow history</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-6">
            <div className="sticky top-24">
              <Card className="border border-border shadow-lg bg-card/80 backdrop-blur-sm overflow-hidden">
                <div className="h-24 bg-muted/50 border-b border-border relative">
                   <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary via-transparent to-transparent"></div>
                </div>
                <CardContent className="px-6 pb-6 pt-0 text-center relative">
                  
                  <div className="relative -mt-12 inline-block mb-4 group">
                    <Avatar className="w-24 h-24 border-4 border-background shadow-sm">
                      <AvatarImage src={avatarPreview} alt={profile.name} className="object-cover" />
                      <AvatarFallback className="bg-muted text-muted-foreground font-bold text-xl">
                        {getInitials(profile.name)}
                      </AvatarFallback>
                    </Avatar>
                    
                    {editing && (
                      <>
                        <div 
                          onClick={() => fileInputRef.current?.click()}
                          className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer border-4 border-transparent"
                        >
                          <Camera className="h-6 w-6 text-white" />
                        </div>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-1.5 rounded-full shadow-lg border-2 border-background hover:scale-110 transition-transform"
                        >
                          <Edit3 className="h-3 w-3" />
                        </button>
                        <input
                          type="file"
                          accept="image/*"
                          ref={fileInputRef}
                          className="hidden"
                          onChange={handleAvatarChange}
                        />
                      </>
                    )}
                  </div>

                  <h2 className="text-xl font-bold mb-1">{profile.name}</h2>
                  <p className="text-sm text-muted-foreground mb-4">{profile.email}</p>
                  
                  <div className="flex justify-center items-center gap-2 mb-6">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground border border-border capitalize">
                      <Shield className="h-3 w-3" />
                      {profile.role}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Joined {new Date(profile.createdAt).getFullYear()}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-px bg-border rounded-lg overflow-hidden border border-border mb-6">
                    <div className="bg-card p-3 text-center hover:bg-muted/50 transition-colors">
                      <p className="text-xl font-bold">{booksReadCount}</p>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Read</p>
                    </div>
                    <div className="bg-card p-3 text-center hover:bg-muted/50 transition-colors">
                      <p className="text-xl font-bold">{currentlyReadingCount}</p>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Active</p>
                    </div>
                  </div>

                  {!editing ? (
                    <Button 
                      variant="outline" 
                      className="w-full border-dashed border-input hover:border-primary hover:bg-muted hover:text-primary"
                      onClick={() => setEditing(true)}
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button 
                        className="flex-1 bg-primary text-primary-foreground"
                        onClick={handleSave}
                        disabled={saving}
                      >
                        {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                        Save
                      </Button>
                      <Button 
                        variant="ghost"
                        className="flex-1"
                        onClick={handleCancel}
                        disabled={saving}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="bg-card border border-border shadow-sm hover:border-primary/50 transition-all group">
                <CardContent className="p-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Total Books</p>
                    <p className="text-2xl font-bold text-foreground">{booksReadCount + currentlyReadingCount}</p>
                  </div>
                  <div className="p-2 bg-primary/5 rounded-lg group-hover:bg-primary/10 transition-colors">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card border border-border shadow-sm hover:border-primary/50 transition-all group">
                <CardContent className="p-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Active Loans</p>
                    <p className="text-2xl font-bold text-foreground">{currentlyReadingCount}</p>
                  </div>
                  <div className="p-2 bg-primary/5 rounded-lg group-hover:bg-primary/10 transition-colors">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card border border-border shadow-sm hover:border-primary/50 transition-all group">
                <CardContent className="p-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Outstanding Fines</p>
                    <p className="text-2xl font-bold text-foreground">${totalFines}</p>
                  </div>
                  <div className="p-2 bg-primary/5 rounded-lg group-hover:bg-primary/10 transition-colors">
                    <CreditCard className="h-5 w-5 text-primary" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border border-border">
              <CardHeader className="border-b border-border/50 pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5 text-muted-foreground" /> Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase text-muted-foreground">Full Name</label>
                    {editing ? (
                      <Input 
                        value={formData.name || ''} 
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="bg-background"
                      />
                    ) : (
                      <div className="p-2.5 bg-muted/30 rounded-md text-sm border border-transparent">
                        {profile.name}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase text-muted-foreground">Email Address</label>
                    {editing ? (
                      <Input 
                        value={formData.email || ''} 
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="bg-background"
                      />
                    ) : (
                      <div className="flex items-center gap-2 p-2.5 bg-muted/30 rounded-md text-sm border border-transparent">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        {profile.email}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase text-muted-foreground">Phone Number</label>
                    {editing ? (
                      <Input 
                        value={formData.phone || ''} 
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="bg-background"
                        placeholder="+1 (555) 000-0000"
                      />
                    ) : (
                      <div className="flex items-center gap-2 p-2.5 bg-muted/30 rounded-md text-sm border border-transparent">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        {profile.phone || 'Not provided'}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase text-muted-foreground">Address</label>
                    {editing ? (
                      <Input 
                        value={formData.address || ''} 
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="bg-background"
                        placeholder="123 Main St..."
                      />
                    ) : (
                      <div className="flex items-center gap-2 p-2.5 bg-muted/30 rounded-md text-sm border border-transparent">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        {profile.address || 'Not provided'}
                      </div>
                    )}
                  </div>

                </div>
              </CardContent>
            </Card>
            
            <Card className="border border-border">
              <CardHeader className="border-b border-border/50 pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <History className="h-5 w-5 text-muted-foreground" /> Recent Activity
                  </CardTitle>
                  <Button variant="ghost" size="sm" className="text-xs h-8">View All</Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="divide-y divide-border">
                  {borrowHistory.length === 0 ? (
                    <div className="py-12 text-center text-muted-foreground">
                      <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-20" />
                      <p>No reading history yet.</p>
                    </div>
                  ) : (
                    borrowHistory.map((record) => (
                      <div key={record._id} className="py-4 flex items-center justify-between hover:bg-muted/30 transition-colors -mx-6 px-6">
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-lg ${record.status === 'borrowed' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                            <BookOpen className="h-5 w-5" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm">{record.book?.title}</h4>
                            <p className="text-xs text-muted-foreground">by {record.book?.author}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          {getStatusBadge(record.status)}
                          <p className="text-[10px] text-muted-foreground mt-1 font-medium">
                            {new Date(record.borrowDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile