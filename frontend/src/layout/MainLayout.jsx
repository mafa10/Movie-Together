import { Outlet, Link, useLocation } from 'react-router-dom'
import { useStore } from '../store/store'

export default function MainLayout() {
  const { currentRoom, darkMode, toggleDarkMode } = useStore()
  const location = useLocation()
  const isHome = location.pathname === '/'

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-[#FBF7F0] text-[#3E2C23]'}`}>
      <header className={`border-b backdrop-blur sticky top-0 z-50 ${darkMode ? 'border-slate-800 bg-slate-900/50' : 'border-[#D8C3A5] bg-[#F1E8D9]/70'}`}>
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className={`text-2xl font-bold transition ${darkMode ? 'text-emerald-400 hover:text-emerald-300' : 'text-[#3E2C23] hover:text-[#6F4E37]'}`}>
            🎬 Movie Together
          </Link>
          
          <div className="flex items-center gap-4">
            {currentRoom && (
              <Link 
                to={`/sala/${currentRoom}`}
                className={`text-sm px-3 py-1 rounded-lg font-mono ${darkMode ? 'bg-slate-800 text-emerald-400' : 'bg-[#F1E8D9] text-[#6F4E37] border border-[#D8C3A5]'}`}
              >
                Sala: {currentRoom}
              </Link>
            )}
            
            <button 
              onClick={toggleDarkMode}
              className="text-xl hover:scale-110 transition"
              title={darkMode ? 'Modo claro' : 'Modo oscuro'}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <Outlet />
      </main>
    </div>
  )
}