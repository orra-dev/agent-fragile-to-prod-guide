/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this
 *  file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { JSONFilePreset } from "lowdb/node";
import * as path from "node:path";

export const supportedStatuses = [
	'unknown-product',
	'product-available',
	'product-out-of-stock',
	'product-reserved',
	'product-released'
]

const db = await JSONFilePreset(path.join("..", "data.json"), { products: [] });

export async function execInventory(action, productId) {
	switch (action) {
		case 'checkAvailability':
			return checkAvailability(productId);
		case 'reserveProduct':
			return await reserveProduct(productId);
		case 'releaseProduct':
			return releaseProduct(productId);
		default:
			throw new Error(`Unknown action: ${action}`);
	}
}

// Service functions
function checkAvailability(productId) {
	const product = db.data.products.find(p => p.id === productId);
	
	if (!product) {
		return {
			action: "checkAvailability",
			productId,
			status: supportedStatuses[0],
			success: false,
			inStock: 0,
			message: "Product not found"
		};
	}
	
	return {
		action: "checkAvailability",
		productId,
		status: product.inStock > 0 ? supportedStatuses[1] : supportedStatuses[2],
		success: true,
		inStock: product.inStock,
		message: "Product in stock"
	};
}

async function reserveProduct(productId, quantity = 1) {
	const product = db.data.products.find(p => p.id === productId);
	
	if (!product) {
		return {
			action: "reserveProduct",
			productId,
			status: supportedStatuses[0],
			success: false,
			inStock: 0,
			message: "Product not found"
		};
	}
	
	if (product.inStock < quantity) {
		return {
			action: "reserveProduct",
			productId,
			status: supportedStatuses[2],
			success: false,
			inStock: product.inStock,
			message: `Insufficient stock. Requested: ${quantity}, Available: ${product.inStock}`
		};
	}
	
	// Reserve the product
	product.inStock -= quantity;
	await db.write()
	
	return {
		action: "reserveProduct",
		productId,
		status: supportedStatuses[3],
		success: true,
		inStock: product.inStock,
		message: `Successfully reserved ${quantity} units of ${product.name}`
	};
}

async function releaseProduct(productId, quantity = 1) {
	const product = db.data.products.find(p => p.id === productId);
	
	if (!product) {
		return {
			action: "releaseProduct",
			productId,
			status: supportedStatuses[0],
			success: false,
			inStock: 0,
			message: "Product not found"
		};
	}
	
	// Release the reservation
	product.inStock += quantity;
	await db.write()
	
	console.log(`Released ${quantity} units of ${product.name}. New stock: ${product.inStock}`);
	
	return {
		action: "releaseProduct",
		productId,
		status: supportedStatuses[4],
		success: true,
		inStock: product.inStock,
		message: `Successfully released ${quantity} units of ${product.name}`
	};
}
