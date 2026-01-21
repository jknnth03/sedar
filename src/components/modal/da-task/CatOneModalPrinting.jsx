import React, { useRef } from "react";
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material";
import { Print as PrintIcon } from "@mui/icons-material";
import { styled } from "@mui/material/styles";

const PrintContainer = styled(Box)({
  width: "210mm",
  minHeight: "auto",
  padding: "20mm",
  margin: "0 auto",
  backgroundColor: "white",
  boxShadow: "0 0 10px rgba(0,0,0,0.1)",
  "@media print": {
    margin: 0,
    padding: 0,
    width: "100%",
    minHeight: 0,
    height: "auto",
    backgroundColor: "white",
    boxShadow: "none",
  },
});

const StyledTable = styled(Table)({
  width: "100%",
  borderCollapse: "collapse",
  border: "2px solid #000",
  "& td, & th": {
    border: "1px solid #000",
    padding: "8px",
    fontSize: "11px",
  },
});

const HeaderCell = styled(TableCell)({
  backgroundColor: "#90EE90",
  fontWeight: "bold",
  textAlign: "center",
  border: "1px solid #000",
  "@media print": {
    backgroundColor: "#90EE90 !important",
    WebkitPrintColorAdjust: "exact",
    printColorAdjust: "exact",
  },
});

const CheckboxCell = styled(TableCell)({
  textAlign: "center",
  width: "60px",
  border: "1px solid #000",
});

const Checkbox = styled(Box)(({ checked }) => ({
  width: "18px",
  height: "18px",
  border: "1.5px solid #666",
  display: "inline-block",
  position: "relative",
  backgroundColor: "transparent",
  borderRadius: "2px",
  "@media print": {
    backgroundColor: "transparent !important",
    WebkitPrintColorAdjust: "exact",
    printColorAdjust: "exact",
  },
  "&::after": checked
    ? {
        content: '"✓"',
        position: "absolute",
        top: "-3px",
        left: "2px",
        fontSize: "16px",
        fontWeight: "bold",
        color: "#000",
      }
    : {},
}));

