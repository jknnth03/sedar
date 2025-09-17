import { useMemo, useState, useEffect, useRef } from "react";
import { useFormContext } from "react-hook-form";
import dayjs from "dayjs";

const normalizeApiData = (data) => {
  if (!data) return [];
  return Array.isArray(data)
    ? data
    : data.result?.data ||
        data.result ||
        data.data ||
        data.items ||
        data.results ||
        [];
};

export const usePositions = (mode, positionsData, selectedEntry) => {
  return useMemo(() => {
    if (mode === "view" && selectedEntry?.submittable?.position) {
      return [selectedEntry.submittable.position];
    }
    if (mode === "edit" && selectedEntry?.submittable?.position) {
      const existingPosition = selectedEntry.submittable.position;
      const apiPositions = normalizeApiData(positionsData);

      if (!positionsData) {
        return [existingPosition];
      }

      const hasExistingInApi = apiPositions.some(
        (position) => position.id === existingPosition.id
      );

      if (!hasExistingInApi) {
        return [existingPosition, ...apiPositions];
      }

      return apiPositions;
    }
    return normalizeApiData(positionsData);
  }, [mode, positionsData, selectedEntry?.submittable?.position]);
};

export const useJobLevels = (mode, jobLevelsData, selectedEntry) => {
  return useMemo(() => {
    if (mode === "view" && selectedEntry?.submittable?.job_level) {
      return [selectedEntry.submittable.job_level];
    }
    if (mode === "edit" && selectedEntry?.submittable?.job_level) {
      const existingJobLevel = selectedEntry.submittable.job_level;
      const apiJobLevels = normalizeApiData(jobLevelsData);

      if (!jobLevelsData) {
        return [existingJobLevel];
      }

      const hasExistingInApi = apiJobLevels.some(
        (jobLevel) => jobLevel.id === existingJobLevel.id
      );

      if (!hasExistingInApi) {
        return [existingJobLevel, ...apiJobLevels];
      }

      return apiJobLevels;
    }
    return normalizeApiData(jobLevelsData);
  }, [mode, jobLevelsData, selectedEntry?.submittable?.job_level]);
};

export const useRequisitions = (mode, requisitionsData, selectedEntry) => {
  return useMemo(() => {
    if (mode === "view" && selectedEntry?.submittable?.requisition_type) {
      return [selectedEntry.submittable.requisition_type];
    }
    if (mode === "edit" && selectedEntry?.submittable?.requisition_type) {
      const existingRequisition = selectedEntry.submittable.requisition_type;
      const apiRequisitions = normalizeApiData(requisitionsData);

      if (!requisitionsData) {
        return [existingRequisition];
      }

      const hasExistingInApi = apiRequisitions.some(
        (requisition) => requisition.id === existingRequisition.id
      );

      if (!hasExistingInApi) {
        return [existingRequisition, ...apiRequisitions];
      }

      return apiRequisitions;
    }
    return normalizeApiData(requisitionsData);
  }, [mode, requisitionsData, selectedEntry?.submittable?.requisition_type]);
};

export const useEmployees = (mode, employeesData, selectedEntry) => {
  return useMemo(() => {
    if (
      mode === "view" &&
      selectedEntry?.submittable?.employee_to_be_replaced
    ) {
      return [selectedEntry.submittable.employee_to_be_replaced];
    }
    if (
      mode === "edit" &&
      selectedEntry?.submittable?.employee_to_be_replaced
    ) {
      const existingEmployee =
        selectedEntry.submittable.employee_to_be_replaced;
      const apiEmployees = normalizeApiData(employeesData);

      if (!employeesData) {
        return [existingEmployee];
      }

      const hasExistingInApi = apiEmployees.some(
        (employee) => employee.id === existingEmployee.id
      );

      if (!hasExistingInApi) {
        return [existingEmployee, ...apiEmployees];
      }

      return apiEmployees;
    }
    return normalizeApiData(employeesData);
  }, [
    mode,
    employeesData,
    selectedEntry?.submittable?.employee_to_be_replaced,
  ]);
};

export const useAllEmployees = (mode, allEmployeesData, selectedEntry) => {
  return useMemo(() => {
    if (mode === "view" && selectedEntry?.submittable?.selected_employee) {
      return [selectedEntry.submittable.selected_employee];
    }
    if (mode === "edit" && selectedEntry?.submittable?.selected_employee) {
      const existingEmployee = selectedEntry.submittable.selected_employee;
      const apiEmployees = normalizeApiData(allEmployeesData);

      if (!allEmployeesData) {
        return [existingEmployee];
      }

      const hasExistingInApi = apiEmployees.some(
        (employee) => employee.id === existingEmployee.id
      );

      if (!hasExistingInApi) {
        return [existingEmployee, ...apiEmployees];
      }

      return apiEmployees;
    }
    return normalizeApiData(allEmployeesData);
  }, [mode, allEmployeesData, selectedEntry?.submittable?.selected_employee]);
};

