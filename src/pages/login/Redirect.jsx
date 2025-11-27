import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setCredentials } from "../../features/slice/authSlice";
import { enqueueSnackbar } from "notistack";
import { useLocation, useNavigate } from "react-router";

const Redirect = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { search } = useLocation();
  const query = new URLSearchParams(search);
  const rawData = query.get("data");

  useEffect(() => {
    try {
      const data = JSON.parse(decodeURIComponent(rawData));
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      if (data.user.role) {
        localStorage.setItem(
          "userRole",
          JSON.stringify({
            roleId: data.user.role.id,
            roleName: data.user.role.name,
            accessPermissions: data.user.role.access_permissions || [],
          })
        );
      }

      dispatch(
        setCredentials({
          user: data.user,
          token: data.token,
        })
      );

      //   setShouldFetchDashboard(true);

      //   setTimeout(() => {
      //     refetchDashboard();
      //   }, 200);

      enqueueSnackbar("Login successful!", {
        variant: "success",
        autoHideDuration: 3000,
      });
      navigate("/");
    } catch (e) {
      console.log("error", e);
      window.location.href = `https://one.rdfmis.com/`;
    }
  }, [rawData]);
  return;
};

export default Redirect;
