import React from "react";
import { StepIcon } from "@mui/material";

export const CustomStepIcon = (props) => {
  const { active, completed, icon, isViewOrEditMode } = props;

  if (!isViewOrEditMode) {
    return <StepIcon {...props} />;
  }

  return (
    <div
      style={{
        backgroundColor: active ? "rgb(33, 61, 112)" : "#00881dff",
        width: 24,
        height: 24,
        display: "flex",
        borderRadius: "50%",
        justifyContent: "center",
        alignItems: "center",
        fontSize: "0.75rem",
        fontWeight: 600,
        fontFamily: "Roboto, Arial, sans-serif",
        color: "white",
      }}
      className="custom-step-icon">
      <span
        style={{
          color: "white",
          fontWeight: 600,
          fontSize: "0.6rem",
          lineHeight: 1,
          textShadow: "none",
          WebkitTextFillColor: "white",
          filter: "invert(0)",
        }}
        className="step-number">
        {icon}
      </span>
    </div>
  );
};
