import { describe, it, expect, vi, beforeEach } from 'vitest';
import { userRouter } from './users'; // Assuming the router is exported as userRouter
import { Prisma, Status, Role } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { Session } from 'next-auth';

// Mock Prisma
const mockPrisma = {
  user: {
    findFirst: vi.fn(),
    update: vi.fn(),
  },
  dH11Application: {
    update: vi.fn(),
    // Add other methods if needed by other user router functions not being tested here
  },
  dH12Application: {
    update: vi.fn(),
    // Add other methods if needed
  },
};

const mockUserSessionRegular: Session = {
  user: { id: 'test-user-id', name: 'Test User', email: 'test@example.com', role: [Role.HACKER] },
  expires: '1',
};

const mockUserSessionAdmin: Session = {
    user: { id: 'admin-user-id', name: 'Admin User', email: 'admin@example.com', role: [Role.ADMIN] },
    expires: '1',
};


const getMockContext = (session: Session = mockUserSessionRegular) => ({
  prisma: mockPrisma,
  session: session,
  // logsnag and posthog are not directly used in userRouter from the provided snippet,
  // but can be added if other functions need them.
});

describe('userRouter', () => {
  let ctxRegular: ReturnType<typeof getMockContext>;
  let callerRegular: ReturnType<typeof userRouter.createCaller>;
  let ctxAdmin: ReturnType<typeof getMockContext>;
  let callerAdmin: ReturnType<typeof userRouter.createCaller>;


  beforeEach(() => {
    vi.resetAllMocks();
    ctxRegular = getMockContext();
    callerRegular = userRouter.createCaller(ctxRegular);
    
    ctxAdmin = getMockContext(mockUserSessionAdmin);
    callerAdmin = userRouter.createCaller(ctxAdmin);
  });
  
  const dh11AppData = { id: 'dh11-app-id', firstName: 'DH11', lastName: 'User', status: Status.IN_REVIEW, socialText: [], studyLocation: 'Loc11', studyDegree: 'Deg11', studyYearOfStudy: 'Year11', studyMajor: 'Major11' };
  const dh12AppData = { id: 'dh12-app-id', firstName: 'DH12', lastName: 'User', status: Status.ACCEPTED, socialText: [], studyLocation: 'Loc12', studyDegree: 'Deg12', studyYearOfStudy: 'Year12', studyMajor: 'Major12' };


  describe('getProfile query', () => {
    it('should return profile with DH12 application data if it exists', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'test-user-id',
        DH11Application: null,
        DH12Application: dh12AppData,
      } as any);
      const result = await callerRegular.getProfile('test-user-id');
      expect(result?.application?.id).toBe('dh12-app-id');
      expect(result?.application?.firstName).toBe('DH12');
    });

    it('should return profile with DH11 application data if DH12 does not exist', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'test-user-id',
        DH11Application: dh11AppData,
        DH12Application: null,
      } as any);
      const result = await callerRegular.getProfile('test-user-id');
      expect(result?.application?.id).toBe('dh11-app-id');
      expect(result?.application?.firstName).toBe('DH11');
    });

    it('should prioritize DH12 application data if both exist', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'test-user-id',
        DH11Application: dh11AppData,
        DH12Application: dh12AppData,
      } as any);
      const result = await callerRegular.getProfile('test-user-id');
      expect(result?.application?.id).toBe('dh12-app-id'); // DH12 prioritized
    });

    it('should return profile with null application if neither exists', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'test-user-id',
        DH11Application: null,
        DH12Application: null,
      } as any);
      const result = await callerRegular.getProfile('test-user-id');
      expect(result?.application).toBeNull();
    });
    
    it('should return null if user not found', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);
      const result = await callerRegular.getProfile('nonexistent-user-id');
      expect(result).toBeNull();
    });
  });

  describe('checkIn mutation (Admin role required)', () => {
    const userIdToCheckIn = 'user-to-checkin';

    it('should check in DH12 application if it exists', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({
        id: userIdToCheckIn,
        DH12Application: { id: 'dh12-checkin-app-id' },
        DH11Application: null,
      } as any);
      
      await callerAdmin.checkIn(userIdToCheckIn);

      expect(mockPrisma.dH12Application.update).toHaveBeenCalledWith({
        where: { id: 'dh12-checkin-app-id' },
        data: { status: Status.CHECKED_IN },
      });
      expect(mockPrisma.dH11Application.update).not.toHaveBeenCalled();
    });

    it('should check in DH11 application if DH12 does not exist', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({
        id: userIdToCheckIn,
        DH12Application: null,
        DH11Application: { id: 'dh11-checkin-app-id' },
      } as any);

      await callerAdmin.checkIn(userIdToCheckIn);

      expect(mockPrisma.dH11Application.update).toHaveBeenCalledWith({
        where: { id: 'dh11-checkin-app-id' },
        data: { status: Status.CHECKED_IN },
      });
      expect(mockPrisma.dH12Application.update).not.toHaveBeenCalled();
    });

    it('should throw NOT_FOUND if user has no application to check in', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({
        id: userIdToCheckIn,
        DH12Application: null,
        DH11Application: null,
      } as any);

      await expect(callerAdmin.checkIn(userIdToCheckIn)).rejects.toThrowError(
        new TRPCError({ code: 'NOT_FOUND', message: 'No application found for this user to check in.' })
      );
    });
    
    it('should throw NOT_FOUND if user to check-in does not exist', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);
       await expect(callerAdmin.checkIn(userIdToCheckIn)).rejects.toThrowError(
        new TRPCError({ code: 'NOT_FOUND' }) // The router throws a generic NOT_FOUND if user is null/undefined
      );
    });

    it('should throw UNAUTHORIZED if non-admin tries to check in', async () => {
        // Using callerRegular which has HACKER role
        await expect(callerRegular.checkIn(userIdToCheckIn)).rejects.toThrowError(
            new TRPCError({ code: 'UNAUTHORIZED' })
        );
    });
  });
});
