import React, {
  useEffect,
  useState,
  useMemo,
  useRef,
  useCallback,
} from "react";
import {
  Box,
  Alert,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  FormHelperText,
  Grid,
  CircularProgress,
} from "@mui/material";
import { useSnackbar } from "notistack";
import {
  useGetAllAccountsQuery,
  useUpdateAccountMutation,
} from "../../../../features/api/employee/accountsApi";
import { useLazyGetAllShowBanksQuery } from "../../../../features/api/extras/banksApi";
import "./General.scss";

const AccountForm = React.forwardRef(
  (
    {
      onSubmit,
      selectedAccount,
      showArchived,
      isLoading = false,
      employeeId,
      onValidationChange,
      employeeData,
    },
    ref
  ) => {
    const { enqueueSnackbar } = useSnackbar();

    const [form, setForm] = useState({
      sss_number: "",
      pag_ibig_number: "",
      philhealth_number: "",
      tin_number: "",
      bank_id: "",
      bank_display: "",
      back_account_number: "",
    });

    const [errors, setErrors] = useState({});
    const [errorMessage, setErrorMessage] = useState(null);
    const [banksLoaded, setBanksLoaded] = useState(false);
    const [isProcessingBank, setIsProcessingBank] = useState(false);

    const hasBeenInitializedWithData = useRef(false);
    const userHasMadeChanges = useRef(false);
    const lastProcessedSelectedAccount = useRef(null);

    const {
      data: accountsData,
      isLoading: accountsLoading,
      error: accountsError,
    } = useGetAllAccountsQuery(undefined, {
      skip: !employeeId,
    });

    const [
      fetchBanks,
      { data: banksData, isLoading: banksLoading, error: banksError },
    ] = useLazyGetAllShowBanksQuery();

    // Load banks immediately when component mounts if we're in edit mode OR when form has bank_id
    useEffect(() => {
      const shouldLoadBanks =
        !banksLoaded &&
        ((selectedAccount && hasValidAccountData(selectedAccount)) ||
          form.bank_id);

      if (shouldLoadBanks) {
        fetchBanks();
        setBanksLoaded(true);
      }
    }, [selectedAccount, form.bank_id, banksLoaded, fetchBanks]);

    const handleBankDropdownOpen = () => {
      if (!banksLoaded) {
        fetchBanks();
        setBanksLoaded(true);
      }
    };

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

    const banks = useMemo(() => {
      if (!banksData) return [];

      if (Array.isArray(banksData)) {
        return banksData;
      } else if (banksData.result && Array.isArray(banksData.result)) {
        return banksData.result;
      } else if (banksData.data && Array.isArray(banksData.data)) {
        return banksData.data;
      } else if (banksData.banks && Array.isArray(banksData.banks)) {
        return banksData.banks;
      } else if (banksData.items && Array.isArray(banksData.items)) {
        return banksData.items;
      } else if (banksData.results && Array.isArray(banksData.results)) {
        return banksData.results;
      }

      return [];
    }, [banksData]);

    const accountsArray = useMemo(() => {
      if (!accountsData) return [];

      if (accountsData.result && Array.isArray(accountsData.result.data)) {
        return accountsData.result.data;
      } else if (Array.isArray(accountsData)) {
        return accountsData;
      } else if (accountsData.data && Array.isArray(accountsData.data)) {
        return accountsData.data;
      }

      return [];
    }, [accountsData]);

    const currentEmployeeAccount = useMemo(() => {
      if (!employeeId || !accountsArray.length) return null;

      const foundAccount = accountsArray.find((account) => {
        const accountEmployeeId =
          account.employee_id || account.employeeId || account.emp_id;
        return String(accountEmployeeId) === String(employeeId);
      });

      return foundAccount;
    }, [employeeId, accountsArray]);

    const getFieldValue = (data, fieldName) => {
      if (!data) return "";

      const possibleFields = {
        sss_number: [
          "sss_number",
          "sssNumber",
          "sss",
          "SSS",
          "sss_no",
          "sssNo",
          "social_security_number",
          "socialSecurityNumber",
        ],
        pag_ibig_number: [
          "pag_ibig_number",
          "pagIbigNumber",
          "pag_ibig",
          "pagibig",
          "PAGIBIG",
          "pag_ibig_no",
          "pagIbigNo",
          "hdmf_number",
          "hdmfNumber",
        ],
        philhealth_number: [
          "philhealth_number",
          "philhealthNumber",
          "philhealth",
          "PHILHEALTH",
          "phil_health",
          "philHealth",
          "philhealth_no",
          "philhealthNo",
        ],
        tin_number: [
          "tin_number",
          "tinNumber",
          "tin",
          "TIN",
          "tax_identification_number",
          "taxIdentificationNumber",
          "tin_no",
          "tinNo",
        ],
        bank_account_number: [
          "back_account_number",
          "bankAccountNumber",
          "account_number",
          "bank_account_number",
          "bank_account",
          "accountNumber",
          "acct_number",
          "acctNumber",
          "bank_acct_number",
          "bankAcctNumber",
        ],
      };

      const fieldsToCheck = possibleFields[fieldName] || [fieldName];

      for (const field of fieldsToCheck) {
        if (
          data[field] !== null &&
          data[field] !== undefined &&
          data[field] !== ""
        ) {
          return String(data[field]);
        }
      }

      const nestedObjects = [
        "account_info",
        "accounts",
        "account",
        "employee_account",
        "personal_info",
        "government_info",
        "banking_info",
      ];

      for (const nestedKey of nestedObjects) {
        if (data[nestedKey] && typeof data[nestedKey] === "object") {
          for (const field of fieldsToCheck) {
            if (
              data[nestedKey][field] !== null &&
              data[nestedKey][field] !== undefined &&
              data[nestedKey][field] !== ""
            ) {
              return String(data[nestedKey][field]);
            }
          }
        }
      }

      return "";
    };

    const getBankId = (data) => {
      if (!data) return { id: "", display: "" };

      const bankFields = [
        "bank_id",
        "bankId",
        "bank",
        "Bank",
        "BANK",
        "bank_code",
        "bankCode",
        "financial_institution",
      ];

      for (const field of bankFields) {
        const bankData = data[field];

        if (bankData) {
          if (typeof bankData === "object" && bankData !== null) {
            const bankId = String(
              bankData.id || bankData.bank_id || bankData.bankId || ""
            );
            const bankDisplay =
              bankData.name || bankData.bank_name || bankData.title || "";
            return { id: bankId, display: bankDisplay };
          } else if (
            typeof bankData === "string" ||
            typeof bankData === "number"
          ) {
            return { id: String(bankData), display: "" };
          }
        }
      }

      const nestedObjects = [
        "account_info",
        "accounts",
        "account",
        "employee_account",
        "banking_info",
        "bank_info",
      ];

      for (const nestedKey of nestedObjects) {
        if (data[nestedKey] && typeof data[nestedKey] === "object") {
          for (const field of bankFields) {
            const bankData = data[nestedKey][field];

            if (bankData) {
              if (typeof bankData === "object" && bankData !== null) {
                const bankId = String(
                  bankData.id || bankData.bank_id || bankData.bankId || ""
                );
                const bankDisplay =
                  bankData.name || bankData.bank_name || bankData.title || "";
                return { id: bankId, display: bankDisplay };
              } else if (
                typeof bankData === "string" ||
                typeof bankData === "number"
              ) {
                return { id: String(bankData), display: "" };
              }
            }
          }
        }
      }

      return { id: "", display: "" };
    };

    const hasValidAccountData = useCallback((account) => {
      if (!account) return false;

      const accountData =
        account.account_info || account.accounts || account.account || account;

      return (
        accountData &&
        (getFieldValue(accountData, "sss_number") ||
          getFieldValue(accountData, "pag_ibig_number") ||
          getFieldValue(accountData, "philhealth_number") ||
          getFieldValue(accountData, "tin_number") ||
          getBankId(accountData).id ||
          getFieldValue(accountData, "bank_account_number"))
      );
    }, []);

    const hasUserData = useMemo(() => {
      return Object.values(form).some(
        (value) => value && value.toString().trim()
      );
    }, [form]);

    const getAccountKey = useCallback((account) => {
      if (!account) return "empty";

      const accountData =
        account.account_info || account.accounts || account.account || account;

      return `${getFieldValue(accountData, "sss_number")}-${getFieldValue(
        accountData,
        "pag_ibig_number"
      )}-${getFieldValue(accountData, "philhealth_number")}-${getFieldValue(
        accountData,
        "tin_number"
      )}-${getBankId(accountData).id}-${getFieldValue(
        accountData,
        "bank_account_number"
      )}`;
    }, []);

    // Update bank display name when banks are loaded and form has bank_id
    useEffect(() => {
      if (banks.length > 0 && form.bank_id && !form.bank_display) {
        const selectedBank = banks.find((bank) => bank.id == form.bank_id);
        if (selectedBank) {
          const bankDisplay =
            selectedBank.name ||
            selectedBank.bank_name ||
            selectedBank.title ||
            "";

          setForm((prev) => ({
            ...prev,
            bank_display: bankDisplay,
          }));
        }
      }
    }, [banks, form.bank_id, form.bank_display]);

    useEffect(() => {
      // If selectedAccount is provided but empty/invalid, use currentEmployeeAccount
      const accountToUse =
        selectedAccount && hasValidAccountData(selectedAccount)
          ? selectedAccount
          : currentEmployeeAccount;

      const currentKey = getAccountKey(accountToUse);
      const lastKey = getAccountKey(lastProcessedSelectedAccount.current);

      if (
        hasValidAccountData(accountToUse) &&
        (!hasBeenInitializedWithData.current ||
          (currentKey !== lastKey &&
            (!userHasMadeChanges.current || !hasUserData)))
      ) {
        const accountData =
          accountToUse.account_info ||
          accountToUse.accounts ||
          accountToUse.account ||
          accountToUse;

        const bankInfo = getBankId(accountData);

        const newForm = {
          sss_number: formatSSS(getFieldValue(accountData, "sss_number")),
          pag_ibig_number: formatPagIbig(
            getFieldValue(accountData, "pag_ibig_number")
          ),
          philhealth_number: formatPhilHealth(
            getFieldValue(accountData, "philhealth_number")
          ),
          tin_number: formatTIN(getFieldValue(accountData, "tin_number")),
          bank_id: bankInfo.id,
          bank_display: bankInfo.display,
          back_account_number: formatBankAccountNumber(
            getFieldValue(accountData, "bank_account_number")
          ),
        };

        setForm(newForm);
        setErrorMessage(null);
        setErrors({});
        hasBeenInitializedWithData.current = true;
        lastProcessedSelectedAccount.current = accountToUse;
        userHasMadeChanges.current = false;
      } else if (!accountToUse && !hasUserData) {
        const emptyForm = {
          sss_number: "",
          pag_ibig_number: "",
          philhealth_number: "",
          tin_number: "",
          bank_id: "",
          bank_display: "",
          back_account_number: "",
        };
        setForm(emptyForm);
        setErrors({});
        setErrorMessage(null);
        hasBeenInitializedWithData.current = false;
        userHasMadeChanges.current = false;
        lastProcessedSelectedAccount.current = null;
      }
    }, [
      selectedAccount,
      currentEmployeeAccount,
      employeeId,
      hasValidAccountData,
      getAccountKey,
      hasUserData,
    ]);

    useEffect(() => {
      if (onValidationChange) {
        const isValid = isFormValid();
        onValidationChange(isValid);
      }
    }, [form, onValidationChange]);

    const handleChange = (e) => {
      const { name, value } = e.target;

      userHasMadeChanges.current = true;

      let formattedValue = value;

      switch (name) {
        case "sss_number":
          formattedValue = formatSSS(value);
          break;
        case "pag_ibig_number":
          formattedValue = formatPagIbig(value);
          break;
        case "philhealth_number":
          formattedValue = formatPhilHealth(value);
          break;
        case "tin_number":
          formattedValue = formatTIN(value);
          break;
        case "back_account_number":
          formattedValue = formatBankAccountNumber(value);
          break;
        default:
          formattedValue = value;
      }

      setForm((prev) => ({ ...prev, [name]: formattedValue }));

      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: false }));
      }

      if (errorMessage) {
        setErrorMessage(null);
      }
    };

    const handleBankChange = (e) => {
      const selectedBankId = e.target.value;
      const selectedBank = banks.find((bank) => bank.id == selectedBankId);

      setForm((prev) => ({
        ...prev,
        bank_id: selectedBankId,
        bank_display: selectedBank
          ? selectedBank.name ||
            selectedBank.bank_name ||
            selectedBank.title ||
            ""
          : "",
      }));

      if (errors.bank_id) {
        setErrors((prev) => ({ ...prev, bank_id: false }));
      }

      userHasMadeChanges.current = true;
    };

    const isFormValid = () => {
      const requiredFields = [
        "sss_number",
        "pag_ibig_number",
        "philhealth_number",
        "tin_number",
        "bank_id",
      ];

      return requiredFields.every((field) => {
        const value = form[field];
        if (!value || value.toString().trim() === "") {
          return false;
        }

        switch (field) {
          case "sss_number":
            return /^\d{2}-\d{7}-\d{1}$/.test(value);
          case "pag_ibig_number":
            return /^\d{4}-\d{4}-\d{4}$/.test(value);
          case "philhealth_number":
            return /^\d{2}-\d{9}-\d{1}$/.test(value);
          case "tin_number":
            return /^\d{3}-\d{3}-\d{3}$/.test(value);
          default:
            return true;
        }
      });
    };

    const validateForm = () => {
      const requiredFields = [
        "sss_number",
        "pag_ibig_number",
        "philhealth_number",
        "tin_number",
        "bank_id",
      ];

      const newErrors = {};

      requiredFields.forEach((field) => {
        const value = form[field];
        if (!value || value.toString().trim() === "") {
          newErrors[field] = "This field is required";
          return;
        }

        switch (field) {
          case "sss_number":
            if (!/^\d{2}-\d{7}-\d{1}$/.test(value)) {
              newErrors[field] = "Invalid SSS format (XX-XXXXXXX-X)";
            }
            break;
          case "pag_ibig_number":
            if (!/^\d{4}-\d{4}-\d{4}$/.test(value)) {
              newErrors[field] = "Invalid PAG-IBIG format (XXXX-XXXX-XXXX)";
            }
            break;
          case "philhealth_number":
            if (!/^\d{2}-\d{9}-\d{1}$/.test(value)) {
              newErrors[field] = "Invalid PhilHealth format (XX-XXXXXXXXX-X)";
            }
            break;
          case "tin_number":
            if (!/^\d{3}-\d{3}-\d{3}$/.test(value)) {
              newErrors[field] = "Invalid TIN format (XXX-XXX-XXX)";
            }
            break;
        }
      });

      if (form.back_account_number && form.back_account_number.trim() !== "") {
        if (
          !/^\d+$/.test(form.back_account_number) ||
          form.back_account_number.length === 0
        ) {
          newErrors.back_account_number = "Invalid bank account number";
        }
      }

      setErrors(newErrors);

      if (Object.keys(newErrors).length > 0) {
        setErrorMessage("Please correct the highlighted fields");
        return false;
      }

      return true;
    };

    React.useImperativeHandle(ref, () => ({
      validateAndGetData: () => {
        if (validateForm()) {
          return form;
        }
        return null;
      },
      isFormValid,
      getFormData: () => {
        return form;
      },
      setFormData: (data) => {
        if (data) {
          const bankInfo = getBankId(data);
          const newForm = {
            sss_number: formatSSS(getFieldValue(data, "sss_number")),
            pag_ibig_number: formatPagIbig(
              getFieldValue(data, "pag_ibig_number")
            ),
            philhealth_number: formatPhilHealth(
              getFieldValue(data, "philhealth_number")
            ),
            tin_number: formatTIN(getFieldValue(data, "tin_number")),
            bank_id: bankInfo.id,
            bank_display: bankInfo.display,
            back_account_number: formatBankAccountNumber(
              getFieldValue(data, "bank_account_number")
            ),
          };

          setForm(newForm);
          hasBeenInitializedWithData.current = true;
          lastProcessedSelectedAccount.current = data;
          userHasMadeChanges.current = false;
        }
      },
      resetForm: () => {
        const emptyForm = {
          sss_number: "",
          pag_ibig_number: "",
          philhealth_number: "",
          tin_number: "",
          bank_id: "",
          bank_display: "",
          back_account_number: "",
        };
        setForm(emptyForm);
        setErrors({});
        setErrorMessage(null);
        hasBeenInitializedWithData.current = false;
        userHasMadeChanges.current = false;
        lastProcessedSelectedAccount.current = null;
      },
      allowSelectedAccountUpdates: () => {
        userHasMadeChanges.current = false;
      },
      validateForm,
      setErrors,
      setErrorMessage,
    }));

    const accountToUse =
      selectedAccount && hasValidAccountData(selectedAccount)
        ? selectedAccount
        : currentEmployeeAccount;

    const debugAccountData = accountToUse
      ? accountToUse.account_info ||
        accountToUse.accounts ||
        accountToUse.account ||
        accountToUse
      : null;

    return (
      <Box sx={{ p: 2 }}>
        {errorMessage && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {errorMessage}
          </Alert>
        )}
        {accountsError && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            Failed to load accounts from server.
          </Alert>
        )}
        {banksError && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            Failed to load banks from server.
          </Alert>
        )}
        <Grid container spacing={2}>
          <Grid item xs={3}>
            <TextField
              label={
                <>
                  SSS Number <span style={{ color: "red" }}>*</span>
                </>
              }
              name="sss_number"
              variant="outlined"
              fullWidth
              value={form.sss_number}
              onChange={handleChange}
              disabled={isLoading}
              error={!!errors.sss_number}
              helperText={errors.sss_number || "Format: 10-1234567-8"}
              placeholder="Format: 10-1234567-8"
              inputProps={{
                maxLength: 12,
              }}
              className="general-form__text-field"
              sx={{
                width: "355px",
                "& .MuiOutlinedInput-root": { borderRadius: 2 },
              }}
            />
          </Grid>

          <Grid item xs={3}>
            <TextField
              label={
                <>
                  PAG-IBIG Number <span style={{ color: "red" }}>*</span>
                </>
              }
              name="pag_ibig_number"
              variant="outlined"
              fullWidth
              value={form.pag_ibig_number}
              onChange={handleChange}
              disabled={isLoading}
              error={!!errors.pag_ibig_number}
              helperText={errors.pag_ibig_number || "Format: 1234-5678-9012"}
              placeholder="Format: 1234-5678-9012"
              inputProps={{
                maxLength: 14,
              }}
              className="general-form__text-field"
              sx={{
                width: "355px",
                "& .MuiOutlinedInput-root": { borderRadius: 2 },
              }}
            />
          </Grid>

          <Grid item xs={3}>
            <TextField
              label={
                <>
                  PhilHealth Number <span style={{ color: "red" }}>*</span>
                </>
              }
              name="philhealth_number"
              variant="outlined"
              fullWidth
              value={form.philhealth_number}
              onChange={handleChange}
              disabled={isLoading}
              error={!!errors.philhealth_number}
              helperText={errors.philhealth_number || "Format: 12-345678901-2"}
              placeholder="Format: 12-345678901-2"
              inputProps={{
                maxLength: 14,
              }}
              className="general-form__text-field"
              sx={{
                width: "355px",
                "& .MuiOutlinedInput-root": { borderRadius: 2 },
              }}
            />
          </Grid>

          <Grid item xs={3}>
            <TextField
              label={
                <>
                  TIN Number <span style={{ color: "red" }}>*</span>
                </>
              }
              name="tin_number"
              variant="outlined"
              fullWidth
              value={form.tin_number}
              onChange={handleChange}
              disabled={isLoading}
              error={!!errors.tin_number}
              helperText={errors.tin_number || "Format: 123-456-789"}
              placeholder="Format: 123-456-789"
              inputProps={{
                maxLength: 11,
              }}
              className="general-form__text-field"
              sx={{
                width: "355px",
                "& .MuiOutlinedInput-root": { borderRadius: 2 },
              }}
            />
          </Grid>

          <Grid item xs={3}>
            <FormControl
              fullWidth
              variant="outlined"
              error={!!errors.bank_id}
              disabled={isLoading || banksLoading}
              sx={{
                width: "355px",
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
                "& .MuiInputLabel-root": {
                  color: "rgb(33, 61, 112)",
                  "&.Mui-focused": {
                    color: "rgb(33, 61, 112)",
                  },
                },
                "& .MuiFormLabel-root": {
                  color: "rgb(33, 61, 112)",
                  "&.Mui-focused": {
                    color: "rgb(33, 61, 112)",
                  },
                },
              }}>
              <InputLabel id="bank-select-label">
                Bank <span style={{ color: "red" }}>*</span>
              </InputLabel>
              <Select
                labelId="bank-select-label"
                name="bank_id"
                value={form.bank_id}
                onChange={handleBankChange}
                onOpen={handleBankDropdownOpen}
                label="Bank *"
                renderValue={(selected) => {
                  if (banksLoading && !banks.length) return "Loading...";
                  if (!selected) return "Select Bank";

                  // First try to find in the banks list
                  const selectedBank = banks.find(
                    (bank) => bank.id == selected
                  );
                  if (selectedBank) {
                    return (
                      selectedBank.name ||
                      selectedBank.bank_name ||
                      selectedBank.title ||
                      ""
                    );
                  }

                  // Then try to use the stored display name
                  if (form.bank_display) return form.bank_display;

                  return "Loading bank...";
                }}>
                <MenuItem value="">
                  <em>Select Bank</em>
                </MenuItem>
                {banksLoading && !banks.length ? (
                  <MenuItem disabled>
                    <CircularProgress size={16} sx={{ mr: 1 }} /> Loading
                    banks...
                  </MenuItem>
                ) : (
                  banks.map((bank) => {
                    const bankId = bank.id;
                    const bankDisplay =
                      bank.name || bank.bank_name || bank.title || "";
                    return (
                      <MenuItem key={bankId} value={bankId}>
                        {bankDisplay}
                      </MenuItem>
                    );
                  })
                )}
              </Select>
              {errors.bank_id && (
                <FormHelperText>{errors.bank_id}</FormHelperText>
              )}
            </FormControl>
          </Grid>

          <Grid item xs={3}>
            <TextField
              label="Bank Account Number"
              name="back_account_number"
              variant="outlined"
              fullWidth
              value={
                form.bank_account_number ||
                employeeData?.account?.bank_account_number
              }
              onChange={handleChange}
              disabled={isLoading}
              error={!!errors.back_account_number}
              helperText={errors.back_account_number || "Numbers only"}
              placeholder="Enter bank account number"
              className="general-form__text-field"
              sx={{
                width: "355px",
                "& .MuiOutlinedInput-root": { borderRadius: 2 },
              }}
            />
          </Grid>
        </Grid>
      </Box>
    );
  }
);

AccountForm.displayName = "AccountForm";

export default AccountForm;
