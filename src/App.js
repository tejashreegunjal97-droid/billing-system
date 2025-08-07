// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

import InvoiceForm from "./InvoiceForm";
import InvoiceList from "./InvoiceList";
import Dashboard from "./Dashboard"; // create this file next

function App() {
  return (
    <Router>
      <div style={{ padding: "20px", fontFamily: "Segoe UI, sans-serif" }}>
        {/* Navigation Menu */}
        <nav style={{ marginBottom: "30px" }}>
          <Link to="/" style={linkStyle}>🧾 Create Invoice</Link>
          <Link to="/invoices" style={linkStyle}>📄 View Invoices</Link>
          <Link to="/dashboard" style={linkStyle}>⚙️ Dashboard</Link>
        </nav>

        {/* Page Routes */}
        <Routes>
          <Route path="/" element={<InvoiceForm />} />
          <Route path="/invoices" element={<InvoiceList />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

const linkStyle = {
  marginRight: "20px",
  textDecoration: "none",
  color: "#007bff",
  fontSize: "16px",
  fontWeight: "500",
};

export default App;
