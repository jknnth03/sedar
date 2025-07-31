import React, { useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Chip,
  CircularProgress,
  Alert,
  Fade,
} from "@mui/material";
import { CheckCircle as ReceiveIcon } from "@mui/icons-material";
import { format, parseISO, isValid } from "date-fns";
import ReceivingDialog from "./ReceivingDialog";

const getStatusColor = (status) => {
  const statusColors = {
    PENDING: { bg: "#fff3cd", text: "#856404", border: "#ffeaa7" },
    APPROVED: { bg: "#d1ecf1", text: "#0c5460", border: "#bee5eb" },
    REJECTED: { bg: "#f8d7da", text: "#721c24", border: "#f1b0b7" },
    RETURNED: { bg: "#fce4ec", text: "#880e4f", border: "#f8bbd9" },
    RECEIVED: { bg: "#d4edda", text: "#155724", border: "#c3e6cb" },
    CANCELLED: { bg: "#e2e3e5", text: "#383d41", border: "#d6d8db" },
    "FOR RECEIVING": { bg: "#e3f2fd", text: "#0d47a1", border: "#bbdefb" },
  };
  return statusColors[status] || statusColors.PENDING;
};

const StatusChip = ({ status }) => {
  const displayStatus = status === "APPROVED" ? "RECEIVED" : status;
  const colors = getStatusColor(displayStatus);

  return (
    <Chip
      label={displayStatus}
      size="small"
      sx={{
        backgroundColor: colors.bg,
        color: colors.text,
        border: `1px solid ${colors.border}`,
        fontWeight: 600,
        fontSize: "11px",
        height: "24px",
        minWidth: "80px",
        "& .MuiChip-label": {
          padding: "0 8px",
        },
      }}
    />
  );
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";

  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return "Invalid Date";
    return format(date, "MMM dd, yyyy");
  } catch (error) {
    return "Invalid Date";
  }
};

const getUserName = (submission) => {
  if (submission.submitted_by) {
    const user = submission.submitted_by;
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    if (user.first_name) {
      return user.first_name;
    }
    if (user.username) {
      return user.username;
    }
  }
  return "Unknown User";
};

const getDepartmentName = (submission) => {
  if (submission.charging?.department_name) {
    return submission.charging.department_name;
  }
  if (submission.charging?.unit_name) {
    return submission.charging.unit_name;
  }
  return "N/A";
};

const EmptyState = ({ searchQuery, showArchived }) => (
  <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "400px",
      padding: "40px 20px",
      backgroundColor: "#fafafa",
    }}>
    <Box
      sx={{
        width: "120px",
        height: "120px",
        borderRadius: "50%",
        backgroundColor: "rgba(33, 61, 112, 0.1)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: "24px",
      }}>
      <ReceiveIcon sx={{ fontSize: "60px", color: "rgba(33, 61, 112, 0.3)" }} />
    </Box>

    <Typography
      variant="h6"
      sx={{
        color: "#666",
        fontWeight: 600,
        marginBottom: "8px",
        textAlign: "center",
      }}>
      {searchQuery
        ? `No submissions found for "${searchQuery}"`
        : showArchived
        ? "No completed submissions"
        : "No pending submissions"}
    </Typography>

    <Typography
      variant="body2"
      sx={{
        color: "#999",
        textAlign: "center",
        maxWidth: "400px",
      }}>
      {searchQuery
        ? "Try adjusting your search criteria or check if the submission exists."
        : showArchived
        ? "Completed submissions will appear here once you've processed them."
        : "New submissions waiting for your review will appear here."}
    </Typography>
  </Box>
);

const LoadingState = () => (
  <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "400px",
      padding: "40px 20px",
    }}>
    <CircularProgress size={60} sx={{ color: "rgb(33, 61, 112)" }} />
    <Typography
      variant="body1"
      sx={{
        marginTop: "20px",
        color: "#666",
        fontWeight: 500,
      }}>
      Loading submissions...
    </Typography>
  </Box>
);

const ErrorState = ({ error }) => (
  <Box sx={{ padding: "20px" }}>
    <Alert severity="error" sx={{ borderRadius: "8px" }}>
      <Typography variant="body1" sx={{ fontWeight: 600 }}>
        Error loading submissions
      </Typography>
      <Typography variant="body2" sx={{ marginTop: "4px" }}>
        {error?.message || "An unexpected error occurred. Please try again."}
      </Typography>
    </Alert>
  </Box>
);

