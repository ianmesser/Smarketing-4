
import React, { useState } from "react";

// Mock data
const initialPlacements = [
  {
    id: 1,
    name: "Homepage 2-Up",
    price: 10000,
    slotCount: 2,
    cadenceOverride: { periodLength: 7 },
  },
  {
    id: 2,
    name: "Homepage Full Blade",
    price: 12000,
    slotCount: 1,
    cadenceOverride: { periodLength: 7 },
  },
];

function generateAvailability(placement, cadence) {
  const availability = [];
  const startDate = new Date(cadence.startDate);
  for (let i = 0; i < cadence.maxWeeksOut; i++) {
    const slotStart = new Date(startDate);
    slotStart.setDate(startDate.getDate() + i * cadence.periodLength);
    const slotEnd = new Date(slotStart);
    slotEnd.setDate(slotStart.getDate() + cadence.periodLength - 1);
    availability.push({
      placementId: placement.id,
      slotName: placement.name,
      dates: `${slotStart.toDateString()} - ${slotEnd.toDateString()}`,
    });
  }
  return availability;
}

export default function RetailerDashboard() {
  const [placements, setPlacements] = useState(initialPlacements);
  const [availabilities, setAvailabilities] = useState([]);
  const [publishingPlacementId, setPublishingPlacementId] = useState(null);
  const [publishStartDate, setPublishStartDate] = useState("");
  const [publishWeeks, setPublishWeeks] = useState(5);

  const handleEdit = (placement) => {
    alert("Edit functionality coming soon for: " + placement.name);
  };

  const handleArchive = (placement) => {
    if (window.confirm(`Archive ${placement.name}?`)) {
      setPlacements((prev) => prev.filter((p) => p.id !== placement.id));
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Ad Placements</h2>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-200 text-left">
            <th className="p-2">Slot Name</th>
            <th className="p-2">Price</th>
            <th className="p-2">Concurrent Slots</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {placements.map((p) => (
            <React.Fragment key={p.id}>
              <tr className="border-b">
                <td className="p-2">{p.name}</td>
                <td className="p-2">${p.price.toLocaleString()}</td>
                <td className="p-2">{p.slotCount}</td>
                <td className="p-2">
                  <button onClick={() => handleEdit(p)}>Edit</button>
                  <button
                    onClick={() => handleArchive(p)}
                    className="ml-2 text-red-600"
                  >
                    Archive
                  </button>
                  <button
                    className="ml-2 text-indigo-600 underline"
                    onClick={() => {
                      console.log("Clicked publish for", p.name);
                      setPublishingPlacementId(p.id);
                      setPublishStartDate("");
                      setPublishWeeks(5);
                    }}
                  >
                    Publish Availability
                  </button>
                </td>
              </tr>

              {publishingPlacementId === p.id && (
                <tr>
                  <td colSpan="4" className="bg-gray-50 p-4">
                    <div className="flex items-center gap-4">
                      <label className="font-medium">Start Date:</label>
                      <input
                        type="date"
                        className="border p-2 rounded"
                        value={publishStartDate}
                        onChange={(e) => setPublishStartDate(e.target.value)}
                      />

                      <label className="font-medium">Weeks to Publish:</label>
                      <input
                        type="number"
                        min="1"
                        className="border p-2 rounded w-20"
                        value={publishWeeks}
                        onChange={(e) =>
                          setPublishWeeks(parseInt(e.target.value) || 1)
                        }
                      />

                      <button
                        className="bg-blue-600 text-white px-4 py-2 rounded"
                        onClick={() => {
                          console.log("Confirm clicked for", p.name);
                          if (!publishStartDate) {
                            console.warn("No start date selected!");
                            return;
                          }
                          const cadence = {
                            startDate: publishStartDate,
                            periodLength: p.cadenceOverride.periodLength,
                            maxWeeksOut: publishWeeks,
                          };
                          const availability = generateAvailability(p, cadence);
                          setAvailabilities((prev) => [
                            ...prev,
                            ...availability,
                          ]);
                          setPublishingPlacementId(null);
                        }}
                      >
                        Confirm
                      </button>

                      <button
                        className="text-gray-500 underline"
                        onClick={() => setPublishingPlacementId(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>

      <h3 className="text-lg font-semibold mt-6 mb-2">Published Availability</h3>
      <ul className="list-disc pl-6">
        {availabilities.map((a, i) => (
          <li key={i}>
            <strong>{a.slotName}</strong>: {a.dates}
          </li>
        ))}
      </ul>
    </div>
  );
}
