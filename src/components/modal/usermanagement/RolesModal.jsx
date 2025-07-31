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
} from "@mui/material";
import { useSnackbar } from "notistack";
import {
  usePostRoleMutation,
  useUpdateRoleMutation,
} from "../../../features/api/usermanagement/rolesApi";
import { ROUTES } from "../../../config/router/routes.jsx";

export default function RolesModal({
  open,
  handleClose,
  refetch,
  selectedRole,
}) {
  const [roleName, setRoleName] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [postRole, { isLoading: adding }] = usePostRoleMutation();
  const [updateRole, { isLoading: updating }] = useUpdateRoleMutation();
  const { enqueueSnackbar } = useSnackbar();

  const permissionList = ROUTES.flatMap((route) => {
    if (route.children && Array.isArray(route.children)) {
      return route.children
        .filter((child) => child.handle && child.handle.permission)
        .map((child) => ({
          label: child.id,
          value: child.handle.permission,
        }));
    }
    return [];
  });

  useEffect(() => {
    if (open) {
      if (selectedRole) {
        setRoleName(selectedRole.role_name || "");
        setSelectedPermissions(selectedRole.access_permissions || []);
        const permissionsLength = Array.isArray(selectedRole.access_permissions)
          ? selectedRole.access_permissions.length
          : 0;
        setSelectAll(permissionsLength === permissionList.length);
      } else {
        setRoleName("");
        setSelectedPermissions([]);
        setSelectAll(false);
      }
      setErrorMessage(null);
    }
  }, [open, selectedRole]);

  const handlePermissionChange = (permissionValue) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionValue)
        ? prev.filter((p) => p !== permissionValue)
        : [...prev, permissionValue]
    );
  };

  const handleSelectAll = () => {
    const newSelectedPermissions = selectAll
      ? []
      : permissionList.map((p) => p.value);
    setSelectedPermissions(newSelectedPermissions);
    setSelectAll(!selectAll);
  };

  const isPermissionSelected = (permissionValue) => {
    return selectedPermissions.includes(permissionValue);
  };

  const handleSubmit = async () => {
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
        enqueueSnackbar("Logout to take effect", { variant: "info" }); // 👈 Additional Snackbar
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
  }; // ✅ Fixed: properly closed function

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle className="dialog_title">
        {selectedRole ? <strong>EDIT ROLE</strong> : <strong>ADD ROLE</strong>}
      </DialogTitle>

      <DialogContent>
        <Box minWidth={500}>
          {errorMessage && (
            <Alert severity="error" sx={{ marginTop: 1 }}>
              {errorMessage}
            </Alert>
          )}

          <TextField
            label="Role Name"
            variant="outlined"
            fullWidth
            margin="dense"
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
            disabled={adding || updating}
            sx={{ marginTop: 2 }}
          />

          <Paper
            sx={{ mt: 1, p: 2, borderRadius: 2, border: "1px solid #ddd" }}>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <FormControlLabel
                control={
                  <Checkbox checked={selectAll} onChange={handleSelectAll} />
                }
                label="Select All"
                sx={{ fontWeight: "bold" }}
              />
            </Box>

            <Typography variant="subtitle1" fontWeight="bold" mb={1}>
              Permissions
            </Typography>

            <Grid container spacing={1}>
              {permissionList.map((permission) => (
                <Grid size={6} key={permission.value}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isPermissionSelected(permission.value)}
                        onChange={() =>
                          handlePermissionChange(permission.value)
                        }
                      />
                    }
                    label={permission.label}
                  />
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={adding || updating}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={adding || updating || !roleName.trim()}>
          {adding || updating
            ? "Saving..."
            : selectedRole
            ? "Update"
            : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
