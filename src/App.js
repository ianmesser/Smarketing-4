import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import RetailerDashboard from "./RetailerDashboard";
import VendorDashboard from "./VendorDashboard";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white text-gray-900 p-4">
        {/* Navigation Links */}
        <nav className="mb-6 flex gap-4">
          <Link to="/retailer" className="text-blue-600 underline">Retailer Dashboard</Link>
          <Link to="/vendor" className="text-blue-600 underline">Vendor Dashboard</Link>
        </nav>

        {/* Page Routes */}
        <Routes>
          <Route path="/retailer" element={<RetailerDashboard />} />
          <Route path="/vendor" element={<VendorDashboard />} />
          {/* Default fallback: redirect to Retailer Dashboard */}
          <Route path="*" element={<RetailerDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

