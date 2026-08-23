import { Link as RouterLink, useLocation } from "react-router-dom";
import { Box, IconButton, Toolbar, Tooltip, Typography } from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import MenuIcon from "@mui/icons-material/Menu";
import { useScheduleDate } from "../../hooks/useScheduleDate";

function CompetitionToolbar({ competition, onMenuClick }) {
  const location = useLocation();

  // Link back to the schedule day the user was browsing, if any.
  const [scheduleDate] = useScheduleDate();

  return (
    <Toolbar>
      <IconButton
        color="inherit"
        sx={{
          ml: "-12px",
          mr: "20px",
          display: {
            lg: "none",
          },
        }}
        onClick={onMenuClick}
        aria-label="Menu"
        size="large"
      >
        <MenuIcon />
      </IconButton>
      <Typography
        variant="h6"
        color="inherit"
        sx={{
          flexGrow: 1,
          color: "inherit",
          textDecoration: "none",
        }}
        noWrap={true}
        component={RouterLink}
        to={{
          pathname: `/competitions/${competition.id}`,
          search: scheduleDate ? `?date=${scheduleDate}` : "",
        }}
      >
        {competition.shortName}
      </Typography>
      <Box sx={{ flexGrow: 1 }} />
      {competition.access.canScoretake && (
        <Tooltip title="Admin view">
          <IconButton
            color="inherit"
            component={RouterLink}
            to={`/admin${location.pathname}`}
            size="large"
          >
            <LockIcon />
          </IconButton>
        </Tooltip>
      )}
    </Toolbar>
  );
}

export default CompetitionToolbar;
