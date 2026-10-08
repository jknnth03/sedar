import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  TextField,
  IconButton,
  CircularProgress,
  Autocomplete,
  Chip,
} from "@mui/material";
import {
  CheckCircle as ReceiveIcon,
  Close as CloseIcon,
  AttachFile as AttachFileIcon,
  Help as HelpIcon,
  Undo as ReturnIcon,
  Visibility as VisibilityIcon,
  SwapHoriz as InternalIcon,
  Add as ExternalIcon,
  RadioButtonUnchecked as UnselectedIcon,
} from "@mui/icons-material";
import dayjs from "dayjs";
import { useGetMrfAttachmentByIdQuery } from "../../../features/api/forms/mrfApi";
import { useGetHireOptionsQuery } from "../../../features/api/receiving/receivingApi";
import {
  useGetNextEmployeeIdQuery,
  useCheckUniqueEmployeeIdQuery,
} from "../../../features/api/employee/mainApi";
import { useGetAllShowPrefixesQuery } from "../../../features/api/extras/prefixesApi";

const HIRE_TYPES = {
  MOVEMENT: "MOVEMENT",
  INTERNAL: "INTERNAL",
  EXTERNAL: "EXTERNAL",
};

const extractHireOptionRows = (response) =>
  (Array.isArray(response) ? response : response?.result || response?.data) ||
  [];

const getHireOptionLabel = (option) =>
  option?.full_name || option?.name || option?.employee_name || "";

const resolveSuggestedIdNumber = (option) => {
  if (!option) return "";
  if (option.suggested_id_number != null) {
    return String(option.suggested_id_number);
  }
  return option.employee_code || "";
};

