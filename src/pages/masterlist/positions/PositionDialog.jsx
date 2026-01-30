import React, { useState, useCallback, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  IconButton,
  Box,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Chip,
} from "@mui/material";
import { Close, AttachFile } from "@mui/icons-material";

import { useGetPositionAttachmentQuery } from "../../../features/api/masterlist/positionAttachmentApi";

const PositionDialog = ({ open, onClose, position, type = "attachment" }) => {
  const [fileUrl, setFileUrl] = useState(null);
  const [currentFileName, setCurrentFileName] = useState("");

  const {
    data: attachmentData,
    isLoading: isLoadingAttachment,
    error: attachmentError,
  } = useGetPositionAttachmentQuery(position?.id, {
    skip:
      !open ||
      !position?.id ||
      position?.id === "undefined" ||
      type !== "attachment",
  });

  useEffect(() => {
    if (open && attachmentData && type === "attachment") {
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
      }

      const url = URL.createObjectURL(attachmentData);
      setFileUrl(url);
    }

    if (!open && fileUrl) {
      URL.revokeObjectURL(fileUrl);
      setFileUrl(null);
    }

    return () => {
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
      }
    };
  }, [open, attachmentData, type]);

  useEffect(() => {
    if (!open) {
      setFileUrl(null);
    }
  }, [open]);

  useEffect(() => {
    if (position) {
      const filename = getDisplayFileName(position);
      setCurrentFileName(filename);
    }
  }, [position]);

  const getDisplayFileName = (position) => {
    if (!position) return "";

    if (position.position_attachment_filename) {
      return position.position_attachment_filename;
    }

    if (position.position_attachment) {
      try {
        const urlParts = position.position_attachment.split("/");
        const filename = urlParts[urlParts.length - 1];
        return decodeURIComponent(filename.split("?")[0]);
      } catch (error) {
        return position.position_attachment;
      }
    }

    return "attachment.pdf";
  };

  const handleClose = useCallback(() => {
    if (fileUrl) {
      URL.revokeObjectURL(fileUrl);
    }
    setFileUrl(null);
    setCurrentFileName("");
    onClose();
  }, [fileUrl, onClose]);

  const getDialogTitle = () => {
    switch (type) {
      case "tools":
        return "Tools";
      case "requestors":
        return "Requestors";
      default:
        return `Attachment - ${currentFileName}`;
    }
  };

  const renderToolsContent = () => {
    const tools = position?.tools || [];

    if (!Array.isArray(tools) || tools.length === 0) {
      return (
        <Box textAlign="center" py={4}>
          <Typography variant="body1" color="text.secondary">
            No tools assigned
          </Typography>
        </Box>
      );
    }

    return (
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {tools.map((tool, index) => (
            <Chip
              key={index}
              label={
                typeof tool === "string"
                  ? tool
                  : tool?.name || `Tool ${index + 1}`
              }
              color="primary"
              variant="outlined"
              sx={{
                fontFamily: "'Helvetica Neue', Arial, sans-serif",
                fontSize: "0.9rem",
                fontWeight: 500,
              }}
            />
          ))}
        </Box>
      </Box>
    );
  };

  const renderRequestorsContent = () => {
    const requestors = position?.requesters || position?.requestors || [];

    if (!Array.isArray(requestors) || requestors.length === 0) {
      return (
        <Box textAlign="center" py={4}>
          <Typography variant="body1" color="text.secondary">
            No requestors assigned
          </Typography>
        </Box>
      );
    }

    if (typeof requestors[0] === "string") {
      return (
        <List>
          {requestors.map((requestor, index) => (
            <ListItem
              key={index}
              sx={{
                borderBottom:
                  index < requestors.length - 1 ? "1px solid #e0e0e0" : "none",
              }}>
              <ListItemText
                primary={requestor}
                primaryTypographyProps={{
                  fontWeight: 500,
                }}
              />
            </ListItem>
          ))}
        </List>
      );
    }

    return (
      <List>
        {requestors.map((requestor, index) => (
          <ListItem
            key={requestor?.id || index}
            sx={{
              borderBottom:
                index < requestors.length - 1 ? "1px solid #e0e0e0" : "none",
              flexDirection: "column",
              alignItems: "flex-start",
            }}>
            <ListItemText
              primary={
                requestor?.full_name || requestor?.name || "Unknown User"
              }
              secondary={
                <>
                  {requestor?.employee_id && (
                    <Typography
                      variant="body2"
                      component="span"
                      display="block">
                      Employee ID: {requestor.employee_id}
                    </Typography>
                  )}
                  {requestor?.position?.position_name && (
                    <Typography
                      variant="body2"
                      component="span"
                      display="block">
                      Position: {requestor.position.position_name}
                    </Typography>
                  )}
                  {requestor?.department_name && (
                    <Typography
                      variant="body2"
                      component="span"
                      display="block">
                      Department: {requestor.department_name}
                    </Typography>
                  )}
                </>
              }
              primaryTypographyProps={{
                fontWeight: 500,
              }}
            />
          </ListItem>
        ))}
      </List>
    );
  };

  const renderAttachmentContent = () => {
    if (!position || !position.position_attachment) {
      return null;
    }

    if (isLoadingAttachment) {
      return (
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
      );
    }

    if (attachmentError) {
      return (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="100%"
          flexDirection="column">
          <Typography variant="h6" color="error" gutterBottom>
            Error loading attachment
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Unable to load the attachment. Please try again.
          </Typography>
        </Box>
      );
    }

    return (
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
            title="Position Attachment"
          />
        ) : position.position_attachment ? (
          <iframe
            src={position.position_attachment}
            width="100%"
            height="100%"
            style={{
              border: "none",
              borderRadius: "0 0 8px 8px",
            }}
            title="Position Attachment"
            onError={() => {
              console.error(
                "Failed to load attachment:",
                position.position_attachment,
              );
            }}
          />
        ) : (
          <Box textAlign="center">
            <AttachFile sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              {currentFileName}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              File preview not available
            </Typography>
          </Box>
        )}
      </Box>
    );
  };

  const renderContent = () => {
    switch (type) {
      case "tools":
        return renderToolsContent();
      case "requestors":
        return renderRequestorsContent();
      default:
        return renderAttachmentContent();
    }
  };

  const getDialogSize = () => {
    if (type === "attachment") {
      return {
        maxWidth: false,
        fullWidth: false,
        PaperProps: {
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
        },
      };
    }
    return {
      maxWidth: "sm",
      fullWidth: true,
      PaperProps: {
        sx: {
          borderRadius: 2,
        },
      },
    };
  };

  if (!position) {
    return null;
  }

  if (type === "attachment" && !position.position_attachment) {
    return null;
  }

  const dialogSize = getDialogSize();

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      {...dialogSize}
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
          {getDialogTitle()}
        </Typography>
        <IconButton
          onClick={handleClose}
          size="small"
          sx={{
            color: "text.secondary",
            "&:hover": {
              backgroundColor: "rgba(0, 0, 0, 0.04)",
            },
          }}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent
        sx={{
          p: type === "attachment" ? 0 : 2,
          position: "relative",
          height: type === "attachment" ? "calc(90vh - 140px)" : "auto",
          overflow: type === "attachment" ? "hidden" : "auto",
        }}>
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
};

export default PositionDialog;