const CatOneModalPrinting = ({ data }) => {
  const printRef = useRef();

  const handlePrint = () => {
    window.print();
  };

  const renderItem = (item, ratingScale, level = 0) => {
    const paddingLeft = level * 20;

    return (
      <React.Fragment key={item.id}>
        <TableRow>
          <TableCell
            sx={{
              paddingLeft: `${paddingLeft + 8}px`,
              border: "1px solid #000",
              fontSize: "11px",
              width: "50%",
            }}>
            {item.text}
          </TableCell>
          {item.is_rateable ? (
            ratingScale.map((scale) => (
              <CheckboxCell key={scale.id}>
                <Checkbox checked={item.rating_id === scale.id} />
              </CheckboxCell>
            ))
          ) : (
            <TableCell
              colSpan={ratingScale.length}
              sx={{ border: "1px solid #000" }}
            />
          )}
        </TableRow>
        {item.children &&
          item.children.map((child) =>
            renderItem(child, ratingScale, level + 1)
          )}
      </React.Fragment>
    );
  };

  const renderSection = (section, ratingScale, isFirst) => {
    return (
      <React.Fragment key={section.id}>
        <TableRow>
          <TableCell
            sx={{
              border: "1px solid #000",
              fontSize: "11px",
              backgroundColor: "#90EE90",
              fontWeight: "bold",
              width: "50%",
              "@media print": {
                backgroundColor: "#90EE90 !important",
                WebkitPrintColorAdjust: "exact",
                printColorAdjust: "exact",
              },
            }}>
            {section.title}
          </TableCell>
          {ratingScale.map((scale) => (
            <HeaderCell key={scale.id}>{scale.label}</HeaderCell>
          ))}
        </TableRow>
        {section.items.map((item) => renderItem(item, ratingScale))}
      </React.Fragment>
    );
  };

  if (!data) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography>No data available for printing</Typography>
      </Box>
    );
  }

  const template = data.template || {};
  const ratingScale = template.rating_scale || [];
  const sections = template.sections || [];

  return (
    <Box
      sx={{
        backgroundColor: "#f5f5f5",
        minHeight: "100vh",
        p: 2,
        "@media print": { p: 0, minHeight: 0 },
      }}>
      <Box
        sx={{
          p: 2,
          display: "flex",
          justifyContent: "flex-end",
          gap: 2,
          "@media print": {
            display: "none",
          },
        }}>
        <Button
          variant="contained"
          startIcon={<PrintIcon />}
          onClick={handlePrint}
          sx={{
            backgroundColor: "rgb(33, 61, 112)",
            "&:hover": {
              backgroundColor: "rgb(25, 45, 84)",
            },
          }}>
          Print
        </Button>
      </Box>

      <PrintContainer ref={printRef} id="print-content">
        <Box
          sx={{
            padding: "20px",
            "@media print": {
              padding: 0,
            },
          }}>
          <StyledTable>
            <TableBody>
              <TableRow>
                <TableCell
                  colSpan={4}
                  sx={{
                    backgroundColor: "#D3D3D3",
                    textAlign: "center",
                    p: 1,
                    border: "1px solid #000",
                    fontWeight: "bold",
                    fontSize: "14px",
                    "@media print": {
                      backgroundColor: "#D3D3D3 !important",
                      WebkitPrintColorAdjust: "exact",
                      printColorAdjust: "exact",
                    },
                  }}>
                  COMPETENCY ASSESSMENT TOOL - 1
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell
                  colSpan={4}
                  sx={{
                    backgroundColor: "#90EE90",
                    textAlign: "center",
                    p: 0.5,
                    border: "1px solid #000",
                    fontWeight: "bold",
                    fontSize: "12px",
                    "@media print": {
                      backgroundColor: "#90EE90 !important",
                      WebkitPrintColorAdjust: "exact",
                      printColorAdjust: "exact",
                    },
                  }}>
                  BAND A
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell
                  sx={{
                    width: "15%",
                    fontSize: "11px",
                    border: "1px solid #000",
                  }}>
                  <strong>NAME:</strong>
                </TableCell>
                <TableCell
                  sx={{
                    width: "35%",
                    fontSize: "11px",
                    border: "1px solid #000",
                  }}>
                  {data.employee_name || ""}
                </TableCell>
                <TableCell
                  sx={{
                    width: "20%",
                    fontSize: "11px",
                    border: "1px solid #000",
                  }}>
                  <strong>POSITION TITLE:</strong>
                </TableCell>
                <TableCell
                  sx={{
                    width: "30%",
                    fontSize: "11px",
                    border: "1px solid #000",
                  }}>
                  {template.name?.replace("CAT 1 - ", "") || ""}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontSize: "11px", border: "1px solid #000" }}>
                  <strong>DEPARTMENT:</strong>
                </TableCell>
                <TableCell sx={{ fontSize: "11px", border: "1px solid #000" }}>
                  {data.department || ""}
                </TableCell>
                <TableCell sx={{ fontSize: "11px", border: "1px solid #000" }}>
                  <strong>DATE OF ASSESSMENT:</strong>
                </TableCell>
                <TableCell sx={{ fontSize: "11px", border: "1px solid #000" }}>
                  {data.date_assessed || ""}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell
                  colSpan={4}
                  sx={{
                    fontSize: "11px",
                    fontStyle: "italic",
                    border: "1px solid #000",
                  }}>
                  <strong>Instruction:</strong> Lagyan ng (/) ang kahon ayon sa
                  tamang marka
                </TableCell>
              </TableRow>
              {sections.map((section, index) =>
                renderSection(section, ratingScale, index === 0)
              )}
            </TableBody>
          </StyledTable>
        </Box>

        <Box
          sx={{
            mt: 4,
            display: "flex",
            justifyContent: "space-between",
            mx: 2.5,
            "@media print": {
              mx: 0,
              mt: 4,
            },
          }}>
          <Box
            sx={{
              flex: 1,
              p: 2,
              textAlign: "center",
            }}>
            <Box sx={{ minHeight: "80px" }}></Box>
            <Box sx={{ borderTop: "1px solid #000", pt: 1, fontSize: "11px" }}>
              <Typography sx={{ fontSize: "11px" }}>
                Signature over Printed Name/Date
              </Typography>
              <Typography sx={{ fontSize: "11px", fontWeight: "bold" }}>
                Immediate Superior
              </Typography>
            </Box>
          </Box>
          <Box sx={{ flex: 1, p: 2, textAlign: "center" }}>
            <Box
              sx={{
                minHeight: "80px",
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "center",
                pb: 1,
              }}>
              <Typography sx={{ fontSize: "11px" }}>
                {data.employee_name || ""}
              </Typography>
            </Box>
            <Box sx={{ borderTop: "1px solid #000", pt: 1, fontSize: "11px" }}>
              <Typography sx={{ fontSize: "11px" }}>
                Signature over Printed Name/Date
              </Typography>
              <Typography sx={{ fontSize: "11px", fontWeight: "bold" }}>
                Employee
              </Typography>
            </Box>
          </Box>
        </Box>
      </PrintContainer>

      <style>
        {`
          @media print {
            @page {
              size: A4;
              margin: 0;
            }
            
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            
            html, body {
              margin: 0 !important;
              padding: 0 !important;
              height: 100% !important;
              background: white !important;
            }
            
            body * {
              visibility: hidden;
            }
            
            #print-content, #print-content * {
              visibility: visible;
            }
            
            #print-content {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              height: auto;
              background: white !important;
              box-shadow: none !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            
            #print-content table {
              page-break-inside: auto;
            }
            
            #print-content tr {
              page-break-inside: avoid;
              page-break-after: auto;
            }
          }
        `}
      </style>
    </Box>
  );
};

export default CatOneModalPrinting;
