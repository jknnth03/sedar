import React, { useEffect, useState } from "react";
import { useForm, FormProvider, useFormContext } from "react-hook-form";
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
  SwapHoriz as SwapHorizIcon,
  Send as SendIcon,
} from "@mui/icons-material";
import EditOffIcon from "@mui/icons-material/EditOff";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { yupResolver } from "@hookform/resolvers/yup";
import dayjs from "dayjs";
import { useGetAllApprovalFormsQuery } from "../../../features/api/approvalsetting/approvalFormApi";
import { useLazyGetAllPositionsQuery } from "../../../features/api/masterlist/positionsApi";
import { useLazyGetAllEmployeesQuery } from "../../../features/api/employee/mainApi";
import { useLazyGetDataChangeSubmissionDetailsQuery } from "../../../features/api/forms/datachangeApi";
import {
  createDataChangeSchema,
  dataChangeDefaultValues,
} from "./DataChangeSchema";
import DataChangeFields from "./DataChangeField";

const FormContent = ({
  onSave,
  onResubmit,
  selectedEntry,
  isLoading,
  mode,
  onClose,
  onModeChange,
  reset,
  backendErrors = {},
}) => {
  const {
    formState: { errors },
    setValue,
    watch,
    handleSubmit,
    getValues,
    trigger,
    clearErrors,
    setError,
  } = useFormContext();

  const [selectedFile, setSelectedFile] = useState(null);
  const [currentMode, setCurrentMode] = useState(mode);
  const [originalMode, setOriginalMode] = useState(mode);
  const [detailedEntry, setDetailedEntry] = useState(null);

  const watchedEmployeeId = watch("employee_id");

  const { data: approvalFormsData = [] } = useGetAllApprovalFormsQuery();
  const [getPositions, { data: positionsData = [] }] =
    useLazyGetAllPositionsQuery();
  const [getEmployees, { data: employeesData = [] }] =
    useLazyGetAllEmployeesQuery();

  const [getSubmissionDetails, { data: submissionDetailsData }] =
    useLazyGetDataChangeSubmissionDetailsQuery();

  useEffect(() => {
    getPositions();
    getEmployees();
  }, [getPositions, getEmployees]);

  useEffect(() => {
    if (selectedEntry?.id && (mode === "view" || mode === "edit")) {
      console.log("Fetching detailed data for submission:", selectedEntry.id);
      getSubmissionDetails(selectedEntry.id);
    }
  }, [selectedEntry?.id, mode, getSubmissionDetails]);

  useEffect(() => {
    if (submissionDetailsData?.result) {
      console.log(
        "Detailed submission data received:",
        submissionDetailsData.result
      );
      setDetailedEntry(submissionDetailsData.result);
    }
  }, [submissionDetailsData]);

  const approvalForms = Array.isArray(approvalFormsData?.result?.data)
    ? approvalFormsData.result.data
    : Array.isArray(approvalFormsData?.result)
    ? approvalFormsData.result
    : Array.isArray(approvalFormsData)
    ? approvalFormsData
    : [];

  const positions = Array.isArray(positionsData?.result)
    ? positionsData.result
    : Array.isArray(positionsData)
    ? positionsData
    : [];

  const employees = Array.isArray(employeesData?.result?.data)
    ? employeesData.result.data
    : Array.isArray(employeesData?.result)
    ? employeesData.result
    : Array.isArray(employeesData)
    ? employeesData
    : [];

  const findOptionById = (options, id) => {
    if (!id || !options?.length) return null;
    return options.find((option) => option.id === id) || null;
  };

  const findDataChangeForm = () => {
    return (
      approvalForms.find(
        (form) =>
          form.name === "Data Change Form" ||
          form.name?.toLowerCase().includes("data change")
      ) || null
    );
  };

  const shouldEnableEditButton = () => {
    if (!selectedEntry || !selectedEntry.actions) {
      return false;
    }
    return selectedEntry.actions.can_update === true;
  };

  const shouldEnableResubmitButton = () => {
    if (!selectedEntry || !selectedEntry.actions) {
      return false;
    }
    return selectedEntry.actions.can_resubmit === true;
  };

  const populateFormWithEntry = (entry) => {
    console.log("Populating form with entry:", entry);

    if (!entry) {
      console.log("No entry provided");
      return;
    }

    const dataToUse = detailedEntry || entry;
    console.log("Using data:", dataToUse);
    console.log("ALL AVAILABLE FIELDS IN DATA:", Object.keys(dataToUse));
    console.log("FULL DATA OBJECT:", JSON.stringify(dataToUse, null, 2));

    // Deep scan for any field containing "reason"
    const findReasonFields = (obj, path = "") => {
      let reasonFields = [];
      for (let key in obj) {
        const currentPath = path ? `${path}.${key}` : key;
        if (typeof obj[key] === "object" && obj[key] !== null) {
          reasonFields = reasonFields.concat(
            findReasonFields(obj[key], currentPath)
          );
        }
        if (
          key.toLowerCase().includes("reason") ||
          (typeof obj[key] === "string" &&
            obj[key].toLowerCase().includes("reason"))
        ) {
          reasonFields.push(`${currentPath}: ${obj[key]}`);
        }
      }
      return reasonFields;
    };

    console.log("ALL FIELDS CONTAINING 'REASON':", findReasonFields(dataToUse));

    // Set form_id if approval forms are available
    if (approvalForms.length > 0) {
      const foundForm = findDataChangeForm();
      if (foundForm) {
        setValue("form_id", foundForm, { shouldValidate: false });
        console.log("Set form_id:", foundForm);
      }
    }

    // Create virtual employee from detailed entry data if not found in dropdown
    let foundEmployee = null;

    // Try to find in existing employees first
    if (employees.length > 0) {
      if (dataToUse.employee_id) {
        foundEmployee = employees.find(
          (emp) => emp.id === dataToUse.employee_id
        );
      }

      if (!foundEmployee && dataToUse.employee_code) {
        foundEmployee = employees.find(
          (emp) =>
            emp.employee_code === dataToUse.employee_code ||
            emp.employee_code === dataToUse.employee_code.toString() ||
            emp.id?.toString() === dataToUse.employee_code.toString()
        );
      }

      if (!foundEmployee && dataToUse.employee_name) {
        foundEmployee = employees.find(
          (emp) =>
            emp.full_name === dataToUse.employee_name ||
            emp.employee_name === dataToUse.employee_name ||
            emp.name === dataToUse.employee_name
        );
      }
    }

    // If not found in dropdown, create virtual employee from entry data
    if (
      !foundEmployee &&
      (dataToUse.employee_name || dataToUse.employee_code)
    ) {
      foundEmployee = {
        id: dataToUse.employee_id || "virtual_" + dataToUse.employee_code,
        employee_name: dataToUse.employee_name,
        full_name: dataToUse.employee_name,
        employee_code: dataToUse.employee_code,
        isFromSelectedEntry: true,
      };
      console.log("Created virtual employee:", foundEmployee);
    }

    if (foundEmployee) {
      setValue("employee_id", foundEmployee, { shouldValidate: false });
      console.log("Set employee_id:", foundEmployee);
    }

    // Set position - Updated to handle the actual data structure
    if (positions.length > 0) {
      let positionId = null;
      let positionName = null;

      // Check proposed_changes.position structure first (this matches your actual data)
      if (dataToUse.proposed_changes?.position) {
        positionId = dataToUse.proposed_changes.position.id;
        positionName = dataToUse.proposed_changes.position.name;
      }

      // Fallback to other possible locations
      if (!positionId) {
        positionId =
          dataToUse.new_position_id ||
          dataToUse.position_id ||
          dataToUse.data?.new_position_id ||
          dataToUse.data?.position_id;
      }

      console.log(
        "Looking for position with ID:",
        positionId,
        "Name:",
        positionName
      );

      if (positionId) {
        const foundPosition = findOptionById(positions, positionId);
        if (foundPosition) {
          setValue("new_position_id", foundPosition, { shouldValidate: false });
          console.log("Set new_position_id:", foundPosition);
        } else {
          console.log("Position not found in positions array");
          // If not found by ID, try to find by name
          if (positionName) {
            const foundPositionByName = positions.find(
              (pos) => pos.name === positionName || pos.title === positionName
            );
            if (foundPositionByName) {
              setValue("new_position_id", foundPositionByName, {
                shouldValidate: false,
              });
              console.log("Set new_position_id by name:", foundPositionByName);
            }
          }
        }
      } else {
        console.log("No position ID found in data");
      }
    }

    // Set text fields - Updated to handle the actual data structure
    let reasonForChange = "";

    // Add comprehensive logging to debug reason_for_change
    console.log("=== DEBUGGING REASON FOR CHANGE ===");
    console.log("proposed_changes:", dataToUse.proposed_changes);
    console.log("current_data:", dataToUse.current_data);
    console.log("All root level fields:", Object.keys(dataToUse));

    // Check all possible locations for reason_for_change
    const possibleReasonFields = [
      dataToUse.proposed_changes?.reason_for_change,
      dataToUse.proposed_changes?.reason,
      dataToUse.reason_for_change,
      dataToUse.reasonForChange,
      dataToUse["reason-for-change"],
      dataToUse.reason,
      dataToUse.change_reason,
      dataToUse.current_data?.reason_for_change,
      dataToUse.data?.reason_for_change,
      dataToUse.submittable?.reason_for_change,
      dataToUse.form_data?.reason_for_change,
      dataToUse.attributes?.reason_for_change,
    ];

    console.log(
      "Checking all possible reason field values:",
      possibleReasonFields
    );

    // Find the first non-empty value
    reasonForChange =
      possibleReasonFields.find(
        (value) => value !== undefined && value !== null && value !== ""
      ) || "";

    setValue("reason_for_change", reasonForChange, { shouldValidate: false });
    console.log("Final reason_for_change value set:", reasonForChange);
    console.log("=== END DEBUGGING REASON FOR CHANGE ===");

    // Handle remarks - Updated to check proposed_changes first
    let remarks = "";

    if (dataToUse.proposed_changes?.remarks) {
      remarks = dataToUse.proposed_changes.remarks;
    } else {
      remarks =
        dataToUse.remarks ||
        dataToUse.comment ||
        dataToUse.comments ||
        dataToUse.notes ||
        dataToUse.data?.remarks ||
        dataToUse.submittable?.remarks ||
        "";
    }

    setValue("remarks", remarks, { shouldValidate: false });
    console.log("Set remarks:", remarks);

    // Set attachment fields - Updated to handle the actual data structure
    let attachment = "";
    let attachmentFilename = "";

    // Check proposed_changes.attachment first (this matches your actual data)
    if (dataToUse.proposed_changes?.attachment) {
      attachment = dataToUse.proposed_changes.attachment;
      // Extract filename from the path
      attachmentFilename =
        dataToUse.proposed_changes.attachment.split("/").pop() || "";
    } else {
      // Fallback to other possible locations
      attachment =
        dataToUse.data_change_attachment ||
        dataToUse.attachment ||
        dataToUse.file ||
        dataToUse.attachment_url ||
        dataToUse.data?.data_change_attachment ||
        dataToUse.submittable?.data_change_attachment ||
        "";

      attachmentFilename =
        dataToUse.data_change_attachment_filename ||
        dataToUse.attachment_filename ||
        dataToUse.filename ||
        dataToUse.file_name ||
        dataToUse.attachment_name ||
        dataToUse.data?.data_change_attachment_filename ||
        dataToUse.submittable?.data_change_attachment_filename ||
        "";
    }

    setValue("data_change_attachment", attachment, { shouldValidate: false });
    setValue("data_change_attachment_filename", attachmentFilename, {
      shouldValidate: false,
    });
    console.log("Set attachment filename:", attachmentFilename);

    if (attachmentFilename) {
      setSelectedFile({
        name: attachmentFilename,
        url: attachment,
      });
    } else {
      setSelectedFile(null);
    }

    clearErrors();
    console.log("Form population completed");
  };
  const initializeForm = () => {
    console.log("Initializing form, mode:", currentMode);

    if (currentMode === "create") {
      reset(dataChangeDefaultValues);
      setSelectedFile(null);

      if (approvalForms.length > 0) {
        const dataChangeForm = findDataChangeForm();
        if (dataChangeForm) {
          setValue("form_id", dataChangeForm);
        }
      }
    } else if (
      selectedEntry &&
      (currentMode === "view" || currentMode === "edit")
    ) {
      console.log("Populating form with existing entry");
      populateFormWithEntry(selectedEntry);
    }
  };

  useEffect(() => {
    setCurrentMode(mode);
    setOriginalMode(mode);
  }, [mode]);

  useEffect(() => {
    if (
      approvalForms.length > 0 &&
      employees.length > 0 &&
      positions.length > 0
    ) {
      console.log("All data loaded, initializing form");
      initializeForm();
    }
  }, [
    currentMode,
    approvalForms.length,
    employees.length,
    positions.length,
    selectedEntry?.id,
    detailedEntry,
  ]);

  useEffect(() => {
    if (backendErrors && Object.keys(backendErrors).length > 0) {
      Object.entries(backendErrors).forEach(([field, messages]) => {
        if (Array.isArray(messages) && messages.length > 0) {
          setError(field, {
            type: "server",
            message: messages[0],
          });
        }
      });
    }
  }, [backendErrors, setError]);

  const hasBackendError =
    backendErrors && Object.keys(backendErrors).length > 0;

  const handleModeChange = (newMode) => {
    setCurrentMode(newMode);
    if (onModeChange) {
      onModeChange(newMode);
    }
  };

  const handleCancelEdit = () => {
    setCurrentMode(originalMode);
    if (onModeChange) {
      onModeChange(originalMode);
    }

    if (selectedEntry && (originalMode === "view" || originalMode === "edit")) {
      populateFormWithEntry(selectedEntry);
    }
  };

  const handleClose = () => {
    setCurrentMode("create");
    setOriginalMode("create");
    setDetailedEntry(null);
    if (reset) {
      reset();
    }
    onClose();
  };

  const getModalTitle = () => {
    switch (currentMode) {
      case "create":
        return "CREATE DATA CHANGE FORM";
      case "view":
        return "VIEW DATA CHANGE FORM";
      case "edit":
        return "EDIT DATA CHANGE FORM";
      default:
        return "DATA CHANGE FORM";
    }
  };

  const isReadOnly = currentMode === "view";
  const isCreateMode = currentMode === "create";
  const isEditMode = currentMode === "edit";
  const isViewMode = currentMode === "view";

  const handleFileChange = (file) => {
    setSelectedFile(file);
    setValue("data_change_attachment", file);
  };

  const onSubmit = (data) => {
    if (!data.form_id) {
      const dataChangeForm = findDataChangeForm();
      if (dataChangeForm) {
        data.form_id = dataChangeForm;
        setValue("form_id", dataChangeForm);
      }
    }

    const formData = new FormData();

    formData.append("mode", currentMode);

    if (currentMode === "edit" && selectedEntry?.id) {
      formData.append("id", selectedEntry.id);
      formData.append("_method", "PATCH");
    }

    const dataChangeForm = findDataChangeForm();
    if (dataChangeForm?.id) {
      formData.append("form_id", dataChangeForm.id);
    } else if (data.form_id?.id) {
      formData.append("form_id", data.form_id.id);
    }

    if (data.employee_id?.id) {
      formData.append("employee_id", data.employee_id.id);
    }

    if (data.new_position_id?.id) {
      formData.append("new_position_id", data.new_position_id.id);
    }

    if (data.reason_for_change && data.reason_for_change.trim() !== "") {
      formData.append("reason_for_change", data.reason_for_change);
    }

    if (data.remarks && data.remarks.trim() !== "") {
      formData.append("remarks", data.remarks);
    }

    if (selectedFile) {
      if (selectedFile instanceof File) {
        formData.append("data_change_attachment", selectedFile);
      } else if (currentMode === "edit" && typeof selectedFile === "string") {
        formData.append("existing_attachment", selectedFile);
      }
    }

    if (onSave) {
      onSave(formData, currentMode);
    }
  };

  const handleResubmit = () => {
    if (onResubmit && selectedEntry) {
      onResubmit(selectedEntry.id);
    }
  };

  const handleSaveClick = async () => {
    if (
      currentMode === "edit" &&
      selectedFile &&
      typeof selectedFile === "string"
    ) {
      setValue("data_change_attachment", selectedFile);
      clearErrors("data_change_attachment");
    }

    const isValid = await trigger();

    if (isValid) {
      handleSubmit(onSubmit)();
    }
  };

  return (
    <>
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 1,
          backgroundColor: "#fff",
        }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <SwapHorizIcon sx={{ color: "rgb(33, 61, 112)" }} />
          <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
            {getModalTitle()}
          </Typography>
          {isViewMode && shouldEnableEditButton() && (
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

      <DialogContent sx={{ backgroundColor: "#fff" }}>
        {hasBackendError && (
          <Box
            sx={{
              mb: 2,
              p: 2,
              backgroundColor: "#ffebee",
              border: "1px solid #f44336",
              borderRadius: 1,
            }}>
            <Typography variant="body2" color="error" sx={{ fontWeight: 500 }}>
              Error: The data change attachment field must be a file of type:
              pdf, doc, docx, jpg, png.
            </Typography>
          </Box>
        )}

        {!isCreateMode && selectedEntry && (
          <Box sx={{ mb: 2, p: 0.5, borderRadius: 1 }}>
            {selectedEntry.updated_at && (
              <Typography variant="body2" color="text.secondary">
                Last Updated:{" "}
                {dayjs(selectedEntry.updated_at).format("MMM DD, YYYY HH:mm")}
              </Typography>
            )}
          </Box>
        )}

        <DataChangeFields
          mode={currentMode}
          selectedEntry={detailedEntry || selectedEntry}
          onFileChange={handleFileChange}
          selectedFile={selectedFile}
          disabled={false}
        />
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          py: 2,
          backgroundColor: "#fff",
          justifyContent: "flex-end",
        }}>
        {isViewMode && (
          <Box>
            <Button
              onClick={handleResubmit}
              variant="contained"
              disabled={!shouldEnableResubmitButton()}
              startIcon={<SendIcon />}
              sx={{
                backgroundColor: shouldEnableResubmitButton()
                  ? "rgb(33, 61, 112)"
                  : "rgba(33, 61, 112, 0.3)",
                "&:hover": {
                  backgroundColor: shouldEnableResubmitButton()
                    ? "rgb(25, 45, 84)"
                    : "rgba(33, 61, 112, 0.3)",
                },
                "&:disabled": {
                  backgroundColor: "rgba(33, 61, 112, 0.3)",
                  color: "rgba(255, 255, 255, 0.5)",
                },
              }}>
              Resubmit
            </Button>
          </Box>
        )}

        {(isCreateMode || isEditMode) && (
          <Box>
            <Button
              onClick={handleSaveClick}
              variant="contained"
              disabled={isLoading}
              startIcon={
                isLoading ? (
                  <CircularProgress size={16} />
                ) : isCreateMode ? (
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
              {isLoading ? "Saving..." : isCreateMode ? "Create" : "Update"}
            </Button>
          </Box>
        )}
      </DialogActions>
    </>
  );
};

const DataChangeModal = ({
  open = false,
  onClose,
  onSave,
  onResubmit,
  selectedEntry = null,
  isLoading = false,
  mode = "create",
  onModeChange,
  backendErrors = {},
}) => {
  const hasExistingFile =
    selectedEntry?.submittable?.data_change_attachment_filename ||
    selectedEntry?.data?.data_change_attachment_filename ||
    selectedEntry?.attributes?.data_change_attachment_filename ||
    selectedEntry?.data_change_attachment_filename
      ? true
      : false;

  const methods = useForm({
    defaultValues: dataChangeDefaultValues,
    resolver: yupResolver(createDataChangeSchema(mode, hasExistingFile)),
    mode: "onChange",
  });

  const handleClose = () => {
    methods.reset(dataChangeDefaultValues);
    onClose();
  };

  const handleModeChange = (newMode) => {
    if (newMode === "create") {
      methods.reset(dataChangeDefaultValues);
    }

    if (onModeChange) {
      onModeChange(newMode);
    }
  };

  const handleResubmit = (submissionId) => {
    if (onResubmit) {
      onResubmit(submissionId);
    }
  };

  useEffect(() => {
    const hasFile =
      selectedEntry?.submittable?.data_change_attachment_filename ||
      selectedEntry?.data?.data_change_attachment_filename ||
      selectedEntry?.attributes?.data_change_attachment_filename ||
      selectedEntry?.data_change_attachment_filename
        ? true
        : false;
    methods.clearErrors();
  }, [mode, selectedEntry, methods]);

  if (!open) return null;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            minHeight: "66vh",
            maxHeight: "66vh",
          },
        }}>
        <FormProvider {...methods}>
          <FormContent
            onSave={onSave}
            onResubmit={handleResubmit}
            selectedEntry={selectedEntry}
            isLoading={isLoading}
            mode={mode}
            onClose={handleClose}
            onModeChange={handleModeChange}
            reset={methods.reset}
            backendErrors={backendErrors}
          />
        </FormProvider>
      </Dialog>
    </LocalizationProvider>
  );
};

export default DataChangeModal;
