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
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  alpha,
  Fade,
  Chip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ArchiveIcon from "@mui/icons-material/Archive";
import AddIcon from "@mui/icons-material/Add";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import RestoreIcon from "@mui/icons-material/Restore";
import HelpIcon from "@mui/icons-material/Help";
import { FormProvider, useForm } from "react-hook-form";
import { useSnackbar } from "notistack";
import "../../pages/GeneralStyle.scss";
import {
  useGetApprovalFormsQuery,
  useDeleteApprovalFormMutation,
  useCreateApprovalFormMutation,
  useUpdateApprovalFormMutation,
} from "../../features/api/approvalsetting/approvalFormApi";
import { CONSTANT } from "../../config";
import dayjs from "dayjs";
import ApprovalFormModal from "../../components/modal/approvalSettings/ApprovalFormModal";

const useDebounce = (value, delay) => {
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
        placeholder="Search Approval Forms..."
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

const ApprovalForm = () => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedForm, setSelectedForm] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const [menuAnchor, setMenuAnchor] = useState({});
  const [selectedRowForMenu, setSelectedRowForMenu] = useState(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedFormForAction, setSelectedFormForAction] = useState(null);

  const [isLoading, setIsLoading] = useState(false);

  const methods = useForm({
    defaultValues: {
      name: "",
      code: "",
      description: "",
      status: "active",
    },
  });

  const debounceValue = useDebounce(searchQuery, 500);

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
    data: approvalFormsData,
    isLoading: queryLoading,
    isFetching,
    refetch,
    error,
  } = useGetApprovalFormsQuery(queryParams, {
    refetchOnMountOrArgChange: true,
    skip: false,
  });

  const [createApprovalForm] = useCreateApprovalFormMutation();
  const [updateApprovalForm] = useUpdateApprovalFormMutation();
  const [deleteApprovalForm] = useDeleteApprovalFormMutation();

  const approvalFormsList = useMemo(
    () => approvalFormsData?.result?.data || [],
    [approvalFormsData]
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
    setSelectedForm(null);
    setModalMode("create");
    setModalOpen(true);
  }, []);

  const handleRowClick = useCallback((form) => {
    setSelectedForm(form);
    setModalMode("view");
    setModalOpen(true);
  }, []);

  const handleEditForm = useCallback((form) => {
    setSelectedForm(form);
    setModalMode("edit");
    setModalOpen(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setModalOpen(false);
    setSelectedForm(null);
    setModalMode("create");
  }, []);

  const handleModalSave = useCallback(
    async (formData, mode) => {
      setModalLoading(true);
      setIsLoading(true);

      try {
        if (mode === "create") {
          await createApprovalForm(formData).unwrap();
        } else if (mode === "edit") {
          await updateApprovalForm({
            id: selectedForm.id,
            data: formData,
          }).unwrap();
        }

        enqueueSnackbar(
          `Form ${mode === "create" ? "created" : "updated"} successfully!`,
          { variant: "success", autoHideDuration: 2000 }
        );

        refetch();
        handleModalClose();
      } catch (error) {
        enqueueSnackbar("Failed to save form. Please try again.", {
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
      selectedForm,
      enqueueSnackbar,
      handleModalClose,
      createApprovalForm,
      updateApprovalForm,
    ]
  );

  const handleMenuOpen = useCallback((event, form) => {
    event.stopPropagation();
    setMenuAnchor((prev) => ({ ...prev, [form.id]: event.currentTarget }));
    setSelectedRowForMenu(form);
  }, []);

  const handleMenuClose = useCallback((formId) => {
    setMenuAnchor((prev) => ({ ...prev, [formId]: null }));
    setSelectedRowForMenu(null);
  }, []);

  const handleArchiveRestoreClick = useCallback(
    (form, event) => {
      if (event) {
        event.stopPropagation();
      }
      setSelectedFormForAction(form);
      setConfirmOpen(true);
      handleMenuClose(form.id);
    },
    [handleMenuClose]
  );

  const handleArchiveRestoreConfirm = async () => {
    if (!selectedFormForAction) return;

    setIsLoading(true);
    try {
      await deleteApprovalForm(selectedFormForAction.id).unwrap();

      enqueueSnackbar(
        selectedFormForAction.deleted_at
          ? "Form restored successfully!"
          : "Form archived successfully!",
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
      setSelectedFormForAction(null);
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

  const safelyDisplayValue = useCallback(
    (value) => (value === null || value === undefined ? "N/A" : String(value)),
    []
  );

  const renderStatusChip = useCallback((form) => {
    const isActive = !form.deleted_at && form.status !== "inactive";

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
  }, []);

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
            <Typography className="header">APPROVAL FORMS</Typography>
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
                CREATE FORM
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
            <Table stickyHeader sx={{ minWidth: 1700 }}>
              <TableHead>
                <TableRow>
                  <TableCell
                    align="left"
                    sx={{ width: "60px", minWidth: "60px" }}>
                    ID
                  </TableCell>
                  <TableCell sx={{ width: "250px", minWidth: "250px" }}>
                    FORM NAME
                  </TableCell>

                  <TableCell sx={{ width: "150px", minWidth: "150px" }}>
                    CODE
                  </TableCell>
                  <TableCell sx={{ width: "250px", minWidth: "250px" }}>
                    DESCRIPTION
                  </TableCell>
                  <TableCell sx={{ width: "100px", minWidth: "100px" }}>
                    STATUS
                  </TableCell>
                  <TableCell sx={{ width: "150px", minWidth: "150px" }}>
                    LAST MODIFIED
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ width: "100px", minWidth: "100px" }}>
                    ACTIONS
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoadingState ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                      <CircularProgress
                        size={32}
                        sx={{ color: "rgb(33, 61, 112)" }}
                      />
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                      <Typography color="error">
                        Error loading data: {error.message || "Unknown error"}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : approvalFormsList.length > 0 ? (
                  approvalFormsList.map((form) => (
                    <TableRow
                      key={form.id}
                      onClick={() => handleRowClick(form)}
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
                        sx={{ width: "60px", minWidth: "60px" }}>
                        {form.id}
                      </TableCell>
                      <TableCell
                        sx={{
                          width: "250px",
                          minWidth: "250px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          fontWeight: 600,
                        }}>
                        {form.name}
                      </TableCell>
                      <TableCell
                        sx={{
                          width: "150px",
                          minWidth: "150px",
                          fontSize: "12px",
                          color: "#666",
                        }}>
                        {form.code || "-"}
                      </TableCell>
                      <TableCell
                        sx={{
                          width: "250px",
                          minWidth: "250px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          color: "#666",
                          fontStyle: form.description ? "normal" : "italic",
                        }}>
                        {form.description || "No description available"}
                      </TableCell>
                      <TableCell
                        sx={{
                          width: "100px",
                          minWidth: "100px",
                        }}>
                        {renderStatusChip(form)}
                      </TableCell>
                      <TableCell
                        sx={{
                          width: "150px",
                          minWidth: "150px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}>
                        {form.updated_at
                          ? dayjs(form.updated_at).format("MMM D, YYYY")
                          : "-"}
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{ width: "100px", minWidth: "100px" }}>
                        <IconButton
                          onClick={(e) => handleMenuOpen(e, form)}
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
                          anchorEl={menuAnchor[form.id]}
                          open={Boolean(menuAnchor[form.id])}
                          onClose={() => handleMenuClose(form.id)}
                          transformOrigin={{
                            horizontal: "right",
                            vertical: "top",
                          }}
                          anchorOrigin={{
                            horizontal: "right",
                            vertical: "bottom",
                          }}>
                          <MenuItem
                            onClick={(e) => handleArchiveRestoreClick(form, e)}
                            sx={{
                              fontSize: "0.875rem",
                              color: form.deleted_at
                                ? theme.palette.success.main
                                : "#d32f2f",
                            }}>
                            {form.deleted_at ? (
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
                      colSpan={8}
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
                          No approval forms found
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {searchQuery
                            ? `No results for "${searchQuery}"`
                            : showArchived
                            ? "No archived forms"
                            : "No active forms"}
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
              count={approvalFormsData?.result?.total || 0}
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
                {selectedFormForAction?.deleted_at ? "restore" : "archive"}
              </strong>{" "}
              this approval form?
            </Typography>
            {selectedFormForAction && (
              <Typography
                variant="body2"
                color="text.secondary"
                textAlign="center"
                sx={{ mt: 1 }}>
                {selectedFormForAction.name}
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Box
              display="flex"
              justifyContent="center"
              width="100%"
              gap={2}
              mb={2}>
              <Button
                onClick={() => setConfirmOpen(false)}
                variant="outlined"
                color="error"
                sx={{ borderRadius: 2, minWidth: 80 }}>
                Cancel
              </Button>
              <Button
                onClick={handleArchiveRestoreConfirm}
                variant="contained"
                color="success"
                sx={{ borderRadius: 2, minWidth: 80 }}>
                Confirm
              </Button>
            </Box>
          </DialogActions>
        </Dialog>

        <ApprovalFormModal
          open={modalOpen}
          onClose={handleModalClose}
          onSave={handleModalSave}
          selectedEntry={selectedForm}
          isLoading={modalLoading}
          mode={modalMode}
        />
      </Box>
    </FormProvider>
  );
};

export default ApprovalForm;
