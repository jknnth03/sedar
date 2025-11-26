import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Tooltip,
  CircularProgress,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import RestoreIcon from "@mui/icons-material/Restore";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import dayjs from "dayjs";
import { CONSTANT } from "../../../config";
import { styles } from "../../forms/manpowerform/FormSubmissionStyles";
import MDAHistoryDialog from "../../forms/mdaform/MDAHistoryDialog";

const DaFormReceivingTable = ({
  submissionsList,
  isLoadingState,
  error,
  handleRowClick,
  handleMenuOpen,
  handleMenuClose,
  handleStartSubmission,
  handleCompleteAssessment,
  menuAnchor,
  searchQuery,
  onRefetch,
  isAssessmentMode = false,
}) => {
  const theme = useTheme();
  const [historyDialogOpen, setHistoryDialogOpen] = React.useState(false);
  const [selectedDaHistory, setSelectedDaHistory] = React.useState(null);
  const [startDialogOpen, setStartDialogOpen] = React.useState(false);
  const [completeDialogOpen, setCompleteDialogOpen] = React.useState(false);
  const [selectedSubmissionToStart, setSelectedSubmissionToStart] =
    React.useState(null);
  const [selectedSubmissionToComplete, setSelectedSubmissionToComplete] =
    React.useState(null);
  const [isStarting, setIsStarting] = React.useState(false);
  const [isCompleting, setIsCompleting] = React.useState(false);

  const renderEmployee = (submission) => {
    if (!submission?.employee_name) return "-";
    return (
      <Box>
        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "16px" }}>
          {submission.employee_name}
        </Typography>
        {submission.employee_number && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontSize: "14px" }}>
            {submission.employee_number}
          </Typography>
        )}
      </Box>
    );
  };

  const renderStatusChip = (submission) => {
    const statusConfig = {
      "ready for assessment": {
        color: "#f57c00",
        bgColor: "#fff4e6",
        label: "READY FOR ASSESSMENT",
      },
      "for assessment": {
        color: "#1976d2",
        bgColor: "#e3f2fd",
        label: "FOR ASSESSMENT",
      },
      "ongoing assessment": {
        color: "#9c27b0",
        bgColor: "#f3e5f5",
        label: "ONGOING ASSESSMENT",
      },
      completed: {
        color: "#2e7d32",
        bgColor: "#e8f5e9",
        label: "COMPLETED",
      },
      pending: {
        color: "#f57c00",
        bgColor: "#fff4e6",
        label: "PENDING",
      },
      approved: {
        color: "#2e7d32",
        bgColor: "#e8f5e9",
        label: "APPROVED",
      },
      rejected: {
        color: "#d32f2f",
        bgColor: "#ffebee",
        label: "REJECTED",
      },
      cancelled: {
        color: "#757575",
        bgColor: "#f5f5f5",
        label: "CANCELLED",
      },
    };

    const status = submission.status?.toLowerCase();
    const config = statusConfig[status] || {
      color: "#757575",
      bgColor: "#f5f5f5",
      label: status?.toUpperCase() || "UNKNOWN",
    };

    return (
      <Chip label={config.label} size="small" sx={styles.statusChip(config)} />
    );
  };

  const handleViewActivityClick = (e, submission) => {
    e.stopPropagation();
    setSelectedDaHistory(submission);
    setHistoryDialogOpen(true);
  };

  const handleHistoryDialogClose = () => {
    setHistoryDialogOpen(false);
    setSelectedDaHistory(null);
  };

  const handleStartClick = (submission) => {
    setSelectedSubmissionToStart(submission);
    setStartDialogOpen(true);
    handleMenuClose(submission.id);
  };

  const handleCompleteClick = (submission) => {
    setSelectedSubmissionToComplete(submission);
    setCompleteDialogOpen(true);
    handleMenuClose(submission.id);
  };

  const handleStartDialogClose = () => {
    setStartDialogOpen(false);
    setSelectedSubmissionToStart(null);
    setIsStarting(false);
  };

  const handleCompleteDialogClose = () => {
    setCompleteDialogOpen(false);
    setSelectedSubmissionToComplete(null);
    setIsCompleting(false);
  };

  const handleConfirmStart = async () => {
    if (!selectedSubmissionToStart) {
      return;
    }

    const submissionId = selectedSubmissionToStart.id;

    if (!submissionId || typeof submissionId === "object") {
      return;
    }

    setIsStarting(true);

    try {
      if (handleStartSubmission) {
        const success = await handleStartSubmission(
          selectedSubmissionToStart,
          () => {
            if (onRefetch && typeof onRefetch === "function") {
              onRefetch();
            }
          }
        );

        if (success) {
          handleStartDialogClose();
        } else {
          setIsStarting(false);
        }
      } else {
        setIsStarting(false);
        handleStartDialogClose();
      }
    } catch (error) {
      setIsStarting(false);
    }
  };

  const handleConfirmComplete = async () => {
    if (!selectedSubmissionToComplete) {
      return;
    }

    const submissionId = selectedSubmissionToComplete.id;

    if (!submissionId || typeof submissionId === "object") {
      return;
    }

    setIsCompleting(true);

    try {
      if (handleCompleteAssessment) {
        const success = await handleCompleteAssessment(
          selectedSubmissionToComplete,
          () => {
            if (onRefetch && typeof onRefetch === "function") {
              onRefetch();
            }
          }
        );

        if (success) {
          handleCompleteDialogClose();
        } else {
          setIsCompleting(false);
        }
      } else {
        setIsCompleting(false);
        handleCompleteDialogClose();
      }
    } catch (error) {
      setIsCompleting(false);
    }
  };

  const canStartSubmission = (submission) => {
    return submission?.actions?.can_start === true;
  };

  const canCompleteAssessment = (submission) => {
    return submission?.actions?.can_complete === true;
  };

  const renderActivityLog = (submission) => {
    return (
      <Tooltip title="View History" arrow>
        <IconButton
          onClick={(e) => handleViewActivityClick(e, submission)}
          size="small"
          sx={styles.historyIconButton(theme)}>
          <RestoreIcon sx={{ fontSize: "20px" }} />
        </IconButton>
      </Tooltip>
    );
  };

  const getNoDataMessage = () => {
    if (searchQuery) {
      return `No results for "${searchQuery}"`;
    }
    return isAssessmentMode
      ? "No DA submissions currently in assessment"
      : "No DA submissions ready for assessment";
  };

  return (
    <>
      <TableContainer sx={styles.tableContainerStyles}>
        <Table stickyHeader sx={{ minWidth: 1200 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={styles.columnStyles.referenceNumber}>
                REFERENCE NO.
              </TableCell>
              <TableCell sx={styles.columnStyles.position}>EMPLOYEE</TableCell>
              <TableCell sx={styles.columnStyles.status}>STATUS</TableCell>
              <TableCell align="center" sx={styles.columnStyles.history}>
                HISTORY
              </TableCell>
              <TableCell sx={styles.columnStyles.dateCreated}>
                DATE SUBMITTED
              </TableCell>
              <TableCell align="center" sx={styles.columnStyles.actions}>
                ACTIONS
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoadingState ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={styles.loadingCell}>
                  <CircularProgress size={32} sx={styles.loadingSpinner} />
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={styles.errorCell}>
                  <Typography color="error">
                    Error loading data: {error.message || "Unknown error"}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : submissionsList.length > 0 ? (
              submissionsList.map((submission) => {
                return (
                  <TableRow
                    key={submission.id}
                    onClick={() => {
                      handleRowClick(submission);
                    }}
                    sx={styles.tableRowHover(theme)}>
                    <TableCell
                      sx={{
                        ...styles.columnStyles.referenceNumber,
                        ...styles.cellContentStyles,
                        ...styles.referenceNumberCell,
                      }}>
                      {submission.reference_number || "-"}
                    </TableCell>
                    <TableCell
                      sx={{
                        ...styles.columnStyles.position,
                        ...styles.cellContentStyles,
                      }}>
                      {renderEmployee(submission)}
                    </TableCell>
                    <TableCell sx={styles.columnStyles.status}>
                      {renderStatusChip(submission)}
                    </TableCell>
                    <TableCell align="center" sx={styles.columnStyles.history}>
                      {renderActivityLog(submission)}
                    </TableCell>
                    <TableCell
                      sx={{
                        ...styles.columnStyles.dateCreated,
                        ...styles.cellContentStyles,
                      }}>
                      {submission.created_at
                        ? dayjs(submission.created_at).format("MMM D, YYYY")
                        : "-"}
                    </TableCell>
                    <TableCell align="center" sx={styles.columnStyles.actions}>
                      <Tooltip title="Actions">
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMenuOpen(e, submission);
                          }}
                          size="small"
                          sx={styles.actionIconButton(theme)}>
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Menu
                        anchorEl={menuAnchor[submission.id]}
                        open={Boolean(menuAnchor[submission.id])}
                        onClose={() => handleMenuClose(submission.id)}
                        transformOrigin={{
                          horizontal: "right",
                          vertical: "top",
                        }}
                        anchorOrigin={{
                          horizontal: "right",
                          vertical: "bottom",
                        }}
                        PaperProps={{
                          sx: styles.actionMenu(theme),
                        }}
                        sx={{
                          zIndex: 10000,
                        }}>
                        {!isAssessmentMode && (
                          <MenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartClick(submission);
                            }}
                            disabled={!canStartSubmission(submission)}
                            sx={
                              canStartSubmission(submission)
                                ? styles.approveMenuItem
                                : styles.approveMenuItemDisabled
                            }>
                            <PlayArrowIcon fontSize="small" sx={{ mr: 1 }} />
                            Start Assessment
                          </MenuItem>
                        )}
                        {isAssessmentMode && (
                          <MenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCompleteClick(submission);
                            }}
                            disabled={!canCompleteAssessment(submission)}
                            sx={
                              canCompleteAssessment(submission)
                                ? styles.approveMenuItem
                                : styles.approveMenuItemDisabled
                            }>
                            <CheckCircleIcon fontSize="small" sx={{ mr: 1 }} />
                            Complete Assessment
                          </MenuItem>
                        )}
                      </Menu>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
                  align="center"
                  sx={styles.noDataContainer}>
                  <Box sx={styles.noDataBox}>
                    {CONSTANT.BUTTONS.NODATA.icon}
                    <Typography variant="h6" color="text.secondary">
                      No DA Submissions Found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {getNoDataMessage()}
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <MDAHistoryDialog
        historyDialogOpen={historyDialogOpen}
        onHistoryDialogClose={handleHistoryDialogClose}
        selectedDaHistory={selectedDaHistory}
      />

      <Dialog
        open={startDialogOpen}
        onClose={handleStartDialogClose}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            padding: 2,
            boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
            textAlign: "center",
          },
        }}>
        <DialogTitle sx={{ padding: 0, marginBottom: 2 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              marginBottom: 2,
            }}>
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                backgroundColor: "#1976d2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
              <PlayArrowIcon
                sx={{
                  color: "white",
                  fontSize: "30px",
                }}
              />
            </Box>
          </Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              color: "rgb(25, 45, 84)",
              marginBottom: 0,
            }}>
            Start Assessment
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ padding: 0, textAlign: "center" }}>
          <Typography
            variant="body1"
            sx={{
              marginBottom: 2,
              fontSize: "16px",
              color: "#333",
              fontWeight: 400,
            }}>
            Are you sure you want to <strong>Start Assessment</strong> for this
            DA Submission?
          </Typography>
          {selectedSubmissionToStart && (
            <Typography
              variant="body2"
              sx={{
                fontSize: "14px",
                color: "#666",
                fontWeight: 500,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}>
              {selectedSubmissionToStart?.reference_number}
            </Typography>
          )}
        </DialogContent>
        <DialogActions
          sx={{
            justifyContent: "center",
            padding: 0,
            marginTop: 3,
            gap: 2,
          }}>
          <Button
            onClick={handleStartDialogClose}
            variant="outlined"
            sx={{
              textTransform: "uppercase",
              fontWeight: 600,
              borderColor: "#757575",
              color: "#757575",
              paddingX: 3,
              paddingY: 1,
              borderRadius: 2,
              "&:hover": {
                borderColor: "#616161",
                backgroundColor: "rgba(117, 117, 117, 0.04)",
              },
            }}
            disabled={isStarting}>
            CANCEL
          </Button>
          <Button
            onClick={handleConfirmStart}
            variant="contained"
            sx={{
              textTransform: "uppercase",
              fontWeight: 600,
              backgroundColor: "#1976d2",
              paddingX: 3,
              paddingY: 1,
              borderRadius: 2,
              "&:hover": {
                backgroundColor: "#1565c0",
              },
            }}
            disabled={isStarting}>
            {isStarting ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              "CONFIRM"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={completeDialogOpen}
        onClose={handleCompleteDialogClose}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            padding: 2,
            boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
            textAlign: "center",
          },
        }}>
        <DialogTitle sx={{ padding: 0, marginBottom: 2 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              marginBottom: 2,
            }}>
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                backgroundColor: "#2e7d32",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
              <CheckCircleIcon
                sx={{
                  color: "white",
                  fontSize: "30px",
                }}
              />
            </Box>
          </Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              color: "rgb(25, 45, 84)",
              marginBottom: 0,
            }}>
            Complete Assessment
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ padding: 0, textAlign: "center" }}>
          <Typography
            variant="body1"
            sx={{
              marginBottom: 2,
              fontSize: "16px",
              color: "#333",
              fontWeight: 400,
            }}>
            Are you sure you want to <strong>Complete Assessment</strong> for
            this DA Submission?
          </Typography>
          {selectedSubmissionToComplete && (
            <Typography
              variant="body2"
              sx={{
                fontSize: "14px",
                color: "#666",
                fontWeight: 500,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}>
              {selectedSubmissionToComplete?.reference_number}
            </Typography>
          )}
        </DialogContent>
        <DialogActions
          sx={{
            justifyContent: "center",
            padding: 0,
            marginTop: 3,
            gap: 2,
          }}>
          <Button
            onClick={handleCompleteDialogClose}
            variant="outlined"
            sx={{
              textTransform: "uppercase",
              fontWeight: 600,
              borderColor: "#757575",
              color: "#757575",
              paddingX: 3,
              paddingY: 1,
              borderRadius: 2,
              "&:hover": {
                borderColor: "#616161",
                backgroundColor: "rgba(117, 117, 117, 0.04)",
              },
            }}
            disabled={isCompleting}>
            CANCEL
          </Button>
          <Button
            onClick={handleConfirmComplete}
            variant="contained"
            sx={{
              textTransform: "uppercase",
              fontWeight: 600,
              backgroundColor: "#2e7d32",
              paddingX: 3,
              paddingY: 1,
              borderRadius: 2,
              "&:hover": {
                backgroundColor: "#1b5e20",
              },
            }}
            disabled={isCompleting}>
            {isCompleting ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              "CONFIRM"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DaFormReceivingTable;
