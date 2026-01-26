import React from "react";
import { Box } from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

const EmployeeHeader = ({
  getValues,
  selectedGeneral,
  initialData,
  selectedPosition,
}) => {
  const formData = getValues();

  const formatAddress = () => {
    const localAddressSources = [
      formData?.local_address,
      selectedGeneral?.local_address,
      formData?.address?.local_address,
      selectedGeneral?.address?.local_address,
    ];

    for (const localAddress of localAddressSources) {
      if (localAddress && localAddress.trim()) {
        return localAddress;
      }
    }

    const addressSources = [
      formData?.address,
      selectedGeneral?.address,
      formData,
      selectedGeneral,
      selectedGeneral?.address_info,
      formData?.address_info,
    ].filter(Boolean);

    for (const source of addressSources) {
      const parts = [
        source.street || source.street_address,
        source.barangay?.name || source.barangay,
        source.city_municipality?.name || source.city_municipality,
        source.province?.name || source.province,
        source.region?.name || source.region,
      ].filter(Boolean);

      if (parts.length > 0) return parts.join(", ");
    }

    return "N/A";
  };

  const getAttainmentLabel = () => {
    const attainmentSources = [
      formData?.attainment?.name,
      selectedGeneral?.attainment?.name,
      formData?.degree?.name,
      selectedGeneral?.degree?.name,
      selectedGeneral?.attainments?.[0]?.attainment?.name,
      selectedGeneral?.attainments?.[0]?.degree?.name,
      formData?.attainments?.[0]?.attainment?.name,
      formData?.attainments?.[0]?.degree?.name,
    ];

    for (const attainment of attainmentSources) {
      if (attainment && attainment !== "N/A") return attainment;
    }

    return "N/A";
  };

  const getImageSrc = () => {
    const imageSources = [
      formData?.general_info?.image_url,
      selectedGeneral?.general_info?.image_url,
      selectedGeneral?.image_url,
      formData?.image_url,
      formData?.result?.general_info?.image_url,
      selectedGeneral?.result?.general_info?.image_url,
    ];

    for (const imageUrl of imageSources) {
      if (imageUrl && typeof imageUrl === "string" && imageUrl.trim()) {
        return imageUrl;
      }
    }

    if (formData?.image_data_url && formData.image_data_url.trim()) {
      return formData.image_data_url;
    }

    const employeeId = formData?.id || selectedGeneral?.id;
    if (employeeId) {
      return `http://10.10.13.9:8001/employees/${employeeId}/image`;
    }

    if (formData?.image && formData.image instanceof File) {
      return URL.createObjectURL(formData.image);
    }

    return null;
  };

  const getFullName = () => {
    if (formData?.full_name) return formData.full_name;
    if (selectedGeneral?.full_name) return selectedGeneral.full_name;

    const nameSources = [
      { ...selectedGeneral?.general_info, ...formData },
      selectedGeneral,
      formData,
    ];

    for (const source of nameSources) {
      if (source) {
        const parts = [
          source.last_name,
          source.first_name,
          source.middle_name,
        ].filter(Boolean);

        if (parts.length > 0) return parts.join(", ");
      }
    }

    return "N/A";
  };

  const getEmployeeCode = () => {
    const codeSources = [
      selectedGeneral?.employee_code,
      formData?.employee_code,
      formData?.id_number,
      selectedGeneral?.id_number,
      selectedGeneral?.general_info?.id_number,
    ];

    for (const code of codeSources) {
      if (code) {
        const prefix =
          selectedGeneral?.prefix ||
          formData?.prefix ||
          selectedGeneral?.general_info?.prefix;
        if (prefix?.name) {
          return `${prefix.name}-${code}`;
        }
        return code;
      }
    }

    return "N/A";
  };

  const getPosition = () => {
    const positionSources = [
      formData?.position_title,
      formData?.submission_title?.submittable?.position?.title?.name,
      formData?.position?.name,
      selectedGeneral?.position?.name,
      selectedGeneral?.position_details?.position?.name,
      formData?.position_details?.position?.name,
      formData?.position,
      selectedGeneral?.position,
    ];

    for (const position of positionSources) {
      if (position && position !== "N/A") return position;
    }

    return "N/A";
  };

  const getCharging = () => {
    const chargingFromInitialData =
      initialData?.position_details?.charging?.name;
    const chargingFromSelectedPosition = selectedPosition?.charging?.name;
    const chargingFromFormPosition = formData?.position?.charging?.name;
    const chargingFromFormPositionDetails =
      formData?.position_details?.position?.charging?.name;
    const chargingFromSelectedGeneralPosition =
      selectedGeneral?.position?.charging?.name;
    const chargingFromSubmissionTitle =
      formData?.submission_title?.submittable?.position?.charging?.name;
    const chargingFromPositionDetailsEmployee =
      selectedGeneral?.position_details?.employee?.charging?.name;

    const chargingSources = [
      chargingFromInitialData,
      chargingFromSelectedPosition,
      chargingFromSubmissionTitle,
      chargingFromFormPosition,
      chargingFromFormPositionDetails,
      chargingFromSelectedGeneralPosition,
      chargingFromPositionDetailsEmployee,
      formData?.charging_name,
      formData?.charging?.name,
      formData?.charging,
      formData?.position_details?.charging?.name,
      formData?.department?.name,
      formData?.office?.name,
      formData?.unit?.name,
      formData?.division?.name,
      selectedGeneral?.position_details?.charging?.name,
      selectedGeneral?.general_info?.charging?.name,
    ];

    for (const charging of chargingSources) {
      if (charging && charging !== "N/A" && charging !== "") return charging;
    }

    return "N/A";
  };

  const getEmploymentType = () => {
    const employmentSources = [
      formData?.employment_types?.[0]?.employment_type_label,
    ];

    for (const employment of employmentSources) {
      if (employment && employment !== "N/A") return employment;
    }

    return "N/A";
  };

  const getMobileNumber = () => {
    const mobileSources = [
      formData?.mobile_number,
      selectedGeneral?.mobile_number,
      selectedGeneral?.contacts?.mobile_number,
      selectedGeneral?.contact_info?.mobile_number,
      formData?.contacts?.mobile_number,
      formData?.contact_info?.mobile_number,
    ];

    for (const mobile of mobileSources) {
      if (mobile) return mobile;
    }

    return "N/A";
  };

  const getEmailAddress = () => {
    const emailSources = [
      formData?.email_address,
      selectedGeneral?.email_address,
      selectedGeneral?.contacts?.email_address,
      selectedGeneral?.contact_info?.email_address,
      formData?.contacts?.email_address,
      formData?.contact_info?.email_address,
    ];

    for (const email of emailSources) {
      if (email) return email;
    }

    return "N/A";
  };

  const getDevelopmentalAssignment = () => {
    const daSources = [
      formData?.general_info?.developmental_assignment,
      selectedGeneral?.general_info?.developmental_assignment,
      formData?.developmental_assignment,
      selectedGeneral?.developmental_assignment,
    ];

    for (const da of daSources) {
      if (da && da.is_in_da === true) {
        return da;
      }
    }

    return null;
  };

  const imageUrl = getImageSrc();
  const developmentalAssignment = getDevelopmentalAssignment();

  return (
    <Box
      sx={{
        bgcolor: "white",
        border: "1px solid #d1d5db",
        borderRadius: "8px",
        p: 3,
        mb: 3,
        fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
      }}>
      <Box sx={{ display: "flex", gap: 4 }}>
        <Box sx={{ flexShrink: 0 }}>
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="Employee Photo"
              style={{
                width: "112px",
                height: "144px",
                objectFit: "cover",
                borderRadius: "4px",
                border: "1px solid #d1d5db",
              }}
              onError={(e) => {
                e.target.style.display = "none";
                const placeholder = e.target.nextElementSibling;
                if (placeholder) {
                  placeholder.style.display = "flex";
                }
              }}
              onLoad={() => {
                const placeholder = document.querySelector(
                  `[data-placeholder-for="${imageUrl}"]`,
                );
                if (placeholder) {
                  placeholder.style.display = "none";
                }
              }}
            />
          ) : null}
          <Box
            data-placeholder-for={imageUrl}
            sx={{
              width: "112px",
              height: "144px",
              backgroundColor: "#f9fafb",
              border: "1px solid #d1d5db",
              borderRadius: "4px",
              display: imageUrl ? "none" : "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#9ca3af",
              fontSize: "0.75rem",
              textAlign: "center",
              fontWeight: 500,
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
            }}>
            No Photo
            <br />
            Available
          </Box>
        </Box>

        <Box sx={{ flex: 1 }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 3,
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
              mb: 3,
            }}>
            <Box>
              <Box
                component="h3"
                sx={{
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: "#6b7280",
                  textTransform: "uppercase",
                  mb: 0,
                  m: 0,
                  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                }}>
                FULL NAME
              </Box>
              <Box
                sx={{
                  fontSize: "0.875rem",
                  fontWeight: 400,
                  color: "#111827",
                  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                }}>
                {getFullName()}
              </Box>
            </Box>

            <Box>
              <Box
                component="h3"
                sx={{
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: "#6b7280",
                  textTransform: "uppercase",
                  mb: 0,
                  m: 0,
                  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                }}>
                ID NUMBER
              </Box>
              <Box
                sx={{
                  fontSize: "0.875rem",
                  fontWeight: 400,
                  color: "#111827",
                  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                }}>
                {getEmployeeCode()}
              </Box>
            </Box>

            <Box>
              <Box
                component="h3"
                sx={{
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: "#6b7280",
                  textTransform: "uppercase",
                  mb: 0,
                  m: 0,
                  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                }}>
                POSITION
              </Box>
              <Box
                sx={{
                  fontSize: "0.875rem",
                  fontWeight: 400,
                  color: "#111827",
                  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                }}>
                {getPosition()}
              </Box>
            </Box>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 3,
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
              mb: 3,
            }}>
            <Box>
              <Box
                component="h3"
                sx={{
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: "#6b7280",
                  textTransform: "uppercase",
                  mb: 0,
                  m: 0,
                  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                }}>
                CHARGING
              </Box>
              <Box
                sx={{
                  fontSize: "0.875rem",
                  fontWeight: 400,
                  color: "#111827",
                  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                }}>
                {getCharging()}
              </Box>
            </Box>

            <Box>
              <Box
                component="h3"
                sx={{
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: "#6b7280",
                  textTransform: "uppercase",
                  mb: 0,
                  m: 0,
                  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                }}>
                MOBILE NUMBER
              </Box>
              <Box
                sx={{
                  fontSize: "0.875rem",
                  fontWeight: 400,
                  color: "#111827",
                  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                }}>
                {getMobileNumber()}
              </Box>
            </Box>

            {developmentalAssignment ? (
              <Box>
                <Box
                  sx={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "#dc2626 !important",
                    fontFamily:
                      '"Helvetica Neue", Helvetica, Arial, sans-serif',
                    textTransform: "uppercase",
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    mb: 0.5,
                  }}>
                  UNDER DA{" "}
                  <TrendingUpIcon
                    sx={{ fontSize: "1rem", color: "#dc2626 !important" }}
                  />
                </Box>
                <Box
                  sx={{
                    fontSize: "0.875rem",
                    fontWeight: 400,
                    color: "#dc2626 !important",
                    fontFamily:
                      '"Helvetica Neue", Helvetica, Arial, sans-serif',
                  }}>
                  Position: {developmentalAssignment.position_title || "N/A"}
                </Box>
              </Box>
            ) : (
              <Box>
                <Box
                  component="h3"
                  sx={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "#6b7280",
                    textTransform: "uppercase",
                    mb: 0,
                    m: 0,
                    fontFamily:
                      '"Helvetica Neue", Helvetica, Arial, sans-serif',
                  }}>
                  EMAIL ADDRESS
                </Box>
                <Box
                  sx={{
                    fontSize: "0.875rem",
                    fontWeight: 400,
                    color: "#111827",
                    fontFamily:
                      '"Helvetica Neue", Helvetica, Arial, sans-serif',
                  }}>
                  {getEmailAddress()}
                </Box>
              </Box>
            )}
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: developmentalAssignment ? "2fr 1fr" : "1fr",
              gap: 3,
            }}>
            <Box>
              <Box
                component="h3"
                sx={{
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: "#6b7280",
                  textTransform: "uppercase",
                  mb: 0,
                  m: 0,
                  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                }}>
                FULL ADDRESS
              </Box>
              <Box
                sx={{
                  fontSize: "0.875rem",
                  fontWeight: 400,
                  color: "#111827",
                  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                }}>
                {formatAddress()}
              </Box>
            </Box>

            {developmentalAssignment && (
              <Box>
                <Box
                  component="h3"
                  sx={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "#6b7280",
                    textTransform: "uppercase",
                    mb: 0,
                    m: 0,
                    fontFamily:
                      '"Helvetica Neue", Helvetica, Arial, sans-serif',
                  }}>
                  EMAIL ADDRESS
                </Box>
                <Box
                  sx={{
                    fontSize: "0.875rem",
                    fontWeight: 400,
                    color: "#111827",
                    fontFamily:
                      '"Helvetica Neue", Helvetica, Arial, sans-serif',
                  }}>
                  {getEmailAddress()}
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default EmployeeHeader;
