import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Menu,
  MenuItem,
  Skeleton,
  useTheme,
  Chip,
  Box,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import ArchiveIcon from "@mui/icons-material/Archive";
import RestoreIcon from "@mui/icons-material/Restore";
import ShareLocationIcon from "@mui/icons-material/ShareLocation";
import HomeRepairServiceIcon from "@mui/icons-material/HomeRepairService";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import NoDataFound from "../../../pages/NoDataFound";
import { styles } from "../../forms/manpowerform/formSubmissionStyles";

const PositionsTable = ({
  positionList,
  isLoadingState,
  error,
  searchQuery,
  isMobile,
  menuAnchor,
  handleMenuOpen,
  handleMenuClose,
  handleRowClick,
  handleOpenCoaDialog,
  handleOpenRequestorsDialog,
  handleOpenToolsDialog,
  handleOpenAttachmentDialog,
  handleEditClick,
  handleArchiveRestoreClick,
  getDisplayFileName,
  renderStatusChip,
}) => {
  const theme = useTheme();

  const columns = [
    { id: "id", label: "ID", align: "left", width: styles.columnStyles.id },
    { id: "code", label: "CODE", width: styles.columnStyles.formName },
    { id: "name", label: "NAME", width: styles.columnStyles.formName },
    { id: "charging", label: "CHARGING", width: styles.columnStyles.formName },
    {
      id: "coa",
      label: "COA",
      align: "center",
      width: styles.columnStyles.status,
    },
    { id: "superior", label: "SUPERIOR", width: styles.columnStyles.formName },
    {
      id: "req",
      label: "REQ",
      align: "center",
      width: styles.columnStyles.status,
    },
    {
      id: "pay_frequency",
      label: "PAY FREQUENCY",
      width: styles.columnStyles.formName,
      hideOnMobile: true,
    },
    {
      id: "schedule",
      label: "SCHEDULE",
      width: styles.columnStyles.formName,
      hideOnMobile: true,
    },
    {
      id: "team",
      label: "TEAM",
      width: styles.columnStyles.formName,
      hideOnMobile: true,
    },
    {
      id: "tools",
      label: "TOOLS",
      align: "center",
      width: styles.columnStyles.status,
    },
    {
      id: "attachments",
      label: "ATTACHMENTS",
      width: styles.columnStyles.formName,
      hideOnMobile: true,
    },
    {
      id: "status",
      label: "STATUS",
      align: "center",
      width: styles.columnStyles.status,
    },
    {
      id: "actions",
      label: "ACTIONS",
      align: "center",
      width: styles.columnStyles.status,
    },
  ];

  const visibleColumns = isMobile
    ? columns.filter((col) => !col.hideOnMobile)
    : columns;

  const renderCell = (column, position) => {
    switch (column.id) {
      case "id":
        return position.id;

      case "code":
        return <span style={styles.cellContentStyles}>{position.code}</span>;

      case "name":
        const titleValue =
          typeof position.title === "object" && position.title !== null
            ? position.title.name || position.title.title || "—"
            : position.title || "—";
        return <span style={styles.cellContentStyles}>{titleValue}</span>;

      case "charging":
        const chargingValue =
          typeof position.charging === "object" && position.charging !== null
            ? position.charging.name || position.charging.code || "—"
            : position.charging || "—";
        return <span style={styles.cellContentStyles}>{chargingValue}</span>;

      case "coa":
        return (
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              handleOpenCoaDialog(position);
            }}
            size="small">
            <ShareLocationIcon />
          </IconButton>
        );

      case "superior":
        const superiorValue =
          typeof position.superior === "object" && position.superior !== null
            ? position.superior.name ||
              position.superior.code ||
              position.superior.full_name ||
              "—"
            : position.superior || "—";
        return <span style={styles.cellContentStyles}>{superiorValue}</span>;

      case "req":
        return (
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              handleOpenRequestorsDialog(position);
            }}
            size="small">
            <VisibilityIcon />
          </IconButton>
        );

      case "pay_frequency":
        return (
          <span style={styles.cellContentStyles}>
            {position.pay_frequency || "—"}
          </span>
        );

      case "schedule":
        const scheduleValue =
          typeof position.schedule === "object" && position.schedule !== null
            ? position.schedule.name || position.schedule.code || "—"
            : position.schedule || "—";
        return <span style={styles.cellContentStyles}>{scheduleValue}</span>;

      case "team":
        const teamValue =
          typeof position.team === "object" && position.team !== null
            ? position.team.name || position.team.code || "—"
            : position.team || "—";
        return <span style={styles.cellContentStyles}>{teamValue}</span>;

      case "tools":
        return (
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              handleOpenToolsDialog(position);
            }}
            size="small">
            <HomeRepairServiceIcon />
          </IconButton>
        );

      case "attachments":
        const fileName = getDisplayFileName(position);
        return fileName ? (
          <Box
            onClick={(e) => {
              e.stopPropagation();
              handleOpenAttachmentDialog(position);
            }}
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.5,
              cursor: "pointer",
              color: "rgb(33, 61, 112)",
              "&:hover": {
                textDecoration: "underline",
              },
            }}>
            <AttachFileIcon sx={{ fontSize: 18 }} />
            <span style={styles.cellContentStyles}>{fileName}</span>
          </Box>
        ) : (
          "—"
        );

      case "status":
        return renderStatusChip(position);

      case "actions":
        return (
          <>
            <IconButton
              onClick={(e) => handleMenuOpen(e, position)}
              size="small">
              <MoreVertIcon />
            </IconButton>
            <Menu
              anchorEl={menuAnchor[position.id]}
              open={Boolean(menuAnchor[position.id])}
              onClose={() => handleMenuClose(position.id)}
              onClick={(e) => e.stopPropagation()}>
              {!position.deleted_at && (
                <MenuItem onClick={() => handleEditClick(position)}>
                  <EditIcon fontSize="small" sx={{ mr: 1 }} />
                  Edit
                </MenuItem>
              )}
              <MenuItem onClick={(e) => handleArchiveRestoreClick(position, e)}>
                {position.deleted_at ? (
                  <>
                    <RestoreIcon fontSize="small" sx={{ mr: 1 }} />
                    Restore
                  </>
                ) : (
                  <>
                    <ArchiveIcon fontSize="small" sx={{ mr: 1 }} />
                    Archive
                  </>
                )}
              </MenuItem>
            </Menu>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <TableContainer
      sx={{
        ...styles.tableContainerStyles,
        backgroundColor: "white",
      }}>
      <Table stickyHeader sx={{ minWidth: isMobile ? 800 : 1400 }}>
        <TableHead>
          <TableRow>
            {visibleColumns.map((column) => (
              <TableCell
                key={column.id}
                align={column.align || "left"}
                sx={{
                  ...column.width,
                  borderBottom: "none",
                }}>
                {column.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>

        <TableBody>
          {isLoadingState ? (
            <>
              {[...Array(5)].map((_, index) => (
                <TableRow key={index}>
                  {visibleColumns.map((column) => (
                    <TableCell key={column.id} align={column.align || "left"}>
                      {column.align === "center" ? (
                        <Skeleton
                          animation="wave"
                          variant={
                            column.id === "status" ? "rounded" : "circular"
                          }
                          width={column.id === "status" ? 80 : 32}
                          height={column.id === "status" ? 24 : 32}
                          sx={{ margin: "0 auto" }}
                        />
                      ) : (
                        <Skeleton animation="wave" height={30} />
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </>
          ) : error ? (
            <TableRow
              sx={{
                borderBottom: "none",
                "&:hover": {
                  backgroundColor: "transparent !important",
                  cursor: "default !important",
                },
              }}>
              <TableCell
                colSpan={visibleColumns.length}
                align="center"
                sx={{
                  ...styles.noDataContainer,
                  borderBottom: "none",
                  "&:hover": {
                    backgroundColor: "transparent !important",
                  },
                }}>
                <NoDataFound
                  message="Error loading data"
                  subMessage={error.message || "Unknown error"}
                />
              </TableCell>
            </TableRow>
          ) : positionList.length > 0 ? (
            positionList.map((position) => (
              <TableRow
                key={position.id}
                onClick={() => handleRowClick(position)}
                sx={styles.tableRowHover(theme)}>
                {visibleColumns.map((column) => (
                  <TableCell
                    key={column.id}
                    align={column.align || "left"}
                    sx={
                      [
                        "code",
                        "name",
                        "charging",
                        "superior",
                        "pay_frequency",
                        "schedule",
                        "team",
                        "attachments",
                      ].includes(column.id)
                        ? styles.formNameCell
                        : undefined
                    }>
                    {renderCell(column, position)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow
              sx={{
                borderBottom: "none",
                "&:hover": {
                  backgroundColor: "transparent !important",
                  cursor: "default !important",
                },
              }}>
              <TableCell
                colSpan={visibleColumns.length}
                align="center"
                sx={{
                  ...styles.noDataContainer,
                  borderBottom: "none",
                  "&:hover": {
                    backgroundColor: "transparent !important",
                  },
                }}>
                <NoDataFound
                  message=""
                  subMessage={
                    searchQuery
                      ? `No positions found for "${searchQuery}"`
                      : "No positions available"
                  }
                />
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default PositionsTable;
