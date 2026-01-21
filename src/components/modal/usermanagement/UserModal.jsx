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
import {
  useCreateUserMutation,
  useUpdateUserMutation,
} from "../../../features/api/usermanagement/userApi";
import { resetModal } from "../../../features/slice/modalSlice";
import { useGetAllShowRolesQuery } from "../../../features/api/usermanagement/rolesApi";

const UserModal = ({ open, handleClose, refetch, selectedUser }) => {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const userModal = useSelector((state) => state.modal.userModal);

  const [formData, setFormData] = useState({
    role: null,
  });

  const { data: rolesData } = useGetAllShowRolesQuery();

  const [createUser] = useCreateUserMutation();
  const [updateUser] = useUpdateUserMutation();

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

  useEffect(() => {
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
    const requestData = {
      role_id: formData.role?.id || null,
    };

    try {
      let response;
      if (selectedUser) {
        response = await updateUser({
          id: selectedUser.id,
          ...requestData,
        }).unwrap();
        enqueueSnackbar("User updated successfully!", { variant: "success" });
      } else {
        response = await createUser(requestData).unwrap();
        enqueueSnackbar("User created successfully!", { variant: "success" });
      }

      await refetch();
      handleCloseModal();
    } catch (error) {
      enqueueSnackbar("An error occurred. Please try again.", {
        variant: "error",
      });
    }
  };

  const isSubmitDisabled = !formData.role?.id;

  const SingleRow = ({ children }) => <Box mb={2}>{children}</Box>;

  return (
    <Dialog
      open={open || userModal}
      onClose={handleCloseModal}
      fullWidth
      maxWidth="sm">
      <DialogTitle className="dialog_title">
        {selectedUser ? "EDIT USER" : "ADD NEW USER"}
      </DialogTitle>

      <DialogContent dividers sx={{ padding: 3 }}>
        <SingleRow>
          <Autocomplete
            fullWidth
            options={rolesData || []}
            value={formData.role || null}
            onChange={handleRoleChange}
            getOptionLabel={(option) => `${option.id} - ${option.role_name}`}
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
          {selectedUser ? "Update" : "Submit"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserModal;
