"use server";

import { db } from "@/drizzle/db";
import { EventTable } from "@/drizzle/schema";
import { EventFormType, eventFormSchema } from "@/schema/events";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import "use-server";

export async function createEvent(
  unsafeData: EventFormType
): Promise<{ error: boolean } | undefined> {
  const { userId } = auth();
  const { success, data } = eventFormSchema.safeParse(unsafeData);

  if (!success || userId == null) {
    return { error: true };
  }

  await db.insert(EventTable).values({ ...data, clerkUserId: userId });

  redirect("/events");
}

export async function updateEvent(
  id: string,
  unsafeData: EventFormType
): Promise<{ error: boolean } | undefined> {
  const { userId } = auth();
  const { success, data } = eventFormSchema.safeParse(unsafeData);

  if (!success || userId == null) {
    return { error: true };
  }

  const { rowCount } = await db
    .update(EventTable)
    .set({ ...data })
    .where(and(eq(EventTable.id, id), eq(EventTable.clerkUserId, userId)));

  if (rowCount === 0) {
    return { error: true };
  }

  redirect("/events");
}

export async function deleteEvent(id: string): Promise<{ error: boolean } | undefined> {
  const { userId } = auth();

  if (userId == null) {
    return { error: true };
  }

  const { rowCount } = await db
    .delete(EventTable)
    .where(and(eq(EventTable.id, id), eq(EventTable.clerkUserId, userId)));

  if (rowCount === 0) {
    return { error: true };
  }

  redirect("/events");
}
