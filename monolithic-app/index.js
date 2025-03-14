import dotenv from 'dotenv';
import readline from 'readline-sync';
import OpenAI from 'openai';
import { JSONFilePreset } from "lowdb/node";
import * as path from "node:path";

dotenv.config();

const db = await JSONFilePreset(path.join("data.json"), { products: [], users: [] });

// Simulated delivery estimation
function estimateDelivery(warehouseAddress, userAddress) {
  console.log(`estimating delivery from warehouse [${warehouseAddress}] to user address [${userAddress}]`);
  
  // In a real application, this would make external API calls to shipping providers
  const baseDeliveryDays = 3;
  const randomAddition = Math.floor(Math.random() * 4); // 0-3 additional days
  const estimatedDays = baseDeliveryDays + randomAddition;
  
  const today = new Date();
  const deliveryDate = new Date(today);
  deliveryDate.setDate(today.getDate() + estimatedDays);
  
  return {
    estimatedDays,
    deliveryDate: deliveryDate.toISOString().split('T')[0]
  };
}

// Simulated payment processing
function processPayment(userId, productId, amount) {
  // In a real application, this would call a payment gateway
  console.log(`Processing payment of ${amount} for product ${productId} by user ${userId}`);
  
  // Simulate more frequent payment failures (50% chance) to demonstrate the inconsistency problem
  const failureChance = Math.random();
  if (failureChance < 0.5) {
    console.log("Payment failed!");
    return {
      success: false,
      message: "Payment processing failed. Please try again."
    };
  }
  
  return {
    success: true,
    transactionId: `trans-${Date.now()}`,
    timestamp: new Date().toISOString()
  };
}

// Simulated notification
function sendNotification(userId, message) {
  // In a real application, this would send an email or push notification
  console.log(`Notification to user ${userId}: ${message}`);
  return {
    success: true,
    timestamp: new Date().toISOString()
  };
}

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Define available functions
const availableFunctions = {
  searchProducts: (args) => {
    const { category, priceMax, tags, condition } = args;
    
    let filteredProducts = [...db.data.products];
    
    if (category) {
      filteredProducts = filteredProducts.filter(p => p.category === category);
    }
    
    if (priceMax) {
      filteredProducts = filteredProducts.filter(p => p.price <= priceMax);
    }
    
    if (tags && tags.length > 0) {
      filteredProducts = filteredProducts.filter(p => 
        tags.some(tag => p.tags.includes(tag))
      );
    }
    
    if (condition) {
      filteredProducts = filteredProducts.filter(p => p.condition === condition);
    }
    
    return filteredProducts;
  },
  
  checkProductAvailability: (args) => {
    const { productId } = args;
    const product = db.data.products.find(p => p.id === productId);
    
    if (!product) {
      return {
        available: false,
        message: "Product not found"
      };
    }
    
    return {
      available: product.inStock > 0,
      inStock: product.inStock,
      product: product
    };
  },
  
  processPurchase: (args) => {
    const { productId, userId } = args;
    
    // Get the product and user
    const product = db.data.products.find(p => p.id === productId);
    const user = db.data. users.find(u => u.id === userId);
    
    if (!product || !user) {
      return {
        success: false,
        message: "Product or user not found"
      };
    }
    
    if (product.inStock <= 0) {
      return {
        success: false,
        message: "Product is out of stock"
      };
    }
    
    // CRITICAL ISSUE: Reserve the product BEFORE payment processing
    // This creates the potential for inconsistent state
    console.log(`Reserving product ${product.name} (inventory reduced from ${product.inStock} to ${product.inStock - 1})`);
    product.inStock -= 1;
    
    // Process the payment
    // In a real application, this would call a payment gateway which leads to an asynchronous flow.
    // Typically, a webhook has to be setup to accept the final payment state.
    const paymentResult = processPayment(userId, productId, product.price);
    if (!paymentResult.success) {
      // CRITICAL ISSUE: The payment failed, but we've already reserved the product!
      // In a monolithic system without compensation handling, this creates an inconsistent state
      console.log(`INCONSISTENT STATE: Product ${product.id} is reserved but payment failed!`);
      console.log(`This would require manual intervention to fix the inventory.`);
      // We don't restore inventory here, demonstrating the problem
      
      return {
        success: false,
        message: paymentResult.message
      };
    }
    
    // Estimate delivery
    const deliveryEstimate = estimateDelivery(productId, user.address);
    
    // Create the order
    const order = {
      id: `order-${Date.now()}`,
      userId,
      productId,
      productName: product.name,
      price: product.price,
      transactionId: paymentResult.transactionId,
      createdAt: new Date().toISOString(),
      deliveryEstimate
    };
    
    // Add to orders
    db?.data?.orders?.push(order);
    
    // Send notification
    sendNotification(userId, `Your order for ${product.name} has been confirmed! Estimated delivery: ${deliveryEstimate.deliveryDate}`);
    
    return {
      success: true,
      order
    };
  },
  
  getDeliveryEstimate: (args) => {
    const { productId, userId } = args;
    
    const product = db.data.products.find(p => p.id === productId);
    const user = db.data.users.find(u => u.id === userId);
    
    if (!product || !user) {
      return {
        success: false,
        message: "Product or user not found"
      };
    }
    
    return {
      success: true,
      estimate: estimateDelivery(productId, user.address)
    };
  }
};

