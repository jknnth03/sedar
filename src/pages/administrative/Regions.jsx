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
  IconButton,
} from "@mui/material";

import { useGetRegionsQuery } from "../../features/api/masterlist/onerdfApi";
import {
  useGetShowRegionsQuery,
  usePostRegionsMutation,
} from "../../features/api/administrative/regionsApi";
import { CONSTANT } from "../../config";

const Regions = () => {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const [isSearching, setIsSearching] = useState(false);

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProvinces, setSelectedProvinces] = useState([]);
  console.log(selectedProvinces, setSelectedProvinces);
  const status = showArchived ? "inactive" : "active";

  const { data: onerdfData, isFetching: onerdfFetching } = useGetRegionsQuery();

  const {
    data: backendData,
    refetch: refetchBackend,
    isFetching: backendFetching,
  } = useGetShowRegionsQuery(
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

  const [postRegions, { isLoading: syncing }] = usePostRegionsMutation();

  const regions = useMemo(() => backendData?.result?.data || [], [backendData]);

  const onSync = async () => {
    try {
      const response = await postRegions({ ...onerdfData });

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

  // Dialog open and close handlers
  const handleOpenDialog = (provinces) => {
    setSelectedProvinces(provinces || []);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  return (
    <>
      <div className="header-container">
        <Typography className="header">REGIONS</Typography>
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
                <TableCell className="table-header">REGION</TableCell>
                <TableCell className="table-status">PROVINCES</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {onerdfFetching || backendFetching || isSearching ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="table-cell"
                    style={{ textAlign: "center" }}>
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : regions.length > 0 ? (
                regions.map((region) => (
                  <TableRow key={region.id}>
                    <TableCell className="table-cell-id">{region.id}</TableCell>
                    <TableCell className="table-cell-id">
                      {region.psgc_id}
                    </TableCell>
                    <TableCell className="table-cell2">{region.name}</TableCell>
                    <TableCell className="table-status2">
                      <Tooltip title="View Provinces">
                        <IconButton
                          onClick={() =>
                            handleOpenDialog(region.provinces || [])
                          }
                          sx={{
                            backgroundColor: "transparent",
                            padding: "8px",
                            "&:hover": {
                              backgroundColor: "#e0e0e0",
                              borderRadius: "50%",
                            },
                          }}>
                          <VisibilityIcon sx={{ color: "rgb(33, 61, 112)" }} />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    align="center"
                    borderBottom="none"
                    className="table-cell">
                    {CONSTANT.BUTTONS.NODATA.icon}
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
              fontFamily: "'Helvetica Neue', Arial, sans-serif",
            }}>
            Provinces
          </Typography>
        </DialogTitle>
        <DialogContent style={{ backgroundColor: "white" }}>
          <List>
            {selectedProvinces.length > 0 ? (
              selectedProvinces.map((province, index) => (
                <ListItem
                  key={province.id || index}
                  style={{
                    borderBottom: "1px solid #ccc",
                    fontFamily: "'Helvetica Neue', Arial, sans-serif",
                  }}>
                  <ListItemText
                    primary={province.name}
                    primaryTypographyProps={{
                      style: {
                        fontFamily: "'Helvetica Neue', Arial, sans-serif",
                      },
                    }}
                  />
                </ListItem>
              ))
            ) : (
              <ListItem>
                <ListItemText primary="No provinces found" />
              </ListItem>
            )}
          </List>
        </DialogContent>
        <DialogActions style={{ backgroundColor: "white" }}>
          <Button
            variant="contained"
            onClick={handleCloseDialog}
            color="primary"
            style={{
              fontFamily: "'Helvetica Neue', Arial, sans-serif",
            }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Regions;
