import { NoTimeSlots } from "@/components/NoTimeSlots";
import { MeetingForm } from "@/components/forms/MeetingForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/drizzle/db";
import { getValidTimesFromSchedule } from "@/lib/getValidTimesFromSchedule";
import { clerkClient } from "@clerk/nextjs/server";
import { addMonths, eachMinuteOfInterval, endOfDay, roundToNearestMinutes } from "date-fns";
import { notFound } from "next/navigation";

export const revalidate = 0;

export default async function BookEventPage({
  params: { clerkUserId, eventId },
}: {
  params: { clerkUserId: string; eventId: string };
}) {
  const event = await db.query.EventTable.findFirst({
    where: ({ clerkUserId: userId, isActive, id }, { eq, and }) =>
      and(eq(isActive, true), eq(userId, clerkUserId), eq(id, eventId)),
  });

  if (event == null) return notFound();

  const calendarUser = await clerkClient().users.getUser(clerkUserId);

  const startDate = roundToNearestMinutes(new Date(), { nearestTo: 15, roundingMethod: "ceil" });

  const endDate = endOfDay(addMonths(startDate, 2));

  const validTimes = await getValidTimesFromSchedule(
    eachMinuteOfInterval({ start: startDate, end: endDate }, { step: 15 }),
    event
  );

  if (validTimes.length === 0) {
    return <NoTimeSlots event={event} calendarUser={calendarUser} />;
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>
          Book {event.name} with {calendarUser.fullName}
        </CardTitle>
        {event.description && <CardDescription>{event.description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <MeetingForm validTimes={validTimes} clerkUserId={clerkUserId} eventId={event.id} />
      </CardContent>
    </Card>
  );
}
