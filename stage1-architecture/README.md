# Stage 1: From Monolith to Multi-Agent Architecture with Services

In this stage, we address the key challenges in our Marketplace Assistant:
- High latency and token usage due to monolithic design
- Poor separation of concerns
- Sequential processing of tasks
- Cost inefficiency for deterministic operations

## What Changed

We've transformed our application in two significant ways:

### 1. Split the Monolith into Specialized Components

First, we divided the monolithic assistant into five specialized components:

1. **Product Advisor Agent**: An LLM-powered agent that understands complex user needs and recommends products
2. **Inventory Tool as Service**: Checks real-time product availability, and reserves/releases product stock
3. **Purchasing Tool as Service**: Handles product purchase processing for users
4. **Delivery Agent**: Uses real-time data to estimate delivery times

### 2. Migrated Tool Calls to Dedicated Services

We made a critical architectural improvement by migrating the monolith's function/tool calls to dedicated services:

- **Tool Calls in Monolith**: The original design used LLM function calling for all operations, even simple deterministic ones like inventory operations and purchase processing
- **Tools as Services**: We extracted these tool functions into proper standalone services that can be directly coordinated

This creates a clear distinction between:

- **Agents** (LLM-powered): For tasks requiring complex reasoning and human-like responses
- **(Tools as) Services** (Deterministic): For predictable operations with consistent input/output patterns

We converted these tool functions into dedicated services:
- **Inventory**: Directly handles inventory operations (previously a function call)
- **Purchasing**: Handles purchase processing including creating orders, making payments and notifying users (previously a function call)

We kept the Product Advisor and Delivery as LLM-powered agents since they benefit from complex reasoning capabilities.

## Benefits

These include out of the box **orra** features, like task retrying on error, and task operation pauses on outages.

Other architectural benefits include,

1. **Reduced Latency**:
    - **orra** automatically parallelises appropriate tasks
    - Overall response time improved by ~60% - esp. after caching execution plans
    - Services respond faster than LLM-based agents (40% improvement for deterministic operations)

2. **Lower Token Usage**:
    - Specialised agents reduce token consumption by ~40%
    - Converting tool to services reduces token usage by ~80% for inventory and purchasing operations
    - Significant cost savings in production

3. **Improved Maintainability**:
    - Each component has a single responsibility
    - Easier to update, debug, and enhance individual components
    - Clear separation between reasoning and deterministic parts

4. **Better Reliability**:
    - Issues in one component don't necessarily impact others
    - Deterministic services have fewer failure modes than LLM-based agents

## How orra Helps

- **Automatic Orchestration**: orra handles the coordination between components based on the user's intent
- **Parallel Execution**: Where possible, orra executes non-dependent tasks in parallel
- **Service Discovery**: Components register with orra, which then routes requests appropriately
- **Seamless Integration**: orra orchestrates between agents and services without code changes
- **Health Monitoring**: orra pauses orchestrations due to unhealthy services and resumes them when health is restored

## Next Steps

Our application is now more efficient, but it still lacks robust error handling. In the next stage, we'll implement compensation mechanisms to handle failures and ensure transaction integrity.
