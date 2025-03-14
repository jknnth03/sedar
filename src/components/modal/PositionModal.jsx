import * as React from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";

const currencies = [
  { value: "USD", label: "$" },
  { value: "EUR", label: "€" },
  { value: "BTC", label: "฿" },
  { value: "JPY", label: "¥" },
];

export default function FormDialog({ open, handleClose }) {
  const [department, setDepartment] = React.useState("");
  const [subunit, setSubunit] = React.useState("");

  const handleDepartmentChange = (event) => {
    setDepartment(event.target.value);
  };

  const handleSubunitChange = (event) => {
    setSubunit(event.target.value);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      slotProps={{
        paper: {
          component: "form",
          onSubmit: (event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            const formJson = Object.fromEntries(formData.entries());
            console.log("Department:", formJson.department);
            console.log("Subunit:", formJson.subunit);
            handleClose();
          },
        },
      }}>
      <DialogTitle>Position</DialogTitle>
      <DialogContent>
        <Box minWidth={300}>
          <TextField
            id="department"
            select
            label="Department"
            name="department"
            value={department}
            onChange={handleDepartmentChange}
            fullWidth
            margin="dense">
            {currencies.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            id="subunit"
            select
            label="Subunit"
            name="subunit"
            value={subunit}
            onChange={handleSubunitChange}
            fullWidth
            margin="dense"
            sx={{ mt: 2 }}>
            {currencies.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            id="jobbands"
            select
            label="Job Bands"
            name="jobbands"
            value={subunit}
            onChange={handleSubunitChange}
            fullWidth
            margin="dense"
            sx={{ mt: 2 }}>
            {currencies.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            id="positionname"
            select
            label="Position Name"
            name="positionname"
            value={subunit}
            onChange={handleSubunitChange}
            fullWidth
            margin="dense"
            sx={{ mt: 2 }}>
            {currencies.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            id="shiftschedule"
            select
            label="Shift & Schedule"
            name="shiftschedule"
            value={subunit}
            onChange={handleSubunitChange}
            fullWidth
            margin="dense"
            sx={{ mt: 2 }}>
            {currencies.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            id="immediatesupervisor"
            select
            label="Shift & Schedule"
            name="shiftschedule"
            value={subunit}
            onChange={handleSubunitChange}
            fullWidth
            margin="dense"
            sx={{ mt: 2 }}>
            {currencies.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button type="submit">Add</Button>
      </DialogActions>
    </Dialog>
  );
}
