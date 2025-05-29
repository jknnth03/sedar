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
  Link,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import ArchiveIcon from "@mui/icons-material/Archive";
import NoDataGIF from "../../assets/no-data.gif";
import { useSnackbar } from "notistack";
import {
  useGetFilesQuery,
  useDeleteFileMutation,
} from "../../features/api/employee/filesempApi";
import "../../pages/GeneralStyle.scss";

const Files = () => {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [menuAnchor, setMenuAnchor] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const {
    data: apiResponse,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetFilesQuery({
    page,
    per_page: rowsPerPage,
    status: "active",
  });

  const [archiveFile] = useDeleteFileMutation();

  const { fileList, totalCount } = useMemo(() => {
    const result = apiResponse?.result;
    const data = result?.data || [];
    return {
      fileList: data,
      totalCount: result?.total_count || data.length,
    };
  }, [apiResponse]);

  const handleMenuOpen = (event, fileId) => {
    setMenuAnchor({ [fileId]: event.currentTarget });
  };

  const handleMenuClose = (fileId) => {
    setMenuAnchor((prev) => {
      const { [fileId]: _, ...rest } = prev;
      return rest;
    });
  };

  const handleEditClick = (file) => {
    setSelectedFile(file);
    setModalOpen(true);
    handleMenuClose(file.id);
  };

  const handleArchive = async (file) => {
    try {
      await archiveFile(file.id).unwrap();
      enqueueSnackbar("File archived successfully", { variant: "success" });
      refetch();
    } catch (err) {
      enqueueSnackbar("Failed to archive file", { variant: "error" });
    } finally {
      handleMenuClose(file.id);
    }
  };

  return (
    <>
      <Paper className="container">
        <div className="table-controls"></div>

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
                <TableCell className="table-header">ID</TableCell>
                <TableCell className="table-header">EMPLOYEE NAME</TableCell>
                <TableCell className="table-header">FILE TYPE</TableCell>
                <TableCell className="table-header">CABINET</TableCell>
                <TableCell className="table-header">DESCRIPTION</TableCell>
                <TableCell className="table-header">ATTACHMENT</TableCell>
                <TableCell className="table-header">STATUS</TableCell>
                <TableCell className="table-header">ACTIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading || isFetching ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography color="error">
                      Error: {error?.data?.message || "Failed to load data"}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : fileList.length > 0 ? (
                fileList.map((file) => (
                  <TableRow key={file.id}>
                    <TableCell>{file.id}</TableCell>
                    <TableCell className="table-cell">
                      {file.employee?.full_name || "—"}
                    </TableCell>
                    <TableCell className="table-cell">
                      {file.file_type?.name || "—"}
                    </TableCell>
                    <TableCell className="table-cell">
                      {file.file_cabinet?.name || "—"}
                    </TableCell>
                    <TableCell className="table-cell">
                      {file.file_description || "—"}
                    </TableCell>
                    <TableCell className="table-cell">
                      {file.file_attachment ? (
                        <Link
                          href={`${import.meta.env.VITE_API_BASE_URL}/${
                            file.file_attachment
                          }`}
                          target="_blank"
                          rel="noopener noreferrer"
                          underline="hover">
                          View File
                        </Link>
                      ) : (
                        "No file"
                      )}
                    </TableCell>
                    <TableCell className="table-cell">
                      <Chip label="Active" color="success" size="small" />
                    </TableCell>
                    <TableCell className="table-cell">
                      <IconButton onClick={(e) => handleMenuOpen(e, file.id)}>
                        <MoreVertIcon />
                      </IconButton>
                      <Menu
                        anchorEl={menuAnchor[file.id]}
                        open={Boolean(menuAnchor[file.id])}
                        onClose={() => handleMenuClose(file.id)}>
                        <MenuItem onClick={() => handleEditClick(file)}>
                          <EditIcon fontSize="small" sx={{ mr: 1 }} /> Edit
                        </MenuItem>
                        <MenuItem onClick={() => handleArchive(file)}>
                          <ArchiveIcon fontSize="small" sx={{ mr: 1 }} />{" "}
                          Archive
                        </MenuItem>
                      </Menu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <img src={NoDataGIF} alt="No data" style={{ width: 150 }} />
                    <Typography variant="body2">
                      No active files found.
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

      {/* <FilesModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        selectedData={selectedFile}
        refetch={refetch}
      /> */}
    </>
  );
};

export default Files;
