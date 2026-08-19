import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStore } from '../store/store'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

export default function HomePage() {
  const navigate = useNavigate()
  const { setCurrentRoom, setCurrentUser, darkMode } = useStore()
  const [roomCode, setRoomCode] = useState('')
  const [error, setError] = useState('')

  const createRoom = async () => {
    try {
      setError('')
      const res = await axios.post(`${API}/rooms`)
      setCurrentRoom(res.data.code)
      navigate(`/sala/${res.data.code}`)
    } catch (err) {
      setError('Error al crear la sala')
    }
  }

  const joinRoom = async () => {
    if (!roomCode.trim()) {
      setError('⚠️ Ingresá un código de sala')
      return
    }
    try {
      setError('')
      await axios.get(`${API}/rooms/${roomCode}/intersection`)
      setCurrentRoom(roomCode)
      navigate(`/sala/${roomCode}`)
    } catch (err) {
      setError('❌ La sala no existe o está vacía')
    }
  }

  return (
    <div className="space-y-10">
      {/* Hero */}
      <div className="text-center space-y-4">
        <h1 className={`text-5xl font-extrabold leading-[1.25] pb-1 ${darkMode ? 'text-emerald-400' : 'text-[#3E2C23]'}`}>
          ¿No saben qué película ver?
        </h1>
        <p className={darkMode ? 'text-xl text-slate-400 max-w-2xl mx-auto' : 'text-xl text-[#6F4E37] max-w-2xl mx-auto'}>
          Compará watchlists de Letterboxd con tus amigos y dejá que el azar decida.
        </p>
      </div>

      {/* Acciones */}
      <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
        <button
          onClick={createRoom}
          className={`group rounded-2xl p-8 text-center transition-all hover:scale-[1.02] text-white ${darkMode ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-[#6F4E37] hover:bg-[#5A3D29]'}`}
        >
          <div className="text-4xl mb-3">➕</div>
          <div className="text-2xl font-bold">Crear sala</div>
          <div className={darkMode ? 'text-emerald-100 mt-2' : 'text-[#EDE0D4] mt-2'}>Empezá una nueva sesión</div>
        </button>

        <div className={`rounded-2xl border p-8 overflow-hidden ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-[#F1E8D9]/70 border-[#D8C3A5] shadow-sm'}`}>
          <div className="text-4xl mb-3 text-center">🔗</div>
          <div className={`text-2xl font-bold text-center mb-4 ${darkMode ? '' : 'text-[#3E2C23]'}`}>Unirse a sala</div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Ej: A3B9K7"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && joinRoom()}
              className={`flex-1 min-w-0 px-4 py-3 rounded-xl border uppercase tracking-widest ${darkMode ? 'bg-slate-950 border-slate-700 text-slate-100' : 'bg-[#EDE0D4]/60 border-[#D8C3A5] text-[#3E2C23]'}`}
            />
            <button
              onClick={joinRoom}
              className={`shrink-0 px-6 py-3 rounded-xl font-bold transition ${darkMode ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-[#A47148] hover:bg-[#8B5D38] text-white'}`}
            >
              Entrar
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className={`max-w-2xl mx-auto p-4 rounded-xl text-center border ${darkMode ? 'bg-red-900/30 border-red-800 text-red-300' : 'bg-red-50 border-red-200 text-red-600'}`}>
          {error}
        </div>
      )}

      {/* Info */}
      <div className={`max-w-2xl mx-auto space-y-4 text-center ${darkMode ? 'text-slate-500' : 'text-[#A47148]'}`}>
        <p>💡 Necesitás que <strong>2 o más personas</strong> carguen su watchlist.</p>
        <Link 
          to="/tutorial"
          className={darkMode ? 'text-emerald-400 hover:text-emerald-300 underline underline-offset-4' : 'text-[#A47148] hover:text-[#6F4E37] underline underline-offset-4'}
        >
          ¿Cómo exporto mi watchlist de Letterboxd?
        </Link>
      </div>
    </div>
  )
}