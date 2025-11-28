import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import { useSnackbar } from "notistack";
import { useDispatch, useSelector } from "react-redux";
import { useUpdatePendingRequestMutation } from "../../../features/api/usermanagement/userApi";
import { resetModal } from "../../../features/slice/modalSlice";
import { useGetAllShowRolesQuery } from "../../../features/api/usermanagement/rolesApi";

const PendingUserModal = ({ open, handleClose, refetch, selectedUser }) => {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const userModal = useSelector((state) => state.modal.userModal);

  const [formData, setFormData] = useState({
    role: null,
  });

  const { data: rolesData } = useGetAllShowRolesQuery();
  const [updatePendingRequest] = useUpdatePendingRequestMutation();

  const handleCloseModal = () => {
    dispatch(resetModal());
    handleClose();
    setFormData({
      role: null,
    });
  };

  const handleRoleChange = (_, newValue) => {
    setFormData((prev) => ({
      ...prev,
      role: newValue || null,
    }));
  };

  // Update formData when selectedUser changes
  useEffect(() => {
    console.log("PendingUserModal - selectedUser changed:", selectedUser);
    if (selectedUser) {
      setFormData({
        role: selectedUser.role || null,
      });
    } else {
      setFormData({
        role: null,
      });
    }
  }, [selectedUser]);

  const handleSubmit = async () => {
    // Add detailed logging
    console.log("Submit clicked!");
    console.log("selectedUser:", selectedUser);
    console.log("selectedUser?.id:", selectedUser?.id);
    console.log("formData:", formData);

    if (!selectedUser) {
      console.error("selectedUser is null or undefined");
      enqueueSnackbar("Missing user data", {
        variant: "error",
      });
      return;
    }

    if (!selectedUser.id) {
      console.error("selectedUser.id is missing:", selectedUser);
      enqueueSnackbar("Missing user ID", {
        variant: "error",
      });
      return;
    }

    const requestData = {
      id: selectedUser.id,
      role_id: formData.role?.id || null,
    };

    console.log("Request data to send:", requestData);

    try {
      await updatePendingRequest(requestData).unwrap();
      enqueueSnackbar("Pending request updated successfully!", {
        variant: "success",
      });
      await refetch();
      handleCloseModal();
    } catch (error) {
      console.error("Update error:", error);
      enqueueSnackbar("An error occurred. Please try again.", {
        variant: "error",
      });
    }
  };

  const isSubmitDisabled = !formData.role?.id;

  const SingleRow = ({ children }) => <Box mb={2}>{children}</Box>;

  // Debug: Log when modal opens/closes
  useEffect(() => {
    console.log("Modal open state:", open || userModal);
    console.log("Current selectedUser:", selectedUser);
  }, [open, userModal, selectedUser]);

  return (
    <Dialog
      open={open || userModal}
      onClose={handleCloseModal}
      fullWidth
      maxWidth="sm">
      <DialogTitle className="dialog_title">EDIT PENDING USER</DialogTitle>

      <DialogContent dividers sx={{ padding: 3 }}>
        {selectedUser && (
          <Box mb={2}>
            <TextField
              fullWidth
              label="Username"
              value={selectedUser.username || "N/A"}
              disabled
              variant="outlined"
            />
          </Box>
        )}

        <SingleRow>
          <Autocomplete
            fullWidth
            options={rolesData || []}
            value={formData.role || null}
            onChange={handleRoleChange}
            getOptionLabel={(option) => `${option.id} - ${option.role_name}`}
            isOptionEqualToValue={(option, value) => option.id === value?.id}
            renderInput={(params) => (
              <TextField {...params} label="Role" fullWidth />
            )}
          />
        </SingleRow>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleCloseModal}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isSubmitDisabled}>
          Update
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PendingUserModal;
