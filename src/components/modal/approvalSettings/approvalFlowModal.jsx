import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useForm } from "react-hook-form";
import {
  Typography,
  Box,
  Grid,
  CircularProgress,
  Autocomplete,
  TextField,
  Paper,
  Avatar,
  Chip,
  Button,
  IconButton,
  Tooltip,
  Skeleton,
} from "@mui/material";
import {
  DragIndicator as DragIcon,
  Person as PersonIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { ReactSortable } from "react-sortablejs";
import { useSnackbar } from "notistack";
import ApprovalFlowActions from "./ApprovalFlowActions";
import {
  useGetSingleApprovalFlowQuery,
  useGetApproverOptionsQuery,
  useUpdateApprovalFlowMutation,
} from "../../../features/api/approvalsetting/approvalFlowApi";

const toText = (value) => {
  if (value === null || value === undefined) return "";
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }
  if (typeof value === "object") {
    return toText(
      value.name ?? value.title ?? value.position_name ?? value.code ?? "",
    );
  }
  return "";
};

const OptionsHintContext = createContext("");

const HintPaper = ({ children, ...other }) => {
  const hint = useContext(OptionsHintContext);
  return (
    <Paper {...other}>
      {hint && (
        <Box
          sx={{
            px: 1.5,
            py: 0.75,
            fontSize: "12px",
            color: "#5f6b7a",
            backgroundColor: "#fafbfc",
            borderBottom: "1px solid #e8ebef",
          }}>
          {hint}
        </Box>
      )}
      {children}
    </Paper>
  );
};

const formatStatusLabel = (status) => {
  const text = toText(status);
  return text ? text.replace(/_/g, " ") : "-";
};

const InfoField = ({ label, value }) => (
  <Box>
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="body1" sx={{ fontWeight: 600 }}>
      {toText(value) || "-"}
    </Typography>
  </Box>
);

const InfoFieldSkeleton = ({ label, width = "80%" }) => (
  <Box>
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
    <Skeleton variant="text" width={width} height={28} />
  </Box>
);

const ApproverSkeletonItem = () => (
  <Paper
    sx={{
      p: 2,
      mb: 1,
      display: "flex",
      alignItems: "center",
      backgroundColor: "white",
      border: "1px solid #e0e0e0",
      width: "100%",
    }}>
    <Skeleton
      variant="rounded"
      width={28}
      height={24}
      sx={{ mr: 2, borderRadius: "12px" }}
    />
    <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
    <Box sx={{ flexGrow: 1 }}>
      <Skeleton variant="text" width="45%" height={24} />
      <Skeleton variant="text" width="25%" height={20} />
    </Box>
  </Paper>
);

const buildApproverSequence = (entry, allPositions) => {
  const list = Array.isArray(entry?.approvers) ? entry.approvers : [];

  return list
    .filter((approver) => approver && typeof approver === "object")
    .map((approver, index) => {
      const id =
        approver.position_id ?? approver.approver_position_id ?? approver.id;
      const details = allPositions.find((p) => p.id === id);

      return {
        id,
        name:
          toText(approver.name) ||
          toText(approver.title) ||
          toText(approver.position_name) ||
          toText(details?.name) ||
          toText(details?.title) ||
          toText(details?.position_name) ||
          "Unknown Position",
        code: toText(approver.code) || toText(details?.code) || "",
        holder_name: toText(approver.holder?.full_name),
        is_vacant: toText(approver.issue) === "VACANT",
        order: approver.step_number ?? approver.sequence ?? index + 1,
        step_id: approver.step_id,
      };
    })
    .sort((a, b) => a.order - b.order)
    .map((approver, index) => ({ ...approver, order: index + 1 }));
};

