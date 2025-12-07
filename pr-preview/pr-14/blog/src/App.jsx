import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Post from './pages/Post';
import AdminDashboard from './pages/AdminDashboard';
import AdminEditor from './pages/AdminEditor';
import { HelmetProvider } from 'react-helmet-async';

function App() {
  return (
    <HelmetProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/post/:slug" element={<Layout><Post /></Layout>} />

          {/* Admin Routes - In a real app, protect these! */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/edit/:filename?" element={<AdminEditor />} />
        </Routes>
      </Router>
    </HelmetProvider>
  );
}

export default App;
