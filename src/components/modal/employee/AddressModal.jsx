import React, { useState, useEffect } from "react";
import {
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Box,
  Alert,
  Autocomplete,
  CircularProgress,
} from "@mui/material";
import { useSnackbar } from "notistack";
import { CONSTANT } from "../../../config";
import { useUpdateAddressMutation } from "../../../features/api/employee/addressApi";
import { useGetAllShowBarangaysQuery } from "../../../features/api/administrative/barangaysApi";
import { useGetAllShowMunicipalitiesQuery } from "../../../features/api/administrative/municipalitiesApi";
import { useGetAllShowProvincesQuery } from "../../../features/api/administrative/provincesApi";
import { useGetAllShowRegionsQuery } from "../../../features/api/administrative/regionsApi";

export default function AddressModal({
  open,
  handleClose,
  refetch,
  showArchived,
  selectedAddress,
  employees = [],
}) {
  const [employeeId, setEmployeeId] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [street, setStreet] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [addressRemarks, setAddressRemarks] = useState("");

  // Administrative location states
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedMunicipality, setSelectedMunicipality] = useState(null);
  const [selectedBarangay, setSelectedBarangay] = useState(null);

  const [errorMessage, setErrorMessage] = useState(null);
  const [errors, setErrors] = useState({
    employeeId: false,
    street: false,
    region: false,
    province: false,
    municipality: false,
    barangay: false,
  });

  const [updateAddress, { isLoading: updating }] = useUpdateAddressMutation();
  const { enqueueSnackbar } = useSnackbar();

  // API queries for administrative data
  const { data: regionsData, isLoading: loadingRegions } =
    useGetAllShowRegionsQuery();
  const { data: provincesData, isLoading: loadingProvinces } =
    useGetAllShowProvincesQuery();
  const { data: municipalitiesData, isLoading: loadingMunicipalities } =
    useGetAllShowMunicipalitiesQuery();
  const { data: barangaysData, isLoading: loadingBarangays } =
    useGetAllShowBarangaysQuery();

  // Extract arrays from API responses (following your pattern)
  const regions = regionsData?.result || [];
  const provinces = provincesData?.result || [];
  const municipalities = municipalitiesData?.result || [];
  const barangays = barangaysData?.result || [];

  // Filter data based on selections
  const filteredProvinces = provinces.filter(
    (province) => province.region_id == selectedRegion?.id
  );

  const filteredMunicipalities = municipalities.filter(
    (municipality) => municipality.province_id == selectedProvince?.id
  );

  const filteredBarangays = barangays.filter(
    (barangay) => barangay.city_municipality_id == selectedMunicipality?.id
  );

  useEffect(() => {
    if (open && selectedAddress) {
      // Load existing address data
      setEmployeeId(selectedAddress?.employee_id || "");
      setSelectedEmployee(selectedAddress?.employee || null);
      setStreet(selectedAddress?.street || "");
      setZipCode(selectedAddress?.zip_code || "");
      setAddressRemarks(selectedAddress?.address_remarks || "");

      // Find and set administrative locations based on IDs
      const region = regions.find((r) => r.id == selectedAddress?.region_id);
      const province = provinces.find(
        (p) => p.id == selectedAddress?.province_id
      );
      const municipality = municipalities.find(
        (m) => m.id == selectedAddress?.city_municipality_id
      );
      const barangay = barangays.find(
        (b) => b.id == selectedAddress?.barangay_id
      );

      setSelectedRegion(region || null);
      setSelectedProvince(province || null);
      setSelectedMunicipality(municipality || null);
      setSelectedBarangay(barangay || null);

      setErrorMessage(null);
      setErrors({
        employeeId: false,
        street: false,
        region: false,
        province: false,
        municipality: false,
        barangay: false,
      });
    }
  }, [open, selectedAddress, regions, provinces, municipalities, barangays]);

  // Reset dependent fields when parent changes
  useEffect(() => {
    setSelectedProvince(null);
    setSelectedMunicipality(null);
    setSelectedBarangay(null);
  }, [selectedRegion]);

  useEffect(() => {
    setSelectedMunicipality(null);
    setSelectedBarangay(null);
  }, [selectedProvince]);

  useEffect(() => {
    setSelectedBarangay(null);
  }, [selectedMunicipality]);

  const handleSubmit = async () => {
    setErrorMessage(null);
    let newErrors = {
      employeeId: false,
      street: false,
      region: false,
      province: false,
      municipality: false,
      barangay: false,
    };

    if (!employeeId) newErrors.employeeId = true;
    if (!street.trim()) newErrors.street = true;
    if (!selectedRegion) newErrors.region = true;
    if (!selectedProvince) newErrors.province = true;
    if (!selectedMunicipality) newErrors.municipality = true;
    if (!selectedBarangay) newErrors.barangay = true;

    setErrors(newErrors);

    if (Object.values(newErrors).some((error) => error)) {
      setErrorMessage("Please fill out all required fields.");
      return;
    }

    const payload = {
      employee_id: employeeId,
      region_id: selectedRegion.id,
      province_id: selectedProvince.id,
      city_municipality_id: selectedMunicipality.id,
      barangay_id: selectedBarangay.id,
      street: street.trim(),
      zip_code: zipCode.trim() || null,
      address_remarks: addressRemarks.trim() || null,
    };

    try {
      await updateAddress({ id: selectedAddress.id, ...payload }).unwrap();
      enqueueSnackbar("Address updated successfully!", {
        variant: "success",
        autoHideDuration: 2000,
      });
      refetch();
      handleClose();
    } catch (error) {
      console.error("Error:", error);
      setErrorMessage(
        error?.data?.errors?.employee_id
          ? "This employee already has an address. Please select a different employee."
          : error?.data?.message || "An error occurred. Please try again."
      );
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          backgroundColor: "#E3F2FD",
          fontWeight: "bold",
          fontSize: "1.2rem",
          padding: "12px 16px",
        }}>
        <Box sx={{ marginLeft: "4px", display: "inline-block" }}>
          Edit Address
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box minWidth={400}>
          {errorMessage && (
            <Alert severity="error" sx={{ marginTop: 1 }}>
              {errorMessage}
            </Alert>
          )}

          {(loadingRegions ||
            loadingProvinces ||
            loadingMunicipalities ||
            loadingBarangays) && (
            <Box display="flex" justifyContent="center" my={2}>
              <CircularProgress size={24} />
            </Box>
          )}

          <Autocomplete
            options={employees}
            getOptionLabel={(option) =>
              `${option.employee_code || option.code} - ${
                option.full_name || `${option.first_name} ${option.last_name}`
              }`
            }
            value={selectedEmployee}
            onChange={(event, newValue) => {
              setSelectedEmployee(newValue);
              setEmployeeId(newValue ? newValue.id : "");
            }}
            isOptionEqualToValue={(option, value) => option?.id === value?.id}
            disabled={true} // Always disabled since we're only editing
            renderInput={(params) => (
              <TextField
                {...params}
                label="Employee"
                variant="outlined"
                fullWidth
                margin="dense"
                error={errors.employeeId}
                helperText={errors.employeeId ? "Employee is required" : ""}
                sx={{ marginTop: 3 }}
              />
            )}
          />

          <Autocomplete
            options={regions}
            getOptionLabel={(option) => option.name || ""}
            value={selectedRegion}
            onChange={(event, newValue) => {
              setSelectedRegion(newValue);
            }}
            isOptionEqualToValue={(option, value) => option?.id === value?.id}
            disabled={updating || loadingRegions}
            loading={loadingRegions}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Region"
                variant="outlined"
                fullWidth
                margin="dense"
                error={errors.region}
                helperText={errors.region ? "Region is required" : ""}
              />
            )}
          />

          <Autocomplete
            options={filteredProvinces}
            getOptionLabel={(option) => option.name || ""}
            value={selectedProvince}
            onChange={(event, newValue) => {
              setSelectedProvince(newValue);
            }}
            isOptionEqualToValue={(option, value) => option?.id === value?.id}
            disabled={updating || !selectedRegion || loadingProvinces}
            loading={loadingProvinces}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Province"
                variant="outlined"
                fullWidth
                margin="dense"
                error={errors.province}
                helperText={errors.province ? "Province is required" : ""}
              />
            )}
          />

          <Autocomplete
            options={filteredMunicipalities}
            getOptionLabel={(option) => option.name || ""}
            value={selectedMunicipality}
            onChange={(event, newValue) => {
              setSelectedMunicipality(newValue);
            }}
            isOptionEqualToValue={(option, value) => option?.id === value?.id}
            disabled={updating || !selectedProvince || loadingMunicipalities}
            loading={loadingMunicipalities}
            renderInput={(params) => (
              <TextField
                {...params}
                label="City/Municipality"
                variant="outlined"
                fullWidth
                margin="dense"
                error={errors.municipality}
                helperText={
                  errors.municipality ? "City/Municipality is required" : ""
                }
              />
            )}
          />

          <Autocomplete
            options={filteredBarangays}
            getOptionLabel={(option) => option.name || ""}
            value={selectedBarangay}
            onChange={(event, newValue) => {
              setSelectedBarangay(newValue);
            }}
            isOptionEqualToValue={(option, value) => option?.id === value?.id}
            disabled={updating || !selectedMunicipality || loadingBarangays}
            loading={loadingBarangays}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Barangay"
                variant="outlined"
                fullWidth
                margin="dense"
                error={errors.barangay}
                helperText={errors.barangay ? "Barangay is required" : ""}
              />
            )}
          />

          <TextField
            label="Street"
            variant="outlined"
            fullWidth
            margin="dense"
            value={street}
            onChange={(e) => setStreet(e.target.value)}
            disabled={updating}
            error={errors.street}
            helperText={errors.street ? "Street is required" : ""}
          />

          <TextField
            label="Zip Code (Optional)"
            variant="outlined"
            fullWidth
            margin="dense"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
            disabled={updating}
          />

          <TextField
            label="Address Remarks (Optional)"
            variant="outlined"
            fullWidth
            margin="dense"
            value={addressRemarks}
            onChange={(e) => setAddressRemarks(e.target.value)}
            disabled={updating}
            multiline
            rows={2}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={handleClose} disabled={updating}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={updating}>
          {updating ? (
            "Updating..."
          ) : (
            <>
              {CONSTANT.BUTTONS.ADD.icon2}
              {CONSTANT.BUTTONS.ADD.label2}
            </>
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
