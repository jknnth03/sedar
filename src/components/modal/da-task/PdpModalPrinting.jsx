import React, { useRef } from "react";

const PdpModalPrinting = ({ data }) => {
  const printRef = useRef();

  const handlePrint = () => {
    window.print();
  };

  if (!data) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <p>No data available for printing</p>
      </div>
    );
  }

  const goals = data.goals || [];
  const coachingSessions = data.coaching_sessions || [];

  const minGoalRows = 5;
  const minActionRows = 5;
  const minResourceRows = 5;
  const minCoachingRows = 5;

  const displayGoals = [...goals];
  while (displayGoals.length < minGoalRows) {
    displayGoals.push({ id: `empty-${displayGoals.length}`, isEmpty: true });
  }

  const getActionsForDisplay = () => {
    const allActions = [];
    displayGoals.forEach((goal, goalIndex) => {
      if (goal.isEmpty) {
        allActions.push({
          id: `empty-action-${goalIndex}`,
          goalNumber: goalIndex + 1,
          isEmpty: true,
        });
      } else if (goal.actions && goal.actions.length > 0) {
        goal.actions.forEach((action) => {
          allActions.push({
            ...action,
            goalNumber: goalIndex + 1,
          });
        });
      } else {
        allActions.push({
          id: `empty-action-${goalIndex}`,
          goalNumber: goalIndex + 1,
          isEmpty: true,
        });
      }
    });
    while (allActions.length < minActionRows) {
      allActions.push({
        id: `empty-action-extra-${allActions.length}`,
        isEmpty: true,
      });
    }
    return allActions;
  };

  const getResourcesForDisplay = () => {
    const allResources = [];
    displayGoals.forEach((goal) => {
      if (!goal.isEmpty && goal.resources && goal.resources.length > 0) {
        goal.resources.forEach((resource) => {
          allResources.push(resource);
        });
      }
    });
    while (allResources.length < minResourceRows) {
      allResources.push({
        id: `empty-resource-${allResources.length}`,
        isEmpty: true,
      });
    }
    return allResources;
  };

  const displayActions = getActionsForDisplay();
  const displayResources = getResourcesForDisplay();

  const displayCoachingSessions = [...coachingSessions];
  while (displayCoachingSessions.length < minCoachingRows) {
    displayCoachingSessions.push({
      id: `empty-coaching-${displayCoachingSessions.length}`,
      isEmpty: true,
    });
  }

  return (
    <div
      style={{
        backgroundColor: "#f5f5f5",
        minHeight: "100vh",
        padding: "16px",
      }}>
      <div
        style={{
          padding: "16px",
          display: "flex",
          justifyContent: "flex-end",
          gap: "16px",
        }}
        className="no-print">
        <button
          onClick={handlePrint}
          style={{
            backgroundColor: "rgb(33, 61, 112)",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: "4px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "14px",
          }}>
          🖨️ Print
        </button>
      </div>

      <div
        ref={printRef}
        id="print-content"
        style={{
          width: "210mm",
          minHeight: "auto",
          padding: "20mm",
          margin: "0 auto",
          backgroundColor: "white",
          boxShadow: "0 0 10px rgba(0,0,0,0.1)",
        }}>
        <div style={{ padding: "20px" }}>
          <h1
            style={{
              textAlign: "center",
              fontWeight: "bold",
              marginBottom: "16px",
              fontSize: "16px",
              color: "#666",
            }}>
            PERFORMANCE DEVELOPMENTAL PLAN FORM
          </h1>

          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              border: "2px solid #000",
              marginBottom: "16px",
            }}>
            <tbody>
              <tr>
                <td
                  style={{
                    backgroundColor: "#E8E8E8",
                    fontWeight: "bold",
                    border: "1px solid #000",
                    padding: "8px",
                    fontSize: "11px",
                    width: "20%",
                  }}>
                  EMPLOYEE NAME
                </td>
                <td
                  colSpan={3}
                  style={{
                    border: "1px solid #000",
                    padding: "8px",
                    fontSize: "11px",
                  }}>
                  {data.employee_name || ""}
                </td>
              </tr>
              <tr>
                <td
                  style={{
                    backgroundColor: "#E8E8E8",
                    border: "1px solid #000",
                  }}></td>
                <td
                  style={{
                    backgroundColor: "#4A7BA7",
                    color: "#fff",
                    fontWeight: "bold",
                    textAlign: "center",
                    border: "1px solid #000",
                    padding: "8px",
                    fontSize: "11px",
                    width: "40%",
                  }}>
                  From
                </td>
                <td
                  style={{
                    backgroundColor: "#4A7BA7",
                    color: "#fff",
                    fontWeight: "bold",
                    textAlign: "center",
                    border: "1px solid #000",
                    padding: "8px",
                    fontSize: "11px",
                    width: "40%",
                  }}>
                  To
                </td>
              </tr>
              <tr>
                <td
                  style={{
                    backgroundColor: "#E8E8E8",
                    fontWeight: "bold",
                    border: "1px solid #000",
                    padding: "8px",
                    fontSize: "11px",
                  }}>
                  Position
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "8px",
                    fontSize: "11px",
                  }}>
                  {data.from_position_title || ""}
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "8px",
                    fontSize: "11px",
                  }}>
                  {data.to_position_title || ""}
                </td>
              </tr>
              <tr>
                <td
                  style={{
                    backgroundColor: "#E8E8E8",
                    fontWeight: "bold",
                    border: "1px solid #000",
                    padding: "8px",
                    fontSize: "11px",
                  }}>
                  Department
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "8px",
                    fontSize: "11px",
                  }}>
                  {data.department || ""}
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "8px",
                    fontSize: "11px",
                  }}>
                  {data.department || ""}
                </td>
              </tr>
              <tr>
                <td
                  style={{
                    backgroundColor: "#E8E8E8",
                    fontWeight: "bold",
                    border: "1px solid #000",
                    padding: "8px",
                    fontSize: "11px",
                  }}>
                  Inclusive Dates
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "8px",
                    fontSize: "11px",
                  }}>
                  {data.start_date || ""}
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "8px",
                    fontSize: "11px",
                  }}>
                  {data.end_date || ""}
                </td>
              </tr>
              <tr>
                <td
                  style={{
                    backgroundColor: "#E8E8E8",
                    fontWeight: "bold",
                    border: "1px solid #000",
                    padding: "8px",
                    fontSize: "11px",
                  }}>
                  Development Plan Objective
                </td>
                <td
                  colSpan={2}
                  style={{
                    border: "1px solid #000",
                    padding: "8px",
                    fontSize: "11px",
                  }}>
                  {data.development_plan_objective || ""}
                </td>
              </tr>
            </tbody>
          </table>

          <div style={{ marginTop: "16px" }}>
            <p
              style={{
                fontWeight: "bold",
                fontSize: "13px",
                marginBottom: "4px",
              }}>
              Part I. SPECIFIC GOALS
            </p>
            <p
              style={{
                fontSize: "10px",
                fontStyle: "italic",
                marginBottom: "8px",
              }}>
              Provide specific goals as they relate to areas of responsibilities
              to be developed and/or improved during the period of employee
              movement.
            </p>

            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                border: "2px solid #000",
              }}>
              <tbody>
                <tr>
                  <td
                    style={{
                      backgroundColor: "#4A7BA7",
                      color: "#fff",
                      fontWeight: "bold",
                      textAlign: "center",
                      border: "1px solid #000",
                      padding: "12px 8px",
                      fontSize: "11px",
                      width: "10%",
                    }}>
                    GOAL #
                  </td>
                  <td
                    style={{
                      backgroundColor: "#4A7BA7",
                      color: "#fff",
                      fontWeight: "bold",
                      textAlign: "center",
                      border: "1px solid #000",
                      padding: "12px 8px",
                      fontSize: "11px",
                      width: "70%",
                    }}>
                    GOAL DESCRIPTION
                  </td>
                  <td
                    style={{
                      backgroundColor: "#4A7BA7",
                      color: "#fff",
                      fontWeight: "bold",
                      textAlign: "center",
                      border: "1px solid #000",
                      padding: "12px 8px",
                      fontSize: "11px",
                      width: "20%",
                    }}>
                    Target
                  </td>
                </tr>
                {displayGoals.map((goal, index) => (
                  <tr key={goal.id}>
                    <td
                      style={{
                        textAlign: "center",
                        border: "1px solid #000",
                        padding: "12px 8px",
                        fontSize: "11px",
                        minHeight: "40px",
                      }}>
                      {!goal.isEmpty ? index + 1 : ""}
                    </td>
                    <td
                      style={{
                        border: "1px solid #000",
                        padding: "12px 8px",
                        fontSize: "11px",
                        minHeight: "40px",
                      }}>
                      {!goal.isEmpty ? goal.description || "" : ""}
                    </td>
                    <td
                      style={{
                        border: "1px solid #000",
                        padding: "12px 8px",
                        fontSize: "11px",
                        minHeight: "40px",
                      }}>
                      {!goal.isEmpty ? goal.target_date || "" : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: "16px" }}>
            <p
              style={{
                fontWeight: "bold",
                fontSize: "13px",
                marginBottom: "4px",
              }}>
              Part II. ACTION PLAN
            </p>
            <p
              style={{
                fontSize: "10px",
                fontStyle: "italic",
                marginBottom: "8px",
              }}>
              Provide specific action plans to achieve stated goals above.
            </p>

            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                border: "2px solid #000",
              }}>
              <tbody>
                <tr>
                  <td
                    style={{
                      backgroundColor: "#4A7BA7",
                      color: "#fff",
                      fontWeight: "bold",
                      textAlign: "center",
                      border: "1px solid #000",
                      padding: "12px 8px",
                      fontSize: "11px",
                      width: "8%",
                    }}>
                    GOAL #
                  </td>
                  <td
                    style={{
                      backgroundColor: "#4A7BA7",
                      color: "#fff",
                      fontWeight: "bold",
                      textAlign: "center",
                      border: "1px solid #000",
                      padding: "12px 8px",
                      fontSize: "11px",
                      width: "30%",
                    }}>
                    ACTIVITY
                  </td>
                  <td
                    style={{
                      backgroundColor: "#4A7BA7",
                      color: "#fff",
                      fontWeight: "bold",
                      textAlign: "center",
                      border: "1px solid #000",
                      padding: "12px 8px",
                      fontSize: "11px",
                      width: "13%",
                    }}>
                    DUE DATE
                  </td>
                  <td
                    style={{
                      backgroundColor: "#4A7BA7",
                      color: "#fff",
                      fontWeight: "bold",
                      textAlign: "center",
                      border: "1px solid #000",
                      padding: "12px 8px",
                      fontSize: "11px",
                      width: "13%",
                    }}>
                    DATE ACCOMPLISHED
                  </td>
                  <td
                    style={{
                      backgroundColor: "#4A7BA7",
                      color: "#fff",
                      fontWeight: "bold",
                      textAlign: "center",
                      border: "1px solid #000",
                      padding: "12px 8px",
                      fontSize: "11px",
                      width: "22%",
                    }}>
                    EXPECTED PROGRESS
                  </td>
                  <td
                    style={{
                      backgroundColor: "#4A7BA7",
                      color: "#fff",
                      fontWeight: "bold",
                      textAlign: "center",
                      border: "1px solid #000",
                      padding: "12px 8px",
                      fontSize: "11px",
                      width: "14%",
                    }}>
                    SIGNATURE OF IMMEDIATE SUPERIOR
                  </td>
                </tr>
                {displayActions.map((action) => (
                  <tr key={action.id}>
                    <td
                      style={{
                        textAlign: "center",
                        border: "1px solid #000",
                        padding: "12px 8px",
                        fontSize: "11px",
                        minHeight: "40px",
                      }}>
                      {!action.isEmpty && action.goalNumber
                        ? action.goalNumber
                        : ""}
                    </td>
                    <td
                      style={{
                        border: "1px solid #000",
                        padding: "12px 8px",
                        fontSize: "11px",
                        minHeight: "40px",
                      }}>
                      {!action.isEmpty ? action.activity || "" : ""}
                    </td>
                    <td
                      style={{
                        border: "1px solid #000",
                        padding: "12px 8px",
                        fontSize: "11px",
                        minHeight: "40px",
                      }}>
                      {!action.isEmpty ? action.due_date || "" : ""}
                    </td>
                    <td
                      style={{
                        border: "1px solid #000",
                        padding: "12px 8px",
                        fontSize: "11px",
                        minHeight: "40px",
                      }}>
                      {!action.isEmpty ? action.date_accomplished || "" : ""}
                    </td>
                    <td
                      style={{
                        border: "1px solid #000",
                        padding: "12px 8px",
                        fontSize: "11px",
                        minHeight: "40px",
                      }}>
                      {!action.isEmpty ? action.expected_progress || "" : ""}
                    </td>
                    <td
                      style={{
                        border: "1px solid #000",
                        padding: "12px 8px",
                        fontSize: "11px",
                        minHeight: "40px",
                      }}></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: "16px" }}>
            <p
              style={{
                fontWeight: "bold",
                fontSize: "13px",
                marginBottom: "4px",
              }}>
              Part III. RESOURCES
            </p>
            <p
              style={{
                fontSize: "10px",
                fontStyle: "italic",
                marginBottom: "8px",
              }}>
              List resources needed and available resources to complete goal
              activities; for example, training activities, seminars, peer
              mentoring, management interaction, lack of experience, equipment
              needs, etc.
            </p>

            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                border: "2px solid #000",
              }}>
              <tbody>
                <tr>
                  <td
                    style={{
                      backgroundColor: "#4A7BA7",
                      color: "#fff",
                      fontWeight: "bold",
                      textAlign: "center",
                      border: "1px solid #000",
                      padding: "12px 8px",
                      fontSize: "11px",
                      width: "23%",
                    }}>
                    RESOURCE ITEM
                  </td>
                  <td
                    style={{
                      backgroundColor: "#4A7BA7",
                      color: "#fff",
                      fontWeight: "bold",
                      textAlign: "center",
                      border: "1px solid #000",
                      padding: "12px 8px",
                      fontSize: "11px",
                      width: "30%",
                    }}>
                    DESCRIPTION OF RESOURCES
                  </td>
                  <td
                    style={{
                      backgroundColor: "#4A7BA7",
                      color: "#fff",
                      fontWeight: "bold",
                      textAlign: "center",
                      border: "1px solid #000",
                      padding: "12px 8px",
                      fontSize: "11px",
                      width: "27%",
                    }}>
                    PERSON/DEPT. IN CHARGE
                  </td>
                  <td
                    style={{
                      backgroundColor: "#4A7BA7",
                      color: "#fff",
                      fontWeight: "bold",
                      textAlign: "center",
                      border: "1px solid #000",
                      padding: "12px 8px",
                      fontSize: "11px",
                      width: "20%",
                    }}>
                    DUE DATE
                  </td>
                </tr>
                {displayResources.map((resource) => (
                  <tr key={resource.id}>
                    <td
                      style={{
                        border: "1px solid #000",
                        padding: "12px 8px",
                        fontSize: "11px",
                        minHeight: "40px",
                      }}>
                      {!resource.isEmpty ? resource.resource_item || "" : ""}
                    </td>
                    <td
                      style={{
                        border: "1px solid #000",
                        padding: "12px 8px",
                        fontSize: "11px",
                        minHeight: "40px",
                      }}>
                      {!resource.isEmpty ? resource.description || "" : ""}
                    </td>
                    <td
                      style={{
                        border: "1px solid #000",
                        padding: "12px 8px",
                        fontSize: "11px",
                        minHeight: "40px",
                      }}>
                      {!resource.isEmpty ? resource.person_in_charge || "" : ""}
                    </td>
                    <td
                      style={{
                        border: "1px solid #000",
                        padding: "12px 8px",
                        fontSize: "11px",
                        minHeight: "40px",
                      }}>
                      {!resource.isEmpty ? resource.due_date || "" : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: "16px" }}>
            <p
              style={{
                fontWeight: "bold",
                fontSize: "13px",
                marginBottom: "4px",
              }}>
              Part IV. SCHEDULE OF PERFORMANCE COACHING
            </p>

            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                border: "2px solid #000",
              }}>
              <tbody>
                <tr>
                  <td
                    style={{
                      backgroundColor: "#4A7BA7",
                      color: "#fff",
                      fontWeight: "bold",
                      textAlign: "center",
                      border: "1px solid #000",
                      padding: "12px 8px",
                      fontSize: "11px",
                      width: "20%",
                    }}>
                    MONTH
                  </td>
                  <td
                    style={{
                      backgroundColor: "#4A7BA7",
                      color: "#fff",
                      fontWeight: "bold",
                      textAlign: "center",
                      border: "1px solid #000",
                      padding: "12px 8px",
                      fontSize: "11px",
                      width: "20%",
                    }}>
                    DATE
                  </td>
                  <td
                    style={{
                      backgroundColor: "#4A7BA7",
                      color: "#fff",
                      fontWeight: "bold",
                      textAlign: "center",
                      border: "1px solid #000",
                      padding: "12px 8px",
                      fontSize: "11px",
                      width: "40%",
                    }}>
                    COMMITMENT
                  </td>
                  <td
                    style={{
                      backgroundColor: "#4A7BA7",
                      color: "#fff",
                      fontWeight: "bold",
                      textAlign: "center",
                      border: "1px solid #000",
                      padding: "12px 8px",
                      fontSize: "11px",
                      width: "20%",
                    }}>
                    EMPLOYEE SIGNATURE
                  </td>
                </tr>
                {displayCoachingSessions.map((session) => (
                  <tr key={session.id}>
                    <td
                      style={{
                        border: "1px solid #000",
                        padding: "12px 8px",
                        fontSize: "11px",
                        minHeight: "40px",
                      }}>
                      {!session.isEmpty ? session.month_label || "" : ""}
                    </td>
                    <td
                      style={{
                        border: "1px solid #000",
                        padding: "12px 8px",
                        fontSize: "11px",
                        minHeight: "40px",
                      }}>
                      {!session.isEmpty ? session.session_date || "" : ""}
                    </td>
                    <td
                      style={{
                        border: "1px solid #000",
                        padding: "12px 8px",
                        fontSize: "11px",
                        minHeight: "40px",
                      }}>
                      {!session.isEmpty ? session.commitment || "" : ""}
                    </td>
                    <td
                      style={{
                        border: "1px solid #000",
                        padding: "12px 8px",
                        fontSize: "11px",
                        minHeight: "40px",
                      }}></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: "20px" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
              }}>
              <tbody>
                <tr>
                  <td
                    style={{
                      width: "33.33%",
                      textAlign: "center",
                      padding: "4px",
                    }}>
                    <div style={{ fontSize: "11px", marginBottom: "4px" }}>
                      Assessed by:
                    </div>
                    <div style={{ height: "50px" }}></div>
                    <div
                      style={{
                        borderTop: "1px solid #000",
                        paddingTop: "4px",
                      }}>
                      <div style={{ fontSize: "10px", margin: "2px 0" }}>
                        Immediate Superior
                      </div>
                      <div style={{ fontSize: "10px", margin: "2px 0" }}>
                        (Name, Signature, Date)
                      </div>
                    </div>
                  </td>
                  <td
                    style={{
                      width: "33.33%",
                      textAlign: "center",
                      padding: "4px",
                    }}>
                    <div style={{ fontSize: "11px", marginBottom: "4px" }}>
                      Reviewed by:
                    </div>
                    <div style={{ height: "50px" }}></div>
                    <div
                      style={{
                        borderTop: "1px solid #000",
                        paddingTop: "4px",
                      }}>
                      <div style={{ fontSize: "10px", margin: "2px 0" }}>
                        Department Head
                      </div>
                      <div style={{ fontSize: "10px", margin: "2px 0" }}>
                        (Name, Signature, Date)
                      </div>
                    </div>
                  </td>
                  <td
                    style={{
                      width: "33.33%",
                      textAlign: "center",
                      padding: "4px",
                    }}>
                    <div style={{ fontSize: "11px", marginBottom: "4px" }}>
                      &nbsp;
                    </div>
                    <div style={{ height: "50px" }}></div>
                    <div
                      style={{
                        borderTop: "1px solid #000",
                        paddingTop: "4px",
                      }}>
                      <div style={{ fontSize: "10px", margin: "2px 0" }}>
                        Department Manager/Director
                      </div>
                      <div style={{ fontSize: "10px", margin: "2px 0" }}>
                        (Name, Signature, Date)
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            <div style={{ marginTop: "12px", textAlign: "center" }}>
              <div style={{ fontSize: "11px", marginBottom: "4px" }}>
                Conformed by:
              </div>
              <div style={{ height: "50px" }}></div>
              <div
                style={{
                  borderTop: "1px solid #000",
                  paddingTop: "4px",
                  maxWidth: "300px",
                  margin: "0 auto",
                }}>
                <div style={{ fontSize: "10px", margin: "2px 0" }}>
                  Employee's Signature
                </div>
                <div style={{ fontSize: "10px", margin: "2px 0" }}>
                  (Name, Signature, Date)
                </div>
              </div>
            </div>

            <div style={{ marginTop: "12px", textAlign: "center" }}>
              <div style={{ fontSize: "11px", marginBottom: "4px" }}>
                Noted by:
              </div>
              <div style={{ height: "50px" }}></div>
              <div
                style={{
                  borderTop: "1px solid #000",
                  paddingTop: "4px",
                  maxWidth: "300px",
                  margin: "0 auto",
                }}>
                <div style={{ fontSize: "10px", margin: "2px 0" }}>
                  HR Department
                </div>
                <div style={{ fontSize: "10px", margin: "2px 0" }}>
                  (Name, Signature, Date)
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
            
            .no-print {
              display: none !important;
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
    </div>
  );
};

export default PdpModalPrinting;
