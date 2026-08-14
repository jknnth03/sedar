import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Skeleton,
  TextField,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import {
  Close as CloseIcon,
  Assignment as AssignmentIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import dayjs from "dayjs";
import { useGetMRFSubmissionByIdQuery } from "../../../features/api/monitoring/mrfMonitoringApi";
import MonitoringAttachmentField from "./MonitoringAttachmentFields";

const StyledDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialog-paper": {
    height: "80vh",
    maxHeight: "80vh",
    minHeight: "80vh",
    width: "100%",
    maxWidth: "900px",
    display: "flex",
    flexDirection: "column",
  },
}));

const readOnlyTextFieldSx = {
  backgroundColor: "#f5f5f5",
  minWidth: "412px",
  maxWidth: "412px",
};

const MrfMonitoringModal = ({
  open,
  onClose,
  submissionId,
  submissionData,
  isLoading: externalLoading,
}) => {
  const {
    data: fetchedData,
    isLoading: isFetchingData,
    isFetching,
  } = useGetMRFSubmissionByIdQuery(submissionId, {
    skip: !open || !submissionId,
  });

  const effectiveSubmissionData = fetchedData || submissionData;
  const isLoading = externalLoading || isFetchingData || isFetching;

  const handleClose = () => {
    onClose();
  };

  const getResult = () => {
    const result = effectiveSubmissionData?.result || effectiveSubmissionData;
    return result;
  };

  const getSubmittable = () => {
    const result = getResult();
    return result?.submittable || result;
  };

  const getRequisitionTypeName = () => {
    return getSubmittable()?.requisition_type?.name || "N/A";
  };

  const getPositionLabel = () => {
    return getSubmittable()?.position?.title_with_unit || "N/A";
  };

  const isEmployeeMovement = () => {
    return getRequisitionTypeName() === "REPLACEMENT DUE TO EMPLOYEE MOVEMENT";
  };

  const getEmployeeToBeReplaced = () => {
    const replacementInfo = getSubmittable()?.replacement_info;
    if (replacementInfo?.type === "direct_replacement") {
      return (
        replacementInfo.name ||
        replacementInfo.details?.employee?.full_name ||
        "N/A"
      );
    }
    return "N/A";
  };

  const getMovementEmployee = () => {
    const replacementInfo = getSubmittable()?.replacement_info;
    if (replacementInfo?.type === "employee_movement") {
      return (
        replacementInfo.name ||
        replacementInfo.details?.employee?.full_name ||
        "N/A"
      );
    }
    return "N/A";
  };

  const getMovementNewPosition = () => {
    const replacementInfo = getSubmittable()?.replacement_info;
    return replacementInfo?.details?.new_position?.title_with_unit || "N/A";
  };

  const getReasonForChange = () => {
    const replacementInfo = getSubmittable()?.replacement_info;
    return replacementInfo?.details?.reason_for_change || "N/A";
  };

  const getJobLevelLabel = () => {
    return getSubmittable()?.job_level?.label || "N/A";
  };

  const isAdditionalManpower = () => {
    return getRequisitionTypeName() === "ADDITIONAL MANPOWER";
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <StyledDialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            pb: 1,
            backgroundColor: "#fff",
            flexShrink: 0,
          }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <AssignmentIcon sx={{ color: "rgb(33, 61, 112)" }} />
            <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
              VIEW MRF SUBMISSION
            </Typography>
          </Box>
          <IconButton
            onClick={handleClose}
            sx={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              backgroundColor: "#fff",
              "&:hover": { backgroundColor: "#f5f5f5" },
              transition: "all 0.2s ease-in-out",
            }}>
            <CloseIcon sx={{ fontSize: "18px", color: "#333" }} />
          </IconButton>
        </DialogTitle>

        <DialogContent
          sx={{
            backgroundColor: "#fff",
            flex: 1,
            overflow: "auto",
            padding: "16px 24px",
            "&::-webkit-scrollbar": { width: "8px" },
            "&::-webkit-scrollbar-track": {
              backgroundColor: "#f1f1f1",
              borderRadius: "4px",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "#c1c1c1",
              borderRadius: "4px",
              "&:hover": { backgroundColor: "#a1a1a1" },
            },
          }}>
          {isLoading ? (
            <Box sx={{ p: 1 }}>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: 2,
                  mb: 2,
                }}>
                <Skeleton variant="rounded" height={56} />
                <Skeleton variant="rounded" height={56} />
                <Skeleton variant="rounded" height={56} />
                <Skeleton variant="rounded" height={56} />
                <Skeleton variant="rounded" height={56} />
                <Skeleton variant="rounded" height={56} />
              </Box>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: 2,
                  mb: 2,
                }}>
                <Skeleton variant="rounded" height={56} />
                <Skeleton variant="rounded" height={56} />
                <Skeleton variant="rounded" height={100} />
                <Skeleton variant="rounded" height={100} />
              </Box>
              <Skeleton variant="rounded" height={80} />
            </Box>
          ) : (
            <Box sx={{ width: "100%", paddingTop: "12px" }}>
              {getResult()?.updated_at && (
                <Box sx={{ mb: 2, p: 0.5, borderRadius: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Last Updated:{" "}
                    {dayjs(getResult().updated_at).format("MMM DD, YYYY HH:mm")}
                  </Typography>
                </Box>
              )}

              <Box sx={{ mb: 3 }}>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
                    gap: 2,
                  }}>
                  <Box>
                    <TextField
                      label="Requisition Type"
                      value={getRequisitionTypeName()}
                      fullWidth
                      disabled
                      sx={readOnlyTextFieldSx}
                    />
                  </Box>

                  <Box>
                    <TextField
                      label="Position"
                      value={getPositionLabel()}
                      fullWidth
                      disabled
                      sx={readOnlyTextFieldSx}
                    />
                  </Box>

                  <Box>
                    {isEmployeeMovement() ? (
                      <TextField
                        label="Select Employee"
                        value={getMovementEmployee()}
                        fullWidth
                        disabled
                        sx={readOnlyTextFieldSx}
                      />
                    ) : (
                      <TextField
                        label="Employee to be Replaced"
                        value={
                          isAdditionalManpower()
                            ? "Not required for Additional Manpower"
                            : getEmployeeToBeReplaced()
                        }
                        fullWidth
                        disabled
                        sx={readOnlyTextFieldSx}
                      />
                    )}
                  </Box>

                  {isEmployeeMovement() && (
                    <Box>
                      <TextField
                        label="New Position"
                        value={getMovementNewPosition()}
                        fullWidth
                        disabled
                        sx={readOnlyTextFieldSx}
                      />
                    </Box>
                  )}

                  <Box>
                    <TextField
                      label="Job Level"
                      value={getJobLevelLabel()}
                      fullWidth
                      disabled
                      sx={readOnlyTextFieldSx}
                    />
                  </Box>
                </Box>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
                    gap: 2,
                  }}>
                  <Box>
                    <TextField
                      label="Expected Salary"
                      value={getSubmittable()?.expected_salary || "N/A"}
                      fullWidth
                      disabled
                      sx={readOnlyTextFieldSx}
                    />
                  </Box>

                  <Box>
                    <TextField
                      label="Employment Type"
                      value={getSubmittable()?.employment_type || "N/A"}
                      fullWidth
                      disabled
                      sx={readOnlyTextFieldSx}
                    />
                  </Box>

                  {isEmployeeMovement() && (
                    <Box>
                      <TextField
                        label="Reason for Change"
                        value={getReasonForChange()}
                        fullWidth
                        disabled
                        sx={readOnlyTextFieldSx}
                      />
                    </Box>
                  )}

                  <Box>
                    <TextField
                      label="Justification"
                      value={getSubmittable()?.justification || "N/A"}
                      fullWidth
                      multiline
                      rows={3}
                      disabled
                      sx={readOnlyTextFieldSx}
                    />
                  </Box>

                  <Box>
                    <TextField
                      label="Remarks"
                      value={getSubmittable()?.remarks || ""}
                      fullWidth
                      multiline
                      rows={3}
                      disabled
                      sx={readOnlyTextFieldSx}
                    />
                  </Box>
                </Box>
              </Box>

              <Box sx={{ mb: 3, minWidth: "834px", maxWidth: "834px" }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: "bold",
                    color: "rgb(33, 61, 112)",
                    marginBottom: 1.5,
                    fontSize: "11px",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}>
                  ATTACHMENT
                </Typography>
                <MonitoringAttachmentField
                  submissionData={effectiveSubmissionData}
                />
              </Box>
            </Box>
          )}
        </DialogContent>
      </StyledDialog>
    </LocalizationProvider>
  );
};

export default MrfMonitoringModal;
