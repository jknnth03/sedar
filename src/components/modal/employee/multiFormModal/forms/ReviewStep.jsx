import React, { useState, useCallback } from "react";
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  CircularProgress,
} from "@mui/material";
import { useFormContext } from "react-hook-form";
import { useSelector } from "react-redux";
import {
  Visibility as VisibilityIcon,
  Close as CloseIcon,
  AttachFile as AttachFileIcon,
} from "@mui/icons-material";
import { useGetAttainmentAttachmentQuery } from "../../../../../features/api/employee/attainmentsEmpApi";
import { useGetFileEmpAttachmentQuery } from "../../../../../features/api/employee/filesempApi";

const ReviewStep = ({ initialData, showHeader = true }) => {
  const { getValues, watch } = useFormContext();
  const approvalFormData = useSelector((state) => state.form.approvalForm);

  const formValues = watch();

  const [fileViewerOpen, setFileViewerOpen] = useState(false);
  const [currentFileId, setCurrentFileId] = useState(null);
  const [currentFileName, setCurrentFileName] = useState("");
  const [fileUrl, setFileUrl] = useState(null);
  const [isPreviewingNewFile, setIsPreviewingNewFile] = useState(false);
  const [viewerType, setViewerType] = useState(null);

  const {
    data: attainmentAttachment,
    isLoading: isLoadingAttainmentAttachment,
  } = useGetAttainmentAttachmentQuery(currentFileId, {
    skip:
      !fileViewerOpen ||
      !currentFileId ||
      viewerType !== "attainment" ||
      isPreviewingNewFile,
  });

  const { data: fileAttachment, isLoading: isLoadingFileAttachment } =
    useGetFileEmpAttachmentQuery(currentFileId, {
      skip:
        !fileViewerOpen ||
        !currentFileId ||
        viewerType !== "file" ||
        isPreviewingNewFile,
    });

  React.useEffect(() => {
    if (
      attainmentAttachment &&
      !isPreviewingNewFile &&
      viewerType === "attainment"
    ) {
      const url = URL.createObjectURL(attainmentAttachment);
      setFileUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [attainmentAttachment, isPreviewingNewFile, viewerType]);

  React.useEffect(() => {
    if (fileAttachment && !isPreviewingNewFile && viewerType === "file") {
      const url = URL.createObjectURL(fileAttachment);
      setFileUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [fileAttachment, isPreviewingNewFile, viewerType]);

  const handleFileViewerClose = useCallback(() => {
    setFileViewerOpen(false);
    setCurrentFileId(null);
    setCurrentFileName("");
    setIsPreviewingNewFile(false);
    setViewerType(null);
    if (fileUrl && isPreviewingNewFile) {
      setFileUrl(null);
    }
  }, [fileUrl, isPreviewingNewFile]);

  const handleAttainmentPreview = useCallback((attainment) => {
    if (attainment?.attainment_attachment instanceof File) {
      const objectUrl = URL.createObjectURL(attainment.attainment_attachment);
      setFileUrl(objectUrl);
      setCurrentFileName(attainment.attainment_attachment.name);
      setIsPreviewingNewFile(true);
      setViewerType("attainment");
      setFileViewerOpen(true);
    } else if (attainment?.id) {
      const attachmentId = attainment.id;
      const fileName =
        attainment.attainment_attachment_filename ||
        attainment.attachment_filename ||
        attainment.existing_attachment_filename ||
        "attachment";

      setCurrentFileId(String(attachmentId));
      setCurrentFileName(fileName);
      setIsPreviewingNewFile(false);
      setViewerType("attainment");
      setFileViewerOpen(true);
    }
  }, []);

  const handleFilePreview = useCallback((file) => {
    if (file?.file_attachment instanceof File) {
      const objectUrl = URL.createObjectURL(file.file_attachment);
      setFileUrl(objectUrl);
      setCurrentFileName(file.file_attachment.name);
      setIsPreviewingNewFile(true);
      setViewerType("file");
      setFileViewerOpen(true);
    } else {
      const fileId = file?.original_file_id || file?.id || file?.file_id;
      const fileName =
        file?.existing_file_name ||
        file?.file_name ||
        file?.name ||
        file?.filename ||
        file?.original_name ||
        "attachment";

      if (fileId && fileId !== "undefined" && fileId !== "null") {
        setCurrentFileId(String(fileId));
        setCurrentFileName(fileName);
        setIsPreviewingNewFile(false);
        setViewerType("file");
        setFileViewerOpen(true);
      } else {
        console.error("No valid file ID found:", file);
      }
    }
  }, []);

  const general_info = initialData?.general_info || {};
  const address = initialData?.address || {};
  const contacts = initialData?.contacts || {};
  const account = initialData?.account || {};

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

  const getValue = (initialPath, formKey) => {
    if (initialData && initialPath) {
      const keys = initialPath.split(".");
      let value = initialData;

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
      value: formValues.referred_by?.full_name || formValues.referred_by?.name,
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
        formValues.position_id?.name ||
        approvalFormData?.submittable?.position?.title_with_unit ||
        formValues.position_title,
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

  const employmentFields = [
    {
      key: "employment_type_label",
      label: "Employment Type",
      value:
        formValues.employment_types?.[0]?.employment_type_label ||
        formValues.employment_types?.[0]?.employment_type?.name ||
        formValues.employment_types?.[0]?.employment_type ||
        formValues.employment_type_label ||
        formValues.employment_type?.name ||
        formValues.employment_type,
    },
    {
      key: "employment_start_date",
      label: "Start Date",
      value:
        formValues.employment_types?.[0]?.employment_start_date ||
        formValues.employment_types?.[0]?.start_date ||
        formValues.employment_start_date ||
        formValues.start_date,
    },
    {
      key: "employment_end_date",
      label: "End Date",
      value:
        formValues.employment_types?.[0]?.employment_end_date ||
        formValues.employment_types?.[0]?.end_date ||
        formValues.employment_end_date ||
        formValues.end_date,
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
      value:
        getValue("contacts.email_address_remarks", "email_address_remarks") ||
        formValues.email_remarks,
    },
    {
      key: "mobile",
      label: "Mobile Number",
      value: getValue("contacts.mobile_number", "mobile_number"),
    },
    {
      key: "mobile_remarks",
      label: "Mobile Remarks",
      value:
        getValue("contacts.mobile_number_remarks", "mobile_number_remarks") ||
        formValues.mobile_remarks,
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
        getValue("account.bank.name", "bank_id") ||
        formValues.bank_id?.name ||
        formValues.bank?.name,
    },
    {
      key: "bank_account",
      label: "Bank Account Number",
      value: getValue("account.bank_account_number", "bank_account_number"),
    },
  ];

  const attainmentsData =
    formValues.attainments || initialData?.attainments || [];

  const hasAttainmentData = attainmentsData && attainmentsData.length > 0;

  const filesData = initialData?.files || formValues.files || [];
  const hasFilesData = filesData && filesData.length > 0;

  const hasAttachmentFile = (attainment) => {
    if (attainment?.attainment_attachment instanceof File) return true;

    const filename =
      attainment?.attainment_attachment_filename ||
      attainment?.attachment_filename ||
      attainment?.existing_attachment_filename;
    if (filename && typeof filename === "string") {
      const lower = filename.toLowerCase().trim();
      return (
        lower !== "no attachment attached" &&
        lower !== "no file attached" &&
        lower !== ""
      );
    }

    const attachmentUrl = attainment?.attainment_attachment;
    if (attachmentUrl && typeof attachmentUrl === "string") {
      return attachmentUrl.includes("/attachment");
    }

    return false;
  };

  const hasFile = (file) => {
    if (file?.file_attachment instanceof File) return true;
    const hasValidId = file?.original_file_id || file?.id || file?.file_id;
    const hasValidName =
      file?.existing_file_name ||
      file?.file_name ||
      file?.name ||
      file?.filename;
    return hasValidId || hasValidName;
  };

  const FileViewerDialog = () => (
    <Dialog
      open={fileViewerOpen}
      onClose={handleFileViewerClose}
      maxWidth={false}
      fullWidth={false}
      PaperProps={{
        sx: {
          width: "77vw",
          height: "96vh",
          maxWidth: "80vw",
          maxHeight: "96vh",
          margin: "0",
          position: "fixed",
          top: "2vh",
          left: "320px",
          transform: "none",
          borderRadius: 2,
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        },
      }}
      BackdropProps={{
        sx: {
          backgroundColor: "rgba(0, 0, 0, 0.7)",
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
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Attachment - {currentFileName}
        </Typography>
        <IconButton
          onClick={handleFileViewerClose}
          size="small"
          sx={{
            color: "text.secondary",
            "&:hover": {
              backgroundColor: "rgba(0, 0, 0, 0.04)",
            },
          }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent
        sx={{
          p: 0,
          position: "relative",
          height: "calc(90vh - 140px)",
          overflow: "hidden",
        }}>
        {(isLoadingAttainmentAttachment || isLoadingFileAttachment) &&
        !isPreviewingNewFile ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="100%"
            flexDirection="column">
            <CircularProgress size={48} />
            <Typography variant="body1" sx={{ mt: 2, color: "text.secondary" }}>
              Loading attachment...
            </Typography>
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
            {fileUrl ? (
              <iframe
                src={fileUrl}
                width="100%"
                height="100%"
                style={{
                  border: "none",
                  borderRadius: "0 0 8px 8px",
                }}
                title="File Attachment"
              />
            ) : (
              <Box textAlign="center">
                <AttachFileIcon
                  sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}
                />
                <Typography variant="h6" color="text.secondary">
                  {currentFileName}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}>
                  File preview not available
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );

  return (
    <Box className="review-step">
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

      {hasAttainmentData && (
        <Paper className="review-step__section">
          <Typography
            variant="h6"
            className="review-step__section-title"
            gutterBottom>
            Educational Attainment
          </Typography>
          {attainmentsData.map((attainment, index) => (
            <Box
              key={index}
              sx={{ mb: index < attainmentsData.length - 1 ? 3 : 0 }}>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 600, mb: 2, color: "primary.main" }}>
                Attainment #{index + 1}
              </Typography>
              <Box className="review-step__section-grid">
                <Box className="review-step__section-field">
                  <Typography variant="caption" className="field-label">
                    Program
                  </Typography>
                  <Typography variant="body2" className="field-value">
                    {formatValue(
                      attainment.program_id?.name || attainment.program?.name
                    )}
                  </Typography>
                </Box>
                <Box className="review-step__section-field">
                  <Typography variant="caption" className="field-label">
                    Degree
                  </Typography>
                  <Typography variant="body2" className="field-value">
                    {formatValue(
                      attainment.degree_id?.name || attainment.degree?.name
                    )}
                  </Typography>
                </Box>
                <Box className="review-step__section-field">
                  <Typography variant="caption" className="field-label">
                    Honor Title
                  </Typography>
                  <Typography variant="body2" className="field-value">
                    {formatValue(
                      attainment.honor_title_id?.name ||
                        attainment.honor_title?.name
                    )}
                  </Typography>
                </Box>
                <Box className="review-step__section-field">
                  <Typography variant="caption" className="field-label">
                    Attainment
                  </Typography>
                  <Typography variant="body2" className="field-value">
                    {formatValue(
                      attainment.attainment_id?.name ||
                        attainment.attainment?.name
                    )}
                  </Typography>
                </Box>
                <Box className="review-step__section-field">
                  <Typography variant="caption" className="field-label">
                    Academic Year From
                  </Typography>
                  <Typography variant="body2" className="field-value">
                    {formatValue(attainment.academic_year_from)}
                  </Typography>
                </Box>
                <Box className="review-step__section-field">
                  <Typography variant="caption" className="field-label">
                    Academic Year To
                  </Typography>
                  <Typography variant="body2" className="field-value">
                    {formatValue(attainment.academic_year_to)}
                  </Typography>
                </Box>
                <Box className="review-step__section-field">
                  <Typography variant="caption" className="field-label">
                    GPA
                  </Typography>
                  <Typography variant="body2" className="field-value">
                    {formatValue(attainment.gpa)}
                  </Typography>
                </Box>
                <Box className="review-step__section-field">
                  <Typography variant="caption" className="field-label">
                    Institution
                  </Typography>
                  <Typography variant="body2" className="field-value">
                    {formatValue(attainment.institution)}
                  </Typography>
                </Box>
                <Box
                  className="review-step__section-field"
                  sx={{ gridColumn: "1 / -1" }}>
                  <Typography variant="caption" className="field-label">
                    Remarks
                  </Typography>
                  <Typography variant="body2" className="field-value">
                    {formatValue(attainment.attainment_remarks)}
                  </Typography>
                </Box>
                {hasAttachmentFile(attainment) && (
                  <Box
                    className="review-step__section-field"
                    sx={{ gridColumn: "1 / -1" }}>
                    <Typography variant="caption" className="field-label">
                      Attachment
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}>
                      <Typography
                        variant="body2"
                        className="field-value"
                        sx={{ mr: 1 }}>
                        {attainment.attainment_attachment instanceof File
                          ? attainment.attainment_attachment.name
                          : attainment.attainment_attachment_filename ||
                            attainment.attachment_filename ||
                            attainment.existing_attachment_filename ||
                            "Attachment"}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => handleAttainmentPreview(attainment)}
                        color="primary"
                        title="View attachment">
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                )}
              </Box>
            </Box>
          ))}
        </Paper>
      )}

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

      {hasFilesData && (
        <Paper className="review-step__section">
          <Typography
            variant="h6"
            className="review-step__section-title"
            gutterBottom>
            Files & Attachments
          </Typography>
          {filesData.map(
            (file, index) =>
              hasFile(file) && (
                <Box
                  key={index}
                  sx={{ mb: index < filesData.length - 1 ? 3 : 0 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 600, mb: 2, color: "primary.main" }}>
                    File #{index + 1}
                  </Typography>
                  <Box className="review-step__section-grid">
                    <Box className="review-step__section-field">
                      <Typography variant="caption" className="field-label">
                        File Type
                      </Typography>
                      <Typography variant="body2" className="field-value">
                        {formatValue(
                          file.file_type_id?.name || file.file_type?.name
                        )}
                      </Typography>
                    </Box>
                    <Box className="review-step__section-field">
                      <Typography variant="caption" className="field-label">
                        File Cabinet
                      </Typography>
                      <Typography variant="body2" className="field-value">
                        {formatValue(
                          file.file_cabinet_id?.name ||
                            file.file_cabinet?.name ||
                            file.cabinet?.name
                        )}
                      </Typography>
                    </Box>
                    <Box
                      className="review-step__section-field"
                      sx={{ gridColumn: "1 / -1" }}>
                      <Typography variant="caption" className="field-label">
                        Description
                      </Typography>
                      <Typography variant="body2" className="field-value">
                        {formatValue(file.file_description || file.description)}
                      </Typography>
                    </Box>
                    <Box
                      className="review-step__section-field"
                      sx={{ gridColumn: "1 / -1" }}>
                      <Typography variant="caption" className="field-label">
                        File Name
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}>
                        <Typography
                          variant="body2"
                          className="field-value"
                          sx={{ mr: 1 }}>
                          {file.file_attachment instanceof File
                            ? file.file_attachment.name
                            : file.existing_file_name ||
                              file.file_name ||
                              "Uploaded file"}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => handleFilePreview(file)}
                          color="primary"
                          title="View file">
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              )
          )}
        </Paper>
      )}

      <FileViewerDialog />
    </Box>
  );
};

export default ReviewStep;
