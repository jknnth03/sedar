import React from "react";
import { useFormContext, Controller } from "react-hook-form";
import { Grid, Typography, Box, TextField } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { gridItemLargeStyles } from "../MDAForm/MDAFornModal.styles";
import {
  infoSectionContainerStyles,
  infoFieldContainerStyles,
  infoFieldLabelStyles,
  infoFieldValueStyles,
  infoBoxStyles,
  addressGridStyles,
} from "../MDAForm/MDAFormModalFields.styles";
import { FromPositionFields } from "./MDADAModalFromPosition";
import { ToPositionFields } from "./MDADAModalToPosition";

const InfoSection = ({ children }) => (
  <Box sx={infoSectionContainerStyles}>{children}</Box>
);

const InfoField = ({ label, value }) => (
  <Box sx={infoFieldContainerStyles}>
    <Typography variant="subtitle2" sx={infoFieldLabelStyles}>
      {label}
    </Typography>
    <Typography variant="body2" sx={infoFieldValueStyles}>
      {value || "-"}
    </Typography>
  </Box>
);

const MDADAModalFields = ({
  isCreate = true,
  isReadOnly = false,
  currentMode = "create",
  positions = [],
  jobLevels = [],
  initialData = null,
}) => {
  const {
    control,
    watch,
    formState: { errors },
  } = useFormContext();

  const formValues = watch();

  const formatDate = (date) => {
    if (!date) return "-";
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return "-";
    return `₱${parseFloat(amount).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Grid container spacing={0}>
          <Grid item xs={12} md={6}>
            <Box sx={infoBoxStyles.employeeInfo1}>
              <InfoSection>
                <InfoField
                  label="Employee Code"
                  value={formValues.employee_number}
                />
                <InfoField label="Gender" value={formValues.gender} />
                <InfoField label="Nationality" value={formValues.nationality} />
              </InfoSection>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={infoBoxStyles.employeeInfo2}>
              <InfoSection>
                <InfoField label="Full Name" value={formValues.employee_name} />
                <InfoField
                  label="Birth Date"
                  value={formatDate(formValues.birth_date)}
                />
                <InfoField
                  label="Civil Status"
                  value={formValues.civil_status}
                />
              </InfoSection>
            </Box>
          </Grid>
        </Grid>
      </Grid>

      <Grid item xs={12}>
        <Box sx={infoBoxStyles.birthPlaceInfo}>
          <InfoSection>
            <InfoField label="Birth Place" value={formValues.birth_place} />
            <InfoField label="SSS Number" value={formValues.sss_number} />
            <InfoField
              label="PhilHealth Number"
              value={formValues.philhealth_number}
            />
          </InfoSection>
        </Box>
      </Grid>

      <Grid item xs={12} md={6}>
        <Box sx={infoBoxStyles.tinInfo}>
          <InfoSection>
            <InfoField label="TIN Number" value={formValues.tin_number} />
            <InfoField
              label="Pag-IBIG Number"
              value={formValues.pag_ibig_number}
            />
          </InfoSection>
        </Box>
      </Grid>

      <Grid item xs={12} sx={addressGridStyles}>
        <InfoSection>
          <InfoField label="Address" value={formValues.address} />
        </InfoSection>
      </Grid>

      <FromPositionFields
        control={control}
        errors={errors}
        isReadOnly={true}
        isCreate={isCreate}
        showSummary={true}
        formValues={formValues}
        formatCurrency={formatCurrency}
        currentMode={currentMode}
        initialData={initialData}
      />

      <ToPositionFields
        control={control}
        errors={errors}
        isReadOnly={isReadOnly}
        isCreate={isCreate}
        showSummary={false}
        formValues={formValues}
        currentMode={currentMode}
        positions={positions}
        jobLevels={jobLevels}
      />
    </Grid>
  );
};

export default MDADAModalFields;
