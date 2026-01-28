import React from "react";
import { Badge, Box } from "@mui/material";
import moduleApi from "../features/api/usermanagement/dashboardApi";
import formSubmissionApi from "../features/api/approvalsetting/formSubmissionApi";

const NotificationBadge = ({
  count = 0,
  children,
  color = "error",
  max = 99,
  showZero = false,
  position = "icon",
  text = "",
}) => {
  const shouldShowBadge = showZero ? count >= 0 : count > 0;

  if (position === "text") {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
        }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          {children}
          <span
            style={{
              marginLeft: "10px",
              fontFamily: "inherit",
              fontSize: "inherit",
              fontWeight: "inherit",
              color: "inherit",
            }}>
            {text}
          </span>
        </Box>
        {shouldShowBadge && (
          <Box sx={{ marginRight: "8px" }}>
            <Box
              sx={{
                backgroundColor: "#ff5252",
                color: "white",
                fontSize: "0.65rem",
                height: "18px",
                minWidth: "18px",
                borderRadius: "9px",
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0 4px",
              }}>
              {count > max ? `${max}+` : count}
            </Box>
          </Box>
        )}
      </Box>
    );
  }

  return (
    <Badge
      badgeContent={shouldShowBadge ? count : null}
      color={color}
      max={max}
      sx={{
        "& .MuiBadge-badge": {
          backgroundColor: "#ff5252",
          color: "white",
          fontSize: "0.65rem",
          height: "16px",
          minWidth: "16px",
          borderRadius: "8px",
          right: 4,
          top: 4,
          fontWeight: "bold",
          zIndex: 1,
        },
      }}>
      {children}
    </Badge>
  );
};

