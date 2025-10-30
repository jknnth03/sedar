import React from "react";
import "./DataChangeNoticePrinting.scss";
import logo from "../../../../assets/RDFLOGO.png";

const blankData = {
  employee_name: "",
  employee_number: "",
  effective_date: "",
  date_prepared: "",
  movement_type: "",
  from: {
    department: "",
    unit: "",
    sub_unit: "",
    position_title: "",
    job_level: "",
    job_rate: "",
    allowance: "",
    schedule: "",
  },
  to: {
    department: "",
    unit: "",
    sub_unit: "",
    position_title: "",
    job_level: "",
    job_rate: "",
    allowance: "",
    schedule: "",
  },
  signatories: {
    requested_by: "",
    prepared_by: "",
    approved_by: {
      name: "",
      position: "",
    },
  },
};

export function DataChangeNoticePrinting({ data = blankData }) {
  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "[Date]";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "[Date]";
    }
  };

  const actualData = data?.result || data;

  return (
    <>
      <button onClick={handlePrint} className="print-button">
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
          />
        </svg>
        Print Document
      </button>

      <div className="page-container">
        <div className="print-padding">
          <div className="document-container">
            <div className="content-padding">
              <div className="header-section">
                <div className="divider"></div>
                <div className="logo-container">
                  <img src={logo} alt="RDF Feed, Livestock & Foods, Inc." />
                </div>
              </div>

              <p className="body-text">
                {formatDate(actualData.date_prepared)}
              </p>

              <p className="body-text">
                Dear {actualData.employee_name || "[Employee Name]"},
              </p>

              <p className="body-text" style={{ fontStyle: "italic" }}>
                <strong>Congratulations!</strong>
              </p>

              <p className="body-text">
                We are delighted to inform you that you have successfully
                completed your Developmental Assignment. Therefore, you are
                promoted to your new position, effective{" "}
                {formatDate(actualData.effective_date)}.
              </p>

              <table className="changes-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th className="text-center">From</th>
                    <th className="text-center">To</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Department</td>
                    <td className="text-center">
                      {actualData.from?.department || ""}
                    </td>
                    <td className="text-center">
                      {actualData.to?.department || ""}
                    </td>
                  </tr>
                  <tr>
                    <td>Unit</td>
                    <td className="text-center">
                      {actualData.from?.unit || ""}
                    </td>
                    <td className="text-center">{actualData.to?.unit || ""}</td>
                  </tr>
                  <tr>
                    <td>Sub-unit</td>
                    <td className="text-center">
                      {actualData.from?.sub_unit || ""}
                    </td>
                    <td className="text-center">
                      {actualData.to?.sub_unit || ""}
                    </td>
                  </tr>
                  <tr>
                    <td>Position</td>
                    <td className="text-center">
                      {actualData.from?.position_title || ""}
                    </td>
                    <td className="text-center">
                      {actualData.to?.position_title || ""}
                    </td>
                  </tr>
                  <tr>
                    <td>Job Level</td>
                    <td className="text-center">
                      {actualData.from?.job_level || ""}
                    </td>
                    <td className="text-center">
                      {actualData.to?.job_level || ""}
                    </td>
                  </tr>
                  <tr>
                    <td>Job Salary</td>
                    <td className="text-center">
                      {actualData.from?.job_rate || ""}
                    </td>
                    <td className="text-center">
                      {actualData.to?.job_rate || ""}
                    </td>
                  </tr>
                  <tr>
                    <td>Work Schedule</td>
                    <td className="text-center"></td>
                    <td className="text-center"></td>
                  </tr>
                  <tr>
                    <td>Rest Day/s</td>
                    <td className="text-center"></td>
                    <td className="text-center"></td>
                  </tr>
                  <tr>
                    <td>Workweek</td>
                    <td className="text-center"></td>
                    <td className="text-center"></td>
                  </tr>
                </tbody>
              </table>

              <div className="signature-section">
                <p className="body-text">All the best,</p>

                <div className="hr-section">
                  <p className="hr-name">
                    {actualData.signatories?.approved_by?.name || ""}
                  </p>
                  <p className="hr-title">Human Resources Head</p>
                </div>

                <div className="acknowledgment-section">
                  <p className="body-text">Acknowledged by:</p>
                  <div className="signature-line"></div>
                  <p className="signature-label">
                    (Signature over Printed Name)
                  </p>
                </div>
              </div>
            </div>

            <div className="footer-section">
              <div className="footer-content">
                <p className="footer-address">
                  Purok 6, Barangay Lara, City of San Fernando, Pampanga 2000
                  Philippines
                </p>
                <div className="footer-contact">
                  <span>Tel. No: 045-4363831</span>
                  <span>•</span>
                  <span>website: www.reddragonfarmph.com</span>
                  <span>•</span>
                  <span>email: inquiry@reddragonfarm.com</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default DataChangeNoticePrinting;
