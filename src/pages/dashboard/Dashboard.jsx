import * as React from "react";
import "../../pages/dashboard/Dashboard.scss";
import { useSelector } from "react-redux";

function DashboardLayoutNavigationActions() {
  const token = useSelector((state) => state?.auth?.token);

  console.log(token);
}

export default DashboardLayoutNavigationActions;
