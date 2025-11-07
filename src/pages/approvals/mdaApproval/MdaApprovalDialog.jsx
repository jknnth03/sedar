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

const MdaApprovalDialog = ({
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

  const formatCurrency = (amount) => {
    if (!amount) return "N/A";
    return `₱${parseFloat(amount).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const submission = approval?.submission || {};
  const formDetails = submission.form_details || {};
  const status = approval?.status?.toLowerCase() || "pending";
  const isProcessed = status === "approved" || status === "rejected";
  const isMovementType = formDetails.movement_type !== undefined;
  const fromPosition = formDetails.from || {};
  const toPosition = formDetails.to || {};

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
    <Box
      sx={{
        backgroundColor: "#ffffff",
        border: "1px solid #dee2e6",
        borderRadius: 2,
        p: 3,
        mb: 2,
      }}>
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
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          },
        }}>
        <DialogTitle sx={{ padding: "18px 26px" }}>
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
                VIEW MDA REQUEST
              </Typography>
            </Box>
            <IconButton onClick={handleClose} size="small">
              <CloseIcon sx={{ color: "rgb(33, 61, 112)" }} />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          {isLoadingData ? (
            <>
              {renderSkeletonSection("Employee Information", 3)}
              {renderSkeletonSection("MDA Details", 4)}
            </>
          ) : (
            <>
              <Box
                sx={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #dee2e6",
                  borderRadius: 2,
                  p: 3,
                  mb: 2,
                }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 600,
                    color: "rgb(33, 61, 112)",
                    mb: 2,
                    fontSize: "14px",
                  }}>
                  Employee Information
                </Typography>

                <Box>
                  <Box sx={{ display: "flex", gap: 6, mb: 1.5 }}>
                    <Box sx={{ flex: 1, minHeight: "60px" }}>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "rgb(33, 61, 112)",
                          fontSize: "11px",
                          fontWeight: 600,
                          display: "block",
                          mb: 0.5,
                        }}>
                        EMPLOYEE NUMBER
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: "#000000ff", fontSize: "13px" }}>
                        {formDetails.employee_number || "N/A"}
                      </Typography>
                    </Box>
                    <Box sx={{ flex: 1, minHeight: "60px" }}>
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
                        sx={{ color: "#000000ff", fontSize: "13px" }}>
                        {formDetails.employee_name || "N/A"}
                      </Typography>
                    </Box>
                    <Box sx={{ flex: 1, minHeight: "60px" }}>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "rgb(33, 61, 112)",
                          fontSize: "11px",
                          fontWeight: 600,
                          display: "block",
                          mb: 0.5,
                        }}>
                        REFERENCE NUMBER
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: "#000000ff", fontSize: "13px" }}>
                        {formDetails.reference_number || "N/A"}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: "flex", gap: 6, mb: 1.5 }}>
                    <Box sx={{ flex: 1, minHeight: "60px" }}>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "rgb(33, 61, 112)",
                          fontSize: "11px",
                          fontWeight: 600,
                          display: "block",
                          mb: 0.5,
                        }}>
                        BIRTH DATE
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: "#000000ff", fontSize: "13px" }}>
                        {formatDate(formDetails.birth_date)}
                      </Typography>
                    </Box>
                    <Box sx={{ flex: 1, minHeight: "60px" }}>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "rgb(33, 61, 112)",
                          fontSize: "11px",
                          fontWeight: 600,
                          display: "block",
                          mb: 0.5,
                        }}>
                        GENDER
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: "#000000ff", fontSize: "13px" }}>
                        {formDetails.gender || "N/A"}
                      </Typography>
                    </Box>
                    <Box sx={{ flex: 1, minHeight: "60px" }}>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "rgb(33, 61, 112)",
                          fontSize: "11px",
                          fontWeight: 600,
                          display: "block",
                          mb: 0.5,
                        }}>
                        NATIONALITY
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: "#000000ff", fontSize: "13px" }}>
                        {formDetails.nationality || "N/A"}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: "flex", gap: 6 }}>
                    <Box sx={{ flex: 1, minHeight: "60px" }}>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "rgb(33, 61, 112)",
                          fontSize: "11px",
                          fontWeight: 600,
                          display: "block",
                          mb: 0.5,
                        }}>
                        ADDRESS
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: "#000000ff", fontSize: "13px" }}>
                        {formDetails.address || "N/A"}
                      </Typography>
                    </Box>
                    <Box sx={{ flex: 1, minHeight: "60px" }}>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "rgb(33, 61, 112)",
                          fontSize: "11px",
                          fontWeight: 600,
                          display: "block",
                          mb: 0.5,
                        }}>
                        REQUESTED BY
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: "#000000ff", fontSize: "13px" }}>
                        {submission.requested_by || "N/A"}
                      </Typography>
                    </Box>
                    <Box sx={{ flex: 1, minHeight: "60px" }} />
                  </Box>
                </Box>
              </Box>

              <Box
                sx={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #dee2e6",
                  borderRadius: 2,
                  p: 3,
                  mb: 2,
                }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 600,
                    color: "rgb(33, 61, 112)",
                    mb: 2,
                    fontSize: "14px",
                  }}>
                  MDA Details
                </Typography>

                <Box>
                  <Box sx={{ display: "flex", gap: 6, mb: 1.5 }}>
                    <Box sx={{ flex: 1, minHeight: "60px" }}>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "rgb(33, 61, 112)",
                          fontSize: "11px",
                          fontWeight: 600,
                          display: "block",
                          mb: 0.5,
                        }}>
                        MOVEMENT TYPE
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: "#000000ff", fontSize: "13px" }}>
                        {formDetails.movement_type || "N/A"}
                      </Typography>
                    </Box>
                    <Box sx={{ flex: 1, minHeight: "60px" }}>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "rgb(33, 61, 112)",
                          fontSize: "11px",
                          fontWeight: 600,
                          display: "block",
                          mb: 0.5,
                        }}>
                        EFFECTIVE DATE
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: "#000000ff", fontSize: "13px" }}>
                        {formatDate(formDetails.effective_date)}
                      </Typography>
                    </Box>
                    <Box sx={{ flex: 1, minHeight: "60px" }} />
                  </Box>

                  {isMovementType && (
                    <>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 600,
                          color: "rgb(33, 61, 112)",
                          mt: 2,
                          mb: 2,
                          fontSize: "13px",
                        }}>
                        FROM Position
                      </Typography>

                      <Box sx={{ display: "flex", gap: 6, mb: 1.5 }}>
                        <Box sx={{ flex: 1, minHeight: "60px" }}>
                          <Typography
                            variant="caption"
                            sx={{
                              color: "rgb(33, 61, 112)",
                              fontSize: "11px",
                              fontWeight: 600,
                              display: "block",
                              mb: 0.5,
                            }}>
                            POSITION
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ color: "#000000ff", fontSize: "13px" }}>
                            {fromPosition.position || "N/A"}
                          </Typography>
                        </Box>
                        <Box sx={{ flex: 1, minHeight: "60px" }}>
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
                            sx={{ color: "#000000ff", fontSize: "13px" }}>
                            {fromPosition.department || "N/A"}
                          </Typography>
                        </Box>
                        <Box sx={{ flex: 1, minHeight: "60px" }}>
                          <Typography
                            variant="caption"
                            sx={{
                              color: "rgb(33, 61, 112)",
                              fontSize: "11px",
                              fontWeight: 600,
                              display: "block",
                              mb: 0.5,
                            }}>
                            SUB UNIT
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ color: "#000000ff", fontSize: "13px" }}>
                            {fromPosition.sub_unit || "N/A"}
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ display: "flex", gap: 6, mb: 2 }}>
                        <Box sx={{ flex: 1, minHeight: "60px" }}>
                          <Typography
                            variant="caption"
                            sx={{
                              color: "rgb(33, 61, 112)",
                              fontSize: "11px",
                              fontWeight: 600,
                              display: "block",
                              mb: 0.5,
                            }}>
                            JOB LEVEL
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ color: "#000000ff", fontSize: "13px" }}>
                            {fromPosition.job_level || "N/A"}
                          </Typography>
                        </Box>
                        <Box sx={{ flex: 1, minHeight: "60px" }}>
                          <Typography
                            variant="caption"
                            sx={{
                              color: "rgb(33, 61, 112)",
                              fontSize: "11px",
                              fontWeight: 600,
                              display: "block",
                              mb: 0.5,
                            }}>
                            JOB RATE
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ color: "#000000ff", fontSize: "13px" }}>
                            {formatCurrency(fromPosition.job_rate)}
                          </Typography>
                        </Box>
                        <Box sx={{ flex: 1, minHeight: "60px" }}>
                          <Typography
                            variant="caption"
                            sx={{
                              color: "rgb(33, 61, 112)",
                              fontSize: "11px",
                              fontWeight: 600,
                              display: "block",
                              mb: 0.5,
                            }}>
                            ALLOWANCE
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ color: "#000000ff", fontSize: "13px" }}>
                            {formatCurrency(fromPosition.allowance)}
                          </Typography>
                        </Box>
                      </Box>

                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 600,
                          color: "rgb(33, 61, 112)",
                          mt: 2,
                          mb: 2,
                          fontSize: "13px",
                        }}>
                        TO Position
                      </Typography>

                      <Box sx={{ display: "flex", gap: 6, mb: 1.5 }}>
                        <Box sx={{ flex: 1, minHeight: "60px" }}>
                          <Typography
                            variant="caption"
                            sx={{
                              color: "rgb(33, 61, 112)",
                              fontSize: "11px",
                              fontWeight: 600,
                              display: "block",
                              mb: 0.5,
                            }}>
                            POSITION
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ color: "#000000ff", fontSize: "13px" }}>
                            {toPosition.position || "N/A"}
                          </Typography>
                        </Box>
                        <Box sx={{ flex: 1, minHeight: "60px" }}>
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
                            sx={{ color: "#000000ff", fontSize: "13px" }}>
                            {toPosition.department || "N/A"}
                          </Typography>
                        </Box>
                        <Box sx={{ flex: 1, minHeight: "60px" }}>
                          <Typography
                            variant="caption"
                            sx={{
                              color: "rgb(33, 61, 112)",
                              fontSize: "11px",
                              fontWeight: 600,
                              display: "block",
                              mb: 0.5,
                            }}>
                            SUB UNIT
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ color: "#000000ff", fontSize: "13px" }}>
                            {toPosition.sub_unit || "N/A"}
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ display: "flex", gap: 6 }}>
                        <Box sx={{ flex: 1, minHeight: "60px" }}>
                          <Typography
                            variant="caption"
                            sx={{
                              color: "rgb(33, 61, 112)",
                              fontSize: "11px",
                              fontWeight: 600,
                              display: "block",
                              mb: 0.5,
                            }}>
                            JOB LEVEL
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ color: "#000000ff", fontSize: "13px" }}>
                            {toPosition.job_level || "N/A"}
                          </Typography>
                        </Box>
                        <Box sx={{ flex: 1, minHeight: "60px" }}>
                          <Typography
                            variant="caption"
                            sx={{
                              color: "rgb(33, 61, 112)",
                              fontSize: "11px",
                              fontWeight: 600,
                              display: "block",
                              mb: 0.5,
                            }}>
                            JOB RATE
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ color: "#000000ff", fontSize: "13px" }}>
                            {formatCurrency(toPosition.job_rate)}
                          </Typography>
                        </Box>
                        <Box sx={{ flex: 1, minHeight: "60px" }}>
                          <Typography
                            variant="caption"
                            sx={{
                              color: "rgb(33, 61, 112)",
                              fontSize: "11px",
                              fontWeight: 600,
                              display: "block",
                              mb: 0.5,
                            }}>
                            ALLOWANCE
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ color: "#000000ff", fontSize: "13px" }}>
                            {formatCurrency(toPosition.allowance)}
                          </Typography>
                        </Box>
                      </Box>
                    </>
                  )}
                </Box>
              </Box>

              {isProcessed && (
                <Box
                  sx={{
                    textAlign: "center",
                    py: 2,
                    backgroundColor: "#ffffff",
                    borderRadius: 2,
                  }}>
                  <Typography
                    variant="h6"
                    color="text.secondary"
                    sx={{ fontSize: "16px" }}>
                    This MDA request has already been {status}
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
                onClick={handleReject}
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
                  "&:hover": {
                    backgroundColor: "#c82333",
                  },
                }}
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
                sx={{
                  backgroundColor: "#28a745",
                  color: "white",
                  minWidth: "100px",
                  height: "40px",
                  fontSize: "14px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  borderRadius: 1,
                  "&:hover": {
                    backgroundColor: "#218838",
                  },
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
              : "Confirm Rejection"}
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ textAlign: "center", px: 3 }}>
          <Typography
            variant="body1"
            gutterBottom
            sx={{ fontSize: "14px", mb: 2 }}>
            {confirmAction === "approve"
              ? "Are you sure you want to Approve this MDA request?"
              : "Are you sure you want to Reject this MDA request?"}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontSize: "13px", mb: 3 }}>
            MDA Request ID: {approval?.id || "N/A"}
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
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
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
                "REJECT"
              )}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default MdaApprovalDialog;
