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
  Checkbox,
  Tooltip,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import ArchiveIcon from "@mui/icons-material/Archive";
import RestoreIcon from "@mui/icons-material/Restore";
import ShareLocationIcon from "@mui/icons-material/ShareLocation";
import HomeRepairServiceIcon from "@mui/icons-material/HomeRepairService";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import NoDataFound from "../../../pages/NoDataFound";
import { styles } from "../../forms/manpowerform/formSubmissionStyles";

// Color for the COA / Tools icon buttons
const ICON_BLUE = "rgb(33, 61, 112)";

// Headcount cell width = width ng "HEADCOUNT" header text, para naka-center ang chip sa ilalim niya
const HEADCOUNT_CELL_WIDTH = 110;

// Headcount chip colors
const HEADCOUNT_CHIP_COLORS = {
  ok: { backgroundColor: "#e8f5e8", color: "#2e7d32", border: "none" },
  full: { backgroundColor: "#fdf3d8", color: "#8a6100", border: "none" },
  over: { backgroundColor: "#fdecec", color: "#d32f2f", border: "none" },
  noLimit: {
    backgroundColor: "transparent",
    color: "text.secondary",
    border: "1px solid #cfd4dc",
  },
};

// headcount_summary.status (from the API) -> chip color variant
const HEADCOUNT_OVER_STATUSES = [
  "OVER",
  "OVERFILLED",
  "OVER_BUDGET",
  "EXCEEDED",
];
const HEADCOUNT_NO_LIMIT_STATUSES = ["NO_LIMIT", "UNLIMITED"];

