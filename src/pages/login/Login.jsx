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
import img2 from "../../assets/logo2.png";
import { CONSTANT } from "../../config";
import "./Login.scss";
import { useDispatch } from "react-redux";
import { setToken } from "../../features/slice/authSlice";
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
      console.log("Dashboard data loaded:", dashboardData);
      setShouldFetchDashboard(false);
    }

    if (shouldFetchDashboard && dashboardError) {
      console.error("Dashboard fetch error:", dashboardError);
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
      dispatch(setToken(res.token));

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
    <Box className="login">
      <Box display="flex" boxShadow={3}>
        <Box
          className="login__container1"
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center">
          <img src={img2} alt="Login Illustration" style={{ width: "36%" }} />
          <img
            src={logo}
            alt="logo"
            style={{ width: "40%" }}
            className="login__logo1"
          />
        </Box>

        <Box className="login__container2">
          <Box className="login__footer">
            <Typography className="login__title" align="center">
              Login your account
            </Typography>
          </Box>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="login__textbox-container">
            <TextField
              {...register("username")}
              className="login__textbox"
              label={CONSTANT.FIELDS.USERNAME.label}
              placeholder={CONSTANT.FIELDS.USERNAME.placeholder}
              error={!!errors.username}
              helperText={errors.username?.message}
            />

            <TextField
              {...register("password")}
              className="login__textbox"
              label={CONSTANT.FIELDS.PASSWORD.label}
              placeholder={CONSTANT.FIELDS.PASSWORD.placeholder}
              type={showPassword ? "text" : "password"}
              error={!!errors.password}
              helperText={errors.password?.message}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={togglePasswordVisibility} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button className="login__button" variant="contained" type="submit">
              {CONSTANT.BUTTONS.LOGIN.label}
            </Button>
          </form>

          <Box className="login__footer">
            <img src={img} alt="business" width={50} />
            <Typography className="login__textbottom" align="center">
              Powered By MIS
            </Typography>
            <Typography className="login__textbottom" align="center">
              All rights reserved Copyrights © 2021
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default LoginPage;
