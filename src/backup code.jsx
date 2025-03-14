// // import SubtitlesIcon from "@mui/icons-material/Subtitles";
// // import WorkHistoryIcon from "@mui/icons-material/WorkHistory";
// // import EngineeringIcon from "@mui/icons-material/Engineering";
// // import DataSaverOnIcon from "@mui/icons-material/DataSaverOn";

// // import { MainItem } from "./components/sidebar/components/MainItem"

// //   TITLES: {
// //     name: "Titles",
// //     path: "titles",
// //     icon: (
// //       <SubtitlesIcon
// //         sx={{ marginRight: "10px", marginLeft: "10px", width: "18px" }}
// //       />
// //     ),
// //     icon_on: null,
// //   },
// //   JOB_BANDS: {
// //     name: "Job Bands",
// //     path: "jobbands",
// //     icon: (
// //       <WorkHistoryIcon
// //         sx={{ marginRight: "10px", marginLeft: "10px", width: "18px" }}
// //       />
// //     ),
// //     icon_on: null,
// //   },
// //   POSITIONS: {
// //     name: "Positions",
// //     path: "positions",
// //     icon: (
// //       <EngineeringIcon
// //         sx={{ marginRight: "10px", marginLeft: "10px", width: "18px" }}
// //       />
// //     ),
// //     icon_on: null,
// //   },
// //   EXTRAS: {
// //     name: "Extras",
// //     path: "extras",
// //     icon: (
// //       <DataSaverOnIcon
// //         sx={{ marginRight: "10px", marginLeft: "10px", width: "18px" }}
// //       />
// //     ),
// //     icon_on: null,
// //   },

// // Old MainItem
// // import { Box, Collapse, Typography } from "@mui/material";
// // import React, { useEffect, useState } from "react";
// // import { useLocation, useNavigate } from "react-router";

// // const MenuItem = ({
// //   onClick,
// //   name,
// //   path,
// //   icon,
// //   active,
// //   isChild,
// //   className,
// // }) => {
// //   return (
// //     <Box
// //       key={name}
// //       className={`liststyle ${className} ${active ? "active" : ""}`}
// //       onClick={onClick}
// //       style={{ cursor: "pointer", paddingLeft: isChild ? "32px" : "16px" }}>
// //       <Box className={`icon ${active ? "active-icon" : ""}`}>
// //         {icon || <span className="sidebar__placeholder-icon">📄</span>}
// //       </Box>
// //       <Typography className={`text`}>{name}</Typography>
// //     </Box>
// //   );
// // };

// // export const MainItem = ({
// //   name,
// //   subItem,
// //   path,
// //   icon,
// //   active,
// //   className,
// //   sidebarOpen,
// // }) => {
// //   const navigate = useNavigate();
// //   const location = useLocation();

// //   const [openChildren, setOpenChildren] = useState(false);
// //   const [isParentActive, setIsParentActive] = useState(false);

// //   useEffect(() => {
// //     if (subItem) {
// //       const anyChildActive = Object.values(subItem).some(
// //         (item) => location.pathname === `/${item.path}`
// //       );
// //       setOpenChildren(anyChildActive);
// //       setIsParentActive(anyChildActive);
// //     } else {
// //       const parentIsActive =
// //         location.pathname.split("/")[1] === path.split("/")[1];
// //       setIsParentActive(parentIsActive);
// //     }
// //   }, [location.pathname, subItem, path]);

// //   const handleNavigation = (path) => {
// //     navigate(`../${path}`);
// //   };

// //   const handleChildren = () => {
// //     if (subItem) {
// //       setOpenChildren((prev) => !prev);
// //     } else {
// //       handleNavigation(path);
// //     }
// //   };

