
import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient("https://nfulkzvpzqbqpcsvnple.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5mdWxrenZwenFicXBjc3ZucGxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0ODA5NzUsImV4cCI6MjA2NDA1Njk3NX0.u6FCTKBgrEvgUGF1LXI7eHNs9jqda-Go579cQOoNkUw");

const CHANNEL_OPTIONS = ["In-Store", "Site", "Email", "Social"];
const RetailerDashboard = () => {
  const [placements, setPlacements] = useState([]);
  const [newPlacement, setNewPlacement] = useState({
    name: "",
    format: "Image",
    channel: "Site",
    dimensions: "",
    defaultPrice: "",
    defaultConcurrentSlots: 1,
    schedulingMode: "cadence",
    cadenceStartDate: "",
    cadencePeriodLength: 7,
    cadenceWeeksOut: 5,
    styleGuide: null,
  });

  const [selectedPlacementIds, setSelectedPlacementIds] = useState([]);
  const [editingPlacement, setEditingPlacement] = useState(null);
  const [editedPlacement, setEditedPlacement] = useState(null);
  
  const startEditingPlacement = (placement) => {
    setEditingPlacement(placement.id);
    setEditedPlacement({ ...placement });
  };
  
  const cancelEditingPlacement = () => {
    setEditingPlacement(null);
    setEditedPlacement(null);
  };
  
  const saveEditedPlacement = () => {
    setPlacements((prev) =>
      prev.map((p) => (p.id === editedPlacement.id ? editedPlacement : p))
    );
    setEditingPlacement(null);
    setEditedPlacement(null);
  };

  const [availabilities, setAvailabilities] = useState([]);
  const [publishingPlacementId, setPublishingPlacementId] = useState(null);
  const [publishStartDate, setPublishStartDate] = useState("");
  const [publishWeeks, setPublishWeeks] = useState(5);

useEffect(() => {
  fetchPlacements();
}, []);
  
  const generateAvailability = (placement, cadence) => {
    const availability = [];
    const start = new Date(cadence.startDate);
    const periodLength = cadence.periodLength;

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
        bookedSlots: 0,
      });
    }

    return availability;
  };

