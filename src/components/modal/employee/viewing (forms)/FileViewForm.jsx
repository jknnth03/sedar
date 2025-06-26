import React, { useEffect, useState, useMemo } from "react";
import { Box, Alert, TextField, Grid, Typography, Link } from "@mui/material";
import { useGetEmployeesQuery } from "../../../../features/api/employee/mainApi";
import "../../employee/forms/General.scss";
import "../forms/File.scss";

const FileViewForm = ({ employeeId, employeeData, selectedFiles }) => {
  const [filesData, setFilesData] = useState([]);

  const {
    data: employeesData,
    isLoading: employeesLoading,
    error: employeesError,
  } = useGetEmployeesQuery(undefined, {
    skip: !!employeeData,
  });

  const employee = useMemo(() => {
    if (employeeData) {
      return employeeData;
    }

    if (!employeesData || !employeeId) return null;

    let employees = [];
    if (Array.isArray(employeesData)) {
      employees = employeesData;
    } else if (
      employeesData.result &&
      Array.isArray(employeesData.result.data)
    ) {
      employees = employeesData.result.data;
    } else if (employeesData.data && Array.isArray(employeesData.data)) {
      employees = employeesData.data;
    }

    return employees.find((emp) => emp.id === employeeId);
  }, [employeesData, employeeId, employeeData]);

  const getFileTypeLabel = (fileType) => {
    if (!fileType) return "";

    if (typeof fileType === "string") {
      return fileType;
    }

    if (typeof fileType === "object") {
      const code =
        fileType.code ||
        fileType.file_type_code ||
        fileType.type_code ||
        fileType.file_type ||
        "";
      const name =
        fileType.name ||
        fileType.file_type_name ||
        fileType.type_name ||
        fileType.description ||
        fileType.title ||
        fileType.label ||
        "";

      if (code && name) {
        return `${code} - ${name}`;
      }
      return name || code || "";
    }

    return "";
  };

  const getFileCabinetLabel = (fileCabinet) => {
    if (!fileCabinet) return "";

    if (typeof fileCabinet === "string") {
      return fileCabinet;
    }

    if (typeof fileCabinet === "object") {
      const code =
        fileCabinet.code ||
        fileCabinet.cabinet_code ||
        fileCabinet.file_cabinet_code ||
        fileCabinet.file_cabinet ||
        "";
      const name =
        fileCabinet.name ||
        fileCabinet.cabinet_name ||
        fileCabinet.file_cabinet_name ||
        fileCabinet.description ||
        fileCabinet.title ||
        fileCabinet.label ||
        "";

      if (code && name) {
        return `${code} - ${name}`;
      }
      return name || code || "";
    }

    return "";
  };

  const getFileName = (fileAttachment) => {
    if (!fileAttachment) return "No file attached";

    if (fileAttachment instanceof File) {
      return fileAttachment.name;
    }

    if (typeof fileAttachment === "string") {
      return fileAttachment.split("/").pop() || fileAttachment;
    }

    if (typeof fileAttachment === "object") {
      return (
        fileAttachment.name ||
        fileAttachment.filename ||
        fileAttachment.original_name ||
        fileAttachment.file_name ||
        "Unknown file"
      );
    }

    return "Unknown file";
  };

  const getFileUrl = (fileAttachment) => {
    if (!fileAttachment) return null;

    if (typeof fileAttachment === "string") {
      if (
        fileAttachment.startsWith("http://") ||
        fileAttachment.startsWith("https://")
      ) {
        return fileAttachment;
      }
      return fileAttachment;
    }

    if (typeof fileAttachment === "object") {
      return (
        fileAttachment.url ||
        fileAttachment.file_url ||
        fileAttachment.download_url ||
        fileAttachment.path ||
        fileAttachment.src ||
        null
      );
    }

    return null;
  };

  const handleFileClick = (fileAttachment) => {
    const fileUrl = getFileUrl(fileAttachment);
    if (fileUrl) {
      window.open(fileUrl, "_blank");
    }
  };

  useEffect(() => {
    if (
      selectedFiles &&
      Array.isArray(selectedFiles) &&
      selectedFiles.length > 0
    ) {
      const formattedFiles = selectedFiles.map((file, index) => ({
        id: file.id || `file-${index}`,
        index: index,
        file_type: file.file_type || file.fileType || file.type || null,
        file_cabinet:
          file.file_cabinet || file.cabinet || file.fileCabinet || null,
        file_description:
          file.file_description || file.description || file.desc || "",
        file_attachment:
          file.file_attachment || file.attachment || file.file || null,
      }));
      setFilesData(formattedFiles);
      return;
    }

    if (
      employee &&
      employee.files &&
      Array.isArray(employee.files) &&
      employee.files.length > 0
    ) {
      const allFiles = [];

      employee.files.forEach((fileGroup, groupIndex) => {
        if (fileGroup.files && Array.isArray(fileGroup.files)) {
          fileGroup.files.forEach((file, fileIndex) => {
            allFiles.push({
              id: file.id || `file-${allFiles.length}`,
              index: allFiles.length,
              file_type: file.file_type || fileGroup.file_type || null,
              file_cabinet: file.file_cabinet || fileGroup.file_cabinet || null,
              file_description: file.file_description || file.description || "",
              file_attachment: file.file_attachment || file.attachment || null,
            });
          });
        } else {
          allFiles.push({
            id: fileGroup.id || `file-${allFiles.length}`,
            index: allFiles.length,
            file_type: fileGroup.file_type || null,
            file_cabinet: fileGroup.file_cabinet || null,
            file_description:
              fileGroup.file_description || fileGroup.description || "",
            file_attachment:
              fileGroup.file_attachment || fileGroup.attachment || null,
          });
        }
      });

      setFilesData(allFiles);
      return;
    }

    setFilesData([]);
  }, [employee, selectedFiles]);

  if (employeesLoading) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography>Loading file information...</Typography>
      </Box>
    );
  }

  if (employeesError) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          Failed to load employee file information.
        </Alert>
      </Box>
    );
  }

  if (!employee && !selectedFiles) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="warning" sx={{ mb: 3 }}>
          Employee not found.
        </Alert>
      </Box>
    );
  }

  if (filesData.length === 0) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="info" sx={{ mb: 3 }}>
          No file information available for this employee.
        </Alert>
      </Box>
    );
  }

  return (
    <Box className="file-form-container">
      {filesData.map((file, index) => (
        <Box key={file.id || `file-${index}`} className="file-line-container">
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={4}>
              <TextField
                label="File Type"
                variant="outlined"
                fullWidth
                value={getFileTypeLabel(file.file_type) || "Not specified"}
                InputProps={{
                  readOnly: true,
                }}
                sx={{
                  width: "358px",
                  minWidth: "250px",
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 1,
                    backgroundColor: "#f5f5f5",
                  },
                  "& .MuiInputBase-input": {
                    color: "#666",
                  },
                }}
              />
            </Grid>

            <Grid item xs={4}>
              <TextField
                label="File Cabinet"
                variant="outlined"
                fullWidth
                value={
                  getFileCabinetLabel(file.file_cabinet) || "Not specified"
                }
                InputProps={{
                  readOnly: true,
                }}
                sx={{
                  width: "358px",
                  minWidth: "250px",
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 1,
                    backgroundColor: "#f5f5f5",
                  },
                  "& .MuiInputBase-input": {
                    color: "#666",
                  },
                }}
              />
            </Grid>

            <Grid item xs={4}>
              <TextField
                label="File Description"
                variant="outlined"
                fullWidth
                value={file.file_description || ""}
                InputProps={{
                  readOnly: true,
                }}
                placeholder="No description provided"
                className="file-description-field"
                sx={{
                  width: "358px",
                  minWidth: "250px",
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 1,
                    backgroundColor: "#f5f5f5",
                  },
                  "& .MuiInputBase-input": {
                    color: "#666",
                  },
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Box className="file-upload-container">
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom>
                  File Attachment
                </Typography>
                <Box
                  sx={{
                    p: 2,
                    border: "1px solid #e0e0e0",
                    borderRadius: 1,
                    backgroundColor: "#f5f5f5",
                    minHeight: "56px",
                    display: "flex",
                    alignItems: "center",
                  }}>
                  {file.file_attachment && getFileUrl(file.file_attachment) ? (
                    <Link
                      component="button"
                      variant="body1"
                      onClick={() => handleFileClick(file.file_attachment)}
                      sx={{
                        color: "#1976d2",
                        textDecoration: "underline",
                        cursor: "pointer",
                        backgroundColor: "transparent",
                        border: "none",
                        padding: 0,
                        font: "inherit",
                        "&:hover": {
                          color: "#1565c0",
                        },
                      }}>
                      {getFileName(file.file_attachment)}
                    </Link>
                  ) : (
                    <Typography variant="body1" sx={{ color: "#999" }}>
                      {file.file_attachment
                        ? getFileName(file.file_attachment)
                        : "No file attached"}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
      ))}
    </Box>
  );
};

FileViewForm.displayName = "FileViewForm";

export default FileViewForm;
