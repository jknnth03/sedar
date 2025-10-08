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
} from "@mui/icons-material";
import EditOffIcon from "@mui/icons-material/EditOff";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { useLazyGetMdaPrefillQuery } from "../../../../features/api/forms/mdaApi";
import MDAFormModalFields from "./MDAFormModalFields";
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

  const [triggerPrefill, { data: prefillData, isLoading: isPrefillLoading }] =
    useLazyGetMdaPrefillQuery();

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

    if (onSave) {
      await onSave(formattedData, currentMode);
      if (submissionId) {
        triggerPrefill(submissionId);
      }
    }
  };

  const handleClose = () => {
    reset();
    setCurrentMode(mode);
    setOriginalMode(mode);
    setSelectedMovementId(null);
    setMovementType("");
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

  const isReadOnly = currentMode === "view";
  const isCreate = currentMode === "create";
  const isViewMode = currentMode === "view";
  const isEditMode = currentMode === "edit";
  const showLoadingState = isPrefillLoading && isCreate && submissionId;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="xl"
        fullWidth
        PaperProps={{
          sx: {
            width: "90vw",
            maxWidth: "1100px",
            height: "90vh",
            maxHeight: "900px",
          },
        }}>
        <DialogTitle sx={dialogTitleStyles}>
          <Box sx={titleBoxStyles}>
            <DescriptionIcon sx={descriptionIconStyles} />
            <Typography variant="h6" component="div" sx={titleTypographyStyles}>
              {getModalTitle()}
            </Typography>
            {isViewMode && (
              <Tooltip title="EDIT MDA" arrow placement="top">
                <span>
                  <IconButton
                    onClick={() => handleModeChange("edit")}
                    disabled={isLoading}
                    size="small"
                    sx={editIconButtonStyles}>
                    <EditIcon sx={editIconStyles(isLoading)} />
                  </IconButton>
                </span>
              </Tooltip>
            )}
            {isEditMode && originalMode === "view" && (
              <Tooltip title="CANCEL EDIT">
                <span>
                  <IconButton
                    onClick={handleCancelEdit}
                    disabled={isLoading}
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
            {!isReadOnly && !showLoadingState && (
              <Button
                type="submit"
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
                sx={saveButtonStyles}>
                {isLoading
                  ? "Saving..."
                  : currentMode === "create"
                  ? "Create"
                  : "Update"}
              </Button>
            )}
          </DialogActions>
        </form>
      </Dialog>
    </LocalizationProvider>
  );
};

MDAFormModal.displayName = "MDAFormModal";

export default MDAFormModal;