export const useDropdownState = () => {
  const [isAnyDropdownOpen, setIsAnyDropdownOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  const handleDropdownOpen = (
    dropdownName,
    isEssentialDataLoading,
    employeesLoading,
    employeesFetching,
    allEmployeesLoading,
    allEmployeesFetching
  ) => {
    if (
      isEssentialDataLoading ||
      employeesLoading ||
      employeesFetching ||
      allEmployeesLoading ||
      allEmployeesFetching
    ) {
      return false;
    }
    setActiveDropdown(dropdownName);
    setIsAnyDropdownOpen(true);
    return true;
  };

  const handleDropdownClose = () => {
    setActiveDropdown(null);
    setIsAnyDropdownOpen(false);
  };

  const isDropdownDisabled = (
    dropdownName,
    isEssentialDataLoading,
    employeesLoading,
    employeesFetching,
    allEmployeesLoading,
    allEmployeesFetching
  ) => {
    return (
      isEssentialDataLoading ||
      employeesLoading ||
      employeesFetching ||
      allEmployeesLoading ||
      allEmployeesFetching ||
      (isAnyDropdownOpen && activeDropdown !== dropdownName)
    );
  };

  return {
    isAnyDropdownOpen,
    activeDropdown,
    handleDropdownOpen,
    handleDropdownClose,
    isDropdownDisabled,
  };
};

export const useFormOptions = () => {
  const employmentTypeOptions = [
    "PROBATIONARY",
    "REGULAR",
    "PROJECT BASED",
    "AGENCY HIRED",
  ];

  const reasonForChangeOptions = [
    "Promotion",
    "Transfer",
    "Promotion & Transfer",
  ];

  return {
    employmentTypeOptions,
    reasonForChangeOptions,
  };
};

export const useUnifiedFormLogic = (mode, selectedEntry) => {
  const { setValue, clearErrors } = useFormContext();
  const hasSetInitialValuesForEntry = useRef(false);
  const [employeesDataFetched, setEmployeesDataFetched] = useState(false);

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
      const movementDetails = data.employee_movement_details;

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

      // FIXED: Map selected employee from movement details
      if (movementDetails?.employee) {
        const selectedEmployee = movementDetails.employee;
        setValue(
          "movement_employee_id",
          {
            id: selectedEmployee.id,
            full_name: selectedEmployee.full_name,
            name: selectedEmployee.full_name,
            employee_name: selectedEmployee.full_name,
            employee_code: selectedEmployee.employee_code,
          },
          { shouldValidate: false }
        );
      }

      // FIXED: Map new position from movement details
      if (movementDetails?.new_position) {
        setValue("movement_new_position_id", movementDetails.new_position, {
          shouldValidate: false,
        });
      }

      // FIXED: Map reason for change from movement details
      if (movementDetails?.reason_for_change) {
        setValue(
          "movement_reason_for_change",
          movementDetails.reason_for_change,
          {
            shouldValidate: false,
          }
        );
      }

      // FIXED: Map developmental assignment flag
      const isDa = movementDetails?.is_developmental_assignment ?? false;
      setValue("movement_is_da", Boolean(isDa), {
        shouldValidate: false,
      });

      // FIXED: Map start date from movement details
      if (movementDetails?.da_start_date) {
        try {
          const startDate = dayjs(movementDetails.da_start_date);
          if (startDate.isValid()) {
            setValue("movement_da_start_date", startDate, {
              shouldValidate: false,
            });
          }
        } catch (error) {
          console.warn("Invalid start date:", movementDetails.da_start_date);
        }
      }

      // FIXED: Map end date from movement details
      if (movementDetails?.da_end_date) {
        try {
          const endDate = dayjs(movementDetails.da_end_date);
          if (endDate.isValid()) {
            setValue("movement_da_end_date", endDate, {
              shouldValidate: false,
            });
          }
        } catch (error) {
          console.warn("Invalid end date:", movementDetails.da_end_date);
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

  const watchedRequisitionType =
    selectedEntry?.submittable?.requisition_type || null;

  const isReplacementDueToEmployeeMovement = () => {
    if (!watchedRequisitionType) return false;
    return (
      watchedRequisitionType.name === "REPLACEMENT DUE TO EMPLOYEE MOVEMENT"
    );
  };

  const isAdditionalManpower = () => {
    if (!watchedRequisitionType) return false;
    return watchedRequisitionType.name === "ADDITIONAL MANPOWER";
  };

  const shouldHideEmployeeReplacement = () => {
    return isAdditionalManpower() || isReplacementDueToEmployeeMovement();
  };

  const shouldShowSelectEmployee = () => {
    return isReplacementDueToEmployeeMovement();
  };

  const shouldShowReasonForChange = () => {
    return isReplacementDueToEmployeeMovement();
  };

  const handleRequisitionTypeChange = (value) => {
    setValue("requisition_type_id", value);
    setValue("position_id", null);
    setValue("employee_to_be_replaced_id", null);
    setValue("movement_employee_id", null); // Fix: correct field name
    setValue("movement_reason_for_change", ""); // Fix: correct field name
    setValue("movement_is_da", false); // Fix: correct field name
    setValue("movement_da_start_date", null); // Fix: correct field name
    setValue("movement_da_end_date", null); // Fix: correct field name
    setValue("movement_new_position.title", null); // Fix: correct field name
    clearErrors([
      "position_id",
      "employee_to_be_replaced_id",
      "movement_employee_id",
      "movement_reason_for_change",
      "movement_da_start_date",
      "movement_da_end_date",
      "movement_new_position_id",
    ]);
    setEmployeesDataFetched(false);
  };

  const handlePositionChange = (value) => {
    setValue("position_id", value);
    setValue("employee_to_be_replaced_id", null);
    setValue("movement_employee_id", null); // Fix: correct field name
    clearErrors(["employee_to_be_replaced_id", "movement_employee_id"]);
    setEmployeesDataFetched(false);
  };

  return {
    isInitialized: hasSetInitialValuesForEntry.current,
    employeesDataFetched,
    setEmployeesDataFetched,
    isReplacementDueToEmployeeMovement,
    isAdditionalManpower,
    shouldHideEmployeeReplacement,
    shouldShowSelectEmployee,
    shouldShowReasonForChange,
    handleRequisitionTypeChange,
    handlePositionChange,
  };
};

export default useUnifiedFormLogic;
