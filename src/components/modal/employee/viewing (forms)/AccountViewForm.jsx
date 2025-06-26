import React, { useEffect, useState, useMemo } from "react";
import { Box, Alert, TextField, Grid, Typography } from "@mui/material";
import { useGetEmployeesQuery } from "../../../../features/api/employee/mainApi";
import "../../employee/forms/General.scss";

const AccountViewForm = ({ employeeId }) => {
  const [accountData, setAccountData] = useState({
    sss_number: "",
    pag_ibig_number: "",
    philhealth_number: "",
    tin_number: "",
    bank: "",
    bank_account_number: "",
  });

  const {
    data: employeesData,
    isLoading: employeesLoading,
    error: employeesError,
  } = useGetEmployeesQuery(undefined, {
    skip: !employeeId,
  });

  const employee = useMemo(() => {
    if (!employeesData || !employeeId) return null;

    let employees = [];
    if (Array.isArray(employeesData)) {
      employees = employeesData;
    } else if (
      employeesData.result &&
      Array.isArray(employeesData.result.data)
    ) {
      employees = employeesData.result.data;
    } else if (employeesData.data && Array.isArray(employeesData.data)) {
      employees = employeesData.data;
    }

    return employees.find((emp) => emp.id === employeeId);
  }, [employeesData, employeeId]);

  useEffect(() => {
    if (employee && employee.account) {
      setAccountData({
        sss_number: employee.account.sss_number || "N/A",
        pag_ibig_number: employee.account.pag_ibig_number || "N/A",
        philhealth_number: employee.account.philhealth_number || "N/A",
        tin_number: employee.account.tin_number || "N/A",
        bank: employee.account.bank || "N/A",
        bank_account_number: employee.account.bank_account_number || "N/A",
      });
    } else {
      // Set all fields to N/A if no account data exists
      setAccountData({
        sss_number: "N/A",
        pag_ibig_number: "N/A",
        philhealth_number: "N/A",
        tin_number: "N/A",
        bank: "N/A",
        bank_account_number: "N/A",
      });
    }
  }, [employee]);

  if (employeesLoading) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography>Loading account information...</Typography>
      </Box>
    );
  }

  if (employeesError) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          Failed to load employee account information.
        </Alert>
      </Box>
    );
  }

  if (!employee) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="warning" sx={{ mb: 3 }}>
          Employee not found.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={3}>
          <TextField
            label="SSS Number"
            name="sss_number"
            variant="outlined"
            fullWidth
            value={accountData.sss_number}
            InputProps={{
              readOnly: true,
            }}
            placeholder="N/A"
            className="general-form__text-field"
            sx={{
              width: "355px",
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                backgroundColor: "#f5f5f5",
              },
              "& .MuiInputBase-input": {
                color: "#666",
              },
            }}
          />
        </Grid>

        <Grid item xs={3}>
          <TextField
            label="PAG-IBIG Number"
            name="pag_ibig_number"
            variant="outlined"
            fullWidth
            value={accountData.pag_ibig_number}
            InputProps={{
              readOnly: true,
            }}
            placeholder="N/A"
            className="general-form__text-field"
            sx={{
              width: "355px",
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                backgroundColor: "#f5f5f5",
              },
              "& .MuiInputBase-input": {
                color: "#666",
              },
            }}
          />
        </Grid>

        <Grid item xs={3}>
          <TextField
            label="PhilHealth Number"
            name="philhealth_number"
            variant="outlined"
            fullWidth
            value={accountData.philhealth_number}
            InputProps={{
              readOnly: true,
            }}
            placeholder="N/A"
            className="general-form__text-field"
            sx={{
              width: "355px",
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                backgroundColor: "#f5f5f5",
              },
              "& .MuiInputBase-input": {
                color: "#666",
              },
            }}
          />
        </Grid>

        <Grid item xs={3}>
          <TextField
            label="TIN Number"
            name="tin_number"
            variant="outlined"
            fullWidth
            value={accountData.tin_number}
            InputProps={{
              readOnly: true,
            }}
            placeholder="N/A"
            className="general-form__text-field"
            sx={{
              width: "355px",
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                backgroundColor: "#f5f5f5",
              },
              "& .MuiInputBase-input": {
                color: "#666",
              },
            }}
          />
        </Grid>

        <Grid item xs={3}>
          <TextField
            label="Bank"
            name="bank"
            variant="outlined"
            fullWidth
            value={accountData.bank}
            InputProps={{
              readOnly: true,
            }}
            placeholder="N/A"
            className="general-form__text-field"
            sx={{
              width: "355px",
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                backgroundColor: "#f5f5f5",
              },
              "& .MuiInputBase-input": {
                color: "#666",
              },
            }}
          />
        </Grid>

        <Grid item xs={3}>
          <TextField
            label="Bank Account Number"
            name="bank_account_number"
            variant="outlined"
            fullWidth
            value={accountData.bank_account_number}
            InputProps={{
              readOnly: true,
            }}
            placeholder="N/A"
            className="general-form__text-field"
            sx={{
              width: "355px",
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                backgroundColor: "#f5f5f5",
              },
              "& .MuiInputBase-input": {
                color: "#666",
              },
            }}
          />
        </Grid>

        <Grid item xs={3}></Grid>
        <Grid item xs={3}></Grid>
      </Grid>
    </Box>
  );
};

AccountViewForm.displayName = "AccountViewForm";

export default AccountViewForm;
