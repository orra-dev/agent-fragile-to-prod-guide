# Stage 2: Implementing Compensation for Reliable Transactions

In this stage, we address the critical issue of transaction integrity in our marketplace assistant by implementing compensation handlers for critical operations.

## The Problem: Inconsistent State

Our Stage 2 application had a significant flaw:

1. When purchasing an item, inventory was reserved (stock reduced) BEFORE payment processing
2. If the payment failed, the inventory remained reduced, creating an inconsistent state
3. Products appeared out of stock even though they were never purchased
4. This required manual intervention to fix the inventory

This issue is common in distributed systems and demonstrates the need for proper transaction handling.

## What Changed

We've implemented compensation handlers for critical operations:

**Purchasing Payment Failure Compensation**: If a payment fails during purchasing, we automatically restore inventory

## Benefits

1. **Consistent State**: The system maintains data consistency even when operations fail
2. **Automatic Recovery**: No manual intervention needed to fix data issues
3. **Increased Reliability**: Users can trust that products won't disappear incorrectly
4. **Better User Experience**: Clear communication when issues arise
5. **Audit Trail**: Complete history of operations and compensations

## How orra Helps

- **Compensation Framework**: orra provides built-in support for defining compensation handlers
- **Automatic Triggering**: Compensation is automatically triggered when operations fail
- **Orchestration**: orra manages the complex flow of operations and compensations

## Implementation Details

### Compensation Handler Definition

Example inventory release compensation:

```javascript
// Register compensation handler for inventory reservation
inventoryService.onRevert(async (task, result) => {
   // Only process compensations for reserveProduct actions
   if (task.input.action === 'reserveProduct' && result.success) {
      // Compensation logic: release the product that was reserved
      const releaseResult = releaseProduct(result.productId, 1);
      console.log('Inventory compensation completed:', releaseResult);
   }
});
```

### Transaction Flow with Compensation

1. **Begin Transaction**: orra starts tracking a transaction
2. **Register Operations**: Each operation registers potential compensation
3. **Execute Operations**: Normal flow proceeds
4. **Handle Failures**: If an operation fails, orra automatically:
    - Stops forward progress
    - Executes compensation handlers in reverse order
    - Records the compensation actions
    - Notifies appropriate services/agents

## Next Steps

While our system is now more reliable with compensation handlers, it can still allow agents to perform operations outside our business domain constraints. In Stage 4, we'll implement domain guardrails to prevent hallucinations and enforce business rules.