// //   return (
// //     <>
// //       <MenuItem
// //         name={name}
// //         subItem={subItem}
// //         path={path}
// //         icon={icon}
// //         active={isParentActive}
// //         onClick={handleChildren}
// //         className={`main-item ${isParentActive ? "active" : ""}`}
// //       />
// //       {subItem && sidebarOpen && (
// //         <Collapse in={openChildren}>
// //           {Object.values(subItem).map((subItem, subindex) => {
// //             const isSubItemActive = location.pathname === `/${subItem.path}`;
// //             return (
// //               <MenuItem
// //                 key={subindex}
// //                 name={subItem.name}
// //                 subItem={subItem.subItem}
// //                 path={subItem.path}
// //                 icon={subItem.icon}
// //                 active={isSubItemActive}
// //                 isChild={true}
// //                 onClick={() => handleNavigation(`${subItem.path}`)}
// //                 className={`sub-item ${isSubItemActive ? "active" : ""}`}
// //               />
// //             );
// //           })}
// //         </Collapse>
// //       )}
// //     </>
// //   );
// // };

// //LOGIN .THEN
// // const submitHandler = (data) => {
// //   console.log("data", data);
// //   login({ username: data.username, password: data.password })
// //     .unwrap()
// //     .then((res) => {
// //       console.log("res", res);
// //     })
// //     .catch((error) => {
// //       console.log("errors FROM BACKEND", error);
// //     });
// // };

// import { TextField, Typography, Box } from "@mui/material";
// import React from "react";
// import Button from "@mui/material/Button";
// import { CONSTANT } from "../../config";
// import "../login/Login.scss";
// import img from "../../assets/business.png";
// import logo from "../../assets/sedar.png";
// import { useForm } from "react-hook-form";
// import { useLoginMutation } from "../../features/api/authApi";
// import { yupResolver } from "@hookform/resolvers/yup";
// import { schema } from "../../schema/ValidationSchema";
// import { useNavigate } from "react-router";

// const Login = () => {
//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//   } = useForm({
//     resolver: yupResolver(schema),
//     defaultValues: {
//       username: "",
//       password: "",
//     },
//   });

//   const [login] = useLoginMutation();
//   const navigate = useNavigate();

//   const submitHandler = async (data) => {
//     try {
//       const res = await login(data).unwrap();
//       console.log(res);
//       navigate("/");
//     } catch (error) {
//       console.error("error from backend", error);
//     }
//   };

//   return (
//     <Box className="login">
//       <form className="login__container" onSubmit={handleSubmit(submitHandler)}>
//         <Box className="login__footer">
//           <img src={logo} alt="logo" width={120} className="login__logo1" />
//           <Typography className="login__textupper" align="center">
//             Welcome to Sedar 2.0
//           </Typography>
//           <Typography className="login__textupper" align="center">
//             Sign in to your Account
//           </Typography>
//         </Box>

//         <TextField
//           {...register("username")}
//           className="login__textbox"
//           label={CONSTANT.FIELDS.USERNAME.label}
//           placeholder={CONSTANT.FIELDS.USERNAME.placeholder}
//           error={!!errors.username}
//           helperText={errors.username?.message}
//         />

//         <TextField
//           {...register("password")}
//           className="login__textbox"
//           label={CONSTANT.FIELDS.PASSWORD.label}
//           placeholder={CONSTANT.FIELDS.PASSWORD.placeholder}
//           type="password"
//           error={!!errors.password}
//           helperText={errors.password?.message}
//         />

//         <Button className="login__button" variant="contained" type="submit">
//           {CONSTANT.BUTTONS.LOGIN.label}
//         </Button>

//         <Box className="login__footer">
//           <img src={img} alt="business" width={50} />
//           <Typography className="login__textbottom" align="center">
//             Powered By MIS
//           </Typography>
//           <Typography className="login__textbottom" align="center">
//             All rights reserved Copyrights © 2021
//           </Typography>
//         </Box>
//       </form>
//     </Box>
//   );
// };

// export default Login;

// import { TextField, Typography, Box } from "@mui/material";
// import React from "react";
// import Button from "@mui/material/Button";
// import { CONSTANT } from "../../config";
// import "../login/Login.scss";
// import img from "../../assets/business.png";
// import logo from "../../assets/sedar.png";
// import login_logo from "../../assets/login_logo.png";
// import { useForm } from "react-hook-form";
// import { useLoginMutation } from "../../features/api/authApi";
// import { yupResolver } from "@hookform/resolvers/yup";
// import { schema } from "../../schema/ValidationSchema";
// import { useNavigate } from "react-router";
// import { SnackbarProvider, useSnackbar } from "notistack";

