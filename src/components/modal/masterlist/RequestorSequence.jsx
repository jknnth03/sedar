import React, { useEffect, useState } from "react";
import {
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Paper,
  Avatar,
  Button,
  IconButton,
  CircularProgress,
} from "@mui/material";
import {
  Person as PersonIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { useGetAllUsersQuery } from "../../../features/api/usermanagement/userApi";

const RequestorSequence = ({
  requestorSequence = [],
  setRequestorSequence,
  isReadOnly = false,
  errors = {},
}) => {
  const [availableRequestors, setAvailableRequestors] = useState([]);
  const [selectedRequestor, setSelectedRequestor] = useState("");

  const { data: usersData, isLoading: isUsersLoading } = useGetAllUsersQuery();

  const users =
    usersData?.result?.data ||
    usersData?.result ||
    usersData?.data ||
    usersData ||
    [];

  const getPositionDisplay = (requestor) => {
    if (!requestor) return "No Position";

    if (requestor.position) {
      if (
        typeof requestor.position === "object" &&
        requestor.position.position_name
      ) {
        return requestor.position.position_name;
      }
      if (typeof requestor.position === "string") {
        return requestor.position;
      }
    }

    if (requestor.position_name) return requestor.position_name;

    return "No Position";
  };

  const getDepartmentDisplay = (requestor) => {
    if (!requestor) return "No Department";

    if (
      requestor.position &&
      typeof requestor.position === "object" &&
      requestor.position.department
    ) {
      return requestor.position.department;
    }

    if (requestor.department_name) return requestor.department_name;

    if (requestor.position_department) return requestor.position_department;

    if (requestor.department) {
      if (typeof requestor.department === "string") return requestor.department;
      if (typeof requestor.department === "object") {
        return (
          requestor.department.department_name ||
          requestor.department.name ||
          "No Department"
        );
      }
    }

    return "No Department";
  };

  useEffect(() => {
    const currentRequestorIds = requestorSequence.map((req) => req.id);
    const safeUsers = Array.isArray(users) ? users : [];
    const filtered = safeUsers.filter(
      (user) => !currentRequestorIds.includes(user.id),
    );
    setAvailableRequestors([...filtered]);
  }, [users, requestorSequence]);

  const handleAddRequestor = (userId) => {
    if (!userId) return;

    const safeUsers = Array.isArray(users) ? users : [];
    const requestor = safeUsers.find((u) => u.id === userId);
    if (requestor) {
      const newRequestor = {
        id: requestor.id,
        name: requestor.full_name || requestor.name || "Unknown User",
        position: requestor.position || null,
        department_name: requestor.department_name || null,
        position_name: requestor.position?.position_name || null,
        position_department: requestor.position?.department || null,
      };
      setRequestorSequence([...requestorSequence, newRequestor]);
      setSelectedRequestor("");
    }
  };

  const handleRemoveRequestor = (userId) => {
    const updatedSequence = requestorSequence.filter(
      (req) => req.id !== userId,
    );
    setRequestorSequence([...updatedSequence]);
  };

  return (
    <Box sx={{ mt: 2, width: "100%" }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Requestor Tagging
      </Typography>

      {!isReadOnly && (
        <Box
          sx={{
            mb: 2,
            display: "flex",
            alignItems: "flex-start",
            gap: 1,
            width: "100%",
          }}>
          <FormControl
            sx={{ minWidth: 600, flex: 1 }}
            error={!!errors.requestor_user_id}
            disabled={isReadOnly || isUsersLoading}>
            <InputLabel id="requestor-select-label">
              Select Requestor
            </InputLabel>
            <Select
              labelId="requestor-select-label"
              value={selectedRequestor}
              label="Select Requestor"
              onChange={(e) => setSelectedRequestor(e.target.value)}
              disabled={availableRequestors.length === 0 || isUsersLoading}
              sx={{
                backgroundColor: isReadOnly ? "#f5f5f5" : "white",
                height: "75px",
                "& .MuiSelect-select": {
                  paddingTop: "14px",
                  paddingBottom: "14px",
                },
              }}>
              {isUsersLoading ? (
                <MenuItem disabled>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    Loading requestors...
                  </Box>
                </MenuItem>
              ) : availableRequestors.length === 0 ? (
                <MenuItem disabled>
                  <em style={{ color: "#999" }}>No available requestors</em>
                </MenuItem>
              ) : (
                availableRequestors.map((requestor) => (
                  <MenuItem key={requestor.id} value={requestor.id}>
                    <Box>
                      <Typography variant="body2" fontWeight={500}>
                        {requestor.full_name ||
                          requestor.name ||
                          "Unknown User"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {requestor.position?.position_name ||
                          requestor.position ||
                          "No Position"}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))
              )}
            </Select>
            {errors.requestor_user_id && (
              <FormHelperText>
                {errors.requestor_user_id.message}
              </FormHelperText>
            )}
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => handleAddRequestor(selectedRequestor)}
            disabled={!selectedRequestor || isUsersLoading}
            sx={{
              height: "75px",
              minWidth: "126px",
              textTransform: "none",
              borderColor: "rgb(33, 61, 112)",
              color: "rgb(33, 61, 112)",
              "&:hover": {
                backgroundColor: "rgba(33, 61, 112, 0.04)",
              },
            }}>
            ADD
          </Button>
        </Box>
      )}

      <Box sx={{ width: "100%" }}>
        <Box style={{ minHeight: "200px", width: "100%" }}>
          {requestorSequence.length === 0 ? (
            <Paper
              sx={{
                p: 3,
                textAlign: "center",
                backgroundColor: "#f8f9fa",
                border: "2px dashed #ddd",
                minHeight: "150px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
              }}>
              <Typography color="text.secondary">
                No requestors added yet.{" "}
                {!isReadOnly && "Select requestors from the dropdown above."}
              </Typography>
            </Paper>
          ) : (
            requestorSequence.map((requestor) => (
              <Paper
                key={requestor.id}
                sx={{
                  p: 2,
                  mb: 1,
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: "white",
                  border: "1px solid #e0e0e0",
                  width: "100%",
                }}>
                <Avatar sx={{ mr: 2, bgcolor: "rgb(33, 61, 112)" }}>
                  <PersonIcon />
                </Avatar>

                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {requestor.name || requestor.full_name || "Unknown User"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {getPositionDisplay(requestor)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {getDepartmentDisplay(requestor)}
                  </Typography>
                </Box>

                {!isReadOnly && (
                  <IconButton
                    onClick={() => handleRemoveRequestor(requestor.id)}
                    size="small"
                    sx={{
                      color: "error.main",
                    }}>
                    <DeleteIcon />
                  </IconButton>
                )}
              </Paper>
            ))
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default RequestorSequence;
