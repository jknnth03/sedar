import React, { useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Divider,
  Skeleton,
} from "@mui/material";
import GroupIcon from "@mui/icons-material/Group";
import { useGetSingleApprovalFlowQuery } from "../../features/api/approvalsetting/approvalFlowApi";

const toDisplayString = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (typeof value === "object") {
    return value.name || value.title || value.position_name || value.code || "";
  }
  return "";
};

const normalizeApprover = (approver, index) => {
  if (typeof approver === "string") {
    return { key: `${approver}-${index}`, name: approver, subtitle: "" };
  }

  const name =
    toDisplayString(approver?.full_name) ||
    toDisplayString(approver?.name) ||
    toDisplayString(approver?.title) ||
    "-";

  const subtitle =
    toDisplayString(approver?.position) ||
    toDisplayString(approver?.title) ||
    toDisplayString(approver?.role) ||
    toDisplayString(approver?.code) ||
    "";

  return {
    key: approver?.id ?? `approver-${index}`,
    name,
    subtitle,
  };
};

const ApproversDialog = ({ open, onClose, position }) => {
  const { data, isFetching, error } = useGetSingleApprovalFlowQuery(
    position?.id,
    {
      skip: !open || !position?.id,
      refetchOnMountOrArgChange: true,
    },
  );

  const detail = data?.result || position;

  const approvers = useMemo(
    () =>
      Array.isArray(detail?.approvers)
        ? detail.approvers.map(normalizeApprover)
        : [],
    [detail],
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3 },
      }}>
      <DialogTitle>
        <Box display="flex" justifyContent="center" alignItems="center" mb={1}>
          <GroupIcon sx={{ fontSize: 60, color: "#55b8ff" }} />
        </Box>
        <Typography
          variant="h6"
          fontWeight="bold"
          textAlign="center"
          color="rgb(33, 61, 112)">
          Approvers
        </Typography>
        {detail && (
          <Typography
            variant="body2"
            color="text.secondary"
            textAlign="center"
            sx={{ mt: 0.5 }}>
            {detail.code
              ? `${detail.code} - ${toDisplayString(detail.title) || toDisplayString(detail.name)}`
              : toDisplayString(detail.title) || toDisplayString(detail.name)}
          </Typography>
        )}
        {detail?.charging && (
          <Typography
            variant="caption"
            color="text.secondary"
            display="block"
            textAlign="center">
            {toDisplayString(detail.charging)}
          </Typography>
        )}
      </DialogTitle>

      <DialogContent dividers>
        {isFetching ? (
          <Box>
            {[...Array(3)].map((_, index) => (
              <Box
                key={index}
                display="flex"
                alignItems="center"
                gap={2}
                sx={{ py: 1 }}>
                <Skeleton
                  animation="wave"
                  variant="circular"
                  width={32}
                  height={32}
                />
                <Skeleton animation="wave" height={24} sx={{ flex: 1 }} />
              </Box>
            ))}
          </Box>
        ) : error ? (
          <Typography
            variant="body2"
            color="error"
            textAlign="center"
            sx={{ py: 2 }}>
            {error?.data?.message || "Failed to load approvers."}
          </Typography>
        ) : approvers.length > 0 ? (
          <List disablePadding>
            {approvers.map((approver, index) => (
              <React.Fragment key={approver.key}>
                <ListItem disableGutters>
                  <ListItemAvatar>
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        fontSize: "14px",
                        fontWeight: 600,
                        backgroundColor: "rgb(33, 61, 112)",
                      }}>
                      {index + 1}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={approver.name}
                    secondary={approver.subtitle || null}
                    primaryTypographyProps={{ fontWeight: 600 }}
                  />
                </ListItem>
                {index < approvers.length - 1 && <Divider component="li" />}
              </React.Fragment>
            ))}
          </List>
        ) : (
          <Typography
            variant="body2"
            color="text.secondary"
            textAlign="center"
            sx={{ py: 2 }}>
            No approvers set for this position.
          </Typography>
        )}
      </DialogContent>

      <DialogActions>
        <Box display="flex" justifyContent="center" width="100%" mb={1}>
          <Button
            onClick={onClose}
            variant="contained"
            sx={{
              backgroundColor: "rgb(33, 61, 112)",
              "&:hover": {
                backgroundColor: "rgb(25, 45, 84)",
              },
            }}>
            Close
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default ApproversDialog;
