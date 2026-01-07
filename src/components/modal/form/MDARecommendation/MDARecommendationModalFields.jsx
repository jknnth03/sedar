import React from "react";
import { Controller, useFormContext } from "react-hook-form";
import { Grid, TextField, Typography, Box } from "@mui/material";
import { sectionTitleStyles } from "../MDAForm/MDAFornModal.styles";

const infoSectionContainerStyles = {
  padding: 1,
  border: "none",
  borderRadius: "4px",
  minHeight: "120px",
  height: "auto",
};

const infoFieldContainerStyles = {
  mb: 2,
};

const infoFieldLabelStyles = {
  fontWeight: "bold",
  color: "rgb(33, 61, 112)",
  marginBottom: 0.5,
  fontSize: "11px",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

const infoFieldValueStyles = {
  fontSize: "14px",
  fontWeight: 600,
  lineHeight: 1.3,
  color: "#1a1a1a",
  overflow: "hidden",
  textOverflow: "ellipsis",
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
};

const infoBoxStyles = {
  employeeInfo1: { width: "210px" },
  employeeInfo2: { width: "360px" },
  birthPlaceInfo: { width: "220px" },
  tinInfo: { width: "210px" },
};

const addressGridStyles = {
  marginTop: -5,
  marginBottom: -9,
};

const sectionHeaderStyles = {
  fromPosition: {
    marginTop: 1,
    marginBottom: 2,
    marginLeft: 2,
  },
  toPosition: {
    marginTop: -1,
    marginBottom: 2,
    marginLeft: 2,
  },
};

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

const MDARecommendationModalFields = ({
  isCreate,
  isReadOnly,
  currentMode,
  submissionId,
}) => {
  const {
    control,
    watch,
    formState: { errors },
  } = useFormContext();

  const formValues = watch();

  const formatDate = (date) => {
    if (!date) return "-";
    if (typeof date === "string") {
      const d = new Date(date);
      return d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
    if (date && date.$d) {
      return date.$d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
    return "-";
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Grid container spacing={0}>
          <Grid item xs={12} md={3}>
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
          <Grid item xs={12} md={3}>
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
          <Grid item xs={12} md={3}>
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
          <Grid item xs={12} md={3}>
            <Box sx={infoBoxStyles.tinInfo}>
              <InfoSection>
                <InfoField label="TIN Number" value={formValues.tin_number} />
                <InfoField
                  label="Pag-IBIG Number"
                  value={formValues.pag_ibig_number}
                />
                <InfoField
                  label="Effective Date"
                  value={formatDate(formValues.effective_date)}
                />
              </InfoSection>
            </Box>
          </Grid>
        </Grid>
      </Grid>

      <Grid item xs={12} sx={addressGridStyles}>
        <InfoSection>
          <InfoField label="Address" value={formValues.address} />
        </InfoSection>
      </Grid>

      <Grid item xs={12} sx={{ mb: 3 }}>
        <Typography
          variant="h6"
          sx={{ ...sectionTitleStyles, ...sectionHeaderStyles.fromPosition }}>
          FROM POSITION
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "1fr",
              md: "repeat(2, 1fr)",
            },
            "@media (min-width: 750px)": {
              gridTemplateColumns: "repeat(2, 1fr)",
            },
            gap: 2,
          }}>
          <Box>
            <TextField
              label="Position Title From"
              value={formValues.from_position_title || ""}
              fullWidth
              disabled={true}
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label="Job Level From"
              value={formValues.from_job_level || ""}
              fullWidth
              disabled={true}
              InputLabelProps={{ shrink: true }}
              sx={{ mt: 2 }}
            />

            <TextField
              label="Job Rate From"
              value={formValues.from_job_rate || ""}
              fullWidth
              type="number"
              disabled={true}
              inputProps={{
                step: "0.01",
                min: "0",
              }}
              InputLabelProps={{ shrink: true }}
              sx={{ mt: 2 }}
            />

            <TextField
              label="Additional Rate From"
              value={formValues.from_additional_rate || ""}
              fullWidth
              type="number"
              disabled={true}
              inputProps={{
                step: "0.01",
                min: "0",
              }}
              InputLabelProps={{ shrink: true }}
              sx={{ mt: 2 }}
            />
          </Box>

          <Box>
            <TextField
              label="Department From"
              value={formValues.from_department || ""}
              fullWidth
              disabled={true}
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label="Sub Unit From"
              value={formValues.from_sub_unit || ""}
              fullWidth
              disabled={true}
              InputLabelProps={{ shrink: true }}
              sx={{ mt: 2 }}
            />

            <TextField
              label="Allowance From"
              value={formValues.from_allowance || ""}
              fullWidth
              type="number"
              disabled={true}
              inputProps={{
                step: "0.01",
                min: "0",
              }}
              InputLabelProps={{ shrink: true }}
              sx={{ mt: 2 }}
            />
          </Box>
        </Box>
      </Grid>

      <Grid item xs={12} sx={{ mb: 3 }}>
        <Typography
          variant="h6"
          sx={{ ...sectionTitleStyles, ...sectionHeaderStyles.toPosition }}>
          TO POSITION
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "1fr",
              md: "repeat(2, 1fr)",
            },
            "@media (min-width: 750px)": {
              gridTemplateColumns: "repeat(2, 1fr)",
            },
            gap: 2,
          }}>
          <Box>
            <TextField
              label="Position"
              value={formValues.to_position_title || ""}
              fullWidth
              disabled={true}
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label="Job Level To"
              value={formValues.to_job_level || ""}
              fullWidth
              disabled={true}
              InputLabelProps={{ shrink: true }}
              sx={{ mt: 2 }}
            />

            <Controller
              name="to_job_rate"
              control={control}
              rules={{
                required: "Job rate is required",
                pattern: {
                  value: /^\d+(\.\d{1,2})?$/,
                  message: "Please enter a valid amount",
                },
              }}
              render={({ field: { value, ...field } }) => (
                <TextField
                  {...field}
                  value={value || ""}
                  label="Job Rate To *"
                  type="number"
                  fullWidth
                  error={!!errors.to_job_rate}
                  helperText={errors.to_job_rate?.message}
                  disabled={isReadOnly}
                  inputProps={{
                    step: "0.01",
                    min: "0",
                  }}
                  InputLabelProps={{ shrink: true }}
                  sx={{ mt: 2 }}
                />
              )}
            />

            <Controller
              name="to_additional_rate"
              control={control}
              rules={{
                pattern: {
                  value: /^\d+(\.\d{1,2})?$/,
                  message: "Please enter a valid amount",
                },
              }}
              render={({ field: { value, ...field } }) => (
                <TextField
                  {...field}
                  value={value || ""}
                  label="Additional Rate To"
                  type="number"
                  fullWidth
                  error={!!errors.to_additional_rate}
                  helperText={errors.to_additional_rate?.message}
                  disabled={isReadOnly}
                  inputProps={{
                    step: "0.01",
                    min: "0",
                  }}
                  InputLabelProps={{ shrink: true }}
                  sx={{ mt: 2 }}
                />
              )}
            />
          </Box>

          <Box>
            <TextField
              label="Department To"
              value={formValues.to_department || ""}
              fullWidth
              disabled={true}
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label="Sub Unit To"
              value={formValues.to_sub_unit || ""}
              fullWidth
              disabled={true}
              InputLabelProps={{ shrink: true }}
              sx={{ mt: 2 }}
            />

            <Controller
              name="to_allowance"
              control={control}
              rules={{
                pattern: {
                  value: /^\d+(\.\d{1,2})?$/,
                  message: "Please enter a valid amount",
                },
              }}
              render={({ field: { value, ...field } }) => (
                <TextField
                  {...field}
                  value={value || ""}
                  label="Allowance To *"
                  type="number"
                  fullWidth
                  error={!!errors.to_allowance}
                  helperText={errors.to_allowance?.message}
                  disabled={isReadOnly}
                  inputProps={{
                    step: "0.01",
                    min: "0",
                  }}
                  InputLabelProps={{ shrink: true }}
                  sx={{ mt: 2 }}
                />
              )}
            />
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
};

export default MDARecommendationModalFields;