const renderHireOption = (props, option) => {
  const subtitleParts = [
    option?.employee_code,
    option?.position_title,
    option?.current_status,
  ]
    .filter(Boolean)
    .join(" • ");
  return (
    <Box component="li" {...props} key={option.id}>
      <Box sx={{ display: "flex", flexDirection: "column", py: 0.25 }}>
        <Typography sx={{ fontSize: "13px" }}>
          {getHireOptionLabel(option)}
        </Typography>
        {subtitleParts && (
          <Typography sx={{ fontSize: "11px", color: "#666" }}>
            {subtitleParts}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

const getPrefixLabel = (option) =>
  option?.name || option?.code || option?.prefix || "";

const getSuggestedIdNumber = (option) =>
  option?.suggested_id_number != null ? String(option.suggested_id_number) : "";

const toTitleCase = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/(^|\s)\S/g, (char) => char.toUpperCase());

const getFilingHireTypeLabel = (filing) => {
  if (filing?.hire_type_label) return filing.hire_type_label;
  if (filing?.hire_type === "MOVEMENT") return "Internal · Employee movement";
  if (filing?.hire_type === "INTERNAL") return "Internal · Returning employee";
  if (filing?.hire_type === "EXTERNAL") return "External";
  return "";
};

const getFilingMovingFromCaption = (position) => {
  if (!position) return "";
  const superiorFullName =
    position.superior_name || position.superior?.full_name || "";
  const superiorLastName = String(superiorFullName).split(",")[0].trim();
  return [
    position.code,
    superiorLastName ? `under ${toTitleCase(superiorLastName)}` : "",
  ]
    .filter(Boolean)
    .join(" · ");
};

const FilingField = ({ label, value, caption }) => (
  <Box sx={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
    <Typography
      variant="caption"
      sx={{
        color: "rgb(33, 61, 112)",
        fontSize: "11px",
        fontWeight: 600,
        display: "block",
        mb: 0.5,
      }}>
      {label}
    </Typography>
    <Typography
      variant="body2"
      sx={{
        color: "#000",
        fontSize: "13px",
        lineHeight: 1.4,
        wordBreak: "break-word",
      }}>
      {value || "N/A"}
    </Typography>
    {caption && (
      <Typography
        variant="caption"
        sx={{ color: "#666", fontSize: "12px", wordBreak: "break-word" }}>
        {caption}
      </Typography>
    )}
  </Box>
);

const getHireOptionsLabel = (hireType, internalMode) => {
  if (hireType === "EXTERNAL") return "Former employee record (search by name)";
  if (internalMode === HIRE_TYPES.MOVEMENT) {
    return "Employee movement (search by name)";
  }
  return "Returning employee (search by name)";
};

const SubmissionDialog = ({
  open,
  onClose,
  submission,
  isDialogLoading = false,
  onReceive,
  onReturn,
  isLoading = false,
}) => {
  const [fileViewerOpen, setFileViewerOpen] = useState(false);
  const [fileUrl, setFileUrl] = useState(null);
  const [selectedAttachment, setSelectedAttachment] = useState(null);
  const [fetchAttachment, setFetchAttachment] = useState(false);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [confirmationAction, setConfirmationAction] = useState("");

  const [hireType, setHireType] = useState(null);
  const [internalMode, setInternalMode] = useState(HIRE_TYPES.MOVEMENT);

  const [inputValue, setInputValue] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedOption, setSelectedOption] = useState(null);
  const [idNumberOverride, setIdNumberOverride] = useState("");
  const [selectedPrefix, setSelectedPrefix] = useState(null);
  const [debouncedIdNumber, setDebouncedIdNumber] = useState("");
  const inputReasonRef = useRef("input");

  const activeHireType =
    hireType === "INTERNAL"
      ? internalMode
      : hireType === "EXTERNAL"
        ? HIRE_TYPES.EXTERNAL
        : null;

  const {
    data: attachmentData,
    isLoading: isLoadingAttachment,
    error: attachmentError,
  } = useGetMrfAttachmentByIdQuery(
    {
      submissionId: selectedAttachment?.submissionId,
      attachmentId: selectedAttachment?.attachmentId,
    },
    {
      skip:
        !fetchAttachment ||
        !selectedAttachment?.submissionId ||
        !selectedAttachment?.attachmentId ||
        !fileViewerOpen,
    },
  );

  useEffect(() => {
    if (inputReasonRef.current !== "input") return;
    const timeout = setTimeout(() => {
      setDebouncedSearch(inputValue.trim());
    }, 400);
    return () => clearTimeout(timeout);
  }, [inputValue]);

  const { data: hireOptionsData, isFetching: isLoadingHireOptions } =
    useGetHireOptionsQuery(
      {
        id: submission?.id,
        hire_type: activeHireType,
        search: debouncedSearch,
      },
      {
        skip: !open || !activeHireType || !submission?.id,
      },
    );

  const showReturningFields =
    hireType === "INTERNAL" &&
    internalMode === HIRE_TYPES.INTERNAL &&
    Boolean(selectedOption);

  const { data: prefixesData, isFetching: isLoadingPrefixes } =
    useGetAllShowPrefixesQuery(undefined, {
      skip: !open || !showReturningFields,
    });

  const prefixOptions = useMemo(
    () => extractHireOptionRows(prefixesData),
    [prefixesData],
  );

  const { currentData: nextIdData } = useGetNextEmployeeIdQuery(
    selectedPrefix?.id,
    {
      skip: !open || !showReturningFields || !selectedPrefix?.id,
    },
  );

  const nextIdNumber =
    nextIdData?.next_id_number ?? nextIdData?.result?.next_id_number ?? null;

  const { currentData: uniqueIdData, isFetching: isCheckingUniqueId } =
    useCheckUniqueEmployeeIdQuery(
      { prefix_id: selectedPrefix?.id, id_number: debouncedIdNumber },
      {
        skip:
          !open ||
          !showReturningFields ||
          !selectedPrefix?.id ||
          !debouncedIdNumber,
      },
    );

  const idNumberExists = Boolean(
    uniqueIdData?.prefix_id_number_exists ??
    uniqueIdData?.result?.prefix_id_number_exists,
  );

  const isIdNumberPending =
    showReturningFields &&
    Boolean(idNumberOverride.trim()) &&
    (idNumberOverride.trim() !== debouncedIdNumber || isCheckingUniqueId);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedIdNumber(idNumberOverride.trim());
    }, 400);
    return () => clearTimeout(timeout);
  }, [idNumberOverride]);

  useEffect(() => {
    if (!showReturningFields || nextIdNumber == null) return;
    setIdNumberOverride(String(nextIdNumber));
  }, [nextIdNumber, selectedPrefix?.id, showReturningFields]);

  const hireOptions = useMemo(
    () => (activeHireType ? extractHireOptionRows(hireOptionsData) : []),
    [hireOptionsData, activeHireType],
  );

  useEffect(() => {
    if (!fileViewerOpen) {
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
        setFileUrl(null);
      }
      return;
    }
    if (isLoadingAttachment || attachmentError) return;
    if (attachmentData instanceof Blob) {
      if (fileUrl) URL.revokeObjectURL(fileUrl);
      setFileUrl(URL.createObjectURL(attachmentData));
    }
  }, [fileViewerOpen, attachmentData, isLoadingAttachment, attachmentError]);

  const resetSelection = () => {
    inputReasonRef.current = "input";
    setInputValue("");
    setDebouncedSearch("");
    setSelectedOption(null);
    setIdNumberOverride("");
    setSelectedPrefix(null);
    setDebouncedIdNumber("");
  };

  const resetHireState = () => {
    setHireType(null);
    setInternalMode(HIRE_TYPES.MOVEMENT);
    resetSelection();
  };

  useEffect(() => {
    if (!open) {
      setConfirmationOpen(false);
      setConfirmationAction("");
      resetHireState();
    }
  }, [open]);

  useEffect(() => {
    resetHireState();
  }, [submission?.id]);

  const handleClose = () => onClose();

  const handleSelectHireType = (type) => {
    setHireType(type);
    setInternalMode(HIRE_TYPES.MOVEMENT);
    resetSelection();
  };

  const handleSelectInternalMode = (mode) => {
    if (mode === internalMode) return;
    setInternalMode(mode);
    resetSelection();
  };

  const buildHireData = () => {
    if (!activeHireType || !selectedOption) return null;

    const payload = {
      hire_type: activeHireType,
      employee_to_be_hired_id: selectedOption.id,
    };

    if (activeHireType === HIRE_TYPES.EXTERNAL && idNumberOverride.trim()) {
      payload.id_number = idNumberOverride.trim();
    }

    if (activeHireType === HIRE_TYPES.INTERNAL) {
      if (selectedPrefix) {
        payload.prefix_id = selectedPrefix.id;
      }
      if (idNumberOverride.trim()) {
        payload.id_number = idNumberOverride.trim();
      }
    }

    return payload;
  };

  const isReturningFieldsValid =
    !showReturningFields ||
    Boolean(
      selectedPrefix &&
      idNumberOverride.trim() &&
      !idNumberExists &&
      !isIdNumberPending,
    );

  const isHireSelectionValid = Boolean(
    activeHireType && selectedOption && isReturningFieldsValid,
  );

  const handleReceive = () => {
    if (!isHireSelectionValid) return;
    setConfirmationAction("receive");
    setConfirmationOpen(true);
  };

  const handleReturn = () => {
    setConfirmationAction("return");
    setConfirmationOpen(true);
  };

  const handleConfirmReceive = async () => {
    const hireData = buildHireData();
    if (onReceive) {
      try {
        await onReceive(submission, hireData);
      } catch (error) {}
    }
    setConfirmationOpen(false);
    handleClose();
  };

  const handleConfirmReturn = async (reason) => {
    if (onReturn) {
      try {
        await onReturn(submission, reason);
      } catch (error) {}
    }
    setConfirmationOpen(false);
    handleClose();
  };

  const handleConfirmAction = (reason) => {
    if (confirmationAction === "receive") {
      handleConfirmReceive();
    } else if (confirmationAction === "return") {
      handleConfirmReturn(reason);
    }
  };

  const handleViewAttachment = (attachment) => {
    const submissionId = submission?.id;
    setFileUrl(null);
    setSelectedAttachment({
      submissionId,
      attachmentId: attachment.id,
      filename: attachment.filename,
    });
    setFetchAttachment(true);
    setFileViewerOpen(true);
  };

  const handleFileViewerClose = () => {
    setFileViewerOpen(false);
    setFetchAttachment(false);
    setSelectedAttachment(null);
    if (fileUrl) {
      URL.revokeObjectURL(fileUrl);
      setFileUrl(null);
    }
  };

  const submittable = submission?.submittable || {};
  const position = submittable.position || {};
  const jobLevel = submittable.job_level || {};
  const requisitionType = submittable.requisition_type || {};
  const employeeToReplace = submittable.replacement_info || {};
  const attachments = submittable.attachments || [];

  const getFormType = () =>
    submission?.form?.name || "Manpower Requisition Form";
  const getPosition = () => position.title?.name || "Unknown Position";
  const getJobLevel = () => jobLevel.name || "N/A";
  const getExpectedSalary = () => {
    const salary = submittable.expected_salary;
    return salary ? `₱${Number(salary).toLocaleString()}` : "₱0";
  };
  const getRequisitionType = () => requisitionType.name || "N/A";
  const getEmployeeToBeReplaced = () =>
    employeeToReplace?.details?.employee?.full_name ||
    employeeToReplace?.name ||
    employeeToReplace?.full_name ||
    "N/A";
  const filing = submission?.filing || null;
  const getFiledAt = () =>
    filing?.filed_at
      ? dayjs(filing.filed_at).format("MMM D, YYYY · h:mm A")
      : "";

  const getJustification = () =>
    submittable.justification || "No justification provided";
  const getRemarks = () => submittable.remarks || "No remarks";

  const isProcessed =
    submission?.status === "APPROVED" ||
    submission?.status === "RECEIVED" ||
    submission?.status === "RETURNED";

  const hireTypeCardSx = (type) => ({
    flex: 1,
    cursor: "pointer",
    borderRadius: 2,
    border: "2px solid",
    borderColor: hireType === type ? "rgb(33, 61, 112)" : "#dee2e6",
    backgroundColor: hireType === type ? "rgba(33, 61, 112, 0.06)" : "#fff",
    p: 2,
    display: "flex",
    alignItems: "flex-start",
    gap: 1.5,
    transition: "border-color 0.15s ease, background-color 0.15s ease",
    "&:hover": {
      borderColor: "rgb(33, 61, 112)",
    },
  });

  const modeChipSx = (mode) => ({
    fontSize: "12px",
    fontWeight: 600,
    border: "1px solid",
    borderColor: internalMode === mode ? "rgb(33, 61, 112)" : "#dee2e6",
    backgroundColor: internalMode === mode ? "rgba(33, 61, 112, 0.1)" : "#fff",
    color: "rgb(33, 61, 112)",
    "&:hover": {
      backgroundColor:
        internalMode === mode ? "rgba(33, 61, 112, 0.15)" : "#f5f6f8",
    },
  });

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          },
        }}>
        <DialogTitle sx={{ padding: "18px 26px" }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              📋
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  color: "rgb(33, 61, 112)",
                  fontSize: "16px",
                }}>
                VIEW MANPOWER FORM
              </Typography>
            </Box>
            <IconButton onClick={handleClose} size="small" disabled={isLoading}>
              <CloseIcon sx={{ color: "rgb(33, 61, 112)" }} />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          {isDialogLoading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "300px",
                flexDirection: "column",
                gap: 2,
              }}>
              <CircularProgress size={40} />
              <Typography variant="body2" color="text.secondary">
                Loading form details...
              </Typography>
            </Box>
          ) : !submission ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "300px",
              }}>
              <Typography variant="body2" color="text.secondary">
                No data available.
              </Typography>
            </Box>
          ) : (
            <>
              <Box
                sx={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #dee2e6",
                  borderRadius: 2,
                  p: 3,
                  mb: 2,
                }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 600,
                    color: "rgb(33, 61, 112)",
                    mb: 2,
                    fontSize: "14px",
                  }}>
                  Request Information
                </Typography>

                <Box sx={{ display: "flex", gap: 6, mb: 1.5 }}>
                  {[
                    { label: "FORM TYPE", value: getFormType() },
                    { label: "POSITION", value: getPosition() },
                    { label: "JOB LEVEL", value: getJobLevel() },
                  ].map(({ label, value }) => (
                    <Box
                      key={label}
                      sx={{
                        flex: 1,
                        minHeight: "60px",
                        display: "flex",
                        flexDirection: "column",
                      }}>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "rgb(33, 61, 112)",
                          fontSize: "11px",
                          fontWeight: 600,
                          display: "block",
                          mb: 0.5,
                        }}>
                        {label}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#000",
                          fontSize: "13px",
                          lineHeight: 1.4,
                          wordBreak: "break-word",
                        }}>
                        {value}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                <Box sx={{ display: "flex", gap: 6 }}>
                  {[
                    { label: "EXPECTED SALARY", value: getExpectedSalary() },
                    { label: "REQUISITION TYPE", value: getRequisitionType() },
                    {
                      label: "EMPLOYEE TO BE REPLACED",
                      value: getEmployeeToBeReplaced(),
                    },
                  ].map(({ label, value }) => (
                    <Box
                      key={label}
                      sx={{
                        flex: 1,
                        minHeight: "60px",
                        display: "flex",
                        flexDirection: "column",
                      }}>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "rgb(33, 61, 112)",
                          fontSize: "11px",
                          fontWeight: 600,
                          display: "block",
                          mb: 0.5,
                        }}>
                        {label}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#000",
                          fontSize: "13px",
                          lineHeight: 1.4,
                          wordBreak: "break-word",
                        }}>
                        {value}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>

              <Box
                sx={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #dee2e6",
                  borderRadius: 2,
                  p: 3,
                  mb: 2,
                }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 600,
                    color: "rgb(33, 61, 112)",
                    mb: 1.5,
                    fontSize: "14px",
                  }}>
                  Justification & Remarks
                </Typography>

                <Box sx={{ display: "flex", gap: 10 }}>
                  {[
                    { label: "JUSTIFICATION", value: getJustification() },
                    { label: "REMARKS", value: getRemarks() },
                  ].map(({ label, value }) => (
                    <Box
                      key={label}
                      sx={{
                        flex: 1,
                        minHeight: "60px",
                        display: "flex",
                        flexDirection: "column",
                      }}>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "rgb(33, 61, 112)",
                          fontSize: "11px",
                          fontWeight: 600,
                          mb: 0.5,
                        }}>
                        {label}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#000",
                          fontSize: "13px",
                          lineHeight: 1.4,
                        }}>
                        {value}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>

              <Box
                sx={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #dee2e6",
                  borderRadius: 2,
                  p: 3,
                  mb: 2,
                }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 600,
                    color: "rgb(33, 61, 112)",
                    mb: 1.5,
                    fontSize: "14px",
                  }}>
                  Supporting Documents
                </Typography>

                {attachments.length > 0 ? (
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                    {attachments.map((attachment) => (
                      <Box
                        key={attachment.id}
                        sx={{
                          border: "2px solid #ddd",
                          borderRadius: 2,
                          p: 1.5,
                          backgroundColor: "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                          }}>
                          <AttachFileIcon
                            sx={{ color: "#1976d2", fontSize: 22 }}
                          />
                          <Box>
                            <Typography
                              sx={{
                                fontWeight: 600,
                                color: "rgb(33, 61, 112)",
                                fontSize: "0.85rem",
                              }}>
                              {attachment.filename}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ color: "#666", fontSize: "11px" }}>
                              Click VIEW to preview the file
                            </Typography>
                          </Box>
                        </Box>
                        <IconButton
                          size="small"
                          onClick={() => handleViewAttachment(attachment)}
                          sx={{
                            border: "1px solid #1976d2",
                            color: "#1976d2",
                            borderRadius: 1,
                            px: 1.5,
                            gap: 0.5,
                            "&:hover": { backgroundColor: "#e3f2fd" },
                          }}>
                          <VisibilityIcon fontSize="small" />
                          <Typography
                            variant="caption"
                            sx={{ fontWeight: 600 }}>
                            VIEW
                          </Typography>
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Box
                    sx={{
                      border: "2px dashed #d1d5db",
                      borderRadius: 2,
                      p: 3,
                      textAlign: "center",
                      backgroundColor: "#fafafa",
                    }}>
                    <AttachFileIcon
                      sx={{ color: "#bbb", fontSize: 32, mb: 0.5 }}
                    />
                    <Typography
                      sx={{
                        color: "#9ca3af",
                        fontSize: "14px",
                        fontWeight: 500,
                      }}>
                      No supporting documents attached
                    </Typography>
                  </Box>
                )}
              </Box>

              {filing && (
                <Box
                  sx={{
                    backgroundColor: "#f3f8fd",
                    border: "1px solid #b9d0ea",
                    borderRadius: 2,
                    p: 3,
                    mb: 2,
                  }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 2,
                    }}>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 600,
                        color: "rgb(33, 61, 112)",
                        fontSize: "14px",
                      }}>
                      MRF Filing Information
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: {
                        xs: "1fr",
                        sm: "repeat(3, 1fr)",
                      },
                      columnGap: 4,
                      rowGap: 2,
                    }}>
                    <FilingField
                      label="HIRE TYPE"
                      value={getFilingHireTypeLabel(filing)}
                    />
                    <FilingField
                      label="EMPLOYEE"
                      value={filing.employee?.full_name}
                      caption={filing.employee?.employee_code}
                    />
                    {filing.moved_from_position && (
                      <FilingField
                        label="MOVING FROM"
                        value={filing.moved_from_position.title}
                        caption={getFilingMovingFromCaption(
                          filing.moved_from_position,
                        )}
                      />
                    )}
                    <FilingField
                      label="FILED BY"
                      value={filing.filed_by?.full_name}
                      caption={getFiledAt()}
                    />
                  </Box>
                </Box>
              )}

              {!isProcessed && (
                <Box
                  sx={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #dee2e6",
                    borderRadius: 2,
                    p: 3,
                    mb: 2,
                  }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 600,
                      color: "rgb(33, 61, 112)",
                      mb: 1.5,
                      fontSize: "14px",
                    }}>
                    Hire Type
                  </Typography>

                  <Box sx={{ display: "flex", gap: 2, mb: hireType ? 2 : 0 }}>
                    <Box
                      onClick={() => handleSelectHireType("INTERNAL")}
                      sx={hireTypeCardSx("INTERNAL")}>
                      {hireType === "INTERNAL" ? (
                        <ReceiveIcon
                          sx={{ color: "rgb(33, 61, 112)", fontSize: 22 }}
                        />
                      ) : (
                        <UnselectedIcon
                          sx={{ color: "#9ca3af", fontSize: 22 }}
                        />
                      )}
                      <Box>
                        <Typography
                          sx={{
                            fontWeight: 600,
                            color: "rgb(33, 61, 112)",
                            fontSize: "13px",
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}>
                          <InternalIcon fontSize="small" /> Internal
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: "#666", fontSize: "11px" }}>
                          Someone already known to the company: an employee
                          moving in, or a returning former employee
                        </Typography>
                      </Box>
                    </Box>

                    <Box
                      onClick={() => handleSelectHireType("EXTERNAL")}
                      sx={hireTypeCardSx("EXTERNAL")}>
                      {hireType === "EXTERNAL" ? (
                        <ReceiveIcon
                          sx={{ color: "rgb(33, 61, 112)", fontSize: 22 }}
                        />
                      ) : (
                        <UnselectedIcon
                          sx={{ color: "#9ca3af", fontSize: 22 }}
                        />
                      )}
                      <Box>
                        <Typography
                          sx={{
                            fontWeight: 600,
                            color: "rgb(33, 61, 112)",
                            fontSize: "13px",
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}>
                          <ExternalIcon fontSize="small" /> External
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: "#666", fontSize: "11px" }}>
                          New hire registered for this MRF
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  {hireType && (
                    <Box
                      sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      {hireType === "INTERNAL" && (
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <Chip
                            label="Employee movement"
                            clickable
                            onClick={() =>
                              handleSelectInternalMode(HIRE_TYPES.MOVEMENT)
                            }
                            sx={modeChipSx(HIRE_TYPES.MOVEMENT)}
                          />
                          <Chip
                            label="Returning employee"
                            clickable
                            onClick={() =>
                              handleSelectInternalMode(HIRE_TYPES.INTERNAL)
                            }
                            sx={modeChipSx(HIRE_TYPES.INTERNAL)}
                          />
                        </Box>
                      )}

                      <Autocomplete
                        key={activeHireType}
                        options={hireOptions}
                        loading={isLoadingHireOptions}
                        value={selectedOption}
                        inputValue={inputValue}
                        getOptionLabel={getHireOptionLabel}
                        isOptionEqualToValue={(option, value) =>
                          option.id === value.id
                        }
                        onInputChange={(e, newValue, reason) => {
                          inputReasonRef.current = reason;
                          setInputValue(newValue);
                        }}
                        onChange={(e, newValue) => {
                          setSelectedOption(newValue);
                          setSelectedPrefix(
                            activeHireType === HIRE_TYPES.INTERNAL
                              ? newValue?.prefix || null
                              : null,
                          );
                          setIdNumberOverride(
                            activeHireType === HIRE_TYPES.EXTERNAL
                              ? resolveSuggestedIdNumber(newValue)
                              : activeHireType === HIRE_TYPES.INTERNAL
                                ? getSuggestedIdNumber(newValue)
                                : "",
                          );
                        }}
                        renderOption={renderHireOption}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label={getHireOptionsLabel(hireType, internalMode)}
                            placeholder="Type a name to search"
                            InputProps={{
                              ...params.InputProps,
                              endAdornment: (
                                <>
                                  {isLoadingHireOptions ? (
                                    <CircularProgress size={16} />
                                  ) : null}
                                  {params.InputProps.endAdornment}
                                </>
                              ),
                            }}
                          />
                        )}
                      />

                      {showReturningFields && (
                        <>
                          <Box
                            sx={{
                              display: "grid",
                              gridTemplateColumns: "1fr 1fr",
                              gap: 2,
                            }}>
                            <Autocomplete
                              disableClearable
                              options={prefixOptions}
                              loading={isLoadingPrefixes}
                              value={selectedPrefix}
                              getOptionLabel={(option) =>
                                option?.id != null &&
                                option.id === selectedOption?.prefix?.id
                                  ? `${getPrefixLabel(option)} (former record)`
                                  : getPrefixLabel(option)
                              }
                              isOptionEqualToValue={(option, value) =>
                                option.id === value.id
                              }
                              onChange={(e, newValue) =>
                                setSelectedPrefix(newValue)
                              }
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  label="Prefix"
                                  size="small"
                                  InputProps={{
                                    ...params.InputProps,
                                    endAdornment: (
                                      <>
                                        {isLoadingPrefixes ? (
                                          <CircularProgress size={16} />
                                        ) : null}
                                        {params.InputProps.endAdornment}
                                      </>
                                    ),
                                  }}
                                />
                              )}
                            />
                            <TextField
                              label="ID number"
                              value={idNumberOverride}
                              onChange={(e) =>
                                setIdNumberOverride(e.target.value)
                              }
                              placeholder="Next available"
                              size="small"
                              fullWidth
                              error={idNumberExists}
                              helperText={
                                idNumberExists
                                  ? "This ID number is already used for this prefix"
                                  : ""
                              }
                            />
                          </Box>

                          {selectedPrefix && nextIdNumber != null && (
                            <Typography
                              sx={{ fontSize: "12px", color: "#666" }}>
                              Next available for{" "}
                              <Box component="span" sx={{ fontWeight: 700 }}>
                                {getPrefixLabel(selectedPrefix)}
                              </Box>
                              :{" "}
                              <Box component="span" sx={{ fontWeight: 700 }}>
                                {nextIdNumber}
                              </Box>
                            </Typography>
                          )}

                          {selectedPrefix && idNumberOverride.trim() && (
                            <Box
                              sx={{
                                backgroundColor: "#e3f4ec",
                                border: "1px solid #b7e0cc",
                                borderRadius: 1,
                                px: 1.5,
                                py: 1,
                                fontSize: "13px",
                                color: "#1b5e43",
                              }}>
                              New employee code:{" "}
                              <Box component="span" sx={{ fontWeight: 700 }}>
                                {getPrefixLabel(selectedPrefix)}-
                                {idNumberOverride.trim()}
                              </Box>
                            </Box>
                          )}
                        </>
                      )}

                      {hireType === "EXTERNAL" && selectedOption && (
                        <TextField
                          label="ID Number"
                          value={idNumberOverride}
                          onChange={(e) => setIdNumberOverride(e.target.value)}
                          placeholder="ID number"
                          fullWidth
                          size="small"
                        />
                      )}
                    </Box>
                  )}
                </Box>
              )}

              {isProcessed && (
                <Box
                  sx={{
                    textAlign: "center",
                    py: 2,
                    backgroundColor: "#ffffff",
                    borderRadius: 2,
                  }}>
                  <Typography
                    variant="h6"
                    color="text.secondary"
                    sx={{ fontSize: "16px" }}>
                    {submission?.status === "RECEIVED"
                      ? "This submission has already been received"
                      : submission?.status === "RETURNED"
                        ? "This submission has been returned"
                        : "This submission has already been approved"}
                  </Typography>
                </Box>
              )}
            </>
          )}
        </DialogContent>

        <DialogActions
          sx={{
            px: 4.4,
            pb: 2,
            pt: 2,
            justifyContent: "flex-end",
            gap: 2,
          }}>
          {!isDialogLoading && submission && !isProcessed && (
            <>
              <Button
                onClick={handleReturn}
                variant="contained"
                sx={{
                  backgroundColor: "#dc3545",
                  color: "white",
                  minWidth: "100px",
                  height: "40px",
                  fontSize: "14px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  borderRadius: 1,
                  "&:hover": { backgroundColor: "#c82333" },
                }}
                disabled={isLoading}
                startIcon={<ReturnIcon />}>
                Return
              </Button>
              <Button
                onClick={handleReceive}
                variant="contained"
                sx={{
                  backgroundColor: "#28a745",
                  color: "white",
                  minWidth: "100px",
                  height: "40px",
                  fontSize: "14px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  borderRadius: 1,
                  "&:hover": { backgroundColor: "#218838" },
                }}
                disabled={isLoading || !isHireSelectionValid}
                startIcon={
                  isLoading ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <ReceiveIcon />
                  )
                }>
                {isLoading ? "Processing..." : "Receive"}
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      <ConfirmationDialog
        open={confirmationOpen}
        onClose={() => setConfirmationOpen(false)}
        onConfirm={handleConfirmAction}
        action={confirmationAction}
        submission={submission}
        isLoading={isLoading}
      />

      <Dialog
        open={fileViewerOpen}
        onClose={handleFileViewerClose}
        maxWidth={false}
        fullWidth={false}
        PaperProps={{
          sx: {
            width: "80vw",
            height: "90vh",
            maxWidth: "none",
            maxHeight: "none",
            margin: 0,
            borderRadius: 2,
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          },
        }}>
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: 1,
            borderColor: "divider",
            padding: "12px 24px",
            backgroundColor: "#f8f9fa",
          }}>
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: "16px" }}>
            {selectedAttachment?.filename || "Attachment"}
          </Typography>
          <IconButton onClick={handleFileViewerClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent
          sx={{ p: 0, height: "calc(90vh - 64px)", overflow: "hidden" }}>
          {isLoadingAttachment ? (
            <Box
              sx={{
                width: "100%",
                height: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#f5f5f5",
                flexDirection: "column",
              }}>
              <CircularProgress size={48} />
              <Typography
                variant="body1"
                sx={{ mt: 2, color: "text.secondary" }}>
                Loading attachment...
              </Typography>
            </Box>
          ) : attachmentError ? (
            <Box
              sx={{
                width: "100%",
                height: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#f5f5f5",
                flexDirection: "column",
              }}>
              <Typography variant="h6" color="error" gutterBottom>
                Error loading attachment
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Unable to load the attachment. Please try again.
              </Typography>
            </Box>
          ) : fileUrl ? (
            <Box
              sx={{
                width: "100%",
                height: "100%",
                backgroundColor: "#f5f5f5",
              }}>
              <iframe
                src={fileUrl}
                width="100%"
                height="100%"
                style={{ border: "none", borderRadius: "0 0 8px 8px" }}
                title="File Attachment"
              />
            </Box>
          ) : (
            <Box
              sx={{
                width: "100%",
                height: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#f5f5f5",
              }}>
              <Box textAlign="center">
                <AttachFileIcon
                  sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}
                />
                <Typography
                  variant="h6"
                  color="text.secondary"
                  sx={{ fontSize: "18px" }}>
                  {selectedAttachment?.filename}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

const ConfirmationDialog = ({
  open,
  onClose,
  onConfirm,
  action,
  submission,
  isLoading = false,
}) => {
  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState("");

  useEffect(() => {
    if (!open) {
      setReason("");
      setReasonError("");
    }
  }, [open, action]);

  const handleConfirm = () => {
    if (action === "return" && !reason.trim()) {
      setReasonError("Reason is required for return");
      return;
    }
    setReasonError("");
    if (action === "return") {
      onConfirm(reason.trim());
    } else {
      onConfirm();
    }
  };

  const handleReasonChange = (e) => {
    setReason(e.target.value);
    if (reasonError) setReasonError("");
  };

  const getConfirmationTitle = () => {
    if (!action) return "Confirmation";
    return action === "receive" ? "Confirm Receive" : "Confirm Return";
  };

  const getConfirmationMessage = () => {
    if (!action || !submission) return "";
    return action === "receive"
      ? "Are you sure you want to receive this manpower form?"
      : "Are you sure you want to return this manpower form?";
  };

  const getConfirmButtonText = () => {
    if (!action) return "Confirm";
    return action === "receive" ? "RECEIVE" : "RETURN";
  };

  const getSubmissionDisplayName = () =>
    submission?.form?.name || "Manpower Requisition Form";

  const getSubmissionId = () => submission?.id || "N/A";

  const canConfirmReturn = action === "return" ? reason.trim() : true;
  const shouldShowReasonField = action === "return";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        },
      }}>
      <DialogTitle sx={{ textAlign: "center", pt: 3 }}>
        <Box display="flex" justifyContent="center" alignItems="center" mb={2}>
          <HelpIcon sx={{ fontSize: 60, color: "#ff4400" }} />
        </Box>
        <Typography
          variant="h6"
          fontWeight="bold"
          textAlign="center"
          sx={{ color: "#213d70", fontSize: "18px" }}>
          {getConfirmationTitle()}
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ textAlign: "center", px: 3 }}>
        <Typography
          variant="body1"
          gutterBottom
          sx={{ fontSize: "14px", mb: 2 }}>
          {getConfirmationMessage()}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontSize: "13px", mb: shouldShowReasonField ? 3 : 0 }}>
          {getSubmissionDisplayName()} - ID: {getSubmissionId()}
        </Typography>

        {shouldShowReasonField && (
          <TextField
            label="Reason for Return"
            value={reason}
            onChange={handleReasonChange}
            multiline
            rows={3}
            fullWidth
            placeholder="Please provide a reason for returning this form..."
            error={!!reasonError}
            helperText={reasonError}
            disabled={isLoading}
            variant="outlined"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                "&.Mui-error": {
                  "& fieldset": { borderColor: "#d32f2f" },
                },
              },
              "& .MuiFormHelperText-root.Mui-error": { color: "#d32f2f" },
            }}
          />
        )}
      </DialogContent>

      <DialogActions sx={{ justifyContent: "center", pb: 3, px: 3 }}>
        <Box display="flex" gap={2}>
          <Button
            onClick={onClose}
            variant="outlined"
            sx={{
              borderRadius: 2,
              minWidth: 80,
              height: "40px",
              borderColor: "#dc3545",
              color: "#dc3545",
              "&:hover": {
                borderColor: "#c82333",
                backgroundColor: "rgba(220, 53, 69, 0.04)",
              },
            }}
            disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            variant="contained"
            sx={{
              borderRadius: 2,
              minWidth: 80,
              height: "40px",
              backgroundColor: action === "receive" ? "#28a745" : "#dc3545",
              "&:hover": {
                backgroundColor: action === "receive" ? "#218838" : "#c82333",
              },
            }}
            disabled={isLoading || (action === "return" && !canConfirmReturn)}>
            {isLoading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              getConfirmButtonText()
            )}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

const ReceivingDialog = {
  SubmissionDialog,
  ConfirmationDialog,
};

export default ReceivingDialog;
