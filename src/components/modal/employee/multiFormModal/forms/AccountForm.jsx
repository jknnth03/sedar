import React, { useEffect, useState, useMemo } from "react";
import { useFormContext, Controller } from "react-hook-form";
import {
  Box,
  Alert,
  TextField,
  FormControl,
  FormHelperText,
  Grid,
  CircularProgress,
  Autocomplete,
} from "@mui/material";
import { useLazyGetAllShowBanksQuery } from "../../../../../features/api/extras/banksApi";
import "./General.scss";

const AccountForm = ({
  selectedAccount,
  isLoading = false,
  mode = "create",
}) => {
  const {
    control,
    formState: { errors },
    watch,
  } = useFormContext();

  const watchedValues = watch();

  const [banksLoaded, setBanksLoaded] = useState(false);

  const [
    triggerBanks,
    { data: banksData, isLoading: banksLoading, error: banksError },
  ] = useLazyGetAllShowBanksQuery();

  // Add isReadOnly state like in EmploymentTypesForm
  const isReadOnly = mode === "view";

  useEffect(() => {
    if (mode === "edit") {
      const fetchParams = { page: 1, per_page: 1000, status: "active" };
      triggerBanks(fetchParams);
      setBanksLoaded(true);
    }
  }, [mode, triggerBanks]);

  const handleDropdownFocus = (dropdownName) => {
    if (banksLoaded) return;

    const fetchParams = { page: 1, per_page: 1000, status: "active" };

    if (dropdownName === "banks") {
      triggerBanks(fetchParams);
      setBanksLoaded(true);
    }
  };

  useEffect(() => {
    if (mode === "create" && !banksLoaded) {
      const fetchParams = { page: 1, per_page: 1000, status: "active" };
      triggerBanks(fetchParams);
      setBanksLoaded(true);
    }
  }, [mode, triggerBanks, banksLoaded]);

  const banks = useMemo(() => {
    if (!banksData) return [];
    return Array.isArray(banksData)
      ? banksData
      : banksData.result ||
          banksData.data ||
          banksData.banks ||
          banksData.items ||
          banksData.results ||
          [];
  }, [banksData]);

  const formatSSS = (value) => {
    if (!value) return "";
    const digits = value.replace(/\D/g, "");
    const limited = digits.slice(0, 10);

    if (limited.length <= 2) {
      return limited;
    } else if (limited.length <= 9) {
      return `${limited.slice(0, 2)}-${limited.slice(2)}`;
    } else {
      return `${limited.slice(0, 2)}-${limited.slice(2, 9)}-${limited.slice(
        9
      )}`;
    }
  };

  const formatPagIbig = (value) => {
    if (!value) return "";
    const digits = value.replace(/\D/g, "");
    const limited = digits.slice(0, 12);

    if (limited.length <= 4) {
      return limited;
    } else if (limited.length <= 8) {
      return `${limited.slice(0, 4)}-${limited.slice(4)}`;
    } else {
      return `${limited.slice(0, 4)}-${limited.slice(4, 8)}-${limited.slice(
        8
      )}`;
    }
  };

  const formatPhilHealth = (value) => {
    if (!value) return "";
    const digits = value.replace(/\D/g, "");
    const limited = digits.slice(0, 12);

    if (limited.length <= 2) {
      return limited;
    } else if (limited.length <= 11) {
      return `${limited.slice(0, 2)}-${limited.slice(2)}`;
    } else {
      return `${limited.slice(0, 2)}-${limited.slice(2, 11)}-${limited.slice(
        11
      )}`;
    }
  };

  const formatTIN = (value) => {
    if (!value) return "";
    const digits = value.replace(/\D/g, "");
    const limited = digits.slice(0, 9);

    if (limited.length <= 3) {
      return limited;
    } else if (limited.length <= 6) {
      return `${limited.slice(0, 3)}-${limited.slice(3)}`;
    } else {
      return `${limited.slice(0, 3)}-${limited.slice(3, 6)}-${limited.slice(
        6
      )}`;
    }
  };

  const formatBankAccountNumber = (value) => {
    if (!value) return "";
    return value.replace(/\D/g, "");
  };

  return (
    <Box
      className="account-form"
      sx={{ width: "100%", maxWidth: "1200px", p: 2 }}>
      {banksError && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Failed to load banks from server.
        </Alert>
      )}

      <Grid container spacing={2} sx={{ width: "100%" }}>
        <Grid item xs={12} sm={4} sx={{ minWidth: "350px", maxWidth: "350px" }}>
          <Controller
            name="sss_number"
            control={control}
            render={({ field: { onChange, value, ...field } }) => (
              <TextField
                {...field}
                value={value || ""}
                onChange={(e) => {
                  if (!isReadOnly) {
                    const formattedValue = formatSSS(e.target.value);
                    onChange(formattedValue);
                  }
                }}
                label={
                  <>
                    SSS Number <span style={{ color: "red" }}>*</span>
                  </>
                }
                variant="outlined"
                fullWidth
                disabled={isLoading || isReadOnly}
                error={!!errors.sss_number}
                helperText={
                  errors.sss_number?.message || "Format: 10-1234567-8"
                }
                placeholder="Format: 10-1234567-8"
                inputProps={{
                  maxLength: 12,
                  readOnly: isReadOnly,
                }}
                className="general-form__text-field"
                sx={{
                  width: "100%",
                  "& .MuiOutlinedInput-root": { borderRadius: 2 },
                }}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={4} sx={{ minWidth: "350px", maxWidth: "350px" }}>
          <Controller
            name="pag_ibig_number"
            control={control}
            render={({ field: { onChange, value, ...field } }) => (
              <TextField
                {...field}
                value={value || ""}
                onChange={(e) => {
                  if (!isReadOnly) {
                    const formattedValue = formatPagIbig(e.target.value);
                    onChange(formattedValue);
                  }
                }}
                label={
                  <>
                    PAG-IBIG Number <span style={{ color: "red" }}>*</span>
                  </>
                }
                variant="outlined"
                fullWidth
                disabled={isLoading || isReadOnly}
                error={!!errors.pag_ibig_number}
                helperText={
                  errors.pag_ibig_number?.message || "Format: 1234-5678-9012"
                }
                placeholder="Format: 1234-5678-9012"
                inputProps={{
                  maxLength: 14,
                  readOnly: isReadOnly,
                }}
                className="general-form__text-field"
                sx={{
                  width: "100%",
                  "& .MuiOutlinedInput-root": { borderRadius: 2 },
                }}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={4} sx={{ minWidth: "350px", maxWidth: "350px" }}>
          <Controller
            name="philhealth_number"
            control={control}
            render={({ field: { onChange, value, ...field } }) => (
              <TextField
                {...field}
                value={value || ""}
                onChange={(e) => {
                  if (!isReadOnly) {
                    const formattedValue = formatPhilHealth(e.target.value);
                    onChange(formattedValue);
                  }
                }}
                label={
                  <>
                    PhilHealth Number <span style={{ color: "red" }}>*</span>
                  </>
                }
                variant="outlined"
                fullWidth
                disabled={isLoading || isReadOnly}
                error={!!errors.philhealth_number}
                helperText={
                  errors.philhealth_number?.message || "Format: 12-345678901-2"
                }
                placeholder="Format: 12-345678901-2"
                inputProps={{
                  maxLength: 14,
                  readOnly: isReadOnly,
                }}
                className="general-form__text-field"
                sx={{
                  width: "100%",
                  "& .MuiOutlinedInput-root": { borderRadius: 2 },
                }}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={4} sx={{ minWidth: "350px", maxWidth: "350px" }}>
          <Controller
            name="tin_number"
            control={control}
            render={({ field: { onChange, value, ...field } }) => (
              <TextField
                {...field}
                value={value || ""}
                onChange={(e) => {
                  if (!isReadOnly) {
                    const formattedValue = formatTIN(e.target.value);
                    onChange(formattedValue);
                  }
                }}
                label={
                  <>
                    TIN Number <span style={{ color: "red" }}>*</span>
                  </>
                }
                variant="outlined"
                fullWidth
                disabled={isLoading || isReadOnly}
                error={!!errors.tin_number}
                helperText={errors.tin_number?.message || "Format: 123-456-789"}
                placeholder="Format: 123-456-789"
                inputProps={{
                  maxLength: 11,
                  readOnly: isReadOnly,
                }}
                className="general-form__text-field"
                sx={{
                  width: "100%",
                  "& .MuiOutlinedInput-root": { borderRadius: 2 },
                }}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={4} sx={{ minWidth: "350px", maxWidth: "350px" }}>
          <Controller
            name="bank_id"
            control={control}
            render={({ field: { onChange, value } }) => (
              <FormControl
                fullWidth
                variant="outlined"
                error={!!errors.bank_id}
                disabled={isLoading || banksLoading || isReadOnly}
                sx={{
                  width: "100%",
                  "& .MuiOutlinedInput-root": { borderRadius: 2 },
                  "& .MuiFormHelperText-root": {
                    marginTop: "4px",
                  },
                }}>
                <Autocomplete
                  onChange={(event, item) => {
                    if (!isReadOnly) {
                      const bankValue = item?.id || item || null;
                      onChange(bankValue);
                    }
                  }}
                  value={banks.find((bank) => bank.id === value) || null}
                  options={banks ?? []}
                  loading={banksLoading}
                  getOptionLabel={(item) =>
                    item?.name ||
                    item?.bank_name ||
                    item?.title ||
                    item?.label ||
                    ""
                  }
                  isOptionEqualToValue={(option, value) => {
                    if (!option || !value) return false;
                    return option.id === value.id;
                  }}
                  onOpen={() => {
                    if (!isReadOnly) {
                      handleDropdownFocus("banks");
                    }
                  }}
                  readOnly={isReadOnly}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={<>Bank</>}
                      error={!!errors.bank_id}
                      helperText={errors.bank_id?.message}
                      InputProps={{
                        ...params.InputProps,
                        readOnly: isReadOnly,
                      }}
                      sx={{
                        "& .MuiInputLabel-root": {
                          color: "rgb(33, 61, 112)",
                          "&.Mui-focused": { color: "rgb(33, 61, 112)" },
                        },
                        "& .MuiFormLabel-root": {
                          color: "rgb(33, 61, 112)",
                          "&.Mui-focused": { color: "rgb(33, 61, 112)" },
                        },
                      }}
                    />
                  )}
                />
                {errors.bank_id && (
                  <FormHelperText>{errors.bank_id.message}</FormHelperText>
                )}
              </FormControl>
            )}
          />
        </Grid>

        <Grid item xs={12} sm={4} sx={{ minWidth: "350px", maxWidth: "350px" }}>
          <Controller
            name="back_account_number"
            control={control}
            render={({ field: { onChange, value, ...field } }) => (
              <TextField
                {...field}
                value={value || ""}
                onChange={(e) => {
                  if (!isReadOnly) {
                    const formattedValue = formatBankAccountNumber(
                      e.target.value
                    );
                    onChange(formattedValue);
                  }
                }}
                label="Bank Account Number"
                variant="outlined"
                fullWidth
                disabled={isLoading || isReadOnly}
                error={!!errors.back_account_number}
                helperText={
                  errors.back_account_number?.message || "Numbers only"
                }
                placeholder="Enter bank account number"
                inputProps={{
                  readOnly: isReadOnly,
                }}
                className="general-form__text-field"
                sx={{
                  width: "100%",
                  "& .MuiOutlinedInput-root": { borderRadius: 2 },
                }}
              />
            )}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

AccountForm.displayName = "AccountForm";

export default AccountForm;
