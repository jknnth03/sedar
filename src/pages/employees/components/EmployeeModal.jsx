import { Dialog, DialogTitle, Typography } from "@mui/material";
import React from "react";

function EmployeeModal({ isOpen = false, setOpen, isUpdate = false }) {
  return (
    <Dialog open={isOpen}>
      <DialogTitle>{isUpdate ? "update" : "create"}</DialogTitle>
    </Dialog>
  );
}

export default EmployeeModal;
