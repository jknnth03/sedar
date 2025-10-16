import React, { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  IconButton,
  Box,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import {
  Close as CloseIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Description as DescriptionIcon,
  Send as SendIcon,
  Print as PrintIcon,
} from "@mui/icons-material";
import EditOffIcon from "@mui/icons-material/EditOff";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import {
  useLazyGetMdaPrefillQuery,
  useLazyGetSingleMdaSubmissionQuery,
} from "../../../../features/api/forms/mdaApi";
import MDAFormModalFields from "./MDAFormModalFields";
import MDAFormPrinting from "./MDAFormPrinting";
import {
  dialogTitleStyles,
  titleBoxStyles,
  descriptionIconStyles,
  titleTypographyStyles,
  editIconButtonStyles,
  editIconStyles,
  cancelEditIconButtonStyles,
  editOffIconStyles,
  closeIconButtonStyles,
  closeIconStyles,
  dialogContentStyles,
  lastUpdatedBoxStyles,
  dialogActionsStyles,
  saveButtonStyles,
} from "./MDAFornModal.styles";

const MDAFormModal = ({
  open = false,
  onClose,
  onSave,
  onResubmit,
  selectedEntry = null,
  isLoading = false,
  mode = "create",
  employeeMovements = [],
  positions = [],
  submissionId = null,
}) => {
  const { setValue, reset, handleSubmit } = useFormContext();

  const [currentMode, setCurrentMode] = useState(mode);
  const [originalMode, setOriginalMode] = useState(mode);
  const [selectedMovementId, setSelectedMovementId] = useState(null);
  const [movementType, setMovementType] = useState("");
  const [showUpdateConfirmation, setShowUpdateConfirmation] = useState(false);
  const [showResubmitConfirmation, setShowResubmitConfirmation] =
    useState(false);
  const [pendingFormData, setPendingFormData] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editingEntryId, setEditingEntryId] = useState(null);
  const [isConfirmingUpdate, setIsConfirmingUpdate] = useState(false);
  const [isConfirmingResubmit, setIsConfirmingResubmit] = useState(false);
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const [printData, setPrintData] = useState(null);
  const [isPrintLoading, setIsPrintLoading] = useState(false);

  const [triggerPrefill, { data: prefillData, isLoading: isPrefillLoading }] =
    useLazyGetMdaPrefillQuery();
  const [triggerGetSubmission] = useLazyGetSingleMdaSubmissionQuery();

  useEffect(() => {
    if (open && selectedEntry) {
      const entryId = selectedEntry.result?.id || selectedEntry.id;
      setEditingEntryId(entryId);
    }
  }, [open, selectedEntry]);

  const shouldEnableEditButton = () => {
    const status = selectedEntry?.result?.status || selectedEntry?.status;
    if (status === "APPROVED" || status === "CANCELLED") {
      return false;
    }

    const actions =
      selectedEntry?.result?.actions ||
      selectedEntry?.actions ||
      selectedEntry?.result?.submittable?.actions;

    const canUpdate = actions?.can_update === true;

    return canUpdate;
  };

  const shouldEnableResubmitButton = () => {
    const status = selectedEntry?.result?.status || selectedEntry?.status;
    if (status === "APPROVED" || status === "CANCELLED") {
      return false;
    }

    const actions =
      selectedEntry?.result?.actions ||
      selectedEntry?.actions ||
      selectedEntry?.result?.submittable?.actions;

    const canResubmit = actions?.can_resubmit === true;

    return canResubmit;
  };

  const shouldShowPrintButton = () => {
    const status = selectedEntry?.result?.status || selectedEntry?.status;
    return status === "APPROVED";
  };

  useEffect(() => {
    if (open && currentMode === "create" && submissionId) {
      triggerPrefill(submissionId, false).then(() => {});
    }
  }, [open, currentMode, submissionId, triggerPrefill]);

  useEffect(() => {
    if (open) {
      setCurrentMode(mode);
      setOriginalMode(mode);

      if (mode === "create") {
        reset({
          form_id: 5,
          employee_movement_id: null,
          employee_id: "",
          employee_name: "",
          employee_number: "",
          effective_date: null,
          action_type: "",
          birth_date: null,
          birth_place: "",
          gender: "",
          civil_status: "",
          nationality: "",
          address: "",
          tin_number: "",
          sss_number: "",
          pag_ibig_number: "",
          philhealth_number: "",
          from_position_id: null,
          from_position_title: "",
          from_department: "",
          from_sub_unit: "",
          from_job_level: "",
          from_schedule: "",
          from_job_rate: "",
          from_allowance: "",
          to_position_id: null,
          to_position_title: "",
          to_department: "",
          to_sub_unit: "",
          to_job_level: "",
          to_schedule: "",
          to_job_rate: "",
          to_allowance: "",
        });
      } else if (selectedEntry && (mode === "view" || mode === "edit")) {
        const dataSource = selectedEntry.submittable || selectedEntry;
        const fromDetails = dataSource.from_details || {};
        const toDetails = dataSource.to_details || {};
        const formData = {
          form_id: selectedEntry.form?.id || 5,
          employee_movement_id: dataSource.id || null,
          employee_id: dataSource.employee_id || "",
          employee_name: dataSource.employee_name || "",
          employee_number: dataSource.employee_number || "",
          effective_date: dataSource.effective_date
            ? dayjs(dataSource.effective_date)
            : null,
          action_type: dataSource.movement_type || "",
          birth_date: dataSource.birth_date
            ? dayjs(dataSource.birth_date)
            : null,
          birth_place: dataSource.birth_place || "",
          gender: dataSource.gender || "",
          civil_status: dataSource.civil_status || "",
          nationality: dataSource.nationality || "",
          address: dataSource.address || "",
          tin_number: dataSource.tin_number || "",
          sss_number: dataSource.sss_number || "",
          pag_ibig_number: dataSource.pag_ibig_number || "",
          philhealth_number: dataSource.philhealth_number || "",
          from_position_id: fromDetails.position_id || null,
          from_position_title: fromDetails.position_title || "",
          from_department: fromDetails.department || "",
          from_sub_unit: fromDetails.sub_unit || "",
          from_job_level: fromDetails.job_level || "",
          from_schedule: fromDetails.schedule || "",
          from_job_rate: fromDetails.job_rate || "",
          from_allowance: fromDetails.allowance || "",
          to_position_id: toDetails.position_id || null,
          to_position_title: toDetails.position_title || "",
          to_department: toDetails.department || "",
          to_sub_unit: toDetails.sub_unit || "",
          to_job_level: toDetails.job_level || "",
          to_schedule: toDetails.schedule || "",
          to_job_rate: toDetails.job_rate || "",
          to_allowance: toDetails.allowance || "",
        };
        reset(formData);
      }
    }
  }, [open, mode, selectedEntry, reset]);

  useEffect(() => {
    if (prefillData?.result && currentMode === "create") {
      const data = prefillData.result;

      setMovementType(data.movement_type || "");

      setValue("employee_movement_id", data.employee_movement_id || null);
      setValue("employee_id", data.employee_id || "");
      setValue("employee_name", data.employee_name || "");
      setValue("employee_number", data.employee_number || "");
      setValue(
        "effective_date",
        data.effective_date ? dayjs(data.effective_date) : null
      );
      setValue("action_type", data.movement_type || "");
      setValue("birth_date", data.birth_date ? dayjs(data.birth_date) : null);
      setValue("birth_place", data.birth_place || "");
      setValue("gender", data.gender || "");
      setValue("civil_status", data.civil_status || "");
      setValue("nationality", data.nationality || "");
      setValue("address", data.address || "");
      setValue("tin_number", data.tin_number || "");
      setValue("sss_number", data.sss_number || "");
      setValue("pag_ibig_number", data.pag_ibig_number || "");
      setValue("philhealth_number", data.philhealth_number || "");

      if (data.from) {
        setValue("from_position_id", data.from.position_id || null);
        setValue("from_position_title", data.from.position_title || "");
        setValue("from_department", data.from.department || "");
        setValue("from_sub_unit", data.from.sub_unit || "");
        setValue("from_job_level", data.from.job_level || "");
        setValue("from_schedule", data.from.schedule || "");
        setValue("from_job_rate", data.from.job_rate || "");
        setValue("from_allowance", data.from.allowance || "");
      }

      if (data.to) {
        setValue("to_position_id", data.to.position_id || null);
        setValue("to_position_title", data.to.position_title || "");
        setValue("to_department", data.to.department || "");
        setValue("to_sub_unit", data.to.sub_unit || "");
        setValue("to_job_level", data.to.job_level || "");
        setValue("to_schedule", data.to.schedule || "");
        setValue("to_job_rate", data.to.job_rate || "");
        setValue("to_allowance", data.to.allowance || "");
      }
    }
  }, [prefillData, currentMode, setValue]);

  const handleModeChange = (newMode) => {
    setCurrentMode(newMode);
  };

  const handleCancelEdit = () => {
    setCurrentMode(originalMode);
    if (selectedEntry) {
      const dataSource = selectedEntry.submittable || selectedEntry;
      const fromDetails = dataSource.from_details || {};
      const toDetails = dataSource.to_details || {};

      reset({
        form_id: selectedEntry.form?.id || 5,
        employee_movement_id: dataSource.id || null,
        employee_id: dataSource.employee_id || "",
        employee_name: dataSource.employee_name || "",
        employee_number: dataSource.employee_number || "",
        effective_date: dataSource.effective_date
          ? dayjs(dataSource.effective_date)
          : null,
        action_type: dataSource.movement_type || "",
        birth_date: dataSource.birth_date ? dayjs(dataSource.birth_date) : null,
        birth_place: dataSource.birth_place || "",
        gender: dataSource.gender || "",
        civil_status: dataSource.civil_status || "",
        nationality: dataSource.nationality || "",
        address: dataSource.address || "",
        tin_number: dataSource.tin_number || "",
        sss_number: dataSource.sss_number || "",
        pag_ibig_number: dataSource.pag_ibig_number || "",
        philhealth_number: dataSource.philhealth_number || "",
        from_position_id: fromDetails.position_id || null,
        from_position_title: fromDetails.position_title || "",
        from_department: fromDetails.department || "",
        from_sub_unit: fromDetails.sub_unit || "",
        from_job_level: fromDetails.job_level || "",
        from_schedule: fromDetails.schedule || "",
        from_job_rate: fromDetails.job_rate || "",
        from_allowance: fromDetails.allowance || "",
        to_position_id: toDetails.position_id || null,
        to_position_title: toDetails.position_title || "",
        to_department: toDetails.department || "",
        to_sub_unit: toDetails.sub_unit || "",
        to_job_level: toDetails.job_level || "",
        to_schedule: toDetails.schedule || "",
        to_job_rate: toDetails.job_rate || "",
        to_allowance: toDetails.allowance || "",
      });
    }
  };

  const onSubmit = async (data) => {
    const formattedData = {
      ...data,
      movement_type: data.action_type,
      effective_date: data.effective_date
        ? dayjs(data.effective_date).format("YYYY-MM-DD")
        : null,
      birth_date: data.birth_date
        ? dayjs(data.birth_date).format("YYYY-MM-DD")
        : null,
    };

    if (currentMode === "edit") {
      setPendingFormData(formattedData);
      setShowUpdateConfirmation(true);
    } else {
      if (onSave) {
        await onSave(formattedData, currentMode);
        if (submissionId) {
          triggerPrefill(submissionId);
        }
      }
    }
  };

  const handleConfirmUpdate = async () => {
    setIsConfirmingUpdate(true);
    try {
      if (onSave && pendingFormData) {
        await onSave(pendingFormData, currentMode);
        if (submissionId) {
          triggerPrefill(submissionId);
        }
        setShowUpdateConfirmation(false);
        setPendingFormData(null);
      }
    } catch (error) {
      console.error("Update failed:", error);
    } finally {
      setIsConfirmingUpdate(false);
    }
  };

  const handleCancelUpdate = () => {
    setShowUpdateConfirmation(false);
    setPendingFormData(null);
  };

  const handleResubmitClick = () => {
    setShowResubmitConfirmation(true);
  };

  const handleConfirmResubmit = async () => {
    if (!editingEntryId) {
      const fallbackId = selectedEntry?.result?.id || selectedEntry?.id;

      if (!fallbackId) {
        alert("No submission ID found. Please close and reopen the modal.");
        return;
      }

      setEditingEntryId(fallbackId);
    }

    if (!onResubmit || typeof onResubmit !== "function") {
      alert("Resubmit function not available. Please refresh the page.");
      return;
    }

    const idToUse =
      editingEntryId || selectedEntry?.result?.id || selectedEntry?.id;

    setIsConfirmingResubmit(true);
    try {
      setIsUpdating(true);
      await onResubmit(idToUse);
      setShowResubmitConfirmation(false);
      handleClose();
    } catch (error) {
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        "An error occurred while resubmitting.";
      alert(`${errorMessage} Please try again.`);
    } finally {
      setIsUpdating(false);
      setIsConfirmingResubmit(false);
    }
  };

  const handleCancelResubmit = () => {
    setShowResubmitConfirmation(false);
  };

  const handlePrintClick = async () => {
    try {
      setIsPrintLoading(true);
      const submissionId = selectedEntry?.result?.id || selectedEntry?.id;

      if (!submissionId) {
        alert("Submission ID not found");
        setIsPrintLoading(false);
        return;
      }

      const response = await triggerGetSubmission(submissionId).unwrap();

      if (response) {
        setPrintData(response);
        setShowPrintDialog(true);
      }
    } catch (error) {
      alert("Failed to fetch submission data. Please try again.");
    } finally {
      setIsPrintLoading(false);
    }
  };

  const handleClosePrintDialog = () => {
    setShowPrintDialog(false);
    setPrintData(null);
  };

  const handleClose = () => {
    reset();
    setCurrentMode(mode);
    setOriginalMode(mode);
    setSelectedMovementId(null);
    setMovementType("");
    setShowUpdateConfirmation(false);
    setShowResubmitConfirmation(false);
    setPendingFormData(null);
    setIsUpdating(false);
    setEditingEntryId(null);
    setIsConfirmingUpdate(false);
    setIsConfirmingResubmit(false);
    setShowPrintDialog(false);
    setPrintData(null);
    setIsPrintLoading(false);
    if (submissionId) {
      triggerPrefill(submissionId);
    }
    onClose();
  };

  const getModalTitle = () => {
    switch (currentMode) {
      case "create":
        return movementType
          ? `CREATE MDA FORM - ${movementType.toUpperCase()}`
          : "CREATE MDA FORM";
      case "view":
        return "VIEW MDA FORM";
      case "edit":
        return "EDIT MDA FORM";
      default:
        return "MDA Form";
    }
  };

  const showResubmitButton = () => {
    const isViewMode = currentMode === "view";
    const status = selectedEntry?.result?.status || selectedEntry?.status;
    return isViewMode && status !== "APPROVED" && status !== "CANCELLED";
  };

  const isReadOnly = currentMode === "view";
  const isCreate = currentMode === "create";
  const isViewMode = currentMode === "view";
  const isEditMode = currentMode === "edit";
  const showLoadingState = isPrefillLoading && isCreate && submissionId;
  const isProcessing = isLoading || isUpdating || isPrintLoading;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth={false}
        PaperProps={{
          sx: {
            width: "1100px",
            minWidth: "1100px",
            maxWidth: "1100px",
            height: "94vh",
            maxHeight: "820px",
            display: "flex",
            flexDirection: "column",
            position: "relative",
          },
        }}>
        <DialogTitle sx={dialogTitleStyles}>
          <Box sx={titleBoxStyles}>
            <DescriptionIcon sx={descriptionIconStyles} />
            <Typography variant="h6" component="div" sx={titleTypographyStyles}>
              {getModalTitle()}
            </Typography>
            {isViewMode && (
              <>
                <Tooltip title="EDIT MDA" arrow placement="top">
                  <span>
                    <IconButton
                      onClick={() => handleModeChange("edit")}
                      disabled={!shouldEnableEditButton() || isProcessing}
                      size="small"
                      sx={editIconButtonStyles}>
                      <EditIcon
                        sx={editIconStyles(
                          !shouldEnableEditButton() || isProcessing
                        )}
                      />
                    </IconButton>
                  </span>
                </Tooltip>
                {shouldShowPrintButton() && (
                  <Tooltip title="PRINT NOTICE" arrow placement="top">
                    <IconButton
                      onClick={handlePrintClick}
                      disabled={isProcessing}
                      size="small"
                      sx={{
                        ml: 1,
                        padding: "8px",
                        "&:hover": {
                          backgroundColor: !isProcessing
                            ? "rgba(33, 61, 112, 0.08)"
                            : "transparent",
                          transform: !isProcessing ? "scale(1.1)" : "none",
                          transition: "all 0.2s ease-in-out",
                        },
                      }}>
                      {isPrintLoading ? (
                        <CircularProgress size={20} />
                      ) : (
                        <PrintIcon
                          sx={{
                            fontSize: "20px",
                            "& path": {
                              fill: "rgb(33, 61, 112)",
                            },
                          }}
                        />
                      )}
                    </IconButton>
                  </Tooltip>
                )}
              </>
            )}
            {isEditMode && originalMode === "view" && (
              <Tooltip title="CANCEL EDIT">
                <span>
                  <IconButton
                    onClick={handleCancelEdit}
                    disabled={isProcessing}
                    size="small"
                    sx={cancelEditIconButtonStyles}>
                    <EditOffIcon sx={editOffIconStyles} />
                  </IconButton>
                </span>
              </Tooltip>
            )}
          </Box>

          <IconButton onClick={handleClose} sx={closeIconButtonStyles}>
            <CloseIcon sx={closeIconStyles} />
          </IconButton>
        </DialogTitle>

        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent sx={dialogContentStyles}>
            {showLoadingState ? (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: "400px",
                  gap: 2,
                }}>
                <CircularProgress size={48} />
                <Typography variant="body1" color="text.secondary">
                  Loading employee data...
                </Typography>
              </Box>
            ) : (
              <MDAFormModalFields
                isCreate={isCreate}
                isReadOnly={isReadOnly}
                submissionId={submissionId}
                employeeMovements={employeeMovements}
                isPrefillLoading={isPrefillLoading}
                setSelectedMovementId={setSelectedMovementId}
              />
            )}
          </DialogContent>

          <DialogActions sx={dialogActionsStyles}>
            {showResubmitButton() && (
              <Button
                onClick={handleResubmitClick}
                variant="contained"
                disabled={!shouldEnableResubmitButton() || isProcessing}
                startIcon={
                  isProcessing ? <CircularProgress size={16} /> : <SendIcon />
                }
                sx={{
                  backgroundColor:
                    shouldEnableResubmitButton() && !isProcessing
                      ? "rgb(33, 61, 112)"
                      : "rgba(33, 61, 112, 0.3)",
                  "&:hover": {
                    backgroundColor:
                      shouldEnableResubmitButton() && !isProcessing
                        ? "rgb(25, 45, 84)"
                        : "rgba(33, 61, 112, 0.3)",
                  },
                  "&:disabled": {
                    backgroundColor: "rgba(33, 61, 112, 0.3)",
                    color: "rgba(255, 255, 255, 0.5)",
                  },
                  mr: 2,
                }}>
                {isProcessing ? "Resubmitting..." : "Resubmit"}
              </Button>
            )}

            {!isReadOnly && !showLoadingState && (
              <Button
                type="submit"
                variant="contained"
                disabled={isProcessing}
                startIcon={
                  isProcessing ? (
                    <CircularProgress size={16} />
                  ) : currentMode === "create" ? (
                    <AddIcon />
                  ) : (
                    <EditIcon />
                  )
                }
                sx={saveButtonStyles}>
                {isProcessing
                  ? "Saving..."
                  : currentMode === "create"
                  ? "Create"
                  : "Update"}
              </Button>
            )}
          </DialogActions>
        </form>
      </Dialog>

      <Dialog
        open={showUpdateConfirmation}
        onClose={isConfirmingUpdate ? undefined : handleCancelUpdate}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            padding: 2,
            boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
            textAlign: "center",
          },
        }}>
        <DialogTitle sx={{ padding: 0, marginBottom: 2 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              marginBottom: 2,
            }}>
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                backgroundColor: "#ff4400",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
              <Typography
                sx={{
                  color: "white",
                  fontSize: "30px",
                  fontWeight: "normal",
                }}>
                ?
              </Typography>
            </Box>
          </Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              color: "rgb(25, 45, 84)",
              marginBottom: 0,
            }}>
            Confirmation
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ padding: 0, textAlign: "center" }}>
          <Typography
            variant="body1"
            sx={{
              marginBottom: 2,
              fontSize: "16px",
              color: "#333",
              fontWeight: 400,
            }}>
            Are you sure you want to <strong>Update</strong> this MDA Form?
          </Typography>
          {selectedEntry && (
            <Typography
              variant="body2"
              sx={{
                fontSize: "14px",
                color: "#666",
                fontWeight: 500,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}>
              {selectedEntry?.reference_number || ""}
            </Typography>
          )}
        </DialogContent>
        <DialogActions
          sx={{
            justifyContent: "center",
            padding: 0,
            marginTop: 3,
            gap: 2,
          }}>
          <Button
            onClick={handleCancelUpdate}
            variant="outlined"
            sx={{
              textTransform: "uppercase",
              fontWeight: 600,
              borderColor: "#f44336",
              color: "#f44336",
              paddingX: 3,
              paddingY: 1,
              borderRadius: 2,
              "&:hover": {
                borderColor: "#d32f2f",
                backgroundColor: "rgba(244, 67, 54, 0.04)",
              },
            }}
            disabled={isConfirmingUpdate}>
            CANCEL
          </Button>
          <Button
            onClick={handleConfirmUpdate}
            variant="contained"
            sx={{
              textTransform: "uppercase",
              fontWeight: 600,
              backgroundColor: "#4caf50",
              paddingX: 3,
              paddingY: 1,
              borderRadius: 2,
              "&:hover": {
                backgroundColor: "#388e3c",
              },
            }}
            disabled={isConfirmingUpdate}>
            {isConfirmingUpdate ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              "CONFIRM"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={showResubmitConfirmation}
        onClose={isConfirmingResubmit ? undefined : handleCancelResubmit}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            padding: 2,
            boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
            textAlign: "center",
          },
        }}>
        <DialogTitle sx={{ padding: 0, marginBottom: 2 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              marginBottom: 2,
            }}>
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                backgroundColor: "#ff4400",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
              <Typography
                sx={{
                  color: "white",
                  fontSize: "30px",
                  fontWeight: "normal",
                }}>
                ?
              </Typography>
            </Box>
          </Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              color: "rgb(25, 45, 84)",
              marginBottom: 0,
            }}>
            Confirmation
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ padding: 0, textAlign: "center" }}>
          <Typography
            variant="body1"
            sx={{
              marginBottom: 2,
              fontSize: "16px",
              color: "#333",
              fontWeight: 400,
            }}>
            Are you sure you want to <strong>Resubmit</strong> this MDA Form?
          </Typography>
          {selectedEntry && (
            <Typography
              variant="body2"
              sx={{
                fontSize: "14px",
                color: "#666",
                fontWeight: 500,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}>
              {selectedEntry?.reference_number || ""}
            </Typography>
          )}
        </DialogContent>
        <DialogActions
          sx={{
            justifyContent: "center",
            padding: 0,
            marginTop: 3,
            gap: 2,
          }}>
          <Button
            onClick={handleCancelResubmit}
            variant="outlined"
            sx={{
              textTransform: "uppercase",
              fontWeight: 600,
              borderColor: "#f44336",
              color: "#f44336",
              paddingX: 3,
              paddingY: 1,
              borderRadius: 2,
              "&:hover": {
                borderColor: "#d32f2f",
                backgroundColor: "rgba(244, 67, 54, 0.04)",
              },
            }}
            disabled={isConfirmingResubmit}>
            CANCEL
          </Button>
          <Button
            onClick={handleConfirmResubmit}
            variant="contained"
            sx={{
              textTransform: "uppercase",
              fontWeight: 600,
              backgroundColor: "#4caf50",
              paddingX: 3,
              paddingY: 1,
              borderRadius: 2,
              "&:hover": {
                backgroundColor: "#388e3c",
              },
            }}
            disabled={isConfirmingResubmit}>
            {isConfirmingResubmit ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              "CONFIRM"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Print Dialog */}
      <Dialog
        open={showPrintDialog}
        onClose={handleClosePrintDialog}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            width: "90vw",
            height: "90vh",
            maxWidth: "1200px",
            maxHeight: "900px",
          },
        }}>
        <DialogTitle>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}>
            <Typography variant="h6">Print MDA Form</Typography>
            <IconButton onClick={handleClosePrintDialog}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ padding: 0 }}>
          {printData && <MDAFormPrinting data={printData} />}
        </DialogContent>
      </Dialog>
    </LocalizationProvider>
  );
};

export default MDAFormModal;
