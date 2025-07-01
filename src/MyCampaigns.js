import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const supabase = createClient(
  "https://nfulkzvpzqbqpcsvnple.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5mdWxrenZwenFicXBjc3ZucGxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0ODA5NzUsImV4cCI6MjA2NDA1Njk3NX0.u6FCTKBgrEvgUGF1LXI7eHNs9jqda-Go579cQOoNkUw"
);

// 🔐 Hardcoded vendor ID (test)
const TEST_VENDOR_ID = "00000000-0000-4000-8000-000000000000";

const MyCampaigns = () => {
  const [purchases, setPurchases] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
  
    const date = new Date(dateStr);
  
    // Extract UTC year, month, day directly to avoid timezone shifts
    const year = date.getUTCFullYear();
    const monthIndex = date.getUTCMonth(); // 0-based index
    const day = date.getUTCDate();
  
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
    return `${monthNames[monthIndex]} ${day < 10 ? "0" + day : day}, ${year}`;
  };

  const fetchCampaigns = async () => {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('vendor_id', TEST_VENDOR_ID); // make sure you already have staticVendorId defined
  
    if (error) {
      console.error('Error fetching campaigns:', error);
    } else {
      setCampaigns(data);
    }
  };

  // Fetch campaigns belonging to this vendor
  useEffect(() => {
    fetchCampaigns();
  }, []);

  // Fetch purchases
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
              style_guide_url,
              retailers (
                name
              )
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
        retailer_name: row.availability?.placements?.retailers?.name,
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

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const purchaseId = draggableId;
    const newCampaignId = destination.droppableId;

    setPurchases((prev) =>
      prev.map((p) =>
        p.purchaseId === purchaseId ? { ...p, campaign_id: newCampaignId } : p
      )
    );

    const { error } = await supabase
      .from("purchases")
      .update({ campaign_id: newCampaignId })
      .eq("id", purchaseId);

    if (error) {
      console.error("Failed to update campaign_id:", error.message);
      alert("Error saving campaign update.");
    }
  };

  const handleAddCampaign = async () => {
    const name = prompt("Enter a name for your new campaign:");
    if (!name) return;

    const { data, error } = await supabase
      .from("campaigns")
      .insert([{ name, vendor_id: TEST_VENDOR_ID }])
      .select();

    if (error) {
      console.error("Failed to add campaign:", error.message);
      alert("Error adding campaign.");
      return;
    }

    setCampaigns((prev) => [...prev, ...data]);
  };

  const handleDeleteCampaign = async (campaignId) => {
    const confirmDelete = confirm("Are you sure you want to delete this campaign? All placements will be moved to Unassigned.");
    if (!confirmDelete) return;
  
    // Step 1: Move purchases back to unassigned
    const { error: updateError } = await supabase
      .from("purchases")
      .update({ campaign_id: null })
      .eq("campaign_id", campaignId);
  
    if (updateError) {
      console.error("Failed to unassign placements:", updateError.message);
      alert("Error unassigning placements.");
      return;
    }
  
    // Step 2: Delete campaign row
    const { error: deleteError } = await supabase
      .from("campaigns")
      .delete()
      .eq("id", campaignId);
  
    if (deleteError) {
      console.error("Failed to delete campaign:", deleteError.message);
      alert("Error deleting campaign.");
    } else {
      // Refresh UI
      fetchCampaigns();
      setPurchases((prev) =>
        prev.map((p) =>
          p.campaign_id === campaignId ? { ...p, campaign_id: "unassigned" } : p
        )
      );
    }
  };

  const handleRenameCampaign = async (campaignId, currentName) => {
    const newName = prompt("Enter a new name for this campaign:", currentName);
    if (!newName || newName === currentName) return;
  
    console.log("Renaming campaign ID:", campaignId, "to:", newName);
  
    const { data, error } = await supabase
      .from("campaigns")
      .update({ name: newName }) // ✅ this targets the "name" field
      .eq("id", campaignId.toString()) // 🛠️ Force as string
      .select(); // optional: lets us log what was updated
  
    if (error) {
      console.error("Error renaming campaign:", error);
    } else {
      console.log("Rename success:", data);
      fetchCampaigns(); // ✅ reloads data into UI
    }
  };

  const allCampaignsWithUnassigned = [
    { id: "unassigned", name: "Unassigned" },
    ...campaigns,
  ];

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
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-semibold">{campaign.name}</h2>
                      <button
                        className="text-sm text-blue-500 hover:underline"
                        onClick={() => handleRenameCampaign(campaign.id, campaign.name)}
                      >
                        ✏️
                      </button>
                    </div>
                    <button
                      className="text-sm text-red-500 hover:underline"
                      onClick={() => handleDeleteCampaign(campaign.id)}
                    >
                      🗑️
                    </button>
                  </div>

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
                            <p>
                              {item.channel} | {item.format}
                              {item.dimensions && ` | ${item.dimensions}`}
                              {item.retailer_name && ` | ${item.retailer_name}`}
                            </p>
                            <p className="text-sm text-gray-500">
                              {formatDate(item.start_date)} → {formatDate(item.end_date)}
                            </p>

                            {item.style_guide_url && (
                              <a
                                href={item.style_guide_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block mt-2 text-sm text-blue-600 hover:underline"
                              >
                                📄 View Style Guide
                              </a>
                            )}  

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
      
      {/* Timeline View (All Purchased Placements) */}
      <div className="mt-12">
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <span>📅</span> Timeline View (All Purchased Placements)
        </h2>
      
        {/* Horizontal time axis */}
        <div className="overflow-x-auto border-b border-gray-300 pb-2 mb-4">
          <div className="flex w-[1800px] text-sm text-gray-500">
            {[...Array(30)].map((_, i) => {
              const date = new Date();
              date.setDate(date.getDate() + i);
              return (
                <div
                  key={i}
                  className="w-[60px] text-center"
                >
                  {date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </div>
              );
            })}
          </div>
        </div>
      
        {/* Placement row */}
        <div className="bg-white rounded-lg p-4 shadow">
          <div className="relative h-12 w-[1800px] bg-gray-100 rounded">
            {purchases.map((item) => {
              const start = new Date(item.start_date);
              const end = new Date(item.end_date);
              const today = new Date();
              const daysFromToday = Math.max(0, Math.floor((start - today) / (1000 * 60 * 60 * 24)));
              const durationDays = Math.max(1, Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1);
      
              return (
                <div
                  key={item.purchaseId}
                  className="absolute top-2 h-8 bg-blue-500 text-white text-xs px-2 rounded shadow"
                  style={{
                    left: `${daysFromToday * 60}px`,
                    width: `${durationDays * 60}px`,
                  }}
                >
                  {item.location} – {item.retailer?.name || 'Unknown'} – {item.campaign_name || 'Unassigned'}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default MyCampaigns;
