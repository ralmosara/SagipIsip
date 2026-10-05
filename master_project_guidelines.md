# SagipIsip Master Project Guidelines & Knowledge Base

> [!IMPORTANT]
> **Purpose of this Document**
> This document serves as the "Long-Term Memory" and Master Blueprint for the SagipIsip project. It contains all the synthesized knowledge from the 22 mental health and AI books in the `/books` directory. The AI Assistant must always refer to these guidelines when making architectural decisions, designing the UI, or writing the AI prompts.

---

## 1. Core Philosophy (From the Literature)

Based on *Artificial Intelligence in Behavioral and Mental Health Care* (Luxton), *Revolutionizing Youth Mental Health with Ethical AI* (Chatterjee et al.), and *AI Companions for Health and Mental Wellbeing* (Hollanek & Sobey):

* **Augmentation, Not Replacement**: The AI (Isip) is designed to *assist* and provide psychoeducation/coaching, not to replace a licensed human therapist. This must be communicated clearly to users.
* **Validation-First**: Always acknowledge and validate a user's feelings *before* offering any coping strategy or psychoeducation. (Source: *AI-Driven Mental Health Chatbots*, Weisker)
* **Socratic Questioning**: The AI should ask one thoughtful open-ended question at a time to help users explore their own thoughts, rather than giving direct advice. (Source: *AI Companions*, Hollanek & Sobey)
* **Ethical AI**: The AI must be strictly bound by rules to prevent harm. It must recognize high-risk indicators using NLP and immediately trigger a referral to a human crisis hotline.
* **Data Privacy**: All interactions must be strictly confidential. Data should be anonymized. HIPAA/GDPR-aligned design.

---

## 2. Crisis Detection & Risk Stratification

Based on *Artificial Intelligence in Behavioral and Mental Health Care* (Luxton), *Antenatal and Postnatal Mental Health: NICE Guideline*, and *The Biopsychosocial Multiaxial Toolkit* (Mayall):

The system uses a **3-tier risk model**, not binary detection:

| Risk Level | Description | Response Strategy |
|------------|-------------|-------------------|
| **HIGH** | Active suicidal/self-harm ideation (explicit intent or method) | Immediate bilingual crisis hotline referral, log `SessionSummary` with `riskLevel: HIGH`, no further AI conversation |
| **MEDIUM** | Passive ideation, severe hopelessness, prolonged distress | Warm validation + gentle professional referral suggestion + invite continued conversation |
| **LOW** | General emotional distress, daily struggles | Standard empathetic AI conversation |

**Crisis keywords must cover BOTH English AND Filipino (Tagalog).**
Source: *Revolutionizing Youth Mental Health with Ethical AI* (Chatterjee et al.) — culturally-adapted detection is critical for non-English-speaking populations.

Philippine Crisis Hotlines to always include:
* NCMH Crisis Hotline: **1553** (24/7, libre)
* In Touch Crisis Line: **0917-899-8727**
* Hopeline PH: **02-8804-4673 / 0917-558-4673**
* Samaritans of the Philippines: **02-8-722-8728**

---

## 3. Clinical Methodologies to Implement

Based on *Mental Health Workbook 7-in-1* (Lawson), *Artificial Intelligence in Cognitive Behavioural Therapy* (Woo), and *Working with Dissociation in Clinical Practice*:

### 3.1 Cognitive Behavioral Therapy (CBT)
* **Cognitive Restructuring**: Guide users through a structured 6-step Thought Record — identify situation → name emotion → identify automatic thought → name cognitive distortion → generate balanced thought → re-rate emotion.
* **Common Cognitive Distortions**: Catastrophizing, Mind-Reading, All-or-Nothing Thinking, Overgeneralization, Personalization, Emotional Reasoning, Should Statements.
* **Behavioral Activation**: Counter avoidance and withdrawal by scheduling meaningful, pleasurable, or achievable activities. Especially effective for depression and anhedonia.

### 3.2 Dialectical Behavior Therapy (DBT)
* **Distress Tolerance — TIPP**: Temperature, Intense Exercise, Paced Breathing (4-4-6 count), Paired Muscle Relaxation.
* **Emotion Regulation — PLEASE**: PhysicaL illness, Eating, Avoid mood-altering substances, Sleep, Exercise.
* **Mindfulness — Wise Mind**: Balance between Emotion Mind and Reasonable Mind; observe-without-judgment exercises.
* **Radical Acceptance**: Acknowledge reality as it is, without fighting against facts you cannot change.

### 3.3 Attachment Theory
Based on *Mental Health Workbook 7-in-1* (Lawson) and *Helping Children: Principles of Good Practice* (Fuggle & Fonagy):
* Identify attachment style: Secure, Anxious (Preoccupied), Avoidant (Dismissive), Fearful-Avoidant (Disorganized).
* Help users trace attachment patterns to early caregiver relationships.
* Guide toward "earned secure attachment" through reflection and safe relationships.

