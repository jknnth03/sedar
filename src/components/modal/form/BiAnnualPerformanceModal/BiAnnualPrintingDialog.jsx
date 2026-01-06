import React, { useRef } from "react";
import { Box, Button } from "@mui/material";
import { Print as PrintIcon } from "@mui/icons-material";
import * as styles from "./BiAnnualPrintingStyles";

const BiAnnualPrintingDialog = ({ data, selectedEntry }) => {
  const printRef = useRef();

  const handlePrint = () => {
    window.print();
  };

  const printData = data?.result || data || selectedEntry;

  if (!printData) {
    return (
      <div className="p-8 text-center">
        <p>No data available for printing</p>
      </div>
    );
  }

  const employeeName = printData?.employee?.name || "";
  const position = printData?.employee?.position || "";
  const department = printData?.employee?.department || "";
  const period = "";
  const year = "";

  const individualKPIWeight = "70%";
  const coreCompetencyWeight = "20%";
  const demeritWeight = "10%";
  const totalWeight = "100%";

  const individualKPIRawScore = printData?.scores?.kpi_total || "";
  const coreCompetencyRawScore = printData?.scores?.competency_average || "";
  const demeritRawScore = printData?.scores?.demerit_deduction || "";

  const individualKPIOverall = "";
  const coreCompetencyOverall = "";
  const demeritOverall = "";
  const totalOverall = printData?.scores?.final_score || "";

  const finalRatingLabel = printData?.scores?.final_rating_label || "";
  const exceedsExpectations = finalRatingLabel.toLowerCase().includes("exceed");
  const meetsExpectations =
    finalRatingLabel.toLowerCase().includes("satisfactory") ||
    finalRatingLabel.toLowerCase().includes("meets");
  const needsImprovement =
    finalRatingLabel.toLowerCase().includes("needs") ||
    finalRatingLabel.toLowerCase().includes("improvement");

  const strengths = printData?.content?.discussions?.strengths || "";
  const developmentOpportunities =
    printData?.content?.discussions?.development || "";
  const learningNeeds = printData?.content?.discussions?.learning_needs || "";

  const performanceMetrics = (printData?.content?.kpis || []).map((kpi) => ({
    deliverable: kpi.deliverable || "",
    target: kpi.target_percentage || "",
    actual: kpi.actual_performance || "",
    remarks: kpi.remarks || "",
  }));

  const totalDivision = "";
  const overallPoints = printData?.scores?.kpi_total || "";

  const minorOffensesWeight = "";
  const minorOffensesScore = "";
  const majorOffensesWeight = "";
  const majorOffensesScore = "";
  const demeritTotalWeight = "100%";
  const demeritTotalScore = printData?.scores?.demerit_deduction || "";

  const competencies = [];
  if (
    printData?.content?.competencies &&
    Array.isArray(printData.content.competencies)
  ) {
    printData.content.competencies.forEach((section) => {
      if (section.items && Array.isArray(section.items)) {
        section.items.forEach((item) => {
          if (item.is_header) {
            competencies.push({
              isHeader: true,
              title: item.text,
            });
          }

          if (item.children && Array.isArray(item.children)) {
            item.children.forEach((child, idx) => {
              if (!child.is_header) {
                competencies.push({
                  isHeader: false,
                  number: "",
                  rating: child.saved_answer?.rating_scale?.value || "",
                  description: child.text,
                });
              }
            });
          }
        });
      }
    });
  }

  const coreCompetencyAverage = printData?.scores?.competency_average || "";
  const competencyScaleMax = printData?.scores?.competency_scale_max || 3;
  const coreCompetencyGrade =
    coreCompetencyAverage && competencyScaleMax
      ? ((coreCompetencyAverage / competencyScaleMax) * 100).toFixed(2) + "%"
      : "";
  const overallGrade = printData?.scores?.final_score || "";

  return (
    <Box sx={styles.containerStyles}>
      <style>{styles.printStyles}</style>

      <Box sx={styles.printButtonContainerStyles} className="print-hide">
        <Button
          variant="contained"
          startIcon={<PrintIcon />}
          onClick={handlePrint}
          sx={styles.printButtonStyles}>
          Print
        </Button>
      </Box>

      <div id="print-content" ref={printRef} style={styles.printContentStyles}>
        <div style={{ padding: "0" }}>
          <div style={styles.headerContainerStyles}>
            <div style={styles.logoStyles}>
              <img
                src="/rdf.png"
                alt="RDF Logo"
                style={styles.logoImageStyles}
              />
            </div>
            <h1 style={styles.titleStyles}>PERFORMANCE EVALUATION</h1>
          </div>

          <table style={styles.employeeInfoTableStyles}>
            <tbody>
              <tr>
                <td style={{ ...styles.tableCellBoldStyles, width: "12%" }}>
                  NAME:
                </td>
                <td style={{ ...styles.tableCellStyles, width: "38%" }}>
                  {employeeName}
                </td>
                <td style={{ ...styles.tableCellBoldStyles, width: "12%" }}>
                  POSITION:
                </td>
                <td style={{ ...styles.tableCellStyles, width: "38%" }}>
                  {position}
                </td>
              </tr>
              <tr>
                <td style={styles.tableCellBoldStyles}>DEPT:</td>
                <td style={styles.tableCellStyles}>{department}</td>
                <td style={styles.tableCellBoldStyles}>PERIOD:</td>
                <td style={styles.tableCellStyles}>{period}</td>
              </tr>
              <tr>
                <td style={styles.tableCellStyles} colSpan={2}></td>
                <td style={styles.tableCellBoldStyles}>YEAR:</td>
                <td style={styles.tableCellStyles}>{year}</td>
              </tr>
            </tbody>
          </table>

          <table style={styles.metricsTableStyles}>
            <tbody>
              <tr>
                <td style={{ ...styles.headerCellStyles, width: "52%" }}>
                  METRICS
                </td>
                <td style={{ ...styles.headerCellStyles, width: "16%" }}>
                  Weight
                </td>
                <td style={{ ...styles.headerCellStyles, width: "16%" }}>
                  Raw Score
                </td>
                <td style={{ ...styles.headerCellStyles, width: "16%" }}>
                  Overall points
                </td>
              </tr>
              <tr>
                <td style={styles.tableCellStyles}>Individual KPI Score</td>
                <td style={{ ...styles.tableCellStyles, textAlign: "center" }}>
                  {individualKPIWeight}
                </td>
                <td style={{ ...styles.tableCellStyles, textAlign: "center" }}>
                  {individualKPIRawScore}
                </td>
                <td style={{ ...styles.tableCellStyles, textAlign: "center" }}>
                  {individualKPIOverall}
                </td>
              </tr>
              <tr>
                <td style={styles.tableCellStyles}>Core Competency Score</td>
                <td style={{ ...styles.tableCellStyles, textAlign: "center" }}>
                  {coreCompetencyWeight}
                </td>
                <td style={{ ...styles.tableCellStyles, textAlign: "center" }}>
                  {coreCompetencyRawScore}
                </td>
                <td style={{ ...styles.tableCellStyles, textAlign: "center" }}>
                  {coreCompetencyOverall}
                </td>
              </tr>
              <tr>
                <td style={styles.tableCellStyles}>Demerit Score</td>
                <td style={{ ...styles.tableCellStyles, textAlign: "center" }}>
                  {demeritWeight}
                </td>
                <td style={{ ...styles.tableCellStyles, textAlign: "center" }}>
                  {demeritRawScore}
                </td>
                <td style={{ ...styles.tableCellStyles, textAlign: "center" }}>
                  {demeritOverall}
                </td>
              </tr>
              <tr>
                <td style={styles.tableCellBoldStyles}>TOTAL</td>
                <td
                  style={{
                    ...styles.tableCellBoldStyles,
                    textAlign: "center",
                  }}>
                  {totalWeight}
                </td>
                <td style={styles.tableCellStyles}></td>
                <td
                  style={{
                    ...styles.tableCellBoldStyles,
                    textAlign: "center",
                  }}>
                  {totalOverall}
                </td>
              </tr>
            </tbody>
          </table>

          <div style={styles.checkboxContainerStyles}>
            <div style={styles.checkboxItemStyles}>
              <div style={styles.checkboxStyles}>
                {exceedsExpectations && (
                  <span style={styles.checkmarkStyles}>✓</span>
                )}
              </div>
              <span>Exceeds Expectations</span>
            </div>
            <div style={styles.checkboxItemStyles}>
              <div style={styles.checkboxStyles}>
                {meetsExpectations && (
                  <span style={styles.checkmarkStyles}>✓</span>
                )}
              </div>
              <span>Meets Expectations</span>
            </div>
            <div style={styles.checkboxItemStyles}>
              <div style={styles.checkboxStyles}>
                {needsImprovement && (
                  <span style={styles.checkmarkStyles}>✓</span>
                )}
              </div>
              <span>Needs Improvement</span>
            </div>
          </div>

          <div style={styles.sectionContainerStyles}>
            <h2 style={styles.sectionTitleStyles}>
              PART II. PERFORMANCE DISCUSSION
            </h2>
            <div style={{ marginBottom: "12px" }}>
              <p style={styles.questionTextStyles}>
                1. List the employee's strengths that s/he must continue:
              </p>
              <div style={styles.answerLineStyles}>{strengths}</div>
            </div>
            <div style={{ marginBottom: "12px" }}>
              <p style={styles.questionTextStyles}>
                2. List employee development opportunities:
              </p>
              <div style={styles.answerLineStyles}>
                {developmentOpportunities}
              </div>
            </div>
            <div style={{ marginBottom: "12px" }}>
              <p style={styles.questionTextStyles}>
                3. List of employee's learning needs to develop his/her work
                performance:
              </p>
              <div style={styles.answerLineStyles}>{learningNeeds}</div>
            </div>
          </div>

          <div style={styles.sectionContainerStyles}>
            <div style={styles.signatureContainerStyles}>
              <div style={styles.signatureBoxStyles}>
                <div style={styles.signatureSpaceStyles}></div>
                <div style={styles.signatureLineStyles}>
                  <p style={styles.signatureTextStyles}>
                    Signature over Printed Name/Date
                  </p>
                  <p style={styles.signatureLabelStyles}>Immediate Superior</p>
                </div>
              </div>
              <div style={styles.signatureBoxStyles}>
                <div style={styles.signatureSpaceStyles}></div>
                <div style={styles.signatureLineStyles}>
                  <p style={styles.signatureTextStyles}>
                    Signature over Printed Name/Date
                  </p>
                  <p style={styles.signatureLabelStyles}>Dept Head/Manager</p>
                </div>
              </div>
              <div style={styles.signatureBoxStyles}>
                <div style={styles.signatureSpaceStyles}></div>
                <div style={styles.signatureLineStyles}>
                  <p style={styles.signatureTextStyles}>
                    Signature over Printed Name/Date
                  </p>
                  <p style={styles.signatureLabelStyles}>HR Head</p>
                </div>
              </div>
            </div>

            <div>
              <p
                style={{
                  ...styles.tableCellBoldStyles,
                  border: "none",
                  padding: 0,
                  marginBottom: "3px",
                }}>
                EMPLOYEE ACKNOWLEDGEMENT:
              </p>
              <p style={styles.acknowledgementTextStyles}>
                I have reviewed this document and discussed the contents with my
                superior/manager. My signature means that I have been advised of
                my performance status.
              </p>
              <div style={styles.employeeSignatureLineStyles}></div>
              <p style={styles.employeeLabelStyles}>EMPLOYEE</p>
              <p style={styles.employeeSubtextStyles}>
                (Name, Signature, Date)
              </p>
            </div>
          </div>

          <div style={styles.footerStyles}>
            <span>HR-FRM-22-005, Eff. Date July 20, 2022</span>
            <span>Page 1</span>
          </div>
        </div>

        <div className="page-break"></div>

        <div style={{ padding: "0" }}>
          <h2 style={styles.page2TitleStyles}>
            Part I. INDIVIDUAL PERFORMANCE EVALUATION
          </h2>
          <p style={styles.italicTextStyles}>
            (Please reproduce this page, as necessary, to capture all
            performance metrics)
          </p>

          <table style={styles.performanceTableStyles}>
            <tbody>
              <tr>
                <td
                  style={{ ...styles.headerCellStyles, textAlign: "left" }}
                  colSpan={4}>
                  Evaluation Date:
                </td>
              </tr>
              <tr>
                <td style={styles.headerCellStyles} colSpan={2}>
                  PERFORMANCE METRICS
                </td>
                <td style={styles.headerCellStyles} colSpan={2}>
                  ASSESSMENT
                </td>
              </tr>
              <tr>
                <td
                  style={{
                    ...styles.headerCellStyles,
                    textAlign: "left",
                    width: "46%",
                  }}>
                  Deliverables / KPIs
                </td>
                <td style={{ ...styles.headerCellStyles, width: "18%" }}>
                  Target
                </td>
                <td style={{ ...styles.headerCellStyles, width: "18%" }}>
                  Actual
                </td>
                <td style={{ ...styles.headerCellStyles, width: "18%" }}>
                  Remarks
                </td>
              </tr>
              {performanceMetrics.length > 0
                ? performanceMetrics.map((metric, index) => (
                    <tr key={index}>
                      <td
                        style={{ ...styles.tableCellStyles, fontSize: "10px" }}>
                        {metric.deliverable || ""}
                      </td>
                      <td
                        style={{
                          ...styles.tableCellStyles,
                          fontSize: "10px",
                          textAlign: "center",
                        }}>
                        {metric.target || ""}
                      </td>
                      <td
                        style={{
                          ...styles.tableCellStyles,
                          fontSize: "10px",
                          textAlign: "center",
                        }}>
                        {metric.actual || ""}
                      </td>
                      <td
                        style={{ ...styles.tableCellStyles, fontSize: "10px" }}>
                        {metric.remarks || ""}
                      </td>
                    </tr>
                  ))
                : [...Array(12)].map((_, index) => (
                    <tr key={index}>
                      <td style={styles.emptyRowStyles}></td>
                      <td style={styles.tableCellStyles}></td>
                      <td style={styles.tableCellStyles}></td>
                      <td style={styles.tableCellStyles}></td>
                    </tr>
                  ))}
              <tr>
                <td style={styles.tableCellBoldStyles}>TOTAL</td>
                <td style={styles.totalCellBlueStyles} colSpan={3}>
                  {totalDivision}
                </td>
              </tr>
              <tr>
                <td style={styles.tableCellBoldStyles}>Overall points</td>
                <td style={styles.totalCellYellowStyles} colSpan={3}>
                  {overallPoints}
                </td>
              </tr>
            </tbody>
          </table>

          <div style={styles.sectionContainerStyles}>
            <h3 style={styles.demeritTitleStyles}>
              II. DEMERIT SCORES (FOR HR ONLY)
            </h3>
            <table style={styles.demeritTableStyles}>
              <tbody>
                <tr>
                  <td style={{ ...styles.headerCellStyles, width: "66%" }}>
                    DOCUMENTED VIOLATION/S
                  </td>
                  <td style={{ ...styles.headerCellStyles, width: "17%" }}>
                    WEIGHT
                  </td>
                  <td style={{ ...styles.headerCellStyles, width: "17%" }}>
                    SCORE
                  </td>
                </tr>
                <tr>
                  <td style={styles.tableCellStyles}>NO MINOR OFFENSES</td>
                  <td
                    style={{ ...styles.tableCellStyles, textAlign: "center" }}>
                    {minorOffensesWeight}
                  </td>
                  <td
                    style={{ ...styles.tableCellStyles, textAlign: "center" }}>
                    {minorOffensesScore}
                  </td>
                </tr>
                <tr>
                  <td style={styles.tableCellStyles}>NO MAJOR OFFENSES</td>
                  <td
                    style={{ ...styles.tableCellStyles, textAlign: "center" }}>
                    {majorOffensesWeight}
                  </td>
                  <td
                    style={{ ...styles.tableCellStyles, textAlign: "center" }}>
                    {majorOffensesScore}
                  </td>
                </tr>
                <tr>
                  <td style={styles.tableCellBoldStyles}>TOTAL</td>
                  <td
                    style={{
                      ...styles.tableCellBoldStyles,
                      textAlign: "center",
                    }}>
                    {demeritTotalWeight}
                  </td>
                  <td
                    style={{
                      ...styles.tableCellBoldStyles,
                      textAlign: "center",
                    }}>
                    {demeritTotalScore}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={styles.footerStyles}>
            <span>HR-FRM-22-005, Eff. Date July 20, 2022</span>
            <span>Page 2</span>
          </div>
        </div>

        <div className="page-break"></div>

        <div style={{ padding: "0" }}>
          <h2 style={styles.page3TitleStyles}>
            III. CORE COMPETENCY EVALUATION
          </h2>
          <p style={styles.instructionTextStyles}>
            Rate employee's performance on his/her current goals and
            expectations. Rate the employee based on the given point range on
            the blank space provided, which best describe the employee's
            performance. Use the space provided for comments and explanation.{" "}
            <em>Make your rating an accurate description of the one rated.</em>
          </p>
          <p style={styles.scaleTextStyles}>
            The performance shall be rated using the standardized 3-point scale
            below.
          </p>

          <div style={styles.scaleListContainerStyles}>
            <p style={styles.scaleItemStyles}>
              <strong>3 – Exceeds Expectations</strong>
            </p>
            <p style={styles.scaleItemStyles}>
              <strong>2 – Meets Expectations</strong>
            </p>
            <p style={styles.scaleItemStyles}>
              <strong>1 – Needs Improvement</strong>
            </p>
          </div>

          <table style={styles.competencyTableStyles}>
            <tbody>
              <tr>
                <td style={{ ...styles.headerCellStyles, width: "7%" }}>No.</td>
                <td style={{ ...styles.headerCellStyles, width: "13%" }}>
                  Rating
                </td>
                <td style={{ ...styles.headerCellStyles, width: "80%" }}>
                  PERFORMANCE INDICATORS
                </td>
              </tr>
              {competencies.length > 0 ? (
                competencies.map((competency, index) =>
                  competency.isHeader ? (
                    <tr key={index}>
                      <td
                        style={{
                          ...styles.headerCellStyles,
                          textAlign: "left",
                          fontSize: "10px",
                        }}
                        colSpan={3}>
                        {competency.title}
                      </td>
                    </tr>
                  ) : (
                    <tr key={index}>
                      <td
                        style={{
                          ...styles.tableCellStyles,
                          textAlign: "center",
                          fontSize: "10px",
                        }}>
                        {competency.number}
                      </td>
                      <td
                        style={{
                          ...styles.tableCellStyles,
                          textAlign: "center",
                          fontSize: "10px",
                        }}>
                        {competency.rating || ""}
                      </td>
                      <td
                        style={{ ...styles.tableCellStyles, fontSize: "10px" }}>
                        {competency.description}
                      </td>
                    </tr>
                  )
                )
              ) : (
                <>
                  <tr>
                    <td
                      style={{ ...styles.headerCellStyles, textAlign: "left" }}
                      colSpan={3}>
                      PLANNING
                    </td>
                  </tr>
                  {[...Array(8)].map((_, i) => (
                    <tr key={`planning-${i}`}>
                      <td
                        style={{
                          ...styles.tableCellStyles,
                          textAlign: "center",
                        }}>
                        {i + 1}
                      </td>
                      <td style={styles.tableCellStyles}></td>
                      <td style={styles.tableCellStyles}></td>
                    </tr>
                  ))}
                  <tr>
                    <td
                      style={{ ...styles.headerCellStyles, textAlign: "left" }}
                      colSpan={3}>
                      CONTROLLING
                    </td>
                  </tr>
                  {[...Array(2)].map((_, i) => (
                    <tr key={`controlling-${i}`}>
                      <td
                        style={{
                          ...styles.tableCellStyles,
                          textAlign: "center",
                        }}>
                        {i + 9}
                      </td>
                      <td style={styles.tableCellStyles}></td>
                      <td style={styles.tableCellStyles}></td>
                    </tr>
                  ))}
                  <tr>
                    <td
                      style={{ ...styles.headerCellStyles, textAlign: "left" }}
                      colSpan={3}>
                      TEAM COMMUNICATION SKILLS
                    </td>
                  </tr>
                  {[...Array(3)].map((_, i) => (
                    <tr key={`team-${i}`}>
                      <td
                        style={{
                          ...styles.tableCellStyles,
                          textAlign: "center",
                        }}>
                        {i + 11}
                      </td>
                      <td style={styles.tableCellStyles}></td>
                      <td style={styles.tableCellStyles}></td>
                    </tr>
                  ))}
                  <tr>
                    <td
                      style={{ ...styles.headerCellStyles, textAlign: "left" }}
                      colSpan={3}>
                      PERSONNEL MANAGEMENT SKILLS
                    </td>
                  </tr>
                  {[...Array(3)].map((_, i) => (
                    <tr key={`personnel-${i}`}>
                      <td
                        style={{
                          ...styles.tableCellStyles,
                          textAlign: "center",
                        }}>
                        {i + 14}
                      </td>
                      <td style={styles.tableCellStyles}></td>
                      <td style={styles.tableCellStyles}></td>
                    </tr>
                  ))}
                  <tr>
                    <td
                      style={{ ...styles.headerCellStyles, textAlign: "left" }}
                      colSpan={3}>
                      DECISION MAKING & PROBLEM SOLVING SKILLS
                    </td>
                  </tr>
                  {[...Array(3)].map((_, i) => (
                    <tr key={`decision-${i}`}>
                      <td
                        style={{
                          ...styles.tableCellStyles,
                          textAlign: "center",
                        }}>
                        {i + 17}
                      </td>
                      <td style={styles.tableCellStyles}></td>
                      <td style={styles.tableCellStyles}></td>
                    </tr>
                  ))}
                  <tr>
                    <td
                      style={{ ...styles.headerCellStyles, textAlign: "left" }}
                      colSpan={3}>
                      INTERPERSONAL SKILLS
                    </td>
                  </tr>
                  {[...Array(3)].map((_, i) => (
                    <tr key={`interpersonal-${i}`}>
                      <td
                        style={{
                          ...styles.tableCellStyles,
                          textAlign: "center",
                        }}>
                        {i + 20}
                      </td>
                      <td style={styles.tableCellStyles}></td>
                      <td style={styles.tableCellStyles}></td>
                    </tr>
                  ))}
                </>
              )}
              <tr>
                <td style={styles.tableCellBoldStyles} colSpan={2}>
                  Core Competency Average
                </td>
                <td style={{ ...styles.tableCellStyles, textAlign: "center" }}>
                  {coreCompetencyAverage}
                </td>
              </tr>
              <tr>
                <td style={styles.tableCellBoldStyles} colSpan={2}>
                  Core Competency Grade (%)
                </td>
                <td style={{ ...styles.tableCellStyles, textAlign: "center" }}>
                  {coreCompetencyGrade}
                </td>
              </tr>
              <tr>
                <td style={styles.tableCellBoldStyles} colSpan={2}>
                  Overall Grade
                </td>
                <td style={{ ...styles.tableCellStyles, textAlign: "center" }}>
                  {overallGrade}
                </td>
              </tr>
            </tbody>
          </table>

          <div style={styles.footerStyles}>
            <span>HR-FRM-22-005, Eff. Date July 20, 2022</span>
            <span>Page 3</span>
          </div>
        </div>
      </div>
    </Box>
  );
};

export default BiAnnualPrintingDialog;
