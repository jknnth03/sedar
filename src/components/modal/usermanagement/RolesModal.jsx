import React, { useState, useEffect } from "react";
import {
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Box,
  Alert,
  FormControlLabel,
  Checkbox,
  Grid,
  Typography,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  CircularProgress,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  Close as CloseIcon,
  Security as SecurityIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import { useSnackbar } from "notistack";
import {
  usePostRoleMutation,
  useUpdateRoleMutation,
} from "../../../features/api/usermanagement/rolesApi";
import { useEnhancedModules } from "../../../config/index.jsx";

export default function RolesModal({
  open,
  handleClose,
  refetch,
  selectedRole,
  isViewMode = false,
}) {
  const [roleName, setRoleName] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [expandedPanels, setExpandedPanels] = useState(new Set());
  const [postRole, { isLoading: adding }] = usePostRoleMutation();
  const [updateRole, { isLoading: updating }] = useUpdateRoleMutation();
  const { enqueueSnackbar } = useSnackbar();
  const { modules } = useEnhancedModules();

  const isLoading = adding || updating;

  const flattenChildren = (children, level = 1) => {
    const result = [];

    Object.values(children).forEach((child) => {
      const hasChildren = !!child.children;

      result.push({
        name: child.displayName || child.name,
        permission: child.permissionId,
        icon: child.icon,
        level: level,
        hasChildren: hasChildren,
      });

      if (child.children) {
        result.push(...flattenChildren(child.children, level + 1));
      }
    });

    return result;
  };

  const createHierarchicalPermissions = () => {
    const grouped = {};

    Object.keys(modules).forEach((moduleKey) => {
      const module = modules[moduleKey];

      if (module.children) {
        const childPermissions = flattenChildren(module.children);

        if (childPermissions.length > 0) {
          grouped[module.name] = {
            parent: {
              name: module.displayName || module.name,
              icon: module.icon,
              permission: null,
            },
            children: childPermissions,
            isStandalone: false,
          };
        }
      } else if (module.permissionId === "DASHBOARD") {
        grouped["Dashboard"] = {
          parent: {
            name: module.displayName || module.name,
            icon: module.icon,
            permission: module.permissionId,
          },
          children: [],
          isStandalone: true,
        };
      }
    });

    return grouped;
  };

  const hierarchicalPermissions = createHierarchicalPermissions();

  const getAllPermissions = () => {
    return Object.values(hierarchicalPermissions).flatMap((group) => [
      ...(group.parent.permission ? [group.parent.permission] : []),
      ...group.children.map((child) => child.permission),
    ]);
  };

  useEffect(() => {
    if (open) {
      if (selectedRole) {
        setRoleName(selectedRole.role_name || "");
        const permissions = selectedRole.access_permissions || [];
        setSelectedPermissions(permissions);

        const totalPermissions = getAllPermissions().length;
        setSelectAll(permissions.length === totalPermissions);

        if (isViewMode) {
          const allPanelNames = Object.keys(hierarchicalPermissions).filter(
            (parentName) => !hierarchicalPermissions[parentName].isStandalone
          );
          setExpandedPanels(new Set(allPanelNames));
        }
      } else {
        setRoleName("");
        setSelectedPermissions([]);
        setSelectAll(false);
        setExpandedPanels(new Set());
      }
      setErrorMessage(null);
    }
  }, [open, selectedRole, isViewMode]);

  useEffect(() => {
    const totalPermissions = getAllPermissions().length;
    setSelectAll(
      selectedPermissions.length === totalPermissions && totalPermissions > 0
    );
  }, [selectedPermissions]);

  const handlePermissionChange = (permissionValue) => {
    if (isViewMode) return;

    setSelectedPermissions((prev) => {
      if (prev.includes(permissionValue)) {
        return prev.filter((p) => p !== permissionValue);
      } else {
        return [...prev, permissionValue];
      }
    });
  };

  const handleParentPermissionChange = (parentName, event) => {
    if (isViewMode) return;

    event.stopPropagation();

    const group = hierarchicalPermissions[parentName];
    if (!group) return;

    const childPermissions = group.children.map((child) => child.permission);
    const parentPermission = group.parent.permission;
    const allGroupPermissions = parentPermission
      ? [parentPermission, ...childPermissions]
      : childPermissions;

    const allChildrenSelected = childPermissions.every((permission) =>
      selectedPermissions.includes(permission)
    );

    if (allChildrenSelected) {
      setSelectedPermissions((prev) =>
        prev.filter((permission) => !allGroupPermissions.includes(permission))
      );

      setExpandedPanels((prev) => {
        const newSet = new Set(prev);
        newSet.delete(parentName);
        return newSet;
      });
    } else {
      setSelectedPermissions((prev) => {
        const filtered = prev.filter(
          (permission) => !allGroupPermissions.includes(permission)
        );
        return [...filtered, ...allGroupPermissions];
      });

      if (!expandedPanels.has(parentName)) {
        setExpandedPanels((prev) => new Set([...prev, parentName]));
      }
    }
  };

  const handleSelectAll = () => {
    if (isViewMode) return;

    if (selectAll) {
      setSelectedPermissions([]);
      setExpandedPanels(new Set());
    } else {
      const allPermissions = getAllPermissions();
      setSelectedPermissions(allPermissions);

      const allPanelNames = Object.keys(hierarchicalPermissions).filter(
        (parentName) => !hierarchicalPermissions[parentName].isStandalone
      );
      setExpandedPanels(new Set(allPanelNames));
    }
  };

  const isPermissionSelected = (permissionValue) => {
    return selectedPermissions.includes(permissionValue);
  };

  const isGroupFullySelected = (parentName) => {
    const group = hierarchicalPermissions[parentName];
    if (!group) return false;

    const childPermissions = group.children.map((child) => child.permission);

    return (
      childPermissions.length > 0 &&
      childPermissions.every((permission) =>
        selectedPermissions.includes(permission)
      )
    );
  };

  const isGroupPartiallySelected = (parentName) => {
    const group = hierarchicalPermissions[parentName];
    if (!group) return false;

    const childPermissions = group.children.map((child) => child.permission);
    const selectedInGroup = childPermissions.filter((permission) =>
      selectedPermissions.includes(permission)
    );

    return (
      selectedInGroup.length > 0 &&
      selectedInGroup.length < childPermissions.length
    );
  };

  const handleAccordionToggle = (panelName) => {
    if (isViewMode) return;

    setExpandedPanels((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(panelName)) {
        newSet.delete(panelName);
      } else {
        newSet.add(panelName);
      }
      return newSet;
    });
  };

  const handleSubmit = async () => {
    if (isViewMode) return;

    setErrorMessage(null);

    if (!roleName.trim()) {
      setErrorMessage("Role Name cannot be empty.");
      return;
    }

    const payload = {
      role_name: roleName.trim(),
      access_permissions: selectedPermissions,
    };

    try {
      if (selectedRole) {
        await updateRole({ id: selectedRole.id, ...payload }).unwrap();
        enqueueSnackbar("Role updated successfully!", { variant: "success" });
        enqueueSnackbar("Logout to take effect", { variant: "info" });
      } else {
        await postRole(payload).unwrap();
        enqueueSnackbar("Role added successfully!", { variant: "success" });
      }

      if (typeof refetch === "function") refetch();
      handleClose();
    } catch (error) {
      setErrorMessage(
        error?.data?.message || "An error occurred. Please try again."
      );
    }
  };

  const handleCloseModal = () => {
    setRoleName("");
    setSelectedPermissions([]);
    setSelectAll(false);
    setExpandedPanels(new Set());
    setErrorMessage(null);
    handleClose();
  };

  const getModalTitle = () => {
    if (isViewMode) return "VIEW ROLE PERMISSIONS";
    return selectedRole ? "EDIT ROLE" : "CREATE NEW ROLE";
  };

  const renderChildItem = (child) => {
    const paddingLeft = child.level * 32;

    return (
      <Grid item xs={12} sm={6} key={child.permission}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            minHeight: "40px",
            paddingLeft: `${paddingLeft}px`,
            border: "1px solid #e0e0e0",
            borderRadius: "6px",
            padding: "8px 12px",
            backgroundColor: child.level > 1 ? "#f9f9f9" : "#fff",
            transition: "all 0.2s",
            "&:hover": {
              backgroundColor: "#f5f5f5",
              borderColor: "#bbb",
            },
          }}>
          <Checkbox
            sx={{
              color: "#ccc",
              padding: "4px",
              marginRight: "8px",
              "&.Mui-checked": {
                color: "#FF4500",
              },
            }}
            checked={isPermissionSelected(child.permission)}
            onChange={() => handlePermissionChange(child.permission)}
            disabled={isLoading || isViewMode}
          />
          <Box display="flex" alignItems="center" gap={1.5} flex={1}>
            {React.cloneElement(child.icon, {
              sx: {
                color: "rgb(33, 61, 112)",
                fontSize: "18px",
                flexShrink: 0,
              },
            })}
            <Typography
              variant="body2"
              sx={{
                fontSize: child.level > 1 ? "13px" : "14px",
                color: "#333",
                fontWeight: child.hasChildren ? 600 : 400,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}>
              {child.name}
            </Typography>
          </Box>
        </Box>
      </Grid>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={handleCloseModal}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          height: "85vh",
          maxHeight: "85vh",
        },
      }}>
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 1,
          backgroundColor: isViewMode ? "#f8f9fa" : "#fff",
        }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {isViewMode ? (
            <VisibilityIcon sx={{ color: "rgb(33, 61, 112)" }} />
          ) : (
            <SecurityIcon sx={{ color: "rgb(33, 61, 112)" }} />
          )}
          <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
            {getModalTitle()}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton
            onClick={handleCloseModal}
            sx={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              backgroundColor: "#fff",
              "&:hover": {
                backgroundColor: "#f5f5f5",
              },
              transition: "all 0.2s ease-in-out",
            }}>
            <CloseIcon
              sx={{
                fontSize: "18px",
                color: "#333",
              }}
            />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent
        sx={{
          backgroundColor: isViewMode ? "#fafafa" : "#fff",
          pt: 2,
          overflowY: "auto",
        }}>
        <Box>
          {errorMessage && !isViewMode && (
            <Alert severity="error" sx={{ marginTop: 1, marginBottom: 2 }}>
              {errorMessage}
            </Alert>
          )}

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Paper
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: "1px solid #e0e0e0",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                  backgroundColor: isViewMode ? "#fff" : "inherit",
                }}>
                {!isViewMode && (
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          sx={{
                            color: "#FF4500",
                            "&.Mui-checked": {
                              color: "#FF4500",
                            },
                          }}
                          checked={selectAll}
                          onChange={handleSelectAll}
                          disabled={isLoading}
                        />
                      }
                      label="SELECT ALL"
                      sx={{
                        "& .MuiFormControlLabel-label": {
                          fontWeight: "bold",
                          fontSize: "14px",
                        },
                        paddingLeft: 2,
                      }}
                    />
                  </Box>
                )}
                <TextField
                  label={
                    <span>
                      Role Name{" "}
                      {!isViewMode && <span style={{ color: "red" }}>*</span>}
                    </span>
                  }
                  variant="outlined"
                  fullWidth
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  disabled={isLoading || isViewMode}
                  InputProps={{
                    readOnly: isViewMode,
                  }}
                  error={!!errorMessage && !roleName.trim() && !isViewMode}
                  sx={{
                    marginBottom: 2,
                    "& .MuiInputBase-input": {
                      color: isViewMode ? "#999 !important" : "inherit",
                      WebkitTextFillColor: isViewMode
                        ? "#999 !important"
                        : "inherit",
                    },
                    "& .MuiInputLabel-root": {
                      color: isViewMode ? "#999" : "inherit",
                    },
                  }}
                />
                {Object.entries(hierarchicalPermissions).map(
                  ([parentName, group]) =>
                    group.isStandalone ? (
                      <Box
                        key={parentName}
                        sx={{
                          mb: 1,
                          p: 2,
                          border: "1px solid #e0e0e0",
                          borderRadius: 1,
                          backgroundColor: "#fff",
                        }}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              sx={{
                                color: "#ccc",
                                marginRight: 4,
                                "&.Mui-checked": {
                                  color: "#FF4500",
                                },
                              }}
                              checked={isPermissionSelected(
                                group.parent.permission
                              )}
                              onChange={() =>
                                handlePermissionChange(group.parent.permission)
                              }
                              disabled={isLoading || isViewMode}
                            />
                          }
                          label={
                            <Box display="flex" alignItems="center" gap={2}>
                              {React.cloneElement(group.parent.icon, {
                                sx: { color: "rgb(33, 61, 112)" },
                              })}
                              <Typography
                                variant="subtitle2"
                                fontWeight="bold"
                                sx={{ color: "#333" }}>
                                {group.parent.name}
                              </Typography>
                            </Box>
                          }
                          sx={{
                            ml: 1,
                          }}
                        />
                      </Box>
                    ) : (
                      <Accordion
                        key={parentName}
                        expanded={expandedPanels.has(parentName)}
                        onChange={() => handleAccordionToggle(parentName)}
                        sx={{
                          mb: 1,
                          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                          "&:before": {
                            display: "none",
                          },
                        }}>
                        <AccordionSummary
                          expandIcon={
                            !isViewMode && (
                              <ExpandMoreIcon
                                sx={{ color: "rgb(33, 61, 112)" }}
                              />
                            )
                          }
                          sx={{
                            backgroundColor: "#fff",
                            borderRadius: "4px",
                            minHeight: "56px",
                            "&.Mui-expanded": {
                              minHeight: "56px",
                            },
                            cursor: isViewMode
                              ? "default !important"
                              : "pointer",
                          }}>
                          <Box display="flex" alignItems="center" width="100%">
                            <FormControlLabel
                              control={
                                <Checkbox
                                  sx={{
                                    color: "#ccc",
                                    marginRight: 4,
                                    "&.Mui-checked": {
                                      color: "#FF4500",
                                    },
                                    "&.MuiCheckbox-indeterminate": {
                                      color: "#FF4500",
                                    },
                                  }}
                                  checked={isGroupFullySelected(parentName)}
                                  indeterminate={isGroupPartiallySelected(
                                    parentName
                                  )}
                                  onChange={(e) =>
                                    handleParentPermissionChange(parentName, e)
                                  }
                                  disabled={isLoading || isViewMode}
                                />
                              }
                              label={
                                <Box display="flex" alignItems="center" gap={2}>
                                  {React.cloneElement(group.parent.icon, {
                                    sx: { color: "rgb(33, 61, 112)" },
                                  })}
                                  <Typography
                                    variant="subtitle2"
                                    fontWeight="bold"
                                    sx={{ color: "#333" }}>
                                    {group.parent.name}
                                  </Typography>
                                </Box>
                              }
                              onClick={(e) => e.stopPropagation()}
                              sx={{
                                mr: 1,
                                flexGrow: 1,
                                ml: 1,
                              }}
                            />
                          </Box>
                        </AccordionSummary>

                        <AccordionDetails
                          sx={{
                            padding: "16px",
                            backgroundColor: "#fafafa",
                          }}>
                          <Grid container spacing={1.5}>
                            {group.children.map((child) =>
                              renderChildItem(child)
                            )}
                          </Grid>
                        </AccordionDetails>
                      </Accordion>
                    )
                )}
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      {!isViewMode && (
        <DialogActions sx={{ px: 3, py: 2, backgroundColor: "#fff" }}>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={isLoading || !roleName.trim()}
            startIcon={
              isLoading ? (
                <CircularProgress size={16} />
              ) : selectedRole ? (
                <EditIcon />
              ) : (
                <AddIcon />
              )
            }
            sx={{
              backgroundColor: "#4CAF50 !important",
              color: "white !important",
              fontWeight: 600,
              textTransform: "uppercase",
              px: 3,
              py: 1,
              borderRadius: "8px",
              border: "none !important",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              "&:hover": {
                backgroundColor: "#45a049 !important",
                border: "none !important",
              },
              "&:disabled": {
                backgroundColor: "#cccccc !important",
                color: "#666666 !important",
                border: "none !important",
              },
            }}>
            {isLoading ? "Saving..." : selectedRole ? "Update" : "Create"}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
}
