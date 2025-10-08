// import { createSlice } from "@reduxjs/toolkit";

// const initialState = {
//   token: localStorage.getItem("token"),
// };

// const authSlice = createSlice({
//   name: "auth",
//   initialState,
//   reducers: {
//     setToken: (state, action) => {
//       state.token = action.payload;
//     },
//     resetAuth: () => {
//       return initialState;
//     },
//   },
// });

// export const { setToken, resetAuth } = authSlice.actions;

// export default authSlice.reducer;
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  token: localStorage.getItem("token"),
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, token } = action.payload;

      state.user = {
        ...user,
        access_permissions: user.role?.access_permissions || [],
        role_name: user.role?.name || null,
      };
      state.token = token;
      state.isAuthenticated = true;
    },
    setToken: (state, action) => {
      state.token = action.payload;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
    resetAuth: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },
    updateUser: (state, action) => {
      if (state.user) {
        state.user = {
          ...state.user,
          ...action.payload,
          access_permissions:
            action.payload.role?.access_permissions ||
            state.user.access_permissions,
        };
      }
    },
  },
});

export const { setCredentials, setToken, logout, updateUser, resetAuth } =
  authSlice.actions;
export default authSlice.reducer;

export const selectCurrentUser = (state) => state.auth.user;
export const selectCurrentToken = (state) => state.auth.token;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectUserPermissions = (state) =>
  state.auth?.user?.access_permissions || [];
export const selectHasPermission = (permission) => (state) => {
  const permissions = state.auth?.user?.access_permissions || [];
  return permissions.includes(permission);
};
