import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
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
  useMediaQuery,
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
import CloseIcon from "@mui/icons-material/Close";
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
import dayjs from "dayjs";
import ApprovalFlowModal from "../../components/modal/approvalSettings/approvalFlowModal";
import {
  MainContainer,
  HeaderContainer,
  HeaderContent,
  SearchBarContainer,
  ArchivedIconButton,
  ArchivedFormControl,
  SearchTextField,
  CreateButton,
  CreateIconButton,
  TableContentContainer,
  StyledTableContainer,
  StyledTableRow,
  StatusChip,
  PaginationContainer,
  NoDataContainer,
  StepsDialog,
  StepsDialogTitle,
  StepsDialogContent,
  StepContainer,
  StepAvatar,
  StepInfoContainer,
  StepHeaderContainer,
  ConfirmDialog,
  ConfirmDialogActions,
  ViewStepsIconButton,
  MenuIconButton,
  CloseIconButton,
  FlowNameContainer,
  EmptyStepsContainer,
} from "./ApprovalFlowStyles";

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
  const theme = useTheme();
  const isVerySmall = useMediaQuery("(max-width:369px)");

  return (
    <SearchBarContainer isVerySmall={isVerySmall}>
      {isVerySmall ? (
        <ArchivedIconButton
          onClick={() => setShowArchived(!showArchived)}
          disabled={isLoading}
          size="small"
          showArchived={showArchived}>
          <ArchiveIcon sx={{ fontSize: "18px" }} />
        </ArchivedIconButton>
      ) : (
        <ArchivedFormControl
          control={
            <Checkbox
              checked={showArchived}
              onChange={(e) => setShowArchived(e.target.checked)}
              disabled={isLoading}
              icon={
                <ArchiveIcon
                  sx={{ color: showArchived ? "#d32f2f" : "rgb(33, 61, 112)" }}
                />
              }
              checkedIcon={
                <ArchiveIcon
                  sx={{ color: showArchived ? "#d32f2f" : "rgb(33, 61, 112)" }}
                />
              }
              size="small"
            />
          }
          label="ARCHIVED"
          showArchived={showArchived}
        />
      )}

      <SearchTextField
        placeholder={isVerySmall ? "Search..." : "Search Approval Flows..."}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        disabled={isLoading}
        size="small"
        isVerySmall={isVerySmall}
        isLoading={isLoading}
        InputProps={{
          startAdornment: (
            <SearchIcon
              sx={{
                color: isLoading ? "#ccc" : "#666",
                marginRight: 1,
                fontSize: isVerySmall ? "18px" : "20px",
              }}
            />
          ),
          endAdornment: isLoading && (
            <CircularProgress size={16} sx={{ marginLeft: 1 }} />
          ),
        }}
      />
    </SearchBarContainer>
  );
};

const StepsViewDialog = ({ open, onClose, flow }) => {
  const approvers = flow?.approvers || [];
  const sortedApprovers = [...approvers].sort(
    (a, b) => a.step_number - b.step_number
  );

  return (
    <StepsDialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <StepsDialogTitle>
        <div>
          <Typography variant="h5" sx={{ fontWeight: 600, color: "#213D70" }}>
            APPROVAL STEPS
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {flow?.name}
          </Typography>
        </div>
        <CloseIconButton onClick={onClose}>
          <CloseIcon />
        </CloseIconButton>
      </StepsDialogTitle>

      <StepsDialogContent>
        {sortedApprovers.length > 0 ? (
          <Box>
            {sortedApprovers.map((approver, index) => (
              <StepContainer
                key={`${approver.step_id}-${approver.approver_id}`}
                isLast={index >= sortedApprovers.length - 1}>
                <StepAvatar>
                  <PersonIcon sx={{ color: "white" }} />
                </StepAvatar>
                <StepInfoContainer>
                  <StepHeaderContainer>
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
                  </StepHeaderContainer>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#666",
                      textTransform: "uppercase",
                      fontSize: "0.875rem",
                    }}>
                    {approver.approver_position || "No Position Specified"}
                  </Typography>
                </StepInfoContainer>
              </StepContainer>
            ))}
          </Box>
        ) : (
          <EmptyStepsContainer>
            <AccountTreeIcon sx={{ fontSize: 60, color: "#ccc", mb: 2 }} />
            <Typography variant="body1" color="text.secondary">
              No approval steps configured
            </Typography>
          </EmptyStepsContainer>
        )}
      </StepsDialogContent>
    </StepsDialog>
  );
};