export const calculateCounts = (dashboardData = {}) => {
  const apiResult = dashboardData?.result || {};
  const employees = apiResult.employees || {};
  const requisition = apiResult.requisition || {};
  const pendingRegistrations =
    typeof requisition.pending_registrations === "number"
      ? requisition.pending_registrations
      : 0;
  const manpower = requisition.manpower || {};
  const dataChange = requisition.data_change || {};
  const da = requisition.da || {};
  const daRecommendation = requisition.da_recommendation || {};
  const probationary = requisition.probationary || {};
  const probationaryRecommendation =
    requisition.probationary_recommendation || {};
  const performance = requisition.performance || {};
  const mda = requisition.mda || {};
  const mdaDataChange = mda.data_change || {};
  const mdaDa = mda.da || {};
  const mdaProbationary = mda.probationary || {};
  const daTasks = apiResult.da_tasks || {};
  const cat1Tasks = daTasks.cat1 || {};
  const cat2Tasks = daTasks.cat2 || {};
  const pdpTasks = daTasks.pdp || {};
  const approval = apiResult.approval || {};
  const approvalDataChange = approval.data_change || {};
  const approvalDa = approval.da || {};
  const approvalProbationary = approval.probationary || {};
  const receiving = apiResult.receiving || {};
  const hrProcessing = apiResult.hr_processing || {};

  const manpowerTotal =
    (manpower.rejected || 0) +
    (manpower.returned || 0) +
    (manpower.awaiting_resubmission || 0);

  const dataChangeTotal =
    (dataChange.rejected || 0) + (dataChange.awaiting_resubmission || 0);

  const daTotal = (da.rejected || 0) + (da.awaiting_resubmission || 0);

  const daRecommendationTotal =
    (daRecommendation.for_recommendation || 0) +
    (daRecommendation.rejected || 0) +
    (daRecommendation.awaiting_resubmission || 0);

  const probationaryTotal =
    (probationary.rejected || 0) + (probationary.awaiting_resubmission || 0);

  const probationaryRecommendationTotal =
    (probationaryRecommendation.for_recommendation || 0) +
    (probationaryRecommendation.rejected || 0) +
    (probationaryRecommendation.awaiting_resubmission || 0);

  const performanceTotal =
    (performance.rejected || 0) + (performance.awaiting_resubmission || 0);

  const mdaDataChangeTotal =
    (mdaDataChange.pending_mda_creation || 0) +
    (mdaDataChange.rejected || 0) +
    (mdaDataChange.awaiting_resubmission || 0);

  const mdaDaTotal =
    (mdaDa.pending_mda_creation || 0) +
    (mdaDa.rejected || 0) +
    (mdaDa.awaiting_resubmission || 0);

  const mdaProbationaryTotal =
    (mdaProbationary.pending_mda_creation || 0) +
    (mdaProbationary.rejected || 0) +
    (mdaProbationary.awaiting_resubmission || 0);

  return {
    openMrfs: employees.open_mrfs || 0,
    totalEmployees: employees.total || 0,

    pendingRegistrations: pendingRegistrations,

    manpowerFormRejected: manpower.rejected || 0,
    manpowerFormReturned: manpower.returned || 0,
    manpowerFormAwaiting: manpower.awaiting_resubmission || 0,
    manpowerTotal: manpowerTotal,

    dataChangeRejected: dataChange.rejected || 0,
    dataChangeAwaiting: dataChange.awaiting_resubmission || 0,
    dataChangeTotal: dataChangeTotal,

    daFormRejected: da.rejected || 0,
    daFormAwaiting: da.awaiting_resubmission || 0,
    daTotal: daTotal,

    daRecommendationForRecommendation: daRecommendation.for_recommendation || 0,
    daRecommendationRejected: daRecommendation.rejected || 0,
    daRecommendationAwaiting: daRecommendation.awaiting_resubmission || 0,
    daRecommendationTotal: daRecommendationTotal,

    probationaryRejected: probationary.rejected || 0,
    probationaryAwaiting: probationary.awaiting_resubmission || 0,
    probationaryTotal: probationaryTotal,

    probationaryRecommendationForRecommendation:
      probationaryRecommendation.for_recommendation || 0,
    probationaryRecommendationRejected:
      probationaryRecommendation.rejected || 0,
    probationaryRecommendationAwaiting:
      probationaryRecommendation.awaiting_resubmission || 0,
    probationaryRecommendationTotal: probationaryRecommendationTotal,

    performanceRejected: performance.rejected || 0,
    performanceAwaiting: performance.awaiting_resubmission || 0,
    performanceTotal: performanceTotal,

    cat1ForAssessment: cat1Tasks.for_assessment || 0,
    cat1ForAssessmentOverdue: cat1Tasks.for_assessment_overdue || 0,
    cat1ForSubmission: cat1Tasks.for_submission || 0,
    cat1ForSubmissionOverdue: cat1Tasks.for_submission_overdue || 0,
    cat1Returned: cat1Tasks.returned || 0,
    cat1ReturnedOverdue: cat1Tasks.returned_overdue || 0,
    cat1Total: cat1Tasks.total || 0,
    cat1TotalOverdue: cat1Tasks.total_overdue || 0,

    cat2ForAssessment: cat2Tasks.for_assessment || 0,
    cat2ForAssessmentOverdue: cat2Tasks.for_assessment_overdue || 0,
    cat2ForSubmission: cat2Tasks.for_submission || 0,
    cat2ForSubmissionOverdue: cat2Tasks.for_submission_overdue || 0,
    cat2Returned: cat2Tasks.returned || 0,
    cat2ReturnedOverdue: cat2Tasks.returned_overdue || 0,
    cat2Total: cat2Tasks.total || 0,
    cat2TotalOverdue: cat2Tasks.total_overdue || 0,

    pdpForAssessment: pdpTasks.for_assessment || 0,
    pdpForAssessmentOverdue: pdpTasks.for_assessment_overdue || 0,
    pdpForSubmission: pdpTasks.for_submission || 0,
    pdpForSubmissionOverdue: pdpTasks.for_submission_overdue || 0,
    pdpReturned: pdpTasks.returned || 0,
    pdpReturnedOverdue: pdpTasks.returned_overdue || 0,
    pdpTotal: pdpTasks.total || 0,
    pdpTotalOverdue: pdpTasks.total_overdue || 0,

    daTasksTotal: daTasks.total || 0,
    daTasksTotalOverdue: daTasks.total_overdue || 0,

    dataChangeForMdaProcessing: mdaDataChange.pending_mda_creation || 0,
    mdaDataChangeRejected: mdaDataChange.rejected || 0,
    mdaDataChangeAwaiting: mdaDataChange.awaiting_resubmission || 0,
    mdaDataChangeTotal: mdaDataChangeTotal,

    mdaDaPendingCreation: mdaDa.pending_mda_creation || 0,
    mdaDaRejected: mdaDa.rejected || 0,
    mdaDaAwaiting: mdaDa.awaiting_resubmission || 0,
    mdaDaTotal: mdaDaTotal,

    mdaProbationaryPendingCreation: mdaProbationary.pending_mda_creation || 0,
    mdaProbationaryRejected: mdaProbationary.rejected || 0,
    mdaProbationaryAwaiting: mdaProbationary.awaiting_resubmission || 0,
    mdaProbationaryTotal: mdaProbationaryTotal,

    totalRequisitionCount:
      pendingRegistrations +
      manpowerTotal +
      dataChangeTotal +
      daTotal +
      daRecommendationTotal +
      probationaryTotal +
      probationaryRecommendationTotal +
      performanceTotal +
      mdaDataChangeTotal +
      mdaDaTotal +
      mdaProbationaryTotal,

    manpowerFormApprovals: approval.manpower || 0,
    registrationApprovals: approval.registration || 0,
    dataChangeFormApprovals: approvalDataChange.form || 0,
    mdaApprovals: approvalDataChange.mda || 0,
    daFormApprovals: approvalDa.form || 0,
    daRecommendationApprovals: approvalDa.recommendation || 0,
    daMdaApprovals: approvalDa.mda || 0,
    daMdaInitialApprovals: approvalDa.mda_initial || 0,
    daMdaFinalApprovals: approvalDa.mda_final || 0,
    daCat1Approvals: approvalDa.cat1 || 0,
    daCat2Approvals: approvalDa.cat2 || 0,
    daPdpApprovals: approvalDa.pdp || 0,
    probationaryFormApprovals: approvalProbationary.form || 0,
    probationaryRecommendationApprovals:
      approvalProbationary.recommendation || 0,
    probationaryMdaApprovals: approvalProbationary.mda || 0,
    probationaryMdaInitialApprovals: approvalProbationary.mda_initial || 0,
    probationaryMdaFinalApprovals: approvalProbationary.mda_final || 0,
    performanceApprovals: approval.performance || 0,

    pendingApprovals: approval.total || 0,

    pendingMrfReceiving: receiving.manpower || 0,
    dataChangeReceiving: receiving.data_change || 0,
    daReceiving: receiving.da || 0,
    probationaryReceiving: receiving.probationary || 0,
    performanceReceiving: receiving.performance || 0,
    pendingReceiving: receiving.total || 0,

    hrDataChangeMda: hrProcessing.data_change_mda || 0,
    hrDaMda: hrProcessing.da_mda || 0,
    hrProbationaryMda: hrProcessing.probationary_mda || 0,
    hrEvaluationMda: hrProcessing.probationary_mda || 0,
    totalHrProcessing: hrProcessing.total || 0,
  };
};

export const updateDashboardNotifications = (dispatch) => {
  dispatch(moduleApi.util.invalidateTags(["dashboard"]));
  dispatch(formSubmissionApi.util.invalidateTags(["mrfSubmissions"]));
  dispatch(formSubmissionApi.util.invalidateTags(["formSubmissions"]));
};

export default NotificationBadge;
