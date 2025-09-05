import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Typography,
  Box,
  Grid,
  TextField,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Paper,
  Avatar,
  Chip,
  Alert,
  Button,
  IconButton,
  Tooltip,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import {
  DragIndicator as DragIcon,
  Person as PersonIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { ReactSortable } from "react-sortablejs";
import ApprovalFlowFormFields from "./ApprovalFlowFormFields";
import ApprovalFlowActions from "./ApprovalFlowActions";
import {
  useLazyGetAllOneRdfQuery,
  useGetAllOneRdfQuery,
} from "../../../features/api/masterlist/realonerdfApi";

import { useGetAllApprovalFormsQuery } from "../../../features/api/approvalsetting/approvalFormApi";
import {
  useGetAllApproversQuery,
  useGetAllReceiversQuery,
} from "../../../features/api/usermanagement/userApi";

const ApprovalFlowModal = ({
  open = false,
  onClose,
  onSave,
  selectedEntry = null,
  isLoading = false,
  mode = "create",
  chargings = [],
}) => {
  const defaultValues = {
    form_id: "",
    rdf_charging: "",
    department: "",
    company: "",
    business_unit: "",
    unit: "",
    sub_unit: "",
    location: "",
    name: "",
    description: "",
    receiver_user_id: "",
    approver_user_id: "",
    charging_id: "",
  };

  const {
    control,
    formState: { errors },
    setValue,
    reset,
    handleSubmit,
  } = useForm({
    defaultValues,
  });

  const [currentMode, setCurrentMode] = useState(mode);
  const [approverSequence, setApproverSequence] = useState([]);
  const [availableApprovers, setAvailableApprovers] = useState([]);
  const [filteredDepartments, setFilteredDepartments] = useState([]);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [filteredBusinessUnits, setFilteredBusinessUnits] = useState([]);
  const [filteredUnits, setFilteredUnits] = useState([]);
  const [filteredSubUnits, setFilteredSubUnits] = useState([]);
  const [allChargings, setAllChargings] = useState([]);
  const [selectedApprover, setSelectedApprover] = useState("");
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const [processedChargingId, setProcessedChargingId] = useState(null);
  const [isInUse, setIsInUse] = useState(false);
  const [noChargingChecked, setNoChargingChecked] = useState(false);

  const { data: allChargingData, isLoading: isAllChargingLoading } =
    useGetAllOneRdfQuery();
  const [getOneRdf, { data: rdfData, isLoading: isRdfLoading }] =
    useLazyGetAllOneRdfQuery();

  const { data: approversData, isLoading: isApproversLoading } =
    useGetAllApproversQuery();
  const { data: receiversData, isLoading: isReceiversLoading } =
    useGetAllReceiversQuery();
  const { data: formsData, isLoading: isFormsLoading } =
    useGetAllApprovalFormsQuery();

  const approvers =
    approversData?.result?.data ||
    approversData?.result ||
    approversData?.data ||
    approversData ||
    [];
  const receivers =
    receiversData?.result?.data ||
    receiversData?.result ||
    receiversData?.data ||
    receiversData ||
    [];
  const approvalForms =
    formsData?.result?.data ||
    formsData?.result ||
    formsData?.data ||
    formsData ||
    [];
  useEffect(() => {
    console.log("=== RECEIVERS DEBUG ===");
    console.log("receiversData:", receiversData);
    console.log("receivers:", receivers);
    console.log("isReceiversLoading:", isReceiversLoading);
  }, [receiversData, receivers, isReceiversLoading]);

  useEffect(() => {
    console.log("=== APPROVERS DEBUG ===");
    console.log("approversData:", approversData);
    console.log("approvers:", approvers);
    console.log("isApproversLoading:", isApproversLoading);
  }, [approversData, approvers, isApproversLoading]);

  useEffect(() => {
    console.log("=== APPROVAL FORMS DEBUG ===");
    console.log("formsData:", formsData);
    console.log("approvalForms:", approvalForms);
    console.log("isFormsLoading:", isFormsLoading);
  }, [receiversData, receivers, isReceiversLoading]);
  const resetAllState = () => {
    reset(defaultValues);
    setApproverSequence([]);
    setFilteredDepartments([]);
    setFilteredLocations([]);
    setFilteredCompanies([]);
    setFilteredBusinessUnits([]);
    setFilteredUnits([]);
    setFilteredSubUnits([]);
    setSelectedApprover("");
    setIsAutoFilling(false);
    setProcessedChargingId(null);
    setIsInUse(false);
    setNoChargingChecked(false);
  };

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

  const isFieldDisabled = (fieldName) => {
    const inUseDisabledFields = [
      "form_id",
      "rdf_charging",
      "department",
      "company",
      "business_unit",
      "unit",
      "sub_unit",
      "location",
    ];

    const isReadOnly = currentMode === "view";
    const isInUseField = inUseDisabledFields.includes(fieldName);

    return isReadOnly || (isInUse && isInUseField);
  };

  const handleChargingChange = (chargingId) => {
    if (isInUse) return;

    if (!chargingId) {
      setFilteredDepartments([]);
      setFilteredLocations([]);
      setFilteredCompanies([]);
      setFilteredBusinessUnits([]);
      setFilteredUnits([]);
      setFilteredSubUnits([]);
      setValue("department", "", { shouldValidate: true });
      setValue("location", "", { shouldValidate: true });
      setValue("company", "", { shouldValidate: true });
      setValue("business_unit", "", { shouldValidate: true });
      setValue("unit", "", { shouldValidate: true });
      setValue("sub_unit", "", { shouldValidate: true });
      return;
    }

    setProcessedChargingId(chargingId);
    setIsAutoFilling(true);
    getOneRdf({ id: chargingId });
  };

  useEffect(() => {
    if (noChargingChecked) {
      setValue("rdf_charging", null);
      setValue("department", "");
      setValue("company", "");
      setValue("business_unit", "");
      setValue("unit", "");
      setValue("sub_unit", "");
      setValue("location", "");

      setFilteredDepartments([]);
      setFilteredLocations([]);
      setFilteredCompanies([]);
      setFilteredBusinessUnits([]);
      setFilteredUnits([]);
      setFilteredSubUnits([]);
    }
  }, [noChargingChecked, setValue]);

  useEffect(() => {
    if (allChargingData?.result) {
      setAllChargings([...allChargingData.result]);
    }
  }, [allChargingData]);

  useEffect(() => {
    const currentApproverIds = approverSequence.map((app) => app.id);
    const safeApprovers = Array.isArray(approvers) ? approvers : [];
    const filtered = safeApprovers.filter(
      (approver) => !currentApproverIds.includes(approver.id)
    );
    setAvailableApprovers([...filtered]);
  }, [approvers, approverSequence]);

  useEffect(() => {
    if (open) {
      setCurrentMode(mode);

      if (mode === "create") {
        resetAllState();
      }
    } else {
      resetAllState();
      setCurrentMode(mode);
    }
  }, [open, mode]);

  useEffect(() => {
    if (selectedEntry && open && (mode === "view" || mode === "edit")) {
      setIsInUse(selectedEntry.is_in_use || false);

      const formValue = selectedEntry.form ? selectedEntry.form : null;
      const chargingValue = selectedEntry.charging
        ? selectedEntry.charging
        : null;
      const receiverValue = selectedEntry.receiver
        ? selectedEntry.receiver
        : null;

      reset({
        form_id: formValue,
        rdf_charging: chargingValue,
        department: chargingValue?.department_code || "",
        company: chargingValue?.company_code || "",
        business_unit: chargingValue?.business_unit_code || "",
        unit: chargingValue?.unit_code || "",
        sub_unit: chargingValue?.sub_unit_code || "",
        location: chargingValue?.location_code || "",
        name: selectedEntry.name || "",
        description: selectedEntry.description || "",
        receiver_user_id: receiverValue,
        approver_user_id: selectedEntry.approver_user_id || "",
        charging_id: selectedEntry.charging_id || "",
      });

      if (chargingValue) {
        if (chargingValue.department_name) {
          const departmentData = {
            id: chargingValue.department_code,
            code: chargingValue.department_code,
            name: chargingValue.department_name,
          };
          setFilteredDepartments([departmentData]);
          setValue("department", chargingValue.department_code, {
            shouldValidate: true,
          });
        }

        if (chargingValue.company_name) {
          const companyData = {
            id: chargingValue.company_code,
            code: chargingValue.company_code,
            name: chargingValue.company_name,
          };
          setFilteredCompanies([companyData]);
          setValue("company", chargingValue.company_code, {
            shouldValidate: true,
          });
        }

        if (chargingValue.business_unit_name) {
          const businessUnitData = {
            id: chargingValue.business_unit_code,
            code: chargingValue.business_unit_code,
            name: chargingValue.business_unit_name,
          };
          setFilteredBusinessUnits([businessUnitData]);
          setValue("business_unit", chargingValue.business_unit_code, {
            shouldValidate: true,
          });
        }

        if (chargingValue.unit_name) {
          const unitData = {
            id: chargingValue.unit_code,
            code: chargingValue.unit_code,
            name: chargingValue.unit_name,
          };
          setFilteredUnits([unitData]);
          setValue("unit", chargingValue.unit_code, { shouldValidate: true });
        }

        if (chargingValue.sub_unit_name) {
          const subUnitData = {
            id: chargingValue.sub_unit_code,
            code: chargingValue.sub_unit_code,
            name: chargingValue.sub_unit_name,
          };
          setFilteredSubUnits([subUnitData]);
          setValue("sub_unit", chargingValue.sub_unit_code, {
            shouldValidate: true,
          });
        }

        if (chargingValue.location_name) {
          const locationData = {
            id: chargingValue.location_code,
            code: chargingValue.location_code,
            name: chargingValue.location_name,
          };
          setFilteredLocations([locationData]);
          setValue("location", chargingValue.location_code, {
            shouldValidate: true,
          });
        }
      }

      if (selectedEntry.approvers && Array.isArray(selectedEntry.approvers)) {
        const safeApprovers = Array.isArray(approvers) ? approvers : [];
        const approversList = [...selectedEntry.approvers]
          .sort((a, b) => a.step_number - b.step_number)
          .map((approver) => {
            const approverDetails = safeApprovers.find(
              (u) => u.id === approver.approver_id
            );

            return {
              id: approver.approver_id,
              name:
                approver.approver_full_name ||
                approverDetails?.full_name ||
                approverDetails?.name ||
                "Unknown User",
              position: getPositionDisplay(approverDetails?.position),
              department: getDepartmentDisplay(approverDetails?.department),
              order: approver.step_number,
              step_id: approver.step_id,
            };
          });

        setApproverSequence([...approversList]);
      } else if (
        selectedEntry.approver_sequence &&
        Array.isArray(selectedEntry.approver_sequence)
      ) {
        const safeApprovers = Array.isArray(approvers) ? approvers : [];
        const approversList = selectedEntry.approver_sequence.map(
          (approver, index) => ({
            id: approver.id || approver.user_id || approver,
            name:
              approver.full_name ||
              approver.name ||
              approver.user_name ||
              safeApprovers.find(
                (u) =>
                  u.id === approver.id ||
                  u.id === approver.user_id ||
                  u.id === approver
              )?.full_name ||
              safeApprovers.find(
                (u) =>
                  u.id === approver.id ||
                  u.id === approver.user_id ||
                  u.id === approver
              )?.name ||
              "Unknown User",
            position:
              getPositionDisplay(approver.position) ||
              getPositionDisplay(approver.user_position) ||
              getPositionDisplay(
                safeApprovers.find(
                  (u) =>
                    u.id === approver.id ||
                    u.id === approver.user_id ||
                    u.id === approver
                )?.position
              ),
            department:
              getDepartmentDisplay(approver.department) ||
              getDepartmentDisplay(approver.user_department) ||
              getDepartmentDisplay(
                safeApprovers.find(
                  (u) =>
                    u.id === approver.id ||
                    u.id === approver.user_id ||
                    u.id === approver
                )?.department
              ),
            order: approver.order || index + 1,
          })
        );
        setApproverSequence([...approversList]);
      }
    }
  }, [selectedEntry, mode, open, approvers, setValue, reset]);

  useEffect(() => {
    if (rdfData && rdfData.result && isAutoFilling) {
      const chargingData = rdfData.result;
      const selectedChargingData = Array.isArray(chargingData)
        ? chargingData.find((item) => item.id === parseInt(processedChargingId))
        : chargingData;

      if (selectedChargingData) {
        const fields = [
          { name: "department", setter: setFilteredDepartments },
          { name: "location", setter: setFilteredLocations },
          { name: "company", setter: setFilteredCompanies },
          { name: "business_unit", setter: setFilteredBusinessUnits },
          { name: "unit", setter: setFilteredUnits },
          { name: "sub_unit", setter: setFilteredSubUnits },
        ];

        fields.forEach(({ name, setter }) => {
          const code = selectedChargingData[`${name}_code`];
          const displayName = selectedChargingData[`${name}_name`];

          if (code && displayName) {
            const data = {
              id: code || selectedChargingData.id,
              code,
              name: displayName,
            };
            setter([{ ...data }]);
            setValue(name, data.id, { shouldValidate: true });
          } else {
            setter([]);
            setValue(name, "", { shouldValidate: true });
          }
        });
      }

      setIsAutoFilling(false);
    }
  }, [rdfData, setValue, isAutoFilling, processedChargingId]);

  const handleModeChange = (newMode) => {
    setCurrentMode(newMode);
  };

  const handleDragEnd = (newOrder) => {
    const updatedItems = newOrder.map((item, index) => ({
      ...item,
      order: index + 1,
    }));
    setApproverSequence([...updatedItems]);
  };

  const handleAddApprover = (userId) => {
    if (!userId) return;

    const safeApprovers = Array.isArray(approvers) ? approvers : [];
    const approver = safeApprovers.find((u) => u.id === userId);
    if (approver) {
      const newApprover = {
        id: approver.id,
        name: approver.full_name || approver.name || "Unknown User",
        position: getPositionDisplay(approver.position),
        department: getDepartmentDisplay(approver.department),
        order: approverSequence.length + 1,
      };
      setApproverSequence([...approverSequence, newApprover]);
      setSelectedApprover("");
    }
  };

  const handleRemoveApprover = (userId) => {
    const updatedSequence = approverSequence
      .filter((app) => app.id !== userId)
      .map((item, index) => ({
        ...item,
        order: index + 1,
      }));
    setApproverSequence([...updatedSequence]);
  };

  const onSubmit = (data) => {
    const formData = {
      ...data,
      form_id: data.form_id?.id || null,
      rdf_charging: data.rdf_charging?.id || null,
      receiver_user_id: data.receiver_user_id?.id || null,
      approver_sequence: approverSequence.map((app) => app.id),
      charging_id: data.rdf_charging?.id || data.charging_id || null,
      no_charging: noChargingChecked,
    };

    if (onSave) {
      onSave(formData, currentMode);
    }
  };

  const handleClose = () => {
    resetAllState();
    setCurrentMode(mode);
    onClose();
  };

  const handleEditClick = () => {
    setCurrentMode("edit");
  };

  const EditCloseButtons = () => (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      {currentMode === "view" && (
        <Button
          onClick={handleEditClick}
          variant="contained"
          startIcon={<EditIcon />}
          sx={{
            backgroundColor: "#22c55e",
            color: "white",
            textTransform: "none",
            fontWeight: 700,
            fontSize: "0.875rem",
            px: 2.5,
            py: 0.75,
            borderRadius: "4px",
            minHeight: "32px",
            letterSpacing: "0.02em",
            boxShadow: "none",
            "&:hover": {
              backgroundColor: "#16a34a",
              boxShadow: "none",
            },
            "& .MuiButton-startIcon": {
              marginRight: "6px",
              "& svg": {
                fontSize: "16px",
              },
            },
          }}>
          EDIT
        </Button>
      )}
      <Tooltip title="Close">
        <IconButton
          onClick={handleClose}
          size="small"
          sx={{
            width: 40,
            height: 40,
            color: "#d32f2f",
            border: "1px solid rgba(211, 47, 47, 0.3)",
            "&:hover": {
              backgroundColor: "rgba(211, 47, 47, 0.04)",
              border: "1px solid #d32f2f",
            },
          }}>
          <CloseIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );

  const isReadOnly = currentMode === "view";
  const isCreate = currentMode === "create";
  const chargingOptions = allChargings.length > 0 ? allChargings : chargings;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <ApprovalFlowActions
        open={open}
        onClose={handleClose}
        currentMode={currentMode}
        onModeChange={handleModeChange}
        onSubmit={onSubmit}
        isLoading={isLoading}
        selectedEntry={selectedEntry}
        isCreate={isCreate}
        approverSequence={approverSequence}
        isApproversLoading={isApproversLoading}
        handleSubmit={handleSubmit}
        customActions={<EditCloseButtons />}>
        <Box sx={{ pt: 1, px: 2 }}></Box>
        {!isCreate && selectedEntry && <Box></Box>}

        <form onSubmit={handleSubmit(onSubmit)}>
          <Box sx={{ mb: 1 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={noChargingChecked}
                  onChange={(e) => setNoChargingChecked(e.target.checked)}
                  disabled={isReadOnly || isInUse}
                  sx={{
                    color: "rgb(33, 61, 112)",
                    "&.Mui-checked": {
                      color: "rgb(33, 61, 112)",
                    },
                  }}
                />
              }
              label={
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  No Charging Required
                </Typography>
              }
            />
          </Box>

          <ApprovalFlowFormFields
            control={control}
            errors={errors}
            isReadOnly={isReadOnly}
            chargingOptions={chargingOptions}
            filteredDepartments={filteredDepartments}
            filteredLocations={filteredLocations}
            filteredCompanies={filteredCompanies}
            filteredBusinessUnits={filteredBusinessUnits}
            filteredUnits={filteredUnits}
            filteredSubUnits={filteredSubUnits}
            users={receivers}
            forms={approvalForms}
            isRdfLoading={isRdfLoading}
            isAllChargingLoading={isAllChargingLoading}
            isUsersLoading={isReceiversLoading}
            isFormsLoading={isFormsLoading}
            handleChargingChange={handleChargingChange}
            isFieldDisabled={isFieldDisabled}
            isInUse={isInUse}
            noChargingChecked={noChargingChecked}
            setNoChargingChecked={setNoChargingChecked}
            fieldOrder={[
              "form_id",
              "rdf_charging",
              "department",
              "company",
              "business_unit",
              "unit",
              "sub_unit",
              "location",
              "receiver_user_id",
              "name",
              "description",
            ]}
          />

          <Box sx={{ mt: 2, width: "100%" }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Approver Sequence
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
                  error={!!errors.approver_user_id}
                  disabled={isReadOnly || isApproversLoading}>
                  <InputLabel id="approver-select-label">
                    Select Approver
                  </InputLabel>
                  <Select
                    labelId="approver-select-label"
                    value={selectedApprover}
                    label="Select Approver"
                    onChange={(e) => setSelectedApprover(e.target.value)}
                    disabled={
                      availableApprovers.length === 0 || isApproversLoading
                    }
                    sx={{
                      backgroundColor: isReadOnly ? "#f5f5f5" : "white",
                      height: "75px",
                      "& .MuiSelect-select": {
                        paddingTop: "14px",
                        paddingBottom: "14px",
                      },
                    }}>
                    {isApproversLoading ? (
                      <MenuItem disabled>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <CircularProgress size={20} sx={{ mr: 1 }} />
                          Loading approvers...
                        </Box>
                      </MenuItem>
                    ) : availableApprovers.length === 0 ? (
                      <MenuItem disabled>
                        <em style={{ color: "#999" }}>
                          No available approvers
                        </em>
                      </MenuItem>
                    ) : (
                      availableApprovers.map((approver) => (
                        <MenuItem key={approver.id} value={approver.id}>
                          <Box>
                            <Typography variant="body2" fontWeight={500}>
                              {approver.full_name ||
                                approver.name ||
                                "Unknown User"}
                            </Typography>
                            {approver.position && (
                              <Typography
                                variant="caption"
                                color="text.secondary">
                                {typeof approver.position === "string"
                                  ? approver.position
                                  : approver.position.position_name ||
                                    "No Position"}
                              </Typography>
                            )}
                          </Box>
                        </MenuItem>
                      ))
                    )}
                  </Select>
                  {errors.approver_user_id && (
                    <FormHelperText>
                      {errors.approver_user_id.message}
                    </FormHelperText>
                  )}
                </FormControl>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => handleAddApprover(selectedApprover)}
                  disabled={!selectedApprover || isApproversLoading}
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
              <ReactSortable
                list={[...approverSequence]}
                setList={handleDragEnd}
                disabled={isReadOnly}
                animation={200}
                delayOnTouchStart={true}
                delay={2}
                ghostClass="sortable-ghost"
                chosenClass="sortable-chosen"
                dragClass="sortable-drag"
                filter=".no-drag"
                style={{ minHeight: "200px", width: "100%" }}>
                {approverSequence.length === 0 ? (
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
                      No approvers added yet.{" "}
                      {!isReadOnly &&
                        "Select approvers from the dropdown above."}
                    </Typography>
                  </Paper>
                ) : (
                  approverSequence.map((approver) => (
                    <Paper
                      key={approver.id}
                      sx={{
                        p: 2,
                        mb: 1,
                        display: "flex",
                        alignItems: "center",
                        backgroundColor: "white",
                        border: "1px solid #e0e0e0",
                        cursor: isReadOnly ? "default" : "move",
                        width: "100%",
                        "&.sortable-chosen": {
                          backgroundColor: "#e3f2fd",
                        },
                        "&.sortable-drag": {
                          backgroundColor: "#bbdefb",
                        },
                        "&.sortable-ghost": {
                          backgroundColor: "#f5f5f5",
                          opacity: 0.5,
                        },
                      }}>
                      {!isReadOnly && (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            mr: 2,
                            color: "text.secondary",
                            cursor: "move",
                          }}>
                          <DragIcon />
                        </Box>
                      )}

                      <Chip
                        label={approver.order}
                        size="small"
                        sx={{
                          mr: 2,
                          backgroundColor: "rgb(33, 61, 112)",
                          color: "white",
                          fontWeight: 600,
                        }}
                      />
                      <Avatar sx={{ mr: 2, bgcolor: "rgb(33, 61, 112)" }}>
                        <PersonIcon />
                      </Avatar>

                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {approver.name}
                        </Typography>
                        {approver.position && (
                          <Typography variant="body2" color="text.secondary">
                            {approver.position}
                          </Typography>
                        )}
                        {approver.department && (
                          <Typography variant="body2" color="text.secondary">
                            {approver.department}
                          </Typography>
                        )}
                      </Box>

                      {!isReadOnly && (
                        <IconButton
                          onClick={() => handleRemoveApprover(approver.id)}
                          size="small"
                          className="no-drag"
                          sx={{
                            color: "error.main",
                          }}>
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </Paper>
                  ))
                )}
              </ReactSortable>
            </Box>
          </Box>
        </form>
      </ApprovalFlowActions>
    </LocalizationProvider>
  );
};

ApprovalFlowModal.displayName = "ApprovalFlowModal";

export default ApprovalFlowModal;
