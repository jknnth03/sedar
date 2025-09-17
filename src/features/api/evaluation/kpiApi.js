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
          // Added 'me/' prefix back
          const url = queryString
            ? `me/positions?${queryString}`
            : "me/positions";

          // Add debugging
          console.log("Generated URL:", url);
          console.log("Full query object:", {
            url,
            method: "GET",
          });

          return {
            url,
            method: "GET",
          };
        },
        providesTags: ["kpis"],
      }),
      updatePositionKpis: build.mutation({
        query: (body) => {
          // Added 'me/' prefix back
          const url = `me/positions/${body?.id}/kpis`;
          console.log("Update KPI URL:", url);

          return {
            url,
            method: "PUT",
            body: body?.data,
          };
        },
        invalidatesTags: (result, error, { id }) => [
          { type: "kpis", id },
          "kpis",
        ],
      }),
      getPositionKpis: build.query({
        query: (positionId) => {
          // Added 'me/' prefix back
          const url = `me/positions/${positionId}/kpis`;
          console.log("Get Position KPIs URL:", url);

          return {
            url,
            method: "GET",
          };
        },
        providesTags: (result, error, positionId) => [
          { type: "kpis", id: positionId },
          "kpis",
        ],
      }),
    }),
  });

export const {
  useGetTablePositionsQuery,
  useUpdatePositionKpisMutation,
  useGetPositionKpisQuery,
} = kpiApi;

export default kpiApi;
