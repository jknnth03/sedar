import { sedarApi } from ".";

const extendedApi = sedarApi.injectEndpoints({
  endpoints: (build) => ({
    changePassword: build.mutation({
      query: ({ currentPassword, newPassword, newPasswordConfirmation }) => ({
        url: "/update-password",
        method: "PATCH",
        body: {
          current_password: currentPassword,
          new_password: newPassword,
          new_password_confirmation: newPasswordConfirmation,
        },
      }),
    }),

    resetPassword: build.mutation({
      query: ({ userId }) => ({
        url: `/users/${userId}/reset-password`,
        method: "PATCH",
      }),
    }),
  }),
});

export const { useChangePasswordMutation, useResetPasswordMutation } =
  extendedApi;
