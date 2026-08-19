import { useParams, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useStore } from '../store/store'
import RoomView from '../components/RoomView'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

export default function RoomPage() {
  const { code } = useParams()
  const navigate = useNavigate()
  const { setCurrentRoom } = useStore()

  useEffect(() => {
    setCurrentRoom(code)
  }, [code, setCurrentRoom])

  return (
    <RoomView 
      roomCode={code} 
      api={API} 
      onBack={() => {
        setCurrentRoom(null)
        navigate('/')
      }} 
    />
  )
}