// src/RetailerDashboard.js
import React from "react";

const RetailerDashboard = () => {
  const adSlots = [
    {
      id: 1,
      name: "Homepage 2-Up",
      price: "$10,000",
      period: "1 week",
      availability: "May 28 – June 3",
    },
    {
      id: 2,
      name: "Video Hero",
      price: "$15,000",
      period: "1 week",
      availability: "May 28 – June 3",
    },
  ];

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Retailer Dashboard</h1>
      <button className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
        + Add New Ad Slot
      </button>

      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-3 border-b">Slot Name</th>
            <th className="p-3 border-b">Price</th>
            <th className="p-3 border-b">Period</th>
            <th className="p-3 border-b">Availability</th>
            <th className="p-3 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {adSlots.map((slot) => (
            <tr key={slot.id} className="hover:bg-gray-50">
              <td className="p-3 border-b">{slot.name}</td>
              <td className="p-3 border-b">{slot.price}</td>
              <td className="p-3 border-b">{slot.period}</td>
              <td className="p-3 border-b">{slot.availability}</td>
              <td className="p-3 border-b space-x-2">
                <button className="text-blue-600 hover:underline">Edit</button>
                <button className="text-red-500 hover:underline">Archive</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RetailerDashboard;
