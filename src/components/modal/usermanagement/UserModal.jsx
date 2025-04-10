import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  Typography,
  IconButton,
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import EditIcon from "@mui/icons-material/Edit";
import { useSnackbar } from "notistack";
import { useDispatch, useSelector } from "react-redux";
import {
  useCreateUserMutation,
  useUpdateUserMutation,
  useGetEmployeeIdNumbersQuery,
  useGetSingleUserQuery,
} from "../../../features/api/usermanagement/userApi";

import { resetModal } from "../../../features/slice/modalSlice";
import { useGetShowRolesQuery } from "../../../features/api/usermanagement/rolesApi";
const UserModal = ({ open, handleClose, refetch, selectedUser }) => {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const userModal = useSelector((state) => state.modal.userModal);

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

  const [isEditing, setIsEditing] = useState(false);

  const { data: employeeData, isLoading: employeeLoading } =
    useGetEmployeeIdNumbersQuery();
  const employeeIdOptions = employeeData?.result || [];

  const { data: rolesData } = useGetShowRolesQuery();

  const employeeIdNumber = formData.employeeId?.id || null;

  const { data: userDetails } = useGetSingleUserQuery(
    { id: employeeIdNumber },
    { skip: !userModal || !employeeIdNumber }
  );

  const [createUser] = useCreateUserMutation();
  const [updateUser] = useUpdateUserMutation();

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

  const handleEmployeeIdChange = (_, newValue) => {
    setFormData((prev) => ({
      ...prev,
      employeeId: newValue || null,
    }));
  };

  const handleRoleChange = (_, newValue) => {
    setFormData((prev) => ({
      ...prev,
      role: newValue || null,
    }));
  };

  const handleTextFieldChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const generateUsername = () => {
    const f = formData.firstName?.[0]?.toLowerCase() || "";
    const m = formData.middleName?.[0]?.toLowerCase() || "";
    const l = formData.lastName?.toLowerCase().replace(/\s+/g, "") || "";
    return `${f}${m}${l}`.trim();
  };

  useEffect(() => {
    if (formData.firstName && formData.lastName) {
      setFormData((prev) => ({
        ...prev,
        username: generateUsername(),
      }));
    }
  }, [formData.firstName, formData.middleName, formData.lastName]);

  useEffect(() => {
    if (userDetails?.result) {
      const g = userDetails.result.general_info;
      const u = userDetails.result.unit_info;
      setFormData((prev) => ({
        ...prev,
        firstName: g?.first_name || "",
        lastName: g?.last_name || "",
        middleName: g?.middle_name || "",
        suffix: g?.suffix || "",
        company: u?.company?.company_name || "",
        businessUnit: u?.business_unit?.business_unit_name || "",
        department: u?.department?.department_name || "",
        unit: u?.unit?.unit_name || "",
        subUnit: u?.sub_unit?.sub_unit_name || "",
        location: u?.location?.location_name || "",
      }));
    }
  }, [userDetails]);

  useEffect(() => {
    if (selectedUser) {
      setFormData((prev) => ({
        ...prev,
        firstName: selectedUser.first_name || "",
        lastName: selectedUser.last_name || "",
        middleName: selectedUser.middle_name || "",
        suffix: selectedUser.suffix || "",
        company: selectedUser.company?.company_name || "",
        businessUnit: selectedUser.business_unit?.business_unit_name || "",
        department: selectedUser.department?.department_name || "",
        unit: selectedUser.unit?.unit_name || "",
        subUnit: selectedUser.sub_unit?.sub_unit_name || "",
        location: selectedUser.location?.location_name || "",
        username: selectedUser.username || "",
        role: selectedUser.role || null,
      }));
      setIsEditing(false);
    } else {
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
      setIsEditing(true);
    }
  }, [selectedUser]);

  const handleSubmit = async () => {
    const requestData = {
      employee_id: formData.employeeId?.id || null,
      role_id: formData.role?.id || null,
      username: formData.username?.trim(),
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
      console.error(error);
      enqueueSnackbar("An error occurred. Please try again.", {
        variant: "error",
      });
    }
  };

  const disabledStyle = { filter: "grayscale(100%)" };

  const isCreateDisabled =
    !selectedUser &&
    (!formData.employeeId?.id || !formData.role?.id || !formData.username);

  return (
    <Dialog open={userModal} onClose={handleCloseModal} fullWidth maxWidth="sm">
      <DialogTitle
        sx={{ background: "#E3F2FD", fontWeight: 600, fontSize: 18 }}>
        {selectedUser ? "Edit User" : "Register a New User"}
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid item xs={8}>
            {selectedUser ? (
              <TextField
                fullWidth
                label="Employee ID"
                value={selectedUser.full_id_number || ""}
                disabled
                sx={disabledStyle}
              />
            ) : (
              <Autocomplete
                options={employeeIdOptions}
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
              options={rolesData || []}
              value={formData.role || null}
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
              value={formData.username}
              onChange={handleTextFieldChange}
            />
          </Grid>
          {[
            { label: "First Name", value: formData.firstName },
            { label: "Last Name", value: formData.lastName },
            { label: "Middle Name", value: formData.middleName },
            { label: "Suffix", value: formData.suffix },
            { label: "Company", value: formData.company },
            { label: "Business Unit", value: formData.businessUnit },
            { label: "Department", value: formData.department },
            { label: "Unit", value: formData.unit },
            { label: "Sub Unit", value: formData.subUnit },
            { label: "Location", value: formData.location },
          ].map((field, index) => (
            <Grid item xs={index === 2 ? 8 : index === 3 ? 4 : 12} key={index}>
              <TextField
                fullWidth
                label={field.label}
                value={field.value}
                disabled
                sx={disabledStyle}
              />
            </Grid>
          ))}
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleCloseModal}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isCreateDisabled}
          sx={isCreateDisabled ? disabledStyle : {}}>
          {selectedUser ? "Update" : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserModal;
