import { useState } from "react";
import { ScheduleDateContext } from "../../hooks/useScheduleDate";

function ScheduleDateProvider({ children }) {
  const state = useState(null);

  return (
    <ScheduleDateContext.Provider value={state}>
      {children}
    </ScheduleDateContext.Provider>
  );
}

export default ScheduleDateProvider;
