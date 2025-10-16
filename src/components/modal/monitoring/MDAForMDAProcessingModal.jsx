import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Skeleton,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import {
  Close as CloseIcon,
  Assignment as AssignmentIcon,
} from "@mui/icons-material";
import { useFormContext } from "react-hook-form";
import { styled } from "@mui/material/styles";
import dayjs from "dayjs";
import DataChangeModalFields from "../../../components/modal/form/DataChange/DataChangeModalFields";
import { useLazyGetAllDataChangeEmployeeQuery } from "../../../features/api/forms/datachangeApi";

const StyledDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialog-paper": {
    maxWidth: "900px",
    width: "100%",
    height: "70vh",
    maxHeight: "70vh",
    display: "flex",
    flexDirection: "column",
    position: "relative",
  },
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  backgroundColor: "#fff",
  flexShrink: 0,
  padding: "16px 24px",
  "& .MuiTypography-root": {
    fontSize: "1.25rem",
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
}));

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  backgroundColor: "#fff",
  flex: 1,
  padding: "0px 10px",
  overflow: "auto",
  "&::-webkit-scrollbar": {
    width: "8px",
  },
  "&::-webkit-scrollbar-track": {
    backgroundColor: "#f1f1f1",
    borderRadius: "4px",
  },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: "#c1c1c1",
    borderRadius: "4px",
    "&:hover": {
      backgroundColor: "#a1a1a1",
    },
  },
}));

