import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const supabase = createClient(
  "https://nfulkzvpzqbqpcsvnple.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5mdWxrenZwenFicXBjc3ZucGxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0ODA5NzUsImV4cCI6MjA2NDA1Njk3NX0.u6FCTKBgrEvgUGF1LXI7eHNs9jqda-Go579cQOoNkUw"
);

const MyCampaigns = () => {
  const [purchases, setPurchases] = useState([]);

  const [campaigns, setCampaigns] = useState([
    { id: "campaign-1", name: "Holiday 2025" },
    { id: "campaign-2", name: "Back to School" },
    { id: "campaign-3", name: "Summer Sale" }
  ]);

  useEffect(() => {
    const fetchPurchases = async () => {
      const { data, error } = await supabase
        .from("purchases")
        .select(`
          id,
          availability_id,
          campaign_name,
          campaign_id,
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
        campaign_name: row.campaign_name || "",
        campaign_id: row.campaign_id || "unassigned",
        start_date: row.availability?.start_date,
        end_date: row.availability?.end_date,
        ...row.availability?.placements
      }));

      setPurchases(formatted);
      console.log("Purchases loaded:", formatted);
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

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
  
    // If dropped in the same place, do nothing
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }
  
    const purchaseId = draggableId;
    const newCampaignId = destination.droppableId;
  
    // Update state for immediate UI feedback
    setPurchases((prev) =>
      prev.map((p) =>
        p.purchaseId === purchaseId ? { ...p, campaign_id: newCampaignId } : p
      )
    );
  
    // Persist change to Supabase
    const { error } = await supabase
      .from("purchases")
      .update({ campaign_id: newCampaignId })
      .eq("id", purchaseId);
  
    if (error) {
      console.error("Failed to update campaign_id:", error.message);
      alert("Error saving campaign update.");
    }
  };
  
// Include a virtual "Unassigned" campaign bucket for any purchases without a campaign_id
  const allCampaignsWithUnassigned = [
    { id: "unassigned", name: "Unassigned" },
    ...campaigns,
  ];

  const handleAddCampaign = async () => {
    const name = prompt("Enter a name for your new campaign:");
    if (!name) return;
  
    const { data, error } = await supabase
      .from("campaigns")
      .insert([{ name }])
      .select(); // get the inserted row back
  
    if (error) {
      console.error("Failed to add campaign:", error.message);
      alert("Error adding campaign.");
      return;
    }
  
    // Add the new campaign to the UI
    setCampaigns((prev) => [...prev, ...data]);
  };
  
  return (
    <>
      <div className="p-4">
        <button
          onClick={handleAddCampaign}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          + New Campaign
        </button>
      </div>
  
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-6 p-4">
          {allCampaignsWithUnassigned.map((campaign) => (
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
    </>
  );
  };

export default MyCampaigns;
