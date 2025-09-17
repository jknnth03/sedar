import { useEffect, useRef } from "react";
import { useFormContext } from "react-hook-form";
import dayjs from "dayjs";

const useFormInitialization = (mode, selectedEntry) => {
  const { setValue, clearErrors } = useFormContext();
  const hasSetInitialValuesForEntry = useRef(false);

  useEffect(() => {
    hasSetInitialValuesForEntry.current = false;
  }, [selectedEntry?.id, mode]);

  useEffect(() => {
    if (
      (mode === "edit" || mode === "view") &&
      selectedEntry?.submittable &&
      !hasSetInitialValuesForEntry.current
    ) {
      const data = selectedEntry.submittable;

      if (data.position) {
        setValue("position_id", data.position, { shouldValidate: false });
      }

      if (data.job_level) {
        setValue("job_level_id", data.job_level, { shouldValidate: false });
      }

      if (data.requisition_type) {
        setValue("requisition_type_id", data.requisition_type, {
          shouldValidate: false,
        });
      }

      if (
        data.employee_to_be_replaced &&
        data.requisition_type?.name !== "ADDITIONAL MANPOWER"
      ) {
        setValue(
          "employee_to_be_replaced_id",
          {
            id: data.employee_to_be_replaced.id,
            full_name:
              data.employee_to_be_replaced.full_name ||
              data.employee_to_be_replaced.name ||
              data.employee_to_be_replaced.employee_name,
            name:
              data.employee_to_be_replaced.full_name ||
              data.employee_to_be_replaced.name ||
              data.employee_to_be_replaced.employee_name,
            employee_name:
              data.employee_to_be_replaced.full_name ||
              data.employee_to_be_replaced.name ||
              data.employee_to_be_replaced.employee_name,
            employee_code: data.employee_to_be_replaced.employee_code || "",
          },
          { shouldValidate: false }
        );
      }

      if (data.selected_employee) {
        setValue(
          "movement_employee_id",
          {
            id: data.selected_employee.id,
            full_name:
              data.selected_employee.full_name ||
              data.selected_employee.name ||
              data.selected_employee.employee_name,
            name:
              data.selected_employee.full_name ||
              data.selected_employee.name ||
              data.selected_employee.employee_name,
            employee_name:
              data.selected_employee.full_name ||
              data.selected_employee.name ||
              data.selected_employee.employee_name,
          },
          { shouldValidate: false }
        );
      }

      if (data.new_position) {
        setValue("movement_new_position_id", data.new_position, {
          shouldValidate: false,
        });
      }

      if (data.reason_for_change) {
        const reasonValue =
          typeof data.reason_for_change === "string"
            ? data.reason_for_change
            : data.reason_for_change?.name ||
              data.reason_for_change?.value ||
              "";
        setValue("movement_reason_for_change", reasonValue, {
          shouldValidate: false,
        });
      }

      if (data.is_developmental_assignment !== undefined) {
        setValue("movement_is_da", Boolean(data.is_developmental_assignment), {
          shouldValidate: false,
        });
      }

      if (data.movement_da_start_date) {
        try {
          const startDate = dayjs(data.movement_da_start_date);
          if (startDate.isValid()) {
            setValue("movement_da_start_date", startDate, {
              shouldValidate: false,
            });
          }
        } catch (error) {
          console.warn("Invalid start date:", data.movement_da_start_date);
        }
      }

      if (data.movement_da_end_date) {
        try {
          const endDate = dayjs(data.movement_da_end_date);
          if (endDate.isValid()) {
            setValue("movement_da_end_date", endDate, {
              shouldValidate: false,
            });
          }
        } catch (error) {
          console.warn("Invalid end date:", data.movement_da_end_date);
        }
      }

      if (data.employment_type) {
        const employmentValue =
          typeof data.employment_type === "string"
            ? data.employment_type
            : data.employment_type?.name || "";
        setValue("employment_type", employmentValue, {
          shouldValidate: false,
        });
      }

      if (data.expected_salary) {
        setValue("expected_salary", data.expected_salary, {
          shouldValidate: false,
        });
      }

      if (data.justification) {
        setValue("justification", data.justification, {
          shouldValidate: false,
        });
      }

      if (data.remarks) {
        setValue("remarks", data.remarks, { shouldValidate: false });
      }

      if (data.manpower_form_attachment) {
        setValue("manpower_form_attachment", data.manpower_form_attachment, {
          shouldValidate: false,
        });
      }

      if (data.manpower_attachment_filename) {
        setValue(
          "manpower_attachment_filename",
          data.manpower_attachment_filename,
          { shouldValidate: false }
        );
      }

      clearErrors();
      hasSetInitialValuesForEntry.current = true;
    }
  }, [mode, selectedEntry?.submittable, setValue, clearErrors]);

  return {
    isInitialized: hasSetInitialValuesForEntry.current,
  };
};

export default useFormInitialization;
