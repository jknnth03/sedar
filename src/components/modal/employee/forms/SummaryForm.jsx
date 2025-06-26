import React from "react";
import { Box, Typography } from "@mui/material";

const SummaryForm = ({
  formData,
  formatEmployeeDisplay,
  extractFieldValue,
}) => {
  const summaryBoxStyle = {
    width: "100% !important",
    maxWidth: "100% !important",
    backgroundColor: "#e8f5e8",
    border: "1px solid #4caf50",
    borderRadius: "8px",
    padding: "16px 16px",
    boxSizing: "border-box",
    minWidth: 0,
    flex: "1 1 100%",
  };

  // Format the general information to show all required fields
  const formatGeneralInfo = (general) => {
    if (!general) return "";

    const parts = [];

    // Required fields from GeneralForm
    if (
      general.prefix_display_name ||
      general.prefix_label ||
      general.prefix_name
    ) {
      parts.push(
        general.prefix_display_name ||
          general.prefix_label ||
          general.prefix_name
      );
    }

    if (general.first_name) {
      parts.push(general.first_name);
    }

    if (general.middle_name) {
      parts.push(general.middle_name);
    }

    if (general.last_name) {
      parts.push(general.last_name);
    }

    if (general.suffix) {
      parts.push(general.suffix);
    }

    const fullName = parts.join(" ");

    const details = [];

    if (general.id_number) {
      details.push(`ID: ${general.id_number}`);
    }

    if (general.birth_date) {
      details.push(`Birth Date: ${general.birth_date}`);
    }

    if (general.gender) {
      details.push(`Gender: ${general.gender}`);
    }

    if (general.civil_status) {
      details.push(`Civil Status: ${general.civil_status}`);
    }

    if (
      general.religion_display_name ||
      general.religion_label ||
      general.religion_name
    ) {
      details.push(
        `Religion: ${
          general.religion_display_name ||
          general.religion_label ||
          general.religion_name
        }`
      );
    }

    // Optional fields
    if (
      general.referrer_display_name ||
      general.referrer_label ||
      general.referrer_name
    ) {
      details.push(
        `Referred By: ${
          general.referrer_display_name ||
          general.referrer_label ||
          general.referrer_name
        }`
      );
    }

    if (general.remarks) {
      details.push(`Remarks: ${general.remarks}`);
    }

    return `${fullName}${details.length > 0 ? ` - ${details.join(", ")}` : ""}`;
  };

  return (
    <Box className="multiform-modal__info-step">
      <Box>
        <Typography variant="h6" gutterBottom>
          Summary of Collected Data:
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: "gray", marginTop: "-8px", marginBottom: "1rem" }}>
          Review them before submission
        </Typography>
        <Box
          sx={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}>
          {formData.general && (
            <Box sx={summaryBoxStyle}>
              <Typography
                variant="body1"
                sx={{ wordBreak: "break-word", textAlign: "left" }}>
                <strong>General Info:</strong>{" "}
                {formatGeneralInfo(formData.general)}
              </Typography>
            </Box>
          )}
          {formData.position && (
            <Box sx={summaryBoxStyle}>
              <Typography
                variant="body1"
                sx={{ wordBreak: "break-word", textAlign: "left" }}>
                <strong>Position:</strong> {formData.position.position_code} -
                Job Rate: ₱{formData.position.job_rate}, Allowance: ₱
                {formData.position.allowance}
              </Typography>
            </Box>
          )}
          {formData.employmentType && (
            <Box sx={summaryBoxStyle}>
              <Typography
                variant="body1"
                sx={{ wordBreak: "break-word", textAlign: "left" }}>
                <strong>Employment Type:</strong>{" "}
                {formData.employmentType.employment_type_label} - Start Date:{" "}
                {formData.employmentType.employment_start_date}
              </Typography>
            </Box>
          )}
          {formData.address && (
            <Box sx={summaryBoxStyle}>
              <Typography
                variant="body1"
                sx={{ wordBreak: "break-word", textAlign: "left" }}>
                <strong>Address:</strong> {formData.address.street}, Zip:{" "}
                {formData.address.zip_code}
              </Typography>
            </Box>
          )}
          {formData.attainment && (
            <Box sx={summaryBoxStyle}>
              <Typography
                variant="body1"
                sx={{ wordBreak: "break-word", textAlign: "left" }}>
                <strong>Attainment:</strong> {formData.attainment.institution}
                {formData.attainment.gpa &&
                  ` - GPA: ${formData.attainment.gpa}`}
              </Typography>
            </Box>
          )}
          {formData.account && (
            <Box sx={summaryBoxStyle}>
              <Typography
                variant="body1"
                sx={{ wordBreak: "break-word", textAlign: "left" }}>
                <strong>Account Info:</strong> SSS:{" "}
                {formData.account.sss_number}, PAG-IBIG:{" "}
                {formData.account.pag_ibig_number}, PhilHealth:{" "}
                {formData.account.philhealth_number}, TIN:{" "}
                {formData.account.tin_number}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default SummaryForm;
