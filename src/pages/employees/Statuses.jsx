import React, { useState, useMemo, useCallback } from "react";
import { Paper, Box, useTheme } from "@mui/material";
import { useSnackbar } from "notistack";
import { useGetFilteredStatusesQuery } from "../../features/api/employee/statusApi";
import StatusModal from "../../components/modal/employee/multiFormModal/status/StatusModal";
import FilterStatusDialog from "./FilterStatusDialog";
import StatusesTable from "./StatusesTable";
import CustomTablePagination from "../zzzreusable/CustomTablePagination";
import "../../pages/GeneralStyle.scss";
import "../../pages/GeneralTable.scss";

const Status = ({
  searchQuery,
  showArchived,
  debounceValue,
  filters = {},
  isLoading: parentIsLoading = false,
}) => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [menuAnchor, setMenuAnchor] = useState({});

  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [selectedStatusTypes, setSelectedStatusTypes] = useState([]);

  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusModalMode, setStatusModalMode] = useState("view");
  const [selectedEmployeeStatus, setSelectedEmployeeStatus] = useState(null);

  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [tempSelectedStatuses, setTempSelectedStatuses] = useState([]);
  const [tempSelectedStatusTypes, setTempSelectedStatusTypes] = useState([]);

  React.useEffect(() => {
    setPage(1);
  }, [debounceValue, showArchived, selectedStatusTypes, filters]);

  const queryParams = useMemo(() => {
    const params = {
      page,
      per_page: rowsPerPage,
    };

    if (debounceValue && debounceValue.trim()) {
      params.search = debounceValue;
    }

    if (selectedStatusTypes.length > 0) {
      params.status_type = selectedStatusTypes.join(",");
    }

    if (filters?.status) {
      params.employment_status = filters.status;
    }

    if (filters?.name) {
      params.employee_name = filters.name;
    }

    if (filters?.team) {
      params.team_name = filters.team;
    }

    if (filters?.idNumber) {
      params.id_number = filters.idNumber;
    }

    if (filters?.dateHiredFrom) {
      params.date_hired_from = filters.dateHiredFrom;
    }

    if (filters?.dateHiredTo) {
      params.date_hired_to = filters.dateHiredTo;
    }

    if (filters?.type) {
      params.employment_type = filters.type;
    }

    if (filters?.department) {
      params.department_name = filters.department;
    }

    if (filters?.manpower) {
      params.manpower_form = filters.manpower;
    }

    if (filters?.position) {
      params.position_title = filters.position;
    }

    return params;
  }, [page, rowsPerPage, debounceValue, selectedStatusTypes, filters]);

  const {
    data: apiResponse,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetFilteredStatusesQuery(queryParams, {
    refetchOnMountOrArgChange: true,
  });

  const getBaseUrl = useCallback(() => {
    return `${window.location.protocol}//${window.location.host}`;
  }, []);

  const validateDate = useCallback((dateString) => {
    if (
      !dateString ||
      dateString === "" ||
      dateString === "0000-00-00" ||
      dateString === "1900-01-01" ||
      dateString === "null" ||
      dateString === "undefined"
    ) {
      return null;
    }

    try {
      const date = new Date(dateString);
      if (
        isNaN(date.getTime()) ||
        date.getFullYear() < 1900 ||
        date.getFullYear() > 2100
      ) {
        return null;
      }
      return dateString;
    } catch (error) {
      return null;
    }
  }, []);

  const formatFullName = useCallback((employee) => {
    if (!employee) return "N/A";
    if (employee.full_name) return employee.full_name;

    const parts = [
      employee.first_name,
      employee.middle_name,
      employee.last_name,
    ].filter(Boolean);

    return parts.length > 0 ? parts.join(" ") : "N/A";
  }, []);

  const { employeeStatusList, totalCount } = useMemo(() => {
    const result = apiResponse?.result;
    const data = result?.data || [];

    const transformedData = data.map((item) => {
      const latestStatus = item.latest_status || {};

      return {
        id: latestStatus.id || item.employee_id,
        employee_id: item.employee_id,
        employee: {
          id: item.employee?.id,
          employee_code: item.employee?.employee_code,
          full_name: item.employee?.full_name || formatFullName(item.employee),
          first_name: item.employee?.first_name,
          middle_name: item.employee?.middle_name,
          last_name: item.employee?.last_name,
          email: item.employee?.email,
          status: item.employee?.status,
          current_status: item.employee?.current_status,
          charging: item.employee?.charging,
        },
        employee_status_label: latestStatus.employee_status_label || "N/A",
        employee_status: latestStatus.employee_status || "active",
        employee_status_start_date: validateDate(
          latestStatus.employee_status_start_date
        ),
        employee_status_end_date: validateDate(
          latestStatus.employee_status_end_date
        ),
        employee_status_effectivity_date: validateDate(
          latestStatus.employee_status_effectivity_date
        ),
        employee_status_attachment: latestStatus.employee_status_attachment
          ? `${getBaseUrl()}/${latestStatus.employee_status_attachment}`
          : null,
        employee_status_attachment_path:
          latestStatus.employee_status_attachment,
        employee_status_remarks: latestStatus.employee_status_remarks,
        is_current: true,
        created_at: latestStatus.created_at || item.created_at,
        updated_at: latestStatus.updated_at || item.updated_at,
      };
    });

    return {
      employeeStatusList: transformedData,
      totalCount: result?.total || 0,
    };
  }, [apiResponse, validateDate, getBaseUrl, formatFullName]);

  const handleFilterDialogOpen = useCallback(() => {
    setTempSelectedStatuses(selectedStatuses);
    setTempSelectedStatusTypes(selectedStatusTypes);
    setFilterDialogOpen(true);
  }, [selectedStatuses, selectedStatusTypes]);

  const handleFilterDialogClose = useCallback(() => {
    setFilterDialogOpen(false);
  }, []);

  const handleStatusChange = useCallback((statuses) => {
    setTempSelectedStatuses(statuses);
  }, []);

  const handleStatusTypeChange = useCallback((statusTypes) => {
    setTempSelectedStatusTypes(statusTypes);
  }, []);

  const handleApplyFilters = useCallback(() => {
    setSelectedStatusTypes(tempSelectedStatusTypes);
    setSelectedStatuses(tempSelectedStatuses);
    setPage(1);
    setFilterDialogOpen(false);
  }, [tempSelectedStatusTypes, tempSelectedStatuses]);

  const handleClearFilters = useCallback(() => {
    setSelectedStatuses([]);
    setSelectedStatusTypes([]);
    setTempSelectedStatuses([]);
    setTempSelectedStatusTypes([]);
    setPage(1);
  }, []);

  const handleMenuClose = useCallback((statusId) => {
    setMenuAnchor((prev) => ({ ...prev, [statusId]: null }));
  }, []);

  const openStatusModal = useCallback((employeeStatus, mode) => {
    setSelectedEmployeeStatus(employeeStatus);
    setStatusModalMode(mode);
    setStatusModalOpen(true);
  }, []);

  const handleDownloadAttachment = useCallback(
    (employeeStatus, event) => {
      if (event) event.stopPropagation();
      handleMenuClose(employeeStatus.id);

      if (employeeStatus.employee_status_attachment) {
        try {
          const link = document.createElement("a");
          link.href = employeeStatus.employee_status_attachment;
          link.download = `employee_${employeeStatus.employee_id}_status_attachment`;
          link.target = "_blank";
          link.rel = "noopener noreferrer";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          enqueueSnackbar("Attachment downloaded successfully!", {
            variant: "success",
            autoHideDuration: 3000,
          });
        } catch (error) {
          enqueueSnackbar("Failed to download attachment", {
            variant: "error",
            autoHideDuration: 3000,
          });
        }
      } else {
        enqueueSnackbar("No attachment available", {
          variant: "warning",
          autoHideDuration: 3000,
        });
      }
    },
    [handleMenuClose, enqueueSnackbar]
  );

  const handleRowClick = useCallback(
    (employeeStatus) => {
      openStatusModal(employeeStatus, "view");
    },
    [openStatusModal]
  );

  const handleStatusModalClose = useCallback(() => {
    setStatusModalOpen(false);
    setStatusModalMode("view");
    setSelectedEmployeeStatus(null);
  }, []);

  const createFormData = useCallback((data) => {
    const formData = new FormData();

    if (data.status_entries && data.status_entries.length > 0) {
      data.status_entries.forEach((entry, index) => {
        formData.append(
          `status_entries[${index}][employee_id]`,
          entry.employee_id || ""
        );
        formData.append(
          `status_entries[${index}][employee_status_label]`,
          entry.employee_status_label || ""
        );
        formData.append(
          `status_entries[${index}][employee_status]`,
          entry.employee_status || "active"
        );
        formData.append(
          `status_entries[${index}][employee_status_start_date]`,
          entry.employee_status_start_date || ""
        );
        formData.append(
          `status_entries[${index}][employee_status_end_date]`,
          entry.employee_status_end_date || ""
        );
        formData.append(
          `status_entries[${index}][employee_status_effectivity_date]`,
          entry.employee_status_effectivity_date || ""
        );
        formData.append(
          `status_entries[${index}][employee_status_remarks]`,
          entry.employee_status_remarks || ""
        );
        formData.append(
          `status_entries[${index}][is_current]`,
          entry.is_current ? "1" : "0"
        );

        if (entry.employee_status_attachment) {
          if (entry.employee_status_attachment instanceof File) {
            formData.append(
              `status_entries[${index}][employee_status_attachment]`,
              entry.employee_status_attachment
            );
          } else if (
            entry.employee_status_attachment instanceof FileList &&
            entry.employee_status_attachment.length > 0
          ) {
            formData.append(
              `status_entries[${index}][employee_status_attachment]`,
              entry.employee_status_attachment[0]
            );
          }
        }
      });
    } else {
      formData.append("employee_id", data.employee_id || "");
      formData.append(
        "employee_status_label",
        data.employee_status_label || ""
      );
      formData.append("employee_status", data.employee_status || "active");
      formData.append(
        "employee_status_start_date",
        data.employee_status_start_date || ""
      );
      formData.append(
        "employee_status_end_date",
        data.employee_status_end_date || ""
      );
      formData.append(
        "employee_status_effectivity_date",
        data.employee_status_effectivity_date || ""
      );
      formData.append(
        "employee_status_remarks",
        data.employee_status_remarks || ""
      );
      formData.append("is_current", data.is_current ? "1" : "0");

      if (data.employee_status_attachment) {
        if (data.employee_status_attachment instanceof File) {
          formData.append(
            "employee_status_attachment",
            data.employee_status_attachment
          );
        } else if (
          data.employee_status_attachment instanceof FileList &&
          data.employee_status_attachment.length > 0
        ) {
          formData.append(
            "employee_status_attachment",
            data.employee_status_attachment[0]
          );
        }
      }
    }

    return formData;
  }, []);

  const handleStatusModalSubmit = useCallback(
    async (data) => {
      try {
        const formData = createFormData(data);

        const response = await fetch("/api/employee/status", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || "Failed to update employee status"
          );
        }

        await refetch();
        enqueueSnackbar("Employee status updated successfully!", {
          variant: "success",
          autoHideDuration: 3000,
        });
      } catch (error) {
        enqueueSnackbar(error.message || "Failed to update employee status", {
          variant: "error",
          autoHideDuration: 3000,
        });
        throw error;
      }
    },
    [createFormData, refetch, enqueueSnackbar]
  );

  const getNoDataMessage = useCallback(() => {
    if (debounceValue) {
      return `No results found for "${debounceValue}"`;
    }
    if (
      selectedStatuses.length > 0 ||
      selectedStatusTypes.length > 0 ||
      Object.values(filters).some((v) => v && v !== "ACTIVE")
    ) {
      return `No employee statuses found with selected filters`;
    }
    return showArchived
      ? "No archived employee statuses found"
      : "No active employee statuses found";
  }, [
    debounceValue,
    showArchived,
    selectedStatuses,
    selectedStatusTypes,
    filters,
  ]);

  const handleFilterIconClick = useCallback(
    (event) => {
      event.stopPropagation();
      handleFilterDialogOpen();
    },
    [handleFilterDialogOpen]
  );

  const hasActiveFilters = useMemo(() => {
    return selectedStatuses.length > 0 || selectedStatusTypes.length > 0;
  }, [selectedStatuses, selectedStatusTypes]);

  const handlePageChange = useCallback((event, newPage) => {
    setPage(newPage + 1);
  }, []);

  const handleRowsPerPageChange = useCallback((event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(1);
  }, []);

  const isLoadingState = isLoading || isFetching;

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
      }}>
      <Paper
        className="container"
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          minHeight: 0,
          borderRadius: 2,
        }}>
        <StatusesTable
          employeeStatusList={employeeStatusList}
          isFetching={isLoadingState}
          error={error}
          onRowClick={handleRowClick}
          onFilterIconClick={handleFilterIconClick}
          hasActiveFilters={hasActiveFilters}
          getNoDataMessage={getNoDataMessage}
        />

        <CustomTablePagination
          count={totalCount}
          page={Math.max(0, page - 1)}
          rowsPerPage={rowsPerPage}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      </Paper>

      <StatusModal
        open={statusModalOpen}
        onClose={handleStatusModalClose}
        employeeData={selectedEmployeeStatus}
        onSubmit={handleStatusModalSubmit}
        mode={statusModalMode}
        allowEdit={true}
      />

      <FilterStatusDialog
        open={filterDialogOpen}
        onClose={handleFilterDialogClose}
        selectedStatuses={tempSelectedStatusTypes}
        onStatusChange={handleStatusTypeChange}
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
      />
    </Box>
  );
};

export default Status;
