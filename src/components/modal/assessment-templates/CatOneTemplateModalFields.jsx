import React, { useState, useRef } from "react";
import { useFormContext, useFieldArray, Controller } from "react-hook-form";
import {
  Typography,
  IconButton,
  Box,
  CircularProgress,
  TextField,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Button,
  Autocomplete,
  Chip,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  DragIndicator as DragIndicatorIcon,
} from "@mui/icons-material";
import { useGetAllPositionsQuery } from "../../../features/api/masterlist/positionsApi";
import * as styles from "./TemplateStyles";

const CatOneTemplateFields = ({ isReadOnly, isCreate }) => {
  const {
    control,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

  const [expandedSections, setExpandedSections] = useState({});
  const [positionFieldFocused, setPositionFieldFocused] = useState(false);
  const dragItem = useRef(null);
  const dragOverItem = useRef(null);

  const positionIds = watch("position_ids");
  const hasPositionIds = positionIds && positionIds.length > 0;

  const { data: positionsData, isLoading: isLoadingPositions } =
    useGetAllPositionsQuery(undefined, {
      skip: !positionFieldFocused && !hasPositionIds,
    });
  const positions = positionsData?.result || [];

  const {
    fields: sectionFields,
    append: appendSection,
    remove: removeSection,
  } = useFieldArray({
    control,
    name: "sections",
  });

  const sections = watch("sections") || [];

  const addSection = () => {
    const newIndex = sectionFields.length;
    appendSection({
      title: "",
      display_order: newIndex + 1,
      items: [
        {
          text: "",
          display_order: 1,
          children: [],
        },
      ],
    });
    setExpandedSections((prev) => ({ ...prev, [newIndex]: true }));
  };

  const addItem = (sectionIndex) => {
    const currentSections = [...sections];
    const currentItems = currentSections[sectionIndex]?.items || [];

    currentSections[sectionIndex] = {
      ...currentSections[sectionIndex],
      items: [
        ...currentItems,
        {
          text: "",
          display_order: currentItems.length + 1,
          children: [],
        },
      ],
    };

    setValue("sections", currentSections, { shouldValidate: false });
  };

  const addSubItem = (sectionIndex, itemIndex) => {
    const currentSections = [...sections];
    const currentChildren =
      currentSections[sectionIndex]?.items[itemIndex]?.children || [];

    currentSections[sectionIndex].items[itemIndex] = {
      ...currentSections[sectionIndex].items[itemIndex],
      children: [
        ...currentChildren,
        {
          text: "",
          display_order: currentChildren.length + 1,
        },
      ],
    };

    setValue("sections", currentSections, { shouldValidate: false });
  };

  const removeItem = (sectionIndex, itemIndex) => {
    const currentSections = [...sections];
    currentSections[sectionIndex].items.splice(itemIndex, 1);
    currentSections[sectionIndex].items.forEach((item, idx) => {
      item.display_order = idx + 1;
    });

    setValue("sections", currentSections, { shouldValidate: false });
  };

  const removeChildItem = (sectionIndex, itemIndex, childIndex) => {
    const currentSections = [...sections];
    currentSections[sectionIndex].items[itemIndex].children.splice(
      childIndex,
      1
    );
    currentSections[sectionIndex].items[itemIndex].children.forEach(
      (child, idx) => {
        child.display_order = idx + 1;
      }
    );

    setValue("sections", currentSections, { shouldValidate: false });
  };

  const handleItemDragStart = (sectionIndex, itemIndex) => {
    dragItem.current = { sectionIndex, itemIndex, type: "item" };
  };

  const handleItemDragEnter = (sectionIndex, itemIndex) => {
    dragOverItem.current = { sectionIndex, itemIndex, type: "item" };
  };

  const handleItemDrop = () => {
    if (!dragItem.current || !dragOverItem.current) return;
    if (
      dragItem.current.type !== "item" ||
      dragOverItem.current.type !== "item"
    )
      return;
    if (dragItem.current.sectionIndex !== dragOverItem.current.sectionIndex)
      return;

    const sectionIndex = dragItem.current.sectionIndex;
    const draggedItemIndex = dragItem.current.itemIndex;
    const targetItemIndex = dragOverItem.current.itemIndex;

    if (draggedItemIndex === targetItemIndex) return;

    const currentSections = [...sections];
    const items = [...currentSections[sectionIndex].items];
    const [draggedItem] = items.splice(draggedItemIndex, 1);
    items.splice(targetItemIndex, 0, draggedItem);

    items.forEach((item, idx) => {
      item.display_order = idx + 1;
    });

    currentSections[sectionIndex].items = items;
    setValue("sections", currentSections, { shouldValidate: false });

    dragItem.current = null;
    dragOverItem.current = null;
  };

  const handleChildDragStart = (sectionIndex, itemIndex, childIndex) => {
    dragItem.current = { sectionIndex, itemIndex, childIndex, type: "child" };
  };

  const handleChildDragEnter = (sectionIndex, itemIndex, childIndex) => {
    dragOverItem.current = {
      sectionIndex,
      itemIndex,
      childIndex,
      type: "child",
    };
  };

  const handleChildDrop = () => {
    if (!dragItem.current || !dragOverItem.current) return;
    if (
      dragItem.current.type !== "child" ||
      dragOverItem.current.type !== "child"
    )
      return;
    if (dragItem.current.sectionIndex !== dragOverItem.current.sectionIndex)
      return;
    if (dragItem.current.itemIndex !== dragOverItem.current.itemIndex) return;

    const sectionIndex = dragItem.current.sectionIndex;
    const itemIndex = dragItem.current.itemIndex;
    const draggedChildIndex = dragItem.current.childIndex;
    const targetChildIndex = dragOverItem.current.childIndex;

    if (draggedChildIndex === targetChildIndex) return;

    const currentSections = [...sections];
    const children = [
      ...currentSections[sectionIndex].items[itemIndex].children,
    ];
    const [draggedChild] = children.splice(draggedChildIndex, 1);
    children.splice(targetChildIndex, 0, draggedChild);

    children.forEach((child, idx) => {
      child.display_order = idx + 1;
    });

    currentSections[sectionIndex].items[itemIndex].children = children;
    setValue("sections", currentSections, { shouldValidate: false });

    dragItem.current = null;
    dragOverItem.current = null;
  };

  const handleAccordionChange = (sectionIndex) => (event, isExpanded) => {
    setExpandedSections((prev) => ({ ...prev, [sectionIndex]: isExpanded }));
  };

  const StyledTextField = ({ label, required = false, ...props }) => (
    <TextField
      {...props}
      label={
        required ? (
          <span>
            {label}{" "}
            <span style={{ color: isReadOnly ? "gray" : "red" }}>*</span>
          </span>
        ) : (
          label
        )
      }
    />
  );

  return (
    <Box sx={styles.fieldsContainer}>
      <Paper sx={styles.formPaper}>
        <Grid container spacing={1.2}>
          <Grid item xs={12} md={6}>
            <Controller
              name="name"
              control={control}
              rules={{ required: "Template name is required" }}
              render={({ field }) => (
                <StyledTextField
                  {...field}
                  label="Template Name"
                  placeholder=""
                  fullWidth
                  required
                  disabled={isReadOnly}
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  sx={styles.textField(isReadOnly)}
                  InputProps={{
                    sx: { height: "56px" },
                  }}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Controller
              name="position_ids"
              control={control}
              rules={{ required: "Position is required" }}
              render={({ field: { onChange, value } }) => {
                const selectedPositions = Array.isArray(value)
                  ? value
                      .map((v) =>
                        typeof v === "object"
                          ? v
                          : positions.find((p) => p.id === v)
                      )
                      .filter(Boolean)
                  : [];

                return (
                  <Autocomplete
                    multiple
                    options={positions}
                    value={selectedPositions}
                    onChange={(event, newValue) => {
                      if (!isReadOnly) {
                        const ids = newValue.map((item) => item.id);
                        onChange(ids);
                      }
                    }}
                    onOpen={() => setPositionFieldFocused(true)}
                    getOptionLabel={(option) => option.title?.name || ""}
                    isOptionEqualToValue={(option, value) =>
                      option.id === value.id
                    }
                    disabled={isReadOnly}
                    loading={isLoadingPositions}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={
                          <span>
                            Position{" "}
                            <span
                              style={{ color: isReadOnly ? "gray" : "red" }}>
                              *
                            </span>
                          </span>
                        }
                        error={!!errors.position_ids}
                        helperText={errors.position_ids?.message}
                        sx={styles.textField(isReadOnly)}
                        InputProps={{
                          ...params.InputProps,
                          sx: { minHeight: "56px" },
                          endAdornment: (
                            <>
                              {isLoadingPositions ? (
                                <CircularProgress color="inherit" size={20} />
                              ) : null}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip
                          key={option.id}
                          label={option.title?.name}
                          {...getTagProps({ index })}
                          size="small"
                          sx={{
                            backgroundColor: "rgb(33, 61, 112)",
                            color: "white",
                            "& .MuiChip-deleteIcon": {
                              color: "rgba(255, 255, 255, 0.7)",
                              "&:hover": {
                                color: "white",
                              },
                            },
                          }}
                        />
                      ))
                    }
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: isReadOnly ? "#f5f5f5" : "white",
                        padding: "4px 9px",
                      },
                    }}
                  />
                );
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Description"
                  placeholder=""
                  fullWidth
                  multiline
                  rows={3}
                  disabled={isReadOnly}
                  sx={styles.descriptionField(isReadOnly)}
                />
              )}
            />
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={styles.formPaper}>
        <Box sx={styles.sectionHeaderBox}>
          <Typography variant="h6" sx={styles.sectionTitle}>
            Assessment Sections
          </Typography>
          {!isReadOnly && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={addSection}
              size="small"
              sx={styles.addButton}>
              Add Section
            </Button>
          )}
        </Box>

        {sectionFields.length === 0 && (
          <Typography sx={styles.emptyStateText}>
            No sections added yet. Click "Add Section" to get started.
          </Typography>
        )}

        {sectionFields.map((section, sectionIndex) => (
          <Accordion
            key={section.id}
            sx={styles.accordion}
            expanded={expandedSections[sectionIndex] || false}
            onChange={handleAccordionChange(sectionIndex)}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{
                "&:hover": {
                  backgroundColor: "rgba(0, 0, 0, 0.02)",
                },
              }}>
              <Box sx={styles.accordionSummaryBox}>
                <Typography sx={styles.accordionTitle}>
                  {sections[sectionIndex]?.title ||
                    `Section ${sectionIndex + 1}`}
                </Typography>
                {!isReadOnly && (
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeSection(sectionIndex);
                    }}
                    sx={styles.deleteIconButton}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                )}
              </Box>
            </AccordionSummary>

            <AccordionDetails>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Controller
                  name={`sections.${sectionIndex}.title`}
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Section Title"
                      placeholder="e.g., PART A. TECHNICAL COMPETENCIES, 60%"
                      fullWidth
                      disabled={isReadOnly}
                      sx={styles.textField(isReadOnly)}
                    />
                  )}
                />

                <Box sx={{ mt: 2 }}>
                  <Box sx={styles.itemsHeaderBox}>
                    <Typography variant="subtitle2" sx={styles.itemsTitle}>
                      Items
                    </Typography>
                    {!isReadOnly && (
                      <Button
                        variant="text"
                        startIcon={<AddIcon />}
                        onClick={() => addItem(sectionIndex)}
                        size="small"
                        sx={styles.addItemButton}>
                        Add Item
                      </Button>
                    )}
                  </Box>

                  {sections[sectionIndex]?.items?.map((item, itemIndex) => (
                    <Box
                      key={itemIndex}
                      sx={{ mb: 2 }}
                      draggable={!isReadOnly}
                      onDragStart={() =>
                        handleItemDragStart(sectionIndex, itemIndex)
                      }
                      onDragEnter={() =>
                        handleItemDragEnter(sectionIndex, itemIndex)
                      }
                      onDragEnd={handleItemDrop}
                      onDragOver={(e) => e.preventDefault()}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 1,
                          mb: 1,
                        }}>
                        {!isReadOnly && (
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              cursor: "move",
                              mt: 1,
                            }}>
                            <DragIndicatorIcon
                              sx={{
                                color: "rgba(0, 0, 0, 0.38)",
                                fontSize: "1.2rem",
                              }}
                            />
                          </Box>
                        )}
                        <Controller
                          name={`sections.${sectionIndex}.items.${itemIndex}.text`}
                          control={control}
                          defaultValue=""
                          render={({ field }) => (
                            <TextField
                              {...field}
                              placeholder="Enter item text"
                              fullWidth
                              disabled={isReadOnly}
                              size="small"
                              sx={styles.textField(isReadOnly)}
                            />
                          )}
                        />
                        {!isReadOnly && (
                          <IconButton
                            size="small"
                            onClick={() => removeItem(sectionIndex, itemIndex)}
                            sx={styles.deleteIconButton}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Box>

                      <Box sx={{ ml: 4 }}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 1,
                          }}>
                          <Typography
                            variant="caption"
                            sx={styles.childrenTitle}>
                            Sub-items
                          </Typography>
                          {!isReadOnly && (
                            <Button
                              variant="text"
                              startIcon={<AddIcon />}
                              onClick={() =>
                                addSubItem(sectionIndex, itemIndex)
                              }
                              size="small"
                              sx={styles.addChildButton}>
                              Add Sub-item
                            </Button>
                          )}
                        </Box>

                        {item.children?.map((child, childIndex) => (
                          <Box
                            key={childIndex}
                            sx={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: 1,
                              mb: 1,
                            }}>
                            {!isReadOnly && (
                              <Box
                                draggable
                                onDragStart={(e) => {
                                  e.stopPropagation();
                                  handleChildDragStart(
                                    sectionIndex,
                                    itemIndex,
                                    childIndex
                                  );
                                }}
                                onDragEnter={(e) => {
                                  e.stopPropagation();
                                  handleChildDragEnter(
                                    sectionIndex,
                                    itemIndex,
                                    childIndex
                                  );
                                }}
                                onDragEnd={(e) => {
                                  e.stopPropagation();
                                  handleChildDrop();
                                }}
                                onDragOver={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                }}
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  cursor: "move",
                                  mt: 1,
                                }}>
                                <DragIndicatorIcon
                                  sx={{
                                    color: "rgba(0, 0, 0, 0.38)",
                                    fontSize: "1.2rem",
                                  }}
                                />
                              </Box>
                            )}
                            <Controller
                              name={`sections.${sectionIndex}.items.${itemIndex}.children.${childIndex}.text`}
                              control={control}
                              defaultValue=""
                              render={({ field }) => (
                                <TextField
                                  {...field}
                                  placeholder="Enter sub-item text"
                                  fullWidth
                                  disabled={isReadOnly}
                                  size="small"
                                  sx={styles.textField(isReadOnly)}
                                />
                              )}
                            />
                            {!isReadOnly && (
                              <IconButton
                                size="small"
                                onClick={() =>
                                  removeChildItem(
                                    sectionIndex,
                                    itemIndex,
                                    childIndex
                                  )
                                }
                                sx={styles.deleteIconButton}>
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            )}
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            </AccordionDetails>
          </Accordion>
        ))}
      </Paper>
    </Box>
  );
};

export default CatOneTemplateFields;
