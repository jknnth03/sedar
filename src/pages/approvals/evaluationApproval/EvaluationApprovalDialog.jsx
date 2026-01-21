import React, { useState } from "react";
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
import * as styles from "../daform/DAFormApprovalStyles";

const EvaluationApprovalDialog = ({
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

  const formDetails = approval?.form_details || {};
  const objectives = formDetails.objectives || [];
  const recommendation = formDetails.recommendation || {};
  const approvalHistory = approval?.approval_history || [];
  const status = approval?.status?.toLowerCase() || "pending";
  const isProcessed = status === "approved" || status === "rejected";

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
                VIEW EVALUATION FORM REQUEST
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
                  <Box sx={styles.fieldContainerStyles}>
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
                                {objective.target_percentage || "N/A"}%
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
                                {objective.actual_performance || "N/A"}
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
                                Rating
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{
                                  color: "#333",
                                  fontSize: "13px",
                                  fontWeight: 600,
                                  mt: 0.5,
                                }}>
                                {objective.rating || "N/A"}
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

              {(recommendation.final_recommendation ||
                recommendation.recommendation_remarks) && (
                <Box sx={styles.sectionBoxStyles}>
                  <Typography
                    variant="subtitle2"
                    sx={styles.sectionTitleStyles}>
                    Recommendation
                  </Typography>

                  <Box>
                    <Box sx={styles.fieldContainerStyles}>
                      <Box sx={styles.fieldBoxStyles}>
                        <Typography
                          variant="caption"
                          sx={styles.fieldLabelStyles}>
                          FINAL RECOMMENDATION
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={styles.fieldValueStyles}>
                          {recommendation.final_recommendation || "N/A"}
                        </Typography>
                      </Box>
                      <Box sx={styles.fieldBoxStyles}>
                        <Typography
                          variant="caption"
                          sx={styles.fieldLabelStyles}>
                          EXTENSION END DATE
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={styles.fieldValueStyles}>
                          {formatDate(recommendation.extension_end_date)}
                        </Typography>
                      </Box>
                      <Box sx={styles.fieldBoxStyles} />
                    </Box>

                    {recommendation.recommendation_remarks && (
                      <Box sx={styles.lastFieldContainerStyles}>
                        <Box sx={{ ...styles.fieldBoxStyles, flex: 1 }}>
                          <Typography
                            variant="caption"
                            sx={styles.fieldLabelStyles}>
                            REMARKS
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={styles.fieldValueStyles}>
                            {recommendation.recommendation_remarks}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                  </Box>
                </Box>
              )}

              {isProcessed && (
                <Box sx={styles.processedBoxStyles}>
                  <Typography
                    variant="h6"
                    color="text.secondary"
                    sx={styles.processedTextStyles}>
                    This Evaluation Form request has already been {status}
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
              ? "Are you sure you want to Approve this Evaluation Form request?"
              : "Are you sure you want to Reject this Evaluation Form request?"}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={styles.confirmIdStyles}>
            Evaluation Form Request ID: {approval?.id || "N/A"}
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
    </>
  );
};

export default EvaluationApprovalDialog;
