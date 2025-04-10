import { sedarApi } from ".";

const extendedApi = sedarApi.injectEndpoints({
  endpoints: (build) => ({
    changePassword: build.mutation({
      query: ({ currentPassword, newPassword, newPasswordConfirmation }) => ({
        url: "/update-password",
        method: "POST",
        body: {
          current_password: currentPassword,
          new_password: newPassword,
          new_password_confirmation: newPasswordConfirmation,
        },
      }),
    }),
  }),
});

export const { useChangePasswordMutation } = extendedApi;
