import { createContext, useContext } from "react";

export const ScheduleDateContext = createContext([null, () => {}]);

/**
 * Returns the schedule date that the user selected most recently,
 * along with a function to update it.
 *
 * The date is a part of the competition home URL, so navigating back
 * restores it on its own. This context is for links that go back to the
 * competition home (like the competition name in the toolbar), so that
 * they can point at the day the user was browsing.
 */
export function useScheduleDate() {
  return useContext(ScheduleDateContext);
}
