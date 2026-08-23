import { useSearchParams } from "react-router-dom";
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
import { useScheduleDate } from "../../hooks/useScheduleDate";

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

  // We keep the selected date in the URL, so that it's preserved
  // when the user navigates to a round and goes back.
  const [searchParams, setSearchParams] = useSearchParams();
  const [, setScheduleDate] = useScheduleDate();

  const dateParam = searchParams.get("date");
  const selectedDate = dates.includes(dateParam)
    ? dateParam
    : closestDateString(dates);

  function setSelectedDate(date) {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("date", date);
    // Replace the current history entry, so that switching between days
    // doesn't require going back once per switch.
    setSearchParams(newSearchParams, { replace: true });
    // Remember the choice, so that links back to the competition home
    // (like the competition name in the toolbar) point at this day.
    setScheduleDate(date);
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
          onChange={(event, value) => setSelectedDate(value)}
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

export default Schedule;
