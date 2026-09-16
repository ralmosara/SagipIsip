# SagipIsip Master Project Guidelines & Knowledge Base

> [!IMPORTANT]
> **Purpose of this Document**
> This document serves as the "Long-Term Memory" and Master Blueprint for the SagipIsip project. It contains all the synthesized knowledge from the mental health, AI, and productivity books provided in the repository. The AI Assistant must always refer to these guidelines when making architectural decisions, designing the UI, or writing the AI prompts.

## 1. Core Philosophy (From the Literature)
Based on *Artificial Intelligence in Behavioral and Mental Health Care* and *Revolutionizing Youth Mental Health with Ethical AI*:
* **Augmentation, Not Replacement**: The AI (SimSensei/SimCoach) is designed to *assist* and provide triage/coaching, not to replace a licensed human therapist.
* **Ethical AI**: The AI must be strictly bound by rules to prevent harm. It must recognize high-risk indicators (e.g., suicide ideation) using Natural Language Processing (NLP) and immediately trigger a referral to a human crisis hotline.
* **Data Privacy**: All interactions must be strictly confidential. Data should be anonymized.

## 2. Clinical Methodologies to Implement
Based on the *Mental Health Workbook (CBT, DBT, Attachment Theory)* and *Communication Skills Training*:
* **Cognitive Behavioral Therapy (CBT)**: The AI should guide users through cognitive restructuring (identifying cognitive distortions like "catastrophizing" or "black-and-white thinking").
* **Dialectical Behavior Therapy (DBT)**: The app should include modules for Distress Tolerance, Emotion Regulation, and Mindfulness.
* **Productivity & Communication**: Incorporate habit-tracking, active listening exercises, and boundary-setting scripts from the productivity books.

## 3. System Architecture & "Memory" Systems
To ensure the AI does not "forget" user context across sessions (a critical requirement for therapeutic alliance):
* **Vector Database / RAG**: We will implement a Retrieval-Augmented Generation (RAG) system using a local vector database (like ChromaDB or pgvector in PostgreSQL). 
* **User State Tracking**: The NestJS backend will maintain a `Belief State` or `Affective Model` of the user (tracking their mood over time, as suggested in the literature for affective computing).
* **System Prompting**: The AI model (Ollama) will be injected with a highly specific System Prompt that enforces the persona of an empathetic, non-judgmental, and medically safe coach.

## 4. Execution Rules for the AI Agent (Antigravity)
* **Rule 1**: Always ensure the UI is calming (Teal/Sage colors), modern, and accessible.
* **Rule 2**: When building the chat interface, implement "typing" indicators and slight delays to simulate human-like thought processing (to avoid the uncanny valley effect).
* **Rule 3**: Never hardcode medical advice; always frame responses as psycho-education or coping strategies.

## 5. Next Steps for Implementation
1. **AI Prompt Engineering**: Create the master system prompt for the Ollama integration in NestJS.
2. **Database Schema**: Update Prisma schema to include `MoodLogs`, `ChatHistory`, and `RiskAlerts`.
3. **CBT Modules**: Build the frontend UI for specific CBT exercises (e.g., Thought Records).
