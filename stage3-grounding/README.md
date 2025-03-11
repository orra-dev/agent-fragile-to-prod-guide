# Stage 3: Adding Domain Grounding to Prevent Plan Hallucination

In this stage, we address the challenge of LLM plan hallucinations by implementing domain grounding.

## The Problem: Plan Engine Hallucinations

Even with reliable compensation mechanisms, LLM-powered plan engines can still:

1. Hallucinate execution plans with non-existent services or capabilities
2. Generate plans that don't match the user's actual intent
3. Create invalid action sequences that can't be executed properly
4. Make incorrect assumptions about service capabilities
5. Design plans that require impossible state transitions

## What Changed

We've implemented domain grounding for our marketplace assistant:

1. **Use Case Definitions**: Clearly defined use cases of actions and the expected capabilities they require
2. **Semantic Verification**: The planning system ensures all actions align with real capabilities
3. **PDDL Validation**: Execution plans are formally validated before execution

## Domain Grounding Definition

```yaml
# Domain grounding definition
name: "marketplace-assistant"
domain: "ecommerce"
version: "1.0"

use-cases:
  - action: "Find products matching {criteria}"
    params:
      criteria: "laptop under $1000"
    capabilities: 
      - "Product search"
      - "Product filtering"
    intent: "Customer wants to find products matching specific criteria"

  - action: "Purchase product {productId}"
    params:
      productId: "laptop-1"
      userId: "user-1"
    capabilities:
      - "Inventory verification"
      - "Payment processing"
      - "Delivery scheduling"
    intent: "Customer wants to purchase a specific product"

  - action: "Check delivery status for {orderId}"
    params:
      orderId: "ORD123"
    capabilities:
      - "Order tracking"
      - "Delivery estimation"
    intent: "Customer wants to know when their order will arrive"

constraints:
  - "Verify product availability before processing payment"
  - "Confirm user intent before finalizing purchase"
  - "Provide delivery estimates based on inventory location"
```

## Benefits

1. **Reduced Plan Hallucinations**: The plan engine cannot generate invalid execution plans
2. **Stronger Reliability**: All plans are grounded in real service capabilities
3. **Consistent Execution**: Plans align with well-defined use cases
4. **Clear Intent Mapping**: User requests map to verified execution patterns
5. **Formal Validation**: PDDL validation ensures logical correctness of plans

## How Orra Helps

- **Plan Engine**: Validates all execution plans against domain grounding
- **Embedding-based Matching**: Intelligently maps user intents to grounded use cases
- **PDDL Validation**: Ensures plans satisfy logical constraints and capabilities

## Plan Validation Process

1. **User Request Processing**:
    - The system receives a user request
    - The request is analyzed to determine the user's intent

2. **Plan Generation**:
    - The Plan Engine generates an initial execution plan
    - The plan is based on the available services and capabilities

3. **Grounding Validation**:
    - The plan is checked against domain grounding examples
    - Both semantic matching and formal PDDL validation are performed
    - The system verifies capability requirements and execution constraints

4. **Execution or Rejection**:
    - Valid plans are executed
    - Invalid plans are rejected with an explanation

## Hallucination Prevention Example

Consider this scenario:

1. **User Request**: "I want to cancel my order and get a refund"
2. **Without Grounding**: The plan engine might hallucinate a non-existent "refund-service" in the plan
3. **With Grounding**: The plan is validated against known capabilities and rejected, with the system explaining, "I'm sorry, but our system doesn't currently support order cancellations and refunds"

## Running the Updated Application

1. Make sure Orra is running
2. Install dependencies for all components (same as previous stage)
3. Start the components (same as previous stage)
4. Start the client application

## Demonstration

The demonstration script shows:

1. A normal purchase flow (plan validated and executed)
2. An attempt at an action outside the grounded use cases (plan rejected)
3. A request that matches the grounded use cases but with invalid parameters (validation failure)

## Done

Our application is now more reliable with grounded planning!
