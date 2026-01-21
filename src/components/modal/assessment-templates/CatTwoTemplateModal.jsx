import React, { useEffect, useState, useRef } from "react";
import { useForm, FormProvider } from "react-hook-form";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  IconButton,
  Box,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import {
  Close as CloseIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Assessment as AssessmentIcon,
  EditOff as EditOffIcon,
} from "@mui/icons-material";
import { useSnackbar } from "notistack";
import {
  useCreateCatTwoTemplateMutation,
  useUpdateCatTwoTemplateMutation,
  useGetCatTwoTemplateByIdQuery,
} from "../../../features/api/assessment-template/catTwoTemplateApi";
import CatTwoTemplateFields from "./CatTwoTemplateModalFields";
import * as styles from "./TemplateStyles";

const getInitialValues = () => ({
  name: "",
  type: "CAT2",
  phase: "FINAL",
  description: "",
  position_ids: [],
  rating_scale: [
    {
      label: "Exceeds Expectations",
      value: 3,
      display_order: 1,
    },
    {
      label: "Meets Expectations",
      value: 2,
      display_order: 2,
    },
    {
      label: "Needs Improvement",
      value: 1,
      display_order: 3,
    },
  ],
  sections: [],
});

const formatTemplateData = (template) => {
  if (!template) return getInitialValues();

  let positionIds = [];

  if (Array.isArray(template.positions)) {
    positionIds = template.positions.map((pos) => pos.id);
  } else if (Array.isArray(template.position_ids)) {
    positionIds = template.position_ids.map((pos) =>
      typeof pos === "object" && pos.id ? pos.id : pos
    );
  }

  const sections = Array.isArray(template.sections)
    ? template.sections.map((section, sectionIdx) => ({
        title: section.title || "",
        display_order: section.display_order || sectionIdx + 1,
        items: Array.isArray(section.items)
          ? section.items.map((item, itemIdx) => ({
              text: item.text || "",
              display_order: item.display_order || itemIdx + 1,
              children: Array.isArray(item.children)
                ? item.children.map((child, childIdx) => ({
                    text: child.text || "",
                    display_order: child.display_order || childIdx + 1,
                  }))
                : [],
            }))
          : [],
      }))
    : [];

  return {
    name: template.name || "",
    type: "CAT2",
    phase: "FINAL",
    description: template.description || "",
    position_ids: positionIds,
    rating_scale: template.rating_scale || getInitialValues().rating_scale,
    sections: sections,
  };
};

