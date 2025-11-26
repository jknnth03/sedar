import dayjs from "dayjs";

export const getCreateModeInitialValues = () => {
  return {
    form_id: 5,
    da_submission_id: null,
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
    from_job_level_id: null,
    from_job_level: "",
    from_department: "",
    from_sub_unit: "",
    from_job_rate: "",
    from_allowance: "",
    from_additional_rate: "",
    to_position_id: null,
    to_position_title: "",
    to_job_level_id: null,
    to_job_level: "",
    to_department: "",
    to_sub_unit: "",
    to_job_rate: "",
    to_allowance: "",
    to_additional_rate: "",
  };
};

export const setPrefillFormValues = (setValue, prefillData) => {
  if (!prefillData?.result) return;

  const result = prefillData.result;

  const formData = {
    form_id: 5,
    da_submission_id: result.da_submission_id || null,
    employee_id: result.employee_id || "",
    employee_name: result.employee_name || "",
    employee_number: result.employee_number || "",
    effective_date: result.effective_date ? dayjs(result.effective_date) : null,
    action_type: result.movement_type || "",
    birth_date: result.birth_date ? dayjs(result.birth_date) : null,
    birth_place: result.birth_place || "",
    gender: result.gender || "",
    civil_status: result.civil_status || "",
    nationality: result.nationality || "",
    address: result.address || "",
    tin_number: result.tin_number || "",
    sss_number: result.sss_number || "",
    pag_ibig_number: result.pag_ibig_number || "",
    philhealth_number: result.philhealth_number || "",
    from_position_id: result.from?.position_id || null,
    from_position_title: result.from?.position_title || "",
    from_job_level_id: result.from?.job_level_id || null,
    from_job_level: result.from?.job_level || "",
    from_department: result.from?.department || "",
    from_sub_unit: result.from?.sub_unit || "",
    from_job_rate: result.from?.job_rate || "",
    from_allowance: result.from?.allowance || "",
    from_additional_rate: result.from?.additional_rate || "",
    to_position_id: result.to?.position_id || null,
    to_position_title: result.to?.position_title || "",
    to_job_level_id: result.to?.job_level_id || null,
    to_job_level: result.to?.job_level || "",
    to_department: result.to?.department || "",
    to_sub_unit: result.to?.sub_unit || "",
    to_job_rate: result.to?.job_rate || "",
    to_allowance: result.to?.allowance || "",
    to_additional_rate: result.to?.additional_rate || "",
  };

  Object.keys(formData).forEach((key) => {
    setValue(key, formData[key], { shouldValidate: false });
  });
};

export const setSubmissionFormValues = (setValue, submissionData) => {
  if (!submissionData?.result) return;

  const result = submissionData.result;
  const submittable = result.submittable;

  const formData = {
    form_id: 5,
    da_submission_id: result.id || null,
    employee_id: submittable?.employee_id || "",
    employee_name: submittable?.employee_name || "",
    employee_number: submittable?.employee_number || "",
    effective_date: submittable?.effective_date
      ? dayjs(submittable.effective_date)
      : null,
    action_type: submittable?.movement_type || "",
    birth_date: submittable?.birth_date ? dayjs(submittable.birth_date) : null,
    birth_place: submittable?.birth_place || "",
    gender: submittable?.gender || "",
    civil_status: submittable?.civil_status || "",
    nationality: submittable?.nationality || "",
    address: submittable?.address || "",
    tin_number: submittable?.tin_number || "",
    sss_number: submittable?.sss_number || "",
    pag_ibig_number: submittable?.pag_ibig_number || "",
    philhealth_number: submittable?.philhealth_number || "",
    from_position_id: submittable?.from_details?.position_id || null,
    from_position_title: submittable?.from_details?.position_title || "",
    from_job_level_id: submittable?.from_details?.job_level_id || null,
    from_job_level: submittable?.from_details?.job_level || "",
    from_department: submittable?.from_details?.department || "",
    from_sub_unit: submittable?.from_details?.sub_unit || "",
    from_job_rate: submittable?.from_details?.job_rate || "",
    from_allowance: submittable?.from_details?.allowance || "",
    from_additional_rate: submittable?.from_details?.additional_rate || "",
    to_position_id: submittable?.to_details?.position_id || null,
    to_position_title: submittable?.to_details?.position_title || "",
    to_job_level_id: submittable?.to_details?.job_level_id || null,
    to_job_level: submittable?.to_details?.job_level || "",
    to_department: submittable?.to_details?.department || "",
    to_sub_unit: submittable?.to_details?.sub_unit || "",
    to_job_rate: submittable?.to_details?.job_rate || "",
    to_allowance: submittable?.to_details?.allowance || "",
    to_additional_rate: submittable?.to_details?.additional_rate || "",
  };

  Object.keys(formData).forEach((key) => {
    setValue(key, formData[key], { shouldValidate: false });
  });
};

export const setMovementTypeValue = (setValue, movementType) => {
  setValue("action_type", movementType || "");
};

export const getViewEditModeFormData = (selectedEntry, jobLevels = []) => {
  const dataSource = selectedEntry.submittable || selectedEntry;
  const fromDetails = dataSource.from_details || {};
  const toDetails = dataSource.to_details || {};

  let fromJobLevelId = fromDetails.job_level_id || null;
  if (!fromJobLevelId && fromDetails.job_level && jobLevels.length > 0) {
    const matchedJobLevel = jobLevels.find(
      (jl) => jl.name === fromDetails.job_level
    );
    fromJobLevelId = matchedJobLevel?.id || null;
  }

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
    from_additional_rate: fromDetails.additional_rate || "",
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
    to_additional_rate: toDetails.additional_rate || "",
  };
};