// const ImageBox = () => {
//   return (
//     <Box
//       className="login__container1"
//       display="flex"
//       justifyContent="center"
//       alignItems="center">
//       <img src={login_logo} alt="Login Illustration" style={{ width: "90%" }} />
//     </Box>
//   );
// };

// const LoginForm = () => {
//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//   } = useForm({
//     resolver: yupResolver(schema),
//     defaultValues: { username: "", password: "" },
//   });

//   const [login] = useLoginMutation();
//   const navigate = useNavigate();
//   const { enqueueSnackbar } = useSnackbar();

//   const submitHandler = async (data) => {
//     try {
//       await login(data).unwrap();
//       enqueueSnackbar("Login successful!", {
//         variant: "success",
//         autoHideDuration: 3000,
//         anchorOrigin: { vertical: "top", horizontal: "right" },
//       });
//       navigate("/");
//     } catch (error) {
//       enqueueSnackbar(error?.data?.message || "Invalid Credentials", {
//         variant: "error",
//         anchorOrigin: { vertical: "top", horizontal: "right" },
//       });
//       console.error("Error from backend", error);
//     }
//   };

//   return (
//     <Box className="login__container2">
//       <Box className="login__footer">
//         <img src={logo} alt="logo" width={120} className="login__logo1" />
//       </Box>

//       <TextField
//         {...register("username")}
//         className="login__textbox"
//         label={CONSTANT.FIELDS.USERNAME.label}
//         placeholder={CONSTANT.FIELDS.USERNAME.placeholder}
//         error={!!errors.username}
//         helperText={errors.username?.message}
//       />

//       <TextField
//         {...register("password")}
//         className="login__textbox"
//         label={CONSTANT.FIELDS.PASSWORD.label}
//         placeholder={CONSTANT.FIELDS.PASSWORD.placeholder}
//         type="password"
//         error={!!errors.password}
//         helperText={errors.password?.message}
//       />

//       <Button className="login__button" variant="contained" type="submit">
//         {CONSTANT.BUTTONS.LOGIN.label}
//       </Button>

//       <Box className="login__footer">
//         <img src={img} alt="business" width={50} />
//         <Typography className="login__textbottom" align="center">
//           Powered By MIS
//         </Typography>
//         <Typography className="login__textbottom" align="center">
//           All rights reserved Copyrights © 2021
//         </Typography>
//       </Box>
//     </Box>
//   );
// };

// const LoginPage = () => {
//   return (
//     <SnackbarProvider maxSnack={3}>
//       <Box
//         display="flex"
//         width="100vw"
//         height="100vh"
//         justifyContent="center"
//         alignItems="center">
//         <Box display="flex" boxShadow={3}>
//           <ImageBox />
//           <LoginForm />
//         </Box>
//       </Box>
//     </SnackbarProvider>
//   );
// };

// export default LoginPage;

import { TextField, Typography, Box } from "@mui/material";
import React from "react";
import Button from "@mui/material/Button";
import { CONSTANT } from "../../config";
import "../login/Login.scss";
import img from "../../assets/business.png";
import logo from "../../assets/sedar.png";
import { useForm } from "react-hook-form";
import { useLoginMutation } from "../../features/api/authApi";
import { yupResolver } from "@hookform/resolvers/yup";
import { schema } from "../../schema/ValidationSchema";
import { useNavigate } from "react-router";
import { SnackbarProvider, useSnackbar } from "notistack";

const Login = () => {
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
      enqueueSnackbar("Login successful!", {
        variant: "success",
        autoHideDuration: 3000,
      });
      navigate("/");
    } catch (error) {
      enqueueSnackbar(error?.data?.message || "Invalid Credentials", {
        variant: "error",
      });
      console.error("Error from backend", error);
    }
  };

  return (
    <Box className="login">
      <form className="login__container" onSubmit={handleSubmit(submitHandler)}>
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

export default function LoginPage() {
  return (
    <SnackbarProvider maxSnack={3}>
      <Login />
    </SnackbarProvider>
  );
}