const ApprovalFlow = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between(600, 1038));
  const isVerySmall = useMediaQuery("(max-width:369px)");
  const { enqueueSnackbar } = useSnackbar();

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
      status: showArchived ? "inactive" : "active",
      pagination: "none",
    };

    if (debounceValue && debounceValue.trim() !== "") {
      params.search = debounceValue.trim();
    }

    return params;
  }, [debounceValue, showArchived]);

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
    () => approvalFlowsData?.result || [],
    [approvalFlowsData]
  );

  const handleSearchChange = useCallback((newSearchQuery) => {
    setSearchQuery(newSearchQuery);
  }, []);

  const handleChangeArchived = useCallback((newShowArchived) => {
    setShowArchived(newShowArchived);
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
        <ViewStepsIconButton onClick={(e) => handleViewSteps(e, flow)}>
          <VisibilityIcon sx={{ fontSize: "24px" }} />
        </ViewStepsIconButton>
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
      <StatusChip
        label={isActive ? "ACTIVE" : "INACTIVE"}
        size="small"
        isActive={isActive}
      />
    );
  };

  const isLoadingState = queryLoading || isFetching || isLoading;

  return (
    <FormProvider {...methods}>
      <MainContainer>
        <HeaderContainer isMobile={isMobile} isTablet={isTablet}>
          <HeaderContent
            isMobile={isMobile}
            isTablet={isTablet}
            isVerySmall={isVerySmall}>
            <Typography className="header">
              {isVerySmall ? "APPROVAL FLOWS" : "APPROVAL FLOWS"}
            </Typography>
            <Fade in={!isLoadingState}>
              {isVerySmall ? (
                <CreateIconButton
                  onClick={handleAddNew}
                  disabled={isLoadingState}>
                  <AddIcon sx={{ fontSize: "18px" }} />
                </CreateIconButton>
              ) : (
                <CreateButton
                  variant="contained"
                  onClick={handleAddNew}
                  startIcon={<AddIcon />}
                  disabled={isLoadingState}
                  isMobile={isMobile}>
                  CREATE
                </CreateButton>
              )}
            </Fade>
          </HeaderContent>

          <CustomSearchBar
            searchQuery={searchQuery}
            setSearchQuery={handleSearchChange}
            showArchived={showArchived}
            setShowArchived={handleChangeArchived}
            isLoading={isLoadingState}
          />
        </HeaderContainer>

        <TableContentContainer>
          <StyledTableContainer isMobile={isMobile} isVerySmall={isVerySmall}>
            <Table stickyHeader sx={{ minWidth: isMobile ? 800 : 1200 }}>
              <TableHead>
                <TableRow>
                  <TableCell
                    align="left"
                    sx={{
                      width: isVerySmall ? 50 : isMobile ? 60 : 80,
                      minWidth: isVerySmall ? 50 : isMobile ? 60 : 80,
                      display: isVerySmall ? "none" : "table-cell",
                    }}>
                    ID
                  </TableCell>
                  <TableCell
                    sx={{
                      width: isVerySmall ? 200 : isMobile ? 250 : 400,
                      minWidth: isVerySmall ? 200 : isMobile ? 250 : 400,
                    }}>
                    {isVerySmall ? "FLOW" : "FLOW NAME"}
                  </TableCell>
                  <TableCell
                    sx={{
                      width: isVerySmall ? 150 : isMobile ? 200 : 300,
                      minWidth: isVerySmall ? 150 : isMobile ? 200 : 300,
                      display: isVerySmall ? "none" : "table-cell",
                    }}>
                    FORM
                  </TableCell>
                  <TableCell
                    sx={{
                      width: isVerySmall ? 150 : isMobile ? 250 : 450,
                      minWidth: isVerySmall ? 150 : isMobile ? 250 : 450,
                      display: isVerySmall ? "none" : "table-cell",
                    }}>
                    CHARGING
                  </TableCell>
                  <TableCell
                    sx={{
                      width: isVerySmall ? 120 : isMobile ? 180 : 250,
                      minWidth: isVerySmall ? 120 : isMobile ? 180 : 250,
                      display: isVerySmall ? "none" : "table-cell",
                    }}>
                    RECEIVER
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      width: isVerySmall ? 80 : isMobile ? 100 : 150,
                      minWidth: isVerySmall ? 80 : isMobile ? 100 : 150,
                    }}>
                    {isVerySmall ? "STEPS" : "APPROVERS"}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      width: isVerySmall ? 70 : isMobile ? 100 : 150,
                      minWidth: isVerySmall ? 70 : isMobile ? 100 : 150,
                    }}>
                    STATUS
                  </TableCell>
                  <TableCell
                    sx={{
                      width: isVerySmall ? 100 : isMobile ? 150 : 200,
                      minWidth: isVerySmall ? 100 : isMobile ? 150 : 200,
                      display: isVerySmall ? "none" : "table-cell",
                    }}>
                    {isMobile ? "MODIFIED" : "LAST MODIFIED"}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      width: isVerySmall ? 60 : isMobile ? 80 : 100,
                      minWidth: isVerySmall ? 60 : isMobile ? 80 : 100,
                    }}>
                    {isVerySmall ? "" : "ACTIONS"}
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
                    <StyledTableRow key={flow.id}>
                      <TableCell
                        align="left"
                        onClick={() => handleRowClick(flow)}
                        sx={{ display: isVerySmall ? "none" : "table-cell" }}>
                        {flow.id}
                      </TableCell>
                      <TableCell onClick={() => handleRowClick(flow)}>
                        {flow.name}
                      </TableCell>
                      <TableCell
                        onClick={() => handleRowClick(flow)}
                        sx={{ display: isVerySmall ? "none" : "table-cell" }}>
                        <Typography sx={{ fontWeight: 600 }}>
                          {flow.form?.name || "-"}
                        </Typography>
                      </TableCell>
                      <TableCell
                        onClick={() => handleRowClick(flow)}
                        sx={{ display: isVerySmall ? "none" : "table-cell" }}>
                        <Typography>{flow.charging?.name || "-"}</Typography>
                      </TableCell>
                      <TableCell
                        onClick={() => handleRowClick(flow)}
                        sx={{ display: isVerySmall ? "none" : "table-cell" }}>
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
                      <TableCell
                        onClick={() => handleRowClick(flow)}
                        sx={{ display: isVerySmall ? "none" : "table-cell" }}>
                        <Typography variant="body2">
                          {flow.updated_at
                            ? dayjs(flow.updated_at).format("MMM D, YYYY")
                            : "-"}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <MenuIconButton
                          onClick={(e) => handleMenuOpen(e, flow)}
                          size="small">
                          <MoreVertIcon fontSize="small" />
                        </MenuIconButton>
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
                          sx={{ zIndex: 10000 }}>
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
                    </StyledTableRow>
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
                      <NoDataContainer>
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
                      </NoDataContainer>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </StyledTableContainer>
        </TableContentContainer>

        <ConfirmDialog
          open={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          maxWidth="xs"
          fullWidth>
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
              <FlowNameContainer>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  textAlign="center">
                  {selectedFlowForAction.name}
                </Typography>
              </FlowNameContainer>
            )}
          </DialogContent>
          <DialogActions>
            <ConfirmDialogActions>
              <Button
                onClick={() => setConfirmOpen(false)}
                variant="outlined"
                color="error">
                Cancel
              </Button>
              <Button
                onClick={handleArchiveRestoreConfirm}
                variant="contained"
                color="success">
                Confirm
              </Button>
            </ConfirmDialogActions>
          </DialogActions>
        </ConfirmDialog>

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
      </MainContainer>
    </FormProvider>
  );
};

export default ApprovalFlow;
