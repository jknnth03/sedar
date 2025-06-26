import React, { useState, useRef, useEffect } from "react";
import GeneralViewForm from "../../modal/employee/viewing (forms)/GeneralViewForm";
import PositionViewForm from "../employee/viewing (forms)/PositionViewForm";
import EmploymentTypeViewForm from "../../modal/employee/viewing (forms)/EmploymentTypeViewForm";
import AddressViewForm from "../../modal/employee/viewing (forms)/AddressViewForm";
import AttainmentViewForm from "../../../components/modal/employee/viewing (forms)/AttainmentViewForm";
import AccountViewForm from "../employee/viewing (forms)/AccountViewForm";
import ContactViewForm from "../employee/viewing (forms)/ContactViewForm";
import FileViewForm from "../employee/viewing (forms)/FileViewForm";
import {
  Dialog,
  DialogContent,
  DialogActions,
  DialogTitle,
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Alert,
  IconButton,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import { useGetEmployeesQuery } from "../../../features/api/employee/mainApi";

const ViewEmployeeModal = ({
  open,
  onClose,
  employeeId,
  onEdit,
  defaultStep = 0,
}) => {
  const [currentStep, setCurrentStep] = useState(defaultStep);
  const [employeeData, setEmployeeData] = useState(null);

  const {
    data: employeesData,
    isLoading,
    error,
  } = useGetEmployeesQuery(
    {
      id: employeeId,
      pagination: 0,
    },
    {
      skip: !employeeId || !open,
    }
  );

  console.log("empdata", employeesData);

  const stepLabels = [
    "GENERAL INFOS",
    "ADDRESSES",
    "EMPLOYEE POSITIONS",
    "EMPLOYMENT TYPES",
    "STATUSES",
    "ATTAINMENTS",
    "ACCOUNTS",
    "CONTACTS",
    "FILES",
  ];

  const steps = stepLabels.map((label) => (
    <span style={{ fontWeight: "bold", color: "rgb(33, 61, 112)" }}>
      {label}
    </span>
  ));

  const stepperStyles = {
    "& .MuiStepIcon-root": {
      "&:not(.Mui-active):not(.Mui-completed)": {
        color: "rgb(231, 208, 0) !important",
      },
      "&.Mui-active": {
        color: "rgb(0, 99, 25) !important",
      },
    },
    "& .MuiStepIcon-text": {
      fill: "white",
    },
  };

  useEffect(() => {
    if (employeesData && employeeId) {
      let employee = null;

      if (employeesData.id === employeeId) {
        employee = employeesData;
      } else if (
        employeesData.result &&
        employeesData.result.id === employeeId
      ) {
        employee = employeesData.result;
      } else if (employeesData.data && employeesData.data.id === employeeId) {
        employee = employeesData.data;
      } else if (Array.isArray(employeesData)) {
        employee = employeesData.find((emp) => emp.id === employeeId);
      } else if (
        employeesData.result &&
        Array.isArray(employeesData.result.data)
      ) {
        employee = employeesData.result.data.find(
          (emp) => emp.id === employeeId
        );
      } else if (employeesData.data && Array.isArray(employeesData.data)) {
        employee = employeesData.data.find((emp) => emp.id === employeeId);
      } else if (employeesData.result && Array.isArray(employeesData.result)) {
        employee = employeesData.result.find((emp) => emp.id === employeeId);
      }

      setEmployeeData(employee);
    }
  }, [employeesData, employeeId]);

  useEffect(() => {
    if (open) {
      setCurrentStep(defaultStep);
    } else {
      setEmployeeData(null);
      setCurrentStep(defaultStep);
    }
  }, [open, defaultStep]);

  useEffect(() => {
    if (open) {
      setCurrentStep(defaultStep);
    }
  }, [defaultStep, open]);

  const formatEmployeeDisplay = (employeeData) => {
    if (!employeeData) return "";

    const generalData = employeeData.general_info || employeeData;

    const firstName = generalData.first_name || "";
    const lastName = generalData.last_name || "";
    const idNumber = generalData.id_number || generalData.id || "";
    const fullName = `${firstName} ${lastName}`.toUpperCase();

    const isValidString = (value) => {
      return (
        value &&
        typeof value === "string" &&
        value !== "-" &&
        value.trim() !== ""
      );
    };

    let prefixName = "";

    if (isValidString(generalData.prefix_display_name)) {
      prefixName = generalData.prefix_display_name;
    } else if (isValidString(generalData.prefix_name)) {
      prefixName = generalData.prefix_name;
    } else if (isValidString(generalData.prefix_label)) {
      prefixName = generalData.prefix_label;
    } else if (isValidString(generalData.prefix_text)) {
      prefixName = generalData.prefix_text;
    } else if (
      generalData.prefix &&
      typeof generalData.prefix === "string" &&
      generalData.prefix !== "-" &&
      generalData.prefix.trim() !== "" &&
      isNaN(generalData.prefix)
    ) {
      prefixName = generalData.prefix;
    }

    if (prefixName && prefixName.trim() !== "") {
      return `${fullName} (${prefixName} - ${idNumber})`;
    } else {
      return `${fullName} (${idNumber})`;
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleEdit = () => {
    if (!onEdit) {
      alert(
        "Edit functionality is not available. Please check the parent component."
      );
      return;
    }

    if (!employeeData) {
      alert("No employee data available for editing.");
      return;
    }

    try {
      let editStep = currentStep;

      if (currentStep >= 4) {
        editStep = currentStep - 1;
      }

      onEdit(employeeData, editStep);
    } catch (error) {
      alert("An error occurred while trying to edit. Please try again.");
    }
  };

  const handleClose = () => {
    setCurrentStep(defaultStep);
    setEmployeeData(null);
    onClose();
  };

  const getFormData = (step, employeeData) => {
    if (!employeeData) return null;

    switch (step) {
      case 0:
        return employeeData.general_info || employeeData;

      case 1:
        return employeeData.address || employeeData.addresses;

      case 2:
        return (
          employeeData.position_details ||
          employeeData.positions ||
          employeeData.position
        );

      case 3:
        const employmentTypes = employeeData.employment_types;
        if (Array.isArray(employmentTypes) && employmentTypes.length > 0) {
          return employmentTypes[0];
        }
        return employeeData.employmentType || null;

      case 4:
        return null;

      case 5:
        const attainments = employeeData.attainments;
        if (Array.isArray(attainments) && attainments.length > 0) {
          return attainments[0];
        }
        return employeeData.attainment || null;

      case 6:
        return employeeData.account || employeeData.accounts;

      case 7:
        const contacts = employeeData.contacts;
        if (Array.isArray(contacts)) {
          return contacts;
        }
        return employeeData.contact || [];

      case 8:
        const files =
          employeeData.files ||
          employeeData.file ||
          employeeData.documents ||
          employeeData.attachments ||
          employeeData.file_attachments ||
          employeeData.employee_files ||
          [];

        return files;

      default:
        return null;
    }
  };

  const renderStepContent = (step) => {
    if (!employeeData) return null;

    const formData = getFormData(step, employeeData);

    const commonProps = {
      isLoading: false,
      viewOnly: true,
      disabled: true,
      readOnly: true,
      sx: {
        "& .MuiTextField-root": {
          "& .MuiInputBase-input": {
            color: "rgba(0, 0, 0, 0.6) !important",
            cursor: "default",
          },
          "& .MuiInputBase-root": {
            backgroundColor: "rgba(0, 0, 0, 0.04)",
            cursor: "default",
          },
        },
        "& .MuiSelect-root": {
          backgroundColor: "rgba(0, 0, 0, 0.04)",
          cursor: "default",
        },
      },
    };

    const commonStyling = {
      filter: "grayscale(0.5)",
      opacity: 0.8,
      pointerEvents: "none",
      "& .MuiTextField-root, & .MuiFormControl-root": {
        "& .MuiInputBase-input": {
          color: "rgba(0, 0, 0, 0.6) !important",
          cursor: "default",
          WebkitTextFillColor: "rgba(0, 0, 0, 0.6) !important",
        },
        "& .MuiInputBase-root": {
          backgroundColor: "rgba(0, 0, 0, 0.04) !important",
          cursor: "default",
        },
        "& .MuiSelect-select": {
          backgroundColor: "rgba(0, 0, 0, 0.04) !important",
          cursor: "default",
        },
        "& fieldset": {
          borderColor: "rgba(0, 0, 0, 0.23) !important",
        },
      },
    };

    const employeeAlert = (
      <Alert severity="info" className="employee-info-alert">
        <strong>Employee:</strong> {formatEmployeeDisplay(employeeData)}
      </Alert>
    );

    switch (step) {
      case 0:
        return (
          <Box className="multiform-modal__form-step" sx={commonStyling}>
            <GeneralViewForm selectedGeneral={formData} {...commonProps} />
          </Box>
        );

      case 1:
        return (
          <Box className="multiform-modal__form-step" sx={commonStyling}>
            {employeeAlert}
            <AddressViewForm selectedAddress={formData} {...commonProps} />
          </Box>
        );

      case 2:
        return (
          <Box className="multiform-modal__form-step" sx={commonStyling}>
            {employeeAlert}
            <PositionViewForm selectedPosition={formData} {...commonProps} />
          </Box>
        );

      case 3:
        return (
          <Box className="multiform-modal__form-step" sx={commonStyling}>
            {employeeAlert}
            <EmploymentTypeViewForm
              selectedEmploymentType={formData}
              {...commonProps}
            />
          </Box>
        );

      case 4:
        return (
          <Box className="multiform-modal__form-step" sx={commonStyling}>
            {employeeAlert}
            <Box sx={{ p: 3, textAlign: "center" }}>
              <Typography variant="h6" color="textSecondary">
                Statuses section - Coming soon
              </Typography>
            </Box>
          </Box>
        );

      case 5:
        return (
          <Box className="multiform-modal__form-step" sx={commonStyling}>
            {employeeAlert}
            <AttainmentViewForm
              selectedAttainment={formData}
              {...commonProps}
            />
          </Box>
        );

      case 6:
        return (
          <Box className="multiform-modal__form-step" sx={commonStyling}>
            {employeeAlert}
            <AccountViewForm
              selectedAccount={formData}
              employeeId={employeeData.id}
              {...commonProps}
            />
          </Box>
        );

      case 7:
        return (
          <Box className="multiform-modal__form-step" sx={commonStyling}>
            {employeeAlert}
            <ContactViewForm
              selectedContacts={formData}
              employeeId={employeeData.id}
              {...commonProps}
            />
          </Box>
        );

      case 8:
        return (
          <Box className="multiform-modal__form-step" sx={commonStyling}>
            {employeeAlert}
            <FileViewForm
              selectedFiles={formData}
              employeeId={employeeData.id}
              employeeData={employeeData}
              {...commonProps}
            />
          </Box>
        );

      default:
        return null;
    }
  };

  const getCurrentStepName = () => {
    if (currentStep >= 0 && currentStep < stepLabels.length) {
      return stepLabels[currentStep];
    }
    return "";
  };

  if (isLoading && employeeId && open) {
    return (
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogContent>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            py={4}>
            <CircularProgress />
            <Typography variant="body1" sx={{ ml: 2 }}>
              Loading employee data...
            </Typography>
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  if (error && employeeId && open) {
    return (
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogContent>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            py={4}>
            <Alert severity="error">
              Failed to load employee data. Please try again.
              <br />
              Error: {error?.message || "Unknown error"}
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  if (!employeeData && employeeId && open && !isLoading) {
    return (
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogContent>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            py={4}>
            <CircularProgress />
            <Typography variant="body1" sx={{ ml: 2 }}>
              Loading employee data...
            </Typography>
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  if (!employeeId || !open) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      disableEscapeKeyDown={false}
      maxWidth="lg"
      fullWidth
      className="multiform-modal">
      <Box className="multiform-modal__header" sx={{ position: "relative" }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "left",
            gap: 1,
          }}>
          <Typography
            sx={{
              color: "rgb(33, 61, 112)",
              fontWeight: "bold",
              fontSize: "1.6rem",
              marginLeft: "0.5rem",
            }}>
            VIEW EMPLOYEE
          </Typography>
        </Box>
        <IconButton
          onClick={handleClose}
          sx={{
            marginTop: "0.6rem",
            marginRight: "0.4rem",
            position: "absolute",
            right: 8,
            top: 8,
            color: "rgb(33, 61, 112)",
          }}
          aria-label="close">
          <CloseIcon />
        </IconButton>
      </Box>

      <DialogContent className="multiform-modal__content">
        <Box className="multiform-modal__step-content">
          <Stepper activeStep={currentStep} alternativeLabel sx={stepperStyles}>
            {steps.map((label, index) => (
              <Step key={index} completed={false}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <Box className="step-content" sx={{ mt: 2 }}>
            {renderStepContent(currentStep)}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions className="multiform-modal__actions">
        <Button
          variant="contained"
          onClick={handleEdit}
          startIcon={<EditIcon />}
          sx={{
            backgroundColor: "rgb(4, 126, 0)",
            "&:hover": {
              backgroundColor: "rgb(4, 112, 0)",
            },
            marginRight: 0.5,
            width: "250px",
          }}>
          Edit {getCurrentStepName().split(" ")[0] || "Section"}
        </Button>

        <Box sx={{ flexGrow: 1 }} />

        <Button
          variant="outlined"
          onClick={handleBack}
          disabled={currentStep === 0}
          className="back-button">
          Back
        </Button>

        <Button
          variant="contained"
          onClick={handleNext}
          disabled={currentStep === steps.length - 1}
          className="next-button">
          Next
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ViewEmployeeModal;
