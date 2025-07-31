import { sedarApi } from "../index";

export const positionsempApi = sedarApi
  .enhanceEndpoints({ addTagTypes: ["Position"] })
  .injectEndpoints({
    endpoints: (build) => ({
      getPosition: build.query({
        query: ({
          page = 1,
          per_page = 10,
          status = "active",
          search = "",
        }) => ({
          url: `employees/positions?pagination=1&page=${page}&per_page=${per_page}&status=${status}&search=${search}`,
        }),
        providesTags: (result) =>
          result?.result?.data
            ? [
                { type: "Position", id: "LIST" },
                ...result.result.data.map(({ id }) => ({
                  type: "Position",
                  id,
                })),
              ]
            : [{ type: "Position", id: "LIST" }],
      }),

      getAllPosition: build.query({
        query: () => ({
          url: `employees/positions`,
        }),
        providesTags: (result) =>
          result?.result?.data
            ? [
                { type: "Position", id: "ALL" },
                ...result.result.data.map(({ id }) => ({
                  type: "Position",
                  id,
                })),
              ]
            : [{ type: "Position", id: "ALL" }],
      }),

      getPositionById: build.query({
        query: (employeeId) => ({
          url: `employees/${employeeId}/position`,
        }),
        providesTags: (result, error, employeeId) => [
          { type: "Position", id: employeeId },
        ],
      }),

      updatePositionsEmp: build.mutation({
        query: ({ employeeId, ...data }) => ({
          url: `employees/${employeeId}/position`,
          method: "PATCH",
          body: data,
        }),
        invalidatesTags: (result, error, { employeeId }) => [
          { type: "Position", id: employeeId },
          { type: "Position", id: "LIST" },
          { type: "Position", id: "ALL" },
        ],
      }),

      deletePosition: build.mutation({
        query: (employeeId) => {
          if (!employeeId) {
            throw new Error("Employee ID is required for position deletion");
          }
          return {
            url: `employees/${employeeId}/position`,
            method: "DELETE",
          };
        },
        invalidatesTags: (result, error, employeeId) => [
          { type: "Position", id: employeeId },
          { type: "Position", id: "LIST" },
          { type: "Position", id: "ALL" },
        ],
      }),
    }),
  });

export const {
  useGetPositionQuery,
  useGetAllPositionQuery,
  useUpdatePositionsEmpMutation,
  useDeletePositionMutation,
  useGetPositionByIdQuery,
} = positionsempApi;

export default positionsempApi;
