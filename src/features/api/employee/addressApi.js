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
          employment_status,
          statuses = [],
        }) => {
          const params = new URLSearchParams({
            pagination: "1",
            page: page.toString(),
            per_page: per_page.toString(),
            status,
            search,
          });

          // Handle single employment_status
          if (employment_status) {
            params.append("employment_status", employment_status);
          }

          // Handle multiple statuses - send as comma-separated string
          if (statuses && statuses.length > 0) {
            params.append("employment_status", statuses.join(","));
          }

          return { url: `employees/addresses?${params.toString()}` };
        },
        providesTags: (result) =>
          result && result.result && result.result.data
            ? [
                { type: "Address", id: "LIST" },
                ...result.result.data.map(({ id }) => ({
                  type: "Address",
                  id,
                })),
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
        query: (addressId) => ({
          url: `employees/addresses/${addressId}`,
          method: "DELETE",
        }),
        invalidatesTags: (result, error, addressId) => [
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
