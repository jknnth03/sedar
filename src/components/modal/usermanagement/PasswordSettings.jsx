// import React, { useState } from "react";
// import {
//   Dialog,
//   DialogActions,
//   DialogContent,
//   DialogTitle,
//   TextField,
//   Button,
//   IconButton,
//   InputAdornment,
// } from "@mui/material";
// import { Visibility, VisibilityOff } from "@mui/icons-material";
// import { useChangePasswordMutation } from "../../../features/api/authApi";
// import { CONSTANT } from "../../../config";

// const ChangepassModal = ({ open, handleClose }) => {
//   const [currentPassword, setCurrentPassword] = useState("");
//   const [newPassword, setNewPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [errorMessage, setErrorMessage] = useState("");
//   const [loading, setLoading] = useState(false);

//   const [showPassword, setShowPassword] = useState({
//     current: false,
//     new: false,
//     confirm: false,
//   });

//   const [changePassword] = useChangePasswordMutation();

//   const toggleShowPassword = (field) => {
//     setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
//   };

//   const handleSubmit = async () => {
//     if (!currentPassword) {
//       setErrorMessage("Current password is required.");
//       return;
//     }

//     if (newPassword === currentPassword) {
//       setErrorMessage(
//         "New password must be different from the current password."
//       );
//       return;
//     }

//     if (newPassword !== confirmPassword) {
//       setErrorMessage("New passwords do not match.");
//       return;
//     }

//     setErrorMessage("");
//     setLoading(true);

//     const payload = {
//       current_password: currentPassword.trim(),
//       new_password: newPassword.trim(),
//       new_password_confirmation: confirmPassword.trim(),
//     };

//     try {
//       await changePassword(payload).unwrap();
//       alert("Password updated successfully!");
//       handleClose();
//       setCurrentPassword("");
//       setNewPassword("");
//       setConfirmPassword("");
//     } catch (error) {
//       setErrorMessage(
//         error.data?.message || "Password change failed. Please try again."
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Dialog open={open} onClose={handleClose}>
//       <DialogTitle>CHANGE PASSWORD</DialogTitle>
//       <DialogContent>
//         <TextField
//           label="Current Password"
//           placeholder={CONSTANT.FIELDS.PASSWORD.placeholder}
//           type={showPassword.current ? "text" : "password"}
//           fullWidth
//           margin="dense"
//           value={currentPassword}
//           onChange={(e) => setCurrentPassword(e.target.value)}
//           InputProps={{
//             endAdornment: (
//               <InputAdornment position="end">
//                 <IconButton
//                   onClick={() => toggleShowPassword("current")}
//                   edge="end">
//                   {showPassword.current ? <VisibilityOff /> : <Visibility />}
//                 </IconButton>
//               </InputAdornment>
//             ),
//           }}
//         />

//         <TextField
//           label="New Password"
//           placeholder={CONSTANT.FIELDS.PASSWORD.placeholder}
//           type={showPassword.new ? "text" : "password"}
//           fullWidth
//           margin="dense"
//           value={newPassword}
//           onChange={(e) => setNewPassword(e.target.value)}
//           error={errorMessage.includes("different")}
//           helperText={errorMessage.includes("different") ? errorMessage : ""}
//           InputProps={{
//             endAdornment: (
//               <InputAdornment position="end">
//                 <IconButton
//                   onClick={() => toggleShowPassword("new")}
//                   edge="end">
//                   {showPassword.new ? <VisibilityOff /> : <Visibility />}
//                 </IconButton>
//               </InputAdornment>
//             ),
//           }}
//         />

//         <TextField
//           label="Confirm New Password"
//           placeholder={CONSTANT.FIELDS.PASSWORD.placeholder}
//           type={showPassword.confirm ? "text" : "password"}
//           fullWidth
//           margin="dense"
//           value={confirmPassword}
//           onChange={(e) => setConfirmPassword(e.target.value)}
//           error={errorMessage.includes("match")}
//           helperText={errorMessage.includes("match") ? errorMessage : ""}
//           InputProps={{
//             endAdornment: (
//               <InputAdornment position="end">
//                 <IconButton
//                   onClick={() => toggleShowPassword("confirm")}
//                   edge="end">
//                   {showPassword.confirm ? <VisibilityOff /> : <Visibility />}
//                 </IconButton>
//               </InputAdornment>
//             ),
//           }}
//         />

//         {/* General error */}
//         {errorMessage &&
//           !(
//             errorMessage.includes("different") || errorMessage.includes("match")
//           ) && (
//             <p style={{ color: "red", fontSize: "0.875rem", marginTop: "8px" }}>
//               {errorMessage}
//             </p>
//           )}
//       </DialogContent>

//       <DialogActions>
//         <Button onClick={handleClose} color="secondary" disabled={loading}>
//           Cancel
//         </Button>
//         <Button onClick={handleSubmit} color="primary" disabled={loading}>
//           {loading ? "Changing..." : "Change Password"}
//         </Button>
//       </DialogActions>
//     </Dialog>
//   );
// };

// export default ChangepassModal;
