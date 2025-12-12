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
  Tooltip,
  Link,
  Skeleton,
  useTheme,
  Chip,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import ArchiveIcon from "@mui/icons-material/Archive";
import RestoreIcon from "@mui/icons-material/Restore";
import ShareLocationIcon from "@mui/icons-material/ShareLocation";
import HomeRepairServiceIcon from "@mui/icons-material/HomeRepairService";
import VisibilityIcon from "@mui/icons-material/Visibility";
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
        return (
          <Tooltip title={position.code} placement="top">
            <span style={styles.cellContentStyles}>{position.code}</span>
          </Tooltip>
        );

      case "name":
        return (
          <Tooltip title={position.title || "—"} placement="top">
            <span style={styles.cellContentStyles}>
              {position.title || "—"}
            </span>
          </Tooltip>
        );

      case "charging":
        return (
          <Tooltip title={position.charging || "—"} placement="top">
            <span style={styles.cellContentStyles}>
              {position.charging || "—"}
            </span>
          </Tooltip>
        );

      case "coa":
        return (
          <Tooltip title="View COA">
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                handleOpenCoaDialog(position);
              }}
              size="small">
              <ShareLocationIcon />
            </IconButton>
          </Tooltip>
        );

      case "superior":
        return (
          <Tooltip title={position.superior || "—"} placement="top">
            <span style={styles.cellContentStyles}>
              {position.superior || "—"}
            </span>
          </Tooltip>
        );

      case "req":
        return (
          <Tooltip title="View Requestors">
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                handleOpenRequestorsDialog(position);
              }}
              size="small">
              <VisibilityIcon />
            </IconButton>
          </Tooltip>
        );

      case "pay_frequency":
        return (
          <Tooltip title={position.pay_frequency || "—"} placement="top">
            <span style={styles.cellContentStyles}>
              {position.pay_frequency || "—"}
            </span>
          </Tooltip>
        );

      case "schedule":
        return (
          <Tooltip title={position.schedule || "—"} placement="top">
            <span style={styles.cellContentStyles}>
              {position.schedule || "—"}
            </span>
          </Tooltip>
        );

      case "team":
        return (
          <Tooltip title={position.team || "—"} placement="top">
            <span style={styles.cellContentStyles}>{position.team || "—"}</span>
          </Tooltip>
        );

      case "tools":
        return (
          <Tooltip title="View Tools">
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                handleOpenToolsDialog(position);
              }}
              size="small">
              <HomeRepairServiceIcon />
            </IconButton>
          </Tooltip>
        );

      case "attachments":
        const fileName = getDisplayFileName(position);
        return fileName ? (
          <Link
            href={position.position_attachment}
            target="_blank"
            rel="noopener"
            onClick={(e) => e.stopPropagation()}
            sx={{
              color: "rgb(33, 61, 112)",
              textDecoration: "none",
              "&:hover": {
                textDecoration: "underline",
              },
            }}>
            <Tooltip title={fileName} placement="top">
              <span style={styles.cellContentStyles}>{fileName}</span>
            </Tooltip>
          </Link>
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
