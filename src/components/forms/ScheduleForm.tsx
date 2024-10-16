"use client";

import { DAYS_OF_WEEK_IN_ORDER } from "@/data/constants";
import { formatTimezoneOffset, timeToInt } from "@/lib/formatters";
import { ScheduleFormType, scheduleFormSchema } from "@/schema/schedule";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, X } from "lucide-react";
import { Fragment, useState, useTransition } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { Button } from "../ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { saveSchedule } from "@/server/actions/schedule";

type Availability = {
  startTime: string;
  endTime: string;
  dayOfWeek: (typeof DAYS_OF_WEEK_IN_ORDER)[number];
};

export interface AvailabilityWithIndex extends Availability {
  index: number;
  id: string;
}

export type GroupedAvailabilities = {
  [key: string]: AvailabilityWithIndex[];
};

export function ScheduleForm({
  schedule,
}: {
  schedule?: {
    timezone: string;
    availabilities: Availability[];
  };
}) {
  const [successMsg, setSuccessMsg] = useState("");
  const form = useForm<ScheduleFormType>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: {
      timezone: schedule?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      availabilities: schedule?.availabilities.toSorted((a, b) => {
        return timeToInt(a.startTime) - timeToInt(b.startTime);
      }),
    },
  });

  const {
    append: addAvailability,
    remove: removeAvailability,
    fields: availabilityFields,
  } = useFieldArray({
    name: "availabilities",
    control: form.control,
  });

  const groupedAvailabilityFields = availabilityFields
    .map((field, index) => ({ ...field, index }))
    .reduce((group: GroupedAvailabilities, availability: AvailabilityWithIndex) => {
      const key = availability.dayOfWeek;

      if (!group[key]) {
        group[key] = [];
      }

      group[key].push(availability);
      return group;
    }, {});

  async function onSubmit(values: ScheduleFormType) {
    const data = await saveSchedule(values);

    if (data?.error) {
      form.setError("root", {
        message: "There was an error saving your event.",
      });
    } else {
      setSuccessMsg("Schedule Saved");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
        {form.formState.errors.root && (
          <div className="text-destructive text-sm">{form.formState.errors.root.message}</div>
        )}
        {successMsg && <div className="text-sm text-green-600">Schedule Saved</div>}
        <FormField
          control={form.control}
          name="timezone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Timezone</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Intl.supportedValuesOf("timeZone").map((timezone) => (
                    <SelectItem key={timezone} value={timezone}>
                      {timezone}
                      {` (${formatTimezoneOffset(timezone)})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-[auto,1fr] gap-y-6 gap-x-4">
          {DAYS_OF_WEEK_IN_ORDER.map((dayOfWeek) => (
            <Fragment key={dayOfWeek}>
              <div className="capitalize text-sm font-semibold">{dayOfWeek.substring(0, 3)}</div>
              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  className="size-6 p-1"
                  variant="outline"
                  onClick={() => {
                    addAvailability({
                      dayOfWeek,
                      startTime: "9:00",
                      endTime: "17:00",
                    });
                  }}>
                  <Plus className="size-full" />
                </Button>
                {groupedAvailabilityFields[dayOfWeek]?.map((field, labelIndex) => (
                  <div className="flex flex-col gap-1" key={field.id}>
                    <div className="flex gap-2 items-center">
                      <FormField
                        control={form.control}
                        name={`availabilities.${field.index}.startTime`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                className="w-24"
                                aria-label={`${dayOfWeek} Start Time ${labelIndex + 1}`}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      -
                      <FormField
                        control={form.control}
                        name={`availabilities.${field.index}.endTime`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                className="w-24"
                                aria-label={`${dayOfWeek} End Time ${labelIndex + 1}`}
                                {...field}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <Button
                        type="button"
                        className="size-6 p-1"
                        variant="destructive"
                        onClick={() => removeAvailability(field.index)}>
                        <X />
                      </Button>
                    </div>
                    <FormMessage>
                      {form.formState.errors.availabilities?.at?.(field.index)?.root?.message}
                    </FormMessage>
                    <FormMessage>
                      {form.formState.errors.availabilities?.at?.(field.index)?.startTime?.message}
                    </FormMessage>
                    <FormMessage>
                      {form.formState.errors.availabilities?.at?.(field.index)?.endTime?.message}
                    </FormMessage>
                  </div>
                ))}
              </div>
            </Fragment>
          ))}
        </div>

        <div className="flex justify-end items-center gap-4">
          <Button disabled={form.formState.isSubmitting} type="submit">
            Save
          </Button>
        </div>
      </form>
    </Form>
  );
}
