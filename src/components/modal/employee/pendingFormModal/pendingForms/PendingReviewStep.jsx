import React from "react";
import { Box, Typography, Paper } from "@mui/material";
import { useFormContext } from "react-hook-form";

const PendingReviewStep = ({
  initialData,
  pendingData,
  mode = "view",
  isViewMode = false,
  isEditMode = false,
  readOnly = false,
  disabled = false,
}) => {
  const { getValues } = useFormContext();

  // Get current form values as fallback
  const formValues = getValues();

  // Use pendingData as primary source, fallback to initialData
  const dataSource = pendingData || initialData || {};

  // Safe destructuring with fallbacks from the data source
  const general_info = dataSource?.general_info || {};
  const address = dataSource?.address || {};
  const contacts = dataSource?.contacts || {};
  const account = dataSource?.account || {};
  const position_details = dataSource?.position_details || {};
  const employment_types = dataSource?.employment_types || [];
  const attainments = dataSource?.attainments || [];

  const formatValue = (value) => {
    if (value === null || value === undefined || value === "") {
      return <em>Not provided</em>;
    }
    if (typeof value === "boolean") {
      return value ? "Yes" : "No";
    }
    if (typeof value === "object" && value !== null) {
      return value.name || value.label || <em>Not provided</em>;
    }
    return String(value);
  };

  // Helper function to get value from pending/initial data or form values
  const getValue = (initialPath, formKey) => {
    // First try to get from dataSource (pendingData or initialData)
    if (dataSource && initialPath) {
      const keys = initialPath.split(".");
      let value = dataSource;

      for (const key of keys) {
        if (value && typeof value === "object") {
          value = value[key];
        } else {
          value = undefined;
          break;
        }
      }

      if (value !== undefined && value !== null) {
        return value;
      }
    }

    // If not found in dataSource, try form values
    return formValues[formKey];
  };

  const generalFields = [
    {
      key: "first_name",
      label: "First Name",
      value: getValue("general_info.first_name", "first_name"),
    },
    {
      key: "middle_name",
      label: "Middle Name",
      value: getValue("general_info.middle_name", "middle_name"),
    },
    {
      key: "last_name",
      label: "Last Name",
      value: getValue("general_info.last_name", "last_name"),
    },
    {
      key: "suffix",
      label: "Suffix",
      value: getValue("general_info.suffix", "suffix"),
    },
    {
      key: "prefix",
      label: "Prefix",
      value:
        getValue("general_info.prefix.name", "prefix") ||
        formValues.prefix?.name,
    },
    {
      key: "id_number",
      label: "ID Number",
      value: getValue("general_info.id_number", "id_number"),
    },
    {
      key: "birth_date",
      label: "Birth Date",
      value: getValue("general_info.birth_date", "birth_date"),
    },
    {
      key: "gender",
      label: "Gender",
      value: getValue("general_info.gender", "gender"),
    },
    {
      key: "civil_status",
      label: "Civil Status",
      value: getValue("general_info.civil_status", "civil_status"),
    },
    {
      key: "religion",
      label: "Religion",
      value:
        getValue("general_info.religion.name", "religion") ||
        formValues.religion?.name,
    },
    {
      key: "referred_by",
      label: "Referred By",
      value: getValue("general_info.referred_by", "referred_by"),
    },
    {
      key: "remarks",
      label: "Remarks",
      value: getValue("general_info.remarks", "remarks"),
    },
  ];

  const addressFields = [
    {
      key: "region",
      label: "Region",
      value:
        getValue("address.region.name", "region_id") ||
        formValues.region_id?.name,
    },
    {
      key: "province",
      label: "Province",
      value:
        getValue("address.province.name", "province_id") ||
        formValues.province_id?.name,
    },
    {
      key: "city_municipality",
      label: "City/Municipality",
      value:
        getValue("address.city_municipality.name", "city_municipality_id") ||
        formValues.city_municipality_id?.name,
    },
    {
      key: "barangay",
      label: "Barangay",
      value:
        getValue("address.barangay.name", "barangay_id") ||
        formValues.barangay_id?.name,
    },
    {
      key: "street",
      label: "Street Address",
      value: getValue("address.street", "street"),
    },
    {
      key: "zip_code",
      label: "ZIP Code",
      value: getValue("address.zip_code", "zip_code"),
    },
    {
      key: "address_remarks",
      label: "Address Remarks",
      value: getValue("address.remarks", "address_remarks"),
    },
  ];

  const positionFields = [
    {
      key: "position",
      label: "Position",
      value:
        getValue("position_details.position.name", "position_id") ||
        formValues.position_id?.name,
    },
    {
      key: "schedule",
      label: "Schedule",
      value:
        getValue("position_details.schedule.name", "schedule_id") ||
        formValues.schedule_id?.name,
    },
    {
      key: "job_level",
      label: "Job Level",
      value:
        getValue("position_details.job_level.name", "job_level_id") ||
        formValues.job_level_id?.name,
    },
    {
      key: "job_rate",
      label: "Job Rate",
      value: getValue("position_details.job_rate", "job_rate"),
    },
    {
      key: "allowance",
      label: "Allowance",
      value: getValue("position_details.allowance", "allowance"),
    },
    {
      key: "additional_rate",
      label: "Additional Rate",
      value: getValue("position_details.additional_rate", "additional_rate"),
    },
    {
      key: "additional_rate_remarks",
      label: "Additional Rate Remarks",
      value: getValue(
        "position_details.additional_rate_remarks",
        "additional_rate_remarks"
      ),
    },
    {
      key: "additional_tools",
      label: "Additional Tools",
      value: getValue("position_details.additional_tools", "additional_tools"),
    },
  ];

  // Employment Type fields - handle array structure
  const employmentFields = [
    {
      key: "employment_type_label",
      label: "Employment Type",
      value:
        getValue(
          "employment_types.0.employment_type_label",
          "employment_type_label"
        ) || employment_types[0]?.employment_type_label,
    },
    {
      key: "employment_start_date",
      label: "Start Date",
      value:
        getValue("employment_types.0.start_date", "employment_start_date") ||
        employment_types[0]?.start_date,
    },
    {
      key: "employment_end_date",
      label: "End Date",
      value:
        getValue("employment_types.0.end_date", "employment_end_date") ||
        employment_types[0]?.end_date,
    },
  ];

  // Attainment fields - handle array structure
  const attainmentFields = [
    {
      key: "academic_year_from",
      label: "Academic Year From",
      value:
        getValue("attainments.0.academic_year_from", "academic_year_from") ||
        attainments[0]?.academic_year_from,
    },
    {
      key: "academic_year_to",
      label: "Academic Year To",
      value:
        getValue("attainments.0.academic_year_to", "academic_year_to") ||
        attainments[0]?.academic_year_to,
    },
    {
      key: "program",
      label: "Program",
      value:
        getValue("attainments.0.program.name", "program_id") ||
        formValues.program_id?.name ||
        attainments[0]?.program?.name,
    },
    {
      key: "degree",
      label: "Degree",
      value:
        getValue("attainments.0.degree.name", "degree_id") ||
        formValues.degree_id?.name ||
        attainments[0]?.degree?.name,
    },
    {
      key: "honor_title",
      label: "Honor Title",
      value:
        getValue("attainments.0.honor_title.name", "honor_title_id") ||
        formValues.honor_title_id?.name ||
        attainments[0]?.honor_title?.name,
    },
    {
      key: "attainment",
      label: "Attainment",
      value:
        getValue("attainments.0.attainment.name", "attainment_id") ||
        formValues.attainment_id?.name ||
        attainments[0]?.attainment?.name,
    },
    {
      key: "gpa",
      label: "GPA",
      value: getValue("attainments.0.gpa", "gpa") || attainments[0]?.gpa,
    },
    {
      key: "institution",
      label: "Institution",
      value:
        getValue("attainments.0.institution", "institution") ||
        attainments[0]?.institution,
    },
    {
      key: "attainment_remarks",
      label: "Attainment Remarks",
      value:
        getValue("attainments.0.attainment_remarks", "attainment_remarks") ||
        attainments[0]?.attainment_remarks,
    },
  ];

  const contactFields = [
    {
      key: "email",
      label: "Email Address",
      value: getValue("contacts.email_address", "email_address"),
    },
    {
      key: "email_remarks",
      label: "Email Remarks",
      value: getValue(
        "contacts.email_address_remarks",
        "email_address_remarks"
      ),
    },
    {
      key: "mobile",
      label: "Mobile Number",
      value: getValue("contacts.mobile_number", "mobile_number"),
    },
    {
      key: "mobile_remarks",
      label: "Mobile Remarks",
      value: getValue(
        "contacts.mobile_number_remarks",
        "mobile_number_remarks"
      ),
    },
  ];

  const accountFields = [
    {
      key: "sss",
      label: "SSS Number",
      value: getValue("account.sss_number", "sss_number"),
    },
    {
      key: "philhealth",
      label: "PhilHealth Number",
      value: getValue("account.philhealth_number", "philhealth_number"),
    },
    {
      key: "pag_ibig",
      label: "Pag-IBIG Number",
      value: getValue("account.pag_ibig_number", "pag_ibig_number"),
    },
    {
      key: "tin",
      label: "TIN Number",
      value: getValue("account.tin_number", "tin_number"),
    },
    {
      key: "bank",
      label: "Bank",
      value:
        getValue("account.bank.name", "bank_id") || formValues.bank_id?.name,
    },
    {
      key: "bank_account",
      label: "Bank Account Number",
      value: getValue("account.bank_account_number", "bank_account_number"),
    },
  ];

  const filesData = dataSource?.files || formValues.files || [];
  const fileFields = filesData.map((file, index) => ({
    key: `file_${index}`,
    label: `File ${index + 1}`,
    value:
      file?.file_name || file?.name || file?.file_attachment || "Uploaded file",
  }));

  const getReviewTitle = () => {
    if (isEditMode) return "Review Pending Registration - Edit Mode";
    if (isViewMode) return "Review Pending Registration";
    return "Review Employee Information";
  };

  const getSubtitle = () => {
    if (isViewMode) return "Below is the submitted registration information.";
    if (isEditMode)
      return "Review all information below before saving changes.";
    return "Please review all the information below before submitting. You can go back to any step to make changes.";
  };

  return (
    <Box className="review-step">
      <Typography variant="h5" className="review-step__title" gutterBottom>
        {getReviewTitle()}
      </Typography>
      <Typography variant="body2" className="review-step__subtitle">
        {getSubtitle()}
      </Typography>

      <Paper className="review-step__section">
        <Typography
          variant="h6"
          className="review-step__section-title"
          gutterBottom>
          General Information
        </Typography>
        <Box className="review-step__section-grid">
          {generalFields.map(({ key, label, value }) => (
            <Box key={key} className="review-step__section-field">
              <Typography variant="caption" className="field-label">
                {label}
              </Typography>
              <Typography variant="body2" className="field-value">
                {formatValue(value)}
              </Typography>
            </Box>
          ))}
        </Box>
      </Paper>

      <Paper className="review-step__section">
        <Typography
          variant="h6"
          className="review-step__section-title"
          gutterBottom>
          Address Information
        </Typography>
        <Box className="review-step__section-grid">
          {addressFields.map(({ key, label, value }) => (
            <Box key={key} className="review-step__section-field">
              <Typography variant="caption" className="field-label">
                {label}
              </Typography>
              <Typography variant="body2" className="field-value">
                {formatValue(value)}
              </Typography>
            </Box>
          ))}
        </Box>
      </Paper>

      <Paper className="review-step__section">
        <Typography
          variant="h6"
          className="review-step__section-title"
          gutterBottom>
          Position Details
        </Typography>
        <Box className="review-step__section-grid">
          {positionFields.map(({ key, label, value }) => (
            <Box key={key} className="review-step__section-field">
              <Typography variant="caption" className="field-label">
                {label}
              </Typography>
              <Typography variant="body2" className="field-value">
                {formatValue(value)}
              </Typography>
            </Box>
          ))}
        </Box>
      </Paper>

      <Paper className="review-step__section">
        <Typography
          variant="h6"
          className="review-step__section-title"
          gutterBottom>
          Employment Information
        </Typography>
        <Box className="review-step__section-grid">
          {employmentFields.map(({ key, label, value }) => (
            <Box key={key} className="review-step__section-field">
              <Typography variant="caption" className="field-label">
                {label}
              </Typography>
              <Typography variant="body2" className="field-value">
                {formatValue(value)}
              </Typography>
            </Box>
          ))}
        </Box>
      </Paper>

      <Paper className="review-step__section">
        <Typography
          variant="h6"
          className="review-step__section-title"
          gutterBottom>
          Educational Attainment
        </Typography>
        <Box className="review-step__section-grid">
          {attainmentFields.map(({ key, label, value }) => (
            <Box key={key} className="review-step__section-field">
              <Typography variant="caption" className="field-label">
                {label}
              </Typography>
              <Typography variant="body2" className="field-value">
                {formatValue(value)}
              </Typography>
            </Box>
          ))}
        </Box>
      </Paper>

      <Paper className="review-step__section">
        <Typography
          variant="h6"
          className="review-step__section-title"
          gutterBottom>
          Contact Information
        </Typography>
        <Box className="review-step__section-grid">
          {contactFields.map(({ key, label, value }) => (
            <Box key={key} className="review-step__section-field">
              <Typography variant="caption" className="field-label">
                {label}
              </Typography>
              <Typography variant="body2" className="field-value">
                {formatValue(value)}
              </Typography>
            </Box>
          ))}
        </Box>
      </Paper>

      <Paper className="review-step__section">
        <Typography
          variant="h6"
          className="review-step__section-title"
          gutterBottom>
          Account Information
        </Typography>
        <Box className="review-step__section-grid">
          {accountFields.map(({ key, label, value }) => (
            <Box key={key} className="review-step__section-field">
              <Typography variant="caption" className="field-label">
                {label}
              </Typography>
              <Typography variant="body2" className="field-value">
                {formatValue(value)}
              </Typography>
            </Box>
          ))}
        </Box>
      </Paper>

      {fileFields.length > 0 && (
        <Paper className="review-step__section">
          <Typography
            variant="h6"
            className="review-step__section-title"
            gutterBottom>
            Files & Attachments
          </Typography>
          <Box className="review-step__section-grid">
            {fileFields.map(({ key, label, value }) => (
              <Box key={key} className="review-step__section-field">
                <Typography variant="caption" className="field-label">
                  {label}
                </Typography>
                <Typography variant="body2" className="field-value">
                  {formatValue(value)}
                </Typography>
              </Box>
            ))}
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default PendingReviewStep;
