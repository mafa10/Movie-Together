import { useState, useEffect } from 'react'
import axios from 'axios'
import Upload from './Upload'
import { useStore } from '../store/store'

const MODES = [
  { id: 'random', label: '🎲 Al azar' },
  { id: 'top_rated', label: '⭐ Mejor puntuada' },
  { id: 'genre', label: '🎭 Por género' },
  { id: 'most_pending', label: '🙌 Pendiente por más personas' },
  { id: 'manual', label: '✅ Elegí vos' },
]

export default function RoomView({ roomCode, api, onBack }) {
  const { darkMode } = useStore()
  const [allMovies, setAllMovies] = useState([]) // todas las cargadas, cada una con pendingCount
  const [participants, setParticipants] = useState([])
  const [scope, setScope] = useState('all') // 'all' | 'common'
  const [mode, setMode] = useState('random')
  const [selectedGenre, setSelectedGenre] = useState('')
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [randomMovie, setRandomMovie] = useState(null)
  const [spinning, setSpinning] = useState(false)

  const fetchRoomMovies = async () => {
    try {
      const res = await axios.get(`${api}/rooms/${roomCode}/movies`)
      setAllMovies(res.data.movies || [])
    } catch (err) {
      console.error(err)
    }
  }

  const fetchParticipants = async () => {
    try {
      const res = await axios.get(`${api}/rooms/${roomCode}/participants`)
      setParticipants(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const refreshAll = () => {
    fetchRoomMovies()
    fetchParticipants()
  }

  const handleUploadSuccess = () => {
    refreshAll()
  }

  useEffect(() => {
    refreshAll()
  }, [roomCode])

  const totalParticipants = participants.length
  const commonMovies = totalParticipants > 0
    ? allMovies.filter(m => m.pendingCount === totalParticipants)
    : []
  const scopeMovies = scope === 'common' ? commonMovies : allMovies

  const availableGenres = [...new Set(
    scopeMovies.flatMap(m => (m.genres || '').split(',').map(g => g.trim()).filter(Boolean))
  )].sort()

  const getCandidates = () => {
    let pool = scopeMovies
    if (mode === 'genre') {
      if (!selectedGenre) return []
      pool = pool.filter(m => (m.genres || '').split(',').map(g => g.trim()).includes(selectedGenre))
    }
    if (mode === 'manual') {
      pool = pool.filter(m => selectedIds.has(m.tmdbId))
    }
    return pool
  }

  const candidates = getCandidates()
  const canPick = candidates.length > 0

  const toggleSelected = (tmdbId) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(tmdbId)) next.delete(tmdbId)
      else next.add(tmdbId)
      return next
    })
  }

  const pickMovie = () => {
    if (!canPick) return
    setSpinning(true)
    setRandomMovie(null)

    let count = 0
    const interval = setInterval(() => {
      setRandomMovie(candidates[Math.floor(Math.random() * candidates.length)])
      count++
      if (count > 15) {
        clearInterval(interval)
        let winner
        if (mode === 'top_rated') {
          winner = [...candidates].sort((a, b) => (b.voteAverage || 0) - (a.voteAverage || 0))[0]
        } else if (mode === 'most_pending') {
          winner = [...candidates].sort((a, b) => b.pendingCount - a.pendingCount)[0]
        } else {
          winner = candidates[Math.floor(Math.random() * candidates.length)]
        }
        setRandomMovie(winner)
        setSpinning(false)
      }
    }, 120)
  }

  const pickButtonLabel = () => {
    if (spinning) return '🎲 Sorteando...'
    if (mode === 'genre' && !selectedGenre) return 'Elegí un género primero'
    if (mode === 'manual' && selectedIds.size === 0) return 'Seleccioná al menos una película'
    if (!canPick) return 'No hay películas para este filtro'
    if (mode === 'top_rated') return '⭐ Elegir la mejor puntuada'
    if (mode === 'most_pending') return '🙌 Elegir la más esperada'
    if (mode === 'genre') return `🎭 Elegir de ${selectedGenre}`
    if (mode === 'manual') return `✅ Elegir entre las ${selectedIds.size} seleccionadas`
    return '🎲 Elegir al azar'
  }

  return (
    <div className="space-y-8">
      {/* Info de la sala */}
      <div className={`flex items-center justify-between rounded-xl p-4 border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-[#F1E8D9]/70 border-[#D8C3A5] shadow-sm'}`}>
        <div>
          <div className={darkMode ? 'text-sm text-slate-400' : 'text-sm text-[#A47148]'}>Código de sala</div>
          <div className={`text-2xl font-mono font-bold tracking-widest ${darkMode ? 'text-emerald-400' : 'text-[#6F4E37]'}`}>{roomCode}</div>
        </div>
        <div className="text-right">
          <div className={darkMode ? 'text-sm text-slate-400' : 'text-sm text-[#A47148]'}>Películas en común (100%)</div>
          <div className="text-2xl font-bold">{commonMovies.length}</div>
          <div className={`text-xs ${darkMode ? 'text-slate-500' : 'text-[#A47148]'}`}>{allMovies.length} cargadas en total</div>
        </div>
      </div>

      <Upload roomCode={roomCode} api={api} onUpload={handleUploadSuccess} />

      {/* Participantes */}
      {participants.length > 0 && (
        <div className={`rounded-xl p-4 border space-y-4 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-[#F1E8D9]/70 border-[#D8C3A5] shadow-sm'}`}>
          <div>
            <div className={`text-sm mb-3 ${darkMode ? 'text-slate-400' : 'text-[#A47148]'}`}>
              👥 {participants.length} {participants.length === 1 ? 'persona cargó' : 'personas cargaron'} su watchlist
            </div>
            <div className="flex flex-wrap gap-2">
              {participants.map(p => (
                <span
                  key={p.username}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${darkMode ? 'bg-slate-800 text-emerald-400' : 'bg-[#EDE0D4] text-[#6F4E37]'}`}
                >
                  🎬 {p.username}
                  <span className={darkMode ? 'text-slate-500' : 'text-[#A47148]'}>· {p.movieCount}</span>
                </span>
              ))}
            </div>
          </div>

          <button
            onClick={refreshAll}
            className={`w-full py-2.5 border rounded-xl font-bold text-sm transition ${darkMode ? 'bg-slate-800 hover:bg-slate-700 border-slate-700' : 'bg-white/60 hover:bg-white border-[#D8C3A5] text-[#3E2C23]'}`}
          >
            🔄 Actualizar
          </button>
        </div>
      )}

      {allMovies.length === 0 ? (
        <div className={`text-center py-12 ${darkMode ? 'text-slate-500' : 'text-[#A47148]'}`}>
          <div className="text-6xl mb-4">🍿</div>
          <p className="text-xl">Todavía no hay películas cargadas</p>
          <p className="mt-2">Subí tu watchlist o esperá a que alguien más lo haga.</p>
        </div>
      ) : (
        <>
          {/* Selector de alcance */}
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-sm mr-1 ${darkMode ? 'text-slate-400' : 'text-[#A47148]'}`}>Elegir entre:</span>
            {[
              { id: 'all', label: `Todas las cargadas (${allMovies.length})` },
              { id: 'common', label: `En común 100% (${commonMovies.length})` },
            ].map(opt => (
              <button
                key={opt.id}
                onClick={() => setScope(opt.id)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition ${
                  scope === opt.id
                    ? (darkMode ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-[#6F4E37] border-[#6F4E37] text-white')
                    : (darkMode ? 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500' : 'bg-white/60 border-[#D8C3A5] text-[#6F4E37] hover:border-[#A47148]')
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Selector de criterio */}
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-sm mr-1 ${darkMode ? 'text-slate-400' : 'text-[#A47148]'}`}>Criterio:</span>
            {MODES.map(m => (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition ${
                  mode === m.id
                    ? (darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-[#EDE0D4] border-[#A47148] text-[#3E2C23]')
                    : (darkMode ? 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500' : 'bg-white/60 border-[#D8C3A5] text-[#6F4E37] hover:border-[#A47148]')
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Dropdown de género */}
          {mode === 'genre' && (
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className={`px-4 py-2 rounded-xl border text-sm ${darkMode ? 'bg-slate-950 border-slate-700 text-slate-100' : 'bg-[#EDE0D4]/60 border-[#D8C3A5] text-[#3E2C23]'}`}
            >
              <option value="">Seleccioná un género...</option>
              {availableGenres.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          )}

          {/* Aviso modo manual */}
          {mode === 'manual' && (
            <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-[#A47148]'}`}>
              👇 Tocá las películas del listado de abajo para incluirlas en el sorteo.
            </p>
          )}

          {/* Botón principal */}
          <div className="text-center space-y-4">
            <button
              onClick={pickMovie}
              disabled={spinning || !canPick}
              className="px-8 py-4 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-black rounded-xl font-bold text-xl transition"
            >
              {pickButtonLabel()}
            </button>
          </div>

          {/* Resultado */}
          {randomMovie && (
            <div className={`rounded-2xl overflow-hidden border-2 border-amber-500/50 ${darkMode ? 'bg-slate-900' : 'bg-[#F1E8D9]/70 shadow-sm'}`}>
              <div className="md:flex">
                <div className="md:w-1/3">
                  <img
                    src={`https://image.tmdb.org/t/p/w500${randomMovie.posterPath}`}
                    alt={randomMovie.title}
                    className="w-full h-96 md:h-full object-cover"
                  />
                </div>
                <div className="p-6 md:w-2/3 space-y-4">
                  <h2 className="text-3xl font-bold">{randomMovie.title}</h2>
                  
                  <div className="flex flex-wrap gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm ${darkMode ? 'bg-slate-800' : 'bg-[#EDE0D4]'}`}>{randomMovie.year}</span>
                    <span className="px-3 py-1 bg-amber-600/20 text-amber-500 rounded-full text-sm">
                      ⭐ {randomMovie.voteAverage?.toFixed(1)}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm ${darkMode ? 'bg-slate-800 text-slate-300' : 'bg-[#EDE0D4] text-[#6F4E37]'}`}>
                      🙌 {randomMovie.pendingCount}/{totalParticipants} la esperan
                    </span>
                    {randomMovie.genres?.split(',').map(g => (
                      <span key={g} className={`px-3 py-1 rounded-full text-sm ${darkMode ? 'bg-slate-800 text-slate-300' : 'bg-[#EDE0D4] text-[#6F4E37]'}`}>
                        {g.trim()}
                      </span>
                    ))}
                  </div>

                  <p className={darkMode ? 'text-slate-300 leading-relaxed' : 'text-[#6F4E37] leading-relaxed'}>{randomMovie.overview}</p>
                  
                  <a 
                    href={randomMovie.letterboxdUri} 
                    target="_blank"
                    className={`inline-block px-4 py-2 text-white rounded-lg text-sm font-bold transition ${darkMode ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-[#A47148] hover:bg-[#8B5D38]'}`}
                  >
                    Ver en Letterboxd →
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Grid de películas del alcance elegido */}
          <div>
            <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-slate-400' : 'text-[#A47148]'}`}>
              {scope === 'common' ? 'Películas en común (100%)' : 'Todas las películas cargadas'} ({scopeMovies.length})
            </h3>
            {scopeMovies.length === 0 ? (
              <p className={darkMode ? 'text-slate-500' : 'text-[#A47148]'}>
                No hay películas que cumplan este filtro. Probá con "Todas las cargadas".
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {scopeMovies.map(m => {
                  const isSelected = selectedIds.has(m.tmdbId)
                  return (
                    <div
                      key={m.tmdbId}
                      onClick={() => mode === 'manual' && toggleSelected(m.tmdbId)}
                      className={`group relative rounded-xl overflow-hidden border transition ${mode === 'manual' ? 'cursor-pointer' : ''} ${
                        isSelected && mode === 'manual'
                          ? (darkMode ? 'border-emerald-500 ring-2 ring-emerald-500/50' : 'border-[#6F4E37] ring-2 ring-[#6F4E37]/40')
                          : (darkMode ? 'bg-slate-900 border-slate-800 hover:border-emerald-500/50' : 'bg-[#F1E8D9]/70 border-[#D8C3A5] shadow-sm hover:border-[#A47148]')
                      }`}
                    >
                      {mode === 'manual' && (
                        <div className={`absolute top-2 right-2 z-10 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          isSelected ? 'bg-emerald-500 text-white' : (darkMode ? 'bg-slate-950/70 text-slate-400' : 'bg-white/80 text-[#A47148]')
                        }`}>
                          {isSelected ? '✓' : ''}
                        </div>
                      )}
                      <div className="aspect-[2/3] overflow-hidden">
                        <img
                          src={`https://image.tmdb.org/t/p/w300${m.posterPath}`}
                          alt={m.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                        />
                      </div>
                      <div className="p-3">
                        <div className="font-bold text-sm truncate" title={m.title}>{m.title}</div>
                        <div className={`text-xs mt-1 ${darkMode ? 'text-slate-500' : 'text-[#A47148]'}`}>
                          {m.year} • ⭐ {m.voteAverage?.toFixed(1)} • 🙌 {m.pendingCount}/{totalParticipants}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}