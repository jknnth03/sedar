import { sedarApi } from "..";

const pdpTwoApi = sedarApi
  .enhanceEndpoints({
    addTagTypes: ["pdpTwo", "pdpTwoList"],
  })
  .injectEndpoints({
    endpoints: (build) => ({
      getPdpTwoList: build.query({
        query: (params) => ({
          url: "da-tasks/pdp",
          method: "GET",
          params: { ...params, type: "PDP2" },
        }),
        providesTags: ["pdpTwoList"],
      }),

      getPdpTwoTask: build.query({
        query: (id) => ({
          url: `da-tasks/pdp/${id}`,
          method: "GET",
          params: { type: "PDP2" },
        }),
        providesTags: (result, error, id) => [{ type: "pdpTwo", id }],
      }),

      getPdpTwoScore: build.query({
        query: (id) => ({
          url: `da-tasks/pdp/${id}/score`,
          method: "GET",
          params: { type: "PDP2" },
        }),
        providesTags: (result, error, id) => [{ type: "pdpTwo", id }],
      }),

      savePdpTwoAsDraft: build.mutation({
        query: ({ id, data }) => ({
          url: `da-tasks/pdp/${id}`,
          method: "PUT",
          body: { ...data, type: "PDP2" },
        }),
        invalidatesTags: (result, error, { id }) => [
          { type: "pdpTwo", id },
          "pdpTwoList",
        ],
      }),

      submitPdpTwo: build.mutation({
        query: ({ id, data }) => ({
          url: `da-tasks/pdp/${id}`,
          method: "PUT",
          body: { ...data, type: "PDP2" },
        }),
        invalidatesTags: (result, error, { id }) => [
          { type: "pdpTwo", id },
          "pdpTwoList",
        ],
      }),
    }),
  });

export const {
  useGetPdpTwoListQuery,
  useGetPdpTwoTaskQuery,
  useGetPdpTwoScoreQuery,
  useSavePdpTwoAsDraftMutation,
  useSubmitPdpTwoMutation,
} = pdpTwoApi;

export default pdpTwoApi;
