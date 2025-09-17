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
  useMediaQuery,
  useTheme,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import "../../../pages/GeneralStyle.scss";
import { useGetShowOneRdfQuery } from "../../../features/api/masterlist/realonerdfApi";
import { CONSTANT } from "../../../config";
import useDebounce from "../../../hooks/useDebounce";
import dayjs from "dayjs";

const CustomSearchBar = ({
  searchQuery,
  setSearchQuery,
  isLoading = false,
}) => {
  const isVerySmall = useMediaQuery("(max-width:369px)");

  return (
    <Box
      sx={{ display: "flex", alignItems: "center", gap: isVerySmall ? 1 : 1.5 }}
      className="search-bar-container">
      <TextField
        placeholder={isVerySmall ? "Search..." : "Search charging..."}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        disabled={isLoading}
        size="small"
        className="search-input"
        InputProps={{
          startAdornment: (
            <SearchIcon
              sx={{
                color: isLoading ? "#ccc" : "#666",
                marginRight: 1,
                fontSize: isVerySmall ? "18px" : "20px",
              }}
            />
          ),
          endAdornment: isLoading && (
            <CircularProgress size={16} sx={{ marginLeft: 1 }} />
          ),
          sx: {
            height: "36px",
            width: isVerySmall ? "100%" : "320px",
            minWidth: isVerySmall ? "160px" : "200px",
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
          flex: isVerySmall ? 1 : "0 0 auto",
          "& .MuiInputBase-input": {
            fontSize: isVerySmall ? "13px" : "14px",
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between(600, 1038));
  const isVerySmall = useMediaQuery("(max-width:369px)");

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");

  const debounceValue = useDebounce(searchQuery, 500);

  const queryParams = useMemo(
    () => ({
      search: debounceValue,
      page,
      per_page: rowsPerPage,
      status: "active",
      pagination: true,
    }),
    [debounceValue, page, rowsPerPage]
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
    setPage(1);
  }, []);

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
      <Box
        sx={{
          display: "flex",
          alignItems: isMobile || isTablet ? "flex-start" : "center",
          justifyContent: isMobile || isTablet ? "flex-start" : "space-between",
          flexDirection: isMobile || isTablet ? "column" : "row",
          flexShrink: 0,
          minHeight: isMobile || isTablet ? "auto" : "60px",
          padding: isMobile ? "12px 14px" : isTablet ? "16px" : "12px 16px",
          backgroundColor: "white",
          borderBottom: "1px solid #e0e0e0",
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          gap: isMobile || isTablet ? "16px" : "0",
        }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            width: isMobile || isTablet ? "100%" : "auto",
            justifyContent: "flex-start",
          }}>
          <Typography className="header">CHARGING</Typography>
        </Box>

        <CustomSearchBar
          searchQuery={searchQuery}
          setSearchQuery={handleSearchChange}
          isLoading={isLoading || isFetching}
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
        <TableContainer
          sx={{
            flex: 1,
            overflow: "auto",
            "& .MuiTableCell-head": {
              backgroundColor: "#f8f9fa",
              fontWeight: 700,
              fontSize: isVerySmall ? "14px" : isMobile ? "16px" : "18px",
              color: "rgb(33, 61, 112)",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              borderBottom: "2px solid #e0e0e0",
              position: "sticky",
              top: 0,
              zIndex: 10,
              height: isMobile ? "44px" : "48px",
              padding: isMobile ? "6px 12px" : "8px 16px",
            },
            "& .MuiTableCell-body": {
              fontSize: isVerySmall ? "12px" : isMobile ? "14px" : "16px",
              color: "#333",
              borderBottom: "1px solid #f0f0f0",
              padding: isMobile ? "6px 12px" : "8px 16px",
              height: isMobile ? "48px" : "52px",
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
                <TableCell
                  align="left"
                  sx={{ width: isVerySmall ? "40px" : "60px" }}>
                  ID
                </TableCell>
                <TableCell sx={{ width: isMobile ? "120px" : "500px" }}>
                  NAME
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ width: isVerySmall ? "60px" : "100px" }}>
                  CODE
                </TableCell>
                {!isVerySmall && (
                  <TableCell sx={{ width: isMobile ? "100px" : "180px" }}>
                    COMPANY
                  </TableCell>
                )}
                {!isMobile && (
                  <TableCell sx={{ width: "500px" }}>BUSINESS UNIT</TableCell>
                )}
                {!isMobile && (
                  <TableCell sx={{ width: "500px" }}>DEPARTMENT</TableCell>
                )}
                {!isMobile && !isTablet && (
                  <TableCell sx={{ width: "140px" }}>UNIT</TableCell>
                )}
                {!isMobile && !isTablet && (
                  <TableCell sx={{ width: "140px" }}>SUB UNIT</TableCell>
                )}
                {!isMobile && !isTablet && (
                  <TableCell sx={{ width: "140px" }}>LOCATION</TableCell>
                )}
                <TableCell sx={{ width: isMobile ? "80px" : "500px" }}>
                  {isMobile ? "MODIFIED" : "LAST MODIFIED"}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading || isFetching ? (
                <TableRow>
                  <TableCell
                    colSpan={isVerySmall ? 4 : isMobile ? 5 : isTablet ? 7 : 10}
                    align="center"
                    sx={{ py: 4 }}>
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
                        width: isMobile ? "120px" : "220px",
                        minWidth: isMobile ? "100px" : "180px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        fontWeight: 600,
                      }}>
                      {oneRdf.name}
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        fontFamily: "monospace",
                        fontSize: isVerySmall ? "10px" : "12px",
                      }}>
                      {oneRdf.code}
                    </TableCell>
                    {!isVerySmall && (
                      <TableCell
                        sx={{
                          width: isMobile ? "100px" : "220px",
                          minWidth: isMobile ? "80px" : "180px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}>
                        {oneRdf.company_name || "-"}
                      </TableCell>
                    )}
                    {!isMobile && (
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
                    )}
                    {!isMobile && (
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
                    )}
                    {!isMobile && !isTablet && (
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
                    )}
                    {!isMobile && !isTablet && (
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
                    )}
                    {!isMobile && !isTablet && (
                      <TableCell>{oneRdf.location_name || "-"}</TableCell>
                    )}
                    <TableCell
                      sx={{
                        width: isMobile ? "80px" : "220px",
                        minWidth: isMobile ? "60px" : "180px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}>
                      {oneRdf.updated_at
                        ? dayjs(oneRdf.updated_at).format(
                            isMobile ? "MMM D" : "MMM D, YYYY"
                          )
                        : "-"}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={isVerySmall ? 4 : isMobile ? 5 : isTablet ? 7 : 10}
                    align="center"
                    sx={{
                      py: 8,
                      borderBottom: "none",
                      color: "#666",
                      fontSize: isMobile ? "14px" : "16px",
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

        <Box
          sx={{
            borderTop: "1px solid #e0e0e0",
            backgroundColor: "#f8f9fa",
            flexShrink: 0,
            "& .MuiTablePagination-root": {
              color: "#666",
              "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
                {
                  fontSize: isMobile ? "12px" : "14px",
                  fontWeight: 500,
                },
              "& .MuiTablePagination-select": {
                fontSize: isMobile ? "12px" : "14px",
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
                paddingLeft: isMobile ? "12px" : "24px",
                paddingRight: isMobile ? "12px" : "24px",
              },
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default OneRdf;
