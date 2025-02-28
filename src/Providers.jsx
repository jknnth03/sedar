import { RouterProvider } from "react-router";
import { router } from "./config/router/router";

const Providers = () => {
  return (
    <>
      {" "}
      <RouterProvider router={router} />
    </>
  );
};

export default Providers;
