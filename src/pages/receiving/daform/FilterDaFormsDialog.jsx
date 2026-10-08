import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  Dialog,
  DialogContent,
  Button,
  TextField,
  Autocomplete,
  CircularProgress,
} from "@mui/material";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import { useGetDaFilterOptionsQuery } from "../../../features/api/receiving/daFormReceivingApi";
import "./FilterDaFormsDialog.scss";

const EMPTY_VALUES = {
  department: "",
  unit: "",
  subUnit: "",
  chargingId: "",
  dateFrom: "",
  dateTo: "",
};

const schema = yup.object({
  department: yup.string().nullable(),
  unit: yup.string().nullable(),
  subUnit: yup.string().nullable(),
  chargingId: yup.string().nullable(),
  dateFrom: yup.string().nullable(),
  dateTo: yup
    .string()
    .nullable()
    .test(
      "date-range",
      "End date must not be earlier than start date",
      function (value) {
        const { dateFrom } = this.parent;
        if (!value || !dateFrom) return true;
        return new Date(value) >= new Date(dateFrom);
      },
    ),
});

const SearchSelect = ({
  label,
  options,
  value,
  onChange,
  disabled,
  helperText,
  loading,
  noOptionsText,
}) => (
  <Autocomplete
    fullWidth
    autoHighlight
    options={options}
    value={options.find((o) => o.value === value) ?? null}
    onChange={(event, option) => onChange(option ? option.value : "")}
    getOptionLabel={(option) => option.label}
    isOptionEqualToValue={(option, selected) => option.value === selected.value}
    disabled={disabled}
    loading={loading}
    noOptionsText={noOptionsText}
    renderInput={(params) => (
      <TextField
        {...params}
        label={label}
        helperText={helperText}
        className="filter-dialog__field"
        InputProps={{
          ...params.InputProps,
          endAdornment: (
            <>
              {loading ? <CircularProgress size={16} /> : null}
              {params.InputProps.endAdornment}
            </>
          ),
        }}
      />
    )}
  />
);

