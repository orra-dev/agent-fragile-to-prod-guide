# Orra Workshop: From Fragile to Production-Ready AI Applications

This workshop demonstrates how to transform a fragile AI-powered Marketplace Assistant into a production-ready multi-agent application using Orra.

## Workshop Overview

We'll build a marketplace assistant that helps users find, purchase, and arrange delivery for products. Throughout the workshop, we'll progressively improve the application by addressing common production challenges in multi-agent AI systems.

## Workshop Progression: 3 Stages to Production Readiness

### Stage 1: Multi-Agent Architecture
- Build a distributed system with specialized agents and services
- Integrate with Orra for orchestration
- Implement efficient communication between components
- Balance LLM agents with dedicated services for optimal performance

### Stage 2: Implementing Compensation for Reliable Transactions
- Add compensation handlers for critical operations
- Ensure system consistency during failures
- Implement automatic recovery mechanisms
- Maintain data integrity through transactional workflows

### Stage 3: Domain Grounding to Prevent Plan Hallucination
- Define use cases with clear execution patterns
- Map capabilities to actual services
- Validate execution plans through PDDL
- Prevent hallucinated plans and invalid actions

## Workshop Components

Each component demonstrates Orra's capabilities:

- **Product Advisor Agent**: LLM-powered recommendation engine
- **Inventory Service**: Simulated inventory database with holds and releases
- **Delivery Agent**: Estimates delivery times based on various factors
- **Purchasing Service**: A product purchasing that creates orders, makes payments with occasional failures and notifies users

## Getting Started

1. Make sure you have Node.js installed (v18 or later)
2. Clone this repository
3. Follow the instructions in each stage's README.md file
4. Run the provided scripts to see the improvements in action

## Example User Interaction

```
  User: "I need a used laptop for college that is powerful enough for programming, under $800."

System:
- Product Advisor Agent analyzes request, understands parameters
- Inventory Service checks available options
- Product Advisor Agent recommends: "I found a Dell XPS 13 (2022) with 16GB RAM, 512GB SSD for $750."

User: "That sounds good. Can I get it delivered by next week?"

System:
- Delivery Agent calculates real-time delivery options
- "Yes, it can be delivered by Thursday. Would you like to proceed with purchase?"

User: "Yes, let's do it."

System:
- Orchestrates parallel execution:
  - Inventory Service places hold on laptop
  - Payment Service processes payment
  - Delivery Agent schedules delivery
  - Notification Service sends confirmation
```

## Workshop Structure

Each stage builds upon the previous one and includes:
- A dedicated folder with complete code
- A detailed README explaining:
    - The problem being addressed
    - The solution implemented with Orra
    - Key benefits and improvements
    - Architecture diagrams and examples
- Runnable code to demonstrate each concept

## Key Takeaways

- Multi-agent systems require careful orchestration
- Production-ready AI applications need reliable transaction handling
- Domain grounding prevents hallucinated plans and actions
- Observability is essential for system reliability
- Orra provides a comprehensive platform for building robust AI applications
