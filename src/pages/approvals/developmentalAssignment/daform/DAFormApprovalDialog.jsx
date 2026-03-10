import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  TextField,
  Button,
  IconButton,
  Box,
  CircularProgress,
  Skeleton,
  Chip,
  Divider,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import CloseIcon from "@mui/icons-material/Close";
import HelpIcon from "@mui/icons-material/Help";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useGetKpiAttachmentQuery } from "../../../../features/api/evaluation/kpiApi";
import * as styles from "./DAFormApprovalStyles";

const DAFormApprovalDialog = ({
  open,
  onClose,
  approval,
  onApprove,
  onReject,
  isLoading = false,
  isLoadingData = false,
}) => {
  const [comments, setComments] = useState("");
  const [reason, setReason] = useState("");
  const [actionType, setActionType] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [fileViewerOpen, setFileViewerOpen] = useState(false);
  const [fetchAttachment, setFetchAttachment] = useState(false);
  const [fileUrl, setFileUrl] = useState(null);

  const formDetails = approval?.form_details || {};
  const fromPosition = formDetails.from_position || {};
  const toPosition = formDetails.to_position || {};
  const objectives = formDetails.objectives || [];
  const kpisAttachment = formDetails.kpis_attachment || {};
  const attachmentUrl = kpisAttachment.download_url || null;
  const attachmentFilename = kpisAttachment.filename || "KPI Attachment";
  const toPositionId = toPosition.id || null;
  const status = approval?.status?.toLowerCase() || "pending";
  const isProcessed = status === "approved" || status === "rejected";

  const {
    data: attachmentData,
    isLoading: attachmentLoading,
    error: attachmentFetchError,
  } = useGetKpiAttachmentQuery(toPositionId, {
    skip: !fetchAttachment || !toPositionId || !fileViewerOpen,
  });

  useEffect(() => {
    if (!fileViewerOpen) {
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
        setFileUrl(null);
      }
      return;
    }
    if (attachmentLoading) return;
    if (attachmentFetchError) return;
    if (attachmentData instanceof Blob) {
      if (fileUrl) URL.revokeObjectURL(fileUrl);
      setFileUrl(URL.createObjectURL(attachmentData));
    }
  }, [fileViewerOpen, attachmentData, attachmentLoading, attachmentFetchError]);

  const handleViewFile = () => {
    if (!attachmentUrl) return;
    setFileUrl(null);
    setFetchAttachment(true);
    setFileViewerOpen(true);
  };

  const handleCloseViewer = () => {
    setFileViewerOpen(false);
    setFetchAttachment(false);
    if (fileUrl) {
      URL.revokeObjectURL(fileUrl);
      setFileUrl(null);
    }
  };

  const handleApprove = () => {
    setActionType("approve");
    setConfirmAction("approve");
    setConfirmOpen(true);
  };

  const handleReject = () => {
    setActionType("reject");
    setConfirmAction("reject");
    setConfirmOpen(true);
  };

  const handleActionConfirm = () => {
    if (confirmAction === "approve") {
      onApprove({ comments });
    } else if (confirmAction === "reject") {
      onReject({ reason: reason.trim(), comments });
    }
    setConfirmOpen(false);
    handleReset();
  };

  const handleClose = () => {
    onClose();
    handleReset();
  };

  const handleReset = () => {
    setComments("");
    setReason("");
    setActionType(null);
    setConfirmAction(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const renderSkeletonField = () => (
    <Box sx={styles.fieldBoxStyles}>
      <Skeleton variant="text" width="40%" height={16} sx={{ mb: 0.5 }} />
      <Skeleton variant="text" width="80%" height={20} />
    </Box>
  );

  const renderSkeletonSection = () => (
    <Box sx={styles.sectionBoxStyles}>
      <Skeleton variant="text" width="30%" height={24} sx={{ mb: 2 }} />
      <Box>
        <Box sx={styles.fieldContainerStyles}>
          {renderSkeletonField()}
          {renderSkeletonField()}
          {renderSkeletonField()}
        </Box>
        <Box sx={styles.lastFieldContainerStyles}>
          {renderSkeletonField()}
          {renderSkeletonField()}
          {renderSkeletonField()}
        </Box>
      </Box>
    </Box>
  );

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: styles.dialogPaperStyles }}>
        <DialogTitle sx={styles.dialogTitleStyles}>
          <Box sx={styles.titleBoxStyles}>
            <Box sx={styles.titleInnerBoxStyles}>
              📋
              <Typography variant="h6" sx={styles.titleTextStyles}>
                VIEW DA FORM REQUEST
              </Typography>
            </Box>
            <IconButton onClick={handleClose} size="small">
              <CloseIcon sx={styles.closeIconStyles} />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          {isLoadingData ? (
            <>
              {renderSkeletonSection()}
              {renderSkeletonSection()}
              {renderSkeletonSection()}
            </>
          ) : (
            <>
              <Box sx={styles.sectionBoxStyles}>
                <Typography variant="subtitle2" sx={styles.sectionTitleStyles}>
                  Employee Information
                </Typography>
                <Box>
                  <Box sx={styles.fieldContainerStyles}>
                    <Box sx={styles.fieldBoxStyles}>
                      <Typography
                        variant="caption"
                        sx={styles.fieldLabelStyles}>
                        EMPLOYEE NUMBER
                      </Typography>
                      <Typography variant="body2" sx={styles.fieldValueStyles}>
                        {formDetails.employee_number || "N/A"}
                      </Typography>
                    </Box>
                    <Box sx={styles.fieldBoxStyles}>
                      <Typography
                        variant="caption"
                        sx={styles.fieldLabelStyles}>
                        EMPLOYEE NAME
                      </Typography>
                      <Typography variant="body2" sx={styles.fieldValueStyles}>
                        {formDetails.employee_name || "N/A"}
                      </Typography>
                    </Box>
                    <Box sx={styles.fieldBoxStyles}>
                      <Typography
                        variant="caption"
                        sx={styles.fieldLabelStyles}>
                        REFERENCE NUMBER
                      </Typography>
                      <Typography variant="body2" sx={styles.fieldValueStyles}>
                        {formDetails.reference_number || "N/A"}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={styles.lastFieldContainerStyles}>
                    <Box sx={styles.fieldBoxStyles}>
                      <Typography
                        variant="caption"
                        sx={styles.fieldLabelStyles}>
                        START DATE
                      </Typography>
                      <Typography variant="body2" sx={styles.fieldValueStyles}>
                        {formatDate(formDetails.start_date)}
                      </Typography>
                    </Box>
                    <Box sx={styles.fieldBoxStyles}>
                      <Typography
                        variant="caption"
                        sx={styles.fieldLabelStyles}>
                        END DATE
                      </Typography>
                      <Typography variant="body2" sx={styles.fieldValueStyles}>
                        {formatDate(formDetails.end_date)}
                      </Typography>
                    </Box>
                    <Box sx={styles.fieldBoxStyles}>
                      <Typography
                        variant="caption"
                        sx={styles.fieldLabelStyles}>
                        REQUESTED BY
                      </Typography>
                      <Typography variant="body2" sx={styles.fieldValueStyles}>
                        {approval?.requested_by || "N/A"}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>

              <Box sx={styles.sectionBoxStyles}>
                <Typography variant="subtitle2" sx={styles.sectionTitleStyles}>
                  Position Details
                </Typography>
                <Box>
                  <Box sx={styles.fieldContainerStyles}>
                    <Box sx={styles.fieldBoxStyles}>
                      <Typography
                        variant="caption"
                        sx={styles.fieldLabelStyles}>
                        FROM POSITION
                      </Typography>
                      <Typography variant="body2" sx={styles.fieldValueStyles}>
                        {fromPosition.position_title || "N/A"}
                      </Typography>
                    </Box>
                    <Box sx={styles.fieldBoxStyles}>
                      <Typography
                        variant="caption"
                        sx={styles.fieldLabelStyles}>
                        TO POSITION
                      </Typography>
                      <Typography variant="body2" sx={styles.fieldValueStyles}>
                        {toPosition.position_title || "N/A"}
                      </Typography>
                    </Box>
                    <Box sx={styles.fieldBoxStyles}>
                      <Typography
                        variant="caption"
                        sx={styles.fieldLabelStyles}>
                        DEPARTMENT
                      </Typography>
                      <Typography variant="body2" sx={styles.fieldValueStyles}>
                        {fromPosition.department || "N/A"}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={styles.lastFieldContainerStyles}>
                    <Box sx={styles.fieldBoxStyles}>
                      <Typography
                        variant="caption"
                        sx={styles.fieldLabelStyles}>
                        SUB UNIT
                      </Typography>
                      <Typography variant="body2" sx={styles.fieldValueStyles}>
                        {fromPosition.sub_unit || "N/A"}
                      </Typography>
                    </Box>
                    <Box sx={styles.fieldBoxStyles}>
                      <Typography
                        variant="caption"
                        sx={styles.fieldLabelStyles}>
                        CHARGING NAME
                      </Typography>
                      <Typography variant="body2" sx={styles.fieldValueStyles}>
                        {fromPosition.charging_name || "N/A"}
                      </Typography>
                    </Box>
                    <Box sx={styles.fieldBoxStyles} />
                  </Box>
                </Box>
              </Box>

              <Box sx={styles.sectionBoxStyles}>
                <Typography variant="subtitle2" sx={styles.sectionTitleStyles}>
                  KPI Attachment
                </Typography>
                <Box
                  sx={{
                    border: attachmentUrl
                      ? "2px solid #ddd"
                      : "2px dashed #ddd",
                    borderRadius: 2,
                    p: 2,
                    backgroundColor: attachmentUrl ? "#fff" : "#fafafa",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <AttachFileIcon
                      sx={{
                        color: attachmentUrl ? "#1976d2" : "#bbb",
                        fontSize: 24,
                      }}
                    />
                    <Box>
                      {attachmentUrl ? (
                        <>
                          <Typography
                            sx={{
                              fontWeight: 600,
                              color: "rgb(33, 61, 112)",
                              fontSize: "0.9rem",
                            }}>
                            File name:{" "}
                            <span style={{ color: "#f44336" }}>
                              {attachmentFilename}
                            </span>
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ color: "#666", fontSize: "11px" }}>
                            Click VIEW to preview the file
                          </Typography>
                        </>
                      ) : (
                        <Typography
                          sx={{
                            fontWeight: 600,
                            color: "#9ca3af",
                            fontSize: "0.9rem",
                          }}>
                          No KPI attachment available
                        </Typography>
                      )}
                    </Box>
                  </Box>
                  {attachmentUrl && (
                    <IconButton
                      size="small"
                      onClick={handleViewFile}
                      sx={{
                        border: "1px solid #1976d2",
                        color: "#1976d2",
                        borderRadius: 1,
                        px: 1.5,
                        gap: 0.5,
                        "&:hover": { backgroundColor: "#e3f2fd" },
                      }}>
                      <VisibilityIcon fontSize="small" />
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        VIEW
                      </Typography>
                    </IconButton>
                  )}
                </Box>
              </Box>

              {objectives.length > 0 && (
                <Box sx={styles.sectionBoxStyles}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 2,
                    }}>
                    <TrendingUpIcon sx={{ color: "rgb(33, 61, 112)" }} />
                    <Typography
                      variant="subtitle2"
                      sx={styles.sectionTitleStyles}>
                      Key Performance Indicators ({objectives.length})
                    </Typography>
                  </Box>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {objectives.map((objective, index) => (
                      <Box
                        key={objective.id}
                        sx={{
                          p: 2,
                          backgroundColor: "#f8f9fa",
                          borderRadius: "8px",
                          border: "1px solid #e0e0e0",
                        }}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 1.5,
                          }}>
                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontWeight: 700,
                              color: "rgb(33, 61, 112)",
                              fontSize: "14px",
                            }}>
                            {index + 1}. {objective.objective_name}
                          </Typography>
                          <Chip
                            label={`${objective.distribution_percentage}%`}
                            size="small"
                            sx={{
                              backgroundColor: "rgb(33, 61, 112)",
                              color: "white",
                              fontWeight: 600,
                            }}
                          />
                        </Box>
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 1,
                          }}>
                          <Box>
                            <Typography
                              variant="caption"
                              sx={{
                                color: "#666",
                                fontSize: "11px",
                                fontWeight: 600,
                                textTransform: "uppercase",
                                letterSpacing: "0.5px",
                              }}>
                              Deliverable
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                color: "#333",
                                fontSize: "13px",
                                mt: 0.5,
                                whiteSpace: "pre-wrap",
                              }}>
                              {objective.deliverable || "N/A"}
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              gap: 2,
                              mt: 1,
                              pt: 1,
                              borderTop: "1px solid #e0e0e0",
                            }}>
                            <Box sx={{ flex: 1 }}>
                              <Typography
                                variant="caption"
                                sx={{
                                  color: "#666",
                                  fontSize: "11px",
                                  fontWeight: 600,
                                  textTransform: "uppercase",
                                }}>
                                Target %
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{
                                  color: "#333",
                                  fontSize: "13px",
                                  fontWeight: 600,
                                  mt: 0.5,
                                }}>
                                {objective.target_percentage ?? "N/A"}%
                              </Typography>
                            </Box>
                            <Box sx={{ flex: 1 }}>
                              <Typography
                                variant="caption"
                                sx={{
                                  color: "#666",
                                  fontSize: "11px",
                                  fontWeight: 600,
                                  textTransform: "uppercase",
                                }}>
                                Actual Performance
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{
                                  color: "#333",
                                  fontSize: "13px",
                                  fontWeight: 600,
                                  mt: 0.5,
                                }}>
                                {objective.actual_performance ?? "N/A"}
                              </Typography>
                            </Box>
                          </Box>
                          {objective.remarks && (
                            <Box sx={{ mt: 1 }}>
                              <Typography
                                variant="caption"
                                sx={{
                                  color: "#666",
                                  fontSize: "11px",
                                  fontWeight: 600,
                                  textTransform: "uppercase",
                                }}>
                                Remarks
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{
                                  color: "#333",
                                  fontSize: "13px",
                                  mt: 0.5,
                                }}>
                                {objective.remarks}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}

              {isProcessed && (
                <Box sx={styles.processedBoxStyles}>
                  <Typography
                    variant="h6"
                    color="text.secondary"
                    sx={styles.processedTextStyles}>
                    This DA Form request has already been {status}
                  </Typography>
                </Box>
              )}
            </>
          )}
        </DialogContent>

        <DialogActions sx={styles.dialogActionsStyles}>
          {!isLoadingData && !isProcessed && (
            <>
              <Button
                onClick={handleReject}
                variant="contained"
                sx={styles.rejectButtonStyles}
                disabled={isLoading}
                startIcon={
                  isLoading && actionType === "reject" ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <CancelIcon />
                  )
                }>
                {isLoading && actionType === "reject"
                  ? "Processing..."
                  : "REJECT"}
              </Button>
              <Button
                onClick={handleApprove}
                variant="contained"
                sx={styles.approveButtonStyles}
                disabled={isLoading}
                startIcon={
                  isLoading && actionType === "approve" ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <CheckCircleIcon />
                  )
                }>
                {isLoading && actionType === "approve"
                  ? "Processing..."
                  : "APPROVE"}
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: styles.dialogPaperStyles }}>
        <DialogTitle sx={styles.confirmDialogTitleStyles}>
          <Box sx={styles.confirmIconBoxStyles}>
            <HelpIcon sx={styles.confirmIconStyles} />
          </Box>
          <Typography
            variant="h6"
            fontWeight="bold"
            textAlign="center"
            sx={styles.confirmTitleStyles}>
            {confirmAction === "approve"
              ? "Confirm Approval"
              : "Confirm Rejection"}
          </Typography>
        </DialogTitle>
        <DialogContent sx={styles.confirmContentStyles}>
          <Typography
            variant="body1"
            gutterBottom
            sx={styles.confirmMessageStyles}>
            {confirmAction === "approve"
              ? "Are you sure you want to Approve this DA Form request?"
              : "Are you sure you want to Reject this DA Form request?"}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={styles.confirmIdStyles}>
            DA Form Request ID: {approval?.id || "N/A"}
          </Typography>
          {confirmAction === "reject" && (
            <TextField
              label="Reason for Rejection"
              placeholder="Please provide a reason for rejecting this request..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              multiline
              rows={3}
              fullWidth
              required
              variant="outlined"
              sx={styles.confirmTextFieldStyles}
            />
          )}
        </DialogContent>
        <DialogActions sx={styles.confirmActionsStyles}>
          <Box sx={styles.confirmButtonBoxStyles}>
            <Button
              onClick={() => setConfirmOpen(false)}
              variant="outlined"
              sx={styles.cancelButtonStyles}
              disabled={isLoading}>
              Cancel
            </Button>
            <Button
              onClick={handleActionConfirm}
              variant="contained"
              sx={styles.confirmActionButtonStyles(confirmAction)}
              disabled={
                isLoading || (confirmAction === "reject" && !reason.trim())
              }>
              {isLoading ? (
                <CircularProgress size={20} color="inherit" />
              ) : confirmAction === "approve" ? (
                "APPROVE"
              ) : (
                "REJECT"
              )}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      <Dialog
        open={fileViewerOpen}
        onClose={handleCloseViewer}
        maxWidth={false}
        PaperProps={{
          sx: {
            width: "77vw",
            height: "92vh",
            maxWidth: "80vw",
            maxHeight: "92vh",
            borderRadius: 2,
          },
        }}>
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid",
            borderColor: "divider",
            py: 1.5,
            backgroundColor: "#f8f9fa",
          }}>
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: "1rem" }}>
            {attachmentFilename}
          </Typography>
          <IconButton size="small" onClick={handleCloseViewer}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, height: "100%", overflow: "hidden" }}>
          {attachmentLoading ? (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              height="100%"
              flexDirection="column"
              gap={2}>
              <CircularProgress size={48} />
              <Typography variant="body1" color="text.secondary">
                Loading attachment...
              </Typography>
            </Box>
          ) : attachmentFetchError ? (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              height="100%"
              flexDirection="column"
              gap={1}>
              <Typography variant="h6" color="error">
                Error loading attachment
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Unable to load the file. Please try again.
              </Typography>
            </Box>
          ) : fileUrl ? (
            <iframe
              src={fileUrl}
              width="100%"
              height="100%"
              style={{ border: "none" }}
              title="KPI Attachment"
            />
          ) : (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              height="100%"
              flexDirection="column"
              gap={1}>
              <AttachFileIcon sx={{ fontSize: 64, color: "text.secondary" }} />
              <Typography variant="h6" color="text.secondary">
                {attachmentFilename}
              </Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DAFormApprovalDialog;
