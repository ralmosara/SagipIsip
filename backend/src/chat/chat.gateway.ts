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

      // ── 1. Crisis Detection (runs BEFORE anything else) ─────────────────
      const crisisKeywords = [
        'suicide', 'kill myself', 'hurt myself', 'want to die',
        'end it all', 'worthless', 'no reason to live', 'self-harm',
      ];
      const isCrisis = crisisKeywords.some((kw) =>
        payload.text.toLowerCase().includes(kw),
      );

      if (isCrisis) {
        const crisisResponse =
          "I'm so sorry you're feeling this way. I'm an AI and not equipped to help in a crisis — please reach out to a real person immediately.\n\n" +
          "🇵🇭 **Philippines Crisis Hotlines:**\n" +
          "• NCMH Hotline: **1553**\n" +
          "• In Touch Crisis Line: **0917-899-8727**\n" +
          "• Hopeline PH: **02-8804-4673**\n\n" +
          "You matter, and help is available right now.";

        if (userId) {
          await this.prisma.chatHistory.create({
            data: { userId, sender: 'user', message: payload.text },
          });
          await this.prisma.sessionSummary.create({
            data: {
              userId,
              summary: `High-risk keywords detected in message: "${payload.text.substring(0, 200)}"`,
              sentiment: 0.05,
              riskLevel: 'HIGH',
            },
          });
          await this.prisma.chatHistory.create({
            data: { userId, sender: 'ai', message: crisisResponse },
          });
          this.server.to(`user_${userId}`).emit('receiveMessage', {
            sender: 'ai',
            text: crisisResponse,
            isCrisis: true,
          });
        } else {
          client.emit('receiveMessage', {
            sender: 'ai',
            text: crisisResponse,
            isCrisis: true,
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
      let systemPrompt =
        'You are Isip, a compassionate and professional mental health companion for the SagipIsip app. ' +
        'You help Filipino users process emotions and build coping skills. ' +
        'Be warm, non-judgmental, and clinically informed. ' +
        'Always respond in the language the user uses (Filipino or English). ' +
        'Never diagnose. Always encourage seeking professional help for serious issues.\n\n';

      // ── 4. RAG Context Injection ─────────────────────────────────────────
      const ragContext = await this.ragService.retrieveRelevantContext(
        payload.text,
        4,
      );

      if (ragContext) {
        systemPrompt +=
          '## Clinical Reference Material\n' +
          'The following passages are from evidence-based mental health books in our library. ' +
          'Use this knowledge to inform your response, but speak naturally — do not quote directly.\n\n' +
          ragContext +
          '\n\n## End of Reference Material\n\n';
      }

      // ── 5. Personalization Context ───────────────────────────────────────
      if (userId) {
        const [latestMood, latestWorkbook] = await Promise.all([
          this.prisma.moodLog.findFirst({
            where: { userId },
            orderBy: { createdAt: 'desc' },
          }),
          this.prisma.workbookEntry.findFirst({
            where: { userId },
            orderBy: { createdAt: 'desc' },
          }),
        ]);

        if (latestMood) {
          const moodLabels: Record<number, string> = {
            1: 'Very Sad/Distressed', 2: 'Sad/Anxious',
            3: 'Neutral', 4: 'Good', 5: 'Very Happy',
          };
          systemPrompt += `The user's latest mood log: ${latestMood.mood}/5 (${moodLabels[latestMood.mood] || 'Unknown'}). Notes: "${latestMood.notes || 'none'}". Be mindful of this.\n`;
        }

        if (latestWorkbook) {
          systemPrompt += `The user recently worked on a CBT exercise: "${latestWorkbook.title}". You may gently reference this if relevant.\n`;
        }
      }

      // ── 6. Call LLM ──────────────────────────────────────────────────────
      const response = await ollama.chat({
        model: 'llama3',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: payload.text },
        ],
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
        });
      } else {
        client.emit('receiveMessage', {
          sender: 'ai',
          text: aiResponse,
          hasRagContext: !!ragContext,
        });
      }
    } catch (error) {
      console.error('Error generating AI response:', error);
      const errorMsg =
        "I'm having trouble connecting to my AI brain right now. Please ensure Ollama is running with the llama3 model.";
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
}
