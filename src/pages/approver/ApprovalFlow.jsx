import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  CircularProgress,
  TableRow,
  Box,
  TextField,
  Checkbox,
  FormControlLabel,
  Button,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  alpha,
  Fade,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  Divider,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ArchiveIcon from "@mui/icons-material/Archive";
import AddIcon from "@mui/icons-material/Add";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import RestoreIcon from "@mui/icons-material/Restore";
import HelpIcon from "@mui/icons-material/Help";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PersonIcon from "@mui/icons-material/Person";
import { FormProvider, useForm } from "react-hook-form";
import { useSnackbar } from "notistack";
import "../../pages/GeneralStyle.scss";
import {
  useGetApprovalFlowsQuery,
  useDeleteApprovalFlowMutation,
  useCreateApprovalFlowMutation,
  useUpdateApprovalFlowMutation,
} from "../../features/api/approvalsetting/approvalFlowApi";
import { CONSTANT } from "../../config";
import useDebounce from "../../hooks/useDebounce";
import dayjs from "dayjs";
import CloseIcon from "@mui/icons-material/Close";
import ApprovalFlowModal from "../../components/modal/approvalSettings/approvalFlowModal";

const useDebounceInternal = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const CustomSearchBar = ({
  searchQuery,
  setSearchQuery,
  showArchived,
  setShowArchived,
  isLoading = false,
}) => {
  const iconColor = showArchived ? "#d32f2f" : "rgb(33, 61, 112)";
  const labelColor = showArchived ? "#d32f2f" : "rgb(33, 61, 112)";

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
      <FormControlLabel
        control={
          <Checkbox
            checked={showArchived}
            onChange={(e) => setShowArchived(e.target.checked)}
            disabled={isLoading}
            icon={<ArchiveIcon sx={{ color: iconColor }} />}
            checkedIcon={<ArchiveIcon sx={{ color: iconColor }} />}
            size="small"
          />
        }
        label="ARCHIVED"
        sx={{
          margin: 0,
          border: `1px solid ${showArchived ? "#d32f2f" : "#ccc"}`,
          borderRadius: "8px",
          paddingLeft: "8px",
          paddingRight: "12px",
          height: "36px",
          backgroundColor: showArchived ? "rgba(211, 47, 47, 0.04)" : "white",
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            backgroundColor: showArchived
              ? "rgba(211, 47, 47, 0.08)"
              : "#f5f5f5",
            borderColor: showArchived ? "#d32f2f" : "rgb(33, 61, 112)",
          },
          "& .MuiFormControlLabel-label": {
            fontSize: "12px",
            fontWeight: 600,
            color: labelColor,
            letterSpacing: "0.5px",
          },
        }}
      />

      <TextField
        placeholder="Search Approval Flows..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        disabled={isLoading}
        size="small"
        InputProps={{
          startAdornment: (
            <SearchIcon
              sx={{
                color: isLoading ? "#ccc" : "#666",
                marginRight: 1,
                fontSize: "20px",
              }}
            />
          ),
          endAdornment: isLoading && (
            <CircularProgress size={16} sx={{ marginLeft: 1 }} />
          ),
          sx: {
            height: "36px",
            width: "320px",
            backgroundColor: "white",
            transition: "all 0.2s ease-in-out",
            "& .MuiOutlinedInput-root": {
              height: "36px",
              "& fieldset": {
                borderColor: "#ccc",
                transition: "border-color 0.2s ease-in-out",
              },
              "&:hover fieldset": {
                borderColor: "rgb(33, 61, 112)",
              },
              "&.Mui-focused fieldset": {
                borderColor: "rgb(33, 61, 112)",
                borderWidth: "2px",
              },
              "&.Mui-disabled": {
                backgroundColor: "#f5f5f5",
              },
            },
          },
        }}
        sx={{
          "& .MuiInputBase-input": {
            fontSize: "14px",
            "&::placeholder": {
              opacity: 0.7,
            },
          },
        }}
      />
    </Box>
  );
};

