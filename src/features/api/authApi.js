import { sedarApi } from ".";

const extendedApi = sedarApi.injectEndpoints({
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

export const { useLoginMutation } = extendedApi;
