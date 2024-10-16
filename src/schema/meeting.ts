import { startOfDay } from "date-fns";
import { z } from "zod";

export const meetingFormSchema = z.object({
  startTime: z.date().min(new Date()),
  guestEmail: z.string().email().min(1),
  guestName: z.string().min(1),
  guestNotes: z.string().optional(),
  timezone: z.string().min(1),
  date: z.date().min(startOfDay(new Date())),
});

export type MeetingFormType = z.infer<typeof meetingFormSchema>;

const additionalActionData = z.object({
  eventId: z.string().min(1),
  clerkUserId: z.string().min(1),
});

export const createMeetingActionSchema = meetingFormSchema
  .omit({
    date: true,
  })
  .merge(additionalActionData);
