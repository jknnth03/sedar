import moment from "moment";

export const STEPS = [
  "General Info",
  "Address",
  "Position",
  "Emp Type",
  "Attainment",
  "Account",
  "Contact",
  "Files",
  "Review",
];

const formatDateForForm = (dateValue) => {
  if (!dateValue) return "";

  let momentDate;

  if (moment.isMoment(dateValue)) {
    momentDate = dateValue;
  } else if (typeof dateValue === "string") {
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
      momentDate = moment(dateValue, "YYYY-MM-DD", true);
    } else {
      momentDate = moment(
        dateValue,
        ["MMM D, YYYY", "DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD", "DD-MM-YYYY"],
        true
      );

      if (!momentDate.isValid()) {
        momentDate = moment(dateValue);
      }
    }
  } else if (dateValue instanceof Date) {
    momentDate = moment(
      dateValue.getFullYear() +
        "-" +
        String(dateValue.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(dateValue.getDate()).padStart(2, "0"),
      "YYYY-MM-DD"
    );
  } else {
    momentDate = moment(dateValue);
  }

  return momentDate.isValid() ? momentDate.format("YYYY-MM-DD") : "";
};

const normalizeDateForComparison = (dateValue) => {
  if (!dateValue) return "";

  let momentDate;

  if (moment.isMoment(dateValue)) {
    momentDate = dateValue;
  } else if (typeof dateValue === "string") {
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
      momentDate = moment(dateValue, "YYYY-MM-DD", true);
    } else {
      momentDate = moment(
        dateValue,
        ["MMM D, YYYY", "DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD", "DD-MM-YYYY"],
        true
      );

      if (!momentDate.isValid()) {
        momentDate = moment(dateValue);
      }
    }
  } else if (dateValue instanceof Date) {
    momentDate = moment(
      dateValue.getFullYear() +
        "-" +
        String(dateValue.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(dateValue.getDate()).padStart(2, "0"),
      "YYYY-MM-DD"
    );
  } else {
    momentDate = moment(dateValue);
  }

  return momentDate.isValid() ? momentDate.format("YYYY-MM-DD") : "";
};

export const calculateSixMonthsAfter = (startDate) => {
  if (!startDate) return "";

  const momentDate = moment(startDate, "YYYY-MM-DD", true);

  if (!momentDate.isValid()) {
    return "";
  }

  return momentDate.add(6, "months").format("YYYY-MM-DD");
};

export const getCurrentDate = () => {
  const today = new Date();
  return today.toISOString().split("T")[0];
};

export const getMaxDate = () => {
  const today = new Date();
  const nextYear = today.getFullYear() + 1;
  return `${nextYear}-12-31`;
};

export const isDateBeyondNextYear = (dateString) => {
  if (!dateString) return false;
  const inputDate = new Date(dateString);
  const currentYear = new Date().getFullYear();
  const nextYear = currentYear + 1;
  return inputDate.getFullYear() > nextYear;
};

export const isDateInPast = (dateString) => {
  if (!dateString) return false;
  const inputDate = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return inputDate < today;
};

export const isDateBeforeStartDate = (dateString, startDate) => {
  if (!dateString || !startDate) return false;
  const inputDate = new Date(dateString);
  const startDateObj = new Date(startDate);
  return inputDate < startDateObj;
};

let idCounter = 0;

export const generateUniqueId = (prefix = "employment") => {
  idCounter++;
  return `${prefix}_${Date.now()}_${idCounter}_${Math.random()
    .toString(36)
    .substr(2, 9)}`;
};

