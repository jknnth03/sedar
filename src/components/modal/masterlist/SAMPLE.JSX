import { DialogTitle } from "@mui/material";
import React from "react";

function SAMPLE() {
  return <div>SAMPLE</div>;
}

<DialogTitle className="dialog_title">
  <Box className="dialog_title_text"></Box>
</DialogTitle>;
<DialogActions sx={{ px: 3, pb: 3 }}>
  <Button
    variant="contained"
    color="inherit"
    className="cancel_button"
    onClick={handleClose}
    size="medium"
    disabled={adding || updating}>
    <>
      {CONSTANT.BUTTONS.CANCEL.icon}
      {CONSTANT.BUTTONS.CANCEL.label}
    </>
  </Button>
  <Button
    onClick={handleSubmit}
    variant="contained"
    size="medium"
    className="add_button"
    disabled={adding || updating}>
    {adding || updating ? (
      "Saving..."
    ) : (
      <>
        {selectedJoblevel
          ? CONSTANT.BUTTONS.ADD.icon2
          : CONSTANT.BUTTONS.ADD.icon1}
        {selectedJoblevel
          ? CONSTANT.BUTTONS.ADD.label2
          : CONSTANT.BUTTONS.ADD.label1}
      </>
    )}
  </Button>
</DialogActions>;

import useDebounce from "../../hooks/useDebounce";
const debounceValue = useDebounce(searchQuery, 500);

const { data, isLoading, isFetching, refetch } = useGetShowUserQuery({
  searchQuery: debounceValue,
});

export default SAMPLE;
