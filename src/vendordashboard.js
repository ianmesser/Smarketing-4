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
          is_booked
        )
      `);
  
    if (error) {
      console.error("Error fetching joined availability:", error);
      return;
    }
  
    // Flatten nested data for easier rendering
    const formatted = data.map((record) => ({
      availabilityId: record.id,
      start_date: record.start_date,
      end_date: record.end_date,
      total_slots: record.total_slots,
      booked_slots: record.booked_slots,
      ...record.placements
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
    if (!cart.find((item) => item.availabilityId === availability.availabilityId)) {
      setCart([...cart, availability]);
    }
  };

  const checkout = async () => {
    for (const placement of cart) {
      // Create purchase record
      const { error: insertError } = await supabase.from("purchases").insert([
        {
          vendor_id: supabase.auth.getUser().data.user.id,
          availability_id: placement.availabilityId, // not placement.id anymore
        },
      ]);
  
      if (insertError) {
        console.error("Checkout failed for:", placement.availabilityId, insertError.message);
        continue;
      }
  
      // Increment booked_slots by 1
      const { error: updateError } = await supabase.rpc("increment_booked_slots", {
        avail_id: placement.availabilityId,
        increment_by: 1,
      });
  
      if (updateError) {
        console.error("Failed to increment booked slots:", updateError.message);
      }
    }
  
    alert("Checkout complete!");
    setCart([]);
    fetchPlacements();
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
          key={p.id}
          style={{
            border: "1px solid #ccc",
            padding: "0.5rem",
            marginBottom: "0.5rem",
            borderRadius: "4px",
          }}
        >
          <strong>Retailer:</strong> GameStop <br />
          <strong>Placement:</strong> {p.location || "—"} <br />
          <strong>Channel:</strong> {p.channel || "—"} <br />
          <strong>Format:</strong> {p.format || "—"} <br />
          <strong>Dimensions:</strong> {p.dimensions || "—"} <br />
          <strong>Start Date:</strong>{" "}
          {p.start_date ? new Date(p.start_date).toLocaleDateString() : "—"} <br />
          <strong>End Date:</strong>{" "}
          {p.end_date ? new Date(p.end_date).toLocaleDateString() : "—"} <br />
          <strong>Price:</strong> {p.price ? `$${p.price}` : "—"} <br />
          <strong>Slots:</strong>{" "}
          {p.total_slots - p.booked_slots} available out of {p.total_slots} <br />
      
          {p.style_guide_url ? (
            <a
              href={p.style_guide_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "blue", textDecoration: "underline" }}
            >
              View Style Guide
            </a>
          ) : (
            <span>No style guide</span>
          )}
          <br />
          <button onClick={() => addToCart(p)}>Add to Cart</button>
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
