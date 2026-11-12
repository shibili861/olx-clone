import React, { useEffect, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase/config'; // You will create this next
import { AuthContext } from './store/Context';

// Placeholder Pages (You will create these folders/files next)
import Home from './Pages/Home';
import Login from './Pages/Login';
import Signup from './Pages/Signup';
import Create from './Pages/Create'; // Sell Product
import ViewPost from './Pages/ViewPost'; // Product Details
import './App.css';

function App() {
  const { user, setUser } = useContext(AuthContext);

  useEffect(() => {
    // Listen for Firebase login/logout
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, [setUser]);

  // Protected Route Wrapper
  const ProtectedRoute = ({ children }) => {
    if (!user) {
      return <Navigate to="/login" />;
    }
    return children;
  };

  return (
    <div>
      <Router>
       <Routes>
          {/* Public Routes (Visible to everyone) */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected Routes (Requires Authentication) */}
          <Route 
            path="/create" 
            element={
              <ProtectedRoute>
                <Create />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/view/:id" 
            element={
              <ProtectedRoute>
                <ViewPost />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </div>
  );
}

export default App;