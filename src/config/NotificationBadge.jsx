import React from "react";
import { Badge, Box } from "@mui/material";

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

import moduleApi from "../features/api/usermanagement/dashboardApi";
import formSubmissionApi from "../features/api/approvalsetting/formSubmissionApi";

export const calculateCounts = (dashboardData = {}) => {
  const apiResult = dashboardData?.result || {};
  const employees = apiResult.employees || {};
  const requisition = apiResult.requisition || {};
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
  const approval = apiResult.approval || {};
  const approvalDataChange = approval.data_change || {};
  const approvalDa = approval.da || {};
  const approvalProbationary = approval.probationary || {};
  const receiving = apiResult.receiving || {};
  const hrProcessing = apiResult.hr_processing || {};

  return {
    pendingRegistrations: requisition.pending_registrations || 0,

    manpowerFormRejected: manpower.rejected || 0,
    manpowerFormReturned: manpower.returned || 0,
    manpowerFormAwaiting: manpower.awaiting_resubmission || 0,

    dataChangeRejected: dataChange.rejected || 0,
    dataChangeReturned: dataChange.returned || 0,
    dataChangeAwaiting: dataChange.awaiting_resubmission || 0,

    daFormRejected: da.rejected || 0,
    daFormAwaiting: da.awaiting_resubmission || 0,

    daRecommendationRejected: daRecommendation.rejected || 0,
    daRecommendationAwaiting: daRecommendation.awaiting_resubmission || 0,

    probationaryRejected: probationary.rejected || 0,
    probationaryReturned: probationary.returned || 0,
    probationaryAwaiting: probationary.awaiting_resubmission || 0,

    probationaryRecommendationRejected:
      probationaryRecommendation.rejected || 0,
    probationaryRecommendationAwaiting:
      probationaryRecommendation.awaiting_resubmission || 0,

    performanceRejected: performance.rejected || 0,
    performanceReturned: performance.returned || 0,
    performanceAwaiting: performance.awaiting_resubmission || 0,

    dataChangeForMdaProcessing: mdaDataChange.pending_mda_creation || 0,
    mdaDataChangeRejected: mdaDataChange.rejected || 0,
    mdaDataChangeAwaiting: mdaDataChange.awaiting_resubmission || 0,

    mdaDaPendingCreation: mdaDa.pending_mda_creation || 0,
    mdaDaRejected: mdaDa.rejected || 0,
    mdaDaAwaiting: mdaDa.awaiting_resubmission || 0,

    mdaProbationaryPendingCreation: mdaProbationary.pending_mda_creation || 0,
    mdaProbationaryRejected: mdaProbationary.rejected || 0,
    mdaProbationaryAwaiting: mdaProbationary.awaiting_resubmission || 0,

    totalRequisitionCount: requisition.total || 0,

    manpowerFormApprovals: approval.manpower || 0,
    registrationApprovals: approval.registration || 0,
    dataChangeFormApprovals: approvalDataChange.form || 0,
    mdaApprovals: approvalDataChange.mda || 0,
    daFormApprovals: approvalDa.form || 0,
    daRecommendationApprovals: approvalDa.recommendation || 0,
    daMdaApprovals: approvalDa.mda || 0,
    probationaryEvaluationApprovals: approvalProbationary.evaluation || 0,
    probationaryRecommendationApprovals:
      approvalProbationary.recommendation || 0,
    probationaryMdaApprovals: approvalProbationary.mda || 0,
    performanceApprovals: approval.performance || 0,

    pendingApprovals: approval.total || 0,

    pendingMrfReceiving: receiving.manpower || 0,
    dataChangeReceiving: receiving.data_change || 0,
    probationaryReceiving: receiving.probationary || 0,
    performanceReceiving: receiving.performance || 0,
    pendingReceiving: receiving.total || 0,

    hrDataChangeMda: hrProcessing.data_change_mda || 0,
    hrDaMda: hrProcessing.da_mda || 0,
    hrProbationaryMda: hrProcessing.probationary_mda || 0,
    totalHrProcessing: hrProcessing.total || 0,

    catOneApprovals: 0,
    catTwoApprovals: 0,
    pdpApprovals: 0,
  };
};

export const updateDashboardNotifications = (dispatch) => {
  dispatch(moduleApi.util.invalidateTags(["dashboard"]));
  dispatch(formSubmissionApi.util.invalidateTags(["mrfSubmissions"]));
  dispatch(formSubmissionApi.util.invalidateTags(["formSubmissions"]));
};

export default NotificationBadge;
