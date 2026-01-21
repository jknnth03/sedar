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
  const pendingRegistrations = requisition.pending_registrations || {};
  const manpower = requisition.manpower || {};
  const dataChange = requisition.data_change || {};
  const da = requisition.da || {};
  const daRecommendation = requisition.da_recommendation || {};
  const probationary = requisition.probationary || {};
  const probationaryRecommendation =
    requisition.probationary_recommendation || {};
  const performance = requisition.performance || {};
  const catOne = requisition.cat_one || {};
  const catTwo = requisition.cat_two || {};
  const pdp = requisition.pdp || {};
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

  const pendingRegistrationsTotal =
    (pendingRegistrations.rejected || 0) +
    (pendingRegistrations.returned || 0) +
    (pendingRegistrations.awaiting_resubmission || 0);

  const manpowerTotal =
    (manpower.rejected || 0) +
    (manpower.returned || 0) +
    (manpower.awaiting_resubmission || 0);

  const dataChangeTotal =
    (dataChange.rejected || 0) +
    (dataChange.returned || 0) +
    (dataChange.awaiting_resubmission || 0);

  const daTotal = (da.rejected || 0) + (da.awaiting_resubmission || 0);

  const daRecommendationTotal =
    (daRecommendation.for_recommendation || 0) +
    (daRecommendation.rejected || 0) +
    (daRecommendation.awaiting_resubmission || 0);

  const probationaryTotal =
    (probationary.rejected || 0) +
    (probationary.returned || 0) +
    (probationary.awaiting_resubmission || 0);

  const probationaryRecommendationTotal =
    (probationaryRecommendation.for_recommendation || 0) +
    (probationaryRecommendation.rejected || 0) +
    (probationaryRecommendation.awaiting_resubmission || 0);

  const performanceTotal =
    (performance.rejected || 0) +
    (performance.returned || 0) +
    (performance.awaiting_resubmission || 0);

  const catOneTotal =
    (catOne.rejected || 0) +
    (catOne.returned || 0) +
    (catOne.awaiting_resubmission || 0);

  const catTwoTotal =
    (catTwo.rejected || 0) +
    (catTwo.returned || 0) +
    (catTwo.awaiting_resubmission || 0);

  const pdpTotal =
    (pdp.rejected || 0) +
    (pdp.returned || 0) +
    (pdp.awaiting_resubmission || 0);

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

    pendingRegistrationsRejected: pendingRegistrations.rejected || 0,
    pendingRegistrationsReturned: pendingRegistrations.returned || 0,
    pendingRegistrationsAwaiting:
      pendingRegistrations.awaiting_resubmission || 0,
    pendingRegistrations: pendingRegistrationsTotal,

    manpowerFormRejected: manpower.rejected || 0,
    manpowerFormReturned: manpower.returned || 0,
    manpowerFormAwaiting: manpower.awaiting_resubmission || 0,
    manpowerTotal: manpowerTotal,

    dataChangeRejected: dataChange.rejected || 0,
    dataChangeReturned: dataChange.returned || 0,
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
    probationaryReturned: probationary.returned || 0,
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
    performanceReturned: performance.returned || 0,
    performanceAwaiting: performance.awaiting_resubmission || 0,
    performanceTotal: performanceTotal,

    catOneRejected: catOne.rejected || 0,
    catOneReturned: catOne.returned || 0,
    catOneAwaiting: catOne.awaiting_resubmission || 0,
    catOneTotal: catOneTotal,

    catTwoRejected: catTwo.rejected || 0,
    catTwoReturned: catTwo.returned || 0,
    catTwoAwaiting: catTwo.awaiting_resubmission || 0,
    catTwoTotal: catTwoTotal,

    pdpRejected: pdp.rejected || 0,
    pdpReturned: pdp.returned || 0,
    pdpAwaiting: pdp.awaiting_resubmission || 0,
    pdpTotal: pdpTotal,

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
      pendingRegistrationsTotal +
      manpowerTotal +
      dataChangeTotal +
      daTotal +
      daRecommendationTotal +
      probationaryTotal +
      probationaryRecommendationTotal +
      performanceTotal +
      catOneTotal +
      catTwoTotal +
      pdpTotal +
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
    probationaryFormApprovals: approvalProbationary.form || 0,
    probationaryRecommendationApprovals:
      approvalProbationary.recommendation || 0,
    probationaryMdaApprovals: approvalProbationary.mda || 0,
    performanceApprovals: approval.performance || 0,
    catOneApprovals: approval.cat_one || 0,
    catTwoApprovals: approval.cat_two || 0,
    pdpApprovals: approval.pdp || 0,

    pendingApprovals:
      (approval.total || 0) +
      (approval.cat_one || 0) +
      (approval.cat_two || 0) +
      (approval.pdp || 0),

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
