import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { 
  Home,
  Info,
  LayoutDashboard,
  Users,
  Bookmark,
  BarChart3,
  User,
  BookOpen
} from 'lucide-react'

const Navbar = ({ variant = 'desktop', onItemClick }) => {
  const { user } = useAuth()
  const location = useLocation()

  const baseNavItems = [
    { 
      path: '/', 
      label: 'Home', 
      icon: <Home className="h-4 w-4" />,
      roles: ['all'] 
    },
    { 
      path: '/about', 
      label: 'About', 
      icon: <Info className="h-4 w-4" />,
      roles: ['all']
    },
  ]

  const roleBasedNavItems = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="h-4 w-4" />,
      roles: ['admin', 'librarian',]
    },
    {
        path: '/member-dashboard',
        label: 'Member Dashboard',
        icon: <LayoutDashboard className="h-4 w-4" />,
        roles: ['member']
    },
    {
      path: '/books',
      label: 'Books',
      icon: <BookOpen className="h-4 w-4" />,
      roles: ['admin', 'librarian', 'member']
    },
    {
      path: '/users',
      label: 'Users',
      icon: <Users className="h-4 w-4" />,
      roles: ['admin', 'librarian']
    },
    {
      path: '/borrow',
      label: 'Borrow',
      icon: <Bookmark className="h-4 w-4" />,
      roles: ['admin', 'librarian']
    },
    {
      path: '/analytics',
      label: 'Analytics',
      icon: <BarChart3 className="h-4 w-4" />,
      roles: ['admin', 'librarian']
    },
    {
      path: '/profile',
      label: 'Profile',
      icon: <User className="h-4 w-4" />,
      roles: ['admin', 'librarian', 'member']
    },
  ]

  const getNavItems = () => {
    const items = [...baseNavItems]
    
    if (user) {
      roleBasedNavItems.forEach(item => {
        if (item.roles.includes('all') || item.roles.includes(user.role)) {
          items.push(item)
        }
      })
    }
    
    return items
  }

  const navItems = getNavItems()

  const isActivePath = (path) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  if (variant === 'mobile') {
    return (
      <nav className="flex flex-col space-y-2">
        <ul className="flex flex-col space-y-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-primary-foreground/10 transition-all duration-200 ${
                  isActivePath(item.path)
                    ? 'bg-primary-foreground/15 text-primary-foreground font-semibold'
                    : 'text-primary-foreground/80 hover:text-primary-foreground'
                }`}
                onClick={onItemClick}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    )
  }

  return (
    <nav className="hidden md:flex items-center space-x-1">
      <ul className="flex items-center space-x-1">
        {navItems.map((item) => (
          <li key={item.path}>
            <Link
              to={item.path}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-primary-foreground/10 transition-all duration-200 ${
                isActivePath(item.path)
                  ? 'bg-primary-foreground/15 text-primary-foreground font-semibold'
                  : 'text-primary-foreground/80 hover:text-primary-foreground'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default Navbar