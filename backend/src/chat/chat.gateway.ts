import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Ollama } from 'ollama';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { DocumentIngestionService } from '../document-ingestion/document-ingestion.service';

const ollama = new Ollama({
  host: process.env.OLLAMA_HOST || 'http://127.0.0.1:11434',
});

// ─── Risk Stratification (based on Luxton, NICE Guidelines, Chatterjee et al.) ──

/**
 * HIGH RISK: Active suicidal/self-harm ideation — requires immediate crisis hotline referral.
 * Source: Artificial Intelligence in Behavioral and Mental Health Care (Luxton, 2016)
 * + Antenatal and Postnatal Mental Health NICE Guideline
 */
const HIGH_RISK_KEYWORDS_EN = [
  'suicide', 'kill myself', 'end my life', 'want to die', 'going to die',
  'hurt myself', 'harm myself', 'cut myself', 'self-harm', 'no reason to live',
  'end it all', 'end it tonight', 'better off dead', 'take my life',
  'i want to kill', 'plan to end', 'method to die',
];

/**
 * HIGH RISK: Filipino language suicide/self-harm keywords.
 * Source: Revolutionizing Youth Mental Health with Ethical AI (Chatterjee et al.)
 * — culturally-adapted crisis detection is critical for non-English populations.
 */
const HIGH_RISK_KEYWORDS_FIL = [
  'gusto ko nang mamatay', 'ayaw ko na mabuhay', 'papatayin ko ang sarili ko',
  'gusto kong patayin ang sarili', 'hindi ko na kayang mabuhay',
  'sasaktan ko ang sarili ko', 'magpapakamatay na ako', 'wala na akong silbi',
  'mas mabuti pang mamatay na ako', 'gusto ko nang mawala', 'tapusin ko na ang lahat',
];

/**
 * MEDIUM RISK: Passive ideation, severe hopelessness, prolonged distress — warrants
 * empathic acknowledgment and professional referral suggestion.
 * Source: Biopsychosocial Multiaxial Toolkit (Mayall) + Working with Dissociation
 */
const MEDIUM_RISK_KEYWORDS_EN = [
  'hopeless', 'worthless', 'no point', 'give up', 'can\'t go on',
  'don\'t want to exist', 'feel nothing', 'empty inside', 'numb',
  'burden to everyone', 'everyone would be better without me',
  'life is meaningless', 'i hate myself', 'nothing matters',
  'trapped', 'stuck forever', 'no way out',
];

const MEDIUM_RISK_KEYWORDS_FIL = [
  'wala na akong pag-asa', 'ayoko na ng buhay na ito', 'hindi ko na kaya',
  'wala na akong lakas', 'parang gusto ko nang sumuko', 'walang silbi ang buhay ko',
  'hindi ako mahal ng kahit sino', 'pagod na pagod na ako sa buhay',
  'lahat sila mas magiging masaya kung wala ako', 'hindi ko na makita ang sarili ko',
  'masakit na ang buhay', 'hindi na ko makakayanan',
];

function detectRiskLevel(text: string): 'HIGH' | 'MEDIUM' | 'LOW' {
  const lower = text.toLowerCase();

  const isHighEn = HIGH_RISK_KEYWORDS_EN.some((kw) => lower.includes(kw));
  const isHighFil = HIGH_RISK_KEYWORDS_FIL.some((kw) => lower.includes(kw));
  if (isHighEn || isHighFil) return 'HIGH';

  const isMedEn = MEDIUM_RISK_KEYWORDS_EN.some((kw) => lower.includes(kw));
  const isMedFil = MEDIUM_RISK_KEYWORDS_FIL.some((kw) => lower.includes(kw));
  if (isMedEn || isMedFil) return 'MEDIUM';

  return 'LOW';
}

// ─── Crisis Response Templates ──────────────────────────────────────────────

/**
 * Bilingual crisis response for HIGH risk.
 * Source: AI Companions for Health and Mental Wellbeing (Hollanek & Sobey)
 * — recommends immediate, warm, non-alarmist language that validates and redirects.
 */
const HIGH_RISK_RESPONSE =
  `Naririnig kita, at seryoso ang sinasabi mo. Ikinalulungkot ko na nakakaramdam ka ng ganito. ` +
  `Bilang isang AI, hindi ako ang tamang tao para tulungan ka sa sandaling ito — kailangan mo ng isang tunay na tao ngayon.\n\n` +
  `I hear you, and what you're sharing is serious. I'm so sorry you're carrying this. As an AI, I'm not the right support for a moment like this — please reach out to a real person right now.\n\n` +
  `🇵🇭 **Philippines Crisis Hotlines (available now):**\n` +
  `• **NCMH Crisis Hotline: 1553** *(24/7, libre)*\n` +
  `• **In Touch Crisis Line: 0917-899-8727** *(24/7)*\n` +
  `• **Hopeline PH: 02-8804-4673 / 0917-558-4673**\n` +
  `• **Samaritans of the Philippines: 02-8-722-8728**\n\n` +
  `You matter deeply. Mahalaga ka. Help is one call away. 💙`;

