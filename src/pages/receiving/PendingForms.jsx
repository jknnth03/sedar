import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  Paper,
  Typography,
  TablePagination,
  CircularProgress,
  Box,
  TextField,
  Checkbox,
  FormControlLabel,
  useTheme,
} from "@mui/material";
import MarkAsUnreadIcon from "@mui/icons-material/MarkAsUnread";
import SearchIcon from "@mui/icons-material/Search";
import { FormProvider, useForm } from "react-hook-form";
import { useSnackbar } from "notistack";
import "../../pages/GeneralStyle.scss";
import {
  useGetReceiverTasksQuery,
  useGetReceiverHistoryQuery,
  useReceiveSubmissionMutation,
  useReturnSubmissionMutation,
} from "../../features/api/receiving/receivingApi";
import ReceivingTable from "./ReceivingTable";

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const CustomSearchBar = ({
  searchQuery,
  setSearchQuery,
  showReceived,
  setShowReceived,
  isLoading = false,
}) => {
  const iconColor = showReceived ? "#007c00ff" : "rgb(33, 61, 112)";
  const labelColor = showReceived ? "#007c00ff" : "rgb(33, 61, 112)";

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
      <FormControlLabel
        control={
          <Checkbox
            checked={showReceived}
            onChange={(e) => setShowReceived(e.target.checked)}
            disabled={isLoading}
            icon={<MarkAsUnreadIcon sx={{ color: iconColor }} />}
            checkedIcon={<MarkAsUnreadIcon sx={{ color: iconColor }} />}
            size="small"
          />
        }
        label="RECEIVED FORMS"
        sx={{
          margin: 0,
          border: `1px solid ${showReceived ? "#007c00ff" : "#ccc"}`,
          borderRadius: "8px",
          paddingLeft: "8px",
          paddingRight: "12px",
          height: "36px",
          backgroundColor: showReceived ? "rgba(0, 124, 0, 0.04)" : "white",
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            backgroundColor: showReceived ? "rgba(0, 124, 0, 0.08)" : "#f5f5f5",
            borderColor: showReceived ? "#007c00ff" : "rgb(33, 61, 112)",
          },
          "& .MuiFormControlLabel-label": {
            fontSize: "12px",
            fontWeight: 600,
            color: labelColor,
            letterSpacing: "0.5px",
          },
        }}
      />

      <TextField
        placeholder="Search..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        disabled={isLoading}
        size="small"
        InputProps={{
          startAdornment: (
            <SearchIcon
              sx={{
                color: isLoading ? "#ccc" : "#666",
                marginRight: 1,
                fontSize: "20px",
              }}
            />
          ),
          endAdornment: isLoading && (
            <CircularProgress size={16} sx={{ marginLeft: 1 }} />
          ),
          sx: {
            height: "36px",
            width: "320px",
            backgroundColor: "white",
            transition: "all 0.2s ease-in-out",
            "& .MuiOutlinedInput-root": {
              height: "36px",
              "& fieldset": {
                borderColor: "#ccc",
                transition: "border-color 0.2s ease-in-out",
              },
              "&:hover fieldset": {
                borderColor: "rgb(33, 61, 112)",
              },
              "&.Mui-focused fieldset": {
                borderColor: "rgb(33, 61, 112)",
                borderWidth: "2px",
              },
              "&.Mui-disabled": {
                backgroundColor: "#f5f5f5",
              },
            },
          },
        }}
        sx={{
          "& .MuiInputBase-input": {
            fontSize: "14px",
            "&::placeholder": {
              opacity: 0.7,
            },
          },
        }}
      />
    </Box>
  );
};

