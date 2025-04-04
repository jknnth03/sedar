// import React, { useState, useEffect } from "react";
// import {
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   TextField,
//   Button,
//   Select,
//   MenuItem,
//   FormControl,
//   InputLabel,
//   Grid,
//   Box,
// } from "@mui/material";
// import EditIcon from "@mui/icons-material/Edit";
// import { useSnackbar } from "notistack";
// import Autocomplete from "@mui/material/Autocomplete";
// import {
//   useLazyGetBusinessunitsQuery,
//   useLazyGetCompaniesQuery,
//   useLazyGetDepartmentsQuery,
//   useLazyGetLocationsQuery,
//   useLazyGetSubunitsQuery,
//   useLazyGetUnitsQuery,
// } from "../../../features/api/masterlist/ymirApi";

// const UserModal = ({ open, handleClose, refetch, selectedUser }) => {
//   const { enqueueSnackbar } = useSnackbar();
//   const [formData, setFormData] = useState({
//     employeeId: "",
//     role: "",
//     username: "",
//     firstName: "",
//     lastName: "",
//     middleName: "",
//     suffix: "",
//     position: "",
//     company: "",
//     businessUnit: "",
//     department: "",
//     unit: "",
//     subUnit: "",
//     location: "",
//     warehouse: "",
//   });

//   // Fetch company to location data
//   const [companyTrigger, { data: companyData }] = useLazyGetCompaniesQuery();
//   const [businessUnitTrigger, { data: businessUnitData }] =
//     useLazyGetBusinessunitsQuery();
//   const [departmentTrigger, { data: departmentData }] =
//     useLazyGetDepartmentsQuery();
//   const [unitTrigger, { data: unitData }] = useLazyGetUnitsQuery();
//   const [subunitTrigger, { data: subunitData }] = useLazyGetSubunitsQuery();
//   const [locationTrigger, { data: locationData }] = useLazyGetLocationsQuery();

//   useEffect(() => {
//     if (selectedUser) {
//       setFormData({
//         employeeId: selectedUser.employeeId || "",
//         role: selectedUser.role || "",
//         username: selectedUser.username || "",
//         firstName: selectedUser.firstName || "",
//         lastName: selectedUser.lastName || "",
//         middleName: selectedUser.middleName || "",
//         suffix: selectedUser.suffix || "",
//         position: selectedUser.position || "",
//         company: selectedUser.company || "",
//         businessUnit: selectedUser.businessUnit || "",
//         department: selectedUser.department || "",
//         unit: selectedUser.unit || "",
//         subUnit: selectedUser.subUnit || "",
//         location: selectedUser.location || "",
//         warehouse: selectedUser.warehouse || "",
//       });
//     } else {
//       setFormData({
//         employeeId: "",
//         role: "",
//         username: "",
//         firstName: "",
//         lastName: "",
//         middleName: "",
//         suffix: "",
//         position: "",
//         company: "",
//         businessUnit: "",
//         department: "",
//         unit: "",
//         subUnit: "",
//         location: "",
//         warehouse: "",
//       });
//     }
//   }, [selectedUser]);

//   const handleChange = (event) => {
//     setFormData({ ...formData, [event.target.name]: event.target.value });
//   };

//   const handleSubmit = async () => {
//     try {
//       enqueueSnackbar("User saved successfully!", { variant: "success" });
//       refetch();
//       handleClose();
//     } catch (error) {
//       enqueueSnackbar("Failed to save user.", { variant: "error" });
//     }
//   };

//   return (
//     <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
//       {/* Header with background color */}
//       <DialogTitle
//         sx={{
//           backgroundColor: "#E3F2FD",
//           fontWeight: "bold",
//           fontSize: "1.2rem",
//           padding: "12px 16px",
//         }}>
//         Register a New User
//       </DialogTitle>

