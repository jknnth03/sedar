import React, { useState, useMemo, useCallback } from "react";
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  CircularProgress,
  TableRow,
  Box,
  TextField,
  Checkbox,
  FormControlLabel,
  Button,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ArchiveIcon from "@mui/icons-material/Archive";
import AddIcon from "@mui/icons-material/Add";
import "../../../pages/GeneralStyle.scss";
import { useGetShowOneRdfQuery } from "../../../features/api/masterlist/realonerdfApi";
import { CONSTANT } from "../../../config";
import useDebounce from "../../../hooks/useDebounce";
import dayjs from "dayjs";

const CustomSearchBar = ({
  searchQuery,
  setSearchQuery,
  showArchived,
  setShowArchived,
  isLoading = false,
}) => {
  const iconColor = showArchived ? "#d32f2f" : "rgb(33, 61, 112)";
  const labelColor = showArchived ? "#d32f2f" : "rgb(33, 61, 112)";

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
      <FormControlLabel
        control={
          <Checkbox
            checked={showArchived}
            onChange={(e) => setShowArchived(e.target.checked)}
            disabled={isLoading}
            icon={<ArchiveIcon sx={{ color: iconColor }} />}
            checkedIcon={<ArchiveIcon sx={{ color: iconColor }} />}
            size="small"
          />
        }
        label="ARCHIVED"
        sx={{
          margin: 0,
          border: `1px solid ${showArchived ? "#d32f2f" : "#ccc"}`,
          borderRadius: "8px",
          paddingLeft: "8px",
          paddingRight: "12px",
          height: "36px",
          backgroundColor: showArchived ? "rgba(211, 47, 47, 0.04)" : "white",
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            backgroundColor: showArchived
              ? "rgba(211, 47, 47, 0.08)"
              : "#f5f5f5",
            borderColor: showArchived ? "#d32f2f" : "rgb(33, 61, 112)",
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

const OneRdf = () => {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);

  const debounceValue = useDebounce(searchQuery, 500);

  // Fix: Reset page to 1 when search changes
  const queryParams = useMemo(
    () => ({
      search: debounceValue,
      page,
      per_page: rowsPerPage,
      status: showArchived ? "inactive" : "active",
      pagination: true,
    }),
    [debounceValue, page, rowsPerPage, showArchived]
  );

  const {
    data: oneRdfData,
    isLoading,
    isFetching,
    refetch,
  } = useGetShowOneRdfQuery(queryParams, {
    refetchOnMountOrArgChange: true,
  });

  const oneRdfList = useMemo(
    () => oneRdfData?.result?.data || [],
    [oneRdfData]
  );

  const handleSearchChange = useCallback((newSearchQuery) => {
    setSearchQuery(newSearchQuery);
    // Reset page to 1 when search changes
    setPage(1);
  }, []);

  const handleChangeArchived = useCallback((newShowArchived) => {
    setShowArchived(newShowArchived);
    // Reset page to 1 when archived status changes
    setPage(1);
  }, []);

  // Debug: Log the query params and response
  console.log("Query Params:", queryParams);
  console.log("API Response:", oneRdfData);
  console.log("Search Query:", searchQuery);
  console.log("Debounced Value:", debounceValue);

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        backgroundColor: "white",
      }}>
      {/* Header Section */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
          minHeight: "60px",
          padding: "12px 16px",
          backgroundColor: "white",
          borderBottom: "1px solid #e0e0e0",
        }}>
        {/* Left side - Header */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.4 }}>
          <Typography className="header">CHARGING</Typography>
        </Box>

        {/* Right side - Search Bar */}
        <CustomSearchBar
          searchQuery={searchQuery}
          setSearchQuery={handleSearchChange}
          showArchived={showArchived}
          setShowArchived={handleChangeArchived}
          isLoading={isLoading || isFetching}
        />
      </Box>

      {/* Table Section */}
      <Box
        sx={{
          flex: 1,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "white",
        }}>
        <TableContainer
          sx={{
            flex: 1,
            overflow: "auto",
            "& .MuiTableCell-head": {
              backgroundColor: "#f8f9fa",
              fontWeight: 700,
              fontSize: "18px",
              color: "rgb(33, 61, 112)",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              borderBottom: "2px solid #e0e0e0",
              position: "sticky",
              top: 0,
              zIndex: 10,
              height: "48px",
              padding: "8px 16px",
            },
            "& .MuiTableCell-body": {
              fontSize: "16px",
              color: "#333",
              borderBottom: "1px solid #f0f0f0",
              padding: "8px 16px",
              height: "52px",
            },
            "& .MuiTableRow-root": {
              transition: "background-color 0.2s ease-in-out",
              "&:hover": {
                backgroundColor: "#f8f9fa",
              },
            },
          }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell align="left" sx={{ width: "60px" }}>
                  ID
                </TableCell>
                <TableCell sx={{ width: "500px" }}>NAME</TableCell>
                <TableCell align="center" sx={{ width: "100px" }}>
                  CODE
                </TableCell>
                <TableCell sx={{ width: "180px" }}>COMPANY</TableCell>
                <TableCell sx={{ width: "500px" }}>BUSINESS UNIT</TableCell>
                <TableCell sx={{ width: "500px" }}>DEPARTMENT</TableCell>
                <TableCell sx={{ width: "140px" }}>UNIT</TableCell>
                <TableCell sx={{ width: "140px" }}>SUB UNIT</TableCell>
                <TableCell sx={{ width: "140px" }}>LOCATION</TableCell>
                <TableCell sx={{ width: "500px" }}>LAST MODIFIED</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading || isFetching ? (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
                    <CircularProgress
                      size={32}
                      sx={{ color: "rgb(33, 61, 112)" }}
                    />
                  </TableCell>
                </TableRow>
              ) : oneRdfList.length > 0 ? (
                oneRdfList.map((oneRdf) => (
                  <TableRow key={oneRdf.id}>
                    <TableCell align="left">{oneRdf.id}</TableCell>
                    <TableCell
                      sx={{
                        width: "220px",
                        minWidth: "180px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        fontWeight: 600,
                      }}>
                      {oneRdf.name}
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ fontFamily: "monospace", fontSize: "12px" }}>
                      {oneRdf.code}
                    </TableCell>
                    <TableCell>{oneRdf.company_name || "-"}</TableCell>
                    <TableCell
                      sx={{
                        width: "220px",
                        minWidth: "180px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}>
                      {oneRdf.business_unit_name || "-"}
                    </TableCell>
                    <TableCell
                      sx={{
                        width: "220px",
                        minWidth: "180px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}>
                      {oneRdf.department_name || "-"}
                    </TableCell>
                    <TableCell
                      sx={{
                        width: "220px",
                        minWidth: "180px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}>
                      {oneRdf.unit_name || "-"}
                    </TableCell>
                    <TableCell
                      sx={{
                        width: "220px",
                        minWidth: "180px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}>
                      {oneRdf.sub_unit_name || "-"}
                    </TableCell>
                    <TableCell>{oneRdf.location_name || "-"}</TableCell>
                    <TableCell
                      sx={{
                        width: "220px",
                        minWidth: "180px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}>
                      {oneRdf.updated_at
                        ? dayjs(oneRdf.updated_at).format("MMM D, YYYY")
                        : "-"}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={10}
                    align="center"
                    sx={{
                      py: 8,
                      borderBottom: "none",
                      color: "#666",
                      fontSize: "16px",
                    }}>
                    {searchQuery && !isLoading ? (
                      <Typography>
                        No results found for "{searchQuery}"
                      </Typography>
                    ) : (
                      CONSTANT.BUTTONS.NODATA.icon
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
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
            count={oneRdfData?.result?.total || 0}
            rowsPerPage={rowsPerPage}
            page={Math.max(0, page - 1)}
            onPageChange={(event, newPage) => setPage(newPage + 1)}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(parseInt(event.target.value, 10));
              setPage(1);
            }}
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
  );
};

export default OneRdf;
