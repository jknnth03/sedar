import { sedarApi } from "..";

const generalApi = sedarApi
  .enhanceEndpoints({ addTagTypes: ["general"] })
  .injectEndpoints({
    endpoints: (build) => ({
      postGeneral: build.mutation({
        query: (body) => ({
          url: "employees/general-info",
          method: "POST",
          body,
        }),
        invalidatesTags: ["general"],
      }),
      updateGeneral: build.mutation({
        query: ({ id, ...body }) => ({
          url: `employees/${id}/general-info`,
          method: "PATCH",
          body,
        }),
        invalidatesTags: ["general"],
      }),
      getGenerals: build.query({
        query: ({
          page = 1,
          per_page = 10,
          search = "",
          pagination = 1,
          status = "all",
          employment_status = "ACTIVE",
          employee_name,
          team_name,
          id_number,
          date_hired_from,
          date_hired_to,
          employment_type,
          department_name,
          position_title,
          manpower_form,
        }) => {
          const params = new URLSearchParams({
            pagination: pagination.toString(),
            page: page.toString(),
            per_page: per_page.toString(),
            status,
          });

          if (employment_status) {
            params.append("employment_status", employment_status);
          }

          if (search && search.trim()) {
            params.append("search", search);
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

          return { url: `employees/general-info?${params.toString()}` };
        },
        providesTags: ["general"],
      }),
      getAllGenerals: build.query({
        query: () => ({
          url: `employees/general-info?pagination=none&status=all&employment_status=ACTIVE`,
        }),
        providesTags: ["general"],
      }),
      getSingleGeneral: build.query({
        query: (id) => ({
          url: `employees/${id}/general-info`,
        }),
        providesTags: ["general"],
      }),
      getAllManpower: build.query({
        query: ({
          page = 1,
          per_page = 10,
          status = "active",
          search = "",
        }) => ({
          url: `mrf/open?pagination=1&page=${page}&per_page=${per_page}&status=${status}&search=${search}`,
        }),
        providesTags: ["general"],
      }),
      getAllManpowerNoPagination: build.query({
        query: () => ({
          url: `mrf/open?pagination=none&status=active`,
        }),
        providesTags: ["general"],
      }),
      getEmployeeStatuses: build.query({
        query: ({
          page = 1,
          per_page = 10,
          status = "active",
          search = "",
          employment_status,
        }) => {
          const params = new URLSearchParams({
            pagination: "1",
            page: page.toString(),
            per_page: per_page.toString(),
            status,
            search,
          });
          if (employment_status) {
            params.append("employment_status", employment_status);
          }
          return { url: `employees/statuses?${params.toString()}` };
        },
        providesTags: ["general"],
      }),
      getAllEmployeeStatuses: build.query({
        query: () => ({
          url: `employees/statuses?pagination=none&status=active`,
        }),
        providesTags: ["general"],
      }),
      deleteGeneral: build.mutation({
        query: (id) => ({
          url: `employees/${id}/general-info`,
          method: "DELETE",
        }),
        invalidatesTags: ["general"],
      }),
    }),
  });

export const {
  usePostGeneralMutation,
  useGetGeneralsQuery,
  useGetAllGeneralsQuery,
  useLazyGetAllGeneralsQuery,
  useGetSingleGeneralQuery,
  useGetAllManpowerQuery,
  useLazyGetAllManpowerQuery,
  useGetAllManpowerNoPaginationQuery,
  useLazyGetAllManpowerNoPaginationQuery,
  useGetEmployeeStatusesQuery,
  useLazyGetEmployeeStatusesQuery,
  useGetAllEmployeeStatusesQuery,
  useLazyGetAllEmployeeStatusesQuery,
  useUpdateGeneralMutation,
  useDeleteGeneralMutation,
} = generalApi;
