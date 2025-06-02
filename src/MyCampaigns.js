
import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://nfulkzvpzqbqpcsvnple.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5mdWxrenZwenFicXBjc3ZucGxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0ODA5NzUsImV4cCI6MjA2NDA1Njk3NX0.u6FCTKBgrEvgUGF1LXI7eHNs9jqda-Go579cQOoNkUw"
);

const MyCampaigns = () => {
  const [purchases, setPurchases] = useState([]);

  useEffect(() => {
    const fetchPurchases = async () => {
      const { data, error } = await supabase
        .from("purchases")
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
              format,
              price,
              dimensions,
              style_guide_url
            )
          )
        `);

      if (error) {
        console.error("Error fetching purchases:", error.message);
        return;
      }

      const formatted = data.map((row) => ({
        purchaseId: row.id,
        availabilityId: row.availability?.id,
        start_date: row.availability?.start_date,
        end_date: row.availability?.end_date,
        total_slots: row.availability?.total_slots,
        booked_slots: row.availability?.booked_slots,
        ...row.availability?.placements
      }));

      setPurchases(formatted);
    };

    fetchPurchases();
  }, []);

  return (
    <div style={{ padding: "1rem" }}>
      <h2>My Campaigns ({purchases.length} purchase{purchases.length !== 1 ? "s" : ""})</h2>
      {purchases.map((item) => (
        <div key={item.purchaseId} style={{ border: "1px solid #ccc", padding: "1rem", marginBottom: "1rem" }}>
          <h3>{item.location}</h3>
          <p>
            <strong>Retailer:</strong> GameStop
            <strong>Channel:</strong> {item.channel} | <strong>Format:</strong> {item.format}<br />
            <strong>Dimensions:</strong> {item.dimensions}<br />
            <strong>Start:</strong> {item.start_date} | <strong>End:</strong> {item.end_date}<br />
            <strong>Price:</strong> ${item.price}<br />
          </p>
          {item.style_guide_url ? (
            <a href={item.style_guide_url} target="_blank" rel="noopener noreferrer" style={{ color: "blue", textDecoration: "underline" }}>
              View Style Guide
            </a>
          ) : (
            <p>No style guide</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default MyCampaigns;
