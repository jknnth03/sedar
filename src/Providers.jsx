import { RouterProvider } from "react-router";
import router from "./config/router/router.jsx";
import { Provider } from "react-redux";
import { SnackbarProvider } from "notistack";
import "./app/store";
import { store } from "./app/store";

const Providers = () => {
  return (
    <Provider store={store}>
      <SnackbarProvider
        maxSnack={3}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
        <RouterProvider router={router} />
      </SnackbarProvider>
    </Provider>
  );
};

export default Providers;