const ApprovalFlowModal = ({
  open = false,
  onClose,
  onSave,
  selectedEntry = null,
  isLoading = false,
  mode = "view",
}) => {
  const { enqueueSnackbar } = useSnackbar();

  const { handleSubmit } = useForm();

  const [currentMode, setCurrentMode] = useState(mode);
  const [approverSequence, setApproverSequence] = useState([]);
  const [selectedApprover, setSelectedApprover] = useState(null);
  const [approverSearchInput, setApproverSearchInput] = useState("");
  const [debouncedApproverSearch, setDebouncedApproverSearch] = useState("");
  const approverInputReasonRef = useRef("input");

  const {
    data: positionsData,
    isLoading: isPositionsLoading,
    isFetching: isPositionsFetching,
  } = useGetApproverOptionsQuery(
    {
      exclude_position_id: selectedEntry?.id,
      search: debouncedApproverSearch,
    },
    { skip: !open || !selectedEntry?.id },
  );

  const { data: singleData, isFetching: isDetailFetching } =
    useGetSingleApprovalFlowQuery(selectedEntry?.id, {
      skip: !open || !selectedEntry?.id,
      refetchOnMountOrArgChange: true,
    });

  const [updateApprovalFlow, { isLoading: isUpdating }] =
    useUpdateApprovalFlowMutation();

  const detail = singleData?.result || selectedEntry;

  const positions = useMemo(() => {
    const list =
      positionsData?.result?.data ||
      positionsData?.result ||
      positionsData?.data ||
      positionsData ||
      [];
    return Array.isArray(list)
      ? list
          .filter((p) => p && !p.deleted_at)
          .map((p) => ({
            ...p,
            id: p.id ?? p.position_id,
            name: toText(p.name) || toText(p.title) || toText(p.position_name),
            code: toText(p.code),
            charging: toText(p.charging),
            department: toText(p.department ?? p.department_name),
            holder_name: toText(
              p.holder?.full_name ?? p.holder_name ?? p.employee?.full_name,
            ),
          }))
      : [];
  }, [positionsData]);

  const totalPositions =
    positionsData?.meta?.total ??
    positionsData?.result?.meta?.total ??
    positionsData?.result?.total ??
    positionsData?.total ??
    null;

  const approverOptionsHint =
    totalPositions !== null
      ? `${totalPositions} positions${
          totalPositions > positions.length
            ? ` · showing ${positions.length}, keep typing`
            : ""
        }`
      : "";

  const availablePositions = useMemo(() => {
    const currentApproverIds = approverSequence.map((app) => app.id);
    return positions.filter(
      (position) => !currentApproverIds.includes(position.id),
    );
  }, [positions, approverSequence]);

  const resetAllState = () => {
    setApproverSequence([]);
    setSelectedApprover(null);
    approverInputReasonRef.current = "clear";
    setApproverSearchInput("");
    setDebouncedApproverSearch("");
  };

  useEffect(() => {
    if (
      approverInputReasonRef.current !== "input" &&
      approverInputReasonRef.current !== "clear"
    ) {
      return;
    }
    const timeout = setTimeout(() => {
      setDebouncedApproverSearch(approverSearchInput.trim());
    }, 400);
    return () => clearTimeout(timeout);
  }, [approverSearchInput]);

  useEffect(() => {
    if (open) {
      setCurrentMode(mode);
    } else {
      resetAllState();
      setCurrentMode(mode);
    }
  }, [open, mode]);

  useEffect(() => {
    if (open && detail && (mode === "view" || mode === "edit")) {
      setApproverSequence(buildApproverSequence(detail, []));
      setSelectedApprover(null);
    }
  }, [open, mode, detail]);

  const handleModeChange = (newMode) => {
    setCurrentMode(newMode);
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
      name: toText(option.name) || "Unknown Position",
      code: toText(option.code),
      holder_name: toText(option.holder_name),
      is_vacant: false,
      order: approverSequence.length + 1,
    };
    setApproverSequence([...approverSequence, newApprover]);
    setSelectedApprover(null);
    approverInputReasonRef.current = "clear";
    setApproverSearchInput("");
  };

  const handleRemoveApprover = (positionId) => {
    const updatedSequence = approverSequence
      .filter((app) => app.id !== positionId)
      .map((item, index) => ({
        ...item,
        order: index + 1,
      }));
    setApproverSequence([...updatedSequence]);
  };

  const onSubmit = async () => {
    if (!detail?.id) return;

    try {
      const formData = {
        approver_position_ids: approverSequence.map((app) => app.id),
      };

      await updateApprovalFlow({
        id: detail.id,
        data: formData,
      }).unwrap();

      enqueueSnackbar("Approvers updated successfully!", {
        variant: "success",
        autoHideDuration: 2000,
      });

      if (onSave) {
        onSave();
      }
      handleClose();
    } catch (error) {
      enqueueSnackbar(
        error?.data?.message || "An error occurred. Please try again.",
        {
          variant: "error",
          autoHideDuration: 2000,
        },
      );
    }
  };

  const handleClose = () => {
    resetAllState();
    setCurrentMode(mode);
    onClose();
  };

  const handleEditClick = () => {
    setCurrentMode("edit");
  };

  const EditCloseButtons = () => (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      {currentMode === "view" && (
        <Button
          onClick={handleEditClick}
          variant="contained"
          startIcon={<EditIcon />}
          sx={{
            backgroundColor: "#22c55e",
            color: "white",
            textTransform: "none",
            fontWeight: 700,
            fontSize: "0.875rem",
            px: 2.5,
            py: 0.75,
            borderRadius: "4px",
            minHeight: "32px",
            letterSpacing: "0.02em",
            boxShadow: "none",
            "&:hover": {
              backgroundColor: "#16a34a",
              boxShadow: "none",
            },
            "& .MuiButton-startIcon": {
              marginRight: "6px",
              "& svg": {
                fontSize: "16px",
              },
            },
          }}>
          EDIT
        </Button>
      )}
      <Tooltip title="Close">
        <IconButton
          onClick={handleClose}
          size="small"
          sx={{
            width: 40,
            height: 40,
            color: "#d32f2f",
            border: "1px solid rgba(211, 47, 47, 0.3)",
            "&:hover": {
              backgroundColor: "rgba(211, 47, 47, 0.04)",
              border: "1px solid #d32f2f",
            },
          }}>
          <CloseIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );

  const isReadOnly = currentMode === "view";
  const isSaving = isUpdating;
  const showSkeleton = isLoading || isDetailFetching || isPositionsLoading;

  const isStatusSet = Boolean(detail?.status) && detail.status !== "NOT_SET";

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <ApprovalFlowActions
        open={open}
        onClose={handleClose}
        currentMode={currentMode}
        onModeChange={handleModeChange}
        onSubmit={onSubmit}
        isLoading={isSaving}
        selectedEntry={selectedEntry}
        approverSequence={approverSequence}
        isApproversLoading={isPositionsLoading}
        handleSubmit={handleSubmit}
        customActions={<EditCloseButtons />}>
        <Box sx={{ pt: 1, px: 2 }}></Box>

        <form onSubmit={handleSubmit(onSubmit)}>
          {showSkeleton ? (
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} md={4}>
                <InfoFieldSkeleton label="Code" width="70%" />
              </Grid>

              <Grid item xs={12} md={8}>
                <InfoFieldSkeleton label="Position" width="60%" />
              </Grid>

              <Grid item xs={12} md={8}>
                <InfoFieldSkeleton label="Charging" width="50%" />
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography variant="caption" color="text.secondary">
                  Status
                </Typography>
                <Box>
                  <Skeleton
                    variant="rounded"
                    width={90}
                    height={24}
                    sx={{ borderRadius: "12px" }}
                  />
                </Box>
              </Grid>
            </Grid>
          ) : (
            detail && (
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} md={4}>
                  <InfoField label="Code" value={detail.code} />
                </Grid>

                <Grid item xs={12} md={8}>
                  <InfoField label="Position" value={detail.title} />
                </Grid>

                <Grid item xs={12} md={8}>
                  <InfoField label="Charging" value={detail.charging} />
                </Grid>

                <Grid item xs={12} md={4}>
                  <Typography variant="caption" color="text.secondary">
                    Status
                  </Typography>
                  <Box>
                    <Chip
                      label={formatStatusLabel(detail.status)}
                      size="small"
                      sx={{
                        backgroundColor: isStatusSet ? "#e8f5e8" : "#fff4e5",
                        color: isStatusSet ? "#2e7d32" : "#ed6c02",
                        border: `1px solid ${
                          isStatusSet ? "#4caf50" : "#ff9800"
                        }`,
                        fontWeight: 600,
                        fontSize: "11px",
                        height: "24px",
                        borderRadius: "12px",
                        "& .MuiChip-label": {
                          padding: "0 8px",
                        },
                      }}
                    />
                  </Box>
                </Grid>
              </Grid>
            )
          )}

          <Box sx={{ mt: 2, width: "100%" }}>
            <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Approver Sequence
              </Typography>
            </Box>

            {!isReadOnly && (
              <Box sx={{ mb: 2, width: "100%" }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 700,
                    color: "rgb(33, 61, 112)",
                    textTransform: "uppercase",
                    letterSpacing: 0.4,
                    mb: 1,
                  }}>
                  Add Approver Position
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    alignItems: { xs: "stretch", sm: "flex-start" },
                    gap: 1,
                    width: "100%",
                  }}>
                  <OptionsHintContext.Provider value={approverOptionsHint}>
                    <Autocomplete
                      size="small"
                      sx={{ flex: 1, minWidth: 0 }}
                      options={availablePositions}
                      loading={isPositionsFetching}
                      value={selectedApprover}
                      inputValue={approverSearchInput}
                      filterOptions={(options) => options}
                      getOptionLabel={(option) => option?.name || ""}
                      isOptionEqualToValue={(option, value) =>
                        option.id === value.id
                      }
                      onInputChange={(e, newValue, reason) => {
                        approverInputReasonRef.current = reason;
                        setApproverSearchInput(newValue);
                      }}
                      onChange={(e, newValue) => setSelectedApprover(newValue)}
                      PaperComponent={HintPaper}
                      noOptionsText={
                        isPositionsFetching
                          ? "Searching positions..."
                          : "No available positions"
                      }
                      renderOption={(props, option) => {
                        const { key, ...liProps } = props;
                        const subtitle = [
                          option.charging,
                          option.department,
                          option.holder_name,
                        ]
                          .filter(Boolean)
                          .join(" · ");
                        return (
                          <Box
                            component="li"
                            key={option.id}
                            {...liProps}
                            sx={{
                              display: "block !important",
                              py: 1,
                            }}>
                            <Typography
                              sx={{
                                fontSize: "13px",
                                fontWeight: 700,
                                color: "rgb(33, 61, 112)",
                              }}>
                              {option.name}
                              {option.code && (
                                <Box component="span" sx={{ color: "#5f6b7a" }}>
                                  {" · "}
                                  {option.code}
                                </Box>
                              )}
                            </Typography>
                            {subtitle && (
                              <Typography
                                sx={{
                                  fontSize: "12px",
                                  color: "#5f6b7a",
                                  wordBreak: "break-word",
                                }}>
                                {subtitle}
                              </Typography>
                            )}
                          </Box>
                        );
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="Search title, code, charging or department"
                          InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                              <>
                                {isPositionsFetching ? (
                                  <CircularProgress size={16} />
                                ) : null}
                                {params.InputProps.endAdornment}
                              </>
                            ),
                          }}
                        />
                      )}
                    />
                  </OptionsHintContext.Provider>
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => handleAddApprover(selectedApprover)}
                    disabled={!selectedApprover || isPositionsLoading}
                    sx={{
                      height: "40px",
                      minWidth: "126px",
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
              </Box>
            )}

            <Box sx={{ width: "100%" }}>
              {showSkeleton ? (
                <Box sx={{ minHeight: "200px", width: "100%" }}>
                  <ApproverSkeletonItem />
                  <ApproverSkeletonItem />
                  <ApproverSkeletonItem />
                </Box>
              ) : (
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
                  style={{ minHeight: "200px", width: "100%" }}>
                  {approverSequence.length === 0 ? (
                    <Paper
                      sx={{
                        p: 3,
                        textAlign: "center",
                        backgroundColor: "#f8f9fa",
                        border: "2px dashed #ddd",
                        minHeight: "150px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "100%",
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
                          p: { xs: 1.5, sm: 2 },
                          mb: 1,
                          display: "flex",
                          alignItems: "center",
                          backgroundColor: "white",
                          border: "1px solid #e0e0e0",
                          cursor: isReadOnly ? "default" : "move",
                          width: "100%",
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
                            mr: { xs: 1, sm: 2 },
                            backgroundColor: "rgb(33, 61, 112)",
                            color: "white",
                            fontWeight: 600,
                          }}
                        />
                        <Avatar
                          sx={{
                            mr: { xs: 1, sm: 2 },
                            bgcolor: "rgb(33, 61, 112)",
                          }}>
                          <PersonIcon />
                        </Avatar>

                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                          {approver.holder_name ? (
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 600,
                                color: "rgb(33, 61, 112)",
                              }}>
                              {approver.holder_name}
                            </Typography>
                          ) : approver.is_vacant ? (
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600, color: "#ed6c02" }}>
                              VACANT
                            </Typography>
                          ) : null}
                          <Typography
                            variant="body1"
                            sx={{ fontWeight: 600, wordBreak: "break-word" }}>
                            {approver.name}
                          </Typography>
                          {approver.code && (
                            <Typography variant="body2" color="text.secondary">
                              {approver.code}
                            </Typography>
                          )}
                        </Box>

                        {!isReadOnly && (
                          <IconButton
                            onClick={() => handleRemoveApprover(approver.id)}
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
              )}
            </Box>
          </Box>
        </form>
      </ApprovalFlowActions>
    </LocalizationProvider>
  );
};

ApprovalFlowModal.displayName = "ApprovalFlowModal";

export default ApprovalFlowModal;
