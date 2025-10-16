import React, { useState, useEffect, useCallback } from "react";
import {
  Typography,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  CircularProgress,
  Button,
} from "@mui/material";
import {
  Close as CloseIcon,
  AttachFile as AttachFileIcon,
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import { useGetAttainmentAttachmentQuery } from "../../../features/api/employee/attainmentsempApi";
import { useGetFileEmpAttachmentQuery } from "../../../features/api/employee/filesempApi";

const BasicInfoSection = ({ submissionData }) => {
  const [fileViewerOpen, setFileViewerOpen] = useState(false);
  const [fileUrl, setFileUrl] = useState(null);
  const [currentFileId, setCurrentFileId] = useState(null);
  const [fileName, setFileName] = useState("");
  const [fileType, setFileType] = useState("");

  const {
    data: attachmentData,
    isLoading: isLoadingAttachment,
    error: attachmentError,
  } = useGetAttainmentAttachmentQuery(currentFileId, {
    skip: !fileViewerOpen || !currentFileId || fileType !== "attainment",
  });

  const {
    data: fileAttachmentData,
    isLoading: isLoadingFileAttachment,
    error: fileAttachmentError,
  } = useGetFileEmpAttachmentQuery(currentFileId, {
    skip: !fileViewerOpen || !currentFileId || fileType !== "file",
  });

  const formDetails = submissionData?.form_details;

  const getGeneralInfo = () => {
    return formDetails?.general_info || {};
  };

  const getAddress = () => {
    return formDetails?.address || {};
  };

  const getPositionDetails = () => {
    return formDetails?.position_details || {};
  };

  const getEmploymentTypes = () => {
    return formDetails?.employment_types || [];
  };

  const getAttainments = () => {
    return formDetails?.attainments || [];
  };

  const getAccount = () => {
    return formDetails?.account || {};
  };

  const getContacts = () => {
    return formDetails?.contacts || {};
  };

  const getFiles = () => {
    return formDetails?.files || [];
  };

  const formatSalary = (amount) => {
    return amount ? `₱${parseFloat(amount).toLocaleString()}` : "N/A";
  };

  const formatDate = (dateString) => {
    return dateString || "N/A";
  };

  const getDisplayFilename = (attainment) => {
    return (
      attainment?.attainment_attachment_filename || "employee_document.pdf"
    );
  };

  const getFileName = (fullFileName) => {
    if (!fullFileName) return "";
    const parts = fullFileName.split("/");
    return parts[parts.length - 1];
  };

  const getAttainmentFileId = (attainment) => {
    return attainment?.id;
  };

  const handleFileViewerOpen = useCallback(
    (fileId, displayFileName, type = "attainment") => {
      if (
        fileId &&
        fileId !== "undefined" &&
        fileId !== "null" &&
        fileId !== null
      ) {
        setCurrentFileId(fileId);
        setFileName(displayFileName);
        setFileType(type);
        setFileViewerOpen(true);
      } else {
        alert("Unable to open file: File ID not found");
      }
    },
    []
  );

  const handleFileViewerClose = () => {
    setFileViewerOpen(false);
    setFileUrl(null);
    setTimeout(() => {
      setCurrentFileId(null);
      setFileName("");
      setFileType("");
    }, 100);
  };

  const handleFileDownload = useCallback(() => {
    if (fileUrl && fileName) {
      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [fileUrl, fileName]);

  useEffect(() => {
    const currentAttachmentData =
      fileType === "attainment" ? attachmentData : fileAttachmentData;

    if (
      currentAttachmentData &&
      currentAttachmentData instanceof Blob &&
      fileViewerOpen
    ) {
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
      }
      const url = URL.createObjectURL(currentAttachmentData);
      setFileUrl(url);
    }
  }, [attachmentData, fileAttachmentData, fileViewerOpen, fileType]);

  useEffect(() => {
    return () => {
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
      }
    };
  }, [fileUrl]);

  useEffect(() => {
    if (!fileViewerOpen && fileUrl) {
      const timeoutId = setTimeout(() => {
        URL.revokeObjectURL(fileUrl);
        setFileUrl(null);
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [fileViewerOpen, fileUrl]);

  const InfoField = ({ label, value, flex = 1 }) => (
    <Box
      sx={{
        flex,
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
          color: "#000000ff",
          fontSize: "13px",
          lineHeight: 1.4,
          flex: 1,
          wordBreak: "break-word",
          whiteSpace: "normal",
          overflow: "hidden",
        }}>
        {value}
      </Typography>
    </Box>
  );

  const SectionContainer = ({ title, children }) => (
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
        {title}
      </Typography>
      {children}
    </Box>
  );

  const hasAttainmentFile = (attainment) => {
    const fileId = getAttainmentFileId(attainment);
    const filename = getDisplayFilename(attainment);
    return (
      fileId &&
      fileId !== "undefined" &&
      fileId !== "null" &&
      fileId !== null &&
      filename &&
      attainment?.attainment_attachment_filename
    );
  };

  return (
    <>
      <SectionContainer title="GENERAL INFORMATION">
        <Box sx={{ display: "flex", gap: 6, mb: 1.5 }}>
          <InfoField
            label="EMPLOYEE CODE"
            value={getGeneralInfo().employee_code || "N/A"}
          />
          <InfoField
            label="FULL NAME"
            value={getGeneralInfo().full_name || "N/A"}
          />
          <InfoField
            label="BIRTH DATE"
            value={formatDate(getGeneralInfo().birth_date)}
          />
        </Box>

        <Box sx={{ display: "flex", gap: 6 }}>
          <InfoField label="GENDER" value={getGeneralInfo().gender || "N/A"} />
          <InfoField
            label="CIVIL STATUS"
            value={getGeneralInfo().civil_status || "N/A"}
          />
          <InfoField
            label="RELIGION"
            value={getGeneralInfo().religion?.name || "N/A"}
          />
        </Box>
      </SectionContainer>

      <SectionContainer title="ADDRESS">
        <Box sx={{ display: "flex", gap: 6, mb: 1.5 }}>
          <InfoField
            label="REGION"
            value={getAddress().region?.name || "N/A"}
          />
          <InfoField
            label="PROVINCE"
            value={getAddress().province?.name || "N/A"}
          />
          <InfoField
            label="CITY/MUNICIPALITY"
            value={getAddress().city_municipality?.name || "N/A"}
          />
        </Box>

        <Box sx={{ display: "flex", gap: 6 }}>
          <InfoField
            label="BARANGAY"
            value={getAddress().barangay?.name || "N/A"}
          />
          <InfoField label="STREET" value={getAddress().street || "N/A"} />
          <InfoField label="ZIP CODE" value={getAddress().zip_code || "N/A"} />
        </Box>
      </SectionContainer>

      <SectionContainer title="EMPLOYEE POSITION">
        <Box sx={{ display: "flex", gap: 6, mb: 1.5 }}>
          <InfoField
            label="POSITION"
            value={getPositionDetails().position?.name || "N/A"}
          />
          <InfoField
            label="JOB LEVEL"
            value={getPositionDetails().job_level?.label || "N/A"}
          />
          <InfoField
            label="SCHEDULE"
            value={getPositionDetails().schedule?.name || "N/A"}
          />
        </Box>

        <Box sx={{ display: "flex", gap: 6 }}>
          <InfoField
            label="JOB RATE"
            value={formatSalary(getPositionDetails().job_rate)}
          />
          <InfoField
            label="ALLOWANCE"
            value={formatSalary(getPositionDetails().allowance)}
          />
          <InfoField
            label="SALARY"
            value={formatSalary(getPositionDetails().salary)}
          />
        </Box>
      </SectionContainer>

      <SectionContainer title="EMPLOYMENT TYPES">
        {getEmploymentTypes().map((empType, index) => (
          <Box
            key={index}
            sx={{ mb: index < getEmploymentTypes().length - 1 ? 2 : 0 }}>
            <Box sx={{ display: "flex", gap: 6 }}>
              <InfoField
                label="TYPE"
                value={empType.employment_type_label || "N/A"}
              />
              <InfoField
                label="START DATE"
                value={formatDate(
                  empType.employment_start_date || empType.regularization_date
                )}
              />
              <InfoField
                label="END DATE"
                value={formatDate(empType.employment_end_date) || "N/A"}
              />
            </Box>
          </Box>
        ))}
      </SectionContainer>

      <SectionContainer title="ATTAINMENT">
        {getAttainments().map((attainment, index) => (
          <Box
            key={index}
            sx={{ mb: index < getAttainments().length - 1 ? 2 : 0 }}>
            <Box sx={{ display: "flex", gap: 6, mb: 1.5 }}>
              <InfoField
                label="ATTAINMENT"
                value={attainment.attainment?.name || "N/A"}
              />
              <InfoField
                label="PROGRAM"
                value={attainment.program?.name || "N/A"}
              />
              <InfoField
                label="DEGREE"
                value={attainment.degree?.name || "N/A"}
              />
            </Box>
            <Box sx={{ display: "flex", gap: 6, mb: 2 }}>
              <InfoField
                label="ACADEMIC YEAR"
                value={
                  attainment.academic_year_from && attainment.academic_year_to
                    ? `${attainment.academic_year_from} - ${attainment.academic_year_to}`
                    : "N/A"
                }
              />
              <InfoField label="GPA" value={attainment.gpa || "N/A"} />
              <InfoField
                label="INSTITUTION"
                value={attainment.institution || "N/A"}
              />
            </Box>

            <Box
              sx={{
                border: "1px solid #e0e0e0",
                borderRadius: 2,
                p: 2,
                backgroundColor: hasAttainmentFile(attainment)
                  ? "#fafafa"
                  : "#f5f5f5",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mt: 1,
                opacity: hasAttainmentFile(attainment) ? 1 : 0.6,
              }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <AttachFileIcon
                  sx={{
                    color: hasAttainmentFile(attainment) ? "#666" : "#999",
                    fontSize: 24,
                  }}
                />
                <Box>
                  <Typography
                    sx={{
                      fontSize: "14px",
                      fontWeight: 500,
                      color: hasAttainmentFile(attainment) ? "#333" : "#999",
                      mb: 0.5,
                    }}>
                    {hasAttainmentFile(attainment)
                      ? getDisplayFilename(attainment)
                      : "No attachment attached"}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#666",
                      fontSize: "12px",
                    }}>
                    Supporting document
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: "flex", gap: 1 }}>
                <IconButton
                  size="small"
                  disabled={!hasAttainmentFile(attainment)}
                  onClick={() =>
                    handleFileViewerOpen(
                      getAttainmentFileId(attainment),
                      getDisplayFilename(attainment),
                      "attainment"
                    )
                  }
                  sx={{
                    backgroundColor: hasAttainmentFile(attainment)
                      ? "#e3f2fd"
                      : "#e0e0e0",
                    color: hasAttainmentFile(attainment) ? "#1976d2" : "#999",
                    "&:hover": {
                      backgroundColor: hasAttainmentFile(attainment)
                        ? "#bbdefb"
                        : "#e0e0e0",
                    },
                    "&.Mui-disabled": {
                      backgroundColor: "#e0e0e0",
                      color: "#999",
                    },
                  }}
                  title={
                    hasAttainmentFile(attainment)
                      ? "View file"
                      : "No file available"
                  }>
                  <VisibilityIcon fontSize="small" />
                </IconButton>
                {fileUrl &&
                  hasAttainmentFile(attainment) &&
                  currentFileId === getAttainmentFileId(attainment) && (
                    <IconButton
                      size="small"
                      onClick={handleFileDownload}
                      sx={{
                        backgroundColor: "#e8f5e8",
                        color: "#2e7d32",
                        "&:hover": {
                          backgroundColor: "#c8e6c9",
                        },
                      }}
                      title="Download file">
                      <DownloadIcon fontSize="small" />
                    </IconButton>
                  )}
              </Box>
            </Box>
          </Box>
        ))}
      </SectionContainer>

      <SectionContainer title="ACCOUNT">
        <Box sx={{ display: "flex", gap: 6, mb: 1.5 }}>
          <InfoField
            label="SSS NUMBER"
            value={getAccount().sss_number || "N/A"}
          />
          <InfoField
            label="PAG-IBIG NUMBER"
            value={getAccount().pag_ibig_number || "N/A"}
          />
          <InfoField
            label="PHILHEALTH NUMBER"
            value={getAccount().philhealth_number || "N/A"}
          />
        </Box>

        <Box sx={{ display: "flex", gap: 6 }}>
          <InfoField
            label="TIN NUMBER"
            value={getAccount().tin_number || "N/A"}
          />
          <InfoField label="BANK" value={getAccount().bank?.name || "N/A"} />
          <InfoField
            label="BANK ACCOUNT NUMBER"
            value={getAccount().bank_account_number || "N/A"}
          />
        </Box>
      </SectionContainer>

      <SectionContainer title="CONTACT">
        <Box sx={{ display: "flex", gap: 6 }}>
          <InfoField
            label="EMAIL ADDRESS"
            value={getContacts().email_address || "N/A"}
          />
          <InfoField
            label="MOBILE NUMBER"
            value={getContacts().mobile_number || "N/A"}
          />
        </Box>
      </SectionContainer>

      {getFiles().length > 0 && (
        <SectionContainer title="FILES">
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {getFiles().map((file, index) => (
              <Box
                key={index}
                sx={{
                  border: "1px solid #e0e0e0",
                  borderRadius: 2,
                  p: 2,
                  backgroundColor: "#fafafa",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <AttachFileIcon sx={{ color: "#666", fontSize: 24 }} />
                  <Box>
                    <Typography
                      sx={{
                        fontSize: "14px",
                        fontWeight: 500,
                        color: "#333",
                        mb: 0.5,
                      }}>
                      {file.file_name || "Document"}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#666",
                        fontSize: "12px",
                      }}>
                      {file.file_type?.name || "File"} -{" "}
                      {file.file_description || "No description"}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: "flex", gap: 1 }}>
                  <IconButton
                    size="small"
                    onClick={() =>
                      handleFileViewerOpen(file.id, file.file_name, "file")
                    }
                    sx={{
                      backgroundColor: "#e3f2fd",
                      color: "#1976d2",
                      "&:hover": {
                        backgroundColor: "#bbdefb",
                      },
                    }}
                    title="View file">
                    <VisibilityIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            ))}
          </Box>
        </SectionContainer>
      )}

      <Dialog
        open={fileViewerOpen}
        onClose={handleFileViewerClose}
        maxWidth={false}
        fullWidth={false}
        PaperProps={{
          sx: {
            width: "90vw",
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
            padding: "16px 24px",
            backgroundColor: "#f8f9fa",
          }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <AttachFileIcon sx={{ color: "rgb(33, 61, 112)" }} />
            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: "16px" }}>
              Employee Document - {fileName}
            </Typography>
          </Box>
          <IconButton onClick={handleFileViewerClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent
          sx={{ p: 0, height: "calc(90vh - 80px)", overflow: "hidden" }}>
          {(
            fileType === "attainment"
              ? isLoadingAttachment
              : isLoadingFileAttachment
          ) ? (
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
          ) : (
              fileType === "attainment" ? attachmentError : fileAttachmentError
            ) ? (
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
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Unable to load the attachment. Please try again.
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mb: 2 }}>
                File ID: {currentFileId} | Error:{" "}
                {(fileType === "attainment"
                  ? attachmentError
                  : fileAttachmentError
                )?.message || "Unknown error"}
              </Typography>
              <Button variant="outlined" onClick={handleFileViewerClose}>
                Close
              </Button>
            </Box>
          ) : fileUrl ? (
            <Box
              sx={{
                width: "100%",
                height: "100%",
                backgroundColor: "#f5f5f5",
                position: "relative",
              }}>
              <iframe
                src={fileUrl}
                width="100%"
                height="100%"
                style={{
                  border: "none",
                  borderRadius: "0 0 8px 8px",
                }}
                title="Employee Document"
                onError={(e) => {
                  console.error("Error loading PDF in iframe:", e);
                }}
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
                  {fileName}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1, fontSize: "14px" }}>
                  File preview not available
                </Typography>
                <Button
                  variant="outlined"
                  onClick={handleFileViewerClose}
                  sx={{ mt: 2 }}>
                  Close
                </Button>
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BasicInfoSection;
