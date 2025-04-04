import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { useSnackbar } from "notistack";
import Autocomplete from "@mui/material/Autocomplete";
import {
  useCreateUserMutation,
  useUpdateUserMutation,
  useGetEmployeeIdNumbersQuery,
  useGetSingleUserQuery,
} from "../../../features/api/usermanagement/userApi";
import { useDispatch, useSelector } from "react-redux";
import { resetModal } from "../../../features/slice/modalSlice";
import { useGetShowRolesQuery } from "../../../features/api/usermanagement/rolesApi";

const UserModal = ({ open, handleClose, refetch, selectedUser }) => {
  const { enqueueSnackbar } = useSnackbar();
  const userModal = useSelector((state) => state.modal.userModal);
  const dispatch = useDispatch();
  const handleCloseModal = () => {
    dispatch(resetModal());
    setFormData({
      employeeId: "",
      role: null,
      username: "",
      firstName: "",
      lastName: "",
      middleName: "",
      suffix: "",
      company: "",
      businessUnit: "",
      department: "",
      unit: "",
      subUnit: "",
      location: "",
    });
  };

  console.log("selectedUser", selectedUser);

  const [formData, setFormData] = useState({
    employeeId: "",
    role: null,
    username: "",
    firstName: "",
    lastName: "",
    middleName: "",
    suffix: "",
    company: "",
    businessUnit: "",
    department: "",
    unit: "",
    subUnit: "",
    location: "",
  });

  console.log("formData", formData);

  const { data: employeeData, isLoading: employeeLoading } =
    useGetEmployeeIdNumbersQuery();

  console.log("employeeEdata", employeeData);

  const employeeIdOptions = employeeData?.result || [];
  const handleEmployeeIdChange = (event, newValue) => {
    console.log("newvalue", newValue);
    setFormData((prev) => {
      console.log("prev", prev);
      return {
        ...prev,
        employeeId: newValue || null,
      };
    });
  };

  const employeeIdNumber = formData.employeeId ? formData.employeeId.id : null;

  const { data: rolesData } = useGetShowRolesQuery();

  const handleRoleChange = (event, newValue) => {
    setFormData((prev) => ({
      ...prev,
      role: newValue || null,
    }));
  };

  const { data: userDetails, isFetching: userFetching } = useGetSingleUserQuery(
    { id: employeeIdNumber },
    { skip: !userModal || !employeeIdNumber }
  );

  useEffect(() => {
    if (userDetails?.result) {
      setFormData((prev) => ({
        ...prev,
        firstName: userDetails.result.general_info?.first_name || "",
        lastName: userDetails.result.general_info?.last_name || "",
        middleName: userDetails.result.general_info?.middle_name || "",
        suffix: userDetails.result.general_info?.suffix || "",
        company: userDetails.result.unit_info?.company?.company_name || "",
        businessUnit:
          userDetails.result.unit_info?.business_unit?.business_unit_name || "",
        department:
          userDetails.result.unit_info?.department?.department_name || "",
        unit: userDetails.result.unit_info?.unit?.unit_name || "",
        subUnit: userDetails.result.unit_info?.sub_unit?.sub_unit_name || "",
        location: userDetails.result.unit_info?.location?.location_name || "",
      }));
    }
  }, [userDetails]);

  console.log("user details", userDetails);
  const [createUser] = useCreateUserMutation();
  const [updateUser] = useUpdateUserMutation();
  const [isEditing, setIsEditing] = useState(false);

  const generateUsername = () => {
    const firstNameInitial = formData.firstName?.[0]?.toLowerCase() || "";
    const middleNameInitial = formData.middleName
      ? formData.middleName[0]?.toLowerCase()
      : "";
    const lastName = formData.lastName?.toLowerCase().replace(/\s+/g, "") || "";

    return `${firstNameInitial}${middleNameInitial}${lastName}`.trim();
  };

  useEffect(() => {
    if (formData.firstName && formData.lastName) {
      setFormData((prev) => ({
        ...prev,
        username: generateUsername(),
      }));
    }
  }, [formData.firstName, formData.middleName, formData.lastName]);

  const handleSubmit = async () => {
    try {
      const requestData = {
        employee_id: formData.employeeId?.id || null,
        role_id: formData.role?.id || null,
        username: formData.username?.trim() || "",
      };

      console.log("Submitting data:", requestData);

      if (!selectedUser && !requestData.employee_id) {
        enqueueSnackbar("Employee ID is required.", { variant: "error" });
        return;
      }

      if (!selectedUser && !requestData.role_id) {
        enqueueSnackbar("Role is required.", { variant: "error" });
        return;
      }

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

        setFormData({
          employeeId: "",
          role: null,
          username: "",
          firstName: "",
          lastName: "",
          middleName: "",
          suffix: "",
          company: "",
          businessUnit: "",
          department: "",
          unit: "",
          subUnit: "",
          location: "",
        });
      }

      console.log("API response for selected user:", response);

      await refetch();

      if (typeof handleClose === "function") {
        handleClose();
      }

      dispatch(resetModal());
    } catch (error) {
      console.error("Error details:", error);
      enqueueSnackbar("An error occurred. Please try again.", {
        variant: "error",
      });
    }
  };

  const disabledStyle = { filter: "grayscale(100%)" };
  const handleTextFieldChange = (event) => {
    setFormData((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  console.log("Modal open prop:", userModal);

  useEffect(() => {
    if (selectedUser) {
      setFormData((prev) => ({
        ...prev,
        username: selectedUser.username || generateUsername(),
        role: selectedUser.role || null,
      }));
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  }, [selectedUser]);

  return (
    <Dialog open={userModal} onClose={handleCloseModal} fullWidth maxWidth="sm">
      <DialogTitle
        sx={{
          backgroundColor: "#E3F2FD",
          fontWeight: "bold",
          fontSize: "1.2rem",
          padding: "12px 16px",
        }}>
        {selectedUser ? "Edit User" : "Register a New User"}
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid item xs={8}>
            {selectedUser ? (
              <TextField
                fullWidth
                label="Employee ID"
                value={selectedUser.full_id_number || "N/A"}
                disabled
                sx={{ filter: "grayscale(100%)" }}
              />
            ) : (
              <Autocomplete
                options={
                  Array.isArray(employeeIdOptions) ? employeeIdOptions : []
                }
                value={
                  employeeIdOptions.find(
                    (emp) => emp.id === formData.employeeId?.id
                  ) || null
                }
                onChange={handleEmployeeIdChange}
                loading={employeeLoading}
                getOptionLabel={(option) => option?.full_id_number || ""}
                renderInput={(params) => (
                  <TextField {...params} label="Employee ID" />
                )}
              />
            )}
          </Grid>
          <Grid item xs={4}>
            <Autocomplete
              disablePortal
              options={rolesData?.result || []}
              value={selectedUser ? selectedUser.role : formData.role || null}
              onChange={handleRoleChange}
              getOptionLabel={(option) => `${option.id} - ${option.role_name}`}
              renderInput={(params) => <TextField {...params} label="Role" />}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Username"
              name="username"
              value={
                isEditing
                  ? formData.username
                  : selectedUser
                  ? selectedUser.username
                  : formData.username || ""
              }
              onChange={handleTextFieldChange}
              onClick={() => {
                setIsEditing(true);
                setFormData((prev) => ({
                  ...prev,
                  username: prev.username || selectedUser?.username || "",
                }));
              }}
              InputProps={{
                readOnly: !isEditing,
                endAdornment: (
                  <EditIcon
                    style={{
                      cursor: "pointer",
                      transition: "color 0.2s ease-in-out",
                    }}
                    onMouseEnter={(e) => (e.target.style.color = "blue")}
                    onMouseLeave={(e) => (e.target.style.color = "inherit")}
                  />
                ),
              }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="First Name"
              value={
                selectedUser
                  ? selectedUser.first_name
                  : formData.firstName || ""
              }
              disabled
              sx={disabledStyle}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Last Name"
              value={
                selectedUser ? selectedUser.last_name : formData.lastName || ""
              }
              disabled
              sx={disabledStyle}
            />
          </Grid>
          <Grid item xs={8}>
            <TextField
              fullWidth
              label="Middle Name"
              value={
                selectedUser
                  ? selectedUser.middle_name
                  : formData.middleName || ""
              }
              disabled
              sx={disabledStyle}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              fullWidth
              label="Suffix"
              value={selectedUser ? selectedUser.suffix : formData.suffix || ""}
              disabled
              sx={disabledStyle}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Company"
              value={
                selectedUser
                  ? selectedUser?.company?.company_name
                  : formData.company || ""
              }
              disabled
              sx={selectedUser ? { filter: "grayscale(100%)" } : disabledStyle}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Business Unit"
              value={
                selectedUser
                  ? selectedUser?.business_unit?.business_unit_name
                  : formData.businessUnit || ""
              }
              disabled
              sx={disabledStyle}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Department"
              value={
                selectedUser
                  ? selectedUser?.department?.department_name
                  : formData.department || ""
              }
              disabled
              sx={disabledStyle}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Unit"
              value={
                selectedUser
                  ? selectedUser?.unit?.unit_name
                  : formData.unit || ""
              }
              disabled
              sx={disabledStyle}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Sub Unit"
              value={
                selectedUser && selectedUser.sub_unit
                  ? selectedUser?.sub_unit?.sub_unit_name
                  : formData.subUnit || ""
              }
              disabled
              sx={disabledStyle}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Location"
              value={
                selectedUser
                  ? selectedUser?.location?.location_name
                  : formData.location || ""
              }
              disabled
              sx={disabledStyle}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={() => dispatch(resetModal())}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">
          {selectedUser ? "Update" : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserModal;
