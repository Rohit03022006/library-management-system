import React from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2, ShieldAlert, ArrowLeft, Lock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const normalizeRoles = (roleInput) => {
  if (!roleInput) return []
  if (Array.isArray(roleInput)) return roleInput
  return roleInput
    .split(',')
    .map(role => role.trim())
    .filter(Boolean)
}

const ProtectedRoute = ({ 
  children, 
  requiredRole = null,
  fallbackPath = "/login", 
  showLoading = true 
}) => {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const allowedRoles = normalizeRoles(requiredRole)

  if (loading) {
    if (!showLoading) return null
    
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-sm text-muted-foreground animate-pulse font-medium tracking-wide">
          VERIFYING PERMISSIONS...
        </p>
      </div>
    )
  }

  if (!user) {
    const currentPath = window.location.pathname + window.location.search
    sessionStorage.setItem('redirectAfterLogin', currentPath)
    
    return <Navigate to={fallbackPath} replace />
  }

  const hasRequiredRole =
    allowedRoles.length === 0 ||
    allowedRoles.includes(user.role) ||
    user.role === 'admin'

  if (!hasRequiredRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground relative overflow-hidden p-4">
        
        {/* Background Texture */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        
        {/* Giant Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
          <span className="text-[20rem] font-black text-muted/20 opacity-50 transform -rotate-12 translate-y-10">
            403
          </span>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="relative z-10 w-full max-w-md"
        >
          <Card className="border border-border shadow-2xl bg-card/90 backdrop-blur-xl">
            <CardContent className="flex flex-col items-center justify-center p-8 text-center">
              
              <div className="mb-6 p-4 rounded-full bg-destructive/5 border border-destructive/20 text-destructive">
                <Lock className="h-8 w-8" />
              </div>

              <h3 className="text-2xl font-bold tracking-tight mb-2">
                Access Restricted
              </h3>
              
              <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
                Your account does not have the necessary permissions to view this resource.
              </p>

              {/* Role Debugging/Info (Styled as Code) */}
              <div className="w-full bg-muted/50 rounded-lg p-3 mb-6 text-xs font-mono border border-border text-left space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Current Role:</span>
                  <span className="font-bold text-foreground uppercase">{user.role}</span>
                </div>
                {allowedRoles.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Required:</span>
                    <span className="text-foreground">{allowedRoles.join(' | ')}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <Button 
                  variant="outline" 
                  onClick={() => navigate(-1)}
                  className="flex-1 border-input hover:bg-muted"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Go Back
                </Button>
                <Button 
                  onClick={() => navigate('/dashboard')}
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Dashboard
                </Button>
              </div>

            </CardContent>
          </Card>
          
          <div className="text-center mt-6 text-xs text-muted-foreground">
            Session ID: {user._id?.substring(0, 8)}... • <span className="underline cursor-pointer" onClick={() => window.location.reload()}>Retry Authentication</span>
          </div>

        </motion.div>
      </div>
    )
  }

  return children
}

export default ProtectedRoute