const generateUniqueId = (prefix = "attachment") => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const MDAForMDAProcessingModal = ({
  open,
  onClose,
  selectedEntry = null,
  isLoading = false,
}) => {
  const { reset, setValue } = useFormContext();

  const [formInitialized, setFormInitialized] = useState(false);
  const [lastEntryId, setLastEntryId] = useState(null);
  const [employeeData, setEmployeeData] = useState(null);

  const [
    triggerGetEmployee,
    { data: fetchedEmployeeData, isLoading: isLoadingEmployee },
  ] = useLazyGetAllDataChangeEmployeeQuery();

  const handleClose = () => {
    setFormInitialized(false);
    setLastEntryId(null);
    setEmployeeData(null);
    reset();
    onClose();
  };

  useEffect(() => {
    if (open) {
      setFormInitialized(false);
      setLastEntryId(null);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const currentId = selectedEntry?.result?.id;
    if (currentId !== lastEntryId) {
      setFormInitialized(false);
      setLastEntryId(currentId);
    }
  }, [open, selectedEntry?.result?.id, lastEntryId]);

  useEffect(() => {
    if (open && selectedEntry && !formInitialized) {
      const submittable = selectedEntry.result?.submittable;
      const employeeId = submittable?.employee_id;
      if (employeeId && !employeeData) {
        triggerGetEmployee({
          page: 1,
          per_page: 1000,
          status: "active",
          employee_id: employeeId,
        });
      }
    }
  }, [open, selectedEntry, formInitialized, employeeData, triggerGetEmployee]);

  useEffect(() => {
    if (fetchedEmployeeData && !employeeData) {
      const employees = Array.isArray(fetchedEmployeeData)
        ? fetchedEmployeeData
        : fetchedEmployeeData.result?.data ||
          fetchedEmployeeData.result ||
          fetchedEmployeeData.data ||
          [];
      if (employees.length > 0) {
        setEmployeeData(employees[0]);
      }
    }
  }, [fetchedEmployeeData, employeeData]);

  useEffect(() => {
    if (open && selectedEntry && !formInitialized) {
      const submittable = selectedEntry.result?.submittable;
      const submittedBy = selectedEntry.result?.submitted_by;
      const employee = selectedEntry.result?.employee;

      if (submittable) {
        const employeeInfo = employeeData || employee || submittedBy || {};
        const employeeName =
          employeeInfo.full_name ||
          employeeInfo.employee_name ||
          employeeInfo.name ||
          submittedBy?.full_name ||
          "Unknown Employee";

        const formData = {
          form_id: { id: selectedEntry.result.form?.id || 4 },
          employee_id: {
            id: submittable.employee_id || employeeInfo.id,
            employee_name: employeeName,
            full_name: employeeName,
            position_title:
              employeeData?.position_title ||
              employeeInfo.position_title ||
              "N/A",
            department:
              employeeData?.department || employeeInfo.department || "N/A",
            sub_unit: employeeData?.sub_unit || employeeInfo.sub_unit || "N/A",
            schedule: employeeData?.schedule || employeeInfo.schedule || "N/A",
            general_info: { full_name: employeeName },
          },
          movement_type_id: submittable.movement_type
            ? {
                id: submittable.movement_type.id,
                name:
                  submittable.movement_type.name ||
                  submittable.movement_type.type_name,
              }
            : null,
          effective_date: submittable.effective_date
            ? dayjs(submittable.effective_date)
            : null,
          to_position_id: submittable.to_position
            ? {
                id: submittable.to_position.id,
                title: {
                  name:
                    submittable.to_position.title?.name || "Unknown Position",
                },
                name: submittable.to_position.title?.name || "Unknown Position",
              }
            : null,
          to_job_rate: submittable.to_job_rate || "",
          justification: submittable.justification || "",
          remarks: submittable.remarks || "",
        };

        Object.keys(formData).forEach((key) => {
          setValue(key, formData[key], { shouldValidate: false });
        });

        const attachmentsData = submittable.attachments || [];
        const attachmentFields =
          attachmentsData.length > 0
            ? attachmentsData.map((attachment) => ({
                id: generateUniqueId(),
                file_attachment: null,
                existing_file_name:
                  attachment.original_filename ||
                  attachment.file_path?.split("/").pop() ||
                  "Unknown file",
                existing_file_path: attachment.file_path,
                existing_file_id: attachment.id,
                is_new_file: false,
                keep_existing: true,
              }))
            : [
                {
                  id: generateUniqueId(),
                  file_attachment: null,
                  existing_file_name: null,
                  is_new_file: true,
                },
              ];

        setValue("attachments", attachmentFields, { shouldValidate: false });
        setFormInitialized(true);
      }
    }
  }, [open, selectedEntry, formInitialized, setValue, employeeData]);

  const isLoadingData = isLoadingEmployee && !formInitialized;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <StyledDialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <StyledDialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <AssignmentIcon sx={{ color: "rgb(33, 61, 112)" }} />
            <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
              VIEW DATA CHANGE
            </Typography>
          </Box>
          <IconButton
            onClick={handleClose}
            sx={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              backgroundColor: "#fff",
              "&:hover": { backgroundColor: "#f5f5f5" },
              transition: "all 0.2s ease-in-out",
            }}>
            <CloseIcon sx={{ fontSize: "18px", color: "#333" }} />
          </IconButton>
        </StyledDialogTitle>

        <StyledDialogContent>
          {isLoadingData ? (
            <Box sx={{ p: 3 }}>
              <Skeleton
                variant="rectangular"
                width="100%"
                height={60}
                sx={{ mb: 2 }}
              />
              <Skeleton
                variant="rectangular"
                width="100%"
                height={60}
                sx={{ mb: 2 }}
              />
              <Skeleton
                variant="rectangular"
                width="100%"
                height={60}
                sx={{ mb: 2 }}
              />
              <Skeleton variant="rectangular" width="100%" height={100} />
            </Box>
          ) : (
            <DataChangeModalFields
              isLoading={isLoading}
              mode="view"
              selectedEntry={selectedEntry}
              formInitialized={formInitialized}
              key={`${selectedEntry?.result?.id}-view-${formInitialized}-${selectedEntry?.result?.updated_at}`}
            />
          )}
        </StyledDialogContent>
      </StyledDialog>
    </LocalizationProvider>
  );
};

export default MDAForMDAProcessingModal;
