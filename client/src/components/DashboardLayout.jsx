import Navbar from './Navbar'
import BackgroundEffects from './BackgroundEffects'

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen relative">
      <BackgroundEffects />
      <Navbar variant="dashboard" />
      <main className="relative z-10 pt-24 pb-12 px-4 max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  )
}
