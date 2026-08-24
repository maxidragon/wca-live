import { useState } from "react";
import { Box, Grid, Tab, Tabs } from "@mui/material";
import ScheduleCard from "./ScheduleCard";
import { groupBy, uniq, orderBy } from "../../lib/utils";
import {
  formatDateShort,
  toLocalDateString,
  closestDateString,
} from "../../lib/date";
import { eventRoundForActivityCode } from "../../lib/competition";
import { parseActivityCode } from "../../lib/activity-code";

function Schedule({ venues, competitionEvents, competitionId }) {
  const activities = venues
    .flatMap((venue) => venue.rooms)
    .flatMap((room) =>
      room.activities.map((activity) => ({ ...activity, room })),
    )
    .filter(
      (activity) =>
        parseActivityCode(activity.activityCode).type === "official" &&
        // Ignore activities that don't have corresponding event/round data
        // (e.g. if a round is removed, but still in the schedule).
        eventRoundForActivityCode(competitionEvents, activity.activityCode),
    );

  const sortedActivities = orderBy(
    activities,
    (activity) => activity.startTime,
  );

  const dates = uniq(
    sortedActivities.map((activity) => toLocalDateString(activity.startTime)),
  );

  // We store the selected date, so that it's preserved when the user
  // navigates to a round and comes back.
  const [selectedDate, setSelectedDate] = useState(
    () =>
      getStoredScheduleDate(competitionId, dates) ?? closestDateString(dates),
  );

  function handleDateChange(date) {
    setSelectedDate(date);
    storeScheduleDate(competitionId, date);
  }

  const selectedDateActivities = sortedActivities.filter(
    (activity) => toLocalDateString(activity.startTime) === selectedDate,
  );

  const activitiesByActivityCode = groupBy(
    selectedDateActivities,
    (activity) => activity.activityCode,
  );

  return (
    <>
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
        <Tabs
          indicatorColor="secondary"
          variant="scrollable"
          textColor="inherit"
          value={selectedDate}
          onChange={(event, value) => handleDateChange(value)}
        >
          {dates.map((date) => (
            <Tab key={date} label={formatDateShort(date)} value={date} />
          ))}
        </Tabs>
      </Box>
      <Grid container spacing={1}>
        {Object.entries(activitiesByActivityCode).map(
          ([activityCode, activities]) => (
            <Grid key={activityCode} item xs={12} sm={6} lg={4}>
              <ScheduleCard
                activityCode={activityCode}
                activities={activities}
                competitionEvents={competitionEvents}
                competitionId={competitionId}
              />
            </Grid>
          ),
        )}
      </Grid>
    </>
  );
}

const SCHEDULE_DATE_KEY = "scheduleDate";

function getStoredScheduleDate(competitionId, dates) {
  try {
    const stored = JSON.parse(sessionStorage.getItem(SCHEDULE_DATE_KEY));
    if (
      stored?.competitionId === competitionId &&
      dates.includes(stored?.date)
    ) {
      return stored.date;
    }
    return null;
  } catch {
    return null;
  }
}

function storeScheduleDate(competitionId, date) {
  sessionStorage.setItem(
    SCHEDULE_DATE_KEY,
    JSON.stringify({ competitionId, date }),
  );
}

export default Schedule;
