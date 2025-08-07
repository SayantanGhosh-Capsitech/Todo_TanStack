import './App.css'
import Login from './components/Login'
import Register from './components/Register'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './components/Home'
import ProtectRoutes from './components/ProtectRoutes'
import { AuthProvider } from './contex/AuthContex'
import PublicRoute from './components/PublicRoutes'
import Homepage from './components/Homepage'
function App() {

  return (
    <>    
    <Router>
    <AuthProvider>
    
      <Routes>
        <Route element={<PublicRoute/>}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        </Route>
         <Route element={<ProtectRoutes/>}>
          <Route path="/home" element={<Homepage/>} />
          </Route>
      </Routes>
    
    </AuthProvider>
    </Router>
    </>
  ) 
}

export default App
