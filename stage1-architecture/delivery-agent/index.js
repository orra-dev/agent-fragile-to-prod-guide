import express from 'express';
import { initAgent } from '@orra.dev/sdk';
import dotenv from 'dotenv';
import schema from './schema.json' assert { type: 'json' };
import { generateDeliveryEstimates } from "./agent.js";

dotenv.config();

const app = express();
const port = process.env.DELIVERY_AGENT_PORT || 3004;

// Initialize the Orra agent
const deliveryAgent = initAgent({
	name: 'delivery-agent',
	orraUrl: process.env.ORRA_URL,
	orraKey: process.env.ORRA_API_KEY,
	persistenceOpts: {
		method: 'file',
		filePath: './.orra-data/delivery-agent-key.json'
	}
});

// Health check endpoint
app.get('/health', (req, res) => {
	res.status(200).json({ status: 'healthy' });
});


async function startService() {
	try {
		// Register agent with Orra
		await deliveryAgent.register({
			description: 'An agent that provides intelligent delivery estimates based on product, location, and current conditions.',
			schema
		});
		
		// Start handling tasks
		deliveryAgent.start(async (task) => {
			console.log('Processing delivery estimation task:', task.id);
			console.log('Input:', task.input);
			
			const { userId, productId } = task.input;
			
			// Use LLM to generate delivery estimates
			const result = await generateDeliveryEstimates(userId, productId);
			// FEATURE COMING SOON:
			// if (result.status !== 'success') {
			//   return task.abort(result);
			// }
			return result;
		});
		
		console.log('Delivery Agent started successfully');
	} catch (error) {
		console.error('Failed to start Delivery Agent:', error);
	}
}

// Start the Express server and the agent
app.listen(port, () => {
	console.log(`Delivery Agent listening on port ${port}`);
	startService().catch(console.error);
});
