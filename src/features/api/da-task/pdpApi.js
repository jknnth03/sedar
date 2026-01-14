import { sedarApi } from "..";

const pdpApi = sedarApi
  .enhanceEndpoints({
    addTagTypes: ["pdp", "pdpList"],
  })
  .injectEndpoints({
    endpoints: (build) => ({
      getPdpList: build.query({
        query: (params) => ({
          url: "da-tasks/pdp",
          method: "GET",
          params: params,
        }),
        providesTags: ["pdpList"],
      }),

      getPdpTask: build.query({
        query: (id) => ({
          url: `da-tasks/pdp/${id}`,
          method: "GET",
        }),
        providesTags: (result, error, id) => [{ type: "pdp", id }],
      }),

      getPdpScore: build.query({
        query: (id) => ({
          url: `da-tasks/pdp/${id}/score`,
          method: "GET",
        }),
        providesTags: (result, error, id) => [{ type: "pdp", id }],
      }),

      savePdpAsDraft: build.mutation({
        query: ({ id, data }) => ({
          url: `da-tasks/pdp/${id}`,
          method: "PUT",
          body: data,
        }),
        invalidatesTags: (result, error, { id }) => [
          { type: "pdp", id },
          "pdpList",
        ],
      }),

      submitPdp: build.mutation({
        query: ({ id, data }) => ({
          url: `da-tasks/pdp/${id}`,
          method: "PUT",
          body: data,
        }),
        invalidatesTags: (result, error, { id }) => [
          { type: "pdp", id },
          "pdpList",
        ],
      }),
    }),
  });

export const {
  useGetPdpListQuery,
  useGetPdpTaskQuery,
  useGetPdpScoreQuery,
  useSavePdpAsDraftMutation,
  useSubmitPdpMutation,
} = pdpApi;

export default pdpApi;
