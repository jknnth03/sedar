export const containerStyles = {
  backgroundColor: "#f5f5f5",
  minHeight: "100vh",
  p: 2,
  "@media print": { p: 0, minHeight: 0, backgroundColor: "white" },
};

export const printButtonContainerStyles = {
  p: 2,
  display: "flex",
  justifyContent: "flex-end",
  gap: 2,
  "@media print": {
    display: "none",
  },
};

export const printButtonStyles = {
  backgroundColor: "rgb(33, 61, 112)",
  "&:hover": {
    backgroundColor: "rgb(25, 45, 84)",
  },
};

export const printContentStyles = {
  width: "210mm",
  minHeight: "auto",
  margin: "0 auto",
  backgroundColor: "white",
  boxShadow: "0 0 10px rgba(0,0,0,0.1)",
};

export const headerContainerStyles = {
  display: "flex",
  alignItems: "flex-start",
  marginBottom: "16px",
};

export const logoStyles = {
  width: "70px",
  height: "50px",
  marginRight: "20px",
};

export const logoImageStyles = {
  width: "100%",
  height: "100%",
  objectFit: "contain",
};

export const titleStyles = {
  fontSize: "16px",
  fontWeight: "bold",
  textAlign: "center",
  flex: 1,
  margin: 0,
};

export const employeeInfoTableStyles = {
  width: "100%",
  borderCollapse: "collapse",
  border: "2px solid black",
  fontSize: "10px",
  marginBottom: "12px",
};

export const tableCellStyles = {
  border: "1px solid black",
  padding: "4px",
};

export const tableCellBoldStyles = {
  ...tableCellStyles,
  fontWeight: "bold",
};

export const metricsTableStyles = {
  width: "100%",
  borderCollapse: "collapse",
  border: "2px solid black",
  fontSize: "10px",
  marginBottom: "12px",
};

export const headerCellStyles = {
  border: "1px solid black",
  padding: "4px",
  backgroundColor: "#d3d3d3",
  fontWeight: "bold",
  textAlign: "center",
};

export const checkboxContainerStyles = {
  display: "flex",
  gap: "16px",
  marginBottom: "16px",
  fontSize: "10px",
  alignItems: "center",
};

export const checkboxItemStyles = {
  display: "flex",
  alignItems: "center",
  gap: "6px",
};

export const checkboxStyles = {
  width: "14px",
  height: "14px",
  border: "1.5px solid #333",
  display: "inline-block",
  position: "relative",
};

export const checkmarkStyles = {
  position: "absolute",
  top: "-2px",
  left: "1px",
  fontSize: "12px",
  fontWeight: "bold",
};

export const sectionContainerStyles = {
  marginBottom: "16px",
};

export const sectionTitleStyles = {
  fontSize: "11px",
  fontWeight: "bold",
  marginBottom: "8px",
};

export const questionTextStyles = {
  fontSize: "10px",
  marginBottom: "3px",
};

export const answerLineStyles = {
  borderBottom: "1px solid black",
  minHeight: "35px",
  fontSize: "10px",
  padding: "3px",
};

export const signatureContainerStyles = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: "16px",
};

export const signatureBoxStyles = {
  flex: 1,
  padding: "6px",
  textAlign: "center",
};

export const signatureSpaceStyles = {
  minHeight: "50px",
};

export const signatureLineStyles = {
  borderTop: "1px solid black",
  paddingTop: "6px",
  fontSize: "9px",
};

export const signatureTextStyles = {
  fontSize: "9px",
  margin: "1px 0",
};

export const signatureLabelStyles = {
  fontSize: "9px",
  fontWeight: "bold",
  margin: "1px 0",
};

export const acknowledgementTextStyles = {
  fontSize: "10px",
  marginBottom: "6px",
};

export const employeeSignatureLineStyles = {
  borderBottom: "1px solid black",
  minHeight: "35px",
  marginBottom: "3px",
  width: "180px",
};

export const employeeLabelStyles = {
  fontSize: "10px",
  fontWeight: "bold",
  margin: "1px 0",
};

export const employeeSubtextStyles = {
  fontSize: "8px",
  margin: "0",
};

export const footerStyles = {
  display: "flex",
  justifyContent: "space-between",
  fontSize: "8px",
};

export const page2TitleStyles = {
  fontSize: "11px",
  fontWeight: "bold",
  marginBottom: "6px",
};

export const italicTextStyles = {
  fontSize: "10px",
  fontStyle: "italic",
  marginBottom: "12px",
};

export const performanceTableStyles = {
  width: "100%",
  borderCollapse: "collapse",
  border: "2px solid black",
  fontSize: "10px",
  marginBottom: "16px",
};

export const emptyRowStyles = {
  border: "1px solid black",
  padding: "4px",
  height: "26px",
};

export const totalCellBlueStyles = {
  border: "1px solid black",
  padding: "4px",
  textAlign: "center",
  backgroundColor: "#B3D9FF",
};

export const totalCellYellowStyles = {
  border: "1px solid black",
  padding: "4px",
  textAlign: "center",
  backgroundColor: "#FFFFCC",
};

export const demeritTitleStyles = {
  fontSize: "11px",
  fontWeight: "bold",
  marginBottom: "6px",
  color: "#d00",
};

export const demeritTableStyles = {
  width: "100%",
  borderCollapse: "collapse",
  border: "2px solid black",
  fontSize: "10px",
};

export const page3TitleStyles = {
  fontSize: "11px",
  fontWeight: "bold",
  marginBottom: "6px",
};

export const instructionTextStyles = {
  fontSize: "10px",
  marginBottom: "6px",
};

export const scaleTextStyles = {
  fontSize: "10px",
  marginBottom: "12px",
};

export const scaleListContainerStyles = {
  marginBottom: "12px",
  paddingLeft: "12px",
};

export const scaleItemStyles = {
  fontSize: "10px",
  margin: "1px 0",
};

export const competencyTableStyles = {
  width: "100%",
  borderCollapse: "collapse",
  border: "2px solid black",
  fontSize: "10px",
  marginBottom: "16px",
};

export const printStyles = `
  @media print {
    @page {
      size: A4;
      margin: 0.5in;
    }
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
    html, body {
      margin: 0 !important;
      padding: 0 !important;
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
      background: white !important;
      box-shadow: none !important;
    }
    .print-hide {
      display: none !important;
    }
    .page-break {
      page-break-after: always;
      break-after: page;
    }
  }
`;
