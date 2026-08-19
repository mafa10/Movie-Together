import { Link } from 'react-router-dom'
import { useStore } from '../store/store'

export default function TutorialPage() {
  const { darkMode } = useStore()

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <Link to="/" className={darkMode ? 'text-emerald-400 hover:text-emerald-300' : 'text-[#6F4E37] hover:text-[#3E2C23]'}>
        ← Volver al inicio
      </Link>
      
      <h2 className="text-3xl font-bold">📥 Cómo exportar tu watchlist</h2>
      
      <div className={`rounded-xl p-6 border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-[#F1E8D9]/70 border-[#D8C3A5] shadow-sm'}`}>
        <h3 className={`text-xl font-bold mb-3 ${darkMode ? 'text-emerald-400' : 'text-[#6F4E37]'}`}>Desde PC</h3>
        <ol className={`space-y-2 list-decimal list-inside ${darkMode ? 'text-slate-300' : 'text-[#3E2C23]'}`}>
          <li>Andá a <a href="https://letterboxd.com" target="_blank" className="text-emerald-400 underline">letterboxd.com</a> e inicia sesión</li>
          <li>Click en tu foto o nombre → <strong>Settings</strong></li>
          <li>Solapa <strong>DATA</strong> → <strong>Export your data</strong></li>
          <li>Descargá el <code>.zip</code></li>
          <li>Crea una sala y subí el archivo <code>.zip</code></li>
        </ol>
      </div>

      <div className={`rounded-xl p-6 border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-[#F1E8D9]/70 border-[#D8C3A5] shadow-sm'}`}>
        <h3 className={`text-xl font-bold mb-3 ${darkMode ? 'text-emerald-400' : 'text-[#6F4E37]'}`}>Desde Celular</h3>
        <ol className={`space-y-2 list-decimal list-inside ${darkMode ? 'text-slate-300' : 'text-[#3E2C23]'}`}>
          <li>Abrí la app de Letterboxd en tu dispostivo Android o IOS</li>
          <li>Andá a tu perfil</li>
          <li>Apreta en el ícono de engranaje ⚙️, arriba a la izquierda, al lado de tu nombre de usuario</li>
          <li>Bajá hasta encontrar <strong>Advanced Settings</strong></li>
          <li>Bajá hasta abajo de todo y hace click en <strong>Export your data</strong></li>
          <li>Descargá el <code>.zip</code></li>
        </ol>
      </div>
    </div>
  )
}