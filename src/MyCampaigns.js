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
          campaign_name,
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
        campaign_name: row.campaign_name || "",  // ← add this
        start_date: row.availability?.start_date,
        end_date: row.availability?.end_date,
        ...row.availability?.placements
      }));

      setPurchases(formatted);
    };

    fetchPurchases();
  }, []);

  const handleCampaignNameChange = (purchaseId, newName) => {
    setPurchases((prev) =>
      prev.map((p) =>
        p.purchaseId === purchaseId ? { ...p, campaign_name: newName } : p
      )
    );
  };

  const updateCampaignName = async (purchaseId, newName) => {
    const { error } = await supabase
      .from("purchases")
      .update({ campaign_name: newName })
      .eq("id", purchaseId);

    if (error) {
      console.error("Failed to update campaign name:", error.message);
      alert("Error updating campaign name.");
    }
  };
  
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
            <div className="mb-2">
              <input
                type="text"
                value={item.campaign_name}
                onChange={(e) => handleCampaignNameChange(item.purchaseId, e.target.value)}
                onBlur={() => updateCampaignName(item.purchaseId, item.campaign_name)}
                className="text-xl font-bold w-full border-b border-gray-300 focus:outline-none"
                placeholder="Add Campaign Name"
              />
            </div>
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