### 3.4 Cultural Competence (Filipino Context)
Based on *Revolutionizing Youth Mental Health with Ethical AI* (Chatterjee et al.) and *Mental Health and Development* (WHO):
* Honor Filipino cultural values: **Pagpapahalaga sa Pamilya** (family-centeredness), **Bayanihan** (community), **Lakas ng Loob** (inner strength/courage), **Hiya** (shame — a major barrier to help-seeking).
* Frame help-seeking as courage, not weakness, within Filipino values.
* Always respond in the language the user uses (English, Filipino, or Taglish).

---

## 4. System Architecture & "Memory" Systems

Based on *AI-First Healthcare* (Holley & Becker) and *Integrating AI into Mental Health Care* (van Vliet & Garcia):

* **RAG (Retrieval-Augmented Generation)**: All 22 books (PDFs and EPUBs) are ingested into a `DocumentChunk` table with `pgvector` embeddings. The AI companion retrieves the top-4 most relevant chunks per query and injects them into the system prompt.
* **Session Memory**: The chat gateway injects the last 10 chat history messages into the system prompt for therapeutic continuity (preventing the AI from "forgetting" the user mid-conversation).
* **Biopsychosocial Context**: The system prompt is personalized with the user's last 3 mood logs and most recent workbook entry, following the biopsychosocial model (Mayall).
* **System Prompt Design**: The AI model (Ollama / llama3) is injected with a detailed system prompt enforcing: empathy-first, Socratic questioning, DBT/CBT persona, cultural awareness, and explicit ethical limits.

---

## 5. Mood Analytics

Based on *AI-Driven Innovations in Healthcare* (Langabeer & Lalani) and *The Biopsychosocial Multiaxial Toolkit* (Mayall):

The `GET /moods/trend` endpoint provides:
* **7-Day & 30-Day Averages**: Longitudinal perspective on emotional wellbeing.
* **Daily Breakdown**: Chart-ready data for the last 7 days.
* **Trend Direction**: `improving` / `declining` / `stable` / `insufficient_data` (based on first-half vs second-half average comparison).
* **Anomaly Detection**: Flags a significant single-day drop (≥2 points below recent average) to trigger proactive outreach suggestion.

The dashboard generates **context-aware AI insights** from this trend data using rule-based logic informed by the books' recommendations for actionable, personalized, non-generic AI feedback.

---

## 6. Gamification

Based on *AI-Driven Mental Health Chatbots* (Weisker) and *Revolutionizing Youth Mental Health with Ethical AI* (Chatterjee):

* Achievement systems significantly improve engagement and completion rates in digital mental health interventions.
* Achievements must be **meaningful and clinically grounded**, not trivial (e.g., "Thought Detective" for completing Cognitive Restructuring, not just "You logged in!").
* 16 achievements are seeded covering: onboarding, CBT, DBT, Attachment Theory, Mood Tracking, Habits, and Engagement milestones.

---

## 7. EPUB Book Ingestion

Based on the identification that 8 of 22 books were `.epub` format and previously unsupported:

The following books are now ingested via `epub2` parser and contribute to the RAG knowledge base:
* *Mental Health Workbook 7-in-1* (Lawson) — CBT, DBT, Attachment Theory
* *AI for Doctors and Nurse Practitioners* (Butterfield)
* *Helping Children: Principles of Good Practice* (Fuggle & Fonagy)
* *The Biopsychosocial Multiaxial Toolkit* (Mayall)
* *Working with Dissociation in Clinical Practice*
* *Integrating AI into Mental Health Care* (van Vliet & Garcia)
* *Where to Start: A Survival Guide to Anxiety & Depression* (Mental Health America)
* *Mental Health Workbook* (David Lawson)

---

## 8. Execution Rules for the AI Agent (Antigravity)

* **Rule 1**: Always ensure the UI is calming (Teal/Sage/Blue palette), modern, glassmorphic, and accessible.
* **Rule 2**: When building the chat interface, implement "typing" indicators and slight delays to simulate human-like thought processing (avoid the uncanny valley effect).
* **Rule 3**: Never hardcode medical advice; always frame AI responses as psycho-education or coping strategies.
* **Rule 4**: All crisis responses must be bilingual (English + Filipino). Include all 4 Philippine crisis hotlines.
* **Rule 5**: Dashboard data must be fetched from real API endpoints, never hardcoded mock data.
* **Rule 6**: System prompts must follow: empathy-first → validation → Socratic question or coping suggestion. Never advice-first.

---

## 9. Open Technical Decisions

> [!WARNING]
> * **LLM Provider**: Currently using Ollama (local, llama3 model). The system prompt is LLM-agnostic — can be switched to OpenAI/Gemini by updating `chat.gateway.ts`. Model is configurable via `OLLAMA_MODEL` env variable.
> * **EHR Integration**: Not yet implemented. No specific regulatory body integration (DOH Philippines) has been built.
> * **Monetization**: No freemium model has been implemented. This is a future business decision.
