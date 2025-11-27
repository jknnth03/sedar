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
import EventIcon from "@mui/icons-material/Event";

const PdpApprovalDialog = ({
  open,
  onClose,
  approval,
  onApprove,
  onReturn,
  isLoading = false,
  isLoadingData = false,
}) => {
  const [reason, setReason] = useState("");
  const [actionType, setActionType] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [reasonError, setReasonError] = useState(false);

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
      const trimmedReason = reason.trim();
      if (!trimmedReason) {
        setReasonError(true);
        return;
      }
      const returnData = { reason: trimmedReason };
      setConfirmOpen(false);
      await onReturn(returnData);
      handleReset();
    }
  };

  const handleClose = () => {
    onClose();
    handleReset();
  };

  const handleReset = () => {
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

  const status = approval?.status?.toLowerCase() || "pending";
  const isProcessed = status === "approved" || status === "returned";
  const goals = approval?.goals || [];
  const coachingSessions = approval?.coaching_sessions || [];

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
        p: 3,
        mb: 0,
      }}>
      <Skeleton variant="text" width="30%" height={24} sx={{ mb: 2 }} />
      {Array.from({ length: rows }).map((_, index) => (
        <React.Fragment key={index}>{renderSkeletonRow()}</React.Fragment>
      ))}
    </Box>
  );

  const renderGoal = (goal) => (
    <Box
      key={goal.id}
      sx={{
        mb: 3,
        p: 2.5,
        backgroundColor: "#f8f9fa",
        borderRadius: 2,
        border: "1px solid #e0e0e0",
      }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        <TrendingUpIcon sx={{ color: "rgb(33, 61, 112)", fontSize: 20 }} />
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 700,
            color: "rgb(33, 61, 112)",
            fontSize: "13px",
          }}>
          GOAL {goal.goal_number}: {goal.description}
        </Typography>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography
          variant="caption"
          sx={{
            color: "#666",
            fontSize: "11px",
            fontWeight: 600,
            display: "block",
            mb: 0.5,
          }}>
          TARGET DATE
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: "#000000",
            fontSize: "13px",
            fontWeight: 600,
          }}>
          {formatDate(goal.target_date)}
        </Typography>
      </Box>

      {goal.actions && goal.actions.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography
            variant="caption"
            sx={{
              color: "rgb(33, 61, 112)",
              fontSize: "11px",
              fontWeight: 700,
              display: "block",
              mb: 1,
              textTransform: "uppercase",
            }}>
            Actions
          </Typography>
          {goal.actions.map((action) => (
            <Box
              key={action.id}
              sx={{
                mb: 1.5,
                p: 1.5,
                backgroundColor: "#ffffff",
                borderRadius: 1,
                border: "1px solid #e0e0e0",
              }}>
              <Typography
                variant="body2"
                sx={{
                  color: "#000000",
                  fontSize: "12px",
                  fontWeight: 600,
                  mb: 1,
                }}>
                {action.activity}
              </Typography>
              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#666",
                      fontSize: "10px",
                      fontWeight: 600,
                      display: "block",
                    }}>
                    DUE DATE
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "#000000", fontSize: "11px" }}>
                    {formatDate(action.due_date)}
                  </Typography>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#666",
                      fontSize: "10px",
                      fontWeight: 600,
                      display: "block",
                    }}>
                    EXPECTED PROGRESS
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "#000000", fontSize: "11px" }}>
                    {action.expected_progress}
                  </Typography>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      )}

      {goal.resources && goal.resources.length > 0 && (
        <Box>
          <Typography
            variant="caption"
            sx={{
              color: "rgb(33, 61, 112)",
              fontSize: "11px",
              fontWeight: 700,
              display: "block",
              mb: 1,
              textTransform: "uppercase",
            }}>
            Resources
          </Typography>
          {goal.resources.map((resource) => (
            <Box
              key={resource.id}
              sx={{
                mb: 1.5,
                p: 1.5,
                backgroundColor: "#ffffff",
                borderRadius: 1,
                border: "1px solid #e0e0e0",
              }}>
              <Typography
                variant="body2"
                sx={{
                  color: "#000000",
                  fontSize: "12px",
                  fontWeight: 600,
                  mb: 0.5,
                }}>
                {resource.resource_item}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "#666",
                  fontSize: "11px",
                  mb: 1,
                  fontStyle: "italic",
                }}>
                {resource.description}
              </Typography>
              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#666",
                      fontSize: "10px",
                      fontWeight: 600,
                      display: "block",
                    }}>
                    PERSON IN CHARGE
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "#000000", fontSize: "11px" }}>
                    {resource.person_in_charge}
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#666",
                      fontSize: "10px",
                      fontWeight: 600,
                      display: "block",
                    }}>
                    DUE DATE
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "#000000", fontSize: "11px" }}>
                    {formatDate(resource.due_date)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      )}
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
            maxHeight: "90vh",
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
                VIEW PDP REQUEST
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
              {renderSkeletonSection("Development Plan", 3)}
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
                        {approval?.employee_name || "N/A"}
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
                        {approval?.superior_name || "N/A"}
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
                        {approval?.department || "N/A"}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>

              <Box
                sx={{
                  backgroundColor: "#ffffff",
                  px: 4,
                  pt: 2,
                  pb: 1,
                  mb: 0,
                }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 600,
                    color: "rgb(33, 61, 112)",
                    mb: 1.5,
                    fontSize: "14px",
                  }}>
                  Development Plan Objective
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    color: "#000000",
                    fontSize: "13px",
                    lineHeight: 1.6,
                    mb: 2,
                    p: 2,
                    backgroundColor: "#f8f9fa",
                    borderRadius: 1,
                    border: "1px solid #e0e0e0",
                  }}>
                  {approval?.development_plan_objective || "N/A"}
                </Typography>
              </Box>

              <Box
                sx={{
                  backgroundColor: "#ffffff",
                  px: 4,
                  pt: 2,
                  pb: 3,
                  mb: 0,
                }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 600,
                    color: "rgb(33, 61, 112)",
                    mb: 2,
                    fontSize: "14px",
                  }}>
                  Development Goals
                </Typography>

                {goals.length > 0 ? (
                  goals.map((goal) => renderGoal(goal))
                ) : (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ textAlign: "center", py: 2 }}>
                    No goals defined
                  </Typography>
                )}
              </Box>

              {coachingSessions && coachingSessions.length > 0 && (
                <Box
                  sx={{
                    backgroundColor: "#ffffff",
                    px: 4,
                    pt: 2,
                    pb: 3,
                    mb: 0,
                  }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 2,
                    }}>
                    <EventIcon
                      sx={{ color: "rgb(33, 61, 112)", fontSize: 18 }}
                    />
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 600,
                        color: "rgb(33, 61, 112)",
                        fontSize: "14px",
                      }}>
                      Coaching Sessions
                    </Typography>
                  </Box>

                  {coachingSessions.map((session) => (
                    <Box
                      key={session.id}
                      sx={{
                        mb: 1.5,
                        p: 2,
                        backgroundColor: "#f8f9fa",
                        borderRadius: 1,
                        border: "1px solid #e0e0e0",
                      }}>
                      <Box sx={{ display: "flex", gap: 2, mb: 1 }}>
                        <Box>
                          <Typography
                            variant="caption"
                            sx={{
                              color: "rgb(33, 61, 112)",
                              fontSize: "11px",
                              fontWeight: 700,
                              display: "block",
                            }}>
                            {session.month_label}
                          </Typography>
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography
                            variant="caption"
                            sx={{
                              color: "#666",
                              fontSize: "10px",
                              fontWeight: 600,
                              display: "block",
                            }}>
                            SESSION DATE
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ color: "#000000", fontSize: "12px" }}>
                            {formatDate(session.session_date)}
                          </Typography>
                        </Box>
                      </Box>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#000000",
                          fontSize: "12px",
                          lineHeight: 1.5,
                        }}>
                        {session.commitment}
                      </Typography>
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
                    This PDP request has already been {status}
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
                  "&:hover": {
                    backgroundColor: "#c82333",
                  },
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
              : "Confirm Return"}
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ textAlign: "center", px: 3 }}>
          <Typography
            variant="body1"
            gutterBottom
            sx={{ fontSize: "14px", mb: 2 }}>
            {confirmAction === "approve"
              ? "Are you sure you want to Approve this PDP request?"
              : "Are you sure you want to Return this PDP request?"}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontSize: "13px", mb: 3 }}>
            PDP Request ID: {approval?.id || "N/A"}
          </Typography>

          {confirmAction === "return" && (
            <TextField
              label="Reason for Return"
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
                "RETURN"
              )}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PdpApprovalDialog;
