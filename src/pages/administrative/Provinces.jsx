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

import { useGetProvincesQuery } from "../../features/api/masterlist/onerdfApi";
import {
  useGetShowProvincesQuery,
  usePostProvincesMutation,
} from "../../features/api/administrative/provincesApi";

const Provinces = () => {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const [isSearching, setIsSearching] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedMunicipalities, setSelectedMunicipalities] = useState([]);

  const status = showArchived ? "inactive" : "active";

  const { data: onerdfData, isFetching: onerdfFetching } =
    useGetProvincesQuery();

  const {
    data: backendData,
    refetch: refetchBackend,
    isFetching: backendFetching,
  } = useGetShowProvincesQuery(
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

  const [postProvinces, { isLoading: syncing }] = usePostProvincesMutation();

  const provinces = useMemo(
    () => backendData?.result?.data || [],
    [backendData]
  );

  const onSync = async () => {
    try {
      const response = await postProvinces({ ...onerdfData });

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

  const handleOpenDialog = (municipalities) => {
    setSelectedMunicipalities(municipalities || []);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  return (
    <>
      <div className="header-container">
        <Typography className="header">PROVINCES</Typography>
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
                <TableCell className="table-header">PROVINCE</TableCell>
                <TableCell className="table-status">MUNICIPALITIES</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {onerdfFetching || backendFetching || isSearching ? (
                <TableRow>
                  <TableCell colSpan={4}>
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : provinces.length > 0 ? (
                provinces.map((province) => (
                  <TableRow key={province.id}>
                    <TableCell className="table-cell-id">
                      {province.id}
                    </TableCell>
                    <TableCell className="table-cell-id">
                      {province.psgc_id}
                    </TableCell>
                    <TableCell className="table-cell">
                      {province.name}
                    </TableCell>
                    <TableCell className="table-status2">
                      <Tooltip title="View Municipalities">
                        <IconButton
                          onClick={() =>
                            handleOpenDialog(province.cities_and_municipalities)
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
                  <TableCell colSpan={4} align="center">
                    <img
                      src={NoDataGIF}
                      alt="No Data"
                      style={{ width: "300px" }}
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
          onPageChange={(e, newPage) => setPage(newPage + 1)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(1);
          }}
        />
      </Paper>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth>
        <DialogTitle style={{ backgroundColor: "#E9F6FF" }}>
          <Typography
            variant="h6"
            style={{
              fontWeight: "bold",
              fontFamily: "'Helvetica Neue', Arial, sans-serif",
            }}>
            Municipalities in the Province
          </Typography>
        </DialogTitle>

        <DialogContent style={{ backgroundColor: "white" }}>
          <List>
            {selectedMunicipalities.length > 0 ? (
              selectedMunicipalities.map((municipality, index) => (
                <ListItem
                  key={index}
                  style={{ borderBottom: "1px solid #ccc" }}>
                  <ListItemText
                    primary={municipality.name}
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
                <ListItemText primary="No municipalities found" />
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

export default Provinces;
