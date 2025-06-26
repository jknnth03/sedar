import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
} from "react";
import {
  Box,
  Alert,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
  InputAdornment,
} from "@mui/material";
import {
  Phone as PhoneIcon,
  Email as EmailIcon,
  ContactPhone as ContactIcon,
} from "@mui/icons-material";
import { useSnackbar } from "notistack";

let idCounter = 0;
const generateUniqueId = (prefix = "contact") => {
  idCounter++;
  return `${prefix}_${Date.now()}_${idCounter}_${Math.random()
    .toString(36)
    .substr(2, 9)}`;
};

const ContactForm = React.forwardRef(
  (
    {
      onSubmit,
      selectedContacts = [],
      showArchived,
      isLoading = false,
      employeeId,
      onValidationChange,
      employeeData,
    },
    ref
  ) => {
    const { enqueueSnackbar } = useSnackbar();
    const [contactLines, setContactLines] = useState(() => [
      {
        id: generateUniqueId("mobile"),
        index: 0,
        contact_type: "MOBILE NUMBER",
        contact_details: "",
        contact_remarks: "",
      },
      {
        id: generateUniqueId("email"),
        index: 1,
        contact_type: "EMAIL ADDRESS",
        contact_details: "",
        contact_remarks: "",
      },
    ]);
    const [errors, setErrors] = useState({});
    const [errorMessage, setErrorMessage] = useState(null);
    const hasBeenInitializedWithData = useRef(false);
    const userHasMadeChanges = useRef(false);
    const lastProcessedSelectedContacts = useRef(null);

    const contactTypeOptions = [
      { value: "MOBILE NUMBER", label: "Mobile Number" },
      { value: "EMAIL ADDRESS", label: "Email Address" },
    ];

    const getEmployeeContactByType = useCallback(
      (contactType) => {
        if (!employeeData?.contacts || !Array.isArray(employeeData.contacts)) {
          return null;
        }
        return employeeData.contacts.find(
          (contact) => contact.contact_type === contactType
        );
      },
      [employeeData]
    );

    const formatPhoneNumber = useCallback((value) => {
      const digits = value.replace(/\D/g, "");
      const limited = digits.slice(0, 10);
      if (limited.length <= 3) return limited;
      if (limited.length <= 6)
        return `${limited.slice(0, 3)}-${limited.slice(3)}`;
      return `${limited.slice(0, 3)}-${limited.slice(3, 6)}-${limited.slice(
        6
      )}`;
    }, []);

    const getBackendFormat = useCallback((formattedValue) => {
      const digits = formattedValue.replace(/\D/g, "");
      return digits.length > 0 ? `+63${digits}` : "";
    }, []);

    const hasValidSelectedContactsData = useCallback((contacts) => {
      return (
        Array.isArray(contacts) &&
        contacts.length > 0 &&
        contacts.some(
          (contact) =>
            contact &&
            (contact.contact_type ||
              contact.contact_details ||
              contact.contact_remarks)
        )
      );
    }, []);

    const hasUserData = useMemo(() => {
      return contactLines.some(
        (line) => line.contact_details?.trim() || line.contact_remarks?.trim()
      );
    }, [contactLines]);

    const getSelectedContactsKey = useCallback((contacts) => {
      if (!Array.isArray(contacts) || contacts.length === 0) return "empty";
      return contacts
        .map(
          (c) =>
            `${c?.contact_type || ""}-${c?.contact_details || ""}-${
              c?.contact_remarks || ""
            }`
        )
        .join("|");
    }, []);

    useEffect(() => {
      const currentKey = getSelectedContactsKey(selectedContacts);
      const lastKey = getSelectedContactsKey(
        lastProcessedSelectedContacts.current
      );

      if (
        hasValidSelectedContactsData(selectedContacts) &&
        (!hasBeenInitializedWithData.current ||
          (currentKey !== lastKey &&
            (!userHasMadeChanges.current || !hasUserData)))
      ) {
        const newContactLines = [
          {
            id: generateUniqueId("mobile"),
            index: 0,
            contact_type: "MOBILE NUMBER",
            contact_details: "",
            contact_remarks: "",
          },
          {
            id: generateUniqueId("email"),
            index: 1,
            contact_type: "EMAIL ADDRESS",
            contact_details: "",
            contact_remarks: "",
          },
        ];

        selectedContacts.forEach((contact) => {
          if (contact?.contact_type === "MOBILE NUMBER") {
            let displayDetails = contact?.contact_details || "";
            if (displayDetails.startsWith("+63")) {
              displayDetails = displayDetails.substring(3);
              displayDetails = formatPhoneNumber(displayDetails);
            }
            newContactLines[0].contact_details = displayDetails;
            newContactLines[0].contact_remarks = contact?.contact_remarks || "";
          } else if (contact?.contact_type === "EMAIL ADDRESS") {
            newContactLines[1].contact_details = contact?.contact_details || "";
            newContactLines[1].contact_remarks = contact?.contact_remarks || "";
          }
        });

        setContactLines(newContactLines);
        setErrorMessage(null);
        setErrors({});
        hasBeenInitializedWithData.current = true;
        lastProcessedSelectedContacts.current = [...selectedContacts];
        userHasMadeChanges.current = false;
      }
    }, [
      selectedContacts,
      formatPhoneNumber,
      hasValidSelectedContactsData,
      getSelectedContactsKey,
      hasUserData,
    ]);

    const validateContactLine = useCallback((line) => {
      if (!line.contact_details?.trim()) return false;

      if (line.contact_type === "EMAIL ADDRESS") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(line.contact_details)) return false;
      }
      if (line.contact_type === "MOBILE NUMBER") {
        const digits = line.contact_details.replace(/\D/g, "");
        if (digits.length !== 10) return false;
      }
      return true;
    }, []);

    const isFormValid = useMemo(() => {
      return contactLines.every(validateContactLine);
    }, [contactLines, validateContactLine]);

    useEffect(() => {
      if (onValidationChange) onValidationChange(isFormValid);
    }, [isFormValid, onValidationChange]);

    const handleChange = useCallback(
      (lineId, field, value) => {
        const safeLineId = String(lineId);
        userHasMadeChanges.current = true;

        setContactLines((prevLines) => {
          return prevLines.map((line) => {
            if (String(line.id) === safeLineId) {
              let formattedValue = value;

              if (
                field === "contact_details" &&
                line.contact_type === "MOBILE NUMBER"
              ) {
                formattedValue = formatPhoneNumber(value);
              }

              return { ...line, [field]: formattedValue };
            }
            return line;
          });
        });

        const errorKey = `${safeLineId}_${field}`;
        setErrors((prev) => {
          if (prev[errorKey]) {
            const newErrors = { ...prev };
            delete newErrors[errorKey];
            return newErrors;
          }
          return prev;
        });

        if (errorMessage) setErrorMessage(null);
      },
      [formatPhoneNumber, errorMessage]
    );

    const validateForm = useCallback(() => {
      const newErrors = {};
      let hasRequiredFieldErrors = false;

      contactLines.forEach((line) => {
        const linePrefix = `${String(line.id)}_`;

        if (!line.contact_details?.trim()) {
          newErrors[`${linePrefix}contact_details`] = "This field is required";
          hasRequiredFieldErrors = true;
        } else {
          if (line.contact_type === "EMAIL ADDRESS") {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(line.contact_details)) {
              newErrors[`${linePrefix}contact_details`] =
                "Please enter a valid email address";
            }
          } else if (line.contact_type === "MOBILE NUMBER") {
            const digits = line.contact_details.replace(/\D/g, "");
            if (digits.length !== 10) {
              newErrors[`${linePrefix}contact_details`] =
                "Please enter a valid 10-digit mobile number";
            }
          }
        }
      });

      setErrors(newErrors);

      if (Object.keys(newErrors).length > 0) {
        if (hasRequiredFieldErrors) {
          setErrorMessage("Please fill in all required contact information.");
        } else {
          setErrorMessage("Please fix the errors in the contact information.");
        }
        return false;
      }

      return true;
    }, [contactLines]);

    const getContactIcon = useCallback((contactType) => {
      switch (contactType) {
        case "MOBILE NUMBER":
          return <PhoneIcon />;
        case "EMAIL ADDRESS":
          return <EmailIcon />;
        default:
          return <ContactIcon />;
      }
    }, []);

    React.useImperativeHandle(
      ref,
      () => ({
        validateAndGetData: () => {
          if (validateForm()) {
            const formData = contactLines
              .filter((line) => line.contact_details?.trim())
              .map((line) => {
                const lineData = { ...line };
                delete lineData.id;
                if (
                  line.contact_type === "MOBILE NUMBER" &&
                  line.contact_details
                ) {
                  lineData.contact_details = getBackendFormat(
                    line.contact_details
                  );
                }
                return lineData;
              });
            return formData;
          }
          return null;
        },
        isFormValid: () => isFormValid,
        getFormData: () => {
          const formData = contactLines
            .filter((line) => line.contact_details?.trim())
            .map((line) => {
              const lineData = { ...line };
              delete lineData.id;
              if (
                line.contact_type === "MOBILE NUMBER" &&
                line.contact_details
              ) {
                lineData.contact_details = getBackendFormat(
                  line.contact_details
                );
              }
              return lineData;
            });
          return formData;
        },
        setFormData: (data) => {
          if (Array.isArray(data)) {
            const newContactLines = [
              {
                id: generateUniqueId("mobile"),
                index: 0,
                contact_type: "MOBILE NUMBER",
                contact_details: "",
                contact_remarks: "",
              },
              {
                id: generateUniqueId("email"),
                index: 1,
                contact_type: "EMAIL ADDRESS",
                contact_details: "",
                contact_remarks: "",
              },
            ];

            data.forEach((item) => {
              if (item?.contact_type === "MOBILE NUMBER") {
                let displayDetails = item?.contact_details || "";
                if (displayDetails.startsWith("+63")) {
                  displayDetails = displayDetails.substring(3);
                  displayDetails = formatPhoneNumber(displayDetails);
                }
                newContactLines[0].contact_details = displayDetails;
                newContactLines[0].contact_remarks =
                  item?.contact_remarks || "";
              } else if (item?.contact_type === "EMAIL ADDRESS") {
                newContactLines[1].contact_details =
                  item?.contact_details || "";
                newContactLines[1].contact_remarks =
                  item?.contact_remarks || "";
              }
            });

            setContactLines(newContactLines);
            hasBeenInitializedWithData.current = true;
            lastProcessedSelectedContacts.current = [...data];
            userHasMadeChanges.current = false;
          }
        },
        resetForm: () => {
          setContactLines([
            {
              id: generateUniqueId("mobile"),
              index: 0,
              contact_type: "MOBILE NUMBER",
              contact_details: "",
              contact_remarks: "",
            },
            {
              id: generateUniqueId("email"),
              index: 1,
              contact_type: "EMAIL ADDRESS",
              contact_details: "",
              contact_remarks: "",
            },
          ]);
          setErrors({});
          setErrorMessage(null);
          hasBeenInitializedWithData.current = false;
          userHasMadeChanges.current = false;
          lastProcessedSelectedContacts.current = null;
        },
        allowSelectedContactsUpdates: () => {
          userHasMadeChanges.current = false;
        },
        validateForm,
        setErrors,
        setErrorMessage,
      }),
      [
        validateForm,
        isFormValid,
        contactLines,
        getBackendFormat,
        formatPhoneNumber,
      ]
    );

    return (
      <Box className="general-form">
        {errorMessage && (
          <Alert severity="error" className="general-form__alert">
            {errorMessage}
          </Alert>
        )}

        {contactLines.map((line, index) => {
          return (
            <Box key={String(line.id)} className="contact-line" sx={{ mb: 2 }}>
              <Grid
                container
                spacing={2}
                className="general-form__grid"
                alignItems="center">
                <Grid item xs={1.5} className="general-form__grid-item">
                  <FormControl
                    fullWidth
                    variant="outlined"
                    disabled={true}
                    className="general-form__select">
                    <InputLabel>Contact Type</InputLabel>
                    <Select
                      name="contact_type"
                      value={line.contact_type}
                      label="Contact Type"
                      IconComponent={() => null}
                      sx={{
                        "& .MuiSelect-select": {
                          color: "rgba(0, 0, 0, 0.6)",
                        },
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "rgba(0, 0, 0, 0.23)",
                        },
                        "& .MuiOutlinedInput-root": {
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: "rgba(0, 0, 0, 0.23)",
                          },
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: "rgba(0, 0, 0, 0.23)",
                            borderWidth: "1px",
                          },
                        },
                      }}>
                      {contactTypeOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          <Box display="flex" alignItems="center" gap={1}>
                            {getContactIcon(option.value)}
                            {option.label}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={2} className="general-form__grid-item">
                  <TextField
                    label="Contact Details"
                    name="contact_details"
                    variant="outlined"
                    fullWidth
                    value={line.contact_details || ""}
                    onChange={(e) =>
                      handleChange(
                        String(line.id),
                        "contact_details",
                        e.target.value
                      )
                    }
                    disabled={isLoading}
                    error={!!errors[`${String(line.id)}_contact_details`]}
                    placeholder={
                      line.contact_type === "MOBILE NUMBER"
                        ? "Enter 10-digit number"
                        : "Enter email address"
                    }
                    inputProps={{
                      maxLength:
                        line.contact_type === "MOBILE NUMBER" ? 12 : undefined,
                    }}
                    InputProps={
                      line.contact_type === "MOBILE NUMBER"
                        ? {
                            startAdornment: (
                              <InputAdornment position="start">
                                +63
                              </InputAdornment>
                            ),
                          }
                        : {
                            startAdornment: (
                              <InputAdornment position="start">
                                {getContactIcon(line.contact_type)}
                              </InputAdornment>
                            ),
                          }
                    }
                    className="general-form__text-field"
                  />
                </Grid>

                <Grid item xs={8.5} className="general-form__grid-item">
                  <TextField
                    label="Contact Remarks (Optional)"
                    name="contact_remarks"
                    variant="outlined"
                    fullWidth
                    value={line.contact_remarks || ""}
                    onChange={(e) =>
                      handleChange(
                        String(line.id),
                        "contact_remarks",
                        e.target.value
                      )
                    }
                    disabled={isLoading}
                    placeholder="Contact Remarks (Optional)"
                    multiline
                    rows={1}
                    className="general-form__text-field"
                  />
                </Grid>
              </Grid>
            </Box>
          );
        })}
      </Box>
    );
  }
);

ContactForm.displayName = "ContactForm";

export default ContactForm;
