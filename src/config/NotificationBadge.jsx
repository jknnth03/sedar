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

  return {
    pendingRegistrations: apiResult.employees?.pending_registrations || 0,

    pendingApprovals:
      (apiResult.approval?.manpower_form || 0) +
      (apiResult.approval?.registration_approval || 0) +
      (apiResult.approval?.data_change_approval || 0) +
      (apiResult.approval?.mda_approval || 0) +
      (apiResult.approval?.da_mda_approval || 0) +
      (apiResult.approval?.da_form_approval || 0) +
      (apiResult.approval?.cat_one_approval || 0) +
      (apiResult.approval?.cat_two_approval || 0) +
      (apiResult.approval?.pdp_approval || 0),
    manpowerFormApprovals: apiResult.approval?.manpower_form || 0,
    registrationApprovals: apiResult.approval?.registration_approval || 0,
    dataChangeApprovals: apiResult.approval?.data_change_approval || 0,
    mdaApprovals: apiResult.approval?.mda_approval || 0,
    daMdaApprovals: apiResult.approval?.da_mda_approval || 0,
    daFormApprovals: apiResult.approval?.da_form_approval || 0,
    catOneApprovals: apiResult.approval?.cat_one_approval || 0,
    catTwoApprovals: apiResult.approval?.cat_two_approval || 0,
    pdpApprovals: apiResult.approval?.pdp_approval || 0,

    pendingReceiving:
      (apiResult.receiving?.pending_mrfs || 0) +
      (apiResult.receiving?.pending_data_changes || 0),
    pendingMrfReceiving: apiResult.receiving?.pending_mrfs || 0,
    pendingDataChangeReceiving: apiResult.receiving?.pending_data_changes || 0,

    manpowerFormRejected: apiResult.requisition?.manpower_form_rejected || 0,
    manpowerFormReturned: apiResult.requisition?.manpower_form_returned || 0,
    manpowerFormAwaiting:
      apiResult.requisition?.manpower_form_awaiting_for_resubmission || 0,
    dataChangeRejected: apiResult.requisition?.data_change_rejected || 0,
    dataChangeForMdaProcessing:
      apiResult.requisition?.data_change_for_mda_processing || 0,

    totalRequisitionCount:
      (apiResult.requisition?.manpower_form_rejected || 0) +
      (apiResult.requisition?.manpower_form_returned || 0) +
      (apiResult.requisition?.manpower_form_awaiting_for_resubmission || 0) +
      (apiResult.requisition?.data_change_rejected || 0) +
      (apiResult.requisition?.data_change_for_mda_processing || 0) +
      (apiResult.employees?.pending_registrations || 0),
  };
};

export const updateDashboardNotifications = (dispatch) => {
  dispatch(moduleApi.util.invalidateTags(["dashboard"]));
  dispatch(formSubmissionApi.util.invalidateTags(["mrfSubmissions"]));
  dispatch(formSubmissionApi.util.invalidateTags(["formSubmissions"]));
};

export default NotificationBadge;
