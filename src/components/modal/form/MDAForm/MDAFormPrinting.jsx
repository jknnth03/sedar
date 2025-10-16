import React from "react";
import logo from "../../../../assets/RDFLOGO.png";
import "./MDAFormPrinting.scss";
import dayjs from "dayjs";

const blankData = {
  employee_number: "",
  date_prepared: "",
  employee_name: "",
  personal_data: {
    birthdate: "",
    address: "",
    birth_place: "",
    tin: "",
    gender: "",
    sss: "",
    civil_status: "",
    pag_ibig: "",
    nationality: "",
    philhealth: "",
  },
  action_type: {
    probationary: false,
    transfer: false,
    merit_increase: false,
    regularization: false,
    special_assignment: false,
    separation_with_benefits: false,
    promotion: false,
    upgrading: false,
    separation_without_benefits: false,
    developmental_assignment: false,
    downgrading: false,
    others: false,
    others_specify: "",
  },
  effective_date: "",
  from: {
    department: "",
    position_title: "",
    job_grade: "",
    basic_salary: "",
    training_allowance: "",
  },
  to: {
    department: "",
    position_title: "",
    job_grade: "",
    basic_salary: "",
    training_allowance: "",
  },
  signatories: {
    prepared_by: "",
    recommended_by: "",
    approved_by: "",
  },
};

