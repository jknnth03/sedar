import React, { useEffect } from "react";
import { Box, TextField, Typography, Button } from "@mui/material";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useLoginMutation } from "../../features/api/authApi";
import { schema } from "../../schema/ValidationSchema";
import { useNavigate } from "react-router";
import { useSnackbar } from "notistack";
import logo from "../../assets/sedar.png";
import img from "../../assets/business.png";
import login_logo from "../../assets/login_logo.png";
import { CONSTANT } from "../../config";
import "./Login.scss";
import { useDispatch } from "react-redux";
import { resetAuth, setToken } from "../../features/slice/authSlice";

const LoginForm = () => {
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { username: "", password: "" },
  });

  const [login] = useLoginMutation();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const submitHandler = async (data) => {
    try {
      const res = await login(data).unwrap();
      localStorage.setItem("token", res?.token);
      localStorage.setItem("user", JSON.stringify(res?.user));
      dispatch(setToken(res?.token));
      enqueueSnackbar("Login successful!", {
        variant: "success",
        autoHideDuration: 3000,
      });

      navigate("/");
    } catch (error) {
      enqueueSnackbar(error?.data?.message || "Invalid Credentials", {
        variant: "error",
        autoHideDuration: 3000,
      });
    }
  };

  return (
    <Box className="login__container2">
      <Box className="login__footer">
        <img src={logo} alt="logo" width={120} className="login__logo1" />
        <Typography className="login__textupper" align="center">
          Welcome to Sedar 2.0
        </Typography>
      </Box>

      <form
        onSubmit={handleSubmit(submitHandler)}
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
          type="password"
          error={!!errors.password}
          helperText={errors.password?.message}
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
  );
};

const ImageBox = () => (
  <Box
    className="login__container1"
    display="flex"
    justifyContent="center"
    alignItems="center">
    <img src={login_logo} alt="Login Illustration" style={{ width: "90%" }} />
  </Box>
);

const LoginPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/");
    }
  }, [navigate]);

  return (
    <Box className="login">
      <Box display="flex" boxShadow={3}>
        <ImageBox />
        <LoginForm />
      </Box>
    </Box>
  );
};

export default LoginPage;
