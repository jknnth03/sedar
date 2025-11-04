import { sedarApi } from "..";

const pdpApi = sedarApi
  .enhanceEndpoints({
    addTagTypes: ["pdp"],
  })
  .injectEndpoints({
    endpoints: (build) => ({
      getPdpTask: build.query({
        query: () => ({
          url: "da-tasks/pdp/1",
          method: "GET",
        }),
        providesTags: ["pdp"],
      }),

      getPdpScore: build.query({
        query: () => ({
          url: "da-tasks/pdp/1/score",
          method: "GET",
        }),
        providesTags: ["pdp"],
      }),

      savePdpAsDraft: build.mutation({
        query: (data) => ({
          url: "da-tasks/pdp/1",
          method: "PUT",
          body: data,
        }),
        invalidatesTags: ["pdp"],
      }),

      submitPdp: build.mutation({
        query: (data) => ({
          url: "da-tasks/pdp/1",
          method: "PUT",
          body: data,
        }),
        invalidatesTags: ["pdp"],
      }),
    }),
  });

export const {
  useGetPdpTaskQuery,
  useGetPdpScoreQuery,
  useSavePdpAsDraftMutation,
  useSubmitPdpMutation,
} = pdpApi;

export default pdpApi;
