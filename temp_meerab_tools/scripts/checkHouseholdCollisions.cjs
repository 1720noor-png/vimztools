const fs = require('fs');

function slugify(text) {
  return text.toLowerCase()
    .replace(/&/g, 'and')
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const requestedTools = [
  // Cleaning
  'Cleaning Time Estimator', 'Cleaning Staff Cost Calculator', 'Room-by-Room Cleaning Planner',
  'Cleaning Frequency Calculator', 'Cleaning Priority Planner', 'Mess Level Assessment',
  'Decluttering Progress Tracker', 'Home Cleaning Checklist Generator', 'Cleaning Task Randomizer',
  'Cleaning Rotation Planner', 'Cleaning Supplies Inventory', 'Cleaning Supplies Cost Calculator',
  'Cleaning Product Compatibility Checker', 'Surface Cleaning Guide', 'Room-by-Room Supply Calculator',
  'Deep Cleaning Progress Tracker', 'Seasonal Cleaning Planner', 'Move-Out Cleaning Checklist',
  'Rental Property Cleaning Checklist', 'Cleaning Service Quote Calculator',
  // Laundry
  'Laundry Cost per Load Calculator', 'Laundry Loads per Week Calculator', 'Laundry Electricity Cost Estimator',
  'Laundry Water Cost Estimator', 'Clothes Drying Cost Calculator', 'Drying Rack Capacity Calculator',
  'Laundry Basket Capacity Calculator', 'Clothing Care Label Guide', 'Fabric Shrinkage Estimator',
  'Fabric Weight Calculator', 'Washing Machine Cycle Cost Calculator', 'Laundry Day Planner',
  'Delicate Clothing Care Planner', 'White Clothes Care Guide', 'Dark Clothes Care Guide',
  'Bedding Wash Schedule', 'Towel Wash Schedule', 'Curtain Wash Schedule', 'Shoe Cleaning Schedule',
  'Laundry Room Organization Planner',
  // Kitchen
  'Kitchen Storage Capacity Calculator', 'Refrigerator Storage Planner', 'Freezer Storage Planner',
  'Freezer Space Calculator', 'Food Container Size Calculator', 'Meal Prep Time Planner',
  'Meal Prep Portion Planner', 'Batch Cooking Planner', 'Leftover Portion Calculator',
  'Food Waste Tracker', 'Food Waste Cost Calculator', 'Cooking Gas Cost Calculator',
  'Kitchen Electricity Cost Calculator', 'Refrigerator Food Storage Guide', 'Freezer Food Storage Guide',
  'Food Safety Storage Timer', 'Thawing Time Calculator', 'Room Temperature Food Safety Timer',
  'Kitchen Inventory Organizer', 'Pantry Meal Planner', 'Recipe Nutrition Label Generator',
  'Recipe Ingredient Percentage Calculator', 'Baking Ingredient Ratio Calculator', 'Dough Portion Calculator',
  'Baking Yield Calculator',
  // Grocery
  'Grocery Budget by Category', 'Grocery Spending Tracker', 'Grocery Price History Tracker',
  'Grocery Price Increase Calculator', 'Grocery Basket Cost Calculator', 'Grocery List by Meal Plan',
  'Grocery List by Household Size', 'Grocery Quantity by Family Size', 'Monthly Grocery Forecast',
  'Grocery Stock Level Tracker', 'Grocery Restock Reminder', 'Grocery Purchase Frequency Planner',
  'Grocery Waste Tracker', 'Grocery Savings Tracker', 'Grocery Budget Remaining Calculator',
  'Shopping Trip Cost Estimator', 'Grocery Receipt Splitter', 'Grocery Receipt Organizer',
  'Grocery Price Change Calculator', 'Pantry-to-Grocery List Generator',
  // Budget
  'Household Income Allocation Calculator', 'Monthly Cash Flow Calculator', 'Household Spending Breakdown',
  'Expense Category Analyzer', 'Fixed vs Variable Expense Calculator', 'Household Debt Planner',
  'Debt Payoff Timeline', 'Debt-to-Income Calculator', 'Bill Due Date Planner', 'Bill Payment Calendar',
  'Bill Payment Priority Planner', 'Annual Household Budget', 'Family Financial Goal Tracker',
  'Savings Rate Calculator', 'Monthly Savings Target', 'Unexpected Expense Planner',
  'Emergency Expense Impact Calculator', 'Subscription Audit Tool', 'Recurring Expense Calculator',
  'Household Financial Snapshot', 'Expense Trend Analyzer', 'Budget Variance Calculator',
  'Monthly Spending Limit Calculator', 'No-Spend Day Tracker',
  // Electricity
  'Appliance Wattage Finder', 'Home Electricity Load Calculator', 'Total Appliance Load Calculator',
  'Peak Load Calculator', 'Daily Energy Consumption Calculator', 'Monthly kWh Forecast',
  'Electricity Tariff Calculator', 'Peak vs Off-Peak Cost Calculator', 'Appliance Energy Comparison',
  'Energy Usage Comparison', 'LED vs Incandescent Savings', 'LED vs CFL Savings',
  'AC Temperature Cost Estimator', 'AC Energy Efficiency Calculator', 'Refrigerator Energy Comparison',
  'Washing Machine Energy Comparison', 'Iron Energy Cost Comparison', 'Standby Energy Usage Calculator',
  'Energy Usage Reduction Planner', 'Home Energy Audit', 'Appliance Energy Budget',
  'Monthly Energy Target Calculator',
  // Utilities
  'Household Water Budget', 'Water Usage by Person Calculator', 'Monthly Water Forecast',
  'Water Waste Calculator', 'Leak Cost Estimator', 'Faucet Water Usage Calculator',
  'Toilet Water Usage Calculator', 'Toilet Flush Cost Calculator', 'Bathtub Water Usage Calculator',
  'Garden Water Usage Calculator', 'Water Conservation Calculator', 'Rainwater Collection Calculator',
  'Rainwater Tank Size Calculator', 'Rainwater Harvesting Estimate', 'Gas Appliance Cost Calculator',
  'Monthly Gas Usage Forecast', 'Gas Cylinder Usage Estimator', 'LPG Cylinder Duration Calculator',
  'Internet Data Usage Calculator', 'Household Internet Cost Splitter', 'Utility Consumption Comparison',
  'Utility Budget Forecast',
  // Home Planning
  'Room Furniture Capacity Planner', 'Room Walking Space Calculator', 'Furniture Arrangement Planner',
  'Bed Placement Planner', 'Sofa Placement Planner', 'Dining Table Space Planner',
  'TV Viewing Distance Calculator', 'Desk Space Planner', 'Home Office Space Calculator',
  'Bedroom Storage Planner', 'Kitchen Storage Planner', 'Bathroom Storage Planner',
  'Closet Capacity Calculator', 'Drawer Capacity Calculator', 'Cabinet Storage Calculator',
  'Room Lighting Calculator', 'Light Fixture Spacing Calculator', 'Room Decor Budget Calculator',
  'Room Renovation Budget Planner', 'Home Space Utilization Calculator', 'Furniture Buying Checklist',
  'Room Setup Checklist',
  // DIY
  'DIY Material Quantity Estimator', 'DIY Project Time Estimator', 'DIY Project Budget Planner',
  'Wood Project Material Calculator', 'Wood Board Feet Calculator', 'Wood Cutting List Generator',
  'Plywood Sheet Calculator', 'MDF Sheet Calculator', 'Paint Mixing Ratio Calculator',
  'Concrete Mix Ratio Calculator', 'Concrete Volume Estimator', 'Brick Wall Quantity Calculator',
  'Wall Repair Material Calculator', 'Drywall Material Calculator', 'Plaster Quantity Calculator',
  'Grout Coverage Calculator', 'Adhesive Coverage Calculator', 'Screw Quantity Estimator',
  'DIY Tool Checklist', 'DIY Project Planner', 'DIY Material Cost Tracker', 'DIY Project Progress Tracker',
  // Maintenance
  'Home Maintenance Cost Forecast', 'Appliance Maintenance Cost Tracker', 'Maintenance Due Date Calculator',
  'Maintenance Frequency Planner', 'Appliance Service Reminder', 'AC Filter Replacement Reminder',
  'Water Filter Replacement Reminder', 'Geyser Service Reminder', 'Refrigerator Service Reminder',
  'Washing Machine Service Reminder', 'Plumbing Inspection Planner', 'Electrical Inspection Planner',
  'Roof Maintenance Planner', 'Gutter Cleaning Reminder', 'Door and Window Maintenance Planner',
  'Home Maintenance Log', 'Repair History Tracker', 'Appliance Service History',
  'Home Warranty Expiry Tracker', 'Warranty Claim Checklist', 'Replacement vs Repair Calculator',
  'Appliance Replacement Cost Planner',
  // Gardening
  'Garden Water Requirement Calculator', 'Plant Watering Frequency Calculator', 'Garden Irrigation Planner',
  'Drip Irrigation Calculator', 'Irrigation Pipe Length Calculator', 'Garden Fertilizer Schedule',
  'Fertilizer Cost Calculator', 'Soil pH Guide', 'Soil Amendment Calculator',
  'Compost-to-Soil Ratio Calculator', 'Garden Bed Spacing Planner', 'Plant Population Calculator',
  'Container Plant Spacing Calculator', 'Pot Size Selector', 'Indoor Plant Light Guide',
  'Garden Sunlight Planner', 'Garden Harvest Planner', 'Seed Starting Calendar',
  'Planting Calendar', 'Garden Budget Calculator', 'Garden Supply Inventory',
  'Garden Maintenance Checklist', 'Lawn Mowing Schedule', 'Lawn Watering Planner',
  // Pets
  'Pet Age Calculator', 'Pet Feeding Schedule', 'Pet Food Portion Calculator',
  'Pet Food Cost Calculator', 'Pet Treat Budget Calculator', 'Pet Weight Tracker',
  'Pet Growth Tracker', 'Pet Exercise Planner', 'Dog Walking Schedule', 'Cat Care Schedule',
  'Pet Grooming Planner', 'Pet Bathing Schedule', 'Pet Nail Trimming Reminder',
  'Pet Dental Care Reminder', 'Pet Vaccination Schedule', 'Pet Deworming Reminder',
  'Pet Medication Schedule', 'Pet Vet Visit Planner', 'Pet Medical Record',
  'Pet Expense Tracker', 'Pet Insurance Cost Tracker', 'Pet Emergency Checklist',
  'New Pet Preparation Checklist', 'Puppy Preparation Checklist', 'Kitten Preparation Checklist',
  'Pet Travel Checklist', 'Pet Boarding Checklist', 'Pet Sitter Instructions Generator',
  'Pet Care Routine Planner', 'Pet Supplies Checklist',
  // Family
  'Family Calendar', 'Family Schedule Planner', 'Family Appointment Planner',
  'Family Task Manager', 'Family Responsibility Planner', 'Family Chore Assignment',
  'Chore Points Calculator', 'Kids Chore Reward Planner', 'Family Meal Schedule',
  'Family Activity Planner', 'Family Event Planner', 'Birthday Budget Planner',
  'Birthday Guest Planner', 'Party Planning Checklist', 'Family Travel Checklist',
  'Family Packing List', 'School Routine Planner', 'Family Morning Routine',
  'Family Evening Routine', 'Kids Daily Routine Planner', 'Screen Time Planner',
  'Family Screen Time Tracker', 'Family Emergency Contact Sheet', 'Family Document Organizer',
  'Household Responsibility Matrix',
  // Moving
  'Moving Cost Calculator', 'Moving Truck Size Calculator', 'Moving Box Quantity Calculator',
  'Moving Box Size Planner', 'Packing Time Calculator', 'Packing Progress Tracker',
  'Room-by-Room Packing Planner', 'Moving Inventory Generator', 'Moving Inventory Value Calculator',
  'Moving Budget Planner', 'Moving Day Timeline', 'Moving Day Checklist',
  'Address Change Checklist', 'Utility Transfer Checklist', 'New Home Setup Planner',
  'First Night Home Checklist', 'First Week Home Checklist', 'New Home Essentials Checklist',
  'New Apartment Checklist', 'Rental Move-In Checklist', 'Rental Move-Out Checklist',
  'Security Deposit Checklist', 'Home Decluttering Planner', 'Donation Value Tracker',
  'Storage Unit Size Calculator', 'Storage Cost Calculator', 'Box Label Generator',
  'Moving Box Label Maker', 'Room Label Generator', 'Unpacking Planner',
  // Safety
  'Home Emergency Checklist', 'Emergency Contact Sheet', 'Family Emergency Plan',
  'Emergency Kit Checklist', 'First Aid Kit Checklist', 'Power Outage Checklist',
  'Severe Weather Preparedness Checklist', 'Home Evacuation Checklist', 'Fire Escape Plan',
  'Fire Safety Checklist', 'Smoke Alarm Replacement Tracker', 'Smoke Alarm Testing Reminder',
  'Carbon Monoxide Detector Reminder', 'Emergency Lighting Checklist', 'Emergency Water Storage Calculator',
  'Emergency Food Supply Calculator', 'Emergency Supply Budget Calculator', 'Home Safety Inspection Checklist',
  'Child Home Safety Checklist', 'Elderly Home Safety Checklist', 'Pet Safety Checklist',
  'Emergency Document Checklist', 'Important Documents Inventory', 'Emergency Contact Card Generator',
  'Home Insurance Inventory Checklist', 'Home Inventory for Insurance', 'Disaster Recovery Checklist',
  'Emergency Communication Plan', 'Utility Emergency Contact List', 'Emergency Preparedness Scorecard'
];

console.log('Total requested tools count:', requestedTools.length);

const seen = new Map();
const dups = [];
requestedTools.forEach((name) => {
  const s = slugify(name);
  if (seen.has(s)) {
    dups.push({ slug: s, name, previous: seen.get(s) });
  } else {
    seen.set(s, name);
  }
});

console.log('Duplicate slugs within requested tools:', dups.length);
dups.forEach(d => console.log(' -', d.slug, `("${d.name}" vs "${d.previous}")`));
