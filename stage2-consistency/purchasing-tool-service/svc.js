import { JSONFilePreset } from "lowdb/node";
import * as path from "node:path";

const db = await JSONFilePreset(path.join("..", "data.json"), { users: [], products: [] });

export const supportedStatuses = [
	'unknown-product',
	'unknown-user',
	'payment-failed',
	'order-processed'
];

export async function purchaseProduct(userId, productId, deliveryDate) {
	// Get the user and product
	const user = db.data.users.find(u => u.id === userId);
	const product = db.data.products.find(p => p.id === productId);
	
	console.log('Found user:', user);
	console.log('Found product:', product);
	
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
	
	const transactionId = processPayment(userId, productId, product.price);
	
	
	// Create the order
	const order = {
		id: `order-${Date.now()}`,
		userId,
		productId,
		productName: product.name,
		price: product.price,
		transactionId: transactionId,
		status: supportedStatuses[3],
		createdAt: new Date().toISOString(),
		deliveryDate: deliveryDate
	};
	
	// Add to orders
	db.data.orders.push(order);
	await db.write()
	
	// Send notification
	sendNotification(userId, `Your order for ${product.name} has been confirmed! Estimated delivery: ${deliveryDate}`);
	
	return {
		success: true,
		order
	};
}

// Payment processing function
function processPayment() {
	throw new Error('PaymentGatewayDown');
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
