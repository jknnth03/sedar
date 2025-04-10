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

import { SearchBar, SyncButton } from "../masterlistComponents";
import NoDataGIF from "../../../assets/no-data.gif";
import "../../GeneralStyle.scss";
import VisibilityIcon from "@mui/icons-material/Visibility";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  Tooltip,
} from "@mui/material";
import { useGetLocationsQuery } from "../../../features/api/masterlist/ymirApi";
import {
  useGetShowLocationsQuery,
  usePostLocationsMutation,
} from "../../../features/api/masterlist/locationsApi";

const Locations = () => {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const [isSearching, setIsSearching] = useState(false);

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedSubUnits, setSelectedSubUnits] = useState([]);

  const status = showArchived ? "inactive" : "active";

  const { data: ymirData, isFetching: ymirFetching } = useGetLocationsQuery();
  const {
    data: backendData,
    refetch: refetchBackend,
    isFetching: backendFetching,
  } = useGetShowLocationsQuery(
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

  const [postLocations, { isLoading: syncing }] = usePostLocationsMutation();

  const locations = useMemo(
    () => backendData?.result?.data || [],
    [backendData]
  );

  const onSync = async () => {
    try {
      const response = await postLocations({ ...ymirData });

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

  const handleOpenDialog = (subUnits) => {
    setSelectedSubUnits(subUnits || []);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  return (
    <>
      <div className="header-container">
        <Typography className="header">Locations</Typography>
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
                  Location
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    verticalAlign: "middle",
                    fontWeight: "bold",
                    fontSize: "1rem",
                  }}>
                  Sub-units
                </TableCell>
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
              ) : locations.length > 0 ? (
                locations.map((location) => (
                  <TableRow key={location.id}>
                    <TableCell className="table-cell">{location.id}</TableCell>
                    <TableCell className="table-cell">
                      {location.code}
                    </TableCell>
                    <TableCell className="table-cell">
                      {location.name}
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="View Sub-units">
                        <VisibilityIcon
                          className="EyeIcon"
                          onClick={() =>
                            handleOpenDialog(location.sub_units || [])
                          }
                        />
                      </Tooltip>
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
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth>
        <DialogTitle style={{ backgroundColor: "rgb(233, 246, 255)" }}>
          <Typography
            variant="h6"
            style={{
              fontWeight: "bold",
              fontFamily: "'Helvetica Neue', Arial, sans-serif", // Apply Helvetica Neue font
            }}>
            Sub-units
          </Typography>
        </DialogTitle>
        <DialogContent style={{ backgroundColor: "white" }}>
          <List>
            {selectedSubUnits.map((subUnit, index) => (
              <ListItem
                key={subUnit.id || index}
                style={{
                  borderBottom: "1px solid #ccc",
                  fontFamily: "'Helvetica Neue', Arial, sans-serif", // Apply Helvetica Neue font
                }}>
                <ListItemText
                  primary={subUnit.name}
                  primaryTypographyProps={{
                    style: {
                      fontFamily: "'Helvetica Neue', Arial, sans-serif", // Apply Helvetica Neue font
                    },
                  }}
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions style={{ backgroundColor: "white" }}>
          <Button
            variant="contained"
            onClick={handleCloseDialog}
            color="primary"
            style={{
              fontFamily: "'Helvetica Neue', Arial, sans-serif", // Apply Helvetica Neue font
            }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Locations;
