import React, { useEffect, useMemo, useState } from "react";
import { useFormContext, Controller } from "react-hook-form";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  IconButton,
  Box,
  TextField,
  CircularProgress,
  Tooltip,
  Checkbox,
  FormControlLabel,
  Autocomplete,
  Paper,
  Avatar,
  Chip,
} from "@mui/material";
import {
  Close as CloseIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Description as DescriptionIcon,
  DragIndicator as DragIcon,
  Person as PersonIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import EditOffIcon from "@mui/icons-material/EditOff";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { ReactSortable } from "react-sortablejs";
import { useGetFormUserOptionsQuery } from "../../../features/api/usermanagement/userApi";

const getPositionDisplay = (position) => {
  if (!position) return "";
  if (typeof position === "string") return position;
  if (typeof position === "object") {
    return position.position_name || position.name || "";
  }
  return String(position);
};

const getDepartmentDisplay = (department) => {
  if (!department) return "";
  if (typeof department === "string") return department;
  if (typeof department === "object") {
    return department.department_name || department.name || "";
  }
  return String(department);
};

const getUserName = (user) =>
  user?.full_name || user?.name || user?.username || "Unknown User";

const getEntryValues = (entry) => ({
  id: entry?.id,
  name: entry?.name || "",
  code: entry?.code || "",
  description: entry?.description || "",
  requires_employee_signature: !!entry?.requires_employee_signature,
  receiver_user_id: entry?.receiver?.id ?? "",
});

const getEntrySequence = (entry) =>
  [...(entry?.standard_approvers || [])]
    .sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0))
    .map((approver, index) => ({
      id: approver.id,
      name: getUserName(approver),
      username: approver.username || "",
      position: getPositionDisplay(approver.position),
      department: getDepartmentDisplay(approver.department),
      order: index + 1,
    }));

// Handles: { result: [...] }, { result: { data: [...] } }, plain array
const extractOptions = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.result)) return data.result;
  if (Array.isArray(data.result?.data)) return data.result.data;
  if (Array.isArray(data.data)) return data.data;
  return [];
};

// Searchable user dropdown: GET forms/user-options?search=
// Used by both the Receiver and the Approver pickers.
const UserOptionAutocomplete = ({
  label,
  value,
  onChange,
  excludeIds = [],
  disabled = false,
  error = false,
  helperText,
  sx,
}) => {
  const [opened, setOpened] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isFetching } = useGetFormUserOptionsQuery(
    { search: debouncedSearch },
    { skip: !opened },
  );

  // Selected value is always part of the options so it stays visible
  // even when the search term changes.
  const options = useMemo(() => {
    const fromApi = extractOptions(data).filter(
      (option) => !excludeIds.includes(option.id) || option.id === value?.id,
    );
    if (value && !fromApi.some((option) => option.id === value.id)) {
      return [value, ...fromApi];
    }
    return fromApi;
  }, [data, excludeIds, value]);

  return (
    <Autocomplete
      options={options}
      value={value || null}
      onChange={(e, option) => onChange(option || null)}
      onOpen={() => setOpened(true)}
      onInputChange={(e, text, reason) => {
        if (reason === "input" || reason === "clear") {
          setSearch(text);
        }
      }}
      getOptionLabel={(option) => option?.full_name || getUserName(option)}
      filterOptions={(list) => list}
      getOptionDisabled={(option) => option?.has_user_account === false}
      isOptionEqualToValue={(option, selected) => option?.id === selected?.id}
      loading={isFetching}
      loadingText="Loading users..."
      noOptionsText={
        debouncedSearch ? `No users found for "${debouncedSearch}"` : "No users"
      }
      disabled={disabled}
      sx={sx}
      renderOption={(props, option) => (
        <li {...props} key={option.id}>
          <Box>
            <Typography
              sx={{
                fontSize: "13px",
                fontWeight: 700,
                textTransform: "uppercase",
              }}>
              {getUserName(option)}
            </Typography>
            <Typography sx={{ fontSize: "11px", color: "text.secondary" }}>
              {[
                option.employee_code || option.username,
                option.position_title || getPositionDisplay(option.position),
              ]
                .filter(Boolean)
                .join(" · ")}
              {option.has_user_account === false ? " · No user account" : ""}
            </Typography>
          </Box>
        </li>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          error={error}
          helperText={helperText}
          sx={{ backgroundColor: "white" }}
        />
      )}
    />
  );
};