const ReceivingTable = ({
  submissionsList = [],
  isLoadingState = false,
  error = null,
  searchQuery = "",
  showArchived = false,
  onReceiveSubmission,
  onReturnSubmission,
}) => {
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [pendingComments, setPendingComments] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const tableData = useMemo(() => {
    if (!Array.isArray(submissionsList)) return [];
    return submissionsList;
  }, [submissionsList]);

  const handleRowClick = (submission) => {
    setSelectedSubmission(submission);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedSubmission(null);
  };

  const handleReceive = (submission, comments) => {
    setConfirmAction("receive");
    setPendingComments(comments);
    setConfirmOpen(true);
  };

  const handleReturn = (submission, comments) => {
    setConfirmAction("return");
    setPendingComments(comments);
    setConfirmOpen(true);
  };

  const handleConfirmClose = () => {
    setConfirmOpen(false);
    setConfirmAction(null);
    setPendingComments("");
  };

  const handleConfirmAction = async () => {
    if (!confirmAction || !selectedSubmission) return;

    setActionLoading(true);

    try {
      if (confirmAction === "receive" && onReceiveSubmission) {
        await onReceiveSubmission(selectedSubmission.id, pendingComments);
      } else if (confirmAction === "return" && onReturnSubmission) {
        await onReturnSubmission(selectedSubmission.id, pendingComments);
      }

      setConfirmOpen(false);
      setDialogOpen(false);
      setSelectedSubmission(null);
    } catch (error) {
    } finally {
      setActionLoading(false);
      setConfirmAction(null);
      setPendingComments("");
    }
  };

  if (isLoadingState) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  if (tableData.length === 0) {
    return <EmptyState searchQuery={searchQuery} showArchived={showArchived} />;
  }

  return (
    <>
      <Fade in={!isLoadingState}>
        <TableContainer
          component={Paper}
          sx={{
            flex: 1,
            overflow: "auto",
            backgroundColor: "white",
            boxShadow: "none",
            "& .MuiTable-root": {
              minWidth: 650,
            },
          }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    backgroundColor: "#f8f9fa",
                    borderBottom: "2px solid #e0e0e0",
                    fontWeight: 700,
                    fontSize: "13px",
                    color: "rgb(33, 61, 112)",
                    letterSpacing: "0.5px",
                    textTransform: "uppercase",
                    padding: "16px 20px",
                  }}>
                  ID
                </TableCell>
                <TableCell
                  sx={{
                    backgroundColor: "#f8f9fa",
                    borderBottom: "2px solid #e0e0e0",
                    fontWeight: 700,
                    fontSize: "13px",
                    color: "rgb(33, 61, 112)",
                    letterSpacing: "0.5px",
                    textTransform: "uppercase",
                    padding: "16px 20px",
                  }}>
                  Form Name
                </TableCell>
                <TableCell
                  sx={{
                    backgroundColor: "#f8f9fa",
                    borderBottom: "2px solid #e0e0e0",
                    fontWeight: 700,
                    fontSize: "13px",
                    color: "rgb(33, 61, 112)",
                    letterSpacing: "0.5px",
                    textTransform: "uppercase",
                    padding: "16px 20px",
                  }}>
                  REQUESTOR
                </TableCell>
                <TableCell
                  sx={{
                    backgroundColor: "#f8f9fa",
                    borderBottom: "2px solid #e0e0e0",
                    fontWeight: 700,
                    fontSize: "13px",
                    color: "rgb(33, 61, 112)",
                    letterSpacing: "0.5px",
                    textTransform: "uppercase",
                    padding: "16px 20px",
                  }}>
                  Department
                </TableCell>
                <TableCell
                  sx={{
                    backgroundColor: "#f8f9fa",
                    borderBottom: "2px solid #e0e0e0",
                    fontWeight: 700,
                    fontSize: "13px",
                    color: "rgb(33, 61, 112)",
                    letterSpacing: "0.5px",
                    textTransform: "uppercase",
                    padding: "16px 20px",
                  }}>
                  Status
                </TableCell>
                <TableCell
                  sx={{
                    backgroundColor: "#f8f9fa",
                    borderBottom: "2px solid #e0e0e0",
                    fontWeight: 700,
                    fontSize: "13px",
                    color: "rgb(33, 61, 112)",
                    letterSpacing: "0.5px",
                    textTransform: "uppercase",
                    padding: "16px 20px",
                  }}>
                  Updated Date
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tableData.map((submission, index) => (
                <TableRow
                  key={submission.id || index}
                  onClick={() => handleRowClick(submission)}
                  sx={{
                    cursor: "pointer",
                    transition: "all 0.2s ease-in-out",
                    "&:hover": {
                      backgroundColor: "rgba(33, 61, 112, 0.02)",
                      transform: "translateY(-1px)",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    },
                    "&:nth-of-type(even)": {
                      backgroundColor: "#fafafa",
                      "&:hover": {
                        backgroundColor: "rgba(33, 61, 112, 0.04)",
                      },
                    },
                  }}>
                  <TableCell sx={{ padding: "16px 20px" }}>
                    <Typography variant="body2">
                      {submission.id || "N/A"}
                    </Typography>
                  </TableCell>

                  <TableCell sx={{ padding: "16px 20px" }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        color: "#333",
                        fontSize: "14px",
                      }}>
                      {submission.form?.name || "Untitled Form"}
                    </Typography>
                  </TableCell>

                  <TableCell sx={{ padding: "16px 20px" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 500,
                          color: "#333",
                          fontSize: "14px",
                        }}>
                        {getUserName(submission)}
                      </Typography>
                    </Box>
                  </TableCell>

                  <TableCell sx={{ padding: "16px 20px" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 500,
                          color: "#333",
                          fontSize: "14px",
                        }}>
                        {getDepartmentName(submission)}
                      </Typography>
                    </Box>
                  </TableCell>

                  <TableCell sx={{ padding: "16px 20px" }}>
                    <StatusChip status={submission.status || "PENDING"} />
                  </TableCell>

                  <TableCell sx={{ padding: "16px 20px" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 500,
                          color: "#333",
                          fontSize: "14px",
                        }}>
                        {formatDate(submission.updated_at)}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Fade>

      <ReceivingDialog.SubmissionDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        submission={selectedSubmission}
        onReceive={handleReceive}
        onReturn={handleReturn}
        isLoading={actionLoading}
      />

      <ReceivingDialog.ConfirmationDialog
        open={confirmOpen}
        onClose={handleConfirmClose}
        onConfirm={handleConfirmAction}
        action={confirmAction}
        submission={selectedSubmission}
        isLoading={actionLoading}
      />
    </>
  );
};

export default ReceivingTable;
