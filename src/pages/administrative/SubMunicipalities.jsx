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

import {
  useGetShowSubMunicipalitiesQuery,
  usePostSubMunicipalitiesMutation,
} from "../../features/api/administrative/subMunicipalitiesApi";
import { useGetSubmunicipalitiesQuery } from "../../features/api/masterlist/onerdfApi";

const SubMunicipalities = () => {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const status = showArchived ? "inactive" : "active";

  // Fetch OneRDF data for syncing (similar to municipalities)
  const { data: onerdfData, isFetching: onerdfFetching } =
    useGetSubmunicipalitiesQuery();

  // Fetching backend sub-municipalities data for display
  const {
    data: subMunicipalitiesData,
    refetch: refetchSubMunicipalities,
    isFetching: fetchingSubMunicipalities,
  } = useGetShowSubMunicipalitiesQuery(
    { page, per_page: rowsPerPage, search: searchQuery, status },
    {
      refetchOnMountOrArgChange: true,
      onQueryStarted: () => setIsSearching(true),
      onSettled: () => setIsSearching(false),
    }
  );

  // Mutation for syncing sub-municipalities
  const [postSubMunicipalities, { isLoading: syncing }] =
    usePostSubMunicipalitiesMutation();

  const subMunicipalities = useMemo(() => {
    console.log("Sub-Municipalities Data:", subMunicipalitiesData);
    return subMunicipalitiesData?.result?.data || [];
  }, [subMunicipalitiesData]);

  const onSync = async () => {
    try {
      console.log("Starting data sync...");
      console.log("OneRDF Data to sync:", onerdfData);

      // Send OneRDF data directly to backend (like municipalities)
      const response = await postSubMunicipalities({ ...onerdfData });

      console.log("Sync Response:", response);

      if (response.error) {
        enqueueSnackbar(
          `Sync failed: ${response.error?.data?.message || "Unknown error"}`,
          { variant: "error" }
        );
      } else {
        enqueueSnackbar("Successfully synced!", { variant: "success" });
        console.log("Sync successful. Refetching data...");
        refetchSubMunicipalities();
      }
    } catch (error) {
      console.error("An error occurred during sync:", error);
      enqueueSnackbar("An error occurred while syncing!", { variant: "error" });
    }
  };

  return (
    <>
      <div className="header-container">
        <Typography className="header">SUB MUNICIPALITIES</Typography>
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
                <TableCell className="table-id2">PSGC CODE</TableCell>
                <TableCell className="table-header">SUB MUNICIPALITY</TableCell>
                <TableCell className="table-header">MUNICIPALITY</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {onerdfFetching || fetchingSubMunicipalities || isSearching ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : subMunicipalities.length > 0 ? (
                subMunicipalities.map((subMunicipality) => (
                  <TableRow key={subMunicipality.id}>
                    <TableCell className="table-cell-id">
                      {subMunicipality.id}
                    </TableCell>
                    <TableCell className="table-cell-id">
                      {subMunicipality.psgc_id}
                    </TableCell>
                    <TableCell className="table-cell">
                      {subMunicipality.name}
                    </TableCell>
                    <TableCell className="table-cell">
                      {subMunicipality.city_municipality?.name || "N/A"}
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
          count={subMunicipalitiesData?.result?.total || 0}
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

export default SubMunicipalities;