const getHeadcountVariant = (status, hasBudget, filled, budget) => {
  if (status === "FULL") return "full";
  if (HEADCOUNT_OVER_STATUSES.includes(status)) return "over";
  if (HEADCOUNT_NO_LIMIT_STATUSES.includes(status)) return "noLimit";
  if (status) return "ok";

  // walang status sa response: kwentahin natin
  if (!hasBudget) return "noLimit";
  if (filled > Number(budget)) return "over";
  if (filled === Number(budget)) return "full";
  return "ok";
};

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
  handleOpenToolsDialog,
  handleOpenAttachmentDialog,
  handleEditClick,
  handleArchiveRestoreClick,
  getDisplayFileName,
  renderStatusChip,
  selectedRows = {},
  handleToggleRow,
  handleToggleAll,
  showSelection = true,
}) => {
  const theme = useTheme();

  // Only these columns stay bold; lahat ng iba normal weight
  const BOLD_COLUMNS = ["name", "superior"];
  const getCellTextStyle = (columnId) =>
    BOLD_COLUMNS.includes(columnId)
      ? styles.cellContentStyles
      : { ...styles.cellContentStyles, fontWeight: 400 };

  const FORM_NAME_COLUMNS = [
    "code",
    "name",
    "charging",
    "superior",
    "pay_frequency",
    "schedule",
    "team",
    "attachments",
  ];
  const getBodyCellSx = (columnId) => {
    const base = FORM_NAME_COLUMNS.includes(columnId)
      ? styles.formNameCell
      : {};
    return BOLD_COLUMNS.includes(columnId)
      ? base
      : { ...base, fontWeight: 400, "& span": { fontWeight: 400 } };
  };

  const allColumns = [
    {
      id: "select",
      label: "",
      align: "center",
      width: styles.columnStyles.status,
      selectionOnly: true,
    },
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
    {
      id: "team",
      label: "TEAM",
      width: styles.columnStyles.formName,
      hideOnMobile: true,
    },
    { id: "superior", label: "SUPERIOR", width: styles.columnStyles.formName },
    {
      id: "headcount",
      label: "HEADCOUNT",
      width: styles.columnStyles.formName,
      hideOnMobile: true,
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

  // Checkbox column only shows on the active tab
  const columns = showSelection
    ? allColumns
    : allColumns.filter((col) => !col.selectionOnly);

  const visibleColumns = isMobile
    ? columns.filter((col) => !col.hideOnMobile)
    : columns;

  // Header checkbox state (current page only)
  const selectedOnPage = positionList.filter((p) => selectedRows[p.id]).length;
  const allSelected =
    positionList.length > 0 && selectedOnPage === positionList.length;
  const someSelected = selectedOnPage > 0 && !allSelected;

  // Wrapper para naka-center ang headcount content sa ilalim ng header text
  const wrapHeadcount = (content) => (
    <Box
      sx={{
        width: HEADCOUNT_CELL_WIDTH,
        display: "flex",
        justifyContent: "center",
      }}>
      {content}
    </Box>
  );

  // Headcount chip: text from headcount_summary.label, color from headcount_summary.status
  const renderHeadcount = (position, textStyle) => {
    const summary = position.headcount_summary;
    const budget = summary?.budget ?? position.headcount;
    const hasBudget =
      budget !== null &&
      budget !== undefined &&
      budget !== "" &&
      Number(budget) > 0;

    // walang headcount_summary sa response: budget number lang ang ipapakita
    if (!summary) {
      return wrapHeadcount(
        hasBudget ? <span style={textStyle}>{budget}</span> : "—",
      );
    }

    const filled = Number(summary.filled ?? 0);
    const incoming = Number(summary.incoming ?? 0);
    const status = String(summary.status || "").toUpperCase();

    // label galing sa API; fallback lang kung wala
    const label =
      summary.label ||
      (hasBudget ? `${filled} / ${budget}` : `${filled} · no limit`);

    const variant = getHeadcountVariant(status, hasBudget, filled, budget);
    const colors = HEADCOUNT_CHIP_COLORS[variant];

    const tooltipText = [
      `Budget: ${hasBudget ? budget : "no limit"}`,
      `Filled: ${filled}`,
      `Incoming: ${incoming}`,
      hasBudget && summary.available !== undefined && summary.available !== null
        ? `Available: ${summary.available}`
        : null,
    ]
      .filter(Boolean)
      .join(" · ");

    return wrapHeadcount(
      <Tooltip title={tooltipText} arrow placement="top">
        <Chip
          label={label}
          size="small"
          sx={{
            ...colors,
            fontWeight: 700,
            fontSize: "11px",
            height: "22px",
            borderRadius: "11px",
            "& .MuiChip-label": { padding: "0 8px" },
          }}
        />
      </Tooltip>,
    );
  };

  const renderCell = (column, position) => {
    const textStyle = getCellTextStyle(column.id);
    switch (column.id) {
      case "select":
        return (
          <Checkbox
            size="small"
            checked={Boolean(selectedRows[position.id])}
            onClick={(e) => e.stopPropagation()}
            onChange={() => handleToggleRow(position)}
          />
        );

      case "id":
        return position.id;

      case "code":
        return <span style={textStyle}>{position.code}</span>;

      case "name":
        const titleValue =
          typeof position.title === "object" && position.title !== null
            ? position.title.name || position.title.title || "—"
            : position.title || "—";
        return <span style={textStyle}>{titleValue}</span>;

      case "charging":
        const chargingValue =
          typeof position.charging === "object" && position.charging !== null
            ? position.charging.name || position.charging.code || "—"
            : position.charging || "—";
        return <span style={textStyle}>{chargingValue}</span>;

      case "coa":
        return (
          <Tooltip title="Click to view COA" arrow placement="top">
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                handleOpenCoaDialog(position);
              }}
              size="small"
              sx={{ color: ICON_BLUE }}>
              <ShareLocationIcon />
            </IconButton>
          </Tooltip>
        );

      case "team":
        const teamValue =
          typeof position.team === "object" && position.team !== null
            ? position.team.name || position.team.code || "—"
            : position.team || "—";
        return <span style={textStyle}>{teamValue}</span>;

      case "superior":
        const superiorValue =
          typeof position.superior === "object" && position.superior !== null
            ? position.superior.name ||
              position.superior.code ||
              position.superior.full_name ||
              "—"
            : position.superior || "—";
        return <span style={textStyle}>{superiorValue}</span>;

      case "headcount":
        return renderHeadcount(position, textStyle);

      case "pay_frequency":
        return <span style={textStyle}>{position.pay_frequency || "—"}</span>;

      case "schedule":
        const scheduleValue =
          typeof position.schedule === "object" && position.schedule !== null
            ? position.schedule.name || position.schedule.code || "—"
            : position.schedule || "—";
        return <span style={textStyle}>{scheduleValue}</span>;

      case "tools":
        return (
          <Tooltip title="Click to view Tools" arrow placement="top">
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                handleOpenToolsDialog(position);
              }}
              size="small"
              sx={{ color: ICON_BLUE }}>
              <HomeRepairServiceIcon />
            </IconButton>
          </Tooltip>
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
            <span style={textStyle}>{fileName}</span>
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
      <Table stickyHeader sx={{ minWidth: isMobile ? 800 : 1500 }}>
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
                {column.id === "select" ? (
                  <Checkbox
                    size="small"
                    checked={allSelected}
                    indeterminate={someSelected}
                    disabled={isLoadingState || positionList.length === 0}
                    onChange={(e) => handleToggleAll(e.target.checked)}
                  />
                ) : (
                  column.label
                )}
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
                selected={Boolean(selectedRows[position.id])}
                sx={styles.tableRowHover(theme)}>
                {visibleColumns.map((column) => (
                  <TableCell
                    key={column.id}
                    align={column.align || "left"}
                    sx={getBodyCellSx(column.id)}>
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
