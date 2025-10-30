import dayjs from "dayjs";

export const setPrefillFormValues = (setValue, data) => {
  if (!data) return;

  setMovementTypeValue(setValue, data.movement_type);

  setValue("employee_movement_id", data.employee_movement_id || null);
  setValue("employee_id", data.employee_id || "");
  setValue("employee_name", data.employee_name || "");
  setValue("employee_number", data.employee_number || "");
  setValue(
    "effective_date",
    data.effective_date ? dayjs(data.effective_date) : null
  );
  setValue("action_type", data.movement_type || "");
  setValue("birth_date", data.birth_date ? dayjs(data.birth_date) : null);
  setValue("birth_place", data.birth_place || "");
  setValue("gender", data.gender || "");
  setValue("civil_status", data.civil_status || "");
  setValue("nationality", data.nationality || "");
  setValue("address", data.address || "");
  setValue("tin_number", data.tin_number || "");
  setValue("sss_number", data.sss_number || "");
  setValue("pag_ibig_number", data.pag_ibig_number || "");
  setValue("philhealth_number", data.philhealth_number || "");

  if (data.from) {
    setValue("from_position_id", data.from.position_id || null);
    setValue("from_position_title", data.from.position_title || "");
    setValue("from_department", data.from.department || "");
    setValue("from_sub_unit", data.from.sub_unit || "");
    setValue("from_job_level", data.from.job_level || "");
    setValue("from_job_level_id", data.from.job_level_id || null);
    setValue("from_schedule", data.from.schedule || "");
    setValue(
      "from_job_rate",
      data.from.job_rate ? String(data.from.job_rate) : ""
    );
    setValue(
      "from_allowance",
      data.from.allowance ? String(data.from.allowance) : ""
    );
  }

  if (data.to) {
    setValue("to_position_id", data.to.position_id || null);
    setValue("to_position_title", data.to.position_title || "");
    setValue("to_department", data.to.department || "");
    setValue("to_sub_unit", data.to.sub_unit || "");
    setValue("to_job_level_id", data.to.job_level_id || null);
    setValue("to_job_level", data.to.job_level || "");
    setValue("to_schedule", data.to.schedule || "");
    setValue("to_job_rate", data.to.job_rate ? String(data.to.job_rate) : "");
    setValue(
      "to_allowance",
      data.to.allowance ? String(data.to.allowance) : ""
    );
  }
};

export const setMovementTypeValue = (setValue, movementType) => {
  setValue("action_type", movementType || "");
};

export const getCreateModeInitialValues = () => {
  return {
    form_id: 5,
    employee_movement_id: null,
    employee_id: "",
    employee_name: "",
    employee_number: "",
    effective_date: null,
    action_type: "",
    birth_date: null,
    birth_place: "",
    gender: "",
    civil_status: "",
    nationality: "",
    address: "",
    tin_number: "",
    sss_number: "",
    pag_ibig_number: "",
    philhealth_number: "",
    from_position_id: null,
    from_position_title: "",
    from_department: "",
    from_sub_unit: "",
    from_job_level: "",
    from_job_level_id: null,
    from_schedule: "",
    from_job_rate: "",
    from_allowance: "",
    to_position_id: null,
    to_position_title: "",
    to_department: "",
    to_sub_unit: "",
    to_job_level_id: null,
    to_job_level: "",
    to_schedule: "",
    to_job_rate: "",
    to_allowance: "",
  };
};

export const getViewEditModeFormData = (selectedEntry, jobLevels = []) => {
  const dataSource = selectedEntry.submittable || selectedEntry;
  const fromDetails = dataSource.from_details || {};
  const toDetails = dataSource.to_details || {};

  // Lookup job_level_id for "from" if not provided
  let fromJobLevelId = fromDetails.job_level_id || null;
  if (!fromJobLevelId && fromDetails.job_level && jobLevels.length > 0) {
    const matchedJobLevel = jobLevels.find(
      (jl) => jl.name === fromDetails.job_level
    );
    fromJobLevelId = matchedJobLevel?.id || null;
  }

  // Lookup job_level_id for "to" if not provided
  let toJobLevelId = toDetails.job_level_id || null;
  if (!toJobLevelId && toDetails.job_level && jobLevels.length > 0) {
    const matchedJobLevel = jobLevels.find(
      (jl) => jl.name === toDetails.job_level
    );
    toJobLevelId = matchedJobLevel?.id || null;
  }

  return {
    form_id: selectedEntry.form?.id || 5,
    employee_movement_id: dataSource.id || null,
    employee_id: dataSource.employee_id || "",
    employee_name: dataSource.employee_name || "",
    employee_number: dataSource.employee_number || "",
    effective_date: dataSource.effective_date
      ? dayjs(dataSource.effective_date)
      : null,
    action_type: dataSource.movement_type || "",
    birth_date: dataSource.birth_date ? dayjs(dataSource.birth_date) : null,
    birth_place: dataSource.birth_place || "",
    gender: dataSource.gender || "",
    civil_status: dataSource.civil_status || "",
    nationality: dataSource.nationality || "",
    address: dataSource.address || "",
    tin_number: dataSource.tin_number || "",
    sss_number: dataSource.sss_number || "",
    pag_ibig_number: dataSource.pag_ibig_number || "",
    philhealth_number: dataSource.philhealth_number || "",
    from_position_id: fromDetails.position_id || null,
    from_position_title: fromDetails.position_title || "",
    from_department: fromDetails.department || "",
    from_sub_unit: fromDetails.sub_unit || "",
    from_job_level: fromDetails.job_level || "",
    from_job_level_id: fromJobLevelId,
    from_schedule: fromDetails.schedule || "",
    from_job_rate: fromDetails.job_rate || "",
    from_allowance: fromDetails.allowance || "",
    to_position_id: toDetails.position_id || null,
    to_position_title: toDetails.position_title || "",
    to_department:
      typeof toDetails.department === "object"
        ? toDetails.department?.name || ""
        : toDetails.department || "",
    to_sub_unit:
      typeof toDetails.sub_unit === "object"
        ? toDetails.sub_unit?.name || ""
        : toDetails.sub_unit || "",
    to_job_level_id: toJobLevelId,
    to_job_level: toDetails.job_level || "",
    to_schedule: toDetails.schedule || "",
    to_job_rate: toDetails.job_rate || "",
    to_allowance: toDetails.allowance || "",
  };
};
