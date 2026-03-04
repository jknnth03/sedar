import { sedarApi } from "..";

const kpiApi = sedarApi
  .enhanceEndpoints({ addTagTypes: ["kpis"] })
  .injectEndpoints({
    endpoints: (build) => ({
      getTablePositions: build.query({
        query: (params = {}) => {
          const {
            pagination = true,
            page = 1,
            per_page = 10,
            status,
            search,
            ...otherParams
          } = params;

          const queryParams = new URLSearchParams();

          queryParams.append("pagination", pagination.toString());
          queryParams.append("page", page.toString());
          queryParams.append("per_page", per_page.toString());

          if (status) {
            queryParams.append("status", status);
          }

          if (search && search.trim() !== "") {
            queryParams.append("search", search.trim());
          }

          Object.entries(otherParams).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
              queryParams.append(key, value.toString());
            }
          });

          const queryString = queryParams.toString();
          const url = queryString
            ? `me/positions?${queryString}`
            : "me/positions";

          return {
            url,
            method: "GET",
          };
        },
        providesTags: ["kpis"],
      }),

      updatePositionKpis: build.mutation({
        query: (body) => ({
          url: `me/positions/${body?.id}/kpis`,
          method: "POST",
          body: body?.data,
        }),
        invalidatesTags: (result, error, { id }) => [
          { type: "kpis", id },
          "kpis",
        ],
      }),

      getPositionKpis: build.query({
        query: (positionId) => ({
          url: `me/positions/${positionId}/kpis`,
          method: "GET",
        }),
        providesTags: (result, error, positionId) => [
          { type: "kpis", id: positionId },
          "kpis",
        ],
      }),

      getKpiAttachment: build.query({
        query: (positionId) => ({
          url: `positions/${positionId}/kpi-attachment`,
          method: "GET",
          responseHandler: async (response) => await response.blob(),
          cache: "no-cache",
        }),
      }),
    }),
  });

export const {
  useGetTablePositionsQuery,
  useUpdatePositionKpisMutation,
  useGetPositionKpisQuery,
  useGetKpiAttachmentQuery,
} = kpiApi;

export default kpiApi;
