import { sedarApi } from "..";

const addressApi = sedarApi
  .enhanceEndpoints({ addTagTypes: ["Address"] })
  .injectEndpoints({
    endpoints: (build) => ({
      // Fetch a paginated list of addresses
      getAddress: build.query({
        query: ({
          page = 1,
          per_page = 10,
          status = "active",
          search = "",
        }) => ({
          url: `employees/addresses?pagination=1&page=${page}&per_page=${per_page}&status=${status}&search=${search}`,
        }),
        providesTags: (result) =>
          result && result.data
            ? [
                { type: "Address", id: "LIST" },
                ...result.data.map(({ id }) => ({ type: "Address", id })),
              ]
            : [{ type: "Address", id: "LIST" }],
      }),

      updateAddress: build.mutation({
        query: ({ id, ...data }) => ({
          url: `employees/addresses/${id}`,
          method: "PUT",
          body: data,
        }),
        invalidatesTags: (result, error, { id }) => [
          { type: "Address", id },
          { type: "Address", id: "LIST" },
        ],
      }),

      deleteAddress: build.mutation({
        query: (id) => ({
          url: `employees/addresses/${id}`,
          method: "DELETE",
        }),
        invalidatesTags: (result, error, id) => [
          { type: "Address", id },
          { type: "Address", id: "LIST" },
        ],
      }),
    }),
  });

export const {
  useGetAddressQuery,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
} = addressApi;
