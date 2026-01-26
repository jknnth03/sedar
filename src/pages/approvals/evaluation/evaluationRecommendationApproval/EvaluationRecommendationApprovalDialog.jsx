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
  Divider,
  Chip,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import CloseIcon from "@mui/icons-material/Close";
import HelpIcon from "@mui/icons-material/Help";
import * as styles from "../../mda/daMDAApproval/DAMDAApprovalDialogStyles";

const EvaluationRecommendationApprovalDialog = ({
  open,
  onClose,
  approval,
  onApprove = () => {},
  onReject = () => {},
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

  const formDetails = approval?.form_details || {};
  const objectives = formDetails?.objectives || [];
  const recommendation = formDetails?.recommendation || {};
  const approvalHistory = approval?.approval_history || [];
  const activityLog = approval?.activity_log || [];
  const status = approval?.status?.toLowerCase() || "pending";
  const isProcessed = status === "approved" || status === "rejected";

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
        maxWidth="lg"
        fullWidth
        PaperProps={{ sx: styles.dialogPaperStyles }}>
        <DialogTitle sx={styles.dialogTitleStyles}>
          <Box sx={styles.titleBoxStyles}>
            <Typography variant="h6" sx={styles.titleTextStyles}>
              VIEW EVALUATION RECOMMENDATION REQUEST
            </Typography>
            <IconButton onClick={handleClose} size="small">
              <CloseIcon sx={styles.closeIconStyles} />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          {isLoadingData ? (
            <>
              {renderSkeletonSection("Employee Information", 3)}
              {renderSkeletonSection("Probation Period", 2)}
              {renderSkeletonSection("Performance Objectives", 3)}
              {renderSkeletonSection("Recommendation", 2)}
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
                        REFERENCE NUMBER
                      </Typography>
                      <Typography variant="body2" sx={styles.fieldValueStyles}>
                        {formDetails.reference_number || "N/A"}
                      </Typography>
                    </Box>
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
                  </Box>

                  <Box sx={styles.fieldRowStyles}>
                    <Box sx={styles.fieldBoxStyles}>
                      <Typography
                        variant="caption"
                        sx={styles.fieldLabelStyles}>
                        POSITION TITLE
                      </Typography>
                      <Typography variant="body2" sx={styles.fieldValueStyles}>
                        {formDetails.position_title || "N/A"}
                      </Typography>
                    </Box>
                    <Box sx={styles.fieldBoxStyles}>
                      <Typography
                        variant="caption"
                        sx={styles.fieldLabelStyles}>
                        DEPARTMENT
                      </Typography>
                      <Typography variant="body2" sx={styles.fieldValueStyles}>
                        {formDetails.department || "N/A"}
                      </Typography>
                    </Box>
                    <Box sx={styles.fieldBoxStyles}>
                      <Typography
                        variant="caption"
                        sx={styles.fieldLabelStyles}>
                        SUB UNIT
                      </Typography>
                      <Typography variant="body2" sx={styles.fieldValueStyles}>
                        {formDetails.sub_unit || "N/A"}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>

              <Box sx={styles.sectionBoxStyles}>
                <Typography variant="subtitle2" sx={styles.sectionTitleStyles}>
                  Probation Period
                </Typography>

                <Box>
                  <Box sx={styles.fieldRowStyles}>
                    <Box sx={styles.fieldBoxStyles}>
                      <Typography
                        variant="caption"
                        sx={styles.fieldLabelStyles}>
                        START DATE
                      </Typography>
                      <Typography variant="body2" sx={styles.fieldValueStyles}>
                        {formatDate(formDetails.probation_start_date)}
                      </Typography>
                    </Box>
                    <Box sx={styles.fieldBoxStyles}>
                      <Typography
                        variant="caption"
                        sx={styles.fieldLabelStyles}>
                        END DATE
                      </Typography>
                      <Typography variant="body2" sx={styles.fieldValueStyles}>
                        {formatDate(formDetails.probation_end_date)}
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
                  Performance Objectives
                </Typography>

                {objectives.length > 0 ? (
                  <Box sx={{ mt: 2 }}>
                    {objectives.map((objective, index) => (
                      <Box
                        key={objective.id}
                        sx={{
                          mb: 3,
                          p: 2,
                          border: "1px solid #e0e0e0",
                          borderRadius: "8px",
                          backgroundColor: "#fafafa",
                        }}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            mb: 2,
                          }}>
                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontWeight: 700,
                              color: "rgb(33, 61, 112)",
                              fontSize: "14px",
                            }}>
                            Objective {index + 1}: {objective.objective_name}
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

                        <Box sx={{ mb: 1.5 }}>
                          <Typography
                            variant="caption"
                            sx={{
                              color: "#666",
                              fontWeight: 600,
                              fontSize: "11px",
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                            }}>
                            DELIVERABLE
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              mt: 0.5,
                              color: "#333",
                              fontSize: "13px",
                              lineHeight: 1.6,
                            }}>
                            {objective.deliverable || "N/A"}
                          </Typography>
                        </Box>

                        <Box
                          sx={{
                            display: "grid",
                            gridTemplateColumns: "repeat(3, 1fr)",
                            gap: 2,
                            mt: 2,
                          }}>
                          <Box>
                            <Typography
                              variant="caption"
                              sx={{
                                color: "#666",
                                fontWeight: 600,
                                fontSize: "11px",
                                textTransform: "uppercase",
                                letterSpacing: "0.5px",
                              }}>
                              TARGET
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                mt: 0.5,
                                color: "#333",
                                fontSize: "14px",
                                fontWeight: 600,
                              }}>
                              {objective.target_percentage}%
                            </Typography>
                          </Box>
                          <Box>
                            <Typography
                              variant="caption"
                              sx={{
                                color: "#666",
                                fontWeight: 600,
                                fontSize: "11px",
                                textTransform: "uppercase",
                                letterSpacing: "0.5px",
                              }}>
                              ACTUAL PERFORMANCE
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                mt: 0.5,
                                color: "#333",
                                fontSize: "14px",
                                fontWeight: 600,
                              }}>
                              {objective.actual_performance || "N/A"}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography
                              variant="caption"
                              sx={{
                                color: "#666",
                                fontWeight: 600,
                                fontSize: "11px",
                                textTransform: "uppercase",
                                letterSpacing: "0.5px",
                              }}>
                              REMARKS
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                mt: 0.5,
                                color: "#333",
                                fontSize: "13px",
                              }}>
                              {objective.remarks || "N/A"}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Typography
                    variant="body2"
                    sx={{ color: "#666", fontStyle: "italic", mt: 2 }}>
                    No objectives available
                  </Typography>
                )}
              </Box>

              <Box sx={styles.sectionBoxStyles}>
                <Typography variant="subtitle2" sx={styles.sectionTitleStyles}>
                  Recommendation
                </Typography>

                <Box>
                  <Box sx={styles.fieldRowStyles}>
                    <Box sx={styles.fieldBoxStyles}>
                      <Typography
                        variant="caption"
                        sx={styles.fieldLabelStyles}>
                        FINAL RECOMMENDATION
                      </Typography>
                      <Typography variant="body2" sx={styles.fieldValueStyles}>
                        {recommendation.final_recommendation || "N/A"}
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
                    This Evaluation Recommendation request has already been{" "}
                    {status}
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
              ? "Are you sure you want to Approve this Evaluation Recommendation request?"
              : "Are you sure you want to Reject this Evaluation Recommendation request?"}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={styles.confirmIdStyles}>
            Evaluation Recommendation Request ID: {approval?.id || "N/A"}
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

export default EvaluationRecommendationApprovalDialog;
