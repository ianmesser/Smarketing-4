import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://nfulkzvpzqbqpcsvnple.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5mdWxrenZwenFicXBjc3ZucGxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0ODA5NzUsImV4cCI6MjA2NDA1Njk3NX0.u6FCTKBgrEvgUGF1LXI7eHNs9jqda-Go579cQOoNkUw"
);

const VendorCart = () => {
  const [cart, setCart] = useState([]);
  const [placements, setPlacements] = useState([]);

  useEffect(() => {
    const fetchCart = async () => {
      const { data, error } = await supabase
        .from("vendor_cart")
        .select("availability_id");

      if (error) {
        console.error("Error fetching vendor cart:", error.message);
        return;
      }

      const availabilityIds = data.map((item) => item.availability_id);

      const { data: availabilityData, error: availError } = await supabase
        .from("availability")
        .select(\`
          id, start_date, end_date, total_slots, booked_slots,
          placements (
            id, location, channel, price, dimensions, format, style_guide_url
          )
        \`)
        .in("id", availabilityIds);

      if (availError) {
        console.error("Error joining availabilities from cart:", availError.message);
        return;
      }

      const formatted = availabilityData.map((record) => ({
        availabilityId: record.id,
        start_date: record.start_date,
        end_date: record.end_date,
        total_slots: record.total_slots,
        booked_slots: record.booked_slots,
        ...record.placements,
      }));

      setCart(formatted);
    };

    fetchCart();
  }, []);

  const checkout = async () => {
    for (const item of cart) {
      const { error } = await supabase.from("purchases").insert([
        {
          vendor_id: "demo-id-or-null",
          availability_id: item.availabilityId,
        },
      ]);

      if (error) {
        console.error("Checkout failed for:", item.availabilityId, error.message);
        continue;
      }
    }

    const availabilityIds = cart.map((item) => item.availabilityId);

    const { error: deleteError } = await supabase
      .from("vendor_cart")
      .delete()
      .in("availability_id", availabilityIds);

    if (deleteError) {
      console.error("Error clearing cart:", deleteError.message);
    }

    setCart([]);
    alert("Checkout complete!");
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Your Cart ({cart.length} item{cart.length !== 1 ? "s" : ""})</h2>
      {cart.map((item) => (
        <div key={item.availabilityId} style={{ border: "1px solid #ccc", padding: "1rem", marginBottom: "1rem" }}>
          <strong>{item.location}</strong> | {item.channel} | {item.format} <br />
          {item.dimensions} | ${item.price} <br />
          {item.start_date} to {item.end_date}
        </div>
      ))}
      {cart.length > 0 && (
        <button onClick={checkout} style={{ backgroundColor: "#2563eb", color: "#fff", padding: "0.5rem 1rem", border: "none", borderRadius: "4px" }}>
          Checkout
        </button>
      )}
    </div>
  );
};

export default VendorCart;