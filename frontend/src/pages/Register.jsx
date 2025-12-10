import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  BookOpen, Camera, AlertCircle, User, Mail, 
  Lock, Phone, MapPin, Shield, ArrowRight, Loader2
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/contexts/AuthContext'

const Register = () => {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    role: 'member'
  })
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB')
      return
    }

    setAvatarFile(file)
    setError('')

    const reader = new FileReader()
    reader.onload = () => setAvatarPreview(reader.result)
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!formData.name || !formData.email || !formData.password || !formData.phone || !formData.address || !formData.role) {
      setError('Please fill in all required fields')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      setLoading(false)
      return
    }

    try {
      const payload = new FormData()
      payload.append('name', formData.name)
      payload.append('email', formData.email)
      payload.append('password', formData.password)
      payload.append('phone', formData.phone)
      payload.append('address', formData.address)
      payload.append('role', formData.role)
      
      if (avatarFile) {
        payload.append('avatar', avatarFile)
      }

      const { success, error: registerError } = await register(payload)
      
      if (success) {
        navigate('/login', { 
          state: { message: 'Account created successfully! Please login.' }
        })
      } else {
        setError(registerError || 'Failed to create account. Please try again.')
      }
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to create account. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background text-foreground relative overflow-hidden p-4 py-10">
      <div className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.03] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="absolute inset-0 w-full h-full pointer-events-none">
          <div className="absolute top-0 left-0 w-[50%] h-[50%] rounded-full bg-secondary/5 blur-[120px]" />
          <div className="absolute bottom-0 right-0 w-[50%] h-[50%] rounded-full bg-muted/10 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-2xl relative z-10"  
      >
        <Card className="border border-border shadow-2xl bg-card/90 backdrop-blur-xl overflow-hidden">
          <div className="h-1.5 w-full bg-primary" />

          <CardHeader className="text-center space-y-2 pt-8 pb-4">
            <div className="flex justify-center mb-4">
              <motion.div 
                whileHover={{ rotate: 10, scale: 1.1 }}
                className="p-3 bg-muted rounded-2xl shadow-sm border border-border"
              >
                <BookOpen className="h-8 w-8 text-primary" />
              </motion.div>
            </div>
            <CardTitle className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Create Account
            </CardTitle>
            <p className="text-muted-foreground text-sm">
              Join LibraFlow and start reading today
            </p>
          </CardHeader>

          <CardContent className="space-y-6 px-6 sm:px-8 pb-8">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex items-center gap-3 text-destructive text-sm font-medium"
                >
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span className="flex-1">{error}</span>
                </motion.div>
              )}
            </AnimatePresence>
            
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="flex flex-col items-center justify-center mb-6">
                <div className="relative group cursor-pointer">
                    <Avatar className="w-24 h-24 border-4 border-background shadow-lg group-hover:border-primary/20 transition-all duration-300">
                      <AvatarImage src={avatarPreview} className="object-cover" />
                      <AvatarFallback className="bg-muted text-muted-foreground">
                        <User className="h-10 w-10 opacity-50" />
                      </AvatarFallback>
                    </Avatar>
                    <label htmlFor="avatar" className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full shadow-md cursor-pointer hover:scale-110 transition-transform">
                        <Camera className="h-4 w-4" />
                        <input 
                            id="avatar" 
                            type="file" 
                            className="hidden" 
                            accept="image/*"
                            onChange={handleAvatarChange}
                        />
                    </label>
                </div>
                <p className="text-xs text-muted-foreground mt-3">Profile Picture (Optional)</p>
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                <div className="space-y-2 flex-1">
                  <label className="text-sm font-semibold text-foreground ml-1">Full Name</label>
                  <div className="relative group">
                    <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                      name="name"
                      placeholder="John Doe"
                      className="pl-10 h-11 border-input bg-background"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2 flex-1">
                  <label className="text-sm font-semibold text-foreground ml-1">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                      name="email"
                      type="email"
                      placeholder="name@example.com"
                      className="pl-10 h-11 border-input bg-background"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                <div className="space-y-2 flex-1">
                  <label className="text-sm font-semibold text-foreground ml-1">Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                      name="password"
                      type="password"
                      placeholder="Min. 6 characters"
                      className="pl-10 h-11 border-input bg-background"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      minLength={6}
                    />
                  </div>
                </div>
                <div className="space-y-2 flex-1">
                  <label className="text-sm font-semibold text-foreground ml-1">Role</label>
                  <div className="relative group">
                    <Shield className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none" />
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      required
                      className="w-full h-11 pl-10 pr-3 border border-input rounded-md bg-background text-foreground focus:ring-1 focus:ring-ring focus:border-ring appearance-none cursor-pointer"
                    >
                      <option value="member">Member</option>
                      <option value="librarian">Librarian</option>
                      <option value="admin">Admin</option>
                    </select>
                    <div className="absolute right-3 top-3 pointer-events-none">
                       <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                <div className="space-y-2 flex-1">
                  <label className="text-sm font-semibold text-foreground ml-1">Phone Number</label>
                  <div className="relative group">
                    <Phone className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                      name="phone"
                      type="tel"
                      placeholder="+1 234 567 890"
                      className="pl-10 h-11 border-input bg-background"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2 flex-1">
                  <label className="text-sm font-semibold text-foreground ml-1">Address</label>
                  <div className="relative group">
                    <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                      name="address"
                      placeholder="123 Main St, City"
                      className="pl-10 h-11 border-input bg-background"
                      value={formData.address}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

              </div>

              <Button 
                type="submit" 
                className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-medium text-base shadow-lg mt-6 transition-all duration-200 hover:scale-[1.01]"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Creating Account...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2 group">
                    <span>Create Account</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                )}
              </Button>
            </form>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Already a member?
                </span>
              </div>
            </div>

            <div className="text-center">
              <Link 
                to="/login" 
                className="font-semibold text-primary hover:underline transition-colors text-sm"
              >
                Sign in to your account
              </Link>
            </div>

            <p className="text-xs text-center text-muted-foreground mt-4">
              By creating an account, you agree to our <Link to="/terms" className="underline hover:text-primary">Terms</Link> and <Link to="/privacy" className="underline hover:text-primary">Privacy Policy</Link>.
            </p>

          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default Register