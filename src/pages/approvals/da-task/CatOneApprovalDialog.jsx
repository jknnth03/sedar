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
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import CloseIcon from "@mui/icons-material/Close";
import HelpIcon from "@mui/icons-material/Help";

const CatOneApprovalDialog = ({
  open,
  onClose,
  approval,
  onApprove,
  onReturn,
  isLoading = false,
  isLoadingData = false,
}) => {
  const [comments, setComments] = useState("");
  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  const handleApprove = () => {
    setActionType("approve");
    setConfirmAction("approve");
    setConfirmOpen(true);
  };

  const handleReturn = () => {
    setActionType("return");
    setConfirmAction("return");
    setConfirmOpen(true);
  };

  const handleActionConfirm = async () => {
    if (confirmAction === "approve") {
      setConfirmOpen(false);
      await onApprove({ comments });
      handleReset();
    } else if (confirmAction === "return") {
      const trimmedReason = reason.trim();
      if (!trimmedReason) {
        setReasonError(true);
        return;
      }
      setConfirmOpen(false);
      await onReturn({ reason: trimmedReason });
      handleReset();
    }
  };

  const handleClose = () => {
    onClose();
    handleReset();
  };

  const handleReset = () => {
    setComments("");
    setReason("");
    setReasonError(false);
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

  const getRatingColor = (ratingId, ratingScale) => {
    if (!ratingId || !ratingScale) return "#9e9e9e";
    const rating = ratingScale.find((r) => r.id === ratingId);
    if (!rating) return "#9e9e9e";
    const label = rating.label.toLowerCase();
    if (label.includes("exceeds")) return "#28a745";
    if (label.includes("meets")) return "#ffc107";
    if (label.includes("needs")) return "#dc3545";
    return "#9e9e9e";
  };

  const status = approval?.status || "";
  const isProcessed = status === "KICKOFF_COMPLETE";

  const template = approval?.template || {};
  const ratingScale = template.rating_scale || [];
  const sections = template.sections || [];
  const da = approval?.developmental_assignment || {};

  const renderSkeletonField = () => (
    <Box sx={{ flex: 1, minHeight: "60px" }}>
      <Skeleton variant="text" width="40%" height={16} sx={{ mb: 0.5 }} />
      <Skeleton variant="text" width="80%" height={20} />
    </Box>
  );

  const renderSkeletonRow = (fields = 3) => (
    <Box sx={{ display: "flex", gap: 6, mb: 1.5 }}>
      {Array.from({ length: fields }).map((_, index) => (
        <React.Fragment key={index}>{renderSkeletonField()}</React.Fragment>
      ))}
    </Box>
  );

  const renderSkeletonSection = (title, rows = 2) => (
    <Box sx={{ backgroundColor: "#ffffff", p: 3, mb: 0 }}>
      <Skeleton variant="text" width="30%" height={24} sx={{ mb: 2 }} />
      {Array.from({ length: rows }).map((_, index) => (
        <React.Fragment key={index}>{renderSkeletonRow()}</React.Fragment>
      ))}
    </Box>
  );

  const InfoField = ({ label, value }) => (
    <Box sx={{ flex: 1 }}>
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
        sx={{ color: "#000000ff", fontSize: "13px", fontWeight: 700 }}>
        {value || "N/A"}
      </Typography>
    </Box>
  );

  const renderItem = (item, depth = 0) => {
    const rating = ratingScale.find((r) => r.id === item.rating_id);

    return (
      <Box key={item.id} sx={{ mb: 0.5, ml: depth * 3 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
          }}>
          <Typography
            variant="body2"
            sx={{
              color: "#000000",
              fontSize: "13px",
              fontWeight: item.is_header ? 600 : 400,
              lineHeight: 1.8,
              flex: 1,
            }}>
            {item.text}
          </Typography>
          {item.is_rateable && rating && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.75,
                flexShrink: 0,
              }}>
              <Typography
                variant="body2"
                sx={{
                  color: "#000000",
                  fontSize: "11px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                }}>
                {rating.label}
              </Typography>
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  backgroundColor: getRatingColor(item.rating_id, ratingScale),
                  borderRadius: "2px",
                }}
              />
            </Box>
          )}
        </Box>
        {item.children && item.children.length > 0 && (
          <Box sx={{ mt: 0.5 }}>
            {item.children.map((child) => renderItem(child, depth + 1))}
          </Box>
        )}
      </Box>
    );
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          },
        }}>
        <DialogTitle sx={{ padding: "14px 18px 10px 18px" }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              📋
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  color: "rgb(33, 61, 112)",
                  fontSize: "16px",
                }}>
                VIEW CAT 1 REQUEST
              </Typography>
            </Box>
            <IconButton onClick={handleClose} size="small">
              <CloseIcon sx={{ color: "rgb(33, 61, 112)" }} />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ px: 0, pt: 0 }}>
          {isLoadingData ? (
            <Box sx={{ px: 4 }}>
              {renderSkeletonSection("Employee Information", 2)}
              {renderSkeletonSection("Assessment Details", 3)}
            </Box>
          ) : (
            <>
              <Box sx={{ backgroundColor: "#ffffff", px: 4, pt: 2, pb: 2 }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 600,
                    color: "rgb(33, 61, 112)",
                    mb: 1.5,
                    fontSize: "14px",
                  }}>
                  Employee Information
                </Typography>

                <Box sx={{ display: "flex", gap: 2, mb: 1.5 }}>
                  <InfoField
                    label="EMPLOYEE NAME"
                    value={approval?.employee_name}
                  />
                  <InfoField
                    label="SUPERIOR NAME"
                    value={approval?.superior_name}
                  />
                  <InfoField label="DEPARTMENT" value={approval?.department} />
                </Box>

                <Box sx={{ display: "flex", gap: 2, mb: 1.5 }}>
                  <InfoField
                    label="DATE ASSESSED"
                    value={formatDate(approval?.date_assessed)}
                  />
                  <InfoField
                    label="FROM POSITION"
                    value={approval?.from_position_title}
                  />
                  <InfoField
                    label="TO POSITION"
                    value={approval?.to_position_title}
                  />
                </Box>

                <Box sx={{ display: "flex", gap: 2, mb: 1.5 }}>
                  <InfoField label="TEMPLATE NAME" value={template?.name} />
                  <InfoField
                    label="DA REFERENCE NO."
                    value={da?.reference_number}
                  />
                  <InfoField label="DA STATUS" value={da?.status} />
                </Box>

                <Box sx={{ display: "flex", gap: 2, mb: 0.5 }}>
                  <InfoField
                    label="DA START DATE"
                    value={formatDate(da?.start_date)}
                  />
                  <InfoField
                    label="DA END DATE"
                    value={formatDate(da?.end_date)}
                  />
                  <Box sx={{ flex: 1 }} />
                </Box>
              </Box>

              {sections.length > 0 && (
                <Box sx={{ backgroundColor: "#ffffff", px: 4, pt: 2, pb: 3 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 600,
                      color: "rgb(33, 61, 112)",
                      mb: 1.5,
                      fontSize: "14px",
                    }}>
                    Assessment Details
                  </Typography>

                  {ratingScale.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                        {ratingScale.map((rating) => (
                          <Chip
                            key={rating.id}
                            label={rating.label.toUpperCase()}
                            size="small"
                            sx={{
                              backgroundColor: getRatingColor(
                                rating.id,
                                ratingScale,
                              ),
                              color: "white",
                              fontWeight: 600,
                              fontSize: "10px",
                              padding: "2px",
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}

                  {sections.map((section) => (
                    <Box key={section.id} sx={{ mb: 3 }}>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 600,
                          color: "rgb(33, 61, 112)",
                          mb: 2,
                          fontSize: "13px",
                        }}>
                        {section.title}
                      </Typography>
                      {section.items.map((item) => renderItem(item))}
                    </Box>
                  ))}
                </Box>
              )}

              {isProcessed && (
                <Box
                  sx={{
                    textAlign: "center",
                    py: 2,
                    backgroundColor: "#ffffff",
                    px: 4,
                  }}>
                  <Typography
                    variant="h6"
                    color="text.secondary"
                    sx={{ fontSize: "16px" }}>
                    This CAT 1 request has already been processed.
                  </Typography>
                </Box>
              )}
            </>
          )}
        </DialogContent>

        <DialogActions
          sx={{
            px: 4.4,
            pb: 2,
            pt: 2,
            justifyContent: "flex-end",
            gap: 2,
          }}>
          {!isLoadingData && !isProcessed && (
            <>
              <Button
                onClick={handleReturn}
                variant="contained"
                sx={{
                  backgroundColor: "#dc3545",
                  color: "white",
                  minWidth: "100px",
                  height: "40px",
                  fontSize: "14px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  borderRadius: 1,
                  "&:hover": { backgroundColor: "#c82333" },
                }}
                disabled={isLoading}
                startIcon={
                  isLoading && actionType === "return" ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <CancelIcon />
                  )
                }>
                {isLoading && actionType === "return"
                  ? "Processing..."
                  : "RETURN"}
              </Button>
              <Button
                onClick={handleApprove}
                variant="contained"
                sx={{
                  backgroundColor: "#28a745",
                  color: "white",
                  minWidth: "100px",
                  height: "40px",
                  fontSize: "14px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  borderRadius: 1,
                  "&:hover": { backgroundColor: "#218838" },
                }}
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
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          },
        }}>
        <DialogTitle sx={{ textAlign: "center", pt: 3 }}>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            mb={2}>
            <HelpIcon sx={{ fontSize: 60, color: "#ff4400" }} />
          </Box>
          <Typography
            variant="h6"
            fontWeight="bold"
            textAlign="center"
            sx={{ color: "#213d70", fontSize: "18px" }}>
            {confirmAction === "approve"
              ? "Confirm Approval"
              : "Confirm Return"}
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ textAlign: "center", px: 3 }}>
          <Typography
            variant="body1"
            gutterBottom
            sx={{ fontSize: "14px", mb: 2 }}>
            {confirmAction === "approve"
              ? "Are you sure you want to Approve this CAT 1 request?"
              : "Are you sure you want to Return this CAT 1 request?"}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontSize: "13px", mb: 3 }}>
            CAT 1 Request ID: {approval?.id || "N/A"}
          </Typography>

          {confirmAction === "return" && (
            <TextField
              label="Reason"
              placeholder="Please provide a reason for returning this request..."
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (reasonError) setReasonError(false);
              }}
              multiline
              rows={3}
              fullWidth
              required
              error={reasonError}
              helperText={reasonError ? "Reason is required" : ""}
              variant="outlined"
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
          )}

          {confirmAction === "approve" && (
            <TextField
              label="Comments (Optional)"
              placeholder="Add any comments..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              multiline
              rows={3}
              fullWidth
              variant="outlined"
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
          )}
        </DialogContent>

        <DialogActions sx={{ justifyContent: "center", pb: 3, px: 3 }}>
          <Box display="flex" gap={2}>
            <Button
              onClick={() => setConfirmOpen(false)}
              variant="outlined"
              sx={{
                borderRadius: 2,
                minWidth: 80,
                height: "40px",
                borderColor: "#dc3545",
                color: "#dc3545",
                "&:hover": {
                  borderColor: "#c82333",
                  backgroundColor: "rgba(220, 53, 69, 0.04)",
                },
              }}
              disabled={isLoading}>
              Cancel
            </Button>
            <Button
              onClick={handleActionConfirm}
              variant="contained"
              sx={{
                borderRadius: 2,
                minWidth: 80,
                height: "40px",
                backgroundColor:
                  confirmAction === "approve" ? "#28a745" : "#dc3545",
                "&:hover": {
                  backgroundColor:
                    confirmAction === "approve" ? "#218838" : "#c82333",
                },
              }}
              disabled={isLoading}>
              {isLoading ? (
                <CircularProgress size={20} color="inherit" />
              ) : confirmAction === "approve" ? (
                "APPROVE"
              ) : (
                "RETURN"
              )}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CatOneApprovalDialog;
