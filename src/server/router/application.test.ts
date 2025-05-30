import { describe, it, expect, vi, beforeEach } from 'vitest';
import { applicationRouter } from './application';
import { Prisma, Status, Role } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import applicationSchema from '../../schemas/application';
import { Session } from 'next-auth';

// Mock Prisma
const mockPrisma = {
  user: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
  },
  dh10application: { // Corrected casing
    findUnique: vi.fn(),
  },
  dH11Application: {
    create: vi.fn(),
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    groupBy: vi.fn(),
    updateMany: vi.fn(),
  },
  dH12Application: {
    create: vi.fn(),
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    groupBy: vi.fn(),
    updateMany: vi.fn(),
  },
};

const mockLogsnag = { track: vi.fn() };
const mockPosthog = { capture: vi.fn() };

const mockUserSession: Session = {
  user: { id: 'test-user-id', name: 'Test User', email: 'test@example.com', role: [Role.HACKER] },
  expires: '1',
};

const getMockContext = () => ({
  prisma: mockPrisma,
  session: mockUserSession,
  logsnag: mockLogsnag,
  posthog: mockPosthog,
});

describe('applicationRouter', () => {
  let ctx: ReturnType<typeof getMockContext>;
  let caller: ReturnType<typeof applicationRouter.createCaller>;

  beforeEach(() => {
    vi.resetAllMocks();
    ctx = getMockContext();
    caller = applicationRouter.createCaller(ctx);
  });

  const validAppData = {
    firstName: "Test", lastName: "User", phone: "1234567890", country: "Canada",
    birthday: new Date("2000-01-01"), studyEnrolledPostSecondary: true,
    studyLocation: "Test University", studyDegree: "B.Sc.", studyMajor: "Computer Science",
    studyYearOfStudy: "3rd Year", studyExpectedGraduation: new Date("2025-05-01"),
    previousHackathonsCount: 0, longAnswerIncident: "Test incident.",
    longAnswerGoals: "Test goals.", longAnswerFood: "Test food.",
    longAnswerTravel: "Test travel.", longAnswerSocratica: "Test socratica.",
    socialText: ["https://linkedin.com/in/testuser"], interests: "Testing",
    tshirtSize: "M", hackerKind: ["Developer"], alreadyHaveTeam: false,
    workshopChoices: ["AI Workshop"], discoverdFrom: ["Social Media"], considerCoffee: true,
    dietaryRestrictions: "None", underrepresented: "NO" as const, gender: "Prefer not to say",
    race: "Prefer not to say", orientation: "Prefer not to say",
    emergencyContactName: "Emergency Contact", emergencyContactPhone: "0987654321",
    emergencyContactRelation: "Friend", agreeToMLHCodeOfConduct: true,
    agreeToMLHPrivacyPolicy: true, agreeToMLHCommunications: false,
  };
  
  // Convert dates to string for input validation if your schema expects strings
  const validStringDateInput = {
      ...validAppData,
      birthday: validAppData.birthday.toISOString(),
      studyExpectedGraduation: validAppData.studyExpectedGraduation?.toISOString(),
  };
  const parsedValidInput = applicationSchema.parse(validStringDateInput);


  describe('submitDh12 mutation', () => {
    it('should successfully submit a DH12 application', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'test-user-id', DH12ApplicationId: null, name: 'Test User', email: 'test@example.com' });
      mockPrisma.dH12Application.create.mockResolvedValue({ id: 'new-app-id', ...validAppData });
      mockPrisma.user.update.mockResolvedValue({ id: 'test-user-id', name: 'Test User', email: 'test@example.com' });

      await caller.submitDh12(parsedValidInput);

      expect(mockPrisma.dH12Application.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ 
            ...parsedValidInput, // The schema-parsed input
            birthday: validAppData.birthday, // Ensure Date object for Prisma
            studyExpectedGraduation: validAppData.studyExpectedGraduation, // Ensure Date object for Prisma
            User: { connect: { id: 'test-user-id' } } 
          }),
        })
      );
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'test-user-id' }, data: { status: Status.IN_REVIEW },
      });
    });

    it('should throw FORBIDDEN if user already has a DH12 application', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'test-user-id', DH12ApplicationId: 'existing-id' });
      await expect(caller.submitDh12(parsedValidInput)).rejects.toThrowError(/You have already submitted a DeltaHacks 12 application./);
    });
  });

  describe('status query', () => {
    it('should return DH12 status if DH12Application exists', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({ DH12Application: { status: Status.ACCEPTED } } as any);
      const result = await caller.status();
      expect(result).toBe(Status.ACCEPTED);
    });
    it('should return DH11 status if only DH11Application exists', async () => {
        mockPrisma.user.findFirst.mockResolvedValue({ DH11Application: { status: Status.REJECTED }, DH12Application: null } as any);
        const result = await caller.status();
        expect(result).toBe(Status.REJECTED);
    });
    it('should prioritize DH12 status if both exist', async () => {
        mockPrisma.user.findFirst.mockResolvedValue({ DH11Application: { status: Status.IN_REVIEW }, DH12Application: { status: Status.WAITLISTED }} as any);
        const result = await caller.status();
        expect(result).toBe(Status.WAITLISTED);
    });
    it('should throw NOT_FOUND if no application exists', async () => {
        mockPrisma.user.findFirst.mockResolvedValue({ DH11Application: null, DH12Application: null } as any);
        await expect(caller.status()).rejects.toThrowError(/No application found for the user./);
    });
  });

  describe('rsvp mutation', () => {
    it('should RSVP for DH12 if ACCEPTED', async () => {
        mockPrisma.user.findFirst.mockResolvedValue({ DH12Application: { id: 'dh12-id', status: Status.ACCEPTED }, name: 'Test User', email: 'test@example.com' } as any);
        await caller.rsvp({ rsvpCheck: true });
        expect(mockPrisma.dH12Application.update).toHaveBeenCalledWith({
            where: { id: 'dh12-id' }, data: { status: Status.RSVP, rsvpCheck: true },
        });
    });
    it('should RSVP for DH11 if ACCEPTED (and no DH12 accepted)', async () => {
        mockPrisma.user.findFirst.mockResolvedValue({ DH11Application: { id: 'dh11-id', status: Status.ACCEPTED }, DH12Application: null, name: 'Test User', email: 'test@example.com' } as any);
        await caller.rsvp({ rsvpCheck: false });
        expect(mockPrisma.dH11Application.update).toHaveBeenCalledWith({
            where: { id: 'dh11-id' }, data: { status: Status.RSVP, rsvpCheck: false },
        });
    });
    it('should throw BAD_REQUEST if no application is ACCEPTED', async () => {
        mockPrisma.user.findFirst.mockResolvedValue({ DH12Application: { status: Status.IN_REVIEW } } as any);
        await expect(caller.rsvp({ rsvpCheck: true })).rejects.toThrowError(/No application found in ACCEPTED state to RSVP for./);
    });
  });

  describe('getPrevAutofill query', () => {
    it('should return autofill data from DH11 if it exists', async () => {
        const dh11Data = { ...validAppData, id: 'dh11-id', phone: '111', country: 'USA' };
        mockPrisma.user.findUnique.mockResolvedValue({ DH11Application: dh11Data, dh10application: null } as any);
        const result = await caller.getPrevAutofill();
        expect(result.firstName).toBe(dh11Data.firstName);
        expect(result.phone).toBe(dh11Data.phone);
    });
    it('should return autofill data from DH10 if DH11 does not exist', async () => {
        const dh10Data = { firstName: 'DH10User', lastName: 'Test', birthday: new Date('1999-01-01'), studyEnrolledPostSecondary: true, hackerKind: "Designer" };
        mockPrisma.user.findUnique.mockResolvedValue({ DH11Application: null, dh10application: dh10Data } as any);
        const result = await caller.getPrevAutofill();
        expect(result.firstName).toBe('DH10User');
        expect(result.hackerKind).toEqual(["Designer"]); // Check array conversion
    });
    it('should throw NOT_FOUND if no previous application exists', async () => {
        mockPrisma.user.findUnique.mockResolvedValue({ DH11Application: null, dh10application: null } as any);
        await expect(caller.getPrevAutofill()).rejects.toThrowError(/No previous application found for autofill./);
    });
  });

  describe('deleteApplication mutation', () => {
    it('should delete DH12 application if it exists', async () => {
        mockPrisma.user.findUnique.mockResolvedValue({ DH12ApplicationId: 'dh12-to-delete', name: 'Test User', email: 'test@example.com' } as any);
        await caller.deleteApplication();
        expect(mockPrisma.dH12Application.delete).toHaveBeenCalledWith({ where: { id: 'dh12-to-delete' } });
        expect(mockPrisma.user.update).toHaveBeenCalledWith(expect.objectContaining({ data: { DH12ApplicationId: null } }));
    });
    it('should delete DH11 application if DH12 does not exist', async () => {
        mockPrisma.user.findUnique.mockResolvedValue({ DH12ApplicationId: null, DH11ApplicationId: 'dh11-to-delete', name: 'Test User', email: 'test@example.com' } as any);
        await caller.deleteApplication();
        expect(mockPrisma.dH11Application.delete).toHaveBeenCalledWith({ where: { id: 'dh11-to-delete' } });
        expect(mockPrisma.user.update).toHaveBeenCalledWith(expect.objectContaining({ data: { DH11ApplicationId: null } }));
    });
    it('should throw NOT_FOUND if no application exists to delete', async () => {
        mockPrisma.user.findUnique.mockResolvedValue({ DH12ApplicationId: null, DH11ApplicationId: null } as any);
        await expect(caller.deleteApplication()).rejects.toThrowError(/No application found to delete for the user./);
    });
  });

  describe('getStatusCount query', () => {
    it('should return counts of DH12 application statuses', async () => {
        const mockStatusCounts = [{ status: Status.ACCEPTED, _count: { status: 5 } }, { status: Status.REJECTED, _count: { status: 10 } }];
        mockPrisma.dH12Application.groupBy.mockResolvedValue(mockStatusCounts as any); // Type assertion for mock
        
        // Manually add other statuses with 0 count for full coverage
        const expectedResult = [
            { status: Status.ACCEPTED, count: 5 },
            { status: Status.CHECKED_IN, count: 0 },
            { status: Status.IN_REVIEW, count: 0 },
            { status: Status.REJECTED, count: 10 },
            { status: Status.RSVP, count: 0 },
            { status: Status.WAITLISTED, count: 0 },
        ].sort((a,b) => a.status.localeCompare(b.status));


        const result = await caller.getStatusCount();
        result.sort((a,b) => a.status.localeCompare(b.status)); // Ensure consistent order for comparison

        expect(mockPrisma.dH12Application.groupBy).toHaveBeenCalledWith({ by: ['status'], _count: { status: true } });
        expect(result).toEqual(expectedResult);
    });
  });
});
