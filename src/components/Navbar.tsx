import { Button } from './ui/button'
import { GraduationCap, User } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

const Navbar = () => {
    const { currentUser, logout } = useAuth();

    if (!currentUser) {
    return null;
  }

  return (
    <nav className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{currentUser.role === 'student' ? 'Student' : 'Admin'} Dashboard</h1>
            <div className="flex items-center gap-2">
              {currentUser.role === 'student'?<User size={16}/> : <GraduationCap size={16}/>}
              <p className="text-sm text-muted-foreground">{currentUser.name}</p>
            </div>
          </div>
          <Button onClick={logout} variant="outline" className='rounded-sm'>
            Logout
          </Button>
        </div>
      </nav>
  )
}

export default Navbar