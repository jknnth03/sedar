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
  showArchived,
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
      setRoleName(selectedRole?.name || "");
      setSelectedPermissions(selectedRole?.permissions || []);
      setErrorMessage(null);
    }
  }, [open, selectedRole]);

  useEffect(() => {
    setSelectAll(selectedPermissions.length === permissionList.length);
  }, [selectedPermissions]);

  const handlePermissionChange = (permissionValue) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionValue)
        ? prev.filter((p) => p !== permissionValue)
        : [...prev, permissionValue]
    );
  };

  const handleSelectAll = () => {
    setSelectedPermissions(selectAll ? [] : permissionList.map((p) => p.value));
  };

  const handleSubmit = async () => {
    setErrorMessage(null);

    if (!roleName.trim()) {
      setErrorMessage("Role Name cannot be empty.");
      return;
    }

    const payload = {
      name: roleName.trim(),
      permissions: selectedPermissions,
      status: showArchived ? "inactive" : "active",
    };

    try {
      if (selectedRole) {
        await updateRole({ id: selectedRole.id, ...payload }).unwrap();
        enqueueSnackbar("Role updated successfully!", { variant: "success" });
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

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle
        sx={{
          backgroundColor: "#E3F2FD",
          fontWeight: "bold",
          fontSize: "1.2rem",
          padding: "12px 16px",
        }}>
        <Box sx={{ marginLeft: "4px", display: "inline-block" }}>
          {selectedRole ? "Edit Role" : "Add Role"}
        </Box>
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
            sx={{ marginTop: 3 }}
          />

          {/* Separate Permission Selection Box */}
          <Paper
            sx={{ mt: 3, p: 2, borderRadius: 2, border: "1px solid #ddd" }}>
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
              Usermanagement
            </Typography>

            <Grid container spacing={1}>
              {permissionList.map((permission) => (
                <Grid item xs={6} key={permission.value}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedPermissions.includes(permission.value)}
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
