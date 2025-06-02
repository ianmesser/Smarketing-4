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
        ...row.availability?.placements
      }));

      setPurchases(formatted);
    };

    fetchPurchases();
  }, []);

  return (
    <div style={{ padding: "1rem" }}>
      <h2>
        My Campaigns ({purchases.length} purchase{purchases.length !== 1 ? "s" : ""})
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {purchases.map((item) => (
          <div
            key={item.purchaseId}
            className="bg-white shadow-md rounded-lg p-4 border border-gray-200"
          >
            <h3 className="text-xl font-bold mb-2">{item.location || "Untitled Placement"}</h3>
            <p><strong>Retailer:</strong> GameStop</p>
            <p><strong>Channel:</strong> {item.channel} <strong>| Format:</strong> {item.format}</p>
            <p><strong>Dimensions:</strong> {item.dimensions || "—"}</p>
            <p><strong>Start:</strong> {item.start_date} <strong>| End:</strong> {item.end_date}</p>
            <p><strong>Price:</strong> ${item.price}</p>

            {item.style_guide_url ? (
              <a
                href={item.style_guide_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline block mt-2"
              >
                View Style Guide
              </a>
            ) : (
              <p className="mt-2 text-gray-500">No style guide</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyCampaigns;
