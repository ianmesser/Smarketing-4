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
        .select(`
          id,
          availability_id,
          availability (
            id,
            start_date,
            end_date,
            total_slots,
            booked_slots,
            placements (
              location,
              channel,
              price,
              format,
              dimensions,
              style_guide_url
            )
          )
        `);
  
      if (error) {
        console.error("Cart fetch error:", error.message);
        return;
      }
  
      const formatted = data.map((row) => ({
        cartId: row.id,
        availabilityId: row.availability.id,
        ...row.availability,
        ...row.availability.placements
      }));
  
      setCart(formatted);
    };
  
    fetchCart();
  }, []);

  const checkout = async () => {
    if (cart.length === 0) {
      alert("Your cart is empty.");
      return;
    }
  
    const purchasesToInsert = cart.map((item) => ({
      vendor_id: "00000000-0000-4000-8000-000000000000", // Replace with actual vendor logic when ready
      availability_id: item.availabilityId,
    }));
  
    const { error: insertError } = await supabase.from("purchases").insert(purchasesToInsert);
  
    if (insertError) {
      console.error("Error inserting purchases:", insertError.message);
      alert("Failed to complete checkout. Please try again.");
      return;
    }
  
    // Collect cart row IDs to delete
    const cartIds = cart.map((item) => item.cartId);
  
    const { error: deleteError } = await supabase
      .from("vendor_cart")
      .delete()
      .in("id", cartIds);
  
    if (deleteError) {
      console.error("Error clearing vendor_cart after purchase:", deleteError.message);
      alert("Purchase succeeded, but cart wasn't fully cleared.");
      return;
    }
  
    setCart([]);
    alert("Checkout complete!");
  };

  const removeFromCart = async (cartIdToDelete) => {
    const { error } = await supabase
      .from("vendor_cart")
      .delete()
      .eq("id", cartIdToDelete);
  
    if (error) {
      console.error("Failed to remove from cart:", error.message);
      alert("Could not remove item from cart. Try again.");
      return;
    }
  
    // Update the UI by filtering out the removed item
    setCart((prev) => prev.filter((item) => item.cartId !== cartIdToDelete));
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Your Cart ({cart.length} item{cart.length !== 1 ? "s" : ""})</h2>
      {cart.map((item) => (
        <div key={item.availabilityId} style={{ border: "1px solid #ccc", padding: "1rem", marginBottom: "1rem" }}>
          <strong>{item.location}</strong> | {item.channel} | {item.format} <br />
          {item.dimensions} | ${item.price} <br />
          {item.start_date} to {item.end_date}
          <br />
          <button
            onClick={() => removeFromCart(item.cartId)}
            style={{ marginTop: "0.5rem", color: "red", border: "none", background: "none", cursor: "pointer" }}
          >
            Remove from Cart
          </button>
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
