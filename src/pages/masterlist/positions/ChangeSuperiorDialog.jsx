import React, { useState, useMemo, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  IconButton,
  Button,
  Box,
  TextField,
  List,
  ListItemButton,
  Radio,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import { useSnackbar } from "notistack";
import {
  useChangePositionsSuperiorMutation,
  useGetSuperiorOptionsQuery,
} from "../../../features/api/masterlist/positionsApi";

// ---- helpers (tolerant sa different response shapes) ----
const getPositionTitle = (position) =>
  typeof position?.title === "object" && position?.title !== null
    ? position.title.name || position.title.title || position.title.code || "—"
    : position?.title || position?.name || "—";

const getCurrentSuperiorName = (position) => {
  const sup = position?.superior;
  if (!sup) return "—";
  if (typeof sup === "object") {
    return sup.full_name || sup.name || sup.code || "—";
  }
  return sup;
};

// Handles: plain array, { result: [...] }, { result: { data: [...] } }, { data: [...] }
const extractList = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.result)) return data.result;
  if (Array.isArray(data.result?.data)) return data.result.data;
  if (Array.isArray(data.data)) return data.data;
  return [];
};

const NAVY = "rgb(33, 61, 112)";

const ChangeSuperiorDialog = ({
  open,
  onClose,
  selectedPositions = [],
  onSuccess,
}) => {
  const { enqueueSnackbar } = useSnackbar();

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedSuperior, setSelectedSuperior] = useState(null);

  const [changeSuperior, { isLoading: isSaving }] =
    useChangePositionsSuperiorMutation();

  // debounce search (same 500ms as the rest of the app)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // reset state every time the dialog opens
  useEffect(() => {
    if (open) {
      setSearchQuery("");
      setDebouncedSearch("");
      setSelectedSuperior(null);
    }
  }, [open]);

  // GET positions/superior-options -> result: [{ id, full_name, employee_code, position_title, has_user_account }]
  const { data: optionsData, isFetching } = useGetSuperiorOptionsQuery(
    undefined,
    { skip: !open },
  );

  const selectedIds = useMemo(
    () => selectedPositions.map((p) => p.id),
    [selectedPositions],
  );

  // Search by name, ID number (employee_code) or position title
  const candidates = useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase();
    return extractList(optionsData).filter((option) => {
      if (!term) return true;
      const haystack = [
        option.full_name,
        option.employee_code,
        option.position_title,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [optionsData, debouncedSearch]);

  const count = selectedPositions.length;

  const handleSave = async () => {
    if (!selectedSuperior || !count) return;
    try {
      await changeSuperior({
        position_ids: selectedIds,
        superior_id: selectedSuperior.id,
      }).unwrap();

      enqueueSnackbar("Superior updated successfully!", {
        variant: "success",
        autoHideDuration: 2000,
      });
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      const message =
        typeof error?.data?.message === "string"
          ? error.data.message
          : "Action failed. Please try again.";
      enqueueSnackbar(message, { variant: "error", autoHideDuration: 2000 });
    }
  };

  return (
    <Dialog
      open={open}
      onClose={isSaving ? undefined : onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: { borderRadius: "8px" } }}>
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          py: 1.5,
        }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box
            sx={{
              width: 14,
              height: 14,
              borderRadius: "3px",
              backgroundColor: "#f26522",
            }}
          />
          <Typography
            sx={{ fontWeight: 700, fontSize: "15px", color: NAVY }}
            component="span">
            CHANGE SUPERIOR
          </Typography>
        </Box>
        <IconButton onClick={onClose} disabled={isSaving} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ pt: 2 }}>
        <Typography sx={{ fontSize: "12px", color: "text.secondary", mb: 1.5 }}>
          <b>
            {count} position{count === 1 ? "" : "s"}
          </b>{" "}
          selected. The new superior becomes their requestor: they file MRFs for
          them and see moves out of them in Vacated Positions. Approver lists
          don&apos;t change.
        </Typography>

        <Typography sx={{ fontSize: "11px", color: "text.secondary", mb: 0.5 }}>
          New superior
        </Typography>
        <TextField
          autoFocus
          fullWidth
          size="small"
          placeholder="Search name or ID number"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          disabled={isSaving}
          InputProps={{
            startAdornment: (
              <SearchIcon
                sx={{ fontSize: 18, mr: 1, color: "text.secondary" }}
              />
            ),
          }}
        />

        {/* Employee list */}
        <Box
          sx={{
            mt: 1,
            border: "1px solid #ddd",
            borderRadius: "6px",
            maxHeight: 180,
            overflowY: "auto",
          }}>
          {isFetching ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
              <CircularProgress size={22} />
            </Box>
          ) : candidates.length === 0 ? (
            <Typography
              sx={{
                fontSize: "12px",
                color: "text.secondary",
                textAlign: "center",
                py: 3,
              }}>
              {debouncedSearch
                ? `No employees found for "${debouncedSearch}"`
                : "No employees available"}
            </Typography>
          ) : (
            <List disablePadding>
              {candidates.map((option) => {
                const isSelected = selectedSuperior?.id === option.id;
                const noAccount = option.has_user_account === false;
                return (
                  <ListItemButton
                    key={option.id}
                    selected={isSelected}
                    onClick={() => setSelectedSuperior(option)}
                    disabled={isSaving || noAccount}
                    sx={{ py: 0.5, borderBottom: "1px solid #eee" }}>
                    <Radio
                      checked={isSelected}
                      size="small"
                      sx={{ mr: 1, p: 0.5 }}
                    />
                    <Box>
                      <Typography
                        sx={{
                          fontSize: "12px",
                          fontWeight: 700,
                          textTransform: "uppercase",
                        }}>
                        {option.full_name}
                      </Typography>
                      <Typography
                        sx={{ fontSize: "11px", color: "text.secondary" }}>
                        {[option.employee_code, option.position_title]
                          .filter(Boolean)
                          .join(" · ")}
                        {noAccount ? " · No user account" : ""}
                      </Typography>
                    </Box>
                  </ListItemButton>
                );
              })}
            </List>
          )}
        </Box>

        {/* Preview */}
        <Typography
          sx={{
            fontSize: "11px",
            fontWeight: 700,
            color: "text.secondary",
            letterSpacing: "0.5px",
            mt: 2,
            mb: 0.5,
          }}>
          PREVIEW
        </Typography>
        <Box sx={{ maxHeight: 200, overflowY: "auto" }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontSize: "10px", fontWeight: 700 }}>
                  POSITION
                </TableCell>
                <TableCell sx={{ fontSize: "10px", fontWeight: 700 }}>
                  CURRENT SUPERIOR
                </TableCell>
                <TableCell sx={{ fontSize: "10px", fontWeight: 700 }}>
                  NEW SUPERIOR
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {selectedPositions.map((position) => (
                <TableRow key={position.id}>
                  <TableCell sx={{ fontSize: "12px" }}>
                    <b>{position.code}</b> {getPositionTitle(position)}
                  </TableCell>
                  <TableCell
                    sx={{ fontSize: "12px", textTransform: "uppercase" }}>
                    {getCurrentSuperiorName(position)}
                  </TableCell>
                  <TableCell
                    sx={{
                      fontSize: "12px",
                      textTransform: selectedSuperior ? "uppercase" : "none",
                      color: selectedSuperior ? "inherit" : "text.secondary",
                      fontWeight: selectedSuperior ? 700 : 400,
                    }}>
                    {selectedSuperior
                      ? selectedSuperior.full_name
                      : "Pick someone"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 1.5 }}>
        <Button
          onClick={onClose}
          disabled={isSaving}
          variant="outlined"
          sx={{ color: NAVY, borderColor: "#ccc" }}>
          CANCEL
        </Button>
        <Button
          onClick={handleSave}
          disabled={!selectedSuperior || isSaving}
          variant="contained"
          sx={{
            backgroundColor: NAVY,
            "&:hover": { backgroundColor: "rgb(25, 45, 84)" },
          }}>
          {isSaving ? "SAVING..." : "SAVE"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ChangeSuperiorDialog;
