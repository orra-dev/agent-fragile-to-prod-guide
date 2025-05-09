import express from 'express';
import { initService } from '@orra.dev/sdk';
import dotenv from 'dotenv';
import schema from './schema.json' assert { type: 'json' };
import { execInventory, releaseProduct } from "./svc.js";

dotenv.config();

const app = express();
const port = process.env.INVENTORY_SERVICE_PORT || 3002;

// Initialize the orra service
const inventoryService = initService({
  name: 'inventory-service',
  orraUrl: process.env.ORRA_URL,
  orraKey: process.env.ORRA_API_KEY,
  persistenceOpts: {
    method: 'file',
    filePath: './.orra-data/inventory-service-key.json'
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

async function startService() {
  try {
    // Register service with orra
    await inventoryService.register({
      description: `A service that manages product inventory, checks availability and reserves products.
Supported actions: checkAvailability (gets product status), reserveProduct (reduces inventory), and releaseProduct (returns inventory).`,
      schema,
      revertible: true // Enable compensations
    });
    
    // Register compensation handler
    inventoryService.onRevert(async (task, result) => {
      // Only process compensations for reserveProduct actions
      if (task.input.action === 'reserveProduct' && result.success) {
        console.log('Reverting inventory product for task:', task.id);
        console.log('Reverting inventory product hold for product:', result.productId);

        // Compensation logic: release the product that was reserved
        const releaseResult = releaseProduct(result.productId, 1);
        console.log('Inventory compensation completed:', JSON.stringify(releaseResult));
      }
    });
    
    // Start handling tasks
    inventoryService.start(async (task) => {
      console.log('Processing inventory task:', task.id);
      console.log('Input:', task.input);
      
      const { action, productId } = task.input;
      const result = await execInventory(action, productId);
      
      // FEATURE COMING SOON:
      // if (result.status !== 'success') {
      //   return task.abort(result);
      // }
      
      return result;
    });
    
    console.log('Inventory Service started successfully');
  } catch (error) {
    console.error('Failed to start Inventory Service:', error);
    process.exit(1);
  }
}

// Start the Express server and the service
app.listen(port, () => {
  console.log(`Inventory Service listening on port ${port}`);
  startService().catch(console.error);
});