export function MDAFormPrinting({ data = blankData }) {
  const handlePrint = () => {
    window.print();
  };

  const getActionTypeFromMovement = (movementType) => {
    if (!movementType) {
      return blankData.action_type;
    }

    const movementMap = {
      probationary: "probationary",
      transfer: "transfer",
      "merit increase": "merit_increase",
      regularization: "regularization",
      "special assignment": "special_assignment",
      "separation with benefits": "separation_with_benefits",
      promotion: "promotion",
      upgrading: "upgrading",
      "separation without benefits": "separation_without_benefits",
      "developmental assignment": "developmental_assignment",
      downgrading: "downgrading",
    };

    const lowerMovement = movementType.toLowerCase();
    const actionType = { ...blankData.action_type };

    if (movementMap[lowerMovement]) {
      actionType[movementMap[lowerMovement]] = true;
    }

    return actionType;
  };

  const parseData = () => {
    const result = data?.result || data;
    const submittable = result?.submittable || {};

    const fromDetails = submittable.from_details || {};
    const toDetails = submittable.to_details || {};

    return {
      employee_number: submittable.employee_number || "",
      date_prepared: result.created_at
        ? dayjs(result.created_at).format("YYYY-MM-DD")
        : "",
      employee_name: submittable.employee_name || "",
      personal_data: {
        birthdate: submittable.birth_date
          ? dayjs(submittable.birth_date).format("YYYY-MM-DD")
          : "",
        address: submittable.address || "",
        birth_place: submittable.birth_place || "",
        tin: submittable.tin_number || "",
        gender: submittable.gender || "",
        sss: submittable.sss_number || "",
        civil_status: submittable.civil_status || "",
        pag_ibig: submittable.pag_ibig_number || "",
        nationality: submittable.nationality || "",
        philhealth: submittable.philhealth_number || "",
      },
      action_type: getActionTypeFromMovement(submittable.movement_type),
      effective_date: submittable.effective_date
        ? dayjs(submittable.effective_date).format("YYYY-MM-DD")
        : "",
      from: {
        department: fromDetails.department || "",
        position_title: fromDetails.position_title || "",
        job_grade: fromDetails.job_level || "",
        basic_salary: fromDetails.job_rate || "",
        training_allowance: fromDetails.allowance || "",
      },
      to: {
        department: toDetails.department || "",
        position_title: toDetails.position_title || "",
        job_grade: toDetails.job_level || "",
        basic_salary: toDetails.job_rate || "",
        training_allowance: toDetails.allowance || "",
      },
      signatories: {
        prepared_by: "",
        recommended_by: "",
        approved_by: "",
      },
    };
  };

  const actualData = parseData();

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

      <div className="mda-page-container">
        <div className="mda-print-padding">
          <div className="mda-document-container">
            <div className="mda-header">
              <div className="mda-logo-section">
                <div className="mda-logo-placeholder">
                  <img src={logo} alt="RDF Logo" className="mda-logo-img" />
                </div>
              </div>
              <div className="mda-title-section">
                <h1 className="mda-main-title">MASTER DATA AUTHORITY</h1>
              </div>
            </div>

            <div className="mda-top-info">
              <div className="mda-info-row">
                <div className="mda-info-cell label-cell">Employee Number</div>
                <div className="mda-info-cell value-cell">
                  {actualData.employee_number}
                </div>
                <div className="mda-info-cell label-cell-right">
                  Date Prepared:
                </div>
                <div className="mda-info-cell value-cell-right">
                  {actualData.date_prepared}
                </div>
              </div>
            </div>

            <div className="mda-employee-name">
              <div className="mda-name-row">
                <div className="mda-name-label">Employee Name</div>
                <div className="mda-name-value">{actualData.employee_name}</div>
              </div>
            </div>

            <div className="mda-section-header">PERSONAL DATA</div>
            <table className="mda-table">
              <tbody>
                <tr>
                  <td className="mda-label-col">Birthdate</td>
                  <td className="mda-value-col">
                    {actualData.personal_data?.birthdate}
                  </td>
                  <td className="mda-label-col">Address</td>
                  <td className="mda-value-col">
                    {actualData.personal_data?.address}
                  </td>
                </tr>
                <tr>
                  <td className="mda-label-col">Birth Place</td>
                  <td className="mda-value-col">
                    {actualData.personal_data?.birth_place}
                  </td>
                  <td className="mda-label-col">T.I.N</td>
                  <td className="mda-value-col">
                    {actualData.personal_data?.tin}
                  </td>
                </tr>
                <tr>
                  <td className="mda-label-col">Gender</td>
                  <td className="mda-value-col">
                    {actualData.personal_data?.gender}
                  </td>
                  <td className="mda-label-col">SSS #</td>
                  <td className="mda-value-col">
                    {actualData.personal_data?.sss}
                  </td>
                </tr>
                <tr>
                  <td className="mda-label-col">Civil Status</td>
                  <td className="mda-value-col">
                    {actualData.personal_data?.civil_status}
                  </td>
                  <td className="mda-label-col">Pag-ibig #</td>
                  <td className="mda-value-col">
                    {actualData.personal_data?.pag_ibig}
                  </td>
                </tr>
                <tr>
                  <td className="mda-label-col">Nationality</td>
                  <td className="mda-value-col">
                    {actualData.personal_data?.nationality}
                  </td>
                  <td className="mda-label-col">Philhealth #</td>
                  <td className="mda-value-col">
                    {actualData.personal_data?.philhealth}
                  </td>
                </tr>
              </tbody>
            </table>

            <div className="mda-section-header">ACTION TYPE</div>
            <table className="mda-action-table">
              <tbody>
                <tr>
                  <td className="mda-checkbox-cell">
                    {actualData.action_type?.probationary && (
                      <input type="checkbox" checked={true} readOnly />
                    )}
                  </td>
                  <td className="mda-action-label">Probationary</td>
                  <td className="mda-checkbox-cell">
                    {actualData.action_type?.transfer && (
                      <input type="checkbox" checked={true} readOnly />
                    )}
                  </td>
                  <td className="mda-action-label">Transfer</td>
                  <td className="mda-checkbox-cell">
                    {actualData.action_type?.merit_increase && (
                      <input type="checkbox" checked={true} readOnly />
                    )}
                  </td>
                  <td className="mda-action-label">Merit Increase</td>
                </tr>
                <tr>
                  <td className="mda-checkbox-cell">
                    {actualData.action_type?.regularization && (
                      <input type="checkbox" checked={true} readOnly />
                    )}
                  </td>
                  <td className="mda-action-label">Regularization</td>
                  <td className="mda-checkbox-cell">
                    {actualData.action_type?.special_assignment && (
                      <input type="checkbox" checked={true} readOnly />
                    )}
                  </td>
                  <td className="mda-action-label">Special Assignment</td>
                  <td className="mda-checkbox-cell">
                    {actualData.action_type?.separation_with_benefits && (
                      <input type="checkbox" checked={true} readOnly />
                    )}
                  </td>
                  <td className="mda-action-label">Separation with benefits</td>
                </tr>
                <tr>
                  <td className="mda-checkbox-cell">
                    {actualData.action_type?.promotion && (
                      <input type="checkbox" checked={true} readOnly />
                    )}
                  </td>
                  <td className="mda-action-label">Promotion</td>
                  <td className="mda-checkbox-cell">
                    {actualData.action_type?.upgrading && (
                      <input type="checkbox" checked={true} readOnly />
                    )}
                  </td>
                  <td className="mda-action-label">Upgrading</td>
                  <td className="mda-checkbox-cell">
                    {actualData.action_type?.separation_without_benefits && (
                      <input type="checkbox" checked={true} readOnly />
                    )}
                  </td>
                  <td className="mda-action-label">
                    Separation without benefits
                  </td>
                </tr>
                <tr>
                  <td className="mda-checkbox-cell">
                    {actualData.action_type?.developmental_assignment && (
                      <input type="checkbox" checked={true} readOnly />
                    )}
                  </td>
                  <td className="mda-action-label">Developmental Assignment</td>
                  <td className="mda-checkbox-cell">
                    {actualData.action_type?.downgrading && (
                      <input type="checkbox" checked={true} readOnly />
                    )}
                  </td>
                  <td className="mda-action-label">Downgrading</td>
                  <td className="mda-checkbox-cell">
                    {actualData.action_type?.others && (
                      <input type="checkbox" checked={true} readOnly />
                    )}
                  </td>
                  <td className="mda-action-label">
                    Others (specify) {actualData.action_type?.others_specify}
                  </td>
                </tr>
              </tbody>
            </table>

            <table className="mda-table mda-org-table">
              <thead>
                <tr className="mda-effective-date-row">
                  <td className="mda-effective-date-label" colSpan="1">
                    Effective Date
                  </td>
                  <td className="mda-effective-date-value" colSpan="5">
                    {actualData.effective_date}
                  </td>
                </tr>
                <tr>
                  <th className="mda-org-header-label">Organizational Data</th>
                  <th className="mda-org-header-from">From</th>
                  <th className="mda-org-header-to">To</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="mda-org-label">Department</td>
                  <td className="mda-org-value">
                    {actualData.from?.department}
                  </td>
                  <td className="mda-org-value">{actualData.to?.department}</td>
                </tr>
                <tr>
                  <td className="mda-org-label">Position Title</td>
                  <td className="mda-org-value">
                    {actualData.from?.position_title}
                  </td>
                  <td className="mda-org-value">
                    {actualData.to?.position_title}
                  </td>
                </tr>
                <tr>
                  <td className="mda-org-label">Job Grade</td>
                  <td className="mda-org-value">
                    {actualData.from?.job_grade}
                  </td>
                  <td className="mda-org-value">{actualData.to?.job_grade}</td>
                </tr>
                <tr>
                  <td className="mda-org-label">Basic Salary</td>
                  <td className="mda-org-value">
                    {actualData.from?.basic_salary}
                  </td>
                  <td className="mda-org-value">
                    {actualData.to?.basic_salary}
                  </td>
                </tr>
                <tr>
                  <td className="mda-org-label">
                    Training Allowance (monthly rate)
                  </td>
                  <td className="mda-org-value">
                    {actualData.from?.training_allowance}
                  </td>
                  <td className="mda-org-value">
                    {actualData.to?.training_allowance}
                  </td>
                </tr>
              </tbody>
            </table>

            <div className="mda-signatories">
              <div className="mda-signatory-row">
                <div className="mda-signatory-block">
                  <div className="mda-signatory-label">Prepared by:</div>
                  <div className="mda-signatory-name">
                    {actualData.signatories?.prepared_by}
                  </div>
                </div>
                <div className="mda-signatory-block">
                  <div className="mda-signatory-label">Recommended by:</div>
                  <div className="mda-signatory-name">
                    {actualData.signatories?.recommended_by}
                  </div>
                </div>
                <div className="mda-signatory-block">
                  <div className="mda-signatory-label">Approved By:</div>
                  <div className="mda-signatory-name">
                    {actualData.signatories?.approved_by}
                  </div>
                </div>
              </div>
            </div>

            <div className="mda-footer">
              <p>HR-FRM-18-013 rev.1, Eff. Date July 20, 2022</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default MDAFormPrinting;
