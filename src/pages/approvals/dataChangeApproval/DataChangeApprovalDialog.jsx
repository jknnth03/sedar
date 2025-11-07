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
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import CloseIcon from "@mui/icons-material/Close";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import HelpIcon from "@mui/icons-material/Help";
import { useGetDataChangeAttachmentQuery } from "../../../features/api/forms/datachangeApi";
import * as styles from "./DataChangeApprovalStyles";

const DataChangeApprovalDialog = ({
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
  const [fileUrl, setFileUrl] = useState(null);
  const [attachmentParams, setAttachmentParams] = useState(null);

  const {
    data: attachmentData,
    isLoading: isLoadingAttachment,
    error: attachmentError,
  } = useGetDataChangeAttachmentQuery(
    attachmentParams || { submissionId: null, attachmentId: null },
    {
      skip: !fileViewerOpen || !attachmentParams,
    }
  );

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

  const handleFileViewerOpen = (attachmentId) => {
    const submissionData = approval?.submission || approval;
    const formSubmissionId = submissionData?.id;

    if (formSubmissionId && attachmentId) {
      setAttachmentParams({
        submissionId: formSubmissionId,
        attachmentId: attachmentId,
      });
      setFileViewerOpen(true);
    }
  };

  const handleFileViewerClose = () => {
    setFileViewerOpen(false);
    setFileUrl(null);
    setTimeout(() => {
      setAttachmentParams(null);
    }, 100);
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

  const formatCurrency = (amount) => {
    if (!amount) return "N/A";
    return `₱${parseFloat(amount).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const getCurrentAttachmentFilename = () => {
    if (!attachmentParams) return "attachment.pdf";
    const submissionData = approval?.submission || approval;
    const attachments = submissionData?.form_details?.attachments || [];
    const currentAttachment = attachments.find(
      (att) => att.id === attachmentParams.attachmentId
    );
    return currentAttachment?.original_filename || "attachment.pdf";
  };

  useEffect(() => {
    if (attachmentData && attachmentData instanceof Blob && fileViewerOpen) {
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
      }
      const url = URL.createObjectURL(attachmentData);
      setFileUrl(url);
    }
  }, [attachmentData, fileViewerOpen]);

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

  const submission = approval?.submission || {};
  const formDetails = submission.form_details || {};
  const fromPosition = formDetails.from_position || {};
  const toPosition = formDetails.to_position || {};
  const attachments = formDetails?.attachments || [];
  const status = approval?.status?.toLowerCase() || "pending";
  const isProcessed = status === "approved" || status === "rejected";
  const hasAttachments = attachments.length > 0;

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
                VIEW DATA CHANGE REQUEST
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
                        EMPLOYEE CODE
                      </Typography>
                      <Typography variant="body2" sx={styles.fieldValueStyles}>
                        {formDetails.employee_code || "N/A"}
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
                        DEPARTMENT
                      </Typography>
                      <Typography variant="body2" sx={styles.fieldValueStyles}>
                        {fromPosition.charging?.department_name || "N/A"}
                      </Typography>
                    </Box>
                    <Box sx={styles.fieldBoxStyles}>
                      <Typography
                        variant="caption"
                        sx={styles.fieldLabelStyles}>
                        SUB UNIT
                      </Typography>
                      <Typography variant="body2" sx={styles.fieldValueStyles}>
                        {fromPosition.charging?.sub_unit_name || "N/A"}
                      </Typography>
                    </Box>
                    <Box sx={styles.fieldBoxStyles}>
                      <Typography
                        variant="caption"
                        sx={styles.fieldLabelStyles}>
                        SCHEDULE
                      </Typography>
                      <Typography variant="body2" sx={styles.fieldValueStyles}>
                        {fromPosition.schedule?.name || "N/A"}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>

              <Box sx={styles.sectionBoxStyles}>
                <Typography variant="subtitle2" sx={styles.sectionTitleStyles}>
                  Movement Details
                </Typography>

                <Box>
                  <Box sx={styles.fieldContainerStyles}>
                    <Box sx={styles.fieldBoxStyles}>
                      <Typography
                        variant="caption"
                        sx={styles.fieldLabelStyles}>
                        MOVEMENT TYPE
                      </Typography>
                      <Typography variant="body2" sx={styles.fieldValueStyles}>
                        {formDetails.movement_type || "N/A"}
                      </Typography>
                    </Box>
                    <Box sx={styles.fieldBoxStyles}>
                      <Typography
                        variant="caption"
                        sx={styles.fieldLabelStyles}>
                        EFFECTIVE DATE
                      </Typography>
                      <Typography variant="body2" sx={styles.fieldValueStyles}>
                        {formatDate(formDetails.effective_date)}
                      </Typography>
                    </Box>
                    <Box sx={styles.fieldBoxStyles}>
                      <Typography
                        variant="caption"
                        sx={styles.fieldLabelStyles}>
                        REQUESTED BY
                      </Typography>
                      <Typography variant="body2" sx={styles.fieldValueStyles}>
                        {submission.requested_by || "N/A"}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={styles.fieldContainerStyles}>
                    <Box sx={styles.fieldBoxStyles}>
                      <Typography
                        variant="caption"
                        sx={styles.fieldLabelStyles}>
                        FROM POSITION
                      </Typography>
                      <Typography variant="body2" sx={styles.fieldValueStyles}>
                        {fromPosition.title?.name || "N/A"}
                      </Typography>
                    </Box>
                    <Box sx={styles.fieldBoxStyles}>
                      <Typography
                        variant="caption"
                        sx={styles.fieldLabelStyles}>
                        TO POSITION
                      </Typography>
                      <Typography variant="body2" sx={styles.fieldValueStyles}>
                        {toPosition.title?.name || "N/A"}
                      </Typography>
                    </Box>
                    <Box sx={styles.fieldBoxStyles}>
                      <Typography
                        variant="caption"
                        sx={styles.fieldLabelStyles}>
                        PAY FREQUENCY
                      </Typography>
                      <Typography variant="body2" sx={styles.fieldValueStyles}>
                        {toPosition.pay_frequency || "N/A"}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={styles.lastFieldContainerStyles}>
                    <Box sx={styles.fieldBoxStyles}>
                      <Typography
                        variant="caption"
                        sx={styles.fieldLabelStyles}>
                        FROM JOB RATE
                      </Typography>
                      <Typography variant="body2" sx={styles.fieldValueStyles}>
                        {formatCurrency(formDetails.from_job_rate)}
                      </Typography>
                    </Box>
                    <Box sx={styles.fieldBoxStyles}>
                      <Typography
                        variant="caption"
                        sx={styles.fieldLabelStyles}>
                        TO JOB RATE
                      </Typography>
                      <Typography variant="body2" sx={styles.fieldValueStyles}>
                        {formatCurrency(formDetails.to_job_rate)}
                      </Typography>
                    </Box>
                    <Box sx={styles.fieldBoxStyles} />
                  </Box>
                </Box>
              </Box>

              {hasAttachments && (
                <Box sx={styles.sectionBoxStyles}>
                  <Typography
                    variant="subtitle2"
                    sx={styles.attachmentSectionTitleStyles}>
                    Supporting Documents ({attachments.length})
                  </Typography>

                  <Box sx={styles.attachmentContainerStyles}>
                    {attachments.map((attachment) => (
                      <Box
                        key={attachment.id}
                        sx={styles.attachmentItemStyles}
                        onClick={() => handleFileViewerOpen(attachment.id)}>
                        <Box sx={styles.attachmentInnerBoxStyles}>
                          <AttachFileIcon sx={styles.attachmentIconStyles} />
                          <Typography sx={styles.attachmentFilenameStyles}>
                            {attachment.original_filename}
                          </Typography>
                        </Box>
                        <Typography
                          variant="caption"
                          sx={styles.attachmentHintStyles}>
                          Click to view file
                        </Typography>
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
                    This data change request has already been {status}
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
              ? "Are you sure you want to Approve this data change request?"
              : "Are you sure you want to Reject this data change request?"}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={styles.confirmIdStyles}>
            Data Change Request ID: {approval?.id || "N/A"}
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
        onClose={handleFileViewerClose}
        maxWidth={false}
        fullWidth={false}
        PaperProps={{ sx: styles.fileViewerPaperStyles }}>
        <DialogTitle sx={styles.fileViewerTitleStyles}>
          <Typography variant="h6" sx={styles.fileViewerTitleTextStyles}>
            Attachment - {getCurrentAttachmentFilename()}
          </Typography>
          <IconButton onClick={handleFileViewerClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={styles.fileViewerContentStyles}>
          {isLoadingAttachment ? (
            <Box sx={styles.loadingBoxStyles}>
              <CircularProgress size={48} />
              <Typography variant="body1" sx={styles.loadingTextStyles}>
                Loading attachment...
              </Typography>
            </Box>
          ) : attachmentError ? (
            <Box sx={styles.loadingBoxStyles}>
              <Typography
                variant="h6"
                gutterBottom
                sx={styles.errorTitleStyles}>
                Error loading attachment
              </Typography>
              <Typography variant="body2" sx={styles.errorMessageStyles}>
                Unable to load the attachment. Please try again.
              </Typography>
            </Box>
          ) : fileUrl ? (
            <Box sx={styles.fileViewerBoxStyles}>
              <iframe
                src={fileUrl}
                width="100%"
                height="100%"
                style={styles.iframeStyles}
                title="File Attachment"
              />
            </Box>
          ) : (
            <Box sx={styles.noPreviewBoxStyles}>
              <Box textAlign="center">
                <AttachFileIcon sx={styles.noPreviewIconStyles} />
                <Typography
                  variant="h6"
                  color="text.secondary"
                  sx={styles.noPreviewTitleStyles}>
                  {getCurrentAttachmentFilename()}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={styles.noPreviewMessageStyles}>
                  File preview not available
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DataChangeApprovalDialog;