const FilterDaFormsDialog = ({ open, onClose, onApply, initialValues }) => {
  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: { ...EMPTY_VALUES, ...initialValues },
    resolver: yupResolver(schema),
    mode: "onChange",
  });

  const values = watch();
  const { department, unit, subUnit } = values;

  const { data, isFetching } = useGetDaFilterOptionsQuery(
    { department, unit, subUnit },
    { skip: !open, refetchOnMountOrArgChange: true },
  );

  const departments = data?.departments ?? [];
  const units = data?.units ?? [];
  const subUnits = data?.subUnits ?? [];
  const chargings = data?.chargings ?? [];

  useEffect(() => {
    if (open) {
      reset({ ...EMPTY_VALUES, ...initialValues });
    }
  }, [open, initialValues, reset]);

  const hasValues = Object.values(values).some((v) => v !== "" && v != null);

  const handleDepartmentChange = (onChange) => (value) => {
    onChange(value);
    setValue("unit", "");
    setValue("subUnit", "");
    setValue("chargingId", "");
  };

  const handleUnitChange = (onChange) => (value) => {
    onChange(value);
    setValue("subUnit", "");
    setValue("chargingId", "");
  };

  const handleSubUnitChange = (onChange) => (value) => {
    onChange(value);
    setValue("chargingId", "");
  };

  const handleChargingChange = (onChange) => (value) => {
    onChange(value);
    const selected = chargings.find((c) => c.value === value);
    if (selected) {
      setValue("department", selected.departmentCode || "");
      setValue("unit", selected.unitCode || "");
      setValue("subUnit", selected.subUnitCode || "");
    }
  };

  const handleClearAll = () => {
    reset(EMPTY_VALUES);
  };

  const handleCancel = () => {
    reset({ ...EMPTY_VALUES, ...initialValues });
    onClose();
  };

  const submit = (formData) => {
    onApply(formData);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      fullWidth
      maxWidth="xs"
      classes={{ paper: "filter-dialog" }}>
      <form onSubmit={handleSubmit(submit)} noValidate>
        <div className="filter-dialog__header">
          <div className="filter-dialog__title">
            <CalendarMonthOutlinedIcon className="filter-dialog__title-icon" />
            <span>Filter DA Forms</span>
          </div>
          <Button
            type="button"
            size="small"
            variant="outlined"
            className="filter-dialog__clear"
            onClick={handleClearAll}
            disabled={!hasValues}>
            Clear all
          </Button>
        </div>

        <DialogContent className="filter-dialog__body">
          <Controller
            name="chargingId"
            control={control}
            render={({ field }) => (
              <SearchSelect
                label="Charging"
                options={chargings}
                value={field.value}
                onChange={handleChargingChange(field.onChange)}
                loading={isFetching}
                noOptionsText="No chargings found"
                helperText={`${chargings.length} ${chargings.length === 1 ? "charging" : "chargings"}`}
              />
            )}
          />

          <Controller
            name="department"
            control={control}
            render={({ field }) => (
              <SearchSelect
                label="Department"
                options={departments}
                value={field.value}
                onChange={handleDepartmentChange(field.onChange)}
                noOptionsText="No departments found"
              />
            )}
          />

          <Controller
            name="unit"
            control={control}
            render={({ field }) => (
              <SearchSelect
                label="Unit"
                options={units}
                value={field.value}
                onChange={handleUnitChange(field.onChange)}
                disabled={!department}
                helperText={!department ? "Pick a department first" : ""}
                noOptionsText="No units found"
              />
            )}
          />

          <Controller
            name="subUnit"
            control={control}
            render={({ field }) => (
              <SearchSelect
                label="Sub-unit"
                options={subUnits}
                value={field.value}
                onChange={handleSubUnitChange(field.onChange)}
                disabled={!unit}
                helperText={!unit ? "Pick a unit first" : ""}
                noOptionsText="No sub-units found"
              />
            )}
          />

          <Controller
            name="dateFrom"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                type="date"
                fullWidth
                label="Date submitted from"
                className="filter-dialog__field"
                InputLabelProps={{ shrink: true }}
                inputProps={{ max: values.dateTo || undefined }}
                error={!!errors.dateFrom}
                helperText={errors.dateFrom?.message}
              />
            )}
          />

          <Controller
            name="dateTo"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                type="date"
                fullWidth
                label="Date submitted to"
                className="filter-dialog__field"
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: values.dateFrom || undefined }}
                error={!!errors.dateTo}
                helperText={errors.dateTo?.message}
              />
            )}
          />
        </DialogContent>

        <div className="filter-dialog__footer">
          <Button
            type="button"
            variant="outlined"
            className="filter-dialog__btn filter-dialog__btn--cancel"
            onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            className="filter-dialog__btn filter-dialog__btn--apply">
            Apply filters
          </Button>
        </div>
      </form>
    </Dialog>
  );
};

SearchSelect.propTypes = {
  label: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({ value: PropTypes.string, label: PropTypes.string }),
  ),
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  helperText: PropTypes.string,
  loading: PropTypes.bool,
  noOptionsText: PropTypes.string,
};

SearchSelect.defaultProps = {
  options: [],
  value: "",
  disabled: false,
  helperText: "",
  loading: false,
  noOptionsText: "No options",
};

FilterDaFormsDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onApply: PropTypes.func.isRequired,
  initialValues: PropTypes.shape({
    department: PropTypes.string,
    unit: PropTypes.string,
    subUnit: PropTypes.string,
    chargingId: PropTypes.string,
    dateFrom: PropTypes.string,
    dateTo: PropTypes.string,
  }),
};

FilterDaFormsDialog.defaultProps = {
  initialValues: EMPTY_VALUES,
};

export default FilterDaFormsDialog;
