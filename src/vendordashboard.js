import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

// 🔧 Replace with your actual values
const supabase = createClient("YOUR_SUPABASE_URL", "YOUR_SUPABASE_ANON_KEY");

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
      .from("placements")
      .select("*")
      .eq("is_booked", false);

    if (error) {
      console.error("Error fetching placements:", error);
    } else {
      setPlacements(data);
      setFilteredPlacements(data);
    }
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

  const addToCart = (placement) => {
    if (!cart.find((item) => item.id === placement.id)) {
      setCart([...cart, placement]);
    }
  };

  const checkout = async () => {
    for (const placement of cart) {
      const { error } = await supabase.from("purchases").insert([
        {
          vendor_id: supabase.auth.getUser().data.user.id,
          placement_id: placement.id,
        },
      ]);
      if (error) {
        console.error("Checkout failed for:", placement.id, error.message);
        continue;
      }

      await supabase
        .from("placements")
        .update({ is_booked: true })
        .eq("id", placement.id);
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
          <strong>Placement:</strong> {p.location} <br />
          <strong>Channel:</strong> {p.channel} <br />
          <strong>Start:</strong> {p.start_date} <br />
          <strong>End:</strong> {p.end_date} <br />
          <strong>Cost:</strong> ${p.price} <br />
          <button onClick={() => addToCart(p)}>Add to Cart</button>
        </div>
      ))}

      {/* Cart */}
      <h3>Cart ({cart.length} items)</h3>
      {cart.map((c) => (
        <div key={c.id}>{c.location} — ${c.price}</div>
      ))}
      {cart.length > 0 && <button onClick={checkout}>Checkout</button>}
    </div>
  );
};

export default VendorPlacements;