const PendingForms = () => {
  const { enqueueSnackbar } = useSnackbar();

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [showReceived, setShowReceived] = useState(false);

  const methods = useForm();
  const debounceValue = useDebounce(searchQuery, 500);

  const queryParams = useMemo(() => {
    const params = {
      pagination: 1,
      page,
      per_page: rowsPerPage,
      status: showReceived ? "received" : "receiving",
    };

    if (debounceValue && debounceValue.trim() !== "") {
      params.search = debounceValue.trim();
    }

    return params;
  }, [debounceValue, page, rowsPerPage, showReceived]);

  const {
    data: pendingData,
    isLoading: pendingLoading,
    isFetching: pendingFetching,
    refetch: refetchPending,
    error: pendingError,
  } = useGetReceiverTasksQuery(queryParams, {
    refetchOnMountOrArgChange: true,
    skip: showReceived,
  });

  const {
    data: receivedData,
    isLoading: receivedLoading,
    isFetching: receivedFetching,
    refetch: refetchReceived,
    error: receivedError,
  } = useGetReceiverHistoryQuery(queryParams, {
    refetchOnMountOrArgChange: true,
    skip: !showReceived,
  });

  const [receiveSubmission] = useReceiveSubmissionMutation();
  const [returnSubmission] = useReturnSubmissionMutation();

  const currentData = showReceived ? receivedData : pendingData;
  const currentLoading = showReceived ? receivedLoading : pendingLoading;
  const currentFetching = showReceived ? receivedFetching : pendingFetching;
  const currentError = showReceived ? receivedError : pendingError;
  const currentRefetch = showReceived ? refetchReceived : refetchPending;

  const submissionsList = useMemo(
    () => currentData?.result?.data || [],
    [currentData]
  );

  const handleSearchChange = useCallback((newSearchQuery) => {
    setSearchQuery(newSearchQuery);
    setPage(1);
  }, []);

  const handleShowReceivedChange = useCallback((newShowReceived) => {
    setShowReceived(newShowReceived);
    setPage(1);
  }, []);

  const handleReceiveSubmission = async (submissionId, comments) => {
    try {
      await receiveSubmission({
        id: submissionId,
        comments: comments || "",
        reason: "",
      }).unwrap();

      enqueueSnackbar("Submission received successfully!", {
        variant: "success",
        autoHideDuration: 2000,
      });

      currentRefetch();
    } catch (error) {
      enqueueSnackbar("Failed to receive submission. Please try again.", {
        variant: "error",
        autoHideDuration: 2000,
      });
      throw error;
    }
  };

  const handleReturnSubmission = async (submissionId, comments) => {
    try {
      await returnSubmission({
        id: submissionId,
        comments: comments || "",
        reason: "",
      }).unwrap();

      enqueueSnackbar("Submission returned successfully!", {
        variant: "success",
        autoHideDuration: 2000,
      });

      currentRefetch();
    } catch (error) {
      enqueueSnackbar("Failed to return submission. Please try again.", {
        variant: "error",
        autoHideDuration: 2000,
      });
      throw error;
    }
  };

  const handlePageChange = useCallback((event, newPage) => {
    setPage(newPage + 1);
  }, []);

  const handleRowsPerPageChange = useCallback((event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1);
  }, []);

  const isLoadingState = currentLoading || currentFetching;

  return (
    <FormProvider {...methods}>
      <Box
        sx={{
          width: "100%",
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          backgroundColor: "#fafafa",
        }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
            minHeight: "72px",
            padding: "16px 14px",
            backgroundColor: "white",
            borderBottom: "1px solid #e0e0e0",
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.4 }}>
            <Typography className="header">
              {showReceived ? "RECEIVED RECEIVING" : "PENDING RECEIVING"}
            </Typography>
          </Box>

          <CustomSearchBar
            searchQuery={searchQuery}
            setSearchQuery={handleSearchChange}
            showReceived={showReceived}
            setShowReceived={handleShowReceivedChange}
            isLoading={isLoadingState}
          />
        </Box>

        <Box
          sx={{
            flex: 1,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            backgroundColor: "white",
          }}>
          <ReceivingTable
            submissionsList={submissionsList}
            isLoadingState={isLoadingState}
            error={currentError}
            searchQuery={searchQuery}
            showArchived={showReceived}
            onReceiveSubmission={handleReceiveSubmission}
            onReturnSubmission={handleReturnSubmission}
          />

          <Box
            sx={{
              borderTop: "1px solid #e0e0e0",
              backgroundColor: "#f8f9fa",
              flexShrink: 0,
              "& .MuiTablePagination-root": {
                color: "#666",
                "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
                  {
                    fontSize: "14px",
                    fontWeight: 500,
                  },
                "& .MuiTablePagination-select": {
                  fontSize: "14px",
                },
                "& .MuiIconButton-root": {
                  color: "rgb(33, 61, 112)",
                  "&:hover": {
                    backgroundColor: "rgba(33, 61, 112, 0.04)",
                  },
                  "&.Mui-disabled": {
                    color: "#ccc",
                  },
                },
              },
            }}>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50, 100]}
              component="div"
              count={currentData?.result?.total || 0}
              rowsPerPage={rowsPerPage}
              page={Math.max(0, page - 1)}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
              sx={{
                "& .MuiTablePagination-toolbar": {
                  paddingLeft: "24px",
                  paddingRight: "24px",
                },
              }}
            />
          </Box>
        </Box>
      </Box>
    </FormProvider>
  );
};

export default PendingForms;
