import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import MovieList from './components/MovieList';
import MovieDetail from './components/MovieDetail';
import LoginPage from './components/LoginPage';
import './App.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

const App = () => {
    const [isAuthenticated, setIsAuthenticated] = React.useState(false);

    React.useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem('token'); 
            setIsAuthenticated(!!token);
        };

        checkAuth(); // initial check 
        
        window.addEventListener('storage', checkAuth); // listens for storage changes (if token is updated in another tab)
        return () => window.removeEventListener('storage', checkAuth); //removes (cleanup) the event listener when the component unmounts to prevent memory leaks
    }, []);

    return (
        <Router>
            <div>
                <Routes>
                    <Route
                        path="/"
                        element={isAuthenticated ? <Navigate to="/movies" /> : <LoginPage setIsAuthenticated={setIsAuthenticated} />}
                    />
                    <Route
                        path="/movies"
                        element={isAuthenticated ? <MovieList /> : <Navigate to="/" />}
                    />
                    <Route
                        path="/movies/:id"
                        element={isAuthenticated ? <MovieDetail /> : <Navigate to="/" />}
                    />
                    <Route
                        path="/login"
                        element={isAuthenticated ? <Navigate to="/movies" /> : <LoginPage setIsAuthenticated={setIsAuthenticated} />}
                    />
                </Routes>
            </div>
        </Router>
    );
};

export default App;
