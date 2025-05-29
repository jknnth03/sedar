import { sedarApi } from "..";

const positionsApi = sedarApi
  .enhanceEndpoints({ addTagTypes: ["Position"] })
  .injectEndpoints({
    endpoints: (build) => ({
      // Fetch a paginated list of positions
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
          result && result.data
            ? [
                { type: "Position", id: "LIST" },
                ...result.data.map(({ id }) => ({ type: "Position", id })),
              ]
            : [{ type: "Position", id: "LIST" }],
      }),

      // Create a new position
      createPosition: build.mutation({
        query: (newPosition) => ({
          url: "employees/positions",
          method: "POST",
          body: newPosition,
        }),
        invalidatesTags: [{ type: "Position", id: "LIST" }],
      }),

      // Update an existing position
      updatePosition: build.mutation({
        query: ({ id, ...patch }) => ({
          url: `employees/positions/${id}`,
          method: "PUT", // or "PATCH" depending on your API
          body: patch,
        }),
        invalidatesTags: (result, error, { id }) => [
          { type: "Position", id },
          { type: "Position", id: "LIST" },
        ],
      }),

      // Delete a position by ID
      deletePosition: build.mutation({
        query: (id) => ({
          url: `employees/positions/${id}`,
          method: "DELETE",
        }),
        invalidatesTags: (result, error, id) => [
          { type: "Position", id },
          { type: "Position", id: "LIST" },
        ],
      }),
    }),
  });

export const {
  useGetPositionQuery,
  useCreatePositionMutation,
  useUpdatePositionMutation,
  useDeletePositionMutation,
} = positionsApi;