// Define function specs for the OpenAI API
const functionSpecs = [
  {
    name: "searchProducts",
    description: "Search for products based on criteria",
    parameters: {
      type: "object",
      properties: {
        category: {
          type: "string",
          description: "Product category (e.g., 'laptops')"
        },
        priceMax: {
          type: "number",
          description: "Maximum price"
        },
        tags: {
          type: "array",
          items: {
            type: "string"
          },
          description: "Tags to filter by (e.g., ['programming', 'college'])"
        },
        condition: {
          type: "string",
          description: "Product condition ('excellent', 'good', 'fair')"
        }
      }
    }
  },
  {
    name: "checkProductAvailability",
    description: "Check if a product is available",
    parameters: {
      type: "object",
      properties: {
        productId: {
          type: "string",
          description: "ID of the product to check"
        }
      },
      required: ["productId"]
    }
  },
  {
    name: "processPurchase",
    description: "Process a purchase for a product",
    parameters: {
      type: "object",
      properties: {
        productId: {
          type: "string",
          description: "ID of the product to purchase"
        },
        userId: {
          type: "string",
          description: "ID of the user making the purchase"
        }
      },
      required: ["productId", "userId"]
    }
  },
  {
    name: "getDeliveryEstimate",
    description: "Get delivery estimate for a product",
    parameters: {
      type: "object",
      properties: {
        productId: {
          type: "string",
          description: "ID of the product"
        },
        userId: {
          type: "string",
          description: "ID of the user for delivery address"
        }
      },
      required: ["productId", "userId"]
    }
  }
];

