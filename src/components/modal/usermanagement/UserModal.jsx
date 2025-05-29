import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import { useSnackbar } from "notistack";
import { useDispatch, useSelector } from "react-redux";
import {
  useCreateUserMutation,
  useUpdateUserMutation,
  useGetEmployeeIdNumbersQuery,
  useGetSingleUserQuery,
} from "../../../features/api/usermanagement/userApi";
import { resetModal } from "../../../features/slice/modalSlice";
import { useGetAllShowRolesQuery } from "../../../features/api/usermanagement/rolesApi";

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

  const { data: rolesData } = useGetAllShowRolesQuery();

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

  const SingleRow = ({ children }) => <Box mb={2}>{children}</Box>;

  return (
    <Dialog open={userModal} onClose={handleCloseModal} fullWidth maxWidth="sm">
      <DialogTitle
        sx={{ background: "#E3F2FD", fontWeight: 600, fontSize: 18 }}>
        {selectedUser ? "EDIT USER" : "ADD NEW USER"}
      </DialogTitle>

      <DialogContent dividers sx={{ padding: 3 }}>
        <SingleRow>
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
              fullWidth
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
                <TextField {...params} label="Employee ID" fullWidth />
              )}
            />
          )}
        </SingleRow>

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

        <SingleRow>
          <TextField
            fullWidth
            label="Username"
            name="username"
            value={formData.username}
            onChange={handleTextFieldChange}
          />
        </SingleRow>

        <SingleRow>
          <TextField
            fullWidth
            label="Password (FIRST LOGIN REQUIRES A PASSWORD CHANGE)"
            name="password"
            value={formData.username}
            onChange={handleTextFieldChange}
            disabled
            sx={disabledStyle}
          />
        </SingleRow>

        <SingleRow>
          <TextField
            fullWidth
            label="First Name"
            value={formData.firstName}
            disabled
            sx={disabledStyle}
          />
        </SingleRow>

        <SingleRow>
          <TextField
            fullWidth
            label="Last Name"
            value={formData.lastName}
            disabled
            sx={disabledStyle}
          />
        </SingleRow>

        <SingleRow>
          <TextField
            fullWidth
            label="Middle Name"
            value={formData.middleName}
            disabled
            sx={disabledStyle}
          />
        </SingleRow>

        <SingleRow>
          <TextField
            fullWidth
            label="Suffix"
            value={formData.suffix}
            disabled
            sx={disabledStyle}
          />
        </SingleRow>

        <SingleRow>
          <TextField
            fullWidth
            label="Company"
            value={formData.company}
            disabled
            sx={disabledStyle}
          />
        </SingleRow>

        <SingleRow>
          <TextField
            fullWidth
            label="Business Unit"
            value={formData.businessUnit}
            disabled
            sx={disabledStyle}
          />
        </SingleRow>

        <SingleRow>
          <TextField
            fullWidth
            label="Department"
            value={formData.department}
            disabled
            sx={disabledStyle}
          />
        </SingleRow>

        <SingleRow>
          <TextField
            fullWidth
            label="Unit"
            value={formData.unit}
            disabled
            sx={disabledStyle}
          />
        </SingleRow>

        <SingleRow>
          <TextField
            fullWidth
            label="Sub Unit"
            value={formData.subUnit}
            disabled
            sx={disabledStyle}
          />
        </SingleRow>

        <SingleRow>
          <TextField
            fullWidth
            label="Location"
            value={formData.location}
            disabled
            sx={disabledStyle}
          />
        </SingleRow>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleCloseModal}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isCreateDisabled}>
          {selectedUser ? "Update" : "Submit"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserModal;
