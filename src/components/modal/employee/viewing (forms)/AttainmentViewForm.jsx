import React, { useEffect, useState, useMemo } from "react";
import { Box, Alert, TextField, Grid, Typography, Button } from "@mui/material";
import { Download, CloudUpload } from "@mui/icons-material";
import { useGetEmployeesQuery } from "../../../../features/api/employee/mainApi";
import { useGetAllShowProgramsQuery } from "../../../../features/api/extras/programsApi";
import { useGetAllShowHonorTitlesQuery } from "../../../../features/api/extras/honortitlesApi";
import { useGetAllShowDegreesQuery } from "../../../../features/api/extras/degreesApi";
import { useGetAllShowAttainmentsQuery } from "../../../../features/api/extras/attainmentsApi";
import "../../employee/forms/General.scss";

const AttainmentViewForm = ({ selectedAttainment, employeeId, ...props }) => {
  const [attainmentData, setAttainmentData] = useState({
    program: "N/A",
    degree: "N/A",
    honor_title: "N/A",
    attainments: "N/A",
    academic_year_from: "N/A",
    academic_year_to: "N/A",
    gpa: "N/A",
    institution: "N/A",
    attainment_remarks: "N/A",
    attainment_attachment: null,
  });

  // Update form data when selectedAttainment prop changes
  useEffect(() => {
    if (selectedAttainment) {
      setAttainmentData({
        // Extract the 'name' property from objects, fallback to "N/A"
        program: selectedAttainment.program?.name || "N/A",
        degree: selectedAttainment.degree?.name || "N/A",
        honor_title: selectedAttainment.honor_title?.name || "N/A",
        attainments: selectedAttainment.attainment?.name || "N/A", // Note: it's 'attainment' in the API, not 'attainments'
        academic_year_from: selectedAttainment.academic_year_from || "N/A",
        academic_year_to: selectedAttainment.academic_year_to || "N/A",
        gpa: selectedAttainment.gpa || "N/A",
        institution: selectedAttainment.institution || "N/A",
        attainment_remarks: selectedAttainment.attainment_remarks || "N/A",
        attainment_attachment: selectedAttainment.attainment_attachment || null,
      });
    }
  }, [selectedAttainment]);

  const handleDownloadAttachment = () => {
    if (attainmentData.attainment_attachment) {
      // Create a temporary link to download the file
      const link = document.createElement("a");
      link.href = attainmentData.attainment_attachment;
      link.download =
        attainmentData.attainment_attachment.split("/").pop() ||
        "attainment_file";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // No attainment data
  if (!selectedAttainment) {
    return (
      <Box className="general-form">
        <Alert severity="info" className="general-form__alert">
          No attainment information available for this employee.
        </Alert>
      </Box>
    );
  }

  return (
    <Box className="general-form">
      <Grid container spacing={2} className="general-form__grid">
        {/* Row 1: Program, Degree, Honor Title, Attainments */}
        <Grid item xs={3} className="general-form__grid-item">
          <TextField
            label="Program"
            name="program"
            variant="outlined"
            fullWidth
            value={attainmentData.program}
            InputProps={{
              readOnly: true,
            }}
            placeholder="Not provided"
            className="general-form__text-field"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                backgroundColor: "#f5f5f5",
              },
              "& .MuiInputBase-input": {
                color: "#666",
              },
            }}
          />
        </Grid>

        <Grid item xs={3} className="general-form__grid-item">
          <TextField
            label="Degree"
            name="degree"
            variant="outlined"
            fullWidth
            value={attainmentData.degree}
            InputProps={{
              readOnly: true,
            }}
            placeholder="Not provided"
            className="general-form__text-field"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                backgroundColor: "#f5f5f5",
              },
              "& .MuiInputBase-input": {
                color: "#666",
              },
            }}
          />
        </Grid>

        <Grid item xs={3} className="general-form__grid-item">
          <TextField
            label="Honor Title"
            name="honor_title"
            variant="outlined"
            fullWidth
            value={attainmentData.honor_title}
            InputProps={{
              readOnly: true,
            }}
            placeholder="Not provided"
            className="general-form__text-field"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                backgroundColor: "#f5f5f5",
              },
              "& .MuiInputBase-input": {
                color: "#666",
              },
            }}
          />
        </Grid>

        <Grid item xs={3} className="general-form__grid-item">
          <TextField
            label="Attainments"
            name="attainments"
            variant="outlined"
            fullWidth
            value={attainmentData.attainments}
            InputProps={{
              readOnly: true,
            }}
            placeholder="Not provided"
            className="general-form__text-field"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                backgroundColor: "#f5f5f5",
              },
              "& .MuiInputBase-input": {
                color: "#666",
              },
            }}
          />
        </Grid>

        {/* Row 2: Academic Years, GPA */}
        <Grid item xs={4} className="general-form__grid-item">
          <TextField
            label="Academic Year From"
            name="academic_year_from"
            variant="outlined"
            fullWidth
            value={attainmentData.academic_year_from}
            InputProps={{
              readOnly: true,
            }}
            placeholder="Not provided"
            className="general-form__text-field"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                backgroundColor: "#f5f5f5",
              },
              "& .MuiInputBase-input": {
                color: "#666",
              },
            }}
          />
        </Grid>

        <Grid item xs={4} className="general-form__grid-item">
          <TextField
            label="Academic Year To"
            name="academic_year_to"
            variant="outlined"
            fullWidth
            value={attainmentData.academic_year_to}
            InputProps={{
              readOnly: true,
            }}
            placeholder="Not provided"
            className="general-form__text-field"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                backgroundColor: "#f5f5f5",
              },
              "& .MuiInputBase-input": {
                color: "#666",
              },
            }}
          />
        </Grid>

        <Grid item xs={4} className="general-form__grid-item">
          <TextField
            label="GPA"
            name="gpa"
            variant="outlined"
            fullWidth
            value={attainmentData.gpa}
            InputProps={{
              readOnly: true,
            }}
            placeholder="Not provided"
            className="general-form__text-field"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                backgroundColor: "#f5f5f5",
              },
              "& .MuiInputBase-input": {
                color: "#666",
              },
            }}
          />
        </Grid>

        {/* Row 3: Institution and Attainment Remarks */}
        <Grid item xs={6} className="general-form__grid-item">
          <TextField
            label="Institution"
            name="institution"
            variant="outlined"
            fullWidth
            value={attainmentData.institution}
            InputProps={{
              readOnly: true,
            }}
            placeholder="Not provided"
            className="general-form__text-field"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                backgroundColor: "#f5f5f5",
              },
              "& .MuiInputBase-input": {
                color: "#666",
              },
            }}
          />
        </Grid>

        {/* Row 3: Attainment Remarks (NOW SPANS FULL WIDTH - xs={12}) */}
        <Grid item xs={12} className="general-form__grid-item">
          <TextField
            label="Attainment Remarks"
            name="attainment_remarks"
            variant="outlined"
            fullWidth
            value={attainmentData.attainment_remarks}
            InputProps={{
              readOnly: true,
            }}
            placeholder="No remarks provided"
            sx={{
              width: "353px",
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                backgroundColor: "#f5f5f5",
              },
              "& .MuiInputBase-input": {
                color: "#666",
              },
              "& .MuiInputLabel-root": {
                color: "rgb(33, 61, 112)",
                "&.Mui-focused": {
                  color: "rgb(33, 61, 112)",
                },
              },
              "& .MuiFormLabel-root": {
                color: "rgb(33, 61, 112)",
                "&.Mui-focused": {
                  color: "rgb(33, 61, 112)",
                },
              },
            }}
          />
        </Grid>

        {/* Row 4: Attachment section - spans full width (12 columns) */}
        <Grid item xs={12} className="general-form__grid-item">
          <Box
            sx={{
              width: "1094px",
              border: "2px dashed #ccc",
              borderRadius: 2,
              height: "56px", // Same height as TextField
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#f9f9f9",
              cursor: attainmentData.attainment_attachment
                ? "pointer"
                : "default",
              "&:hover": attainmentData.attainment_attachment
                ? {
                    backgroundColor: "#f0f0f0",
                    borderColor: "#999",
                  }
                : {},
            }}
            onClick={
              attainmentData.attainment_attachment
                ? handleDownloadAttachment
                : undefined
            }>
            <CloudUpload
              sx={{
                fontSize: 24,
                color: attainmentData.attainment_attachment
                  ? "rgb(33, 61, 112)"
                  : "#ccc",
                mr: 1,
              }}
            />
            <Typography
              variant="body2"
              sx={{
                color: attainmentData.attainment_attachment
                  ? "rgb(33, 61, 112)"
                  : "#666",
                fontWeight: "bold",
              }}>
              {attainmentData.attainment_attachment
                ? `CLICK HERE TO DOWNLOAD ATTAINMENT FILE - ${
                    typeof attainmentData.attainment_attachment === "string"
                      ? attainmentData.attainment_attachment.split("/").pop()
                      : "ATTACHMENT"
                  } - PDF FILE`
                : "NO ATTACHMENT - PDF FILE ONLY (MAX: 10MB)"}
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

AttainmentViewForm.displayName = "AttainmentViewForm";

export default AttainmentViewForm;
