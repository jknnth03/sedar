import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  TextField,
  Typography,
  Button,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { schema } from "../../schema/ValidationSchema";
import { useNavigate, useLocation } from "react-router";
import { useSnackbar } from "notistack";
import logo from "../../assets/sedar.png";
import img from "../../assets/business.png";
import workImg from "../../assets/Work.png";
import { CONSTANT } from "../../config";
import { useDispatch } from "react-redux";
import { setCredentials } from "../../features/slice/authSlice";
import { useLoginMutation } from "../../features/api/authApi";
import { useShowDashboardQuery } from "../../features/api/usermanagement/dashboardApi";
import { Visibility, VisibilityOff } from "@mui/icons-material";

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch();

  const [showPassword, setShowPassword] = useState(false);
  const [shouldFetchDashboard, setShouldFetchDashboard] = useState(false);
  const [login] = useLoginMutation();
  const logoutSnackbarShown = useRef(false);

  const {
    data: dashboardData,
    error: dashboardError,
    isLoading: dashboardLoading,
    refetch: refetchDashboard,
  } = useShowDashboardQuery(undefined, {
    skip: !shouldFetchDashboard,
    refetchOnMountOrArgChange: true,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { username: "", password: "" },
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/");
      return;
    }

    if (location.state?.loggedOut && !logoutSnackbarShown.current) {
      enqueueSnackbar("You have successfully logged out.", {
        variant: "info",
        autoHideDuration: 3000,
      });
      logoutSnackbarShown.current = true;

      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate, enqueueSnackbar]);

  useEffect(() => {
    if (shouldFetchDashboard && dashboardData && !dashboardLoading) {
      setShouldFetchDashboard(false);
    }

    if (shouldFetchDashboard && dashboardError) {
      setShouldFetchDashboard(false);
    }
  }, [dashboardData, dashboardError, dashboardLoading, shouldFetchDashboard]);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const onSubmit = async (data) => {
    try {
      const res = await login(data).unwrap();

      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.user));

      dispatch(
        setCredentials({
          user: res.user,
          token: res.token,
        })
      );

      setShouldFetchDashboard(true);

      setTimeout(() => {
        refetchDashboard();
      }, 200);

      if (res.user.force_password_reset) {
        navigate("/changepass");
      } else {
        enqueueSnackbar("Login successful!", {
          variant: "success",
          autoHideDuration: 3000,
        });
        navigate("/");
      }
    } catch (error) {
      enqueueSnackbar(error?.data?.message || "Invalid Credentials", {
        variant: "error",
        autoHideDuration: 3000,
      });
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #FF6B35 0%, #4A90E2 50%, #FF6B35 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 20% 20%, rgba(255, 107, 53, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(74, 144, 226, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 40% 70%, rgba(255, 193, 7, 0.2) 0%, transparent 50%)
          `,
          zIndex: 1,
        },
      }}>
      <Box
        sx={{
          position: "absolute",
          top: "10%",
          left: "5%",
          width: "60px",
          height: "60px",
          backgroundColor: "#FFD700",
          borderRadius: "50%",
          zIndex: 2,
          opacity: 0.8,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          top: "20%",
          right: "15%",
          width: "40px",
          height: "40px",
          backgroundColor: "#4A90E2",
          borderRadius: "50%",
          zIndex: 2,
          opacity: 0.7,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: "15%",
          left: "10%",
          width: "80px",
          height: "80px",
          backgroundColor: "rgba(255, 107, 53, 0.6)",
          borderRadius: "20px",
          zIndex: 2,
          transform: "rotate(45deg)",
        }}
      />

      <Box
        sx={{
          background: "rgba(255, 255, 255, 0.95)",
          borderRadius: "8px",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15)",
          display: "flex",
          overflow: "hidden",
          maxWidth: "1200px",
          width: "100%",
          minHeight: "700px",
          position: "relative",
          zIndex: 3,
        }}>
        <Box
          sx={{
            flex: 1,
            background: "linear-gradient(135deg, #f8f9ff 0%, #e8f0ff 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            padding: "0",
            overflow: "hidden",
            "@media (max-width: 767.98px)": {
              display: "none",
            },
          }}>
          <img
            src={workImg}
            alt="Work Illustration"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center",
            }}
          />
        </Box>

        <Box
          className="login-form-container"
          sx={{
            flex: 1,
            padding: "20px 50px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            maxWidth: "500px",
            position: "relative",
            paddingTop: "120px",
          }}>
          <Box
            sx={{
              marginBottom: "40px",
              position: "relative",
              marginTop: "-30px",
            }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                textAlign: "left",
              }}>
              <img
                src={logo}
                alt="SEDAR Logo"
                style={{
                  height: "60px",
                  width: "auto",
                }}
              />
            </Box>
            <Typography
              variant="h5"
              sx={{
                fontWeight: "800",
                color: "#FE5313",
                marginBottom: "8px",
                marginTop: "2px",
                textAlign: "center",
              }}>
              WELCOME
            </Typography>
          </Box>

          <form onSubmit={handleSubmit(onSubmit)}>
            <TextField
              {...register("username")}
              fullWidth
              label={CONSTANT.FIELDS.USERNAME.label}
              placeholder={CONSTANT.FIELDS.USERNAME.placeholder}
              error={!!errors.username}
              helperText={errors.username?.message}
              sx={{
                marginBottom: "24px",
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  backgroundColor: "#f8f9fa",
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                  "& fieldset": {
                    borderColor: "#c6c6c6",
                    borderWidth: "1.5px",
                  },
                  "&:hover fieldset": {
                    borderColor: "#4A90E2",
                    borderWidth: "1.5px",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#4A90E2",
                    borderWidth: "2px",
                    boxShadow: "0 0 0 3px rgba(74, 144, 226, 0.1)",
                  },
                },
              }}
            />

            <TextField
              {...register("password")}
              fullWidth
              label={CONSTANT.FIELDS.PASSWORD.label}
              placeholder={CONSTANT.FIELDS.PASSWORD.placeholder}
              type={showPassword ? "text" : "password"}
              error={!!errors.password}
              helperText={errors.password?.message}
              sx={{
                marginBottom: "32px",
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  backgroundColor: "#f8f9fa",
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                  "& fieldset": {
                    borderColor: "#c6c6c6",
                    borderWidth: "1.5px",
                  },
                  "&:hover fieldset": {
                    borderColor: "#4A90E2",
                    borderWidth: "1.5px",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#4A90E2",
                    borderWidth: "2px",
                    boxShadow: "0 0 0 3px rgba(74, 144, 226, 0.1)",
                  },
                },
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={togglePasswordVisibility}
                      edge="end"
                      sx={{ color: "rgba(56, 56, 56, 1)" }}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: "16px",
              }}>
              <Button
                type="submit"
                variant="contained"
                sx={{
                  backgroundColor: "#213D70",
                  borderRadius: "8px",
                  padding: "12px 40px",
                  fontSize: "14px",
                  fontWeight: "600",
                  textTransform: "none",
                  boxShadow: "none",
                  width: "auto",
                  minWidth: "180px",
                  maxWidth: "200px",
                  "&:hover": {
                    backgroundColor: "#1a2f5a",
                    boxShadow: "none",
                  },
                }}>
                LOG IN
              </Button>
            </Box>
          </form>

          <Box
            sx={{
              position: "absolute",
              bottom: "70px",
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              zIndex: 10,
            }}>
            <img
              src={img}
              alt="MIS Logo"
              style={{
                width: "48px",
                height: "48px",
              }}
            />
            <Box sx={{ display: "flex", flexDirection: "column" }}>
              <Typography
                variant="body1"
                sx={{
                  color: "#213D70",
                  fontSize: "16px",
                  fontWeight: "600",
                  lineHeight: 1.2,
                }}>
                Powered By MIS
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "#6c757d",
                  fontSize: "14px",
                  lineHeight: 1.2,
                }}>
                All rights reserved Copyrights © 2021
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default LoginPage;
