import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Header from "@/components/Layout/Header";
import ProtectedRoute from "@/components/ProtectedRoute";
const Home = lazy(() => import("@/pages/Home"));
const About = lazy(() => import("@/pages/About"));
const Login = lazy(() => import("@/pages/Login"));
const Register = lazy(() => import("@/pages/Register"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Books = lazy(() => import("@/pages/Books"));
const MemberDashboard = lazy(() => import("@/pages/MemberDashboard"));
const Users = lazy(() => import("@/pages/Users"));
const Profile = lazy(() => import("@/pages/Profile"));
const UserDetails = lazy(() => import("@/pages/UserDetails"));
const Borrow = lazy(() => import("@/pages/Borrow"));
const Analytics = lazy(() => import("@/pages/Analytics"));
const NotFound = lazy(() => import("@/pages/NotFound"));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/50 rounded-full animate-spin"></div>
        <div className="absolute inset-1 bg-background rounded-full"></div>
      </div>
      <p className="text-muted-foreground text-sm font-medium animate-pulse">Loading...</p>
    </div>
  </div>
)

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute requiredRole="librarian, admin">
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/member-dashboard"
                  element={
                    <ProtectedRoute requiredRole="member">
                      <MemberDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/books"
                  element={
                    <ProtectedRoute>
                      <Books />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/users"
                  element={
                    <ProtectedRoute requiredRole="librarian">
                      <Users />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/users/:id"
                  element={
                    <ProtectedRoute requiredRole="librarian, admin">
                      <UserDetails />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/books/:id"
                  element={
                    <ProtectedRoute>
                      <Books />
                    </ProtectedRoute>
                  }
                />
                <Route 
                  path="/borrow" 
                  element={
                    <ProtectedRoute requiredRole="librarian">
                      <Borrow />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/analytics" 
                  element={
                    <ProtectedRoute requiredRole="librarian, admin">
                      <Analytics />
                    </ProtectedRoute>
                  } 
                />
                <Route path="*" element={<NotFound />} />

              </Routes>
            </Suspense>
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
