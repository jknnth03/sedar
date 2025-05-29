import React, { useState, useMemo } from "react";
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
  IconButton,
  Menu,
  MenuItem,
  Chip,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import NoDataGIF from "../../assets/no-data.gif";
import { useSnackbar } from "notistack";
import "../../pages/masterlist/positions/positions.scss";
import { useGetAddressQuery } from "../../features/api/employee/addressApi";
import AddressModal from "../../components/modal/employee/AddressModal";
import "../../pages/GeneralStyle.scss";

const Address = () => {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [menuAnchor, setMenuAnchor] = useState({});
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const {
    data: apiResponse,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetAddressQuery({
    page,
    per_page: rowsPerPage,
    status: "active",
  });

  const { addressList, totalCount } = useMemo(() => {
    const result = apiResponse?.result;
    const data = result?.data || [];

    return {
      addressList: data,
      totalCount: result?.total || data.length,
    };
  }, [apiResponse]);

  const handleMenuOpen = (event, addressId) => {
    setMenuAnchor({ [addressId]: event.currentTarget });
  };

  const handleMenuClose = (addressId) => {
    setMenuAnchor((prev) => {
      const { [addressId]: _, ...rest } = prev;
      return rest;
    });
  };

  const handleEditClick = (address) => {
    setSelectedAddress(address);
    setModalOpen(true);
    handleMenuClose(address.id);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedAddress(null);
  };

  return (
    <>
      <Paper className="container">
        {/* Aligned with General Info layout */}
        <div className="table-controls" />

        <TableContainer
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            height: "calc(100vh - 18rem)",
            width: "calc(100vw - 20rem)",
            overflow: "auto",
            zIndex: 0,
            margin: "0 auto",
          }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                {[
                  "ID",
                  "Employee",
                  "House Number",
                  "Street",
                  "Barangay",
                  "City",
                  "Province",
                  "Zip Code",
                  "Country",
                  "Actions",
                ].map((header) => (
                  <TableCell key={header} align="left" className="table-header">
                    {header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading || isFetching ? (
                <TableRow>
                  <TableCell colSpan={12} align="center">
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={12} align="center">
                    <Typography color="error">
                      Error: {error?.data?.message || "Failed to load data"}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : addressList.length > 0 ? (
                addressList.map((address) => {
                  const statusLabel = address.deleted_at
                    ? "Inactive"
                    : "Active";
                  const statusColor = address.deleted_at ? "error" : "success";

                  return (
                    <TableRow key={address.id}>
                      <TableCell className="table-cell">{address.id}</TableCell>
                      <TableCell className="table-cell">
                        {address.employee?.full_name || "—"}
                      </TableCell>
                      <TableCell className="table-cell">
                        {address.house_number || "—"}
                      </TableCell>
                      <TableCell className="table-cell">
                        {address.street || "—"}
                      </TableCell>
                      <TableCell className="table-cell">
                        {address.barangay?.name || address.barangay || "—"}
                      </TableCell>
                      <TableCell className="table-cell">
                        {address.city_municipality?.name || address.city || "—"}
                      </TableCell>
                      <TableCell className="table-cell">
                        {address.province?.name || address.province || "—"}
                      </TableCell>
                      <TableCell className="table-cell">
                        {address.zip_code || "—"}
                      </TableCell>
                      <TableCell className="table-cell">
                        {address.country || "Philippines"}
                      </TableCell>

                      <TableCell className="table-cell">
                        <IconButton
                          onClick={(e) => handleMenuOpen(e, address.id)}>
                          <MoreVertIcon />
                        </IconButton>
                        <Menu
                          anchorEl={menuAnchor[address.id]}
                          open={Boolean(menuAnchor[address.id])}
                          onClose={() => handleMenuClose(address.id)}>
                          <MenuItem onClick={() => handleEditClick(address)}>
                            <EditIcon fontSize="small" sx={{ mr: 1 }} /> Edit
                          </MenuItem>
                        </Menu>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={11} align="center">
                    <img src={NoDataGIF} alt="No data" style={{ width: 150 }} />
                    <Typography variant="body2">
                      No active addresses found.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page - 1}
          onPageChange={(_, newPage) => setPage(newPage + 1)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(1);
          }}
        />
      </Paper>

      <AddressModal
        open={modalOpen}
        handleClose={handleModalClose}
        refetch={refetch}
        showArchived={false}
        selectedAddress={selectedAddress}
      />
    </>
  );
};

export default Address;
