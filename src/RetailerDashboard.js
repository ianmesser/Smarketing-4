import React, { useState } from "react";

const RetailerDashboard = () => {
  // 🔧 Placement Manager State
  const [placements, setPlacements] = useState([]);
  const [newPlacement, setNewPlacement] = useState({
    name: "",
    format: "Image",
    dimensions: "",
    defaultPrice: "",
    defaultConcurrentSlots: 1,
    schedulingMode: "cadence",
  });

  const handleAddPlacement = () => {
    setPlacements([
      ...placements,
      {
        ...newPlacement,
        id: placements.length + 1,
      },
    ]);
    setNewPlacement({
      name: "",
      format: "Image",
      dimensions: "",
      defaultPrice: "",
      defaultConcurrentSlots: 1,
      schedulingMode: "cadence",
    });
  };

  // 📦 Ad Slots State
  const [adSlots, setAdSlots] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [availabilities, setAvailabilities] = useState([]);
  const [newSlot, setNewSlot] = useState({
    placementId: "",
    availability: "",
    styleGuide: null,
    figmaLink: "",
    totalSlots: 1,
    bookedSlots: 0,
  });

// Retailer's default cadence settings
const retailerCadence = {
  startDate: "2025-05-26", // Date to start generating from
  startDay: "Sunday",      // Optional for now
  periodLength: 7,         // Each period is 7 days
  maxWeeksOut: 5           // Only generate 5 weeks ahead
};

// Function to generate availability blocks
const generateAvailability = (placement, cadence = retailerCadence) => {
  const availability = [];
  const start = new Date(
    placement.cadenceOverride?.enabled
      ? placement.cadenceOverride.startDate
      : cadence.startDate
  );
  const periodLength = placement.cadenceOverride?.enabled
    ? placement.cadenceOverride.periodLength
    : cadence.periodLength;

  for (let i = 0; i < cadence.maxWeeksOut; i++) {
    const periodStart = new Date(start);
    periodStart.setDate(start.getDate() + i * periodLength);

    const periodEnd = new Date(periodStart);
    periodEnd.setDate(periodStart.getDate() + periodLength - 1);

    availability.push({
      placementId: placement.id,
      slotName: placement.name,
      startDate: periodStart.toISOString().split("T")[0],
      endDate: periodEnd.toISOString().split("T")[0],
      totalSlots: placement.defaultConcurrentSlots,
      bookedSlots: 0
    });
  }

  return availability;
};


  const handleSaveSlot = () => {
    const selectedPlacement = placements.find(p => p.id === parseInt(newSlot.placementId));
    if (!selectedPlacement) return;

    const slotData = {
      ...newSlot,
      slotName: selectedPlacement.name,
      price: selectedPlacement.defaultPrice,
      period: "1 week",
    };

    if (editingSlot) {
      setAdSlots((prev) =>
        prev.map((slot) =>
          slot.id === editingSlot.id ? { ...editingSlot, ...slotData } : slot
        )
      );
    } else {
      setAdSlots([
        ...adSlots,
        {
          ...slotData,
          id: adSlots.length + 1,
        },
      ]);
    }

    setShowModal(false);
    setEditingSlot(null);
    setNewSlot({
      placementId: "",
      availability: "",
      styleGuide: null,
      figmaLink: "",
      totalSlots: 1,
      bookedSlots: 0,
    });
  };

  const handleEdit = (slot) => {
    setEditingSlot(slot);
    setNewSlot({
      placementId: placements.find(p => p.name === slot.slotName)?.id || "",
      availability: slot.availability,
      styleGuide: slot.styleGuide,
      figmaLink: slot.figmaLink,
      totalSlots: slot.totalSlots,
      bookedSlots: slot.bookedSlots,
    });
    setShowModal(true);
  };

  const handleArchive = (id) => {
    setAdSlots((prev) => prev.filter((slot) => slot.id !== id));
  };

  return (
    <div className="p-8 space-y-10">
      <h1 className="text-3xl font-bold mb-2">Retailer Dashboard</h1>

      {/* 🔧 Placement Manager */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Add New Placement</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <input
            className="border p-2 rounded"
            placeholder="Name"
            value={newPlacement.name}
            onChange={(e) => setNewPlacement({ ...newPlacement, name: e.target.value })}
          />
          <select
            className="border p-2 rounded"
            value={newPlacement.format}
            onChange={(e) => setNewPlacement({ ...newPlacement, format: e.target.value })}
          >
            <option value="Image">Image</option>
            <option value="Video">Video</option>
            <option value="HTML">HTML</option>
          </select>
          <input
            className="border p-2 rounded"
            placeholder="Dimensions (e.g. 1600x600)"
            value={newPlacement.dimensions}
            onChange={(e) => setNewPlacement({ ...newPlacement, dimensions: e.target.value })}
          />
          <input
            className="border p-2 rounded"
            placeholder="Default Price"
            value={newPlacement.defaultPrice}
            onChange={(e) => setNewPlacement({ ...newPlacement, defaultPrice: e.target.value })}
          />
          <input
            className="border p-2 rounded"
            placeholder="Concurrent Slots"
            type="number"
            value={newPlacement.defaultConcurrentSlots}
            onChange={(e) =>
              setNewPlacement({ ...newPlacement, defaultConcurrentSlots: parseInt(e.target.value) })
            }
          />
          <select
            className="border p-2 rounded"
            value={newPlacement.schedulingMode}
            onChange={(e) => setNewPlacement({ ...newPlacement, schedulingMode: e.target.value })}
          >
            <option value="cadence">Cadence-based</option>
            <option value="custom">Custom-dated</option>
          </select>
        </div>
        <button
          onClick={handleAddPlacement}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Add Placement
        </button>

        {/* Placement Table */}
        {placements.length > 0 && (
          <table className="mt-6 w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border-b">Name</th>
                <th className="p-2 border-b">Format</th>
                <th className="p-2 border-b">Dimensions</th>
                <th className="p-2 border-b">Price</th>
                <th className="p-2 border-b">Slots</th>
                <th className="p-2 border-b">Scheduling</th>
                <th className="p-2 border-b">Generate</th>
              </tr>
            </thead>
            <tbody>
              {placements.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="p-2 border-b">{p.name}</td>
                  <td className="p-2 border-b">{p.format}</td>
                  <td className="p-2 border-b">{p.dimensions}</td>
                  <td className="p-2 border-b">${p.defaultPrice}</td>
                  <td className="p-2 border-b">{p.defaultConcurrentSlots}</td>
                  <td className="p-2 border-b capitalize">{p.schedulingMode}</td>
                  <td className="p-2 border-b">
                    <button
                      className="text-sm text-indigo-600 underline"
                      onClick={() => {
                        const newAvailability = generateAvailability(p);
                        setAvailabilities((prev) => [...prev, ...newAvailability]);
                      }}
                    >
                      Generate
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ➕ Add New Ad Slot Button */}
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        onClick={() => {
          setEditingSlot(null);
          setNewSlot({
            placementId: "",
            availability: "",
            styleGuide: null,
            figmaLink: "",
            totalSlots: 1,
            bookedSlots: 0,
          });
          setShowModal(true);
        }}
      >
        + Add New Ad Slot
      </button>

      {/* ➕ Modal for Creating/Editing Slot */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              {editingSlot ? "Edit Ad Slot" : "Add New Ad Slot"}
            </h2>

            <label className="block mb-2">
              Placement
              <select
                className="w-full border p-2 rounded mt-1"
                value={newSlot.placementId}
                onChange={(e) => setNewSlot({ ...newSlot, placementId: e.target.value })}
              >
                <option value="">Select...</option>
                {placements.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block mb-2">
              Availability Dates
              <input
                type="text"
                className="w-full border p-2 rounded mt-1"
                placeholder="e.g. June 9 – June 15"
                value={newSlot.availability}
                onChange={(e) =>
                  setNewSlot({ ...newSlot, availability: e.target.value })
                }
              />
            </label>

            <label className="block mb-2">
              Style Guide File
              <input
                type="file"
                className="w-full border p-2 rounded mt-1"
                onChange={(e) =>
                  setNewSlot({ ...newSlot, styleGuide: e.target.files[0] })
                }
              />
            </label>

            <label className="block mb-2">
              Figma Link
              <input
                type="url"
                className="w-full border p-2 rounded mt-1"
                value={newSlot.figmaLink}
                onChange={(e) =>
                  setNewSlot({ ...newSlot, figmaLink: e.target.value })
                }
              />
            </label>

            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingSlot(null);
                }}
                className="text-gray-600 hover:underline"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSlot}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                {editingSlot ? "Save Changes" : "Add Slot"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 📋 Ad Slot Table */}
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-3 border-b">Slot Name</th>
            <th className="p-3 border-b">Availability</th>
            <th className="p-3 border-b">Figma Link</th>
            <th className="p-3 border-b">Style Guide</th>
            <th className="p-3 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {adSlots.map((slot) => (
            <tr key={slot.id} className="hover:bg-gray-50">
              <td className="p-3 border-b">{slot.slotName}</td>
              <td className="p-3 border-b">{slot.availability}</td>
              <td className="p-3 border-b">
                {slot.figmaLink ? (
                  <a
                    href={slot.figmaLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    View
                  </a>
                ) : (
                  "—"
                )}
              </td>
              <td className="p-3 border-b">
                {slot.styleGuide ? "Uploaded" : "—"}
              </td>
              <td className="p-3 border-b space-x-2">
                <button
                  onClick={() => handleEdit(slot)}
                  className="text-blue-600 hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleArchive(slot.id)}
                  className="text-red-500 hover:underline"
                >
                  Archive
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
{availabilities.length > 0 && (
  <div className="mt-8">
    <h2 className="text-xl font-semibold mb-2">Generated Availability</h2>
    <table className="w-full text-left border-collapse">
      <thead>
        <tr className="bg-gray-100">
          <th className="p-2 border-b">Placement</th>
          <th className="p-2 border-b">Start Date</th>
          <th className="p-2 border-b">End Date</th>
          <th className="p-2 border-b">Total Slots</th>
          <th className="p-2 border-b">Booked Slots</th>
        </tr>
      </thead>
      <tbody>
        {availabilities.map((slot, i) => (
          <tr key={i} className="hover:bg-gray-50">
            <td className="p-2 border-b">{slot.slotName}</td>
            <td className="p-2 border-b">{slot.startDate}</td>
            <td className="p-2 border-b">{slot.endDate}</td>
            <td className="p-2 border-b">{slot.totalSlots}</td>
            <td className="p-2 border-b">{slot.bookedSlots}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}

    </div>
  );
};

export default RetailerDashboard;