const fetchPlacements = async () => {
  const { data, error } = await supabase.from("placements").select("*");

  if (error) {
    console.error("Error fetching placements:", error.message);
  } else {
    setPlacements(data);
  }
};

  const handleAddPlacement = () => {
    const placement = {
      id: Date.now(), // unique temporary ID
      ...newPlacement,
      styleGuide: newPlacement.styleGuide,
      cadenceOverride: {
        startDate: newPlacement.cadenceStartDate,
        periodLength: newPlacement.cadencePeriodLength,
        maxWeeksOut: newPlacement.cadenceWeeksOut,
      },
    };

setPlacements((prev) => [...prev, placement]);

    // Reset form
    setNewPlacement({
      name: "",
      format: "Image",
      dimensions: "",
      defaultPrice: "",
      defaultConcurrentSlots: 1,
      schedulingMode: "cadence",
      cadencePeriodLength: 7,
      cadenceStartDate: "",
      cadenceWeeksOut: 5,
      channel: "Site",
      styleGuide: null
    });
  };


 const handleDeletePlacement = (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this placement?");
    if (confirmDelete) {
      setPlacements((prev) => prev.filter((p) => p.id !== id));
    }
  };

  return (
    <div className="p-8 space-y-10">
      <h1 className="text-3xl font-bold mb-2"> Dashboard</h1>

      <div>
        <h2 className="text-xl font-semibold mb-2">Add New Placement</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block font-medium mb-1">Name</label>
            <input
              className="border p-2 rounded w-full"
              placeholder="e.g. Homepage 2-Up"
              value={newPlacement.name}
              onChange={(e) =>
                setNewPlacement({ ...newPlacement, name: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Format</label>
            <select
              className="border p-2 rounded w-full"
              value={newPlacement.format}
              onChange={(e) =>
                setNewPlacement({ ...newPlacement, format: e.target.value })
              }
            >
              <option value="Image">Image</option>
              <option value="Video">Video</option>
              <option value="HTML">HTML</option>
            </select>
          </div>
          <div>
            <label className="block font-medium mb-1">Channel</label>
            <select
              className="border p-2 rounded w-full"
              value={newPlacement.channel}
              onChange={(e) =>
                setNewPlacement({ ...newPlacement, channel: e.target.value })
              }
            >
              {CHANNEL_OPTIONS.map((channel) => (
                <option key={channel} value={channel}>
                  {channel}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-medium mb-1">Dimensions</label>
            <input
              className="border p-2 rounded w-full"
              placeholder="e.g. 1600x600"
              value={newPlacement.dimensions}
              onChange={(e) =>
                setNewPlacement({ ...newPlacement, dimensions: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Default Price</label>
            <input
              type="number"                                
              min="0"
              className="border p-2 rounded w-full"
              placeholder="e.g. 10000"
              value={newPlacement.defaultPrice}
              onChange={(e) =>
                setNewPlacement({ ...newPlacement, defaultPrice: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Concurrent Slots</label>
            <input
              className="border p-2 rounded w-full"
              type="number"
              min="1"
              value={newPlacement.defaultConcurrentSlots}
              onChange={(e) =>
                setNewPlacement({
                  ...newPlacement,
                  defaultConcurrentSlots: parseInt(e.target.value),
                })
              }
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Scheduling Mode</label>
            <select
              className="border p-2 rounded w-full"
              value={newPlacement.schedulingMode}
              onChange={(e) =>
                setNewPlacement({ ...newPlacement, schedulingMode: e.target.value })
              }
            >
              <option value="cadence">Cadence-based</option>
              <option value="custom">Custom-dated</option>
            </select>
          </div>
          <div>
            <label className="block font-medium mb-1">Upload Style Guide</label>
            <input
              type="file"
              className="border p-2 rounded w-full"
              accept=".pdf,.doc,.docx,.jpg,.png"
              onChange={(e) =>
                setNewPlacement({
                  ...newPlacement,
                  styleGuide: e.target.files[0],
                })
              }
            />
          </div>

          <div className="col-span-2 mt-4">
            {newPlacement.schedulingMode === "cadence" && (
              <h3 className="font-semibold mb-2">Cadence Settings</h3>
            )}
          </div>
          <div>
           {newPlacement.schedulingMode === "cadence" && (
            <>
              <label className="font-medium mt-2">Period Length (in days)</label>
              <input
                type="number"
                className="border p-2 rounded"
                value={newPlacement.cadencePeriodLength}
                onChange={(e) =>
                  setNewPlacement({
                    ...newPlacement,
                    cadencePeriodLength: parseInt(e.target.value) || 7,
                  })
                }
              />
            </>
          )}
          </div>
        </div>
        <button
          onClick={handleAddPlacement}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Add Placement
        </button>

        {selectedPlacementIds.length > 0 && (
          <button
            onClick={() => {
              const confirmDelete = window.confirm(
                `Are you sure you want to delete ${selectedPlacementIds.length} placement(s)?`
              );
              if (confirmDelete) {
                setPlacements((prev) =>
                  prev.filter((p) => !selectedPlacementIds.includes(p.id))
                );
                setSelectedPlacementIds([]);
              }
            }}
            className="ml-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Delete Selected
          </button>
        )}

        {placements.length > 0 && (
          <table className="mt-6 w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border-b">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedPlacementIds(placements.map((p) => p.id));
                      } else {
                        setSelectedPlacementIds([]);
                      }
                    }}
                    checked={
                      placements.length > 0 &&
                      selectedPlacementIds.length === placements.length
                    }
                  />
                </th>
                <th className="p-2 border-b">Name</th>
                <th className="p-2 border-b">Channel</th>
                <th className="p-2 border-b">Format</th>
                <th className="p-2 border-b">Dimensions</th>
                <th className="p-2 border-b">Price</th>
                <th className="p-2 border-b">Slots</th>
                <th className="p-2 border-b">Scheduling</th>
                <th className="p-2 border-b">Style Guide</th>
                <th className="p-2 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {placements.map((p) => (
                <React.Fragment key={p.id}>
                  <tr className="hover:bg-gray-50">
                    {editingPlacement === p.id ? (
                      <>
                       <td className="p-2 border-b">
                        <input
                          type="checkbox"
                          checked={selectedPlacementIds.includes(p.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedPlacementIds((prev) => [...prev, p.id]);
                            } else {
                              setSelectedPlacementIds((prev) =>
                                prev.filter((id) => id !== p.id)
                              );
                            }
                          }}
                        />
                      </td>
                       <td className="p-2 border-b">
                          <input
                            className="border p-1 rounded w-full"
                            value={editedPlacement.name}
                            onChange={(e) =>
                              setEditedPlacement({ ...editedPlacement, name: e.target.value })
                            }
                          />
                        </td>
                        <td className="p-2 border-b">
                          <select
                            className="border p-1 rounded w-full"
                            value={editedPlacement.channel}
                            onChange={(e) =>
                              setEditedPlacement({ ...editedPlacement, channel: e.target.value })
                            }
                          >
                            {CHANNEL_OPTIONS.map((channel) => (
                              <option key={channel} value={channel}>
                                {channel}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="p-2 border-b">
                          <select
                            className="border p-1 rounded w-full"
                            value={editedPlacement.format}
                            onChange={(e) =>
                              setEditedPlacement({ ...editedPlacement, format: e.target.value })
                            }
                          >
                            <option value="Image">Image</option>
                            <option value="Video">Video</option>
                            <option value="HTML">HTML</option>
                          </select>
                        </td>
                        <td className="p-2 border-b">
                          <input
                            className="border p-1 rounded w-full"
                            value={editedPlacement.dimensions}
                            onChange={(e) =>
                              setEditedPlacement({
                                ...editedPlacement,
                                dimensions: e.target.value,
                              })
                            }
                          />
                        </td>
                        <td className="p-2 border-b">
                          <input
                            className="border p-1 rounded w-full"
                            value={editedPlacement.defaultPrice}
                            onChange={(e) =>
                              setEditedPlacement({
                                ...editedPlacement,
                                defaultPrice: e.target.value,
                              })
                            }
                          />
                        </td>
                        <td className="p-2 border-b">
                          <input
                            className="border p-1 rounded w-full"
                            type="number"
                            min="1"
                            value={editedPlacement.defaultConcurrentSlots}
                            onChange={(e) =>
                              setEditedPlacement({
                                ...editedPlacement,
                                defaultConcurrentSlots: parseInt(e.target.value),
                              })
                            }
                          />
                        </td>
                        <td className="p-2 border-b">{editedPlacement.schedulingMode}</td>
                        <td className="p-2 border-b">—</td>
                        <td className="p-2 border-b">
                          <button
                            className="text-green-600 underline mr-2"
                            onClick={saveEditedPlacement}
                          >
                            Save
                          </button>
                          <button
                            className="text-gray-500 underline"
                            onClick={cancelEditingPlacement}
                          >
                            Cancel
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="p-2 border-b">
                          <input
                            type="checkbox"
                            checked={selectedPlacementIds.includes(p.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedPlacementIds((prev) => [...prev, p.id]);
                              } else {
                                setSelectedPlacementIds((prev) =>
                                  prev.filter((id) => id !== p.id)
                                );
                              }
                            }}
                          />
                        </td>
                        <td className="p-2 border-b">{p.name}</td>
                        <td className="p-2 border-b">{p.channel}</td>
                        <td className="p-2 border-b">{p.format}</td>
                        <td className="p-2 border-b">{p.dimensions}</td>
                        <td className="p-2 border-b">${p.defaultPrice}</td>
                        <td className="p-2 border-b">{p.defaultConcurrentSlots}</td>
                        <td className="p-2 border-b capitalize">{p.schedulingMode}</td>
                        <td className="p-2 border-b">
                          {p.styleGuide ? (
                            <a
                              href={URL.createObjectURL(p.styleGuide)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 underline"
                            >
                              {p.styleGuide.name}
                            </a>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="p-2 border-b">
                          <button
                            className="text-sm text-indigo-600 underline mr-2"
                            onClick={() => {
                              setPublishingPlacementId(p.id);
                              setPublishStartDate("");
                              setPublishWeeks(5);
                            }}
                          >
                            Publish Availability
                          </button>
                          <button
                            className="text-sm text-blue-600 underline"
                            onClick={() => startEditingPlacement(p)}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeletePlacement(p.id)}
                            className="ml-2 text-sm text-red-600 underline"
                          >
                            Delete
                          </button>
                        </td>
                      </>
                    )}
                  </tr>

              
                  {publishingPlacementId === p.id && (
                    <tr>
                      <td colSpan="7" className="bg-gray-50 p-4">
                        <div className="flex flex-col gap-4">
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
                              onClick={async () => {
                                if (!publishStartDate) {
                                  alert("Please select a start date.");
                                  return;
                                }
                                const cadence = {
                                  startDate: publishStartDate,
                                  periodLength: p.cadenceOverride?.periodLength || 7,
                                  maxWeeksOut: publishWeeks,
                                };
                                const availability = generateAvailability(p, cadence);
                                const { data, error } = await supabase.from("placements").insert([
                                  {
                                    retailer_id: "00000000-0000-4000-8000-000000000000",
                                    channel: p.channel,
                                    location: p.name,
                                    start_date: cadence.startDate,
                                    end_date: availability[0]?.endDate || cadence.startDate,
                                    price: parseFloat(p.defaultPrice || 0),
                                    style_guide_url: "", // this will be handled later
                                    is_booked: false,
                                  }
                                ]);
                            if (error) {
                              console.error("Supabase insert error:", error.message);
                              alert("There was a problem publishing to Supabase.");
                            } else {
                              console.log("Published to Supabase:", data);
                              fetchPlacements?.();
                              setAvailabilities((prev) => [...prev, ...availability]);
                              setPublishingPlacementId(null);
                            }
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
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>

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
