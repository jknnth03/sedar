import React, { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useChangePasswordMutation } from "../../../features/api/authApi";

const ChangepassModal = ({ open, handleClose }) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [changePassword] = useChangePasswordMutation();

  const handleSubmit = async () => {
    if (!currentPassword) {
      setErrorMessage("Current password is required.");
      return;
    }

    if (newPassword.length < 8) {
      setErrorMessage("New password must be at least 8 characters long.");
      return;
    }

    if (newPassword === currentPassword) {
      setErrorMessage(
        "New password must be different from the current password."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("New passwords do not match.");
      return;
    }

    setErrorMessage("");
    setLoading(true);

    const payload = {
      current_password: currentPassword.trim(),
      new_password: newPassword.trim(),
      new_password_confirmation: confirmPassword.trim(),
    };

    try {
      await changePassword(payload).unwrap();
      alert("Password updated successfully!");
      handleClose();
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Error response:", error);
      setErrorMessage(
        error.data?.message || "Password change failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const renderPasswordField = (
    label,
    value,
    setValue,
    show,
    setShow,
    helperText = ""
  ) => (
    <TextField
      margin="dense"
      label={label}
      type={show ? "text" : "password"}
      fullWidth
      value={value}
      onChange={(e) => setValue(e.target.value)}
      helperText={helperText}
      error={!!helperText}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton onClick={() => setShow(!show)} edge="end">
              {show ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  );

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Change Password</DialogTitle>
      <DialogContent>
        {renderPasswordField(
          "Current Password",
          currentPassword,
          setCurrentPassword,
          showCurrent,
          setShowCurrent
        )}
        {renderPasswordField(
          "New Password",
          newPassword,
          setNewPassword,
          showNew,
          setShowNew,
          errorMessage.includes("8 characters") ||
            errorMessage.includes("different")
            ? errorMessage
            : ""
        )}
        {renderPasswordField(
          "Confirm New Password",
          confirmPassword,
          setConfirmPassword,
          showConfirm,
          setShowConfirm,
          errorMessage.includes("match") ? errorMessage : ""
        )}
        {errorMessage &&
          !(
            errorMessage.includes("8 characters") ||
            errorMessage.includes("match") ||
            errorMessage.includes("different")
          ) && (
            <p style={{ color: "red", fontSize: "0.875rem", marginTop: "8px" }}>
              {errorMessage}
            </p>
          )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="secondary" disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} color="primary" disabled={loading}>
          {loading ? "Changing..." : "Change Password"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ChangepassModal;
