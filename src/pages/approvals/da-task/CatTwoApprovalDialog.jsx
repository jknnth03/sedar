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
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";

const CatTwoApprovalDialog = ({
  open,
  onClose,
  approval,
  onApprove,
  onReturn,
  onCreatePdpTwo,
  isLoading = false,
  isLoadingData = false,
  isCreatingPdpTwo = false,
}) => {
  const [correctionRemarks, setCorrectionRemarks] = useState("");
  const [actionType, setActionType] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [correctionRemarksError, setCorrectionRemarksError] = useState(false);
  const [pdpConfirmOpen, setPdpConfirmOpen] = useState(false);

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
      const approveData = {};
      setConfirmOpen(false);
      await onApprove(approveData);
      handleReset();
    } else if (confirmAction === "return") {
      const trimmedRemarks = correctionRemarks.trim();
      if (!trimmedRemarks) {
        setCorrectionRemarksError(true);
        return;
      }
      const returnData = { correction_remarks: trimmedRemarks };
      setConfirmOpen(false);
      await onReturn(returnData);
      handleReset();
    }
  };

  const handleCreatePdpTwo = () => {
    setPdpConfirmOpen(true);
  };

  const handlePdpConfirm = async () => {
    setPdpConfirmOpen(false);
    await onCreatePdpTwo();
  };

  const handleClose = () => {
    onClose();
    handleReset();
  };

  const handleReset = () => {
    setCorrectionRemarks("");
    setCorrectionRemarksError(false);
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
  const isProcessed = status === "FINAL_COMPLETE";
  const isFailed = approval?.is_failed === true;
  const canCreatePdpTwo = approval?.actions?.can_create_pdp2 === true;
  const pdpTwoAlreadyCreated = isFailed && !canCreatePdpTwo;

  const template = approval?.template || {};
  const ratingScale = template.rating_scale || [];
  const sections = template.sections || [];

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
              fontWeight: item.is_rateable ? 400 : 600,
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
                VIEW CATEGORY 2 REQUEST
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
              <Box
                sx={{
                  backgroundColor: "#ffffff",
                  px: 4,
                  pt: 2,
                  pb: 2,
                  mb: -3,
                }}>
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

                <Box>
                  <Box sx={{ display: "flex", gap: 2, mb: 1.5 }}>
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
                        EMPLOYEE NAME
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#000000ff",
                          fontSize: "13px",
                          fontWeight: 700,
                        }}>
                        {approval?.employee?.employee_name ||
                          approval?.employee_name ||
                          "N/A"}
                      </Typography>
                    </Box>
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
                        SUPERIOR NAME
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#000000ff",
                          fontSize: "13px",
                          fontWeight: 700,
                        }}>
                        {approval?.superior?.name ||
                          approval?.superior_name ||
                          "N/A"}
                      </Typography>
                    </Box>
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
                        DEPARTMENT
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#000000ff",
                          fontSize: "13px",
                          fontWeight: 700,
                        }}>
                        {approval?.employee?.department ||
                          approval?.department ||
                          "N/A"}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: "flex", gap: 2, mb: 1.5 }}>
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
                        DATE ASSESSED
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#000000ff",
                          fontSize: "13px",
                          fontWeight: 700,
                        }}>
                        {formatDate(approval?.date_assessed)}
                      </Typography>
                    </Box>
                    <Box sx={{ flex: 2 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "rgb(33, 61, 112)",
                          fontSize: "11px",
                          fontWeight: 600,
                          display: "block",
                          mb: 0.5,
                        }}>
                        TEMPLATE NAME
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#000000ff",
                          fontSize: "13px",
                          fontWeight: 700,
                        }}>
                        {template.name || approval?.name || "N/A"}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>

              <Box
                sx={{ backgroundColor: "#ffffff", px: 4, pt: 2, pb: 3, mb: 0 }}>
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

                {sections.length > 0 ? (
                  sections.map((section) => (
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
                  ))
                ) : (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ textAlign: "center", py: 2 }}>
                    No assessment details available
                  </Typography>
                )}
              </Box>

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
                    {pdpTwoAlreadyCreated
                      ? "PDP II has been created."
                      : "This Category 2 request has already been approved."}
                  </Typography>
                </Box>
              )}
            </>
          )}
        </DialogContent>

        <DialogActions
          sx={{ px: 4.4, pb: 2, pt: 2, justifyContent: "flex-end", gap: 2 }}>
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

          {!isLoadingData && isProcessed && canCreatePdpTwo && (
            <Button
              onClick={handleCreatePdpTwo}
              variant="contained"
              sx={{
                backgroundColor: "rgb(33, 61, 112)",
                color: "white",
                minWidth: "140px",
                height: "40px",
                fontSize: "14px",
                fontWeight: 600,
                textTransform: "uppercase",
                borderRadius: 1,
                "&:hover": { backgroundColor: "rgb(25, 48, 90)" },
              }}
              disabled={isCreatingPdpTwo}
              startIcon={
                isCreatingPdpTwo ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <AddCircleOutlineIcon />
                )
              }>
              {isCreatingPdpTwo ? "Creating..." : "CREATE PDP II"}
            </Button>
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
              ? "Are you sure you want to Approve this Category 2 request?"
              : "Are you sure you want to Return this Category 2 request?"}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontSize: "13px", mb: 3 }}>
            Category 2 Request ID: {approval?.id || "N/A"}
          </Typography>

          {confirmAction === "return" && (
            <TextField
              label="Correction Remarks"
              placeholder="Please provide correction remarks for returning this request..."
              value={correctionRemarks}
              onChange={(e) => {
                setCorrectionRemarks(e.target.value);
                if (correctionRemarksError) setCorrectionRemarksError(false);
              }}
              multiline
              rows={3}
              fullWidth
              required
              error={correctionRemarksError}
              helperText={
                correctionRemarksError ? "Correction remarks is required" : ""
              }
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

      <Dialog
        open={pdpConfirmOpen}
        onClose={() => setPdpConfirmOpen(false)}
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
            Confirm Create PDP II
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ textAlign: "center", px: 3 }}>
          <Typography
            variant="body1"
            gutterBottom
            sx={{ fontSize: "14px", mb: 2 }}>
            Are you sure you want to create PDP II for this Category 2 request?
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontSize: "13px", mb: 1 }}>
            Category 2 Request ID: {approval?.id || "N/A"}
          </Typography>
        </DialogContent>

        <DialogActions sx={{ justifyContent: "center", pb: 3, px: 3 }}>
          <Box display="flex" gap={2}>
            <Button
              onClick={() => setPdpConfirmOpen(false)}
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
              disabled={isCreatingPdpTwo}>
              Cancel
            </Button>
            <Button
              onClick={handlePdpConfirm}
              variant="contained"
              sx={{
                borderRadius: 2,
                minWidth: 80,
                height: "40px",
                backgroundColor: "rgb(33, 61, 112)",
                "&:hover": { backgroundColor: "rgb(25, 48, 90)" },
              }}
              disabled={isCreatingPdpTwo}>
              {isCreatingPdpTwo ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                "CONFIRM"
              )}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CatTwoApprovalDialog;
