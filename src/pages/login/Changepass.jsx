import React, { useState } from "react";
import {
  Box,
  TextField,
  Typography,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { useNavigate } from "react-router";
import { useSnackbar } from "notistack";
import { useChangePasswordMutation } from "../../features/api/changepassApi";
import logo from "../../assets/sedar.png";
import img from "../../assets/business.png";
import login_logo from "../../assets/login_logo.png";
import { CONSTANT } from "../../config";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import "./Login.scss";

const Changepass = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [changePassword] = useChangePasswordMutation();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const toggleShowCurrentPassword = () =>
    setShowCurrentPassword((prev) => !prev);
  const toggleShowNewPassword = () => setShowNewPassword((prev) => !prev);
  const toggleShowConfirmPassword = () =>
    setShowConfirmPassword((prev) => !prev);

  const handleSubmit = async () => {
    setErrorMessage("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setErrorMessage("All fields are required.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("New passwords do not match.");
      return;
    }

    setLoading(true);

    const payload = {
      currentPassword,
      newPassword,
      newPasswordConfirmation: confirmPassword,
    };

    try {
      await changePassword(payload).unwrap();

      enqueueSnackbar("Password updated successfully!", {
        variant: "success",
        autoHideDuration: 3000,
      });

      const user = JSON.parse(localStorage.getItem("user"));
      if (user) {
        user.force_password_reset = false;
        localStorage.setItem("user", JSON.stringify(user));
      }

      navigate("/");
    } catch (error) {
      const serverMessage =
        error?.data?.errors?.new_password?.[0] ||
        error?.data?.errors?.current_password?.[0] ||
        error?.data?.message ||
        "Password change failed. Please try again.";
      setErrorMessage(serverMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="login">
      <Box display="flex" boxShadow={3} sx={{ mt: 1 }}>
        {/* Left Decorative Side */}
        <Box
          className="login__container1"
          display="flex"
          justifyContent="center"
          alignItems="center">
          <img
            src={login_logo}
            alt="Login Illustration"
            style={{ width: "90%" }}
          />
        </Box>

        {/* Right Decorative Login Background */}
        <Box className="login__container2">
          <Box className="login__footer">
            <img src={logo} alt="logo" width={120} className="login__logo1" />
            <Typography className="login__textupper" align="center">
              Welcome to Sedar 2.0
            </Typography>
          </Box>

          <form className="login__textbox-container">
            <TextField
              className="login__textbox"
              label={CONSTANT.FIELDS.USERNAME.label}
              placeholder={CONSTANT.FIELDS.USERNAME.placeholder}
            />
            <TextField
              className="login__textbox"
              label={CONSTANT.FIELDS.PASSWORD.label}
              placeholder={CONSTANT.FIELDS.PASSWORD.placeholder}
              type="password"
            />
            <Button className="login__button" variant="contained" type="submit">
              {CONSTANT.BUTTONS.LOGIN.label}
            </Button>
          </form>

          <Box className="login__footer">
            <img src={img} alt="business" width={50} />
            <Typography className="login__textbottom" align="center">
              Powered By MIS
            </Typography>
            <Typography className="login__textbottom" align="center">
              All rights reserved Copyrights © 2021
            </Typography>
          </Box>
        </Box>
      </Box>

      <Dialog open={true}>
        <DialogTitle
          sx={{ background: "#E3F2FD", fontWeight: 600, fontSize: 18 }}>
          CHANGE PASSWORD
        </DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Current Password"
            type={showCurrentPassword ? "text" : "password"}
            fullWidth
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            sx={{ marginTop: "20px" }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={toggleShowCurrentPassword} edge="end">
                    {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            margin="dense"
            label="New Password"
            type={showNewPassword ? "text" : "password"}
            fullWidth
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={toggleShowNewPassword} edge="end">
                    {showNewPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            margin="dense"
            label="Confirm New Password"
            type={showConfirmPassword ? "text" : "password"}
            fullWidth
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={toggleShowConfirmPassword} edge="end">
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          {errorMessage && (
            <Typography
              sx={{ color: "red", fontSize: "0.875rem", marginTop: "8px" }}>
              {errorMessage}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSubmit} color="primary" disabled={loading}>
            {loading ? "Changing..." : "Change Password"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Changepass;