const FieldGrid = ({ children }) => (
  <Box
    sx={{
      display: "grid",
      gridTemplateColumns: "repeat(12, minmax(0, 1fr))",
      columnGap: 2,
      rowGap: 2.5,
      width: "100%",
      pt: 1,
    }}>
    {children}
  </Box>
);

const Col = ({ span = 12, children }) => (
  <Box
    sx={{
      gridColumn: { xs: "span 12", sm: `span ${span}` },
      minWidth: 0,
    }}>
    {children}
  </Box>
);

const InfoField = ({ label, value, secondary }) => (
  <Box>
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
    <Typography
      variant="body1"
      sx={{ fontWeight: 600, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
      {value || "-"}
    </Typography>
    {secondary && (
      <Typography variant="body2" color="text.secondary">
        {secondary}
      </Typography>
    )}
  </Box>
);

const StatusChip = ({ label, tone }) => {
  const tones = {
    success: { bg: "#e8f5e8", color: "#2e7d32", border: "#4caf50" },
    warning: { bg: "#fff4e5", color: "#ed6c02", border: "#ff9800" },
    neutral: { bg: "#f5f5f5", color: "#616161", border: "#bdbdbd" },
  };
  const current = tones[tone] || tones.neutral;

  return (
    <Chip
      label={label}
      size="small"
      sx={{
        backgroundColor: current.bg,
        color: current.color,
        border: `1px solid ${current.border}`,
        fontWeight: 600,
        fontSize: "11px",
        height: "24px",
        borderRadius: "12px",
        "& .MuiChip-label": {
          padding: "0 8px",
        },
      }}
    />
  );
};

const ChipField = ({ label, chip }) => (
  <Box>
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
    <Box sx={{ mt: 0.5 }}>{chip}</Box>
  </Box>
);

const FormModal = ({
  open = false,
  onClose,
  onSave,
  selectedEntry = null,
  isLoading = false,
  mode = "create",
}) => {
  const {
    control,
    formState: { errors },
    reset,
    handleSubmit,
  } = useFormContext();

  const [currentMode, setCurrentMode] = useState(mode);
  const [originalMode, setOriginalMode] = useState(mode);
  const [approverSequence, setApproverSequence] = useState([]);
  // option object picked in the Approver dropdown (before pressing ADD)
  const [selectedApprover, setSelectedApprover] = useState(null);
  // option object picked in the Receiver dropdown
  const [receiverPicked, setReceiverPicked] = useState(null);

  const approverIds = useMemo(
    () => approverSequence.map((app) => app.id),
    [approverSequence],
  );

  // Resolve the Receiver form value (id) into an option object
  const resolveReceiver = (id) => {
    if (!id) return null;
    if (receiverPicked?.id === id) return receiverPicked;
    if (selectedEntry?.receiver?.id === id) return selectedEntry.receiver;
    return null;
  };

  useEffect(() => {
    if (open) {
      setCurrentMode(mode);
      setOriginalMode(mode);
      setReceiverPicked(null);

      if (mode === "create") {
        reset({
          name: "",
          code: "",
          description: "",
          requires_employee_signature: false,
          receiver_user_id: "",
        });
      } else if (selectedEntry && (mode === "view" || mode === "edit")) {
        reset(getEntryValues(selectedEntry));
      }
    }
  }, [open, mode, selectedEntry, reset]);

  useEffect(() => {
    if (open) {
      if (mode === "create") {
        setApproverSequence([]);
      } else if (selectedEntry && (mode === "view" || mode === "edit")) {
        setApproverSequence(getEntrySequence(selectedEntry));
      }
      setSelectedApprover(null);
    }
  }, [open, mode, selectedEntry]);

  const handleModeChange = (newMode) => {
    setCurrentMode(newMode);
  };

  const handleCancelEdit = () => {
    setCurrentMode(originalMode);
    if (selectedEntry) {
      reset(getEntryValues(selectedEntry));
      setReceiverPicked(null);
      setApproverSequence(getEntrySequence(selectedEntry));
      setSelectedApprover(null);
    }
  };

  const handleDragEnd = (newOrder) => {
    const updatedItems = newOrder.map((item, index) => ({
      ...item,
      order: index + 1,
    }));
    setApproverSequence([...updatedItems]);
  };

  const handleAddApprover = (option) => {
    if (!option) return;

    const newApprover = {
      id: option.id,
      name: getUserName(option),
      username: option.username || option.employee_code || "",
      position: option.position_title || getPositionDisplay(option.position),
      department: getDepartmentDisplay(option.department),
      order: approverSequence.length + 1,
    };
    setApproverSequence([...approverSequence, newApprover]);
    setSelectedApprover(null);
  };

  const handleRemoveApprover = (userId) => {
    const updatedSequence = approverSequence
      .filter((app) => app.id !== userId)
      .map((item, index) => ({
        ...item,
        order: index + 1,
      }));
    setApproverSequence([...updatedSequence]);
  };

  const onSubmit = (data) => {
    const payload = {
      ...data,
      receiver_user_id: data.receiver_user_id || null,
      standard_approver_ids: approverSequence.map((app) => app.id),
    };

    if (onSave) {
      onSave(payload, currentMode);
    }
  };

  const handleClose = () => {
    reset();
    setApproverSequence([]);
    setSelectedApprover(null);
    setReceiverPicked(null);
    setCurrentMode(mode);
    setOriginalMode(mode);
    onClose();
  };

  const getModalTitle = () => {
    switch (currentMode) {
      case "create":
        return "CREATE NEW FORM";
      case "view":
        return "VIEW FORM";
      case "edit":
        return "EDIT FORM";
      default:
        return "Form";
    }
  };

  const isReadOnly = currentMode === "view";
  const isCreate = currentMode === "create";
  const isViewMode = currentMode === "view";
  const isEditMode = currentMode === "edit";

  const receiver = selectedEntry?.receiver;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            width: "100%",
            maxHeight: "85vh",
          },
        }}>
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            pb: 1,
            backgroundColor: "#fff",
          }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <DescriptionIcon sx={{ color: "rgb(33, 61, 112)" }} />
            <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
              {getModalTitle()}
            </Typography>
            {isViewMode && (
              <Tooltip title="EDIT FORM" arrow placement="top">
                <IconButton
                  onClick={() => handleModeChange("edit")}
                  disabled={isLoading}
                  size="small"
                  sx={{
                    ml: 1,
                    padding: "8px",
                    "&:hover": {
                      backgroundColor: "rgba(0, 136, 32, 0.08)",
                      transform: "scale(1.1)",
                      transition: "all 0.2s ease-in-out",
                    },
                  }}>
                  <EditIcon
                    sx={{
                      fontSize: "20px",
                      "& path": {
                        fill: isLoading
                          ? "rgba(0, 0, 0, 0.26)"
                          : "rgba(0, 136, 32, 1)",
                      },
                    }}
                  />
                </IconButton>
              </Tooltip>
            )}
            {isEditMode && originalMode === "view" && (
              <Tooltip title="CANCEL EDIT">
                <IconButton
                  onClick={handleCancelEdit}
                  disabled={isLoading}
                  size="small"
                  sx={{
                    ml: 1,
                    padding: "8px",
                    "&:hover": {
                      backgroundColor: "rgba(235, 0, 0, 0.08)",
                      transform: "scale(1.1)",
                      transition: "all 0.2s ease-in-out",
                    },
                  }}>
                  <EditOffIcon
                    sx={{
                      fontSize: "20px",
                      "& path": {
                        fill: "rgba(235, 0, 0, 1)",
                      },
                    }}
                  />
                </IconButton>
              </Tooltip>
            )}
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton
              onClick={handleClose}
              sx={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                backgroundColor: "#fff",
                "&:hover": {
                  backgroundColor: "#f5f5f5",
                },
                transition: "all 0.2s ease-in-out",
              }}>
              <CloseIcon
                sx={{
                  fontSize: "18px",
                  color: "#333",
                }}
              />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ backgroundColor: "#fff", pt: 2 }}>
          {!isCreate && selectedEntry && (
            <Box sx={{ mb: 1, p: 0.5, borderRadius: 1 }}>
              {selectedEntry.updated_at && (
                <Typography variant="body2" color="text.secondary">
                  Last Updated:{" "}
                  {dayjs(selectedEntry.updated_at).format("MMM DD, YYYY HH:mm")}
                </Typography>
              )}
            </Box>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGrid>
              {isReadOnly ? (
                <>
                  <Col span={8}>
                    <InfoField label="Form Name" value={selectedEntry?.name} />
                  </Col>

                  <Col span={4}>
                    <InfoField label="Form Code" value={selectedEntry?.code} />
                  </Col>

                  <Col span={12}>
                    <InfoField
                      label="Description"
                      value={selectedEntry?.description}
                    />
                  </Col>

                  <Col span={4}>
                    <ChipField
                      label="Requires Signature"
                      chip={
                        <StatusChip
                          label={
                            selectedEntry?.requires_employee_signature
                              ? "YES"
                              : "NO"
                          }
                          tone={
                            selectedEntry?.requires_employee_signature
                              ? "success"
                              : "neutral"
                          }
                        />
                      }
                    />
                  </Col>

                  <Col span={8}>
                    <InfoField
                      label="Receiver"
                      value={receiver?.full_name}
                      secondary={receiver?.username}
                    />
                  </Col>
                </>
              ) : (
                <>
                  <Col span={6}>
                    <Controller
                      name="name"
                      control={control}
                      rules={{ required: "Form name is required" }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label={
                            <span>
                              Form Name <span style={{ color: "red" }}>*</span>
                            </span>
                          }
                          fullWidth
                          error={!!errors.name}
                          helperText={errors.name?.message}
                          sx={{ backgroundColor: "white" }}
                        />
                      )}
                    />
                  </Col>

                  <Col span={6}>
                    <Controller
                      name="code"
                      control={control}
                      rules={{ required: "Form code is required" }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label={
                            <span>
                              Form Code <span style={{ color: "red" }}>*</span>
                            </span>
                          }
                          fullWidth
                          error={!!errors.code}
                          helperText={errors.code?.message}
                          sx={{ backgroundColor: "white" }}
                        />
                      )}
                    />
                  </Col>

                  <Col span={12}>
                    <Controller
                      name="description"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Description"
                          fullWidth
                          multiline
                          rows={4}
                          error={!!errors.description}
                          helperText={errors.description?.message}
                          sx={{ backgroundColor: "white" }}
                        />
                      )}
                    />
                  </Col>

                  <Col span={12}>
                    <Controller
                      name="receiver_user_id"
                      control={control}
                      defaultValue=""
                      render={({ field }) => (
                        <UserOptionAutocomplete
                          label="Receiver"
                          value={resolveReceiver(field.value)}
                          onChange={(option) => {
                            setReceiverPicked(option);
                            field.onChange(option?.id ?? "");
                          }}
                          error={!!errors.receiver_user_id}
                          helperText={errors.receiver_user_id?.message}
                        />
                      )}
                    />
                  </Col>

                  <Col span={12}>
                    <Controller
                      name="requires_employee_signature"
                      control={control}
                      defaultValue={false}
                      render={({ field }) => (
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={!!field.value}
                              onChange={(e) => field.onChange(e.target.checked)}
                              onBlur={field.onBlur}
                              inputRef={field.ref}
                            />
                          }
                          label="Requires Employee Signature"
                        />
                      )}
                    />
                  </Col>
                </>
              )}

              <Col span={12}>
                <Box sx={{ width: "100%" }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Approver Sequence
                  </Typography>

                  {!isReadOnly && (
                    <Box
                      sx={{
                        mb: 2,
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 1,
                        width: "100%",
                      }}>
                      <UserOptionAutocomplete
                        label="Select Approver"
                        value={selectedApprover}
                        onChange={setSelectedApprover}
                        excludeIds={approverIds}
                        sx={{ flex: 1, minWidth: 0 }}
                      />
                      <Button
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={() => handleAddApprover(selectedApprover)}
                        disabled={!selectedApprover}
                        sx={{
                          height: "56px",
                          minWidth: "100px",
                          textTransform: "none",
                          borderColor: "rgb(33, 61, 112)",
                          color: "rgb(33, 61, 112)",
                          "&:hover": {
                            backgroundColor: "rgba(33, 61, 112, 0.04)",
                          },
                        }}>
                        ADD
                      </Button>
                    </Box>
                  )}

                  <Box sx={{ width: "100%" }}>
                    <ReactSortable
                      list={[...approverSequence]}
                      setList={handleDragEnd}
                      disabled={isReadOnly}
                      animation={200}
                      delayOnTouchStart={true}
                      delay={2}
                      ghostClass="sortable-ghost"
                      chosenClass="sortable-chosen"
                      dragClass="sortable-drag"
                      filter=".no-drag"
                      style={{ width: "100%" }}>
                      {approverSequence.length === 0 ? (
                        <Paper
                          sx={{
                            p: 3,
                            textAlign: "center",
                            backgroundColor: "#f8f9fa",
                            border: "2px dashed #ddd",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "100%",
                            boxSizing: "border-box",
                          }}>
                          <Typography color="text.secondary">
                            No approvers added yet.{" "}
                            {!isReadOnly &&
                              "Select approvers from the dropdown above."}
                          </Typography>
                        </Paper>
                      ) : (
                        approverSequence.map((approver) => (
                          <Paper
                            key={approver.id}
                            sx={{
                              p: 2,
                              mb: 1,
                              display: "flex",
                              alignItems: "center",
                              backgroundColor: "white",
                              border: "1px solid #e0e0e0",
                              cursor: isReadOnly ? "default" : "move",
                              width: "100%",
                              boxSizing: "border-box",
                              "&.sortable-chosen": {
                                backgroundColor: "#e3f2fd",
                              },
                              "&.sortable-drag": {
                                backgroundColor: "#bbdefb",
                              },
                              "&.sortable-ghost": {
                                backgroundColor: "#f5f5f5",
                                opacity: 0.5,
                              },
                            }}>
                            {!isReadOnly && (
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  mr: 2,
                                  color: "text.secondary",
                                  cursor: "move",
                                }}>
                                <DragIcon />
                              </Box>
                            )}

                            <Chip
                              label={approver.order}
                              size="small"
                              sx={{
                                mr: 2,
                                backgroundColor: "rgb(33, 61, 112)",
                                color: "white",
                                fontWeight: 600,
                              }}
                            />
                            <Avatar sx={{ mr: 2, bgcolor: "rgb(33, 61, 112)" }}>
                              <PersonIcon />
                            </Avatar>

                            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                              <Typography
                                variant="body1"
                                sx={{ fontWeight: 600 }}>
                                {approver.name}
                              </Typography>
                              {approver.position && (
                                <Typography
                                  variant="body2"
                                  color="text.secondary">
                                  {approver.position}
                                </Typography>
                              )}
                              {approver.department && (
                                <Typography
                                  variant="body2"
                                  color="text.secondary">
                                  {approver.department}
                                </Typography>
                              )}
                              {approver.username && (
                                <Typography
                                  variant="caption"
                                  color="text.secondary">
                                  {approver.username}
                                </Typography>
                              )}
                            </Box>

                            {!isReadOnly && (
                              <IconButton
                                onClick={() =>
                                  handleRemoveApprover(approver.id)
                                }
                                size="small"
                                className="no-drag"
                                sx={{
                                  color: "error.main",
                                }}>
                                <DeleteIcon />
                              </IconButton>
                            )}
                          </Paper>
                        ))
                      )}
                    </ReactSortable>
                  </Box>
                </Box>
              </Col>
            </FieldGrid>
          </form>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, backgroundColor: "#fff" }}>
          {!isReadOnly && (
            <Button
              onClick={handleSubmit(onSubmit)}
              variant="contained"
              disabled={isLoading}
              startIcon={
                isLoading ? (
                  <CircularProgress size={16} />
                ) : currentMode === "create" ? (
                  <AddIcon />
                ) : (
                  <EditIcon />
                )
              }
              sx={{
                backgroundColor: "#4CAF50 !important",
                color: "white !important",
                fontWeight: 600,
                textTransform: "uppercase",
                px: 3,
                py: 1,
                borderRadius: "8px",
                border: "none !important",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                "&:hover": {
                  backgroundColor: "#45a049 !important",
                  border: "none !important",
                },
                "&:disabled": {
                  backgroundColor: "#cccccc !important",
                  color: "#666666 !important",
                  border: "none !important",
                },
              }}>
              {isLoading
                ? "Saving..."
                : currentMode === "create"
                  ? "Create"
                  : "Update"}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

FormModal.displayName = "FormModal";

export default FormModal;
