# From Fragile to Production-Ready Multi-Agent App

This guide demonstrates how to transform an AI-powered Marketplace Assistant into a production-ready multi-agent application using [orra](https://github.com/orra-dev/orra).

## Overview

We'll explore how to build a marketplace assistant that helps users find and purchase products. This guide progressively improves the application by addressing common production challenges in multi-agent AI systems.

This guide is a compliment to the [Wrangling Wild Agents](https://docs.google.com/presentation/d/1hTegIOTg4tuzU2EJck_dkWYUqw9VsthHtKBmNNJJ1vI/edit?usp=sharing) talk by the orra team, presented at the [AI in Production](https://home.mlops.community/public/events/ai-in-production-2025?agenda_day=6786673a7e4e28747d4d90ec&agenda_track=6786673a7e4e28747d4d9100&agenda_stage=67873ebf7e4e28747d4e8c27&agenda_filter_view=stage&agenda_view=list) 2025 conference. We'll be using various sections of that talk in this guide.

## Guide Progression: 3 Stages to Production Readiness

### [Stage 0: Monolithic Agent](./monolithic-app)
- The original AI Marketplace Agent implementation
- [View implementation and details](./monolithic-app/README.md)

### [Stage 1: Architecture Re-think with orra](./stage1-architecture)
- Build a distributed system with specialized agents and tools as services
- Integrate with orra for coordination, optimal performance, reduced costs and out of the box reliability 
- Implement efficient communication between components with execution plans
- [View implementation and details](./stage1-architecture/README.md)

### [Stage 2: Reliable Consistency with orra](./stage2-consistency)
- Add compensation handlers for critical operations
- Ensure system consistency during failures
- Implement automatic recovery mechanisms
- [View implementation and details](./stage2-consistency/README.md)

### [Stage 3: Reliable Planning with orra](./stage3-grounding)
- Ground all jobs and actions in your intended domain only
- Define use cases with clear capability patterns
- Prevent hallucinated plans and invalid actions - before plans are executed
- [View implementation and details](./stage3-grounding/README.md)

## Guide Components

Each component demonstrates orra's capabilities:

- **Product Advisor Agent**: LLM-powered product recommendation engine
- **Inventory Service**: Simulated inventory database with holds and releases
- **Delivery Agent**: Estimates delivery times based on various factors
- **Purchasing Service**: A product purchasing that creates orders, makes payments with occasional failures and notifies users

## Getting Started

1. Make sure you have Node.js installed (v18 or later)
2. Clone this repository
3. Follow the orra's [installation instructions](https://github.com/orra-dev/orra?tab=readme-ov-file#installation).
4. Follow the instructions in each stage's README.md file
5. Run the provided scripts in each stage to see the improvements in action

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
  - Delivery Agent provides delivery estimate
  - Purchasing service places order and notifies user
```

## Guide Structure

Each stage builds upon the previous one and includes:
- A dedicated folder with complete code
- A detailed README explaining:
    - The problem being addressed
    - The solution implemented with orra
    - Key benefits and improvements
    - Architecture diagrams and examples
- Runnable code to demonstrate each concept

## Key Takeaways

- Multi-agent systems require careful orchestration
- Production-ready AI applications need reliable transaction handling
- Domain grounding prevents hallucinated plans and actions
- An audit trail is essential for system reliability
- orra provides a comprehensive platform for building robust AI applications

<br/>
<a href="https://news.ycombinator.com/submitlink?u=https://github.com/orra-dev/agent-fragile-to-prod-guide&t=From%20Fragile%20to%20Production-Ready%20Multi-Agent%20App" style="display: inline-block; background-color: #EC4899; color: white; font-family: sans-serif; font-size: 14px; padding: 8px 16px; border-radius: 5px; text-decoration: none;">Discuss on Hacker News</a>
