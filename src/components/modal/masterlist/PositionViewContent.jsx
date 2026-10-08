import React, { useState } from "react";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Skeleton,
  Chip,
} from "@mui/material";
import {
  useGetPositionEmployeesQuery,
  useGetPositionApproversQuery,
  useGetPositionKpisQuery,
  useGetPositionHistoryQuery,
} from "../../../features/api/masterlist/positionsApi";

const NAVY = "rgb(33, 61, 112)";

// ---- helpers (tolerant sa different response shapes) ----
const pickName = (value, keys = ["name", "title", "code"]) => {
  if (value === null || value === undefined) return "";
  if (typeof value !== "object") return String(value);
  for (const key of keys) {
    if (value[key]) return pickName(value[key], keys);
  }
  return "";
};

const formatSalary = (value) => {
  if (value === null || value === undefined || value === "") return "—";
  const num = Number(value);
  if (Number.isNaN(num)) return String(value);
  return `₱${num.toLocaleString("en-PH", { maximumFractionDigits: 2 })}`;
};

const getAttachmentName = (data) => {
  if (data?.position_attachment_filename) {
    return data.position_attachment_filename;
  }
  if (typeof data?.position_attachment === "string") {
    try {
      const parts = data.position_attachment.split("/");
      return decodeURIComponent(parts[parts.length - 1].split("?")[0]);
    } catch (e) {
      return data.position_attachment;
    }
  }
  return "";
};

const getChargingParts = (data) => {
  const ch = data?.charging;
  const obj = typeof ch === "object" && ch !== null ? ch : {};
  return {
    department:
      pickName(obj.department) || obj.department_name || data?.department || "",
    unit: pickName(obj.unit) || obj.unit_name || data?.unit || "",
    subUnit:
      pickName(obj.sub_unit) ||
      pickName(obj.subunit) ||
      obj.sub_unit_name ||
      data?.sub_unit ||
      "",
  };
};

// Superior sub-line: employee code · position title (same as the dropdown option)
const getSuperiorSub = (data) => {
  const sup = data?.superior;
  if (!sup || typeof sup !== "object") return "";
  const code = sup.employee_code || sup.id_number || "";
  const positionTitle =
    sup.position_title ||
    pickName(sup.position) ||
    pickName(sup.title) ||
    sup.position_name ||
    "";
  return [code, positionTitle].filter(Boolean).join(" · ");
};

// ---- history helpers ----
const HISTORY_COLORS = {
  CHANGE: "#f26522",
  MRF: "#1e6fa8",
  EMPLOYEE_IN: "#1b6b5a",
  EMPLOYEE_OUT: "#b23b3b",
};

const formatHistoryDate = (value) => {
  if (!value) return "";
  let date;
  // date-only strings: build a local date so the day doesn't shift by timezone
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [y, m, d] = value.split("-").map(Number);
    date = new Date(y, m - 1, d);
  } else {
    date = new Date(value);
  }
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

// Bold the "subject" of the sentence (MRF no. / employee name), grey the trailing note
const renderHistoryDescription = (item) => {
  let text = item?.description || "";
  let note = "";

  const noteMatch = text.match(/\s(\([^()]*since this date\))$/);
  if (noteMatch) {
    note = noteMatch[1];
    text = text.slice(0, text.length - noteMatch[0].length);
  }

  let boldPart = "";
  let rest = text;

  if (
    item?.type === "MRF" &&
    item?.reference &&
    text.startsWith(item.reference)
  ) {
    boldPart = item.reference;
    rest = text.slice(item.reference.length);
  } else if (item?.type === "EMPLOYEE_IN" || item?.type === "EMPLOYEE_OUT") {
    const markers = [" moved in", " moved out", " in this position", " left"];
    const positions = markers
      .map((marker) => text.indexOf(marker))
      .filter((i) => i > 0);
    if (positions.length > 0) {
      const cut = Math.min(...positions);
      boldPart = text.slice(0, cut);
      rest = text.slice(cut);
    }
  }

  return (
    <>
      {boldPart ? <b>{boldPart}</b> : null}
      {rest}
      {note ? (
        <Box
          component="span"
          sx={{ color: "text.secondary", fontSize: "12px" }}>
          {" "}
          {note}
        </Box>
      ) : null}
    </>
  );
};

// ---- small presentational pieces ----
const Field = ({ label, children, sub }) => (
  <Box>
    <Typography
      sx={{
        fontSize: "10px",
        fontWeight: 700,
        color: "text.secondary",
        letterSpacing: "0.5px",
        textTransform: "uppercase",
        mb: 0.25,
      }}>
      {label}
    </Typography>
    <Typography component="div" sx={{ fontSize: "13px", fontWeight: 400 }}>
      {children || "—"}
    </Typography>
    {sub ? (
      <Typography
        sx={{
          fontSize: "11px",
          color: "text.secondary",
          textTransform: "uppercase",
        }}>
        {sub}
      </Typography>
    ) : null}
  </Box>
);

