import { sedarApi } from ".";

const authApi = sedarApi.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation({
      query: (body) => ({
        url: "/login",
        method: "POST",
        body: body,
      }),
    }),
  }),
});

export const { useLoginMutation } = authApi;
