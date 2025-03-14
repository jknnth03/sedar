import * as React from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Box from "@mui/material/Box";
import { usePostTitlesMutation } from "../../features/api/extra";

export default function TitleModal({ open, handleClose }) {
  const [titleName, setTitleName] = React.useState("");
  const [postTitle, { isLoading, isError }] = usePostTitlesMutation();

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!titleName.trim()) return;

    try {
      await postTitle({ title: titleName, status: "Active" }).unwrap();
      setTitleName("");
      handleClose();
    } catch (error) {
      console.error("Failed to add title:", error);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Add Title</DialogTitle>
      <DialogContent>
        <Box minWidth={300}>
          <TextField
            label="Title Name"
            variant="outlined"
            fullWidth
            margin="dense"
            value={titleName}
            onChange={(e) => setTitleName(e.target.value)}
            disabled={isLoading}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={isLoading}>
          {isLoading ? "Adding..." : "Add"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