const Card = ({ title, children }) => (
  <Box
    sx={{
      border: "1px solid #e0e0e0",
      borderRadius: "8px",
      p: 2,
      mb: 2,
    }}>
    <Typography sx={{ fontSize: "13px", fontWeight: 700, mb: 1.5 }}>
      {title}
    </Typography>
    {children}
  </Box>
);

const Grid3 = ({ children }) => (
  <Box
    sx={{
      display: "grid",
      gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
      gap: 2,
    }}>
    {children}
  </Box>
);

const headCellSx = {
  fontSize: "10px",
  fontWeight: 700,
  color: "text.secondary",
  letterSpacing: "0.5px",
  textTransform: "uppercase",
};

const Note = ({ children }) => (
  <Typography sx={{ fontSize: "11px", color: "text.secondary", mt: 1.5 }}>
    {children}
  </Typography>
);

const LoadingRows = ({ cols }) => (
  <>
    {[...Array(3)].map((_, i) => (
      <TableRow key={i}>
        {[...Array(cols)].map((__, j) => (
          <TableCell key={j}>
            <Skeleton animation="wave" height={24} />
          </TableCell>
        ))}
      </TableRow>
    ))}
  </>
);

const EmptyRow = ({ cols, message }) => (
  <TableRow>
    <TableCell
      colSpan={cols}
      align="center"
      sx={{ py: 3, color: "text.secondary" }}>
      {message}
    </TableCell>
  </TableRow>
);

const TabLabel = ({ label, count }) => (
  <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}>
    {label}
    {count !== undefined && count !== null ? (
      <Box component="span" sx={{ fontSize: "10px", color: "text.secondary" }}>
        {count}
      </Box>
    ) : null}
  </Box>
);