export const initializeFormData = (initialData) => {
  if (!initialData) {
    return {
      first_name: "",
      last_name: "",
      image: null,
      image_filename: "",
      image_data_url: "",
      image_url: "",
      region_id: null,
      birth_place: "",
      nationality: "",
      employment_types: [
        {
          id: generateUniqueId(),
          index: 0,
          employment_type_label: "",
          employment_start_date: "",
          employment_end_date: "",
          regularization_date: "",
        },
      ],
    };
  }

  return {
    id: initialData?.id,
    submission_title: initialData?.general_info?.linked_mrf_title || "",
    image: null,
    image_filename: initialData?.general_info?.image_url_filename || "",
    image_data_url: "",
    image_url: initialData?.general_info?.image_url || "",
    first_name: initialData?.general_info?.first_name || "",
    last_name: initialData?.general_info?.last_name || "",
    middle_name: initialData?.general_info?.middle_name || "",
    suffix: initialData?.general_info?.suffix || "",
    prefix: initialData?.general_info?.prefix || null,
    id_number: initialData?.general_info?.id_number || "",
    birth_date: formatDateForForm(initialData?.general_info?.birth_date),
    birth_place: initialData?.general_info?.birth_place || "",
    nationality: initialData?.general_info?.nationality || "",
    gender: initialData?.general_info?.gender || "",
    civil_status: initialData?.general_info?.civil_status || "",
    religion: initialData?.general_info?.religion || null,
    referred_by: initialData?.general_info?.referred_by || "",
    remarks: initialData?.general_info?.remarks || "",

    region_id: initialData?.address?.region || null,
    province_id: initialData?.address?.province || null,
    city_municipality_id: initialData?.address?.city_municipality || null,
    barangay_id: initialData?.address?.barangay || null,
    street: initialData?.address?.street || "",
    zip_code: initialData?.address?.zip_code || "",
    address_remarks: initialData?.address?.remarks || "",
    local_address: initialData?.address?.local_address || "",

    position_id: initialData?.position_details?.position?.id || null,
    position_title: initialData?.position_details?.position?.name || null,
    schedule_id: initialData?.position_details?.schedule || null,
    job_level_id: initialData?.position_details?.job_level || null,
    job_rate: initialData?.position_details?.job_rate || 0,
    allowance: initialData?.position_details?.allowance || null,
    additional_rate: initialData?.position_details?.additional_rate || null,
    additional_rate_remarks:
      initialData?.position_details?.additional_rate_remarks || "",
    additional_tools: initialData?.position_details?.additional_tools || "",

    employment_types:
      initialData?.employment_types && initialData.employment_types.length > 0
        ? initialData.employment_types.map((employment, index) => ({
            id:
              employment.id || generateUniqueId(`employee_employment_${index}`),
            index: index,
            employment_type_label: employment.employment_type_label || "",
            employment_start_date: formatDateForForm(
              employment.start_date || employment.employment_start_date
            ),
            employment_end_date: formatDateForForm(
              employment.end_date || employment.employment_end_date
            ),
            regularization_date: formatDateForForm(
              employment.regularization_date
            ),
          }))
        : [
            {
              id: generateUniqueId(),
              index: 0,
              employment_type_label: "",
              employment_start_date: "",
              employment_end_date: "",
              regularization_date: "",
            },
          ],

    academic_year_from: initialData?.attainments?.[0]?.academic_year_from || "",
    academic_year_to: initialData?.attainments?.[0]?.academic_year_to || "",
    program_id: initialData?.attainments?.[0]?.program || null,
    degree_id: initialData?.attainments?.[0]?.degree || null,
    honor_title_id: initialData?.attainments?.[0]?.honor_title || null,
    attainment_id: initialData?.attainments?.[0]?.attainment || null,
    gpa: initialData?.attainments?.[0]?.gpa || "",
    institution: initialData?.attainments?.[0]?.institution || "",
    attainment_remarks: initialData?.attainments?.[0]?.attainment_remarks || "",
    attainment_attachment:
      initialData?.attainments?.[0]?.attainment_attachment || null,
    existing_attachment_filename:
      initialData?.attainments?.[0]?.attainment_attachment_filename || null,
    existing_attachment_url:
      initialData?.attainments?.[0]?.attainment_attachment || "",
    attachment_url: initialData?.attainments?.[0]?.attainment_attachment || "",
    attachment_filename:
      initialData?.attainments?.[0]?.attainment_attachment_filename || "",
    has_existing_attachment:
      !!initialData?.attainments?.[0]?.attainment_attachment,

    sss_number: initialData?.account?.sss_number || "",
    pag_ibig_number: initialData?.account?.pag_ibig_number || "",
    philhealth_number: initialData?.account?.philhealth_number || "",
    tin_number: initialData?.account?.tin_number || "",
    bank: initialData?.account?.bank || null,
    bank_account_number: initialData?.account?.bank_account_number || "",

    email_address: initialData?.contacts?.email_address || "",
    email_address_remarks: initialData?.contacts?.email_address_remarks || "",
    mobile_number: initialData?.contacts?.mobile_number || "",
    mobile_number_remarks: initialData?.contacts?.mobile_number_remarks || "",

    files:
      initialData?.files?.map((file) => ({
        ...file,
        file_attachment: file.file_name,
      })) || [],
  };
};

