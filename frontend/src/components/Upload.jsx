import { useState } from 'react'
import axios from 'axios'
import { useStore } from '../store/store'

export default function Upload({ roomCode, api, onUpload }) {
  const { darkMode } = useStore()
  const [file, setFile] = useState(null)
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file || !username) return

    setLoading(true)
    setSuccess(null)
    const formData = new FormData()
    formData.append('username', username)
    formData.append('file', file)

    try {
      const res = await axios.post(`${api}/rooms/${roomCode}/import`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      onUpload(res.data.movies || [])
      setSuccess(res.data.message || '¡Watchlist subida correctamente!')
      setTimeout(() => setSuccess(null), 5000)
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || err.message))
    } finally {
      setLoading(false)
      setFile(null)
      setUsername('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className={`rounded-xl border p-6 space-y-4 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-[#F1E8D9]/70 border-[#D8C3A5] shadow-sm'}`}>
      <div className="flex items-center gap-2 mb-2">
        <h3 className={`text-xl font-bold ${darkMode ? 'text-emerald-400' : 'text-[#6F4E37]'}`}>📥 Importar Letterboxd</h3>
        <span className={`text-xs px-2 py-1 rounded ${darkMode ? 'bg-slate-800 text-slate-400' : 'bg-[#EDE0D4] text-[#6F4E37]'}`}>ZIP exportado de Letterboxd</span>
      </div>
      
      <div className="grid sm:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Tu nombre o apodo"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className={`px-4 py-3 rounded-xl border focus:outline-none ${darkMode ? 'bg-slate-950 border-slate-700 text-slate-100 focus:border-emerald-500' : 'bg-[#EDE0D4]/60 border-[#D8C3A5] text-[#3E2C23] focus:border-[#A47148]'}`}
          required
        />
        <label className={`flex items-center gap-3 px-4 py-3 rounded-xl border border-dashed cursor-pointer transition ${darkMode ? 'bg-slate-950 border-slate-700 hover:border-emerald-500' : 'bg-[#EDE0D4]/60 border-[#D8C3A5] hover:border-[#A47148]'}`}>
          <span className="text-2xl">📁</span>
          <span className={`text-sm truncate ${darkMode ? 'text-slate-400' : 'text-[#6F4E37]'}`}>
            {file ? file.name : 'Seleccionar archivo .zip'}
          </span>
          <input
            type="file"
            accept=".zip"
            onChange={(e) => setFile(e.target.files[0])}
            className="hidden"
            required
          />
        </label>
      </div>
      
      <button
        type="submit"
        disabled={loading || !file || !username}
        className={`w-full py-3 rounded-xl font-bold transition text-white ${darkMode ? 'bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500' : 'bg-[#6F4E37] hover:bg-[#5A3D29] disabled:bg-[#EDE0D4] disabled:text-[#C9A27E]'}`}
      >
        {loading ? '⏳ Importando y buscando en TMDB...' : '📤 Subir watchlist'}
      </button>

      {success && (
        <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium border animate-[fadeIn_0.2s_ease-out] ${darkMode ? 'bg-emerald-900/30 border-emerald-800 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
          <span>✅</span>
          <span>{success}</span>
        </div>
      )}
      
      <p className={`text-xs ${darkMode ? 'text-slate-500' : 'text-[#A47148]'}`}>
        💡 Tip: Si ya subiste antes, usá el mismo nombre para actualizar tu lista.
      </p>
    </form>
  )
}