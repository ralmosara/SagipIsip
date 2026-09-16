import { Test, TestingModule } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { PrismaService } from '../prisma/prisma.service';
import { Server, Socket } from 'socket.io';

describe('ChatGateway Crisis Detection', () => {
  let gateway: ChatGateway;
  let mockPrismaService: any;

  beforeEach(async () => {
    mockPrismaService = {
      chatHistory: {
        create: jest.fn(),
      },
      sessionSummary: {
        create: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatGateway,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    gateway = module.get<ChatGateway>(ChatGateway);
    gateway.server = {
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
    } as any;
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  it('should detect HIGH risk keywords and intercept response', async () => {
    const mockSocket = {
      id: 'test-socket-id',
      data: { userId: 'test-user-id' }
    } as unknown as Socket;

    const payload = { text: 'I want to hurt myself' };

    // We simulate the handleMessage call
    // Since the actual gateway calls Ollama, we ideally want to mock fetch or ollama client
    // But we are testing the regex interception which happens before Ollama.
    
    // We expect the session summary to be created with HIGH risk
    await gateway.handleMessage(mockSocket, payload);

    expect(mockPrismaService.sessionSummary.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          riskLevel: 'HIGH',
          summary: expect.stringContaining('High-risk keywords detected')
        })
      })
    );

    expect(gateway.server.to).toHaveBeenCalledWith('test-socket-id');
  });
});
