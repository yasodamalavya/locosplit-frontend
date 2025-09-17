import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App.jsx';
import AddExpense from './AddExpense.jsx';
import GroupDetail from './GroupDetail.jsx'; // <-- Import the new component
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/add-expense" element={<AddExpense />} />
        <Route path="/groups/:groupId" element={<GroupDetail />} /> {/* <-- Add this dynamic route */}
      </Routes>
    </Router>
  </React.StrictMode>,
);