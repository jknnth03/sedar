import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
} from "@mui/material";

const CoaDialog = ({ open, onClose, position }) => {
  if (!position || !position.charging) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle
          style={{
            backgroundColor: "rgb(233, 246, 255)",
          }}>
          <Typography
            variant="h6"
            style={{
              fontWeight: "bold",
              fontFamily: "'Helvetica Neue', Arial, sans-serif",
            }}>
            COA Details
          </Typography>
        </DialogTitle>
        <DialogContent style={{ backgroundColor: "white" }}>
          <Typography>No data available</Typography>
        </DialogContent>
        <DialogActions style={{ backgroundColor: "white" }}>
          <Button
            onClick={onClose}
            variant="contained"
            color="primary"
            style={{
              fontFamily: "'Helvetica Neue', Arial, sans-serif",
            }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  const charging = position.charging;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        style={{
          backgroundColor: "rgb(233, 246, 255)",
        }}>
        <Typography
          variant="h6"
          style={{
            fontWeight: "bold",
            fontFamily: "'Helvetica Neue', Arial, sans-serif",
          }}>
          COA Details
        </Typography>
      </DialogTitle>
      <DialogContent style={{ backgroundColor: "white" }}>
        <List>
          <ListItem
            style={{
              borderBottom: "1px solid #ccc",
              fontFamily: "'Helvetica Neue', Arial, sans-serif",
            }}>
            <ListItemText
              primary={<strong>Charging Name:</strong>}
              secondary={charging.name || "Not Available"}
              secondaryTypographyProps={{
                style: { color: "#666", fontSize: "0.9rem" },
              }}
              primaryTypographyProps={{
                style: {
                  fontFamily: "'Helvetica Neue', Arial, sans-serif",
                },
              }}
            />
          </ListItem>
          <ListItem
            style={{
              borderBottom: "1px solid #ccc",
              fontFamily: "'Helvetica Neue', Arial, sans-serif",
            }}>
            <ListItemText
              primary={<strong>Company:</strong>}
              secondary={charging.company_name || "Not Available"}
              secondaryTypographyProps={{
                style: { color: "#666", fontSize: "0.9rem" },
              }}
              primaryTypographyProps={{
                style: {
                  fontFamily: "'Helvetica Neue', Arial, sans-serif",
                },
              }}
            />
          </ListItem>
          <ListItem
            style={{
              borderBottom: "1px solid #ccc",
              fontFamily: "'Helvetica Neue', Arial, sans-serif",
            }}>
            <ListItemText
              primary={<strong>Business Unit:</strong>}
              secondary={charging.business_unit_name || "Not Available"}
              secondaryTypographyProps={{
                style: { color: "#666", fontSize: "0.9rem" },
              }}
            />
          </ListItem>
          <ListItem
            style={{
              borderBottom: "1px solid #ccc",
              fontFamily: "'Helvetica Neue', Arial, sans-serif",
            }}>
            <ListItemText
              primary={<strong>Department:</strong>}
              secondary={charging.department_name || "Not Available"}
              secondaryTypographyProps={{
                style: { color: "#666", fontSize: "0.9rem" },
              }}
            />
          </ListItem>
          <ListItem
            style={{
              borderBottom: "1px solid #ccc",
              fontFamily: "'Helvetica Neue', Arial, sans-serif",
            }}>
            <ListItemText
              primary={<strong>Unit:</strong>}
              secondary={charging.unit_name || "Not Available"}
              secondaryTypographyProps={{
                style: { color: "#666", fontSize: "0.9rem" },
              }}
            />
          </ListItem>
          <ListItem
            style={{
              borderBottom: "1px solid #ccc",
              fontFamily: "'Helvetica Neue', Arial, sans-serif",
            }}>
            <ListItemText
              primary={<strong>Sub-Unit:</strong>}
              secondary={charging.sub_unit_name || "Not Available"}
              secondaryTypographyProps={{
                style: { color: "#666", fontSize: "0.9rem" },
              }}
            />
          </ListItem>
          <ListItem
            style={{
              borderBottom: "1px solid #ccc",
              fontFamily: "'Helvetica Neue', Arial, sans-serif",
            }}>
            <ListItemText
              primary={<strong>Location:</strong>}
              secondary={charging.location_name || "Not Available"}
              secondaryTypographyProps={{
                style: { color: "#666", fontSize: "0.9rem" },
              }}
            />
          </ListItem>
        </List>
      </DialogContent>
      <DialogActions style={{ backgroundColor: "white" }}>
        <Button
          onClick={onClose}
          variant="contained"
          color="primary"
          style={{
            fontFamily: "'Helvetica Neue', Arial, sans-serif",
          }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CoaDialog;
