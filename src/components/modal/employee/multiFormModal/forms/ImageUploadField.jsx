import React, { useState, useEffect } from "react";
import { Controller } from "react-hook-form";
import {
  TextField,
  FormControl,
  FormHelperText,
  Button,
  Box,
  Typography,
  Avatar,
  IconButton,
} from "@mui/material";
import { CloudUpload, Delete } from "@mui/icons-material";

const ImageUploadField = ({
  control,
  errors,
  mode,
  isFieldDisabled,
  isReadOnly,
  watch,
  setValue,
  initialData,
}) => {
  const [imagePreview, setImagePreview] = useState(null);
  const [fileName, setFileName] = useState(null);
  const [isImageRemoved, setIsImageRemoved] = useState(false);

  const watchedImage = watch ? watch("image") : null;
  const watchedImageFilename = watch ? watch("image_filename") : null;
  const watchedImageDataUrl = watch ? watch("image_data_url") : null;

  useEffect(() => {
    if (mode === "create") {
      if (watchedImage instanceof File) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
          if (setValue) {
            setValue("image_data_url", reader.result, { shouldDirty: true });
          }
        };
        reader.readAsDataURL(watchedImage);
        setFileName(watchedImage.name);
      } else if (
        watchedImageDataUrl &&
        watchedImageDataUrl.startsWith("data:") &&
        !watchedImage
      ) {
        setImagePreview(watchedImageDataUrl);
        setFileName(watchedImageFilename || "uploaded-image");
      } else if (
        watchedImageFilename &&
        !watchedImage &&
        !watchedImageDataUrl
      ) {
        setFileName(watchedImageFilename);
        setImagePreview(null);
      } else if (
        typeof watchedImage === "string" &&
        watchedImage.startsWith("data:")
      ) {
        setImagePreview(watchedImage);
        setFileName(watchedImageFilename || "uploaded-image");
      } else if (
        !watchedImage &&
        !watchedImageFilename &&
        !watchedImageDataUrl
      ) {
        setImagePreview(null);
        setFileName(null);
      }
    } else if (mode === "edit" || mode === "view") {
      if (isImageRemoved) {
        return;
      }

      if (!watchedImage && !watchedImageFilename && !watchedImageDataUrl) {
        setImagePreview(null);
        setFileName(null);
        return;
      }

      if (watchedImage instanceof File) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
          if (setValue) {
            setValue("image_data_url", reader.result, { shouldDirty: true });
          }
        };
        reader.readAsDataURL(watchedImage);
        setFileName(watchedImage.name);
        return;
      }

      if (watchedImageDataUrl && watchedImageDataUrl.startsWith("data:")) {
        setImagePreview(watchedImageDataUrl);
        setFileName(watchedImageFilename || "uploaded-image");
        return;
      }

      if (watchedImageFilename) {
        setFileName(watchedImageFilename);

        const existingImageUrl =
          initialData?.general_info?.image_url ||
          initialData?.image_url ||
          initialData?.image;

        if (existingImageUrl && existingImageUrl.startsWith("http")) {
          setImagePreview(existingImageUrl);
        } else if (existingImageUrl) {
          setImagePreview(
            `${
              process.env.REACT_APP_API_BASE_URL || ""
            }/uploads/employees/${existingImageUrl}`
          );
        } else {
          setImagePreview(null);
        }
        return;
      }

      const existingImageFilename =
        initialData?.general_info?.image_url_filename ||
        initialData?.image_url_filename ||
        initialData?.image_filename;

      if (existingImageFilename && !isImageRemoved) {
        setFileName(existingImageFilename);

        const existingImageUrl =
          initialData?.general_info?.image_url ||
          initialData?.image_url ||
          initialData?.image;

        if (existingImageUrl && existingImageUrl.startsWith("http")) {
          setImagePreview(existingImageUrl);
        } else if (existingImageUrl) {
          setImagePreview(
            `${
              process.env.REACT_APP_API_BASE_URL || ""
            }/uploads/employees/${existingImageUrl}`
          );
        } else {
          setImagePreview(null);
        }
      }
    }
  }, [
    watchedImage,
    watchedImageFilename,
    watchedImageDataUrl,
    initialData,
    mode,
    setValue,
    isImageRemoved,
  ]);

  const handleImageUpload = (event, onChange) => {
    const file = event.target.files[0];
    if (file) {
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
      if (!validTypes.includes(file.type)) {
        alert("Please select a valid image file (JPEG, PNG, or GIF)");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }

      setIsImageRemoved(false);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        if (setValue) {
          setValue("image_data_url", reader.result, { shouldDirty: true });
        }
      };
      reader.readAsDataURL(file);

      setFileName(file.name);
      onChange(file);

      if (setValue) {
        setValue("image_filename", file.name, { shouldDirty: true });
      }

      event.target.value = "";
    }
  };

  const handleRemoveImage = (onChange) => {
    setIsImageRemoved(true);

    setImagePreview(null);
    setFileName(null);
    onChange(null);

    if (setValue) {
      setValue("image_filename", "", { shouldDirty: true });
      setValue("image_data_url", "", { shouldDirty: true });
    }

    const fileInput = document.getElementById("image-upload-input");
    if (fileInput) {
      fileInput.value = "";
    }
  };

  return (
    <Controller
      name="image"
      control={control}
      render={({ field: { onChange, value } }) => {
        const displayImage =
          imagePreview ||
          (typeof value === "string" && value.startsWith("data:")
            ? value
            : null);
        const displayFileName = fileName || watchedImageFilename;
        const hasImage = displayImage || displayFileName;

        return (
          <FormControl
            fullWidth
            variant="outlined"
            error={!!errors.image}
            sx={{
              width: "100%",
              position: "relative",
              "& .MuiFormHelperText-root": {
                position: "absolute",
                bottom: "-20px",
                marginTop: "0px",
              },
            }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                border: errors.image
                  ? "2px dashed #d32f2f"
                  : "2px dashed #e0e0e0",
                borderRadius: 1,
                overflow: "hidden",
                backgroundColor: "#fff",
                minHeight: "56px",
                "&:hover": {
                  borderColor:
                    !isReadOnly && !isFieldDisabled
                      ? errors.image
                        ? "#d32f2f"
                        : "#1976d2"
                      : errors.image
                      ? "#d32f2f"
                      : "#e0e0e0",
                },
              }}>
              {displayImage && (
                <Box sx={{ p: 1 }}>
                  <Avatar
                    src={displayImage}
                    sx={{
                      width: 40,
                      height: 40,
                      border: "1px solid #e0e0e0",
                    }}
                  />
                </Box>
              )}

              <Box
                sx={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  px: 2,
                  py: 1,
                  minHeight: "56px",
                  cursor:
                    !isReadOnly && !isFieldDisabled ? "pointer" : "default",
                }}
                onClick={() => {
                  if (!isReadOnly && !isFieldDisabled) {
                    document.getElementById("image-upload-input")?.click();
                  }
                }}>
                <CloudUpload
                  sx={{
                    color: "#ff4400 !important",
                    fontSize: "1.25rem",
                    flexShrink: 0,
                    fill: "#ff4400 !important",
                  }}
                />

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: "14px",
                      color: "#888888",
                      textOverflow: "ellipsis",
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                      display: "block",
                      lineHeight: 1.5,
                      fontFamily: '"Roboto","Helvetica","Arial",sans-serif',
                      fontWeight: 400,
                    }}
                    dangerouslySetInnerHTML={{
                      __html: `<style>.upload-text-override { color: #888888 !important; }</style><span class="upload-text-override">${
                        displayFileName ||
                        (mode === "create"
                          ? "Click here to Upload Employee Photo"
                          : "No Photo Attached")
                      }</span>`,
                    }}
                  />
                </Box>
                {hasImage && !isReadOnly && (
                  <IconButton
                    size="small"
                    color="error"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleRemoveImage(onChange);
                    }}
                    disabled={isFieldDisabled}
                    sx={{
                      width: 24,
                      height: 24,
                      minWidth: 24,
                      flexShrink: 0,
                      p: 0,
                      "& .MuiSvgIcon-root": {
                        fontSize: "1rem",
                      },
                    }}>
                    <Delete />
                  </IconButton>
                )}
              </Box>
            </Box>

            {!isReadOnly && (
              <input
                accept="image/*"
                style={{ display: "none" }}
                id="image-upload-input"
                type="file"
                onChange={(event) => handleImageUpload(event, onChange)}
                disabled={isFieldDisabled}
              />
            )}

            {errors.image && (
              <FormHelperText>{errors.image.message}</FormHelperText>
            )}
          </FormControl>
        );
      }}
    />
  );
};

ImageUploadField.displayName = "ImageUploadField";

export default ImageUploadField;
