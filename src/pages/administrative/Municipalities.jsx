import React, { useState, useMemo } from "react";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import CircularProgress from "@mui/material/CircularProgress";
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

import { useGetCitiesQuery } from "../../features/api/masterlist/onerdfApi";
import {
  useGetShowMunicipalitiesQuery,
  usePostMunicipalitiesMutation,
} from "../../features/api/administrative/municipalitiesApi";

const Municipalities = () => {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const { enqueueSnackbar } = useSnackbar();
  const [isSearching, setIsSearching] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDialog1, setOpenDialog1] = useState(false);
  const [selectedMunicipalityDetails, setSelectedMunicipalityDetails] =
    useState({});
  const [selectedSubMunicipalityDetails, setSelectedSubMunicipalityDetails] =
    useState({});
  const [showArchived, setShowArchived] = useState(false);

  const status = showArchived ? "inactive" : "active";

  // Fetch OneRDF data for syncing (similar to provinces)
  const { data: onerdfData, isFetching: onerdfFetching } = useGetCitiesQuery();

  // Fetching backend municipalities data for display
  const {
    data: municipalitiesData,
    refetch: refetchMunicipalities,
    isFetching: fetchingMunicipalities,
  } = useGetShowMunicipalitiesQuery(
    { page, per_page: rowsPerPage, search: searchQuery, status },
    {
      refetchOnMountOrArgChange: true,
      onQueryStarted: () => setIsSearching(true),
      onSettled: () => setIsSearching(false),
    }
  );

  // Mutation for syncing municipalities
  const [postMunicipalities, { isLoading: syncing }] =
    usePostMunicipalitiesMutation();

  const municipalities = useMemo(() => {
    console.log("Municipalities Data:", municipalitiesData);
    return municipalitiesData?.result?.data || [];
  }, [municipalitiesData]);

  const onSync = async () => {
    try {
      console.log("Starting data sync...");
      console.log("OneRDF Data to sync:", onerdfData);

      // Send OneRDF data directly to backend (like provinces)
      const response = await postMunicipalities({ ...onerdfData });

      console.log("Sync Response:", response);

      if (response.error) {
        enqueueSnackbar(
          `Sync failed: ${response.error?.data?.message || "Unknown error"}`,
          { variant: "error" }
        );
      } else {
        enqueueSnackbar("Successfully synced!", { variant: "success" });
        console.log("Sync successful. Refetching data...");
        refetchMunicipalities();
      }
    } catch (error) {
      console.error("An error occurred during sync:", error);
      enqueueSnackbar("An error occurred while syncing!", { variant: "error" });
    }
  };

  const handleOpenDialog = (municipalityDetails) => {
    setSelectedMunicipalityDetails(municipalityDetails);
    setOpenDialog(true);
  };

  const handleOpenDialog1 = (municipalityDetails) => {
    setSelectedSubMunicipalityDetails(municipalityDetails);
    setOpenDialog1(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleCloseDialog1 = () => {
    setOpenDialog1(false);
  };

  return (
    <>
      <div className="header-container">
        <Typography className="header">MUNICIPALITIES</Typography>
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
                <TableCell className="table-header">MUNICIPALITIES</TableCell>
                <TableCell className="table-status">
                  SUB-MUNICIPALITIES
                </TableCell>
                <TableCell className="table-status">BARANGAY</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {onerdfFetching || fetchingMunicipalities || isSearching ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : municipalities.length > 0 ? (
                municipalities.map((municipality) => (
                  <TableRow key={municipality.id}>
                    <TableCell className="table-cell-id">
                      {municipality.id}
                    </TableCell>
                    <TableCell className="table-cell-id">
                      {municipality.psgc_id}
                    </TableCell>
                    <TableCell className="table-cell2">
                      {municipality.name}
                    </TableCell>
                    <TableCell className="table-status2">
                      <Tooltip title="View Sub-municipalities">
                        <IconButton
                          onClick={() => handleOpenDialog1(municipality)}
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
                    <TableCell className="table-status2">
                      <Tooltip title="View Barangays">
                        <IconButton
                          onClick={() => handleOpenDialog(municipality)}
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
                  <TableCell colSpan={5} align="center">
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
          count={municipalitiesData?.result?.total || 0}
          rowsPerPage={rowsPerPage}
          page={page - 1}
          onPageChange={(e, newPage) => {
            setPage(newPage + 1);
          }}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(1);
          }}
        />
      </Paper>

      <Dialog
        open={openDialog1}
        onClose={handleCloseDialog1}
        maxWidth="sm"
        fullWidth>
        <DialogTitle style={{ backgroundColor: "#E9F6FF" }}>
          <Typography
            variant="h6"
            style={{
              fontWeight: "bold",
              fontFamily: "'Helvetica Neue', Arial, sans-serif",
            }}>
            SUB MUNICIPALITY
          </Typography>
        </DialogTitle>
        <DialogContent style={{ backgroundColor: "white" }}>
          <List>
            {selectedSubMunicipalityDetails?.sub_municipalities?.length > 0 ? (
              selectedSubMunicipalityDetails.sub_municipalities.map(
                (subMunicipality) => (
                  <ListItem
                    key={subMunicipality.id}
                    style={{ borderBottom: "1px solid #ccc" }}>
                    <ListItemText
                      primary={subMunicipality.name}
                      primaryTypographyProps={{
                        style: {
                          fontFamily: "'Helvetica Neue', Arial, sans-serif",
                        },
                      }}
                    />
                  </ListItem>
                )
              )
            ) : (
              <ListItem>
                <ListItemText primary="No Sub-Municipalities Available" />
              </ListItem>
            )}
          </List>
        </DialogContent>
        <DialogActions style={{ backgroundColor: "white" }}>
          <Button
            variant="contained"
            onClick={handleCloseDialog1}
            color="primary"
            style={{
              fontFamily: "'Helvetica Neue', Arial, sans-serif",
            }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

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
            Barangay
          </Typography>
        </DialogTitle>
        <DialogContent style={{ backgroundColor: "white" }}>
          <List>
            {selectedMunicipalityDetails?.barangays?.length > 0 ? (
              selectedMunicipalityDetails.barangays.map((barangay) => (
                <ListItem
                  key={barangay.id}
                  style={{ borderBottom: "1px solid #ccc" }}>
                  <ListItemText
                    primary={barangay.name}
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
                <ListItemText primary="No Barangays Available" />
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

export default Municipalities;