// Enhanced assistant function with function calling
async function marketplaceAssistant(userInput, conversationHistory = []) {
  try {
    // Add the user input to the conversation history
    conversationHistory.push({ role: "user", content: userInput });
    
    // Define the system message
    const systemMessage = {
      role: "system",
      content: `You are an AI marketplace assistant helping users find, purchase, and arrange delivery for products.
      
      Always be helpful, concise, and provide specific product recommendations that match user criteria.
      
      The current user is John Doe (user-1). When processing purchases or checking delivery estimates, 
      always use this user ID unless otherwise specified.
      
      If the user expresses a clear intent to purchase, use the processPurchase function directly.
      If the user wants to know about delivery times, use the getDeliveryEstimate function.`
    };
    
    // Create the messages array for the API call
    const messages = [systemMessage, ...conversationHistory];
    
    // Step 1: Call OpenAI API with function definitions
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: messages,
      functions: functionSpecs,
      function_call: "auto",
      temperature: 0.7,
    });
    
    const responseMessage = response.choices[0].message;
    
    // Step 2: Check if the model wants to call a function
    if (responseMessage.function_call) {
      const functionName = responseMessage.function_call.name;
      const functionArgs = JSON.parse(responseMessage.function_call.arguments);
      
      console.log(`\nCalling function: ${functionName} with args:`, functionArgs);
      
      // Call the function
      const functionResponse = availableFunctions[functionName](functionArgs);
      
      // Step 3: Append function response to messages
      conversationHistory.push(responseMessage); // Add assistant's function call to history
      
      // Add the function response to chat history
      conversationHistory.push({
        role: "function",
        name: functionName,
        content: JSON.stringify(functionResponse)
      });
      
      // Step 4: Get a new response from the model with the function response
      const secondResponse = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [...messages, responseMessage, {
          role: "function",
          name: functionName,
          content: JSON.stringify(functionResponse)
        }],
        functions: functionSpecs,
        function_call: "auto",
        temperature: 0.7,
      });
      
      const secondResponseMessage = secondResponse.choices[0].message;
      
      // Handle nested function calls if needed
      if (secondResponseMessage.function_call) {
        const secondFunctionName = secondResponseMessage.function_call.name;
        const secondFunctionArgs = JSON.parse(secondResponseMessage.function_call.arguments);
        
        console.log(`\nCalling second function: ${secondFunctionName} with args:`, secondFunctionArgs);
        
        const secondFunctionResponse = availableFunctions[secondFunctionName](secondFunctionArgs);
        
        conversationHistory.push(secondResponseMessage);
        
        conversationHistory.push({
          role: "function",
          name: secondFunctionName,
          content: JSON.stringify(secondFunctionResponse)
        });
        
        // Get final response from the model
        const finalResponse = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [...messages, responseMessage, {
            role: "function",
            name: functionName,
            content: JSON.stringify(functionResponse)
          }, secondResponseMessage, {
            role: "function",
            name: secondFunctionName,
            content: JSON.stringify(secondFunctionResponse)
          }],
          temperature: 0.7,
        });
        
        const finalResponseMessage = finalResponse.choices[0].message;
        conversationHistory.push(finalResponseMessage);
        
        return {
          response: finalResponseMessage.content,
          conversationHistory
        };
      }
      
      conversationHistory.push(secondResponseMessage);
      
      return {
        response: secondResponseMessage.content,
        conversationHistory
      };
    }
    
    // If no function call, just return the response
    conversationHistory.push(responseMessage);
    
    return {
      response: responseMessage.content,
      conversationHistory
    };
  } catch (error) {
    console.error("Error in marketplace assistant:", error);
    return {
      response: "I'm sorry, I encountered an error while processing your request. Please try again.",
      conversationHistory
    };
  }
}

// Simple CLI interface
// Function to display current inventory status
function showInventoryStatus() {
  console.log("\n----- CURRENT INVENTORY STATUS -----");
  db.data.products.forEach(product => {
    console.log(`${product.name}: ${product.inStock} in stock`);
  });
  console.log("------------------------------------\n");
}

async function runCLI() {
  console.log("Welcome to the Marketplace Assistant!");
  console.log("Ask about products, availability, or make a purchase.");
  console.log("-----------------------------------------------------------------");
  console.log("Example queries:");
  console.log("- I need a laptop for programming under $800");
  console.log("- Is the Dell XPS 13 in stock?");
  console.log("- I'd like to buy the Dell XPS 13");
  console.log("- When would the MacBook Air be delivered?");
  console.log("Special commands:");
  console.log("- 'status' - Show current inventory status");
  console.log("- 'exit' - Quit the application");
  console.log("-----------------------------------------------------------------");
  
  let conversationHistory = [];
  let running = true;
  
  // Display initial inventory
  showInventoryStatus();
  
  while (running) {
    const userInput = readline.question("\nYou: ");
    
    if (userInput.toLowerCase() === 'exit') {
      running = false;
      continue;
    }
    
    if (userInput.toLowerCase() === 'status') {
      showInventoryStatus();
      continue;
    }
    
    console.log("\nAssistant is thinking...");
    const result = await marketplaceAssistant(userInput, conversationHistory);
    conversationHistory = result.conversationHistory;
    
    console.log(`\nAssistant: ${result.response}`);
    
    // After each interaction that might modify inventory, show the status
    if (userInput.toLowerCase().includes("buy") || 
        userInput.toLowerCase().includes("purchase") ||
        result.response.toLowerCase().includes("payment")) {
      showInventoryStatus();
    }
  }
  
  console.log("\nThank you for using the Marketplace Assistant!");
}

// Start the CLI
runCLI().catch(console.error);
