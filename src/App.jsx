import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'

import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'

import AdminLayout from './pages/admin/AdminLayout'
import Overview from './pages/admin/Overview'
import Courts from './pages/admin/Courts'
import AdminBookings from './pages/admin/Bookings'
import Members from './pages/admin/Members'
import Announcements from './pages/admin/Announcements'

import CoachLayout from './pages/coach/CoachLayout'
import CoachSchedule from './pages/coach/Schedule'
import CoachPlayers from './pages/coach/Players'

import PlayerLayout from './pages/player/PlayerLayout'
import BookCourt from './pages/player/BookCourt'
import MyBookings from './pages/player/MyBookings'
import Partners from './pages/player/Partners'
import PlayerAnnouncements from './pages/player/Announcements'
import MySchedule from './pages/player/MySchedule'
import Profile from './pages/player/Profile'

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Admin */}
      <Route path="/admin" element={
        <ProtectedRoute roles={['admin']}><AdminLayout /></ProtectedRoute>
      }>
        <Route index element={<Overview />} />
        <Route path="courts" element={<Courts />} />
        <Route path="bookings" element={<AdminBookings />} />
        <Route path="members" element={<Members />} />
        <Route path="announcements" element={<Announcements />} />
      </Route>

      {/* Coach */}
      <Route path="/coach" element={
        <ProtectedRoute roles={['coach']}><CoachLayout /></ProtectedRoute>
      }>
        <Route index element={<CoachSchedule />} />
        <Route path="players" element={<CoachPlayers />} />
      </Route>

      {/* Player */}
      <Route path="/player" element={
        <ProtectedRoute roles={['player']}><PlayerLayout /></ProtectedRoute>
      }>
        <Route index element={<BookCourt />} />
        <Route path="bookings" element={<MyBookings />} />
        <Route path="schedule" element={<MySchedule />} />
        <Route path="announcements" element={<PlayerAnnouncements />} />
        <Route path="partners" element={<Partners />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
