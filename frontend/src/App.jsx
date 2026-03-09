import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Events from './pages/Events';
import FoodPreOrder from './pages/FoodPreOrder';
import ParkingReservation from './pages/ParkingReservation';
import Feedback from './pages/Feedback';

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* Home has its own Navbar + Footer built-in */}
                    <Route path="/" element={<Home />} />

                    {/* Other pages */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/events" element={<Events />} />
                    <Route path="/food-preorder" element={<FoodPreOrder />} />
                    <Route path="/parking" element={<ParkingReservation />} />
                    <Route path="/feedback" element={<Feedback />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
