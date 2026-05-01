import { BrowserRouter, Routes, Route } from 'react-router-dom'

function Home() {
  return <div className="p-4">Home - Placeholder</div>
}

function Login() {
  return <div className="p-4">Login - Placeholder</div>
}

function Register() {
  return <div className="p-4">Register - Placeholder</div>
}

function Dashboard() {
  return <div className="p-4">Dashboard - Placeholder</div>
}

function RoomList() {
  return <div className="p-4">Room List - Placeholder</div>
}

function Room() {
  return <div className="p-4">Room - Placeholder</div>
}

function CreateRoom() {
  return <div className="p-4">Create Room - Placeholder</div>
}

function Admin() {
  return <div className="p-4">Admin - Placeholder</div>
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/rooms" element={<RoomList />} />
        <Route path="/room/:id" element={<Room />} />
        <Route path="/rooms/create" element={<CreateRoom />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App