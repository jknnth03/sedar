import React, { useState, useEffect, useMemo } from "react";
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
import { useGetSubunitsQuery } from "../../../features/api/masterlist/ymirApi";
import { SearchBar, SyncButton } from "../masterlistComponents";
import NoDataGIF from "../../../assets/no-data.gif";
import "../../GeneralStyle.scss";
import {
  useGetShowSubunitsQuery,
  usePostSubunitsMutation,
} from "../../../features/api/masterlist/subunitsApi";
import useDebounce from "../../../hooks/useDebounce";

const Subunits = () => {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchInput, setSearchInput] = useState("");
  const debounceValue = useDebounce(searchInput, 500);
  const [showArchived, setShowArchived] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const [isSearching, setIsSearching] = useState(false);

  const status = showArchived ? "inactive" : "active";

  const { data: ymirData, isFetching: ymirFetching } = useGetSubunitsQuery();
  const {
    data: backendData,
    refetch: refetchBackend,
    isFetching: backendFetching,
  } = useGetShowSubunitsQuery(
    {
      page,
      per_page: rowsPerPage,
      search: debounceValue,
      status,
    },
    {
      refetchOnMountOrArgChange: true,
      onQueryStarted: () => setIsSearching(true),
      onSettled: () => setIsSearching(false),
    }
  );

  const [postSubunits, { isLoading: syncing }] = usePostSubunitsMutation();

  const subunits = useMemo(
    () => backendData?.result?.data || [],
    [backendData]
  );

  const onSync = async () => {
    try {
      const response = await postSubunits({ ...ymirData });

      if (response.error) {
        enqueueSnackbar(`Sync failed: ${response.error.data?.message}`, {
          variant: "error",
        });
      } else {
        enqueueSnackbar("Successfully synced!", { variant: "success" });
        refetchBackend();
      }
    } catch (error) {
      enqueueSnackbar("An error occurred while syncing!", { variant: "error" });
    }
  };

  return (
    <>
      <div className="header-container">
        <Typography className="header">SUB UNITS</Typography>
        <SyncButton onSync={onSync} isFetching={syncing} />
      </div>

      <Paper className="container">
        <div className="table-controls">
          <SearchBar
            searchQuery={searchInput}
            setSearchQuery={setSearchInput}
            showArchived={showArchived}
            setShowArchived={setShowArchived}
          />
        </div>

        <TableContainer className="table-container">
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell className="table-id">ID</TableCell>
                <TableCell className="table-id3">CODE</TableCell>
                <TableCell className="table-header">SUB UNIT</TableCell>
                <TableCell className="table-header">UNIT</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ymirFetching || backendFetching || isSearching ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="table-cell"
                    style={{ textAlign: "center" }}>
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : subunits.length > 0 ? (
                subunits.map((subunit) => (
                  <TableRow key={subunit.id}>
                    <TableCell className="table-cell-id">
                      {subunit.id}
                    </TableCell>
                    <TableCell className="table-cell-id">
                      {subunit.code}
                    </TableCell>
                    <TableCell className="table-cell">{subunit.name}</TableCell>
                    <TableCell className="table-cell">
                      {subunit.unit?.name}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="table-cell"
                    style={{ textAlign: "center" }}>
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
          count={backendData?.result?.total || 0}
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

export default Subunits;
