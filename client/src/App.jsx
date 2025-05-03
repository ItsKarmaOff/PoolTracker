/**
 * ┌────────────────────────────────────────────────────────────────────────────
 * │ @author                    Christophe Vandevoir
 * ├────────────────────────────────────────────────────────────────────────────
 * │ @file           App.jsx
 * │ @path          client/src/App.jsx
 * │ @description   App implementation
 * │ @version       1.0.0
 * │
 * │ @email         christophe.vandevoir@epitech.eu
 * │ @date          2025-04-30
 * ├────────────────────────────────────────────────────────────────────────────
 * │ @copyright     (c) 2025 Christophe Vandevoir
 * └────────────────────────────────────────────────────────────────────────────
 */

import React from 'react';
import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import AppRoutes from './Routes';
import './App.css';

// Component to conditionally render the Header
const HeaderHandler = () => {
    const location = useLocation();
    const isDashboardPage = location.pathname === '/dashboard';

    return !isDashboardPage ? <Header /> : null;
};

function App() {
    return (
        <Router>
            <AuthProvider>
                <div className="app">
                    <HeaderHandler />
                    <main className="main-content">
                        <AppRoutes />
                    </main>
                    <ToastContainer
                        position="bottom-right"
                        autoClose={5000}
                        hideProgressBar={false}
                        newestOnTop
                        closeOnClick
                        rtl={false}
                        pauseOnFocusLoss
                        draggable
                        pauseOnHover
                    />
                </div>
            </AuthProvider>
        </Router>
    );
}

export default App;
