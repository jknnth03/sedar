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
        backgroundColor: active ? "#00df0bff" : "#ffe600ff", // Green for active, Purple for inactive
        color: "white",
        width: 24,
        height: 24,
        display: "flex",
        borderRadius: "50%",
        justifyContent: "center",
        alignItems: "center",
        fontSize: "0.8rem", // Larger font size
        fontWeight: "600", // Medium bold
        fontFamily: "Roboto, Arial, sans-serif", // Custom font family
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
    backgroundColor: "#2e7d32", // Green for active step
    color: "white",
  }),
  ...(!active && {
    backgroundColor: "#b0a227ff", // Purple for inactive steps
    color: "white",
  }),
}));
