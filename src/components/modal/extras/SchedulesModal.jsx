import React, { useState, useEffect } from "react";
import {
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Box,
  Alert,
  Autocomplete,
  CircularProgress,
} from "@mui/material";
import { useSnackbar } from "notistack";
import {
  usePostSchedulesMutation,
  useUpdateSchedulesMutation,
} from "../../../features/api/extras/schedulesApi";
import { useGetAllShowWorkHoursQuery } from "../../../features/api/extras/workHoursApi";
import { useGetAllShowRestDaysQuery } from "../../../features/api/extras/restDaysApi";
import { useGetAllShowWorkWeeksQuery } from "../../../features/api/extras/workWeeksApi";
import { CONSTANT } from "../../../config/router";

export default function SchedulesModal({
  open,
  handleClose,
  selectedSchedule,
}) {
  const [scheduleName, setScheduleName] = useState("");
  const [code, setCode] = useState("");
  const [workHour, setWorkHour] = useState(null);
  const [restDay, setRestDay] = useState(null);
  const [workWeek, setWorkWeek] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [errors, setErrors] = useState({
    scheduleName: false,
    code: false,
    workHour: false,
    restDay: false,
    workWeek: false,
  });

  const [workHourOpen, setWorkHourOpen] = useState(false);
  const [restDayOpen, setRestDayOpen] = useState(false);
  const [workWeekOpen, setWorkWeekOpen] = useState(false);

  const [postSchedule, { isLoading: adding }] = usePostSchedulesMutation();
  const [updateSchedule, { isLoading: updating }] =
    useUpdateSchedulesMutation();
  const { enqueueSnackbar } = useSnackbar();

  const { data: workHoursData, isLoading: loadingWorkHours } =
    useGetAllShowWorkHoursQuery(
      { pagination: "none", status: "active" },
      { skip: !workHourOpen },
    );

  const { data: restDaysData, isLoading: loadingRestDays } =
    useGetAllShowRestDaysQuery(
      { pagination: "none", status: "active" },
      { skip: !restDayOpen },
    );

  const { data: workWeeksData, isLoading: loadingWorkWeeks } =
    useGetAllShowWorkWeeksQuery(
      { pagination: "none", status: "active" },
      { skip: !workWeekOpen },
    );

  const workHoursList = workHoursData?.result || workHoursData?.data || [];
  const restDaysList = restDaysData?.result || restDaysData?.data || [];
  const workWeeksList = workWeeksData?.result || workWeeksData?.data || [];

  useEffect(() => {
    if (open) {
      setScheduleName(selectedSchedule?.name || "");
      setCode(selectedSchedule?.code || "");
      setWorkHour(null);
      setRestDay(null);
      setWorkWeek(null);
      setWorkHourOpen(false);
      setRestDayOpen(false);
      setWorkWeekOpen(false);
      setErrorMessage(null);
      setErrors({
        scheduleName: false,
        code: false,
        workHour: false,
        restDay: false,
        workWeek: false,
      });
    }
  }, [open, selectedSchedule]);

  useEffect(() => {
    if (
      selectedSchedule?.work_hour_id &&
      workHoursList.length > 0 &&
      !workHour
    ) {
      const found = workHoursList.find(
        (w) => w.id === selectedSchedule.work_hour_id,
      );
      if (found) setWorkHour(found);
    }
  }, [workHoursList]);

  useEffect(() => {
    if (selectedSchedule?.rest_day_id && restDaysList.length > 0 && !restDay) {
      const found = restDaysList.find(
        (r) => r.id === selectedSchedule.rest_day_id,
      );
      if (found) setRestDay(found);
    }
  }, [restDaysList]);

  useEffect(() => {
    if (
      selectedSchedule?.work_week_id &&
      workWeeksList.length > 0 &&
      !workWeek
    ) {
      const found = workWeeksList.find(
        (wk) => wk.id === selectedSchedule.work_week_id,
      );
      if (found) setWorkWeek(found);
    }
  }, [workWeeksList]);

  const handleSubmit = async () => {
    setErrorMessage(null);
    let newErrors = {
      scheduleName: false,
      code: false,
      workHour: false,
      restDay: false,
      workWeek: false,
    };

    if (!code.trim()) newErrors.code = true;
    if (!workHour) newErrors.workHour = true;
    if (!restDay) newErrors.restDay = true;
    if (!workWeek) newErrors.workWeek = true;

    setErrors(newErrors);

    if (Object.values(newErrors).some(Boolean)) {
      setErrorMessage("Please fill out all required fields.");
      return;
    }

    const payload = {
      name: scheduleName.trim(),
      code: code.trim(),
      work_hour_id: workHour.id,
      rest_day_id: restDay.id,
      work_week_id: workWeek.id,
      status: selectedSchedule ? selectedSchedule.status : "active",
    };

    try {
      if (selectedSchedule) {
        await updateSchedule({ id: selectedSchedule.id, ...payload }).unwrap();
        enqueueSnackbar("Schedule updated successfully!", {
          variant: "success",
          autoHideDuration: 2000,
        });
      } else {
        await postSchedule(payload).unwrap();
        enqueueSnackbar("Schedule added successfully!", {
          variant: "success",
          autoHideDuration: 2000,
        });
      }

      handleClose();
    } catch (error) {
      const errorMsg = error?.data?.errors?.code
        ? "The code has already been taken. Please use a different code."
        : error?.data?.message || "An error occurred. Please try again.";
      setErrorMessage(errorMsg);
    }
  };

  const isDisabled = adding || updating;

  return (
    <Dialog open={open} onClose={!isDisabled ? handleClose : undefined}>
      <DialogTitle className="dialog_title">
        <Box className="dialog_title_text">
          {selectedSchedule ? "EDIT SCHEDULE" : "ADD SCHEDULE"}
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box minWidth={350}>
          {errorMessage && (
            <Alert severity="error" sx={{ marginTop: 1 }}>
              {errorMessage}
            </Alert>
          )}

          <TextField
            label="Code"
            variant="outlined"
            fullWidth
            margin="dense"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            disabled={isDisabled}
            error={errors.code}
            helperText={errors.code ? "Code is required" : ""}
            sx={{ marginTop: 3 }}
          />

          <TextField
            label="Schedule Name"
            variant="outlined"
            fullWidth
            margin="dense"
            value={scheduleName}
            onChange={(e) => setScheduleName(e.target.value)}
            disabled={isDisabled}
            error={errors.scheduleName}
            helperText={errors.scheduleName ? "Schedule Name is required" : ""}
          />

          <Autocomplete
            options={workHoursList}
            getOptionLabel={(option) =>
              option.name
                ? `(${option.code}) - ${option.name}`
                : option.code || ""
            }
            value={workHour}
            onChange={(_, newValue) => setWorkHour(newValue)}
            disabled={isDisabled}
            loading={loadingWorkHours}
            open={workHourOpen}
            onOpen={() => setWorkHourOpen(true)}
            onClose={() => setWorkHourOpen(false)}
            isOptionEqualToValue={(option, value) => option.id === value?.id}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Work Hour"
                margin="dense"
                fullWidth
                error={errors.workHour}
                helperText={errors.workHour ? "Work Hour is required" : ""}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loadingWorkHours ? (
                        <CircularProgress color="inherit" size={18} />
                      ) : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />

          <Autocomplete
            options={restDaysList}
            getOptionLabel={(option) =>
              option.name
                ? `(${option.code}) - ${option.name}`
                : option.code || ""
            }
            value={restDay}
            onChange={(_, newValue) => setRestDay(newValue)}
            disabled={isDisabled}
            loading={loadingRestDays}
            open={restDayOpen}
            onOpen={() => setRestDayOpen(true)}
            onClose={() => setRestDayOpen(false)}
            isOptionEqualToValue={(option, value) => option.id === value?.id}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Rest Day"
                margin="dense"
                fullWidth
                error={errors.restDay}
                helperText={errors.restDay ? "Rest Day is required" : ""}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loadingRestDays ? (
                        <CircularProgress color="inherit" size={18} />
                      ) : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />

          <Autocomplete
            options={workWeeksList}
            getOptionLabel={(option) =>
              option.name
                ? `(${option.code}) - ${option.name}`
                : option.code || ""
            }
            value={workWeek}
            onChange={(_, newValue) => setWorkWeek(newValue)}
            disabled={isDisabled}
            loading={loadingWorkWeeks}
            open={workWeekOpen}
            onOpen={() => setWorkWeekOpen(true)}
            onClose={() => setWorkWeekOpen(false)}
            isOptionEqualToValue={(option, value) => option.id === value?.id}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Work Week"
                margin="dense"
                fullWidth
                error={errors.workWeek}
                helperText={errors.workWeek ? "Work Week is required" : ""}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loadingWorkWeeks ? (
                        <CircularProgress color="inherit" size={18} />
                      ) : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button
          variant="contained"
          color="inherit"
          className="cancel_button"
          onClick={handleClose}
          size="medium"
          disabled={isDisabled}>
          <>
            {CONSTANT.BUTTONS.CANCEL.icon}
            {CONSTANT.BUTTONS.CANCEL.label}
          </>
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          size="medium"
          className="add_button"
          disabled={isDisabled}>
          {isDisabled ? (
            "Saving..."
          ) : (
            <>
              {selectedSchedule
                ? CONSTANT.BUTTONS.ADD.icon2
                : CONSTANT.BUTTONS.ADD.icon1}
              {selectedSchedule
                ? CONSTANT.BUTTONS.ADD.label2
                : CONSTANT.BUTTONS.ADD.label1}
            </>
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
