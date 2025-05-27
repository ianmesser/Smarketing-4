// src/AvailabilityGenerator.js

// Retailer-wide cadence settings
const retailerCadence = {
  startDate: "2025-05-26",    // Start generating from this date
  startDay: "Sunday",         // For future use — not needed right now
  periodLength: 7,            // Days per period
  maxWeeksOut: 5              // How far ahead to generate
};

// Sample placement types defined by retailer
const placements = [
  {
    id: 1,
    name: "Homepage 2-Up",
    format: "Image",
    dimensions: "1600x600",
    defaultPrice: 10000,
    defaultConcurrentSlots: 2,
    schedulingMode: "cadence", // This one uses auto-generated weeks
    cadenceOverride: {
      enabled: true,
      startDate: "2025-05-26",
      periodLength: 7,
    }
  },
  {
    id: 2,
    name: "Homepage Full Blade",
    format: "Image",
    dimensions: "1600x1200",
    defaultPrice: 15000,
    defaultConcurrentSlots: 1,
    schedulingMode: "custom" // This one will use manually entered dates
  }
];

// Function to generate availability blocks
const generateAvailability = (placement, cadence = retailerCadence) => {
  const availability = [];
  const start = new Date(
    placement.cadenceOverride?.enabled
      ? placement.cadenceOverride.startDate
      : cadence.startDate
  );
  const periodLength = placement.cadenceOverride?.enabled
    ? placement.cadenceOverride.periodLength
    : cadence.periodLength;

  for (let i = 0; i < cadence.maxWeeksOut; i++) {
    const periodStart = new Date(start);
    periodStart.setDate(start.getDate() + i * periodLength);

    const periodEnd = new Date(periodStart);
    periodEnd.setDate(periodStart.getDate() + periodLength - 1);

    availability.push({
      placementId: placement.id,
      slotName: placement.name,
      startDate: periodStart.toISOString().split("T")[0],
      endDate: periodEnd.toISOString().split("T")[0],
      totalSlots: placement.defaultConcurrentSlots,
      bookedSlots: 0
    });
  }

  return availability;
};

// EXAMPLE: Generate for the cadence-based placement
const homepage2Up = placements.find(p => p.name === "Homepage 2-Up");
const homepageSlots = generateAvailability(homepage2Up);

// Print the result
console.log("Generated availability:", homepageSlots);
