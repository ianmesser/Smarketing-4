import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

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
    console.log("Saving campaign name:", newName, "for ID:", purchaseId);
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
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-6 p-4">
        {campaigns.map((campaign) => (
          <Droppable droppableId={campaign.id} key={campaign.id}>
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="w-1/3 bg-gray-100 p-4 rounded shadow"
              >
                <h3 className="text-lg font-semibold mb-2">{campaign.name}</h3>
  
                {purchases
                  .filter((item) => item.campaign_id === campaign.id)
                  .map((item, index) => (
                    <Draggable
                      key={item.purchaseId}
                      draggableId={item.purchaseId}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="bg-white p-3 mb-3 border border-gray-300 rounded"
                        >
                          <h4 className="font-bold">{item.location}</h4>
                          <p>{item.channel} | {item.format}</p>
                        </div>
                      )}
                    </Draggable>
                  ))}
  
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );

export default MyCampaigns;
