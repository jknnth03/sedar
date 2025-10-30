import { sedarApi } from "..";

const addressApi = sedarApi
  .enhanceEndpoints({ addTagTypes: ["Address"] })
  .injectEndpoints({
    endpoints: (build) => ({
      getAddress: build.query({
        query: ({
          page = 1,
          per_page = 10,
          status = "all",
          search = "",
          pagination = 1,
          employment_status,
          employee_name,
          team_name,
          id_number,
          date_hired_from,
          date_hired_to,
          employment_type,
          department_name,
          position_title,
          manpower_form,
          statuses = [],
        }) => {
          const params = new URLSearchParams({
            pagination: pagination.toString(),
            page: page.toString(),
            per_page: per_page.toString(),
            status,
          });

          if (search && search.trim()) {
            params.append("search", search);
          }

          if (employment_status) {
            params.append("employment_status", employment_status);
          }

          if (employee_name) {
            params.append("employee_name", employee_name);
          }

          if (team_name) {
            params.append("team_name", team_name);
          }

          if (id_number) {
            params.append("id_number", id_number);
          }

          if (date_hired_from) {
            params.append("date_hired_from", date_hired_from);
          }

          if (date_hired_to) {
            params.append("date_hired_to", date_hired_to);
          }

          if (employment_type) {
            params.append("employment_type", employment_type);
          }

          if (department_name) {
            params.append("department_name", department_name);
          }

          if (position_title) {
            params.append("position_title", position_title);
          }

          if (manpower_form) {
            params.append("manpower_form", manpower_form);
          }

          if (statuses && statuses.length > 0) {
            params.append("statuses", statuses.join(","));
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
