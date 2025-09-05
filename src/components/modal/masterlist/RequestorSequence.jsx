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

  const getPositionDisplay = (position) => {
    if (!position) return "";
    if (typeof position === "string") return position;
    if (typeof position === "object") {
      return position.position_name || position.name || "";
    }
    return String(position);
  };

  const getDepartmentDisplay = (department) => {
    if (!department) return "";
    if (typeof department === "string") return department;
    if (typeof department === "object") {
      return department.department_name || department.name || "";
    }
    return String(department);
  };

  useEffect(() => {
    const currentRequestorIds = requestorSequence.map((req) => req.id);
    const safeUsers = Array.isArray(users) ? users : [];
    const filtered = safeUsers.filter(
      (user) => !currentRequestorIds.includes(user.id)
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
        position: getPositionDisplay(requestor.position),
        department: getDepartmentDisplay(requestor.department),
      };
      setRequestorSequence([...requestorSequence, newRequestor]);
      setSelectedRequestor("");
    }
  };

  const handleRemoveRequestor = (userId) => {
    const updatedSequence = requestorSequence.filter(
      (req) => req.id !== userId
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
                      {requestor.position && (
                        <Typography variant="caption" color="text.secondary">
                          {typeof requestor.position === "string"
                            ? requestor.position
                            : requestor.position.position_name || "No Position"}
                        </Typography>
                      )}
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
                    {requestor.name}
                  </Typography>
                  {requestor.position && (
                    <Typography variant="body2" color="text.secondary">
                      {requestor.position}
                    </Typography>
                  )}
                  {requestor.department && (
                    <Typography variant="body2" color="text.secondary">
                      {requestor.department}
                    </Typography>
                  )}
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
