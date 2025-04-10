import React, { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { useChangePasswordMutation } from "../../../features/api/authApi"; // Adjust the import path as needed
import { useNavigate } from "react-router";
import { useSnackbar } from "notistack";

const Changepass = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [changePassword] = useChangePasswordMutation();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const handleSubmit = async () => {
    setErrorMessage(""); // Clear previous errors
    if (newPassword !== confirmPassword) {
      setErrorMessage("New passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage("New password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    const payload = {
      current_password: currentPassword,
      new_password: newPassword,
      new_password_confirmation: confirmPassword,
    };

    try {
      await changePassword(payload).unwrap();
      enqueueSnackbar("Password updated successfully!", {
        variant: "success",
        autoHideDuration: 3000,
      });
      navigate("/");
    } catch (error) {
      setErrorMessage(
        error.data?.message || "Password change failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true}>
      <DialogTitle>Change Password</DialogTitle>
      <DialogContent>
        <TextField
          margin="dense"
          label="Current Password"
          type="password"
          fullWidth
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
        <TextField
          margin="dense"
          label="New Password"
          type="password"
          fullWidth
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <TextField
          margin="dense"
          label="Confirm New Password"
          type="password"
          fullWidth
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        {errorMessage && (
          <p style={{ color: "red", fontSize: "0.875rem", marginTop: "8px" }}>
            {errorMessage}
          </p>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => navigate("/")} color="secondary">
          Cancel
        </Button>
        <Button onClick={handleSubmit} color="primary" disabled={loading}>
          {loading ? "Changing..." : "Change Password"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default Changepass;
