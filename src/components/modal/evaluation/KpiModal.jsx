import React, { useEffect, useState } from "react";
import { useFormContext, Controller, useFieldArray } from "react-hook-form";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  IconButton,
  Box,
  Grid,
  TextField,
  CircularProgress,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  FormHelperText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  InputAdornment,
} from "@mui/material";
import {
  Close as CloseIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Description as DescriptionIcon,
  Remove as RemoveIcon,
} from "@mui/icons-material";
import EditOffIcon from "@mui/icons-material/EditOff";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useGetAllShowObjectivesQuery } from "../../../features/api/extras/objectivesApi";
import { kpiModalStyles } from "./KpiModalStyles";

const KpiModal = ({
  open = false,
  onClose,
  onSave,
  selectedEntry = null,
  isLoading = false,
  mode = "create",
  positionKpisData = null,
}) => {
  const {
    control,
    formState: { errors },
    reset,
    handleSubmit,
    watch,
    setValue,
  } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "kpis",
  });

  const [currentMode, setCurrentMode] = useState(mode);
  const [originalMode, setOriginalMode] = useState(mode);
  const [shouldFetchObjectives, setShouldFetchObjectives] = useState(false);

  const {
    data: objectivesData,
    isLoading: isLoadingObjectives,
    error: objectivesError,
  } = useGetAllShowObjectivesQuery(
    { status: "active" },
    {
      skip: !shouldFetchObjectives,
    }
  );

  const objectives = React.useMemo(() => {
    if (
      !objectivesData?.result?.data ||
      !Array.isArray(objectivesData.result.data)
    ) {
      return [];
    }

    return objectivesData.result.data.map((objective) => ({
      id: objective.id,
      name: objective.name,
      code: objective.code,
    }));
  }, [objectivesData]);

  const getObjectiveById = (id) => {
    return objectives.find((obj) => obj.id === parseInt(id));
  };

  const getObjectiveByName = (name) => {
    return objectives.find((obj) => obj.name === name);
  };

  const handleObjectiveFieldClick = () => {
    if (!shouldFetchObjectives && !isLoadingObjectives) {
      setShouldFetchObjectives(true);
    }
  };

  useEffect(() => {
    if (open) {
      setCurrentMode(mode);
      setOriginalMode(mode);

      if (mode === "create") {
        reset({
          kpis: [
            {
              objective: "",
              distribution: "",
              deliverable: "",
              target: "",
            },
          ],
        });
      } else if (selectedEntry && (mode === "view" || mode === "edit")) {
        let existingKpis = [];
        let kpiData = null;

        if (positionKpisData?.result?.kpis) {
          kpiData = positionKpisData.result.kpis;
        } else if (positionKpisData?.kpis) {
          kpiData = positionKpisData.kpis;
        } else if (selectedEntry.kpis) {
          kpiData = selectedEntry.kpis;
        }

        if (kpiData && Array.isArray(kpiData)) {
          setShouldFetchObjectives(true);

          existingKpis = kpiData.map((kpi) => {
            const objective = getObjectiveById(kpi.objective_id);
            return {
              objective: objective ? objective.name : "",
              distribution: kpi.distribution_percentage
                ? String(kpi.distribution_percentage)
                : "",
              deliverable: kpi.deliverable || "",
              target: kpi.target_percentage
                ? String(kpi.target_percentage)
                : "",
            };
          });
        }

        if (existingKpis.length === 0) {
          existingKpis = [
            {
              objective: "",
              distribution: "",
              deliverable: "",
              target: "",
            },
          ];
        }

        reset({
          kpis: existingKpis,
        });
      }
    } else {
      setShouldFetchObjectives(false);
    }
  }, [open, mode, selectedEntry, positionKpisData, reset]);

  useEffect(() => {
    if (
      objectives.length > 0 &&
      selectedEntry &&
      (mode === "view" || mode === "edit")
    ) {
      let kpiData = null;

      if (positionKpisData?.result?.kpis) {
        kpiData = positionKpisData.result.kpis;
      } else if (positionKpisData?.kpis) {
        kpiData = positionKpisData.kpis;
      } else if (selectedEntry.kpis) {
        kpiData = selectedEntry.kpis;
      }

      if (kpiData && Array.isArray(kpiData)) {
        const existingKpis = kpiData.map((kpi) => {
          const objective = getObjectiveById(kpi.objective_id);
          return {
            objective: objective ? objective.name : "",
            distribution: kpi.distribution_percentage
              ? String(kpi.distribution_percentage)
              : "",
            deliverable: kpi.deliverable || "",
            target: kpi.target_percentage ? String(kpi.target_percentage) : "",
          };
        });

        reset({
          kpis:
            existingKpis.length > 0
              ? existingKpis
              : [
                  {
                    objective: "",
                    distribution: "",
                    deliverable: "",
                    target: "",
                  },
                ],
        });
      }
    }
  }, [objectives, selectedEntry, positionKpisData, mode, reset]);

  const handleModeChange = (newMode) => {
    setCurrentMode(newMode);
  };

  const handleCancelEdit = () => {
    setCurrentMode(originalMode);
    if (selectedEntry) {
      let existingKpis = [];
      let kpiData = null;

      if (positionKpisData?.result?.kpis) {
        kpiData = positionKpisData.result.kpis;
      } else if (positionKpisData?.kpis) {
        kpiData = positionKpisData.kpis;
      } else if (selectedEntry.kpis) {
        kpiData = selectedEntry.kpis;
      }

      if (kpiData && Array.isArray(kpiData)) {
        existingKpis = kpiData.map((kpi) => {
          const objective = getObjectiveById(kpi.objective_id);
          return {
            objective: objective ? objective.name : "",
            distribution: kpi.distribution_percentage
              ? String(kpi.distribution_percentage)
              : "",
            deliverable: kpi.deliverable || "",
            target: kpi.target_percentage ? String(kpi.target_percentage) : "",
          };
        });
      }

      if (existingKpis.length === 0) {
        existingKpis = [
          {
            objective: "",
            distribution: "",
            deliverable: "",
            target: "",
          },
        ];
      }

      reset({
        kpis: existingKpis,
      });
    }
  };

  const addKpiLine = () => {
    if (totalDistribution < 99.9) {
      append({
        objective: "",
        distribution: "",
        deliverable: "",
        target: "",
      });
    }
  };

  const removeKpiLine = (index) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const onSubmit = (data) => {
    const transformedData = {
      kpis: data.kpis.map((kpi) => {
        const selectedObjective = getObjectiveByName(kpi.objective);
        return {
          objective_id: selectedObjective ? selectedObjective.id : null,
          distribution_percentage: parseFloat(kpi.distribution) || 0,
          deliverable: kpi.deliverable || "",
          target_percentage: parseFloat(kpi.target) || 0,
        };
      }),
    };

    if (onSave) {
      onSave(transformedData, currentMode);
    }
  };

  const handleClose = () => {
    reset();
    setCurrentMode(mode);
    setOriginalMode(mode);
    setShouldFetchObjectives(false);
    onClose();
  };

  const getModalTitle = () => {
    switch (currentMode) {
      case "create":
        return "CREATE KPI";
      case "view":
        return "VIEW KPI";
      case "edit":
        return "EDIT KPI";
      default:
        return "KPI Management";
    }
  };

  const isReadOnly = currentMode === "view";
  const isViewMode = currentMode === "view";
  const isEditMode = currentMode === "edit";

  const watchedKpis = watch("kpis") || [];
  const totalDistribution = watchedKpis.reduce((sum, kpi) => {
    const distribution = parseFloat(kpi?.distribution) || 0;
    return sum + distribution;
  }, 0);

  const isDistributionValid =
    totalDistribution <= 100.01 && totalDistribution >= 99.99;
  const shouldDisableAddButton = totalDistribution >= 99.9;

  const hasValidTargets = watchedKpis.every((kpi, index) => {
    const distribution = parseFloat(kpi?.distribution) || 0;
    const target = parseFloat(kpi?.target) || 0;
    if (distribution === 0) return true;
    return target <= distribution;
  });

  const canSubmit = isDistributionValid && hasValidTargets;

  const safeGetValue = (obj, key, fallback = "N/A") => {
    if (!obj || typeof obj !== "object") return fallback;
    const value = obj[key];

    if (value === null || value === undefined || value === "") return fallback;

    if (typeof value === "object" && value !== null) {
      if (value.name && typeof value.name === "string") {
        return value.name;
      }
      if (value.title && typeof value.title === "string") {
        return value.title;
      }
      if (value.code && typeof value.code === "string") {
        return value.code;
      }
      return fallback;
    }

    return String(value);
  };

  const getPositionName = () => {
    if (positionKpisData?.result?.position?.title) {
      return positionKpisData.result.position.title;
    }

    return safeGetValue(positionKpisData, "position_name") !== "N/A"
      ? safeGetValue(positionKpisData, "position_name")
      : safeGetValue(selectedEntry, "position_name") !== "N/A"
      ? safeGetValue(selectedEntry, "position_name")
      : safeGetValue(selectedEntry, "title") !== "N/A"
      ? safeGetValue(selectedEntry, "title")
      : safeGetValue(selectedEntry, "name", "N/A");
  };

  const getCharging = () => {
    if (positionKpisData?.result?.position?.charging) {
      return positionKpisData.result.position.charging;
    }

    return safeGetValue(positionKpisData, "charging") !== "N/A"
      ? safeGetValue(positionKpisData, "charging")
      : safeGetValue(selectedEntry, "charging", "N/A");
  };

  const getImmediateSuperior = () => {
    if (positionKpisData?.result?.position?.superior_name) {
      return positionKpisData.result.position.superior_name;
    }

    return safeGetValue(positionKpisData, "immediate_superior") !== "N/A"
      ? safeGetValue(positionKpisData, "immediate_superior")
      : safeGetValue(selectedEntry, "immediate_superior") !== "N/A"
      ? safeGetValue(selectedEntry, "immediate_superior")
      : safeGetValue(selectedEntry, "superior_name", "N/A");
  };

  const handleDistributionChange = (index, value) => {
    setValue(`kpis.${index}.distribution`, value);

    if (!value || parseFloat(value) === 0) {
      setValue(`kpis.${index}.target`, "");
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: kpiModalStyles.dialog,
        }}>
        <DialogTitle sx={kpiModalStyles.dialogTitle}>
          <Box sx={kpiModalStyles.titleBox}>
            <DescriptionIcon sx={kpiModalStyles.titleIcon} />
            <Typography
              variant="h6"
              component="div"
              sx={kpiModalStyles.titleText}>
              {getModalTitle()}
            </Typography>
            {isViewMode && (
              <Tooltip title="EDIT KPI" arrow placement="top">
                <IconButton
                  onClick={() => handleModeChange("edit")}
                  disabled={isLoading}
                  size="small"
                  sx={kpiModalStyles.editButton}>
                  <EditIcon
                    sx={
                      isLoading
                        ? kpiModalStyles.editIconDisabled
                        : kpiModalStyles.editIcon
                    }
                  />
                </IconButton>
              </Tooltip>
            )}
            {isEditMode && originalMode === "view" && (
              <Tooltip title="CANCEL EDIT">
                <IconButton
                  onClick={handleCancelEdit}
                  disabled={isLoading}
                  size="small"
                  sx={kpiModalStyles.cancelEditButton}>
                  <EditOffIcon sx={kpiModalStyles.cancelEditIcon} />
                </IconButton>
              </Tooltip>
            )}
          </Box>

          <Box sx={kpiModalStyles.closeButtonBox}>
            <IconButton onClick={handleClose} sx={kpiModalStyles.closeButton}>
              <CloseIcon sx={kpiModalStyles.closeIcon} />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={kpiModalStyles.dialogContent}>
          <Box sx={kpiModalStyles.infoBox}>
            <Grid container spacing={8}>
              <Grid item xs={12} md={4}>
                <Typography {...kpiModalStyles.infoSubtitle}>
                  Position Name
                </Typography>
                <Typography {...kpiModalStyles.infoText}>
                  {getPositionName()}
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography {...kpiModalStyles.infoSubtitle}>
                  Charging
                </Typography>
                <Typography {...kpiModalStyles.infoText}>
                  {getCharging()}
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography {...kpiModalStyles.infoSubtitle}>
                  Immediate Superior
                </Typography>
                <Typography {...kpiModalStyles.infoText}>
                  {getImmediateSuperior()}
                </Typography>
              </Grid>
            </Grid>
          </Box>

          <Box sx={kpiModalStyles.distributionBox}>
            <Typography {...kpiModalStyles.distributionText}>
              Total Distribution: {totalDistribution.toFixed(2)}%
            </Typography>
            <Box sx={kpiModalStyles.distributionStatus(isDistributionValid)}>
              {isDistributionValid
                ? "✓ Valid"
                : totalDistribution > 100.01
                ? "⚠ Must not be lower than 99.99% or higher than 100.01%"
                : "⚠ Must not be lower than 99.99% or higher than 100.01%"}
            </Box>
            {!hasValidTargets && (
              <Box sx={kpiModalStyles.distributionStatus(false)}>
                ⚠ Target cannot exceed distribution percentage
              </Box>
            )}
          </Box>

          <form onSubmit={handleSubmit(onSubmit)}>
            <TableContainer
              component={Paper}
              sx={kpiModalStyles.tableContainer}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={kpiModalStyles.tableHeader}>
                      Objective
                    </TableCell>
                    <TableCell sx={kpiModalStyles.tableHeaderDistribution}>
                      Distribution (%)
                    </TableCell>
                    <TableCell sx={kpiModalStyles.tableHeader}>
                      Deliverable / KPI
                    </TableCell>
                    <TableCell sx={kpiModalStyles.tableHeaderTarget}>
                      Target (%)
                    </TableCell>
                    {!isReadOnly && (
                      <TableCell sx={kpiModalStyles.tableHeaderActions}>
                        Actions
                      </TableCell>
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {fields.map((field, index) => {
                    const currentDistribution =
                      parseFloat(watchedKpis[index]?.distribution) || 0;
                    const isTargetDisabled =
                      isReadOnly || currentDistribution === 0;

                    return (
                      <TableRow key={field.id}>
                        <TableCell>
                          <Controller
                            name={`kpis.${index}.objective`}
                            control={control}
                            rules={{ required: "Objective is required" }}
                            render={({ field }) => (
                              <FormControl
                                fullWidth
                                size="small"
                                error={!!errors.kpis?.[index]?.objective}
                                disabled={isReadOnly}>
                                <Select
                                  {...field}
                                  displayEmpty
                                  onFocus={handleObjectiveFieldClick}
                                  onClick={handleObjectiveFieldClick}
                                  sx={kpiModalStyles.selectField(isReadOnly)}>
                                  <MenuItem value="">
                                    <em>
                                      {isLoadingObjectives
                                        ? "Loading objectives..."
                                        : objectives.length > 0
                                        ? "Select Objective"
                                        : "Click to load objectives"}
                                    </em>
                                  </MenuItem>
                                  {isLoadingObjectives ? (
                                    <MenuItem disabled>
                                      <CircularProgress
                                        size={16}
                                        sx={{ mr: 1 }}
                                      />
                                      Loading...
                                    </MenuItem>
                                  ) : objectivesError ? (
                                    <MenuItem disabled>
                                      <em>Error loading objectives</em>
                                    </MenuItem>
                                  ) : objectives.length > 0 ? (
                                    objectives.map((objective) => (
                                      <MenuItem
                                        key={objective.id}
                                        value={objective.name}>
                                        {objective.name}
                                      </MenuItem>
                                    ))
                                  ) : shouldFetchObjectives ? (
                                    <MenuItem disabled>
                                      <em>No objectives found</em>
                                    </MenuItem>
                                  ) : null}
                                </Select>
                                {errors.kpis?.[index]?.objective && (
                                  <FormHelperText>
                                    {String(
                                      errors.kpis[index].objective.message
                                    )}
                                  </FormHelperText>
                                )}
                              </FormControl>
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <Controller
                            name={`kpis.${index}.distribution`}
                            control={control}
                            rules={{
                              required: "Distribution is required",
                              pattern: {
                                value: /^\d*\.?\d+$/,
                                message: "Enter valid number",
                              },
                            }}
                            render={({
                              field: { onChange, value, ...rest },
                            }) => (
                              <TextField
                                {...rest}
                                value={value}
                                onChange={(e) => {
                                  onChange(e);
                                  handleDistributionChange(
                                    index,
                                    e.target.value
                                  );
                                }}
                                size="small"
                                fullWidth
                                type="number"
                                inputProps={{
                                  step: "0.01",
                                  min: "0",
                                  max: "100",
                                }}
                                onInput={(e) => {
                                  const value = e.target.value;
                                  if (value.includes(".")) {
                                    const decimalPart = value.split(".")[1];
                                    if (decimalPart && decimalPart.length > 2) {
                                      e.target.value =
                                        parseFloat(value).toFixed(2);
                                    }
                                  }
                                }}
                                InputProps={{
                                  endAdornment: (
                                    <InputAdornment position="end">
                                      %
                                    </InputAdornment>
                                  ),
                                }}
                                error={!!errors.kpis?.[index]?.distribution}
                                helperText={
                                  errors.kpis?.[index]?.distribution?.message
                                    ? String(
                                        errors.kpis[index].distribution.message
                                      )
                                    : ""
                                }
                                disabled={isReadOnly}
                                sx={kpiModalStyles.percentageField(isReadOnly)}
                              />
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <Controller
                            name={`kpis.${index}.deliverable`}
                            control={control}
                            rules={{ required: "Deliverable/KPI is required" }}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                size="small"
                                fullWidth
                                multiline
                                rows={2}
                                error={!!errors.kpis?.[index]?.deliverable}
                                helperText={
                                  errors.kpis?.[index]?.deliverable?.message
                                    ? String(
                                        errors.kpis[index].deliverable.message
                                      )
                                    : ""
                                }
                                disabled={isReadOnly}
                                sx={kpiModalStyles.textField(isReadOnly)}
                              />
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <Controller
                            name={`kpis.${index}.target`}
                            control={control}
                            rules={{
                              required: "Target is required",
                              pattern: {
                                value: /^\d*\.?\d+$/,
                                message: "Enter valid number",
                              },
                              validate: (value) => {
                                const targetValue = parseFloat(value);
                                if (
                                  targetValue > currentDistribution &&
                                  currentDistribution > 0
                                ) {
                                  return `Target cannot exceed distribution (${currentDistribution}%)`;
                                }
                                return true;
                              },
                            }}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                size="small"
                                fullWidth
                                type="number"
                                inputProps={{
                                  step: "0.1",
                                  min: "0",
                                  max: "100",
                                }}
                                InputProps={{
                                  endAdornment: (
                                    <InputAdornment position="end">
                                      %
                                    </InputAdornment>
                                  ),
                                }}
                                error={!!errors.kpis?.[index]?.target}
                                helperText={
                                  errors.kpis?.[index]?.target?.message
                                    ? String(errors.kpis[index].target.message)
                                    : ""
                                }
                                disabled={isTargetDisabled}
                                sx={kpiModalStyles.percentageField(
                                  isTargetDisabled
                                )}
                              />
                            )}
                          />
                        </TableCell>
                        {!isReadOnly && (
                          <TableCell>
                            <Tooltip title="Remove Line">
                              <IconButton
                                onClick={() => removeKpiLine(index)}
                                disabled={fields.length === 1}
                                size="small"
                                color="error">
                                <RemoveIcon />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            {!isReadOnly && (
              <Box sx={kpiModalStyles.addButtonBox}>
                <Button
                  onClick={addKpiLine}
                  startIcon={<AddIcon />}
                  variant="outlined"
                  disabled={shouldDisableAddButton}
                  sx={kpiModalStyles.addButton}>
                  Add KPI Line
                </Button>
              </Box>
            )}
          </form>
        </DialogContent>

        <DialogActions sx={kpiModalStyles.dialogActions}>
          {!isReadOnly && (
            <Button
              onClick={handleSubmit(onSubmit)}
              variant="contained"
              disabled={isLoading || !canSubmit}
              startIcon={
                isLoading ? (
                  <CircularProgress size={16} />
                ) : currentMode === "create" ? (
                  <AddIcon />
                ) : (
                  <EditIcon />
                )
              }
              sx={kpiModalStyles.saveButton}>
              {isLoading
                ? "Saving..."
                : currentMode === "create"
                ? "Create"
                : "Update"}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

KpiModal.displayName = "KpiModal";

export default KpiModal;