const CatTwoTemplateModal = ({
  open = false,
  handleClose,
  selectedTemplate = null,
  refetch,
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const [currentMode, setCurrentMode] = useState(
    selectedTemplate ? "view" : "create"
  );
  const [originalMode, setOriginalMode] = useState(currentMode);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [isFormReady, setIsFormReady] = useState(false);

  const prevOpenRef = useRef(open);
  const prevModeRef = useRef(currentMode);

  const methods = useForm({
    defaultValues: getInitialValues(),
    mode: "onChange",
  });

  const { reset, handleSubmit } = methods;

  const templateId = selectedTemplate?.id;

  const { data: templateData, isLoading: isLoadingTemplate } =
    useGetCatTwoTemplateByIdQuery(templateId, {
      skip: !templateId || currentMode === "create",
    });

  const [createTemplate, { isLoading: isCreating }] =
    useCreateCatTwoTemplateMutation();
  const [updateTemplate, { isLoading: isUpdating }] =
    useUpdateCatTwoTemplateMutation();

  useEffect(() => {
    if (!open) {
      setHasInitialized(false);
      setIsFormReady(false);
      prevOpenRef.current = false;
      return;
    }

    if (hasInitialized && prevOpenRef.current === open) return;

    const initializeForm = async () => {
      if (!selectedTemplate) {
        setCurrentMode("create");
        setOriginalMode("create");
        const initialValues = getInitialValues();
        reset(initialValues);
        setHasInitialized(true);
        setIsFormReady(true);
        prevOpenRef.current = true;
        prevModeRef.current = "create";
        return;
      }

      if (selectedTemplate && templateData?.result) {
        setCurrentMode("view");
        setOriginalMode("view");
        const formData = formatTemplateData(templateData.result);
        reset(formData);
        setTimeout(() => {
          setHasInitialized(true);
          setIsFormReady(true);
          prevOpenRef.current = true;
          prevModeRef.current = "view";
        }, 50);
      }
    };

    initializeForm();
  }, [open, selectedTemplate, templateData, hasInitialized, reset]);

  useEffect(() => {
    if (
      open &&
      currentMode === "edit" &&
      originalMode === "view" &&
      templateData?.result &&
      prevModeRef.current !== currentMode
    ) {
      const formData = formatTemplateData(templateData.result);
      reset(formData);
      prevModeRef.current = currentMode;
    }
  }, [currentMode, open, originalMode, templateData, reset]);

  const handleCancelEdit = () => {
    setCurrentMode(originalMode);
    if (templateData?.result) {
      const formData = formatTemplateData(templateData.result);
      reset(formData);
    }
  };

  const onSubmit = async (data) => {
    try {
      if (!data.name?.trim()) {
        enqueueSnackbar("Template name is required", { variant: "error" });
        return;
      }

      if (!data.position_ids || data.position_ids.length === 0) {
        enqueueSnackbar("Please select at least one position", {
          variant: "error",
        });
        return;
      }

      if (!data.sections || data.sections.length === 0) {
        enqueueSnackbar("Please add at least one section", {
          variant: "error",
        });
        return;
      }

      const payload = {
        name: data.name,
        type: "CAT2",
        phase: "FINAL",
        description: data.description,
        position_ids: data.position_ids,
        rating_scale: data.rating_scale,
        sections: data.sections,
      };

      if (currentMode === "create") {
        await createTemplate(payload).unwrap();
        enqueueSnackbar("Template created successfully!", {
          variant: "success",
        });
      } else if (currentMode === "edit") {
        await updateTemplate({ id: templateId, ...payload }).unwrap();
        enqueueSnackbar("Template updated successfully!", {
          variant: "success",
        });
      }

      refetch();
      handleModalClose();
    } catch (error) {
      enqueueSnackbar(
        error?.data?.message || "An error occurred. Please try again.",
        { variant: "error" }
      );
    }
  };

  const handleModalClose = () => {
    reset(getInitialValues());
    setCurrentMode(selectedTemplate ? "view" : "create");
    setOriginalMode(selectedTemplate ? "view" : "create");
    setHasInitialized(false);
    setIsFormReady(false);
    prevOpenRef.current = false;
    handleClose();
  };

  const getModalTitle = () => {
    const titles = {
      create: "CREATE CAT II TEMPLATE",
      view: "VIEW CAT II TEMPLATE",
      edit: "EDIT CAT II TEMPLATE",
    };
    return titles[currentMode] || "CAT II Template";
  };

  const shouldEnableEditButton = () => {
    return !selectedTemplate?.deleted_at;
  };

  const isReadOnly = currentMode === "view";
  const isCreate = currentMode === "create";
  const isViewMode = currentMode === "view";
  const isEditMode = currentMode === "edit";
  const isProcessing = isCreating || isUpdating || isLoadingTemplate;

  const formKey = `cat-two-template-${
    open ? "open" : "closed"
  }-${currentMode}-${hasInitialized}`;

  return (
    <FormProvider {...methods}>
      <Dialog
        open={open}
        onClose={handleModalClose}
        maxWidth={false}
        PaperProps={{ sx: styles.dialogPaperStyles }}>
        <DialogTitle sx={styles.dialogTitleStyles}>
          <Box sx={styles.titleBoxStyles}>
            <AssessmentIcon sx={styles.assessmentIconStyles} />
            <Typography
              variant="h6"
              component="div"
              sx={styles.titleTypographyStyles}>
              {getModalTitle()}
            </Typography>
            {isViewMode && (
              <Tooltip title="EDIT TEMPLATE" arrow placement="top">
                <span>
                  <IconButton
                    onClick={() => setCurrentMode("edit")}
                    disabled={!shouldEnableEditButton() || isProcessing}
                    size="small"
                    sx={styles.editIconButtonStyles}>
                    <EditIcon
                      sx={styles.editIconStyles(
                        !shouldEnableEditButton() || isProcessing
                      )}
                    />
                  </IconButton>
                </span>
              </Tooltip>
            )}
            {isEditMode && originalMode === "view" && (
              <Tooltip title="CANCEL EDIT">
                <span>
                  <IconButton
                    onClick={handleCancelEdit}
                    disabled={isProcessing}
                    size="small"
                    sx={styles.cancelEditIconButtonStyles}>
                    <EditOffIcon sx={styles.editOffIconStyles} />
                  </IconButton>
                </span>
              </Tooltip>
            )}
          </Box>
          <IconButton
            onClick={handleModalClose}
            sx={styles.closeIconButtonStyles}>
            <CloseIcon sx={styles.closeIconStyles} />
          </IconButton>
        </DialogTitle>

        <form onSubmit={handleSubmit(onSubmit)} key={formKey}>
          <DialogContent sx={styles.dialogContentStyles}>
            {isFormReady && !isLoadingTemplate ? (
              <CatTwoTemplateFields
                key={formKey}
                isCreate={isCreate}
                isReadOnly={isReadOnly}
                currentMode={currentMode}
              />
            ) : (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  minHeight: "400px",
                }}>
                <CircularProgress />
              </Box>
            )}
          </DialogContent>

          <DialogActions sx={styles.dialogActionsStyles}>
            {!isReadOnly && (
              <Button
                type="submit"
                variant="contained"
                disabled={isProcessing || !isFormReady}
                startIcon={
                  isProcessing ? (
                    <CircularProgress size={16} />
                  ) : currentMode === "create" ? (
                    <AddIcon />
                  ) : (
                    <EditIcon />
                  )
                }
                sx={styles.createButtonStyles}>
                {isProcessing
                  ? "Saving..."
                  : currentMode === "create"
                  ? "CREATE"
                  : "UPDATE"}
              </Button>
            )}
          </DialogActions>
        </form>
      </Dialog>
    </FormProvider>
  );
};

export default CatTwoTemplateModal;
