import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import RetailerDashboard from "./RetailerDashboard";
import VendorPlacements from "./vendordashboard"; // Update path if needed
import VendorCart from "./VendorCart"; // Make sure this matches the file name and path
import MyCampaigns from "./MyCampaigns"; // ⬅️ Add this at the top with other imports

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white text-gray-900 p-4">
        <h1 className="text-2xl font-bold mb-4">Ad Placement Marketplace</h1>

        {/* 🧭 Navigation */}
        <div className="flex gap-4 mb-4">
          <Link to="/" className="text-blue-600 underline">Retailer Dashboard</Link>
          <Link to="/vendor" className="text-blue-600 underline">Vendor Dashboard</Link>
          <Link to="/cart" className="text-blue-600 underline">Vendor Cart</Link>
          <Link to="/my-campaigns" className="text-blue-600 underline">My Campaigns</Link>
        </div>

        {/* 🛣️ Routes */}
        <Routes>
          <Route path="/" element={<RetailerDashboard />} />
          <Route path="/vendor" element={<VendorPlacements />} />
          <Route path="/cart" element={<VendorCart />} />
          <Route path="/my-campaigns" element={<MyCampaigns />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
