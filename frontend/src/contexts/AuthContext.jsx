import React, { createContext, useState, useContext, useEffect } from 'react'
import { authAPI, usersAPI } from '@/lib/api'
import axios from 'axios'

export const useAuth = () => useContext(AuthContext)

const AuthContext = createContext()



export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem('token'))

  useEffect(() => {
    if (token) {
      verifyToken()
    } else {
      setLoading(false)
    }
  }, [token])

  const verifyToken = async () => {
    try {
      const userData = await usersAPI.getProfile()
      const profileUser = userData.data.user || userData.data
      const normalizedUser = {
        ...profileUser,
        _id: profileUser?._id || profileUser?.id
      }
      setUser(normalizedUser)
    } catch (error) {
      console.error('Token verification failed:', error)
      localStorage.removeItem('token')
      setToken(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password })
      const { token: newToken, user: userData } = response.data
      
      localStorage.setItem('token', newToken)
      setToken(newToken)

      const normalizedUser = {
        ...userData,
        _id: userData?._id || userData?.id
      }

      setUser(normalizedUser)
      
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Login failed' 
      }
    }
  }

  const register = async (userData) => {
  try {
    const response = await authAPI.register(userData)
    
    console.log('Registration response:', response); 
    const responseData = response.data;

    const newToken = responseData.token || responseData.access_token || responseData.data?.token;
    const userDataFromResponse = responseData.user || responseData.data?.user || responseData;
    
    if (!newToken) {
      console.warn('No token received from server, response:', responseData);
      return { success: true, data: response.data }
    }
    
    localStorage.setItem('token', newToken)
    setToken(newToken)

    const normalizedUser = {
      ...userDataFromResponse,
      _id: userDataFromResponse?._id || userDataFromResponse?.id
    }

    setUser(normalizedUser)
    
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Registration error in context:', error);
    return { 
      success: false, 
      error: error.response?.data?.error || error.response?.data?.message || error.message || 'Registration failed' 
    }
  }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  const updateUser = (updatedUser) => {
    setUser(updatedUser)
  }

  const hasPermission = (requiredRole) => {
    if (!user) return false
    
    const roleHierarchy = {
      member: ['member'],
      librarian: ['librarian', 'member'],
      admin: ['admin', 'librarian', 'member']
    }
    
    return roleHierarchy[user.role]?.includes(requiredRole) || false
  }
  const value = {
    user,
    token,
    login,
    register,
    logout,
    updateUser,
    hasPermission,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}