// EmployeeWizardStyledComponents.js
import { styled } from "@mui/material/styles";
import { StepIcon } from "@mui/material";

export const CustomStepIcon = styled((props) => {
  const { active, completed, className, icon, isViewOrEditMode } = props;

  if (!isViewOrEditMode) {
    return <StepIcon {...props} />;
  }

  return (
    <div
      className={className}
      style={{
        backgroundColor: active ? "#1976d2" : "#ffa726",
        color: "white",
        width: 24,
        height: 24,
        display: "flex",
        borderRadius: "50%",
        justifyContent: "center",
        alignItems: "center",
        fontSize: "0.75rem",
        fontWeight: "bold",
      }}>
      {icon}
    </div>
  );
})(({ theme, active }) => ({
  zIndex: 1,
  width: 24,
  height: 24,
  display: "flex",
  borderRadius: "50%",
  justifyContent: "center",
  alignItems: "center",
  ...(active && {
    backgroundColor: "#1976d2",
    color: "white",
  }),
  ...(!active && {
    backgroundColor: "#ffa726",
    color: "white",
  }),
}));
