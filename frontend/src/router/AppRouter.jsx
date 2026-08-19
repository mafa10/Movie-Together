import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import MainLayout from '../layout/MainLayout'
import HomePage from '../pages/HomePage'
import RoomPage from '../pages/RoomPage'
import TutorialPage from '../pages/TutorialPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'tutorial', element: <TutorialPage /> },
      { path: 'sala/:code', element: <RoomPage /> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
])

export default function AppRouter() {
  return <RouterProvider router={router} />
}