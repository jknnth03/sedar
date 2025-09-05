import React from "react";
import { useFormContext, Controller } from "react-hook-form";
import { Box, Typography, FormControl, FormHelperText } from "@mui/material";
import {
  CloudUpload as CloudUploadIcon,
  AttachFile as AttachFileIcon,
} from "@mui/icons-material";
import { fileInputConfig } from "../../../schema/approver/formSubmissionSchema";

const AttachmentField = ({
  selectedEntry,
  onFileChange,
  selectedFile,
  disabled = false,
  onFileViewerOpen,
}) => {
  const {
    control,
    formState: { errors },
    setValue,
    watch,
  } = useFormContext();

  const watchedAttachmentFilename = watch("manpower_attachment_filename");
  const watchedFormAttachment = watch("manpower_form_attachment");

  const isReadOnly = disabled;
  const isViewMode = disabled;

  const handleFileDownload = (fileUrl, filename) => {
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = filename || "attachment";
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileChange = (event) => {
    if (disabled) return;

    const file = event.target.files[0];
    if (file) {
      setValue("manpower_form_attachment", file);
      setValue("manpower_attachment_filename", "");

      if (onFileChange) {
        onFileChange(file);
      }
    }
  };

  const hasExistingFile = () => {
    if (selectedFile && selectedFile instanceof File) {
      return false;
    }

    if (selectedFile && typeof selectedFile === "string") {
      return true;
    }

    if (watchedFormAttachment && typeof watchedFormAttachment === "string") {
      return true;
    }

    if (selectedEntry?.submittable?.manpower_form_attachment && !selectedFile) {
      return true;
    }

    return false;
  };

  const getDisplayFilename = () => {
    if (selectedFile && selectedFile instanceof File) {
      return selectedFile.name;
    }

    if (selectedFile && typeof selectedFile === "string") {
      return selectedFile;
    }

    if (watchedAttachmentFilename) {
      return watchedAttachmentFilename;
    }

    if (selectedEntry?.submittable?.manpower_attachment_filename) {
      return selectedEntry.submittable.manpower_attachment_filename;
    }

    if (selectedEntry?.submittable?.manpower_form_attachment) {
      return selectedEntry.submittable.manpower_form_attachment
        .split("/")
        .pop();
    }

    if (watchedFormAttachment && typeof watchedFormAttachment === "string") {
      return watchedFormAttachment.split("/").pop();
    }

    return "Download File";
  };

  const getDownloadUrl = () => {
    if (selectedEntry?.submittable?.manpower_form_attachment) {
      return selectedEntry.submittable.manpower_form_attachment;
    }

    if (watchedFormAttachment && typeof watchedFormAttachment === "string") {
      return watchedFormAttachment;
    }

    return "";
  };

  const hasNewFileSelected = () => {
    return selectedFile && selectedFile instanceof File;
  };

  const canViewFile = () => {
    return hasExistingFile() && selectedEntry?.id && !hasNewFileSelected();
  };

  return (
    <FormControl fullWidth error={!!errors.manpower_form_attachment}>
      <Box
        sx={{
          border: "2px dashed #d1d5db",
          borderRadius: 2,
          p: 3,
          textAlign: "center",
          backgroundColor: isReadOnly ? "#f5f5f5" : "#fafafa",
          cursor: isViewMode
            ? "default"
            : isReadOnly
            ? "not-allowed"
            : "pointer",
          "&:hover": {
            borderColor: isViewMode
              ? "#d1d5db"
              : isReadOnly
              ? "#d1d5db"
              : "#6b7280",
            backgroundColor: isViewMode
              ? "#f5f5f5"
              : isReadOnly
              ? "#f5f5f5"
              : "#f3f4f6",
          },
        }}
        component={isViewMode ? "div" : isReadOnly ? "div" : "label"}
        htmlFor={
          isViewMode ? undefined : isReadOnly ? undefined : "file-upload"
        }>
        {!isViewMode && !isReadOnly && (
          <input
            id="file-upload"
            type="file"
            hidden
            onChange={handleFileChange}
            accept={fileInputConfig.accept}
            disabled={isReadOnly}
          />
        )}

        {hasNewFileSelected() ? (
          <>
            <CloudUploadIcon
              sx={{
                fontSize: 30,
                color: "#22c55e",
              }}
            />
            <Typography
              variant="body1"
              sx={{
                color: "#374151",
                fontWeight: 500,
                mb: 1,
              }}>
              New file selected: {selectedFile.name}
              <span style={{ color: isViewMode ? "gray" : "red" }}> *</span>
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "#22c55e",
                fontStyle: "italic",
              }}>
              This file will replace the current attachment when saved
            </Typography>
          </>
        ) : hasExistingFile() ? (
          <>
            <AttachFileIcon sx={{ color: "#6b7280", fontSize: 30 }} />
            <Typography
              onClick={
                canViewFile()
                  ? onFileViewerOpen
                  : () =>
                      handleFileDownload(getDownloadUrl(), getDisplayFilename())
              }
              sx={{
                color: "#1976d2",
                textDecoration: "none",
                "&:hover": {
                  textDecoration: "underline",
                },
                cursor: "pointer",
                fontWeight: 500,
                mb: 1,
              }}>
              {getDisplayFilename()}
            </Typography>
            {canViewFile() && (
              <Typography
                variant="body2"
                sx={{
                  color: "#6b7280",
                  mt: 1,
                }}>
                {isViewMode
                  ? "Click to view file"
                  : "Click to view file • Upload new file to replace"}
              </Typography>
            )}
            {!canViewFile() && !isViewMode && (
              <Typography
                variant="body2"
                sx={{
                  color: "#6b7280",
                  mt: 1,
                }}>
                Click to download • Upload new file to replace
              </Typography>
            )}
          </>
        ) : (
          <>
            <CloudUploadIcon
              sx={{
                fontSize: 30,
                color: isReadOnly ? "#9ca3af" : "#6b7280",
              }}
            />
            <Typography
              variant="body1"
              sx={{
                color: isReadOnly ? "#9ca3af" : "#374151",
                fontWeight: 500,
                mb: 1,
              }}>
              UPLOAD ATTACHMENT (PDF ONLY)
              <span style={{ color: isViewMode ? "gray" : "red" }}> *</span>
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: isReadOnly ? "#9ca3af" : "#6b7280",
              }}>
              {isViewMode
                ? "No attachment available"
                : "Click to browse files or drag and drop"}
            </Typography>
          </>
        )}
      </Box>
      {errors.manpower_form_attachment && (
        <FormHelperText>
          {errors.manpower_form_attachment.message}
        </FormHelperText>
      )}
    </FormControl>
  );
};

export default AttachmentField;