export const applyEmploymentTypeLogic = (employmentTypes, setValue) => {
  if (!employmentTypes || !Array.isArray(employmentTypes)) return;

  employmentTypes.forEach((employment, index) => {
    const employmentType = employment.employment_type_label;

    if (employmentType === "REGULAR") {
      if (employment.employment_start_date) {
        setValue(`employment_types.${index}.employment_start_date`, "", {
          shouldValidate: true,
          shouldDirty: true,
        });
      }
      if (employment.employment_end_date) {
        setValue(`employment_types.${index}.employment_end_date`, "", {
          shouldValidate: true,
          shouldDirty: true,
        });
      }
    } else {
      if (employment.regularization_date) {
        setValue(`employment_types.${index}.regularization_date`, "", {
          shouldValidate: true,
          shouldDirty: true,
        });
      }
    }
  });
};

export const handleEmploymentTypeChange = (
  index,
  newType,
  setValue,
  getValues
) => {
  const currentEmploymentTypes = getValues("employment_types") || [];
  const updatedEmploymentTypes = [...currentEmploymentTypes];

  if (updatedEmploymentTypes[index]) {
    updatedEmploymentTypes[index].employment_type_label = newType;

    if (newType === "REGULAR") {
      updatedEmploymentTypes[index].employment_start_date = "";
      updatedEmploymentTypes[index].employment_end_date = "";
    } else {
      updatedEmploymentTypes[index].regularization_date = "";
    }

    setValue("employment_types", updatedEmploymentTypes, {
      shouldValidate: true,
      shouldDirty: true,
    });
  }
};

export const handleStartDateChange = (
  index,
  newStartDate,
  setValue,
  getValues
) => {
  const currentEmploymentTypes = getValues("employment_types") || [];
  const updatedEmploymentTypes = [...currentEmploymentTypes];

  if (updatedEmploymentTypes[index]) {
    updatedEmploymentTypes[index].employment_start_date = newStartDate;

    setValue("employment_types", updatedEmploymentTypes, {
      shouldValidate: true,
      shouldDirty: true,
    });
  }
};

export const validateStep = async (activeStep, trigger) => {
  try {
    const isValid = await trigger();
    return { isValid };
  } catch (error) {
    return { isValid: false, error: error.message };
  }
};

export const getDialogTitle = (currentMode) => {
  if (currentMode === "view") return "VIEW EMPLOYEE DETAILS";
  if (currentMode === "create") return "CREATE NEW EMPLOYEE";
  return "UPDATE EMPLOYEE DETAILS";
};

export const getDialogTitleStyles = () => ({
  color: "rgb(33, 61, 112) !important",
});

export const getDialogTitleSx = () => ({
  color: "rgb(33, 61, 112)",
});

export const createDialogConfig = (
  open,
  handleClose,
  currentMode,
  maxWidth = "lg",
  fullWidth = true,
  height = "90vh"
) => ({
  open,
  onClose: handleClose,
  maxWidth,
  fullWidth,
  PaperProps: {
    sx: {
      height,
      maxHeight: height,
      display: "flex",
      flexDirection: "column",
    },
  },
  title: {
    text: getDialogTitle(currentMode),
    sx: getDialogTitleSx(),
  },
});

export const createLoadingDialog = (
  open,
  message = "Loading employee data..."
) => ({
  open,
  maxWidth: "lg",
  fullWidth: true,
  PaperProps: {
    sx: {
      height: "90vh",
      maxHeight: "90vh",
      display: "flex",
      flexDirection: "column",
    },
  },
  content: {
    sx: { p: 3, textAlign: "center" },
    message,
  },
});

