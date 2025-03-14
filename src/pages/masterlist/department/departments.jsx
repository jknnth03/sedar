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
import { useGetDepartmentsQuery } from "../../../../features/api/ymirApi";
import {
  useGetShowDepartmentsQuery,
  usePostDepartmentsMutation,
} from "../../../../features/api/departments";
import { SearchBar, SyncButton } from "../../masterlistComponents";
import NoDataGIF from "../../../assets/no-data.gif";
import "../../masterlist/GeneralStyle_Table.scss";

const Departments = () => {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const [isSearching, setIsSearching] = useState(false);

  const status = showArchived ? "inactive" : "active";

  const { data: ymirData, isFetching: ymirFetching } = useGetDepartmentsQuery();
  const {
    data: backendData,
    refetch: refetchBackend,
    isFetching: backendFetching,
  } = useGetShowDepartmentsQuery(
    {
      page,
      per_page: rowsPerPage,
      search: searchQuery,
      status,
    },
    {
      refetchOnMountOrArgChange: true,
      onQueryStarted: () => setIsSearching(true),
      onSettled: () => setIsSearching(false),
    }
  );

  const [postDepartments, { isLoading: syncing }] =
    usePostDepartmentsMutation();

  const departments = useMemo(
    () => backendData?.result?.data || [],
    [backendData]
  );

  const onSync = async () => {
    try {
      const response = await postDepartments({ ...ymirData });

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
        <Typography className="header">Departments</Typography>
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
                <TableCell className="table-header" align="center">
                  ID
                </TableCell>
                <TableCell className="table-header" align="center">
                  Code
                </TableCell>
                <TableCell className="table-header" align="center">
                  Department
                </TableCell>
                <TableCell className="table-header" align="center">
                  Sub-Unit
                </TableCell>
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
              ) : departments.length > 0 ? (
                departments.map((dept) => (
                  <TableRow key={dept.id}>
                    <TableCell className="table-cell">{dept.id}</TableCell>
                    <TableCell className="table-cell">{dept.code}</TableCell>
                    <TableCell className="table-cell">{dept.name}</TableCell>
                    <TableCell className="table-cell">
                      {dept.business_unit.name}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={3}
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

export default Departments;
