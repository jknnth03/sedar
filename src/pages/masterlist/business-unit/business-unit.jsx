import React, { useState, useMemo, useEffect } from "react";
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
import { useGetBusinessunitsQuery } from "../../../features/api/masterlist/ymirApi";
import {
  useGetShowBusinessunitsQuery,
  usePostBusinessUnitMutation,
} from "../../../features/api/masterlist/businessunitsApi";
import { SearchBar, SyncButton } from "../masterlistComponents";
import NoDataGIF from "../../../assets/no-data.gif";
import "../../GeneralStyle.scss";
import useDebounce from "../../../hooks/useDebounce";
import { CONSTANT } from "../../../config";

const BusinessUnit = () => {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const debounceValue = useDebounce(searchQuery, 500);
  const [showArchived, setShowArchived] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const [isSearching, setIsSearching] = useState(false);

  const status = showArchived ? "inactive" : "active";

  useEffect(() => {
    setIsSearching(true);
    const handler = setTimeout(() => {
      setIsSearching(false);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  const { data: ymirData, isFetching: ymirFetching } =
    useGetBusinessunitsQuery();

  const {
    data: backendData,
    refetch: refetchBackend,
    isFetching: backendFetching,
  } = useGetShowBusinessunitsQuery(
    {
      page,
      per_page: rowsPerPage,
      search: debounceValue,
      status,
    },
    {
      refetchOnMountOrArgChange: true,
    }
  );

  const [postBusinessUnit, { isLoading: syncing }] =
    usePostBusinessUnitMutation();

  const businessUnits = useMemo(
    () => backendData?.result?.data || [],
    [backendData]
  );

  const onSync = async () => {
    try {
      const response = await postBusinessUnit({ ...ymirData });

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
        <Typography className="header">BUSINESS UNITS</Typography>
        <SyncButton
          className="sync-button"
          onSync={onSync}
          isFetching={syncing}
        />
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
                <TableCell className="table-id">CODE</TableCell>
                <TableCell className="table-id2">BUSINESS UNIT</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ymirFetching || backendFetching || isSearching ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="table-cell"
                    style={{ textAlign: "center" }}>
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : businessUnits.length > 0 ? (
                businessUnits.map((businessUnit) => (
                  <TableRow key={businessUnit.id}>
                    <TableCell className="table-cell-id">
                      {businessUnit.id}
                    </TableCell>
                    <TableCell className="table-cell-id">
                      {businessUnit.code}
                    </TableCell>
                    <TableCell className="table-cell-id">
                      {businessUnit.name}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="table-cell"
                    style={{ textAlign: "center" }}>
                    {CONSTANT.BUTTONS.NODATA.icon}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <div>
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
        </div>
      </Paper>
    </>
  );
};

export default BusinessUnit;
