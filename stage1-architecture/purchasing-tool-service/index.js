/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import express from 'express';
import { initService } from '@orra.dev/sdk';
import dotenv from 'dotenv';
import schema from './schema.json' assert { type: 'json' };
import { purchaseProduct } from './svc.js';

dotenv.config();

const app = express();
const port = process.env.PAYMENT_SERVICE_PORT || 3003;

// Initialize the Orra service
const purchaseService = initService({
  name: 'purchase-service',
  orraUrl: process.env.ORRA_URL,
  orraKey: process.env.ORRA_API_KEY,
  persistenceOpts: {
    method: 'file',
    filePath: './.orra-data/purchase-service-key.json'
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

async function startService() {
  try {
    // Register service with Orra
    await purchaseService.register({
      description: 'A service that makes marketplace product purchases on behalf of a user. It creates purchase orders that include shipping details, makes payments against external payment gateways and notifies users.',
      schema
    });
    
    // Start handling tasks
    purchaseService.start(async (task) => {
      console.log('Processing purchase task:', task.id);
      console.log('Input:', task.input);
      
      const { productId, userId, deliveryEstimate } = task.input;
      
      // Process the purchase order
      const result = purchaseProduct(userId, productId, deliveryEstimate);
      // FEATURE COMING SOON:
      // if (result.status !== 'success') {
      //   return task.abort(result);
      // }
      return result;
    });
    
    console.log('Payment Service started successfully');
  } catch (error) {
    console.error('Failed to start Payment Service:', error);
    process.exit(1);
  }
}

// Start the Express server and the service
app.listen(port, () => {
  console.log(`Payment Service listening on port ${port}`);
  startService().catch(console.error);
});