//       <DialogContent dividers>
//         <Grid container spacing={2}>
//           {/* Employee ID & Role */}
//           <Grid item xs={8}>
//             <FormControl fullWidth>
//               <InputLabel>Employee ID</InputLabel>
//               <Select
//                 name="employeeId"
//                 value={formData.employeeId}
//                 onChange={handleChange}>
//                 <MenuItem value="AGENCY-170035">AGENCY-170035</MenuItem>
//               </Select>
//             </FormControl>
//           </Grid>
//           <Grid item xs={4}>
//             <FormControl fullWidth>
//               <InputLabel>Roles</InputLabel>
//               <Select name="role" value={formData.role} onChange={handleChange}>
//                 <MenuItem value="Admin">Admin</MenuItem>
//                 <MenuItem value="User">User</MenuItem>
//               </Select>
//             </FormControl>
//           </Grid>

//           {/* Username with Edit Icon */}
//           <Grid item xs={12}>
//             <TextField
//               fullWidth
//               label="Username"
//               name="username"
//               value={formData.username}
//               onChange={handleChange}
//               InputProps={{
//                 endAdornment: <EditIcon style={{ cursor: "pointer" }} />,
//               }}
//             />
//           </Grid>

//           {/* First Name & Last Name */}
//           <Grid item xs={6}>
//             <TextField
//               fullWidth
//               label="First Name"
//               name="firstName"
//               value={formData.firstName}
//               onChange={handleChange}
//             />
//           </Grid>
//           <Grid item xs={6}>
//             <TextField
//               fullWidth
//               label="Last Name"
//               name="lastName"
//               value={formData.lastName}
//               onChange={handleChange}
//             />
//           </Grid>

//           {/* Middle Name & Suffix */}
//           <Grid item xs={8}>
//             <TextField
//               fullWidth
//               label="Middle Name"
//               name="middleName"
//               value={formData.middleName}
//               onChange={handleChange}
//             />
//           </Grid>
//           <Grid item xs={4}>
//             <TextField
//               fullWidth
//               label="Suffix"
//               name="suffix"
//               value={formData.suffix}
//               onChange={handleChange}
//             />
//           </Grid>

//           {/* Company to Location Autocomplete */}
//           <Grid item xs={12}>
//             <Autocomplete
//               disablePortal
//               options={companyData?.result || []}
//               getOptionLabel={(option) => option.code + " - " + option.name}
//               onOpen={() => companyTrigger()}
//               renderInput={(params) => (
//                 <TextField {...params} label="Company" />
//               )}
//             />
//           </Grid>
//           <Grid item xs={12}>
//             <Autocomplete
//               disablePortal
//               options={businessUnitData?.result || []}
//               getOptionLabel={(option) => option.name}
//               onOpen={() => businessUnitTrigger()}
//               renderInput={(params) => (
//                 <TextField {...params} label="Business Unit" />
//               )}
//             />
//           </Grid>
//           <Grid item xs={12}>
//             <Autocomplete
//               disablePortal
//               options={departmentData?.result || []}
//               getOptionLabel={(option) => option.name}
//               onOpen={() => departmentTrigger()}
//               renderInput={(params) => (
//                 <TextField {...params} label="Department" />
//               )}
//             />
//           </Grid>
//           <Grid item xs={12}>
//             <Autocomplete
//               disablePortal
//               options={unitData?.result || []}
//               getOptionLabel={(option) => option.name}
//               onOpen={() => unitTrigger()}
//               renderInput={(params) => <TextField {...params} label="Unit" />}
//             />
//           </Grid>
//           <Grid item xs={12}>
//             <Autocomplete
//               disablePortal
//               options={subunitData?.result || []}
//               getOptionLabel={(option) => option.name}
//               onOpen={() => subunitTrigger()}
//               renderInput={(params) => (
//                 <TextField {...params} label="Sub Unit" />
//               )}
//             />
//           </Grid>
//           <Grid item xs={12}>
//             <Autocomplete
//               disablePortal
//               options={locationData?.result || []}
//               getOptionLabel={(option) => option.name}
//               onOpen={() => locationTrigger()}
//               renderInput={(params) => (
//                 <TextField {...params} label="Location" />
//               )}
//             />
//           </Grid>
//         </Grid>
//       </DialogContent>

//       <DialogActions>
//         <Button onClick={handleClose}>Cancel</Button>
//         <Button onClick={handleSubmit} variant="contained">
//           Save
//         </Button>
//       </DialogActions>
//     </Dialog>
//   );
// };

// export default UserModal;
