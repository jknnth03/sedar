import React, { useEffect, useState, useMemo, useCallback } from "react";
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
import EmployeeHeader from "./EmployeeHeader";
import "./General.scss";

const AccountForm = ({
  selectedAccount,
  isLoading = false,
  mode = "create",
  employeeData,
}) => {
  const {
    control,
    formState: { errors },
    watch,
    setValue,
    getValues,
  } = useFormContext();

  const [dropdownsLoaded, setDropdownsLoaded] = useState({
    banks: false,
  });
  const [isInitialized, setIsInitialized] = useState(false);

  const [
    triggerBanks,
    { data: banksData, isLoading: banksLoading, error: banksError },
  ] = useLazyGetAllShowBanksQuery();

  const isReadOnly = mode === "view";

  const normalizeApiData = useCallback((data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (data.result && Array.isArray(data.result.data)) return data.result.data;
    if (data.result && Array.isArray(data.result)) return data.result;
    if (Array.isArray(data.data)) return data.data;
    if (Array.isArray(data.banks)) return data.banks;
    if (Array.isArray(data.items)) return data.items;
    if (Array.isArray(data.results)) return data.results;
    return [];
  }, []);

  const banks = useMemo(() => {
    if (mode === "view" && selectedAccount?.bank) {
      return [selectedAccount.bank];
    }
    if (mode === "edit" && selectedAccount?.bank) {
      const existingBank =
        selectedAccount.bank ||
        selectedAccount.account?.bank ||
        selectedAccount.account_info?.bank;
      const apiBanks = normalizeApiData(banksData);

      if (!banksData) {
        return existingBank ? [existingBank] : [];
      }

      const hasExistingInApi = apiBanks.some(
        (bank) => bank.id === existingBank?.id
      );

      if (existingBank && !hasExistingInApi) {
        return [existingBank, ...apiBanks];
      }

      return apiBanks;
    }
    return normalizeApiData(banksData);
  }, [
    mode,
    banksData,
    selectedAccount?.bank,
    selectedAccount?.account?.bank,
    selectedAccount?.account_info?.bank,
    normalizeApiData,
  ]);

  const bankValue = watch("bank");

  // CONSOLIDATED INITIALIZATION EFFECT - Only runs once when data is ready
  useEffect(() => {
    // Skip if already initialized or banks not loaded yet
    if (isInitialized || banks.length === 0) return;

    const bankData =
      selectedAccount?.bank ||
      selectedAccount?.account?.bank ||
      selectedAccount?.account_info?.bank;

    // Only set initial value in edit/view mode with existing data
    if ((mode === "edit" || mode === "view") && bankData?.id) {
      const matchingBank = banks.find((bank) => bank.id === bankData.id);
      if (matchingBank && !bankValue) {
        setValue("bank", matchingBank, {
          shouldValidate: false,
          shouldDirty: true, // CHANGED: Set to true so form recognizes the change
        });
        setIsInitialized(true);
      }
    } else if (mode === "create") {
      // In create mode, only auto-set Landbank if SSS exists and no bank selected
      const currentFormValues = getValues();
      if (currentFormValues.sss_number && !bankValue) {
        const landBank = banks.find((bank) => bank.id === 1);
        if (landBank) {
          setValue("bank", landBank, {
            shouldValidate: false,
            shouldDirty: true, // CHANGED: Set to true
          });
        }
      }
      setIsInitialized(true);
    }
  }, [
    banks,
    selectedAccount,
    mode,
    bankValue,
    setValue,
    getValues,
    isInitialized,
  ]);

  // Reset initialization when mode or selectedAccount changes
  useEffect(() => {
    setIsInitialized(false);
  }, [mode, selectedAccount]);

  const handleDropdownFocus = useCallback(
    (dropdownName) => {
      if (mode === "view" || dropdownsLoaded[dropdownName]) return;

      const fetchParams = { page: 1, per_page: 1000, status: "active" };

      switch (dropdownName) {
        case "banks":
          triggerBanks(fetchParams);
          break;
      }

      setDropdownsLoaded((prev) => ({ ...prev, [dropdownName]: true }));
    },
    [dropdownsLoaded, triggerBanks, mode]
  );

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

  const getBankDisplayValue = () => {
    if (!bankValue) return null;

    if (typeof bankValue === "object" && bankValue.name) {
      return bankValue;
    }

    if (banks && banks.length > 0) {
      const bankId =
        typeof bankValue === "object" && bankValue.id
          ? bankValue.id
          : typeof bankValue === "string" || typeof bankValue === "number"
          ? parseInt(bankValue)
          : null;

      if (bankId && !isNaN(bankId)) {
        const foundBank = banks.find((bank) => bank.id === bankId);
        if (foundBank) {
          return foundBank;
        }
      }
    }

    return null;
  };

  return (
    <Box
      className="account-form"
      sx={{ width: "100%", maxWidth: "1200px", p: 2 }}>
      <EmployeeHeader getValues={getValues} selectedGeneral={employeeData} />
      {banksError && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Failed to load banks from server.
        </Alert>
      )}

      <Grid container spacing={1} sx={{ width: "100%" }}>
        <Grid item xs={12} sm={4} sx={{ minWidth: "362px", maxWidth: "362px" }}>
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

        <Grid item xs={12} sm={4} sx={{ minWidth: "362px", maxWidth: "362px" }}>
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

        <Grid item xs={12} sm={4} sx={{ minWidth: "362px", maxWidth: "362px" }}>
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

        <Grid item xs={12} sm={4} sx={{ minWidth: "362px", maxWidth: "362px" }}>
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

        <Grid item xs={12} sm={4} sx={{ minWidth: "362px", maxWidth: "362px" }}>
          <Controller
            name="bank"
            control={control}
            render={({ field: { onChange, value } }) => (
              <FormControl
                fullWidth
                variant="outlined"
                error={!!errors.bank}
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
                      onChange(item);
                    }
                  }}
                  value={getBankDisplayValue()}
                  options={banks ?? []}
                  loading={banksLoading}
                  getOptionLabel={(item) => {
                    if (!item) return "";
                    return (
                      item.name ||
                      item.bank_name ||
                      item.title ||
                      item.label ||
                      ""
                    );
                  }}
                  isOptionEqualToValue={(option, value) => {
                    if (!option || !value) return false;
                    return option.id === value.id;
                  }}
                  onOpen={() => {
                    if (!isReadOnly) {
                      handleDropdownFocus("banks");
                    }
                  }}
                  clearOnBlur={false}
                  handleHomeEndKeys={true}
                  freeSolo={false}
                  autoComplete={false}
                  autoHighlight={true}
                  blurOnSelect={true}
                  clearOnEscape={false}
                  disableClearable={isReadOnly}
                  readOnly={isReadOnly}
                  disabled={isLoading || banksLoading || isReadOnly}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={<>Bank</>}
                      error={!!errors.bank}
                      helperText={errors.bank?.message}
                      InputProps={{
                        ...params.InputProps,
                        readOnly: isReadOnly,
                        endAdornment: (
                          <>
                            {banksLoading ? (
                              <CircularProgress color="inherit" size={20} />
                            ) : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
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
                  renderOption={(props, option) => (
                    <li {...props} key={option.id}>
                      {option.name ||
                        option.bank_name ||
                        option.title ||
                        option.label ||
                        `Bank ${option.id}`}
                    </li>
                  )}
                  noOptionsText={
                    banksLoading ? "Loading banks..." : "No banks found"
                  }
                />
                {errors.bank && (
                  <FormHelperText>{errors.bank.message}</FormHelperText>
                )}
              </FormControl>
            )}
          />
        </Grid>

        <Grid item xs={12} sm={4} sx={{ minWidth: "362px", maxWidth: "362px" }}>
          <Controller
            name="bank_account_number"
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
                error={!!errors.bank_account_number}
                helperText={
                  errors.bank_account_number?.message || "Numbers only"
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