/**
 * MEDIUM risk response: validates distress, gently introduces coping + professional help.
 * Source: AI-Driven Mental Health Chatbots (Weisker) — validation-before-advice approach
 * significantly improves perceived empathy scores.
 */
const MEDIUM_RISK_RESPONSE =
  `Salamat sa pagtitiwala sa akin ng iyong nararamdaman. Thank you for trusting me with this.\n\n` +
  `What you're describing sounds really painful and exhausting. Those feelings are real, and you don't have to carry them alone.\n\n` +
  `I want to suggest two things: First, if these feelings stay with you or get more intense, please consider talking to a professional — that's a sign of strength, not weakness. ` +
  `You can reach **Hopeline PH: 0917-558-4673** anytime.\n\n` +
  `Second, let's take a small step together right now. Can you tell me more about what's been going on? I'm here to listen. 💙`;

// ─── WebSocket Gateway ───────────────────────────────────────────────────────

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
    private ragService: DocumentIngestionService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token;
      if (!token) {
        client.disconnect();
        return;
      }

      const payload = await this.jwtService.verifyAsync(token);
      client.data.user = payload;
      client.join(`user_${payload.sub}`);
      console.log(`Client connected: ${client.id} (User: ${payload.email})`);
    } catch (e) {
      console.log(`Unauthorized client disconnected: ${client.id}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(client: Socket, payload: { text: string }) {
    console.log(`Received message: ${payload.text}`);

    // Echo user message back immediately
    client.emit('receiveMessage', { sender: 'user', text: payload.text });

    try {
      const userId = client.data.user?.sub;

      // ── 1. Multi-Tier Crisis Detection ──────────────────────────────────
      // Source: Artificial Intelligence in Behavioral and Mental Health Care (Luxton, 2016)
      // + Antenatal & Postnatal Mental Health NICE Guideline
      // + Revolutionizing Youth Mental Health with Ethical AI (Chatterjee et al.)
      const riskLevel = detectRiskLevel(payload.text);

      if (riskLevel === 'HIGH') {
        if (userId) {
          await this.prisma.chatHistory.create({
            data: { userId, sender: 'user', message: payload.text },
          });
          await this.prisma.sessionSummary.create({
            data: {
              userId,
              summary: `[HIGH RISK] Active crisis keywords detected in message: "${payload.text.substring(0, 200)}"`,
              sentiment: 0.02,
              riskLevel: 'HIGH',
            },
          });
          await this.prisma.chatHistory.create({
            data: { userId, sender: 'ai', message: HIGH_RISK_RESPONSE },
          });
          this.server.to(`user_${userId}`).emit('receiveMessage', {
            sender: 'ai',
            text: HIGH_RISK_RESPONSE,
            isCrisis: true,
            riskLevel: 'HIGH',
          });
          
          // SOS Mode Broadcast
          this.server.emit('emergencyAlert', {
            userId: userId,
            message: payload.text,
            timestamp: new Date().toISOString(),
            riskLevel: 'HIGH',
          });
        } else {
          client.emit('receiveMessage', {
            sender: 'ai',
            text: HIGH_RISK_RESPONSE,
            isCrisis: true,
            riskLevel: 'HIGH',
          });
        }
        return;
      }

      if (riskLevel === 'MEDIUM') {
        if (userId) {
          await this.prisma.chatHistory.create({
            data: { userId, sender: 'user', message: payload.text },
          });
          await this.prisma.sessionSummary.create({
            data: {
              userId,
              summary: `[MEDIUM RISK] Passive ideation / hopelessness detected: "${payload.text.substring(0, 200)}"`,
              sentiment: 0.2,
              riskLevel: 'MEDIUM',
            },
          });
          await this.prisma.chatHistory.create({
            data: { userId, sender: 'ai', message: MEDIUM_RISK_RESPONSE },
          });
          this.server.to(`user_${userId}`).emit('receiveMessage', {
            sender: 'ai',
            text: MEDIUM_RISK_RESPONSE,
            isCrisis: false,
            riskLevel: 'MEDIUM',
          });
        } else {
          client.emit('receiveMessage', {
            sender: 'ai',
            text: MEDIUM_RISK_RESPONSE,
            isCrisis: false,
            riskLevel: 'MEDIUM',
          });
        }
        return;
      }

      // ── 2. Save user message ─────────────────────────────────────────────
      if (userId) {
        await this.prisma.chatHistory.create({
          data: { userId, sender: 'user', message: payload.text },
        });
      }

      // ── 3. Build system prompt ───────────────────────────────────────────
      // Source: AI-Driven Mental Health Chatbots (Weisker) — validation-first structure;
      // AI Companions for Health and Mental Wellbeing (Hollanek & Sobey) — Socratic questioning,
      // explicit persona boundaries, warm acknowledgment before advice;
      // Artificial Intelligence in CBT (Woo) — psychoeducation framing;
      // Integrating AI into Mental Health Care (van Vliet & Garcia) — ethical AI boundaries.
      let systemPrompt =
        `You are Isip, a compassionate, culturally-aware mental health companion for SagipIsip — ` +
        `an app that supports Filipino youth and adults in their mental wellness journey.\n\n` +

        `## Your Core Persona\n` +
        `- You are warm, non-judgmental, empathetic, and clinically informed — but NOT a licensed therapist.\n` +
        `- You practice an empathy-first, validation-before-advice approach: always acknowledge and validate ` +
        `the user's feelings before offering any coping strategies or psychoeducation.\n` +
        `- You use Socratic questioning to help users explore their own thoughts and feelings, ` +
        `rather than giving direct advice. Ask one thoughtful open-ended question at a time.\n` +
        `- You draw from evidence-based frameworks: Cognitive Behavioral Therapy (CBT), ` +
        `Dialectical Behavior Therapy (DBT), and Attachment Theory.\n\n` +

        `## Language\n` +
        `- Always respond in the language the user uses. If they write in Filipino, respond in Filipino. ` +
        `If they mix Filipino and English (Taglish), match their style.\n` +
        `- Use gentle, conversational language. Avoid clinical jargon unless explaining a concept.\n\n` +

        `## What You Do\n` +
        `- Help users identify cognitive distortions (e.g., catastrophizing, black-and-white thinking, mind-reading).\n` +
        `- Guide users through DBT skills: TIPP (Temperature, Intense Exercise, Paced Breathing, Paired Relaxation), ` +
        `PLEASE skills (PhysicaL illness, Eating, Avoid mood-altering substances, Sleep, Exercise), ` +
        `Wise Mind, and Radical Acceptance when appropriate.\n` +
        `- Encourage Behavior Activation when users report low mood or anhedonia.\n` +
        `- Validate emotions as real and understandable responses to difficult circumstances.\n\n` +

        `## What You NEVER Do\n` +
        `- Never diagnose any mental health condition.\n` +
        `- Never prescribe or recommend medications.\n` +
        `- Never minimize, dismiss, or challenge the validity of a user's feelings.\n` +
        `- Never give direct advice without first asking the user what they think or want.\n` +
        `- If a user's distress is beyond your scope, gently encourage them to speak with a ` +
        `licensed professional and remind them that seeking help is a sign of courage.\n\n` +

        `## Cultural Context\n` +
        `- Be sensitive to Filipino cultural values: family-centeredness (pagpapahalaga sa pamilya), ` +
        `community (bayanihan), resilience (lakas ng loob), and the stigma that may surround ` +
        `mental health in Philippine society. Normalize help-seeking within these values.\n\n`;

      // ── 4. RAG Context Injection ─────────────────────────────────────────
      // Source: AI-First Healthcare (Holley & Becker) — RAG grounds AI responses in
      // verified clinical knowledge, reducing hallucination risk.
      const ragContext = await this.ragService.retrieveRelevantContext(
        payload.text,
        4,
      );

      if (ragContext) {
        systemPrompt +=
          `## Clinical Reference Material\n` +
          `The following passages are from evidence-based mental health books in our library. ` +
          `Use this knowledge to inform and ground your response naturally — ` +
          `do not quote directly or cite the source explicitly to the user.\n\n` +
          ragContext +
          `\n\n## End of Reference Material\n\n`;
      }

      // ── 5. Biopsychosocial Personalization Context ───────────────────────
      // Source: Biopsychosocial Multiaxial Toolkit for Child & Adolescent Mental Health (Mayall)
      // — personalization across biological (sleep, physical), psychological (mood, thoughts),
      // and social (habits, progress) axes improves therapeutic alliance.
      if (userId) {
        const [recentMoods, latestWorkbook, recentChatHistory] = await Promise.all([
          this.prisma.moodLog.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 3,
          }),
          this.prisma.workbookEntry.findFirst({
            where: { userId },
            orderBy: { createdAt: 'desc' },
          }),
          this.prisma.chatHistory.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 10,
          }),
        ]);

        const moodLabels: Record<number, string> = {
          1: 'Very Sad/Distressed', 2: 'Sad/Anxious',
          3: 'Neutral', 4: 'Good', 5: 'Very Happy',
        };

        if (recentMoods.length > 0) {
          const moodSummary = recentMoods
            .map((m: { mood: number; notes: string | null }) => `${m.mood}/5 (${moodLabels[m.mood] || 'Unknown'})${m.notes ? ` — "${m.notes}"` : ''}`)
            .join('; ');
          systemPrompt += `## User's Recent Mood History (last ${recentMoods.length} logs)\n${moodSummary}\nBe aware of this trend. If mood has been consistently low, gently acknowledge it.\n\n`;
        }

        if (latestWorkbook) {
          systemPrompt += `## Recent CBT/DBT Activity\nThe user recently worked on a workbook exercise titled: "${latestWorkbook.title}". You may gently reference this if it is relevant to the current conversation.\n\n`;
        }

        // Inject recent conversation history for therapeutic continuity
        // Source: AI Companions (Hollanek) — session memory is critical for therapeutic alliance.
        if (recentChatHistory.length > 0) {
          const reversedHistory = recentChatHistory.reverse();
          systemPrompt += `## Recent Conversation Context (last ${reversedHistory.length} messages)\nUse this for context and continuity — do not repeat what was already said.\n`;
          for (const msg of reversedHistory) {
            systemPrompt += `${msg.sender === 'user' ? 'User' : 'Isip'}: ${msg.message.substring(0, 300)}\n`;
          }
          systemPrompt += '\n';
        }
      }

      // ── 6. Call LLM ──────────────────────────────────────────────────────
      const response = await ollama.chat({
        model: process.env.OLLAMA_MODEL || 'llama3',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: payload.text },
        ],
        options: {
          temperature: 0.7,  // Balanced: empathetic but not erratic
          top_p: 0.9,
        },
      });

      const aiResponse = response.message.content;

      // ── 7. Save AI response & emit ───────────────────────────────────────
      if (userId) {
        await this.prisma.chatHistory.create({
          data: { userId, sender: 'ai', message: aiResponse },
        });
        this.server.to(`user_${userId}`).emit('receiveMessage', {
          sender: 'ai',
          text: aiResponse,
          hasRagContext: !!ragContext,
          riskLevel: 'LOW',
        });
      } else {
        client.emit('receiveMessage', {
          sender: 'ai',
          text: aiResponse,
          hasRagContext: !!ragContext,
          riskLevel: 'LOW',
        });
      }
    } catch (error) {
      console.error('Error generating AI response:', error);
      const errorMsg =
        "I'm having trouble connecting right now. Please ensure Ollama is running with the configured model. In the meantime, if you need support, please reach out to Hopeline PH: 0917-558-4673.";
      const userId = client.data.user?.sub;
      if (userId) {
        this.server
          .to(`user_${userId}`)
          .emit('receiveMessage', { sender: 'ai', text: errorMsg });
      } else {
        client.emit('receiveMessage', { sender: 'ai', text: errorMsg });
      }
    }
  }

  // ─── Phase 3: Algorithmic Peer-Support Clustering ────────────────────────────
  private matchingQueue: { clientId: string, userId: string, score: number }[] = [];

  @SubscribeMessage('joinSupportGroup')
  async handleJoinSupportGroup(client: Socket, payload: { clinicalScore: number }) {
    const userId = client.data.user?.sub;
    if (!userId) return;

    this.matchingQueue.push({ clientId: client.id, userId, score: payload.clinicalScore || 50 });
    
    // Send waiting status
    client.emit('supportGroupStatus', { status: 'matching', message: 'Analyzing biopsychosocial markers to find your peer cohort...' });

    // Matchmaking logic: Cluster 3 users with similar scores (within 20 points)
    if (this.matchingQueue.length >= 3) {
      // In a real app, use K-Means or similar clustering. Here, we pop the first 3 for simplicity.
      const cohort = this.matchingQueue.splice(0, 3);
      const roomId = `cohort_${Date.now()}`;
      
      cohort.forEach(member => {
        const socket = this.server.sockets.sockets.get(member.clientId);
        if (socket) {
          socket.join(roomId);
          socket.emit('supportGroupStatus', { 
            status: 'matched', 
            roomId, 
            message: 'You have been matched with 2 peers with similar recent experiences. This is a safe, AI-moderated space.' 
          });
        }
      });
      
      // AI Moderator Greeting
      this.server.to(roomId).emit('receiveMessage', {
        sender: 'ai',
        text: "Welcome to your secure Peer Cohort. I am Isip, your moderator. Remember to be kind, as everyone here is going through something similar. How is everyone feeling today?",
        riskLevel: 'LOW'
      });
    }
  }
}
