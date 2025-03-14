import express from 'express';
import { initAgent } from '@orra.dev/sdk';
import dotenv from 'dotenv';
import schema from './schema.json' assert { type: 'json' };
import { recommendProduct } from "./agent.js";

dotenv.config();

const app = express();
const port = process.env.PRODUCT_ADVISOR_PORT || 3001;

// Initialize the orra agent
const productAdvisor = initAgent({
  name: 'product-advisor',
  orraUrl: process.env.ORRA_URL,
  orraKey: process.env.ORRA_API_KEY,
  persistenceOpts: {
    method: 'file',
    filePath: './.orra-data/product-advisor-key.json'
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// Function to generate product recommendations using LLM


async function startService() {
  try {
    // Register agent with orra
    await productAdvisor.register({
      description: 'An agent that helps users find products based on their needs and preferences.',
      schema
    });
    
    // Start handling tasks
    productAdvisor.start(async (task) => {
      console.log('Processing product advisory task:', task.id);
      console.log('Input:', task.input);
      
      const { query } = task.input;
      
      // Use LLM to generate recommendations
      return await recommendProduct(query);
    });
    
    console.log('Product Advisor agent started successfully');
  } catch (error) {
    console.error('Failed to start Product Advisor agent:', error);
    process.exit(1);
  }
}

// Start the Express server and the agent
app.listen(port, () => {
  console.log(`Product Advisor listening on port ${port}`);
  startService().catch(console.error);
});
