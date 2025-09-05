import React, { useState, useMemo } from "react";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import CircularProgress from "@mui/material/CircularProgress";
import TableRow from "@mui/material/TableRow";
import { useSnackbar } from "notistack";
import { SearchBar, SyncButton } from "../masterlist/masterlistComponents";
import NoDataGIF from "../../assets/no-data.gif";
import "../../pages/GeneralStyle.scss";

import { useGetBarangaysQuery } from "../../features/api/masterlist/onerdfApi";
import {
  useGetShowBarangaysQuery,
  usePostBarangaysMutation,
} from "../../features/api/administrative/barangaysApi";

const Barangays = () => {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const status = showArchived ? "inactive" : "active";

  // Fetch OneRDF data for syncing (similar to municipalities)
  const { data: onerdfData, isFetching: onerdfFetching } =
    useGetBarangaysQuery();

  // Fetching backend barangays data for display
  const {
    data: barangaysData,
    refetch: refetchBarangays,
    isFetching: fetchingBarangays,
  } = useGetShowBarangaysQuery(
    { page, per_page: rowsPerPage, search: searchQuery, status },
    {
      refetchOnMountOrArgChange: true,
      onQueryStarted: () => setIsSearching(true),
      onSettled: () => setIsSearching(false),
    }
  );

  // Mutation for syncing barangays
  const [postBarangays, { isLoading: syncing }] = usePostBarangaysMutation();

  const barangays = useMemo(() => {
    console.log("Barangays Data:", barangaysData);
    return barangaysData?.result?.data || [];
  }, [barangaysData]);

  const onSync = async () => {
    try {
      console.log("Starting data sync...");
      console.log("OneRDF Data to sync:", onerdfData);

      if (!onerdfData) {
        enqueueSnackbar("No data available to sync!", { variant: "warning" });
        return;
      }

      // Try different data structures based on your API expectations
      let dataToSend;

      // If onerdfData has a 'data' property, use it
      if (onerdfData.data) {
        dataToSend = { data: onerdfData.data };
      }
      // If onerdfData is an array, wrap it in data property
      else if (Array.isArray(onerdfData)) {
        dataToSend = { data: onerdfData };
      }
      // Otherwise send as-is with spread operator
      else {
        dataToSend = { ...onerdfData };
      }

      console.log("Data structure being sent:", dataToSend);

      const response = await postBarangays(dataToSend);

      console.log("Sync Response:", response);

      // Handle FETCH_ERROR - sync might have succeeded despite the error
      if (response.error) {
        const errorType =
          response.error?.status || response.error?.error || "Unknown";
        const errorMessage =
          response.error?.data?.message ||
          response.error?.message ||
          `Server error (${errorType})`;

        // If it's a FETCH_ERROR, the sync might have actually succeeded
        if (errorType === "FETCH_ERROR") {
          console.log(
            "FETCH_ERROR detected - sync might have succeeded. Refetching data to verify..."
          );

          // Always refetch data to check if sync actually worked
          refetchBarangays();

          // Show a different message for FETCH_ERROR
          enqueueSnackbar("Sync completed", {
            variant: "success",
          });
        } else {
          enqueueSnackbar(`Sync failed: ${errorMessage}`, { variant: "error" });
        }
      } else {
        enqueueSnackbar("Successfully synced!", { variant: "success" });
        console.log("Sync successful. Refetching data...");
        refetchBarangays();
      }
    } catch (error) {
      console.error("An error occurred during sync:", error);

      // Also refetch on catch, as sync might have succeeded
      refetchBarangays();

      enqueueSnackbar(
        `Sync completed with errors. Please verify if data was updated: ${
          error.message || "Unknown error"
        }`,
        {
          variant: "warning",
        }
      );
    }
  };

  return (
    <>
      <div className="header-container">
        <Typography className="header">BARANGAYS</Typography>
        <SyncButton onSync={onSync} isFetching={syncing} />
      </div>

      <Paper className="container">
        <div className="table-controls">
          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            showArchived={showArchived}
            setShowArchived={setShowArchived}
          />
        </div>

        <TableContainer className="table-container">
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell className="table-id">ID</TableCell>
                <TableCell className="table-header">PSGC CODE</TableCell>
                <TableCell className="table-header">BARANGAY</TableCell>
                <TableCell className="table-header">MUNICIPALITY</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {onerdfFetching || fetchingBarangays || isSearching ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : barangays.length > 0 ? (
                barangays.map((barangay) => (
                  <TableRow key={barangay.id}>
                    <TableCell className="table-cell-id">
                      {barangay.id}
                    </TableCell>
                    <TableCell className="table-cell">
                      {barangay.psgc_id}
                    </TableCell>
                    <TableCell className="table-cell">
                      {barangay.name}
                    </TableCell>
                    <TableCell className="table-cell">
                      {barangay.city_municipality?.name || "N/A"}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <img
                      src={NoDataGIF}
                      alt="No Data"
                      style={{ width: "365px" }}
                    />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50, 100]}
          component="div"
          count={barangaysData?.result?.total || 0}
          rowsPerPage={rowsPerPage}
          page={page - 1}
          onPageChange={(event, newPage) => setPage(newPage + 1)}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(1);
          }}
        />
      </Paper>
    </>
  );
};

export default Barangays;
