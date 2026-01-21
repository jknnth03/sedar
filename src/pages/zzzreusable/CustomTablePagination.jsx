import React from "react";
import { Box, TablePagination } from "@mui/material";

const CustomTablePagination = ({
  count,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  rowsPerPageOptions = [5, 10, 25, 50, 100],
  sx,
  ...otherProps
}) => {
  return (
    <Box
      sx={{
        borderTop: "1px solid #e0e0e0",
        backgroundColor: "#f8f9fa",
        flexShrink: 0,
        display: "flex",
        justifyContent: "flex-end",
        "& .MuiTablePagination-root": {
          color: "rgb(33, 61, 112)",
          "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
            {
              fontSize: "14px",
              fontWeight: 500,
              color: "rgb(33, 61, 112)",
            },
          "& .MuiTablePagination-select": {
            fontSize: "14px",
            color: "rgb(33, 61, 112)",
          },
          "& .MuiSelect-icon": {
            color: "#666",
          },
          "& .MuiIconButton-root": {
            color: "rgb(33, 61, 112)",
            "&:hover": {
              backgroundColor: "rgba(33, 61, 112, 0.04)",
            },
            "&.Mui-disabled": {
              color: "#ccc",
            },
          },
        },
        ...sx,
      }}>
      <TablePagination
        rowsPerPageOptions={rowsPerPageOptions}
        component="div"
        count={count}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
        {...otherProps}
      />
    </Box>
  );
};

export default CustomTablePagination;
