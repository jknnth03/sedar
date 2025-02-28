import { TextField, Typography, Box } from "@mui/material";
import React from "react";
import Button from "@mui/material/Button";
import { CONSTANT } from "../../config";
import "../login/Login.scss";
import img from "../../assets/business.png";
import logo from "../../assets/sedar.png";

const Login = () => {
  return (
    <Box className="login">
      <form className="login__container">
        <Box className="login__footer">
          <img src={logo} alt="logo" width={120} className="login__logo1" />
          <Typography className="login__textupper" align="center">
            Welcome to Sedar 2.0
          </Typography>
          <Typography className="login__textupper" align="center">
            Sign in to your Account
          </Typography>
        </Box>

        <TextField
          className="login__textbox"
          label={CONSTANT.FIELDS.USERNAME.label}
          placeholder={CONSTANT.FIELDS.USERNAME.placeholder}
        />
        <TextField
          className="login__textbox"
          label={CONSTANT.FIELDS.PASSWORD.label}
          placeholder={CONSTANT.FIELDS.PASSWORD.placeholder}
        />
        <Button className="login__button" variant="contained">
          {CONSTANT.BUTTONS.LOGIN.label}
        </Button>
        <Box className="login__footer">
          <img src={img} alt="business" width={50} />
          <Typography className="login__textbottom" align="center">
            Powered By MIS
          </Typography>
          <Typography className="login__textbottom" align="center">
            All rights reserved Copyrights © 2021
          </Typography>
        </Box>
      </form>
    </Box>
  );
};

export default Login;
