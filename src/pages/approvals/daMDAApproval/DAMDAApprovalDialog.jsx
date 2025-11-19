import React, { useState, useRef } from "react";
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
import HelpIcon from "@mui/icons-material/Help";
import * as styles from "./DAMDAApprovalDialogStyles";

const DAMDAApprovalDialog = ({
  open,
  onClose,
  approval,
  onApprove,
  onReject,
  isLoading = false,
  isLoadingData = false,
}) => {
  const [comments, setComments] = useState("");
  const [actionType, setActionType] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const reasonRef = useRef(null);

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
      const reasonValue = reasonRef.current?.value.trim() || "";
      onReject({ reason: reasonValue, comments });
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
    if (reasonRef.current) {
      reasonRef.current.value = "";
    }
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

  const submission = approval?.submission || {};
  const formDetails = submission.form_details || {};
  const status = approval?.status?.toLowerCase() || "pending";
  const isProcessed = status === "approved" || status === "rejected";

  const fromDetails = formDetails.from || {};
  const toDetails = formDetails.to || {};

  const renderSkeletonField = () => (
    <Box sx={styles.skeletonFieldBoxStyles}>
      <Skeleton
        variant="text"
        width="40%"
        height={16}
        sx={styles.skeletonTextStyles}
      />
      <Skeleton variant="text" width="80%" height={20} />
    </Box>
  );

  const renderSkeletonRow = (fields = 3) => (
    <Box sx={styles.skeletonRowStyles}>
      {Array.from({ length: fields }).map((_, index) => (
        <React.Fragment key={index}>{renderSkeletonField()}</React.Fragment>
      ))}
    </Box>
  );

  const renderSkeletonSection = (title, rows = 2) => (
    <Box sx={styles.sectionBoxStyles}>
      <Skeleton variant="text" width="30%" height={24} sx={{ mb: 2 }} />
      {Array.from({ length: rows }).map((_, index) => (
        <React.Fragment key={index}>{renderSkeletonRow()}</React.Fragment>
      ))}
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
            <Typography variant="h6" sx={styles.titleTextStyles}>
              VIEW DA MDA REQUEST
            </Typography>
            <IconButton onClick={handleClose} size="small">
              <CloseIcon sx={styles.closeIconStyles} />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          {isLoadingData ? (
            <>
              {renderSkeletonSection("Employee Information", 6)}
              {renderSkeletonSection("Developmental Assignment Details", 4)}
            </>
          ) : (
            <>
              <Box sx={styles.sectionBoxStyles}>
                <Typography variant="subtitle2" sx={styles.sectionTitleStyles}>
                  Employee Information
                </Typography>

                <Box>
                  <Box sx={styles.fieldRowStyles}>
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

                  <Box sx={styles.fieldRowStyles}>
                    <Box sx={styles.fieldBoxStyles}>
                      <Typography
                        variant="caption"
                        sx={styles.fieldLabelStyles}>
                        BIRTH DATE
                      </Typography>
                      <Typography variant="body2" sx={styles.fieldValueStyles}>
                        {formatDate(formDetails.birth_date)}
                      </Typography>
                    </Box>
                    <Box sx={styles.fieldBoxStyles}>
                      <Typography
                        variant="caption"
                        sx={styles.fieldLabelStyles}>
                        BIRTH PLACE
                      </Typography>
                      <Typography variant="body2" sx={styles.fieldValueStyles}>
                        {formDetails.birth_place || "N/A"}
                      </Typography>
                    </Box>
                    <Box sx={styles.fieldBoxStyles}>
                      <Typography
                        variant="caption"
                        sx={styles.fieldLabelStyles}>
                        GENDER
                      </Typography>
                      <Typography variant="body2" sx={styles.fieldValueStyles}>
                        {formDetails.gender || "N/A"}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={styles.fieldRowStyles}>
                    <Box sx={styles.fieldBoxStyles}>
                      <Typography
                        variant="caption"
                        sx={styles.fieldLabelStyles}>
                        NATIONALITY
                      </Typography>
                      <Typography variant="body2" sx={styles.fieldValueStyles}>
                        {formDetails.nationality || "N/A"}
                      </Typography>
                    </Box>
                    <Box sx={styles.fieldBoxStyles}>
                      <Typography
                        variant="caption"
                        sx={styles.fieldLabelStyles}>
                        TIN NUMBER
                      </Typography>
                      <Typography variant="body2" sx={styles.fieldValueStyles}>
                        {formDetails.tin_number || "N/A"}
                      </Typography>
                    </Box>
                    <Box sx={styles.fieldBoxStyles}>
                      <Typography
                        variant="caption"
                        sx={styles.fieldLabelStyles}>
                        SSS NUMBER
                      </Typography>
                      <Typography variant="body2" sx={styles.fieldValueStyles}>
                        {formDetails.sss_number || "N/A"}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={styles.fieldRowStyles}>
                    <Box sx={styles.fieldBoxStyles}>
                      <Typography
                        variant="caption"
                        sx={styles.fieldLabelStyles}>
                        PAG-IBIG NUMBER
                      </Typography>
                      <Typography variant="body2" sx={styles.fieldValueStyles}>
                        {formDetails.pag_ibig_number || "N/A"}
                      </Typography>
                    </Box>
                    <Box sx={styles.fieldBoxStyles}>
                      <Typography
                        variant="caption"
                        sx={styles.fieldLabelStyles}>
                        PHILHEALTH NUMBER
                      </Typography>
                      <Typography variant="body2" sx={styles.fieldValueStyles}>
                        {formDetails.philhealth_number || "N/A"}
                      </Typography>
                    </Box>
                    <Box sx={styles.fieldBoxStyles} />
                  </Box>

                  <Box sx={styles.fieldRowStyles}>
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="caption"
                        sx={styles.fieldLabelStyles}>
                        ADDRESS
                      </Typography>
                      <Typography variant="body2" sx={styles.fieldValueStyles}>
                        {formDetails.address || "N/A"}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={styles.fieldRowLastStyles}>
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
                    <Box sx={styles.fieldBoxStyles} />
                    <Box sx={styles.fieldBoxStyles} />
                  </Box>
                </Box>
              </Box>

              <Box sx={styles.sectionBoxStyles}>
                <Typography variant="subtitle2" sx={styles.sectionTitleStyles}>
                  Developmental Assignment Details
                </Typography>

                <Box>
                  <Box sx={styles.fieldRowStyles}>
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
                    <Box sx={styles.fieldBoxStyles} />
                  </Box>

                  <Box sx={styles.fieldRowStyles}>
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="caption"
                        sx={styles.fieldLabelStyles}>
                        FROM POSITION
                      </Typography>
                      <Typography variant="body2" sx={styles.fieldValueStyles}>
                        {fromDetails.position || "N/A"}
                      </Typography>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="caption"
                        sx={styles.fieldLabelStyles}>
                        TO POSITION
                      </Typography>
                      <Typography variant="body2" sx={styles.fieldValueStyles}>
                        {toDetails.position || "N/A"}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={styles.fieldRowStyles}>
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="caption"
                        sx={styles.fieldLabelStyles}>
                        FROM DEPARTMENT
                      </Typography>
                      <Typography variant="body2" sx={styles.fieldValueStyles}>
                        {fromDetails.department || "N/A"}
                      </Typography>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="caption"
                        sx={styles.fieldLabelStyles}>
                        TO DEPARTMENT
                      </Typography>
                      <Typography variant="body2" sx={styles.fieldValueStyles}>
                        {toDetails.department || "N/A"}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={styles.fieldRowStyles}>
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="caption"
                        sx={styles.fieldLabelStyles}>
                        FROM SUB UNIT
                      </Typography>
                      <Typography variant="body2" sx={styles.fieldValueStyles}>
                        {fromDetails.sub_unit || "N/A"}
                      </Typography>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="caption"
                        sx={styles.fieldLabelStyles}>
                        TO SUB UNIT
                      </Typography>
                      <Typography variant="body2" sx={styles.fieldValueStyles}>
                        {toDetails.sub_unit || "N/A"}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={styles.fieldRowLastStyles}>
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="caption"
                        sx={styles.fieldLabelStyles}>
                        FROM JOB LEVEL
                      </Typography>
                      <Typography variant="body2" sx={styles.fieldValueStyles}>
                        {fromDetails.job_level || "N/A"}
                      </Typography>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="caption"
                        sx={styles.fieldLabelStyles}>
                        TO JOB LEVEL
                      </Typography>
                      <Typography variant="body2" sx={styles.fieldValueStyles}>
                        {toDetails.job_level || "N/A"}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>

              {isProcessed && (
                <Box sx={styles.processedBoxStyles}>
                  <Typography
                    variant="h6"
                    color="text.secondary"
                    sx={styles.processedTextStyles}>
                    This DA MDA request has already been {status}
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
              ? "Are you sure you want to Approve this DA MDA request?"
              : "Are you sure you want to Reject this DA MDA request?"}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={styles.confirmIdStyles}>
            DA MDA Request ID: {approval?.id || "N/A"}
          </Typography>

          {confirmAction === "reject" && (
            <TextField
              inputRef={reasonRef}
              label="Reason for Rejection"
              placeholder="Please provide a reason for rejecting this request..."
              defaultValue=""
              multiline
              rows={3}
              fullWidth
              required
              variant="outlined"
              sx={styles.textFieldStyles}
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
              disabled={isLoading}>
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
    </>
  );
};

export default DAMDAApprovalDialog;
