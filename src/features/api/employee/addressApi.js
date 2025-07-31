import { sedarApi } from "..";

const addressApi = sedarApi
  .enhanceEndpoints({ addTagTypes: ["Address"] })
  .injectEndpoints({
    endpoints: (build) => ({
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
        query: ({ employeeId, addressId, ...data }) => ({
          url: `employees/${employeeId}/addresses/${addressId}`,
          method: "PATCH",
          body: data,
        }),
        invalidatesTags: (result, error, { addressId }) => [
          { type: "Address", id: addressId },
          { type: "Address", id: "LIST" },
        ],
      }),

      deleteAddress: build.mutation({
        query: ({ employeeId, addressId }) => ({
          url: `employees/${employeeId}/addresses/${addressId}`,
          method: "DELETE",
        }),
        invalidatesTags: (result, error, { addressId }) => [
          { type: "Address", id: addressId },
          { type: "Address", id: "LIST" },
        ],
      }),

      getAddressById: build.query({
        query: ({ employeeId, addressId }) => ({
          url: `employees/${employeeId}/addresses/${addressId}`,
        }),
        providesTags: (result, error, { addressId }) => [
          { type: "Address", id: addressId },
        ],
      }),
    }),
  });

export const {
  useGetAddressQuery,
  useLazyGetAddressQuery,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
  useGetAddressByIdQuery,
  useLazyGetAddressByIdQuery,
} = addressApi;

export default addressApi;
