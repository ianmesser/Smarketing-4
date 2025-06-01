import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

// 🔧 Replace with your actual values
const supabase = createClient("https://nfulkzvpzqbqpcsvnple.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5mdWxrenZwenFicXBjc3ZucGxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0ODA5NzUsImV4cCI6MjA2NDA1Njk3NX0.u6FCTKBgrEvgUGF1LXI7eHNs9jqda-Go579cQOoNkUw");

const VendorPlacements = () => {
  const [placements, setPlacements] = useState([]);
  const [filteredPlacements, setFilteredPlacements] = useState([]);
  const [cart, setCart] = useState([]);
  const [sortBy, setSortBy] = useState("start_date");
  const [filter, setFilter] = useState({ channel: "", minPrice: 0, startDate: "" });

  useEffect(() => {
    fetchPlacements();
  }, []);

  const fetchPlacements = async () => {
    const { data, error } = await supabase
      .from("availability")
      .select(`
        id,
        start_date,
        end_date,
        total_slots,
        booked_slots,
        placements (
          id,
          location,
          channel,
          price,
          style_guide_url,
          format,
          dimensions
        )
      `);
  
    if (error) {
      console.error("Error fetching joined availability:", error);
      return;
    }
  
    // ✅ Filter out fully booked slots
    console.log("Raw availability data from Supabase:", data);
    const filtered = data.filter((record) => {
      const openSlots = record.total_slots - record.booked_slots;
      return openSlots > 0;
    });
  
    // ✅ Flatten for UI
    const formatted = filtered.map((record) => ({
      availabilityId: record.id,
      start_date: record.start_date,
      end_date: record.end_date,
      total_slots: record.total_slots,
      booked_slots: record.booked_slots,
      ...record.placements,
    }));
  
    setPlacements(formatted);
    setFilteredPlacements(formatted);
  };

  const applyFilters = () => {
    let results = [...placements];

    if (filter.channel) {
      results = results.filter((p) => p.channel === filter.channel);
    }

    if (filter.minPrice) {
      results = results.filter((p) => parseFloat(p.price) >= filter.minPrice);
    }

    if (filter.startDate) {
      results = results.filter((p) => new Date(p.start_date) >= new Date(filter.startDate));
    }

    if (sortBy) {
      results.sort((a, b) => {
        if (sortBy === "price") return parseFloat(a.price) - parseFloat(b.price);
        return new Date(a[sortBy]) - new Date(b[sortBy]);
      });
    }

    setFilteredPlacements(results);
  };

  const addToCart = (availability) => {
    const openSlots = availability.total_slots - availability.booked_slots;
    
    if (openSlots <= 0) {
      alert("This availability is fully booked.");
      return;
    }
  
    if (!cart.find((item) => item.availabilityId === availability.availabilityId)) {
      setCart([...cart, availability]);
    }
  };


  const checkout = async () => {
    for (const availability of cart) {
      // ✅ Step 1: Re-fetch latest availability record from Supabase
      const { data: fresh, error: fetchError } = await supabase
        .from("availability")
        .select("total_slots, booked_slots")
        .eq("id", availability.availabilityId)
        .single();
  
      if (fetchError || !fresh) {
        console.error("Failed to fetch availability:", fetchError?.message);
        continue;
      }
  
      const openSlots = fresh.total_slots - fresh.booked_slots;
      if (openSlots <= 0) {
        alert(`Availability for ${availability.location} is already fully booked.`);
        continue;
      }
  
      // ✅ Step 2: Insert purchase
      const { error: insertError } = await supabase.from("purchases").insert([
        {
          vendor_id: supabase.auth.getUser().data.user.id,
          availability_id: availability.availabilityId,
        },
      ]);
      if (insertError) {
        console.error("Checkout failed for:", availability.availabilityId, insertError.message);
        continue;
      }
  
      // ✅ Step 3: Increment booked_slots in availability
      const { error: updateError } = await supabase
        .from("availability")
        .update({ booked_slots: fresh.booked_slots + 1 })
        .eq("id", availability.availabilityId);
  
      if (updateError) {
        console.error("Failed to update availability slot:", updateError.message);
        continue;
      }
    }
  
    alert("Checkout complete!");
    setCart([]);
    fetchPlacements(); // refresh UI
  };
  
  return (
    <div style={{ padding: "1rem" }}>
      <h2>Available Ad Placements</h2>

      {/* Filters */}
      <div style={{ marginBottom: "1rem" }}>
        <label>
          Channel:
          <select onChange={(e) => setFilter({ ...filter, channel: e.target.value })}>
            <option value="">All</option>
            <option value="In-Store">In-Store</option>
            <option value="Site">Site</option>
            <option value="Email">Email</option>
            <option value="Social">Social</option>
          </select>
        </label>

        <label>
          Min Price:
          <input
            type="number"
            onChange={(e) => setFilter({ ...filter, minPrice: parseFloat(e.target.value) })}
          />
        </label>

        <label>
          Start Date:
          <input
            type="date"
            onChange={(e) => setFilter({ ...filter, startDate: e.target.value })}
          />
        </label>

        <label>
          Sort By:
          <select onChange={(e) => setSortBy(e.target.value)}>
            <option value="start_date">Start Date</option>
            <option value="price">Price</option>
            <option value="channel">Channel</option>
          </select>
        </label>

        <button onClick={applyFilters}>Apply Filters</button>
      </div>

      {/* Placements List */}
      {filteredPlacements.map((p) => (
        <div
          key={p.availabilityId}
          className="bg-white shadow-md rounded-lg p-4 mb-4 border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            {p.location || "Untitled Placement"}
          </h3>
          <p className="text-sm text-gray-500 mb-1">
            <strong>Retailer:</strong> GameStop
          </p>
          <p className="text-sm text-gray-500 mb-1">
            <strong>Channel:</strong> {p.channel || "—"} | <strong>Format:</strong> {p.format || "—"}
          </p>
          <p className="text-sm text-gray-500 mb-1">
            <strong>Dimensions:</strong> {p.dimensions || "—"}
          </p>
          <p className="text-sm text-gray-500 mb-1">
            <strong>Start:</strong> {p.start_date ? new Date(p.start_date).toLocaleDateString() : "—"} | <strong>End:</strong> {p.end_date ? new Date(p.end_date).toLocaleDateString() : "—"}
          </p>
          <p className="text-sm text-gray-500 mb-1">
            <strong>Price:</strong> ${p.price} | <strong>Slots:</strong> {p.total_slots - p.booked_slots} available of {p.total_slots}
          </p>
        
          {p.style_guide_url ? (
            <a
              href={p.style_guide_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline text-sm inline-block mt-2"
            >
              View Style Guide
            </a>
          ) : (
            <p className="text-sm text-gray-400 mt-2">No style guide</p>
          )}
        
          <button
            onClick={() => addToCart(p)}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded"
          >
            Add to Cart
          </button>
        </div>
      ))}

      {/* Cart */}
      <h3>Cart ({cart.length} items)</h3>
      {cart.map((c) => (
        <div key={c.availabilityId}>
          {c.location} — ${c.price} <br />
          {new Date(c.start_date).toLocaleDateString()} → {new Date(c.end_date).toLocaleDateString()}
        </div>
      ))}
      {cart.length > 0 && <button onClick={checkout}>Checkout</button>}
    </div>
  );
};

export default VendorPlacements;
