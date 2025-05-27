import React, { useState } from "react";

const RetailerDashboard = () => {
  const [adSlots, setAdSlots] = useState([
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
  ]);

  const [showModal, setShowModal] = useState(false);
  const [newSlot, setNewSlot] = useState({
    name: "",
    price: "",
    period: "1 week",
    availability: "",
  });

  const handleAddSlot = () => {
    setAdSlots([
      ...adSlots,
      {
        ...newSlot,
        id: adSlots.length + 1,
      },
    ]);
    setShowModal(false);
    setNewSlot({ name: "", price: "", period: "1 week", availability: "" });
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Retailer Dashboard</h1>

      <button
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        onClick={() => setShowModal(true)}
      >
        + Add New Ad Slot
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Add New Ad Slot</h2>

            <label className="block mb-2">
              Slot Name
              <input
                type="text"
                className="w-full border p-2 rounded mt-1"
                value={newSlot.name}
                onChange={(e) =>
                  setNewSlot({ ...newSlot, name: e.target.value })
                }
              />
            </label>

            <label className="block mb-2">
              Price
              <input
                type="text"
                className="w-full border p-2 rounded mt-1"
                value={newSlot.price}
                onChange={(e) =>
                  setNewSlot({ ...newSlot, price: e.target.value })
                }
              />
            </label>

            <label className="block mb-2">
              Availability Dates
              <input
                type="text"
                className="w-full border p-2 rounded mt-1"
                placeholder="e.g. June 9 – June 15"
                value={newSlot.availability}
                onChange={(e) =>
                  setNewSlot({ ...newSlot, availa