export const createErrorDialog = (
  open,
  handleClose,
  error = "Failed to load employee data. Please try again."
) => ({
  open,
  maxWidth: "lg",
  fullWidth: true,
  PaperProps: {
    sx: {
      height: "90vh",
      maxHeight: "90vh",
      display: "flex",
      flexDirection: "column",
    },
  },
  content: {
    sx: { p: 3, textAlign: "center" },
    title: "Error Loading Data",
    message: error,
    onClose: handleClose,
  },
});

export const createNotificationConfig = (submissionResult) => {
  if (!submissionResult) return null;

  const isError = submissionResult.type === "error";

  return {
    show: true,
    type: submissionResult.type,
    message: submissionResult.message,
    sx: {
      mb: 2,
      display: "flex",
      alignItems: "center",
      gap: 1,
      px: 2,
      py: 1,
      backgroundColor: isError ? "#ffebee" : "#e8f5e8",
      borderRadius: 1,
      border: `1px solid ${isError ? "#ffcdd2" : "#c8e6c9"}`,
    },
    iconColor: isError ? "#d32f2f" : "#2e7d32",
    textColor: isError ? "#d32f2f" : "#2e7d32",
  };
};

export const triggerRefetch = async (onRefetch, refetchQueries) => {
  try {
    if (onRefetch && typeof onRefetch === "function") {
      await onRefetch();
    }

    if (refetchQueries && Array.isArray(refetchQueries)) {
      const refetchPromises = refetchQueries.map((query) => {
        if (query && typeof query.refetch === "function") {
          return query.refetch();
        }
        return Promise.resolve();
      });
      await Promise.all(refetchPromises);
    }
  } catch (error) {}
};

export const transformEmploymentTypesForAPI = (employmentTypes) => {
  if (!employmentTypes || !Array.isArray(employmentTypes)) {
    return [];
  }

  return employmentTypes.map((employment) => ({
    employment_type_label: employment.employment_type_label,
    start_date: employment.employment_start_date || null,
    end_date: employment.employment_end_date || null,
    regularization_date: employment.regularization_date || null,
  }));
};

export const flattenEmploymentTypesForAPI = (employmentTypes) => {
  if (!employmentTypes || employmentTypes.length === 0) {
    return {
      employment_type_label: "",
      employment_start_date: "",
      employment_end_date: "",
      regularization_date: "",
    };
  }

  const firstEmpType = employmentTypes[0];

  return {
    employment_type_label: firstEmpType.employment_type_label || "",
    employment_start_date: firstEmpType.employment_start_date || "",
    employment_end_date: firstEmpType.employment_end_date || "",
    regularization_date: firstEmpType.regularization_date || "",
  };
};

export const hasEmploymentTypesChanged = (currentData, originalData) => {
  if (!currentData || !originalData) return true;

  if (currentData.length !== originalData.length) return true;

  for (let i = 0; i < currentData.length; i++) {
    const current = currentData[i];
    const original = originalData[i];

    if (!original) return true;

    if (current.employment_type_label !== original.employment_type_label) {
      return true;
    }

    const currentStartDate = normalizeDateForComparison(
      current.employment_start_date
    );
    const originalStartDate = normalizeDateForComparison(
      original.start_date || original.employment_start_date
    );

    const currentEndDate = normalizeDateForComparison(
      current.employment_end_date
    );
    const originalEndDate = normalizeDateForComparison(
      original.end_date || original.employment_end_date
    );

    const currentRegDate = normalizeDateForComparison(
      current.regularization_date
    );
    const originalRegDate = normalizeDateForComparison(
      original.regularization_date
    );

    if (
      currentStartDate !== originalStartDate ||
      currentEndDate !== originalEndDate ||
      currentRegDate !== originalRegDate
    ) {
      return true;
    }
  }

  return false;
};

export const hasFormDataChanged = (currentData, originalData) => {
  if (!originalData) return true;

  const employmentChanged = hasEmploymentTypesChanged(
    currentData.employment_types,
    originalData.employment_types
  );

  if (employmentChanged) return true;

  return false;
};
