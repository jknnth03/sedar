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
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import HelpIcon from "@mui/icons-material/Help";
import * as styles from "../dataChangeApproval/DataChangeApprovalStyles";

const BiAnnualApprovalDialog = ({
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
      onApprove({ comments, submissionId: approval?.id });
    } else if (confirmAction === "reject") {
      onReject({
        reason: reason.trim(),
        comments,
        submissionId: approval?.id,
      });
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

  const approvalStatus = approval?.status?.toLowerCase() || "pending";
  const isProcessed =
    approvalStatus === "approved" || approvalStatus === "rejected";

  if (!approval && !isLoadingData) {
    return null;
  }

  const submission = approval?.submission || {};
  const formDetails = submission?.form_details || {};
  const kpis = formDetails?.kpis || [];
  const discussions = formDetails?.discussions || {};
  const competencyAssessment = formDetails?.competency_assessment || null;
  const competencyTemplate = competencyAssessment?.template || null;

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

  const renderKPIsTable = () => {
    if (!kpis || kpis.length === 0) {
      return (
        <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
          No KPIs available
        </Typography>
      );
    }

    return (
      <TableContainer component={Paper} variant="outlined" sx={{ mt: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
              <TableCell sx={{ fontWeight: 600 }}>Objective</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Deliverable</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="right">
                Distribution %
              </TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="right">
                Target %
              </TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="right">
                Actual
              </TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="right">
                Score
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {kpis.map((kpi) => (
              <TableRow key={kpi.id}>
                <TableCell>{kpi.objective_name || "-"}</TableCell>
                <TableCell sx={{ maxWidth: 300 }}>
                  {kpi.deliverable || "-"}
                </TableCell>
                <TableCell align="right">
                  {kpi.distribution_percentage
                    ? `${parseFloat(kpi.distribution_percentage).toFixed(2)}%`
                    : "-"}
                </TableCell>
                <TableCell align="right">
                  {kpi.target_percentage
                    ? `${parseFloat(kpi.target_percentage).toFixed(2)}%`
                    : "-"}
                </TableCell>
                <TableCell align="right">
                  {kpi.actual_performance || "-"}
                </TableCell>
                <TableCell align="right">
                  {kpi.score ? parseFloat(kpi.score).toFixed(2) : "0.00"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const renderCompetencyAssessment = () => {
    if (!competencyAssessment || !competencyTemplate) {
      return (
        <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
          No competency assessment available
        </Typography>
      );
    }

    const ratingScale = competencyTemplate?.rating_scale || [];
    const sections = competencyTemplate?.sections || [];

    const getRatingLabel = (ratingId) => {
      const found = ratingScale.find((r) => r.id === ratingId);
      return found ? found.label : null;
    };

    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
          {competencyTemplate?.name || "Competency Assessment"}
        </Typography>

        {sections.map((section, sectionIndex) => (
          <Accordion key={section.id} defaultExpanded={sectionIndex === 0}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {section.title}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box>
                {section.items?.map((item) => (
                  <Box key={item.id} sx={{ mb: 2 }}>
                    {item.is_header && (
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600, mb: 1, color: "#333" }}>
                        {item.text}
                      </Typography>
                    )}
                    {item.children?.map((child) => {
                      const ratingLabel = child.rating_id
                        ? getRatingLabel(child.rating_id)
                        : null;

                      return (
                        <Box
                          key={child.id}
                          sx={{
                            pl: 2,
                            py: 0.5,
                            borderLeft: "2px solid #e0e0e0",
                            ml: 1,
                            mb: 1,
                          }}>
                          <Typography variant="body2" color="text.secondary">
                            {child.text}
                          </Typography>
                          {ratingLabel ? (
                            <Chip
                              label={ratingLabel}
                              size="small"
                              sx={{ mt: 0.5, fontSize: "0.7rem" }}
                            />
                          ) : (
                            <Chip
                              label="Not Rated"
                              size="small"
                              variant="outlined"
                              sx={{
                                mt: 0.5,
                                fontSize: "0.7rem",
                                color: "#999",
                              }}
                            />
                          )}
                          {child.comments && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ display: "block", mt: 0.5 }}>
                              {child.comments}
                            </Typography>
                          )}
                        </Box>
                      );
                    })}
                  </Box>
                ))}
              </Box>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    );
  };

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
            <Box sx={styles.titleInnerBoxStyles}>
              <Typography variant="h6" sx={styles.titleTextStyles}>
                VIEW PERFORMANCE EVALUATION REQUEST
              </Typography>
            </Box>
            <IconButton onClick={handleClose} size="small">
              <CloseIcon sx={styles.closeIconStyles} />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ maxHeight: "70vh", overflowY: "auto" }}>
          {isLoadingData ? (
            <>
              {renderSkeletonSection()}
              {renderSkeletonSection()}
            </>
          ) : (
            <>
              <Box sx={styles.sectionBoxStyles}>
                <Typography variant="subtitle2" sx={styles.sectionTitleStyles}>
                  Request Information
                </Typography>

                <Box>
                  <Box sx={styles.fieldContainerStyles}>
                    <Box sx={styles.fieldBoxStyles}>
                      <Typography
                        variant="caption"
                        sx={styles.fieldLabelStyles}>
                        REFERENCE NUMBER
                      </Typography>
                      <Typography variant="body2" sx={styles.fieldValueStyles}>
                        {formDetails?.reference_number || "N/A"}
                      </Typography>
                    </Box>
                    <Box sx={styles.fieldBoxStyles}>
                      <Typography
                        variant="caption"
                        sx={styles.fieldLabelStyles}>
                        EMPLOYEE NAME
                      </Typography>
                      <Typography variant="body2" sx={styles.fieldValueStyles}>
                        {formDetails?.employee_name || "N/A"}
                      </Typography>
                    </Box>
                    <Box sx={styles.fieldBoxStyles}>
                      <Typography
                        variant="caption"
                        sx={styles.fieldLabelStyles}>
                        EMPLOYEE NUMBER
                      </Typography>
                      <Typography variant="body2" sx={styles.fieldValueStyles}>
                        {formDetails?.employee_number || "N/A"}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={styles.lastFieldContainerStyles}>
                    <Box sx={styles.fieldBoxStyles}>
                      <Typography
                        variant="caption"
                        sx={styles.fieldLabelStyles}>
                        POSITION
                      </Typography>
                      <Typography variant="body2" sx={styles.fieldValueStyles}>
                        {formDetails?.position_title || "N/A"}
                      </Typography>
                    </Box>
                    <Box sx={styles.fieldBoxStyles}>
                      <Typography
                        variant="caption"
                        sx={styles.fieldLabelStyles}>
                        DEPARTMENT
                      </Typography>
                      <Typography variant="body2" sx={styles.fieldValueStyles}>
                        {formDetails?.department || "N/A"}
                      </Typography>
                    </Box>
                    <Box sx={styles.fieldBoxStyles}>
                      <Typography
                        variant="caption"
                        sx={styles.fieldLabelStyles}>
                        SUB UNIT
                      </Typography>
                      <Typography variant="body2" sx={styles.fieldValueStyles}>
                        {formDetails?.sub_unit || "N/A"}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={styles.lastFieldContainerStyles}>
                    <Box sx={styles.fieldBoxStyles}>
                      <Typography
                        variant="caption"
                        sx={styles.fieldLabelStyles}>
                        EVALUATION YEAR
                      </Typography>
                      <Typography variant="body2" sx={styles.fieldValueStyles}>
                        {formDetails?.evaluation_year || "N/A"}
                      </Typography>
                    </Box>
                    <Box sx={styles.fieldBoxStyles}>
                      <Typography
                        variant="caption"
                        sx={styles.fieldLabelStyles}>
                        SUBMITTED BY
                      </Typography>
                      <Typography variant="body2" sx={styles.fieldValueStyles}>
                        {submission?.requested_by || "N/A"}
                      </Typography>
                    </Box>
                    <Box sx={styles.fieldBoxStyles}>
                      <Typography
                        variant="caption"
                        sx={styles.fieldLabelStyles}>
                        DATE SUBMITTED
                      </Typography>
                      <Typography variant="body2" sx={styles.fieldValueStyles}>
                        {formatDate(submission?.created_at)}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Box sx={styles.sectionBoxStyles}>
                <Typography variant="subtitle2" sx={styles.sectionTitleStyles}>
                  Key Performance Indicators (KPIs)
                </Typography>
                {renderKPIsTable()}
              </Box>

              <Divider sx={{ my: 3 }} />

              <Box sx={styles.sectionBoxStyles}>
                <Typography variant="subtitle2" sx={styles.sectionTitleStyles}>
                  Performance Discussions
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Box sx={{ mb: 2 }}>
                    <Typography
                      variant="caption"
                      sx={{ ...styles.fieldLabelStyles, display: "block" }}>
                      STRENGTHS
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      {discussions?.strengths_discussion || "N/A"}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography
                      variant="caption"
                      sx={{ ...styles.fieldLabelStyles, display: "block" }}>
                      DEVELOPMENT AREAS
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      {discussions?.development_discussion || "N/A"}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{ ...styles.fieldLabelStyles, display: "block" }}>
                      LEARNING NEEDS
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      {discussions?.learning_needs_discussion || "N/A"}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Box sx={styles.sectionBoxStyles}>
                <Typography variant="subtitle2" sx={styles.sectionTitleStyles}>
                  Competency Assessment
                </Typography>
                {renderCompetencyAssessment()}
              </Box>

              {isProcessed && (
                <Box sx={styles.processedBoxStyles}>
                  <Typography
                    variant="h6"
                    color="text.secondary"
                    sx={styles.processedTextStyles}>
                    This performance evaluation request has already been{" "}
                    {approvalStatus}
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
              ? "Are you sure you want to Approve this performance evaluation request?"
              : "Are you sure you want to Reject this performance evaluation request?"}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={styles.confirmIdStyles}>
            Reference Number: {formDetails?.reference_number || "N/A"}
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

export default BiAnnualApprovalDialog;