const PositionViewContent = ({
  positionId,
  data,
  displayTitle,
  displayCharging,
  displaySchedule,
  displayTeam,
  displaySuperior,
  displayTools,
  onViewAttachment,
}) => {
  const [tab, setTab] = useState(0);

  const skip = !positionId;
  const { data: employeesRes, isFetching: employeesLoading } =
    useGetPositionEmployeesQuery(positionId, { skip });
  const { data: approversRes, isFetching: approversLoading } =
    useGetPositionApproversQuery(positionId, { skip });
  const { data: kpisRes, isFetching: kpisLoading } = useGetPositionKpisQuery(
    positionId,
    { skip },
  );
  const { data: historyRes, isFetching: historyLoading } =
    useGetPositionHistoryQuery(positionId, { skip });

  const employees = employeesRes?.result?.data || [];
  const approvers = approversRes?.result?.approvers || [];
  const approversStatus = approversRes?.result?.status;
  const kpis = kpisRes?.result?.kpis || [];
  const history = Array.isArray(historyRes?.result) ? historyRes.result : [];

  const { department, unit, subUnit } = getChargingParts(data);
  const chargingName = displayCharging || pickName(data?.charging);
  const attachmentName = getAttachmentName(data);

  const jobLevel = data?.job_level;
  const jobLevelName = pickName(jobLevel);
  const jobLevelSub = jobLevel
    ? [
        jobLevelName,
        typeof jobLevel === "object"
          ? jobLevel.level_type || jobLevel.type || jobLevel.description
          : "",
        data?.pay_frequency,
      ]
        .filter(Boolean)
        .join(" | ")
    : "";

  const scheduleSub =
    typeof data?.schedule === "object" && data?.schedule !== null
      ? data.schedule.days || data.schedule.description || ""
      : "";

  const statusText = approversStatus
    ? String(pickName(approversStatus) || approversStatus).toUpperCase()
    : approvers.some((a) => a.issue)
      ? "NEEDS ATTENTION"
      : approvers.length > 0
        ? "READY"
        : "";
  const statusOk = statusText === "READY";

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "baseline",
          gap: 1.5,
          flexWrap: "wrap",
          mb: 1,
        }}>
        <Typography
          sx={{
            fontSize: "22px",
            fontWeight: 700,
            color: NAVY,
            textTransform: "uppercase",
          }}>
          {displayTitle || pickName(data?.title) || "—"}
        </Typography>
        <Typography sx={{ fontSize: "12px", color: "text.secondary" }}>
          {[data?.code, subUnit || chargingName].filter(Boolean).join(" · ")}
        </Typography>
      </Box>

      <Tabs
        value={tab}
        onChange={(e, value) => setTab(value)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          minHeight: 40,
          borderBottom: "1px solid #e0e0e0",
          mb: 2,
          "& .MuiTabs-indicator": { backgroundColor: NAVY },
          "& .MuiTab-root": {
            minHeight: 40,
            fontSize: "12px",
            fontWeight: 700,
            letterSpacing: "0.5px",
            color: "text.secondary",
          },
          "& .Mui-selected": { color: `${NAVY} !important` },
        }}>
        <Tab label="DETAILS" />
        <Tab
          label={
            <TabLabel
              label="EMPLOYEES"
              count={employeesLoading ? null : employees.length}
            />
          }
        />
        <Tab label="APPROVERS" />
        <Tab
          label={
            <TabLabel label="KPIS" count={kpisLoading ? null : kpis.length} />
          }
        />
        <Tab label="HISTORY" />
      </Tabs>

      {/* DETAILS */}
      {tab === 0 && (
        <Box>
          <Card title="Position">
            <Grid3>
              <Field label="Code">{data?.code}</Field>
              <Field label="Title">
                {displayTitle || pickName(data?.title)}
              </Field>
              <Field label="Superior" sub={getSuperiorSub(data)}>
                {displaySuperior}
              </Field>
              <Field label="Job Level" sub={jobLevelSub}>
                {jobLevelName}
              </Field>
              <Field label="Expected Salary">
                {formatSalary(data?.expected_salary)}
              </Field>
              <Field label="Pay Frequency">{data?.pay_frequency}</Field>
              <Field label="Headcount">
                {data?.headcount !== null && data?.headcount !== undefined
                  ? String(data.headcount)
                  : ""}
              </Field>
              <Field label="Schedule" sub={scheduleSub}>
                {displaySchedule}
              </Field>
              <Field label="Team">{displayTeam}</Field>
              <Field label="Tools">{displayTools}</Field>
            </Grid3>
            <Box sx={{ mt: 2 }}>
              <Field label="Attachment">
                {attachmentName ? (
                  <Box
                    component="span"
                    onClick={onViewAttachment}
                    sx={{
                      color: "primary.main",
                      textDecoration: "underline",
                      cursor: "pointer",
                    }}>
                    {attachmentName}
                  </Box>
                ) : null}
              </Field>
            </Box>
          </Card>

          <Card title="Charging">
            <Grid3>
              <Field label="Department">{department}</Field>
              <Field label="Unit">{unit}</Field>
              <Field label="Sub-Unit">{subUnit}</Field>
            </Grid3>
            <Box sx={{ mt: 2 }}>
              <Field label="Charging">{chargingName}</Field>
            </Box>
          </Card>
        </Box>
      )}

      {/* EMPLOYEES */}
      {tab === 1 && (
        <Box>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={headCellSx}>Employee</TableCell>
                <TableCell sx={headCellSx}>Employment Type</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {employeesLoading ? (
                <LoadingRows cols={2} />
              ) : employees.length === 0 ? (
                <EmptyRow cols={2} message="No employees in this position" />
              ) : (
                employees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>
                      <Typography
                        sx={{
                          fontSize: "13px",
                          fontWeight: 700,
                          textTransform: "uppercase",
                        }}>
                        {employee.full_name}
                      </Typography>
                      <Typography
                        sx={{ fontSize: "11px", color: "text.secondary" }}>
                        {employee.employee_code || employee.id_number}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ fontSize: "13px" }}>
                      {employee.employment_type || "—"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <Note>Active employees whose current position is this one.</Note>
        </Box>
      )}

      {/* APPROVERS */}
      {tab === 2 && (
        <Box>
          {statusText && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <Typography sx={{ fontSize: "12px" }}>List status:</Typography>
              <Chip
                label={statusText}
                size="small"
                sx={{
                  height: 20,
                  fontSize: "10px",
                  fontWeight: 700,
                  backgroundColor: statusOk ? "#e8f5e8" : "#fff7f7",
                  color: statusOk ? "#2e7d32" : "#d32f2f",
                }}
              />
            </Box>
          )}
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={headCellSx}>#</TableCell>
                <TableCell sx={headCellSx}>Approver Position</TableCell>
                <TableCell sx={headCellSx}>Current Holder</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {approversLoading ? (
                <LoadingRows cols={3} />
              ) : approvers.length === 0 ? (
                <EmptyRow cols={3} message="No approvers set" />
              ) : (
                approvers.map((approver, index) => (
                  <TableRow key={approver.position_id || index}>
                    <TableCell sx={{ fontSize: "13px" }}>
                      {approver.sequence ?? index + 1}
                    </TableCell>
                    <TableCell sx={{ fontSize: "13px" }}>
                      <b>{approver.code}</b> {approver.title}
                    </TableCell>
                    <TableCell
                      sx={{ fontSize: "13px", textTransform: "uppercase" }}>
                      {approver.holder?.full_name || (
                        <Box component="span" sx={{ color: "#d32f2f" }}>
                          {approver.issue || "—"}
                        </Box>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <Note>
            Then the form&apos;s standard approvers. Edit the list in Approval
            Settings → Approval Flow.
          </Note>
        </Box>
      )}

      {/* HISTORY */}
      {tab === 4 && (
        <Box sx={{ pt: 0.5 }}>
          {historyLoading ? (
            [...Array(4)].map((_, i) => (
              <Box key={i} sx={{ mb: 2 }}>
                <Skeleton animation="wave" width="25%" height={16} />
                <Skeleton animation="wave" width="80%" height={22} />
              </Box>
            ))
          ) : history.length === 0 ? (
            <Typography
              sx={{
                fontSize: "13px",
                color: "text.secondary",
                textAlign: "center",
                py: 3,
              }}>
              No history for this position yet
            </Typography>
          ) : (
            history.map((item, index) => (
              <Box
                key={`${item.date}-${index}`}
                sx={{
                  position: "relative",
                  pl: 3.5,
                  pb: 2.5,
                  "&:not(:last-child)::before": {
                    content: '""',
                    position: "absolute",
                    left: 4,
                    top: 16,
                    bottom: 0,
                    width: "2px",
                    backgroundColor: "#d0d5dd",
                  },
                }}>
                <Box
                  sx={{
                    position: "absolute",
                    left: 0,
                    top: 5,
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    backgroundColor: HISTORY_COLORS[item.type] || "#9e9e9e",
                  }}
                />
                <Box sx={{ display: "flex", gap: 1, alignItems: "baseline" }}>
                  <Typography
                    sx={{ fontSize: "12px", color: "text.secondary" }}>
                    {formatHistoryDate(item.date)}
                  </Typography>
                  {item.by ? (
                    <Typography
                      sx={{ fontSize: "12px", color: "text.secondary" }}>
                      {item.by}
                    </Typography>
                  ) : null}
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    flexWrap: "wrap",
                  }}>
                  <Typography component="div" sx={{ fontSize: "13px" }}>
                    {renderHistoryDescription(item)}
                  </Typography>
                  {item.status ? (
                    <Chip
                      label={String(item.status).toUpperCase()}
                      size="small"
                      sx={{
                        height: 18,
                        fontSize: "10px",
                        fontWeight: 700,
                        backgroundColor: "#eceff1",
                        color: "text.secondary",
                      }}
                    />
                  ) : null}
                </Box>
              </Box>
            ))
          )}
        </Box>
      )}

      {/* KPIS */}
      {tab === 3 && (
        <Box>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={headCellSx}>Objective</TableCell>
                <TableCell sx={headCellSx}>Deliverable</TableCell>
                <TableCell sx={headCellSx}>Weight</TableCell>
                <TableCell sx={headCellSx}>Target</TableCell>
                <TableCell sx={headCellSx}>Remarks</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {kpisLoading ? (
                <LoadingRows cols={5} />
              ) : kpis.length === 0 ? (
                <EmptyRow cols={5} message="No KPIs set for this position" />
              ) : (
                kpis.map((kpi) => (
                  <TableRow key={kpi.id}>
                    <TableCell
                      sx={{
                        fontSize: "13px",
                        fontWeight: 700,
                        textTransform: "uppercase",
                      }}>
                      {kpi.objective_name}
                    </TableCell>
                    <TableCell sx={{ fontSize: "13px" }}>
                      {kpi.deliverable}
                    </TableCell>
                    <TableCell sx={{ fontSize: "13px" }}>
                      {kpi.distribution_percentage ?? "—"}
                      {kpi.distribution_percentage !== null &&
                      kpi.distribution_percentage !== undefined
                        ? "%"
                        : ""}
                    </TableCell>
                    <TableCell sx={{ fontSize: "13px" }}>
                      {kpi.target_percentage ?? "—"}
                      {kpi.target_percentage !== null &&
                      kpi.target_percentage !== undefined
                        ? "%"
                        : ""}
                    </TableCell>
                    <TableCell sx={{ fontSize: "13px" }}>
                      {kpi.remarks || "—"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <Note>Edit them in Masterlist → KPI.</Note>
        </Box>
      )}
    </Box>
  );
};

export default PositionViewContent;
