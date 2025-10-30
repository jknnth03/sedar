import * as React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Checkbox,
  Divider,
  IconButton,
  TextField,
  Autocomplete,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import FilterListIcon from "@mui/icons-material/FilterList";
import {
  useGetAllEmploymentTypeFiltersQuery,
  useGetAllPositionFiltersQuery,
  useGetAllTeamFiltersQuery,
  useGetAllDepartmentFiltersQuery,
  useGetAllMrfFiltersQuery,
} from "../../features/api/employee/filterApi";

const FilterDialog = ({ open, onClose, filters, onApplyFilters, onExport }) => {
  const [localFilters, setLocalFilters] = React.useState(filters);
  const [visibleFilters, setVisibleFilters] = React.useState({
    name: false,
    team: false,
    idNumber: false,
    dateHiredFrom: false,
    dateHiredTo: false,
    status: false,
    type: false,
    position: false,
    department: false,
    mrf: false,
  });

  const [shouldFetchTeams, setShouldFetchTeams] = React.useState(false);
  const [shouldFetchTypes, setShouldFetchTypes] = React.useState(false);
  const [shouldFetchPositions, setShouldFetchPositions] = React.useState(false);
  const [shouldFetchDepartments, setShouldFetchDepartments] =
    React.useState(false);
  const [shouldFetchMrfs, setShouldFetchMrfs] = React.useState(false);

  const { data: teamsData, isFetching: isFetchingTeams } =
    useGetAllTeamFiltersQuery(undefined, { skip: !shouldFetchTeams });
  const { data: typesData, isFetching: isFetchingTypes } =
    useGetAllEmploymentTypeFiltersQuery(undefined, { skip: !shouldFetchTypes });
  const { data: positionsData, isFetching: isFetchingPositions } =
    useGetAllPositionFiltersQuery(undefined, { skip: !shouldFetchPositions });
  const { data: departmentsData, isFetching: isFetchingDepartments } =
    useGetAllDepartmentFiltersQuery(undefined, {
      skip: !shouldFetchDepartments,
    });
  const { data: mrfsData, isFetching: isFetchingMrfs } =
    useGetAllMrfFiltersQuery(undefined, { skip: !shouldFetchMrfs });

  const normalizeApiData = (data) => {
    if (!data) return [];
    return Array.isArray(data)
      ? data
      : data.result?.data ||
          data.result ||
          data.data ||
          data.items ||
          data.results ||
          [];
  };

  const teams = normalizeApiData(teamsData);
  const positions = normalizeApiData(positionsData);
  const employmentTypes = normalizeApiData(typesData);
  const departments = normalizeApiData(departmentsData);
  const mrfs = normalizeApiData(mrfsData);

  React.useEffect(() => {
    setLocalFilters(filters);
  }, [filters, open]);

  React.useEffect(() => {
    const activeCount = Object.values(visibleFilters).filter((v) => v).length;
    if (activeCount === 0) {
      setLocalFilters({
        name: null,
        team: null,
        idNumber: null,
        dateHiredFrom: null,
        dateHiredTo: null,
        status: "ACTIVE",
        type: null,
        position: null,
        department: null,
        mrf: null,
      });
    }
  }, [visibleFilters]);

  const handleFilterChange = (filterType, value) => {
    setLocalFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  const handleCheckboxChange = (filterType) => {
    setVisibleFilters((prev) => ({
      ...prev,
      [filterType]: !prev[filterType],
    }));
  };

  const handleSelectAllChange = () => {
    const allSelected = Object.values(visibleFilters).every((v) => v);
    const newState = !allSelected;
    setVisibleFilters({
      name: newState,
      team: newState,
      idNumber: newState,
      dateHiredFrom: newState,
      dateHiredTo: newState,
      status: newState,
      type: newState,
      position: newState,
      department: newState,
      mrf: newState,
    });
  };

  const isAllSelected = React.useMemo(() => {
    return Object.values(visibleFilters).every((v) => v);
  }, [visibleFilters]);

  const isSomeSelected = React.useMemo(() => {
    const values = Object.values(visibleFilters);
    return values.some((v) => v) && !values.every((v) => v);
  }, [visibleFilters]);

  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters = {
      name: null,
      team: null,
      idNumber: null,
      dateHiredFrom: null,
      dateHiredTo: null,
      status: "ACTIVE",
      type: null,
      position: null,
      department: null,
      mrf: null,
    };
    setLocalFilters(resetFilters);
    setVisibleFilters({
      name: false,
      team: false,
      idNumber: false,
      dateHiredFrom: false,
      dateHiredTo: false,
      status: false,
      type: false,
      position: false,
      department: false,
      mrf: false,
    });
  };

  const activeFilterCount = React.useMemo(() => {
    return Object.values(visibleFilters).filter((isVisible) => isVisible)
      .length;
  }, [visibleFilters]);

  const statuses = [
    { id: "ACTIVE", name: "Active" },
    { id: "INACTIVE", name: "Inactive" },
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
        },
      }}>
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 2,
        }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <FilterListIcon sx={{ color: "rgb(33, 61, 112)", fontSize: 28 }} />
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography
              variant="h6"
              sx={{ fontWeight: 600, color: "rgb(33, 61, 112)", m: 0 }}>
              Filters
            </Typography>
            {activeFilterCount > 0 && (
              <Typography
                variant="caption"
                sx={{ color: "#666", whiteSpace: "nowrap" }}>
                ({activeFilterCount} active)
              </Typography>
            )}
          </Box>
        </Box>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color: "rgb(33, 61, 112)",
            "&:hover": {
              backgroundColor: "rgba(33, 61, 112, 0.08)",
            },
          }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3, pb: 2 }}>
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
            <Checkbox
              checked={isAllSelected}
              indeterminate={isSomeSelected}
              onChange={handleSelectAllChange}
              sx={{
                color: "rgb(33, 61, 112)",
                "&.Mui-checked": {
                  color: "rgb(33, 61, 112)",
                },
                "&.MuiCheckbox-indeterminate": {
                  color: "rgb(33, 61, 112)",
                },
              }}
            />
            <Typography
              sx={{
                marginTop: 0,
                fontWeight: 600,
                color: "rgb(33, 61, 112)",
                fontSize: "14px",
              }}>
              Select All Filters
            </Typography>
          </Box>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 0.5,
            }}>
            {[
              { key: "name", label: "Name" },
              { key: "team", label: "Team" },
              { key: "idNumber", label: "ID Number" },
              { key: "dateHiredFrom", label: "Date Hired From" },
              { key: "dateHiredTo", label: "Date Hired To" },
              { key: "status", label: "Status" },
              { key: "type", label: "Type" },
              { key: "position", label: "Position" },
              { key: "department", label: "Department" },
              { key: "mrf", label: "MRF" },
            ].map((filter) => (
              <Box
                key={filter.key}
                sx={{ display: "flex", alignItems: "center" }}>
                <Checkbox
                  checked={visibleFilters[filter.key] || false}
                  onChange={() => handleCheckboxChange(filter.key)}
                  sx={{
                    color: "rgb(33, 61, 112)",
                    "&.Mui-checked": {
                      color: "rgb(33, 61, 112)",
                    },
                  }}
                />
                <Typography sx={{ fontSize: "14px" }}>
                  {filter.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
          {visibleFilters.name && (
            <TextField
              label="Filter by Name"
              placeholder="Enter Employee Name"
              value={localFilters.name || ""}
              onChange={(e) => handleFilterChange("name", e.target.value)}
              size="small"
              fullWidth
              variant="outlined"
              sx={{
                gridColumn: "1 / -1",
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { border: "none" },
                  "&:hover fieldset": { border: "none" },
                  "&.Mui-focused fieldset": {
                    border: "1px solid rgb(33, 61, 112)",
                  },
                },
              }}
            />
          )}

          {visibleFilters.team && (
            <Autocomplete
              options={teams}
              getOptionLabel={(option) => option?.name || ""}
              value={teams.find((t) => t.name === localFilters.team) || null}
              onChange={(e, value) =>
                handleFilterChange("team", value?.name || null)
              }
              onOpen={() => setShouldFetchTeams(true)}
              isOptionEqualToValue={(option, value) =>
                option?.name === value?.name
              }
              loading={isFetchingTeams}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Filter by Team"
                  size="small"
                  variant="outlined"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {isFetchingTeams ? (
                          <CircularProgress color="inherit" size={20} />
                        ) : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": { border: "none" },
                      "&:hover fieldset": { border: "none" },
                      "&.Mui-focused fieldset": {
                        border: "1px solid rgb(33, 61, 112)",
                      },
                    },
                  }}
                />
              )}
            />
          )}

          {visibleFilters.idNumber && (
            <TextField
              label="Filter by ID Number"
              placeholder="Enter ID Number"
              value={localFilters.idNumber || ""}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "" || /^\d+$/.test(value)) {
                  handleFilterChange("idNumber", value);
                }
              }}
              size="small"
              fullWidth
              variant="outlined"
              inputProps={{ inputMode: "numeric" }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { border: "none" },
                  "&:hover fieldset": { border: "none" },
                  "&.Mui-focused fieldset": {
                    border: "1px solid rgb(33, 61, 112)",
                  },
                },
              }}
            />
          )}

          {visibleFilters.dateHiredFrom && (
            <TextField
              label="Date Hired From"
              type="date"
              value={localFilters.dateHiredFrom || ""}
              onChange={(e) =>
                handleFilterChange("dateHiredFrom", e.target.value)
              }
              size="small"
              fullWidth
              InputLabelProps={{ shrink: true }}
              variant="outlined"
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { border: "none" },
                  "&:hover fieldset": { border: "none" },
                  "&.Mui-focused fieldset": {
                    border: "1px solid rgb(33, 61, 112)",
                  },
                },
              }}
            />
          )}

          {visibleFilters.dateHiredTo && (
            <TextField
              label="Date Hired To"
              type="date"
              value={localFilters.dateHiredTo || ""}
              onChange={(e) =>
                handleFilterChange("dateHiredTo", e.target.value)
              }
              size="small"
              fullWidth
              InputLabelProps={{ shrink: true }}
              variant="outlined"
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { border: "none" },
                  "&:hover fieldset": { border: "none" },
                  "&.Mui-focused fieldset": {
                    border: "1px solid rgb(33, 61, 112)",
                  },
                },
              }}
            />
          )}

          {visibleFilters.status && (
            <Autocomplete
              options={statuses}
              getOptionLabel={(option) => option?.name || ""}
              value={statuses.find((s) => s.id === localFilters.status) || null}
              onChange={(e, value) =>
                handleFilterChange("status", value?.id || "ACTIVE")
              }
              isOptionEqualToValue={(option, value) => option?.id === value?.id}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Filter by Status"
                  size="small"
                  variant="outlined"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": { border: "none" },
                      "&:hover fieldset": { border: "none" },
                      "&.Mui-focused fieldset": {
                        border: "1px solid rgb(33, 61, 112)",
                      },
                    },
                  }}
                />
              )}
            />
          )}

          {visibleFilters.type && (
            <Autocomplete
              options={employmentTypes}
              getOptionLabel={(option) => option?.name || ""}
              value={
                employmentTypes.find((t) => t.name === localFilters.type) ||
                null
              }
              onChange={(e, value) =>
                handleFilterChange("type", value?.name || null)
              }
              onOpen={() => setShouldFetchTypes(true)}
              isOptionEqualToValue={(option, value) =>
                option?.name === value?.name
              }
              loading={isFetchingTypes}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Filter by Type"
                  size="small"
                  variant="outlined"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {isFetchingTypes ? (
                          <CircularProgress color="inherit" size={20} />
                        ) : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": { border: "none" },
                      "&:hover fieldset": { border: "none" },
                      "&.Mui-focused fieldset": {
                        border: "1px solid rgb(33, 61, 112)",
                      },
                    },
                  }}
                />
              )}
            />
          )}

          {visibleFilters.position && (
            <Autocomplete
              options={positions}
              getOptionLabel={(option) =>
                option?.title?.name || option?.name || ""
              }
              value={
                positions.find(
                  (p) => (p?.title?.name || p?.name) === localFilters.position
                ) || null
              }
              onChange={(e, value) =>
                handleFilterChange(
                  "position",
                  value?.title?.name || value?.name || null
                )
              }
              onOpen={() => setShouldFetchPositions(true)}
              isOptionEqualToValue={(option, value) =>
                (option?.title?.name || option?.name) ===
                (value?.title?.name || value?.name)
              }
              loading={isFetchingPositions}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Filter by Position"
                  size="small"
                  variant="outlined"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {isFetchingPositions ? (
                          <CircularProgress color="inherit" size={20} />
                        ) : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": { border: "none" },
                      "&:hover fieldset": { border: "none" },
                      "&.Mui-focused fieldset": {
                        border: "1px solid rgb(33, 61, 112)",
                      },
                    },
                  }}
                />
              )}
            />
          )}

          {visibleFilters.department && (
            <Autocomplete
              options={departments}
              getOptionLabel={(option) => option?.name || ""}
              value={
                departments.find((d) => d.name === localFilters.department) ||
                null
              }
              onChange={(e, value) =>
                handleFilterChange("department", value?.name || null)
              }
              onOpen={() => setShouldFetchDepartments(true)}
              isOptionEqualToValue={(option, value) =>
                option?.name === value?.name
              }
              loading={isFetchingDepartments}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Filter by Department"
                  size="small"
                  variant="outlined"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {isFetchingDepartments ? (
                          <CircularProgress color="inherit" size={20} />
                        ) : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": { border: "none" },
                      "&:hover fieldset": { border: "none" },
                      "&.Mui-focused fieldset": {
                        border: "1px solid rgb(33, 61, 112)",
                      },
                    },
                  }}
                />
              )}
            />
          )}

          {visibleFilters.mrf && (
            <Autocomplete
              options={mrfs}
              getOptionLabel={(option) => option?.name || option?.code || ""}
              value={
                mrfs.find((m) => (m?.name || m?.code) === localFilters.mrf) ||
                null
              }
              onChange={(e, value) =>
                handleFilterChange("mrf", value?.name || value?.code || null)
              }
              onOpen={() => setShouldFetchMrfs(true)}
              isOptionEqualToValue={(option, value) =>
                (option?.name || option?.code) === (value?.name || value?.code)
              }
              loading={isFetchingMrfs}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Filter by MRF"
                  size="small"
                  variant="outlined"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {isFetchingMrfs ? (
                          <CircularProgress color="inherit" size={20} />
                        ) : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": { border: "none" },
                      "&:hover fieldset": { border: "none" },
                      "&.Mui-focused fieldset": {
                        border: "1px solid rgb(33, 61, 112)",
                      },
                    },
                  }}
                />
              )}
            />
          )}
        </Box>
      </DialogContent>

      <DialogActions
        sx={{ px: 3, py: 2, gap: 1, justifyContent: "space-between" }}>
        <Button
          onClick={onExport}
          variant="contained"
          sx={{
            textTransform: "none",
            fontWeight: 400,
            backgroundColor: "#FF4500",
            color: "white",
            minWidth: "120px",
            "&:hover": {
              backgroundColor: "#E03E00",
            },
          }}>
          Export
        </Button>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            onClick={handleReset}
            disabled={activeFilterCount === 0}
            sx={{
              color: "#666",
              textTransform: "none",
              fontWeight: 400,
              border: "1px solid #ccc",
              "&:hover": {
                backgroundColor: "rgba(0,0,0,0.04)",
                borderColor: "#999",
              },
              "&.Mui-disabled": {
                borderColor: "#e0e0e0",
              },
            }}>
            Reset
          </Button>
          <Button
            onClick={handleApply}
            variant="contained"
            sx={{
              textTransform: "none",
              fontWeight: 400,
              backgroundColor: "rgb(33, 61, 112)",
              "&:hover": {
                backgroundColor: "rgb(25, 45, 84)",
              },
            }}>
            Apply Filters
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default FilterDialog;