const StepsViewDialog = ({ open, onClose, flow }) => {
  const approvers = flow?.approvers || [];
  const sortedApprovers = [...approvers].sort(
    (a, b) => a.step_number - b.step_number
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          minWidth: "500px",
          width: "90%",
          maxWidth: "600px",
          minHeight: "500px",
        },
      }}>
      <DialogTitle sx={{ position: "relative", pb: 1 }}>
        <div>
          <Typography variant="h5" sx={{ fontWeight: 600, color: "#213D70" }}>
            APPROVAL STEPS
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {flow?.name}
          </Typography>
        </div>
        <IconButton
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: "#666",
            "&:hover": {
              backgroundColor: "rgba(0, 0, 0, 0.04)",
            },
          }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3, pb: 4, px: 3, minHeight: "400px" }}>
        {sortedApprovers.length > 0 ? (
          <Box>
            {sortedApprovers.map((approver, index) => (
              <Box
                key={`${approver.step_id}-${approver.approver_id}`}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  mb: index < sortedApprovers.length - 1 ? 4 : 0,
                  py: 1,
                }}>
                <Avatar
                  sx={{
                    bgcolor: "#213D70",
                    mr: 2,
                    width: 48,
                    height: 48,
                  }}>
                  <PersonIcon sx={{ color: "white" }} />
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 0.5,
                    }}>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 600, color: "#000" }}>
                      {approver.approver_full_name}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#213D70",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        fontSize: "0.75rem",
                      }}>
                      STEP {approver.step_number}
                    </Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#666",
                      textTransform: "uppercase",
                      fontSize: "0.875rem",
                    }}>
                    {approver.approver_position || "No Position Specified"}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        ) : (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <AccountTreeIcon sx={{ fontSize: 60, color: "#ccc", mb: 2 }} />
            <Typography variant="body1" color="text.secondary">
              No approval steps configured
            </Typography>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

const ApprovalFlow = () => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedFlow, setSelectedFlow] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const [menuAnchor, setMenuAnchor] = useState({});
  const [selectedRowForMenu, setSelectedRowForMenu] = useState(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedFlowForAction, setSelectedFlowForAction] = useState(null);

  const [stepsDialogOpen, setStepsDialogOpen] = useState(false);
  const [selectedFlowForSteps, setSelectedFlowForSteps] = useState(null);

  const [isLoading, setIsLoading] = useState(false);

  const methods = useForm({
    defaultValues: {
      name: "",
      description: "",
      version: 1,
      is_active: true,
      charging_id: null,
      form_id: null,
      receiver_id: null,
      steps: [],
    },
  });

  const debounceValue = useDebounceInternal(searchQuery, 500);

  const queryParams = useMemo(() => {
    const params = {
      page,
      per_page: rowsPerPage,
      status: showArchived ? "inactive" : "active",
      pagination: true,
    };

    if (debounceValue && debounceValue.trim() !== "") {
      params.search = debounceValue.trim();
    }

    return params;
  }, [debounceValue, page, rowsPerPage, showArchived]);

  const {
    data: approvalFlowsData,
    isLoading: queryLoading,
    isFetching,
    refetch,
    error,
  } = useGetApprovalFlowsQuery(queryParams, {
    refetchOnMountOrArgChange: true,
    skip: false,
  });

  const [createApprovalFlow] = useCreateApprovalFlowMutation();
  const [updateApprovalFlow] = useUpdateApprovalFlowMutation();
  const [deleteApprovalFlow] = useDeleteApprovalFlowMutation();

  const approvalFlowsList = useMemo(
    () => approvalFlowsData?.result?.data || [],
    [approvalFlowsData]
  );

  const handleSearchChange = useCallback((newSearchQuery) => {
    setSearchQuery(newSearchQuery);
    setPage(1);
  }, []);

  const handleChangeArchived = useCallback((newShowArchived) => {
    setShowArchived(newShowArchived);
    setPage(1);
  }, []);

  const handleAddNew = useCallback(() => {
    setMenuAnchor({});
    setSelectedRowForMenu(null);
    setSelectedFlow(null);
    setModalMode("create");
    setModalOpen(true);
  }, []);

  const handleRowClick = useCallback((flow) => {
    setMenuAnchor({});
    setSelectedRowForMenu(null);
    setSelectedFlow(flow);
    setModalMode("view");
    setModalOpen(true);
  }, []);

  const handleEditFlow = useCallback((flow) => {
    setMenuAnchor({});
    setSelectedRowForMenu(null);
    setSelectedFlow(flow);
    setModalMode("edit");
    setModalOpen(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setModalOpen(false);
    setSelectedFlow(null);
    setModalMode("create");
    setModalLoading(false);
  }, []);

  const handleModalSave = useCallback(
    async (flowData, mode) => {
      setModalLoading(true);
      setIsLoading(true);

      try {
        if (mode === "create") {
          await createApprovalFlow(flowData).unwrap();
        } else if (mode === "edit") {
          await updateApprovalFlow({
            id: selectedFlow.id,
            data: flowData,
          }).unwrap();
        }

        enqueueSnackbar(
          `Flow ${mode === "create" ? "created" : "updated"} successfully!`,
          { variant: "success", autoHideDuration: 2000 }
        );

        refetch();
        handleModalClose();
      } catch (error) {
        enqueueSnackbar("Failed to save flow. Please try again.", {
          variant: "error",
          autoHideDuration: 2000,
        });
      } finally {
        setModalLoading(false);
        setIsLoading(false);
      }
    },
    [
      refetch,
      selectedFlow,
      enqueueSnackbar,
      handleModalClose,
      createApprovalFlow,
      updateApprovalFlow,
    ]
  );

  const handleMenuOpen = useCallback((event, flow) => {
    event.stopPropagation();
    event.preventDefault();
    setMenuAnchor((prev) => ({ ...prev, [flow.id]: event.currentTarget }));
    setSelectedRowForMenu(flow);
  }, []);

  const handleMenuClose = useCallback((flowId) => {
    setMenuAnchor((prev) => ({ ...prev, [flowId]: null }));
    setSelectedRowForMenu(null);
  }, []);

  const handleArchiveRestoreClick = useCallback(
    (flow, event) => {
      if (event) {
        event.stopPropagation();
        event.preventDefault();
      }
      setSelectedFlowForAction(flow);
      setConfirmOpen(true);
      handleMenuClose(flow.id);
    },
    [handleMenuClose]
  );

  const handleArchiveRestoreConfirm = async () => {
    if (!selectedFlowForAction) return;

    setIsLoading(true);
    try {
      await deleteApprovalFlow(selectedFlowForAction.id).unwrap();

      enqueueSnackbar(
        selectedFlowForAction.deleted_at
          ? "Flow restored successfully!"
          : "Flow archived successfully!",
        { variant: "success", autoHideDuration: 2000 }
      );

      refetch();
    } catch (error) {
      enqueueSnackbar("Action failed. Please try again.", {
        variant: "error",
        autoHideDuration: 2000,
      });
    } finally {
      setConfirmOpen(false);
      setSelectedFlowForAction(null);
      setIsLoading(false);
    }
  };

  const handlePageChange = useCallback((event, newPage) => {
    setPage(newPage + 1);
  }, []);

  const handleRowsPerPageChange = useCallback((event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1);
  }, []);

  const handleViewSteps = useCallback((event, flow) => {
    event.stopPropagation();
    event.preventDefault();
    setSelectedFlowForSteps(flow);
    setStepsDialogOpen(true);
  }, []);

  const handleStepsDialogClose = useCallback(() => {
    setStepsDialogOpen(false);
    setSelectedFlowForSteps(null);
  }, []);

  const renderApprovalSteps = (flow) => {
    const steps = flow.steps || [];
    const approvers = flow.approvers || [];

    if (steps.length === 0 && approvers.length === 0) return "-";

    return (
      <Tooltip title="View approval steps" arrow>
        <IconButton
          onClick={(e) => handleViewSteps(e, flow)}
          sx={{
            color: "rgb(33, 61, 112)",
            "&:hover": {
              backgroundColor: "rgba(33, 61, 112, 0.08)",
            },
          }}>
          <VisibilityIcon sx={{ fontSize: "24px" }} />
        </IconButton>
      </Tooltip>
    );
  };

  const renderReceiver = (receiver) => {
    if (!receiver) return "-";

    return (
      <Typography variant="body2">
        {receiver.full_name || receiver.name || "Unknown"}
      </Typography>
    );
  };

  const renderStatus = (flow) => {
    const isActive = flow.is_active && !flow.deleted_at;

    return (
      <Chip
        label={isActive ? "ACTIVE" : "INACTIVE"}
        size="small"
        sx={{
          backgroundColor: isActive ? "#e8f5e8" : "#fff3e0",
          color: isActive ? "#2e7d32" : "#ed6c02",
          border: `1px solid ${isActive ? "#4caf50" : "#ff9800"}`,
          fontWeight: 600,
          fontSize: "11px",
          height: "24px",
          borderRadius: "12px",
          "& .MuiChip-label": {
            padding: "0 8px",
          },
        }}
      />
    );
  };

  const isLoadingState = queryLoading || isFetching || isLoading;

  return (
    <FormProvider {...methods}>
      <Box
        sx={{
          width: "100%",
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          backgroundColor: "#fafafa",
        }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
            minHeight: "72px",
            padding: "16px 14px",
            backgroundColor: "white",
            borderBottom: "1px solid #e0e0e0",
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.4 }}>
            <Typography className="header">APPROVAL FLOWS</Typography>
            <Fade in={!isLoadingState}>
              <Button
                variant="contained"
                onClick={handleAddNew}
                startIcon={<AddIcon />}
                disabled={isLoadingState}
                sx={{
                  backgroundColor: "rgb(33, 61, 112)",
                  height: "38px",
                  width: "160px",
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "14px",
                  borderRadius: "8px",
                  boxShadow: "0 2px 8px rgba(33, 61, 112, 0.2)",
                  transition: "all 0.2s ease-in-out",
                  "&:hover": {
                    backgroundColor: "rgb(25, 45, 84)",
                    boxShadow: "0 4px 12px rgba(33, 61, 112, 0.3)",
                    transform: "translateY(-1px)",
                  },
                  "&:disabled": {
                    backgroundColor: "#ccc",
                    boxShadow: "none",
                  },
                }}>
                CREATE FLOW
              </Button>
            </Fade>
          </Box>

          <CustomSearchBar
            searchQuery={searchQuery}
            setSearchQuery={handleSearchChange}
            showArchived={showArchived}
            setShowArchived={handleChangeArchived}
            isLoading={isLoadingState}
          />
        </Box>

        <Box
          sx={{
            flex: 1,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            backgroundColor: "white",
          }}>
          <TableContainer
            sx={{
              flex: 1,
              overflow: "auto",
              backgroundColor: "#fafafa",
              "& .MuiTableCell-head": {
                backgroundColor: "#f8f9fa",
                fontWeight: 700,
                fontSize: "18px",
                color: "rgb(33, 61, 112)",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                borderBottom: "2px solid #e0e0e0",
                position: "sticky",
                top: 0,
                zIndex: 10,
                height: "48px",
                padding: "8px 16px",
              },
              "& .MuiTableCell-body": {
                fontSize: "16px",
                color: "#333",
                borderBottom: "1px solid #f0f0f0",
                padding: "8px 16px",
                height: "52px",
                backgroundColor: "white",
              },
              "& .MuiTableRow-root": {
                transition: "background-color 0.2s ease-in-out",
                "&:hover": {
                  backgroundColor: "#f8f9fa",
                  cursor: "pointer",
                  "& .MuiTableCell-root": {
                    backgroundColor: "transparent",
                  },
                },
              },
            }}>
            <Table stickyHeader sx={{ minWidth: 1200 }}>
              <TableHead>
                <TableRow>
                  <TableCell align="left" sx={{ width: 80, minWidth: 80 }}>
                    ID
                  </TableCell>
                  <TableCell sx={{ width: 400, minWidth: 400 }}>
                    FLOW NAME
                  </TableCell>
                  <TableCell sx={{ width: 300, minWidth: 300 }}>FORM</TableCell>
                  <TableCell sx={{ width: 450, minWidth: 450 }}>
                    CHARGING
                  </TableCell>
                  <TableCell sx={{ width: 250, minWidth: 250 }}>
                    RECEIVER
                  </TableCell>
                  <TableCell align="center" sx={{ width: 150, minWidth: 150 }}>
                    APPROVERS
                  </TableCell>
                  <TableCell align="center" sx={{ width: 150, minWidth: 150 }}>
                    STATUS
                  </TableCell>
                  <TableCell sx={{ width: 200, minWidth: 200 }}>
                    LAST MODIFIED
                  </TableCell>
                  <TableCell align="center" sx={{ width: 100, minWidth: 100 }}>
                    ACTIONS
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoadingState ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                      <CircularProgress
                        size={32}
                        sx={{ color: "rgb(33, 61, 112)" }}
                      />
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                      <Typography color="error">
                        Error loading data: {error.message || "Unknown error"}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : approvalFlowsList.length > 0 ? (
                  approvalFlowsList.map((flow) => (
                    <TableRow
                      key={flow.id}
                      sx={{
                        cursor: "pointer",
                        "&:hover": {
                          backgroundColor: alpha(
                            theme.palette.primary.main,
                            0.04
                          ),
                          "& .MuiTableCell-root": {
                            backgroundColor: "transparent",
                          },
                        },
                        transition: "background-color 0.2s ease",
                      }}>
                      <TableCell
                        align="left"
                        onClick={() => handleRowClick(flow)}>
                        {flow.id}
                      </TableCell>
                      <TableCell onClick={() => handleRowClick(flow)}>
                        {flow.name}
                      </TableCell>
                      <TableCell onClick={() => handleRowClick(flow)}>
                        <Typography sx={{ fontWeight: 600 }}>
                          {flow.form?.name || "-"}
                        </Typography>
                      </TableCell>
                      <TableCell onClick={() => handleRowClick(flow)}>
                        <Typography>{flow.charging?.name || "-"}</Typography>
                      </TableCell>
                      <TableCell onClick={() => handleRowClick(flow)}>
                        {renderReceiver(flow.receiver)}
                      </TableCell>
                      <TableCell
                        align="center"
                        onClick={() => handleRowClick(flow)}>
                        {renderApprovalSteps(flow)}
                      </TableCell>
                      <TableCell
                        align="center"
                        onClick={() => handleRowClick(flow)}>
                        {renderStatus(flow)}
                      </TableCell>
                      <TableCell onClick={() => handleRowClick(flow)}>
                        <Typography variant="body2">
                          {flow.updated_at
                            ? dayjs(flow.updated_at).format("MMM D, YYYY")
                            : "-"}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          onClick={(e) => handleMenuOpen(e, flow)}
                          size="small"
                          sx={{
                            color: "rgb(33, 61, 112)",
                            "&:hover": {
                              backgroundColor: "rgba(33, 61, 112, 0.04)",
                            },
                          }}>
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                        <Menu
                          anchorEl={menuAnchor[flow.id]}
                          open={Boolean(menuAnchor[flow.id])}
                          onClose={() => handleMenuClose(flow.id)}
                          transformOrigin={{
                            horizontal: "right",
                            vertical: "top",
                          }}
                          anchorOrigin={{
                            horizontal: "right",
                            vertical: "bottom",
                          }}
                          sx={{
                            zIndex: 10000,
                          }}>
                          <MenuItem
                            onClick={(e) => handleArchiveRestoreClick(flow, e)}
                            sx={{
                              fontSize: "0.875rem",
                              color: flow.deleted_at
                                ? theme.palette.success.main
                                : "#d32f2f",
                            }}>
                            {flow.deleted_at ? (
                              <>
                                <RestoreIcon fontSize="small" sx={{ mr: 1 }} />
                                Restore
                              </>
                            ) : (
                              <>
                                <ArchiveIcon
                                  fontSize="small"
                                  sx={{ mr: 1, color: "#d32f2f" }}
                                />
                                Archive
                              </>
                            )}
                          </MenuItem>
                        </Menu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      align="center"
                      sx={{
                        py: 8,
                        borderBottom: "none",
                        color: "#666",
                        fontSize: "16px",
                      }}>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 2,
                        }}>
                        {CONSTANT.BUTTONS.NODATA.icon}
                        <Typography variant="h6" color="text.secondary">
                          No approval flows found
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {searchQuery
                            ? `No results for "${searchQuery}"`
                            : showArchived
                            ? "No archived flows"
                            : "No active flows"}
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Box
            sx={{
              borderTop: "1px solid #e0e0e0",
              backgroundColor: "#f8f9fa",
              flexShrink: 0,
              "& .MuiTablePagination-root": {
                color: "#666",
                "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
                  {
                    fontSize: "14px",
                    fontWeight: 500,
                  },
                "& .MuiTablePagination-select": {
                  fontSize: "14px",
                },
                "& .MuiIconButton-root": {
                  color: "rgb(33, 61, 112)",
                  "&:hover": {
                    backgroundColor: "rgba(33, 61, 112, 0.04)",
                  },
                  "&.Mui-disabled": {
                    color: "#ccc",
                  },
                },
              },
            }}>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50, 100]}
              component="div"
              count={approvalFlowsData?.result?.total || 0}
              rowsPerPage={rowsPerPage}
              page={Math.max(0, page - 1)}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
              sx={{
                "& .MuiTablePagination-toolbar": {
                  paddingLeft: "24px",
                  paddingRight: "24px",
                },
              }}
            />
          </Box>
        </Box>

        <Dialog
          open={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          maxWidth="xs"
          fullWidth
          PaperProps={{
            sx: { borderRadius: 3 },
          }}>
          <DialogTitle>
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              mb={1}>
              <HelpIcon sx={{ fontSize: 60, color: "#ff4400" }} />
            </Box>
            <Typography
              variant="h6"
              fontWeight="bold"
              textAlign="center"
              color="rgb(33, 61, 112)">
              Confirmation
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" gutterBottom textAlign="center">
              Are you sure you want to{" "}
              <strong>
                {selectedFlowForAction?.deleted_at ? "restore" : "archive"}
              </strong>{" "}
              this approval flow?
            </Typography>
            {selectedFlowForAction && (
              <Typography
                variant="body2"
                color="text.secondary"
                className="confirmation-dialog__flow-name">
                {selectedFlowForAction.name}
              </Typography>
            )}
          </DialogContent>
          <DialogActions className="confirmation-dialog__actions">
            <Button
              onClick={() => setConfirmOpen(false)}
              variant="outlined"
              color="error"
              className="confirmation-dialog__cancel-button">
              Cancel
            </Button>
            <Button
              onClick={handleArchiveRestoreConfirm}
              variant="contained"
              color="success"
              className="confirmation-dialog__confirm-button">
              Confirm
            </Button>
          </DialogActions>
        </Dialog>

        <StepsViewDialog
          open={stepsDialogOpen}
          onClose={handleStepsDialogClose}
          flow={selectedFlowForSteps}
        />

        <FormProvider {...methods}>
          <ApprovalFlowModal
            open={modalOpen}
            onClose={handleModalClose}
            onSave={handleModalSave}
            selectedEntry={selectedFlow}
            isLoading={modalLoading}
            mode={modalMode}
            keepMounted={false}
            disableAutoFocus={false}
            disableEnforceFocus={false}
            disableRestoreFocus={false}
            className="approval-flow-modal"
            PaperProps={{
              className: "approval-flow-modal__paper",
            }}
          />
        </FormProvider>
      </Box>
    </FormProvider>
  );
};

export default ApprovalFlow;
