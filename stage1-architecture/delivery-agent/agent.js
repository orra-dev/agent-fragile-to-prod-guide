import OpenAI from "openai";
import { JSONFilePreset } from "lowdb/node";
import * as path from "node:path";

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY
});

const db = await JSONFilePreset(path.join("..", "data.json"), { products: [], users: [] });

export const supportedStatuses = [
	'unknown-product',
	'unknown-user',
	'delivery-estimated',
]

// Simulated traffic and logistics data
const trafficConditions = {
	"route_segments": [
		{
			"segment_id": "A90-ABD-DND",
			"name": "A90 Aberdeen to Dundee",
			"length_km": 108,
			"current_average_speed_kph": 95,
			"normal_average_speed_kph": 100,
			"congestion_level": "light",
			"incidents": []
		},
		{
			"segment_id": "M90-PER-EDI",
			"name": "M90 Perth to Edinburgh",
			"length_km": 45,
			"current_average_speed_kph": 110,
			"normal_average_speed_kph": 110,
			"congestion_level": "none",
			"incidents": [
				{
					"type": "roadworks",
					"location": "Junction 3",
					"description": "Lane closure for resurfacing",
					"delay_minutes": 10
				}
			]
		},
		{
			"segment_id": "A1-NCL-YRK",
			"name": "A1 Newcastle to York",
			"length_km": 140,
			"current_average_speed_kph": 100,
			"normal_average_speed_kph": 110,
			"congestion_level": "moderate",
			"incidents": [
				{
					"type": "accident",
					"location": "Near Darlington",
					"description": "Multi-vehicle collision",
					"delay_minutes": 25
				}
			]
		}
	],
	"weather_conditions": [
		{
			"location": "Northeast",
			"condition": "light_rain",
			"temperature_celsius": 12
		},
		{
			"location": "Midwest",
			"condition": "cloudy",
			"temperature_celsius": 14
		},
		{
			"location": "West Coast",
			"condition": "clear",
			"temperature_celsius": 20
		},
		{
			"location": "Southeast",
			"condition": "partly_cloudy",
			"temperature_celsius": 22
		}
	],
	"vehicles": [
		{
			"type": "van",
			"capacity_cubic_meters": 15,
			"max_range_km": 500,
			"average_speed_kph": 90,
			"availability": "high"
		},
		{
			"type": "truck",
			"capacity_cubic_meters": 40,
			"max_range_km": 800,
			"average_speed_kph": 80,
			"availability": "medium"
		}
	]
};

// Function to generate delivery estimates using LLM
export async function generateDeliveryEstimates(userId, productId) {
	const user = db.data. users.find(u => u.id === userId);
	const product = db.data.products.find(p => p.id === productId);
	
	if (!user) {
		return {
			success: false,
			status: supportedStatuses[1]
		};
	}
	
	if (!product) {
		return {
			success: false,
			status: supportedStatuses[0]
		};
	}
	
	// Use LLM to generate intelligent delivery estimates
	const systemPrompt = `You are a delivery logistics expert with 20 years of experience.
  Your task is to provide realistic delivery estimates for products being shipped from a warehouse to a customer.
  Consider all relevant factors including traffic conditions, weather, distance, and product characteristics.
  Always provide both best-case and worst-case scenarios with confidence levels.`;
	
	const userPrompt = `Create delivery estimates for the following:
  
  WAREHOUSE ADDRESS: ${product.warehouseAddress}
  CUSTOMER ADDRESS: ${user.address}
  
  Current traffic and logistics data:
  ${JSON.stringify(trafficConditions, null, 2)}
  
  Your response should include:
  1. A best-case delivery estimate (duration in hours and delivery date)
  2. A worst-case delivery estimate (duration in hours and delivery date)
  3. Confidence levels for each estimate (low/moderate/high)
  4. A brief explanation of your reasoning
  
  Respond in JSON format with these components.
  
  USE THIS SCHEMA FOR THE FINAL ANSWER:
	{
		"bestCase": {
	    "estimatedDurationHours": "expected duration as decimal value, e.g. 7.5",
	    "estimatedDeliveryDate": "estimated delivery date as a timestamp, e.g. 2024-10-02T21:15:00Z",
	    "confidenceLevel": "how confident you are. one of: low, moderate or high"
    },
    "worstCase": {
	    "estimatedDurationHours": "expected duration as decimal value, e.g. 7.5",
	    "estimatedDeliveryDate": "estimated delivery date as a timestamp, e.g. 2024-10-02T21:15:00Z",
	    "confidenceLevel": "how confident you are. one of: low, moderate or high"
    },
    "explanation": "Delivery estimate based on current traffic and weather conditions. Factors include road conditions, distance, and typical shipping times."
	}`;
	
	try {
		const response = await openai.chat.completions.create({
			model: "gpt-4o",
			messages: [
				{ role: "system", content: systemPrompt },
				{ role: "user", content: userPrompt }
			],
			response_format: { type: "json_object" }
		});
		
		const content = JSON.parse(response.choices[0].message.content);
		console.log("Generated delivery estimates:", content);
		
		const fallbackDeliveryEstimatedHours = 72
		const fallbackDeliveryDate = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString().split('T')[0]
		const fallbackExplanation = "Delivery estimate based on current traffic and weather conditions."
		
		return {
			status: supportedStatuses[2],
			success: false,
			estimatedDays: hoursToDays(content?.worstCase?.estimatedDays || fallbackDeliveryEstimatedHours),
			deliveryDate: content?.worstCase?.estimatedDeliveryDate?.split('T')[0] || fallbackDeliveryDate,
			explanation: content?.explanation || fallbackExplanation,
		};
	} catch (error) {
		console.error("Error generating delivery estimates:", error);
		throw error;
	}
}

function hoursToDays(hours) {
	if (typeof hours !== "number" || isNaN(hours)) {
		throw new Error("Please provide a valid number of hours.");
	}
	return hours / 24;
}
