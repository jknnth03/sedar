import { sedarApi } from "..";

const contactsApi = sedarApi
  .enhanceEndpoints({ addTagTypes: ["Contact", "ContactMaster"] })
  .injectEndpoints({
    endpoints: (build) => ({
      getContacts: build.query({
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

          return { url: `employees/contacts?${params.toString()}` };
        },
        providesTags: (result) =>
          result && result.result && result.result.data
            ? [
                { type: "Contact", id: "LIST" },
                ...result.result.data.map(({ id }) => ({
                  type: "Contact",
                  id,
                })),
              ]
            : [{ type: "Contact", id: "LIST" }],
      }),
      getAllContacts: build.query({
        query: ({
          page = 1,
          per_page = 100,
          status = "active",
          search = "",
          employment_status,
          statuses = [],
        } = {}) => {
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

          if (statuses && statuses.length > 0) {
            params.append("employment_status", statuses.join(","));
          }

          return { url: `employees/contacts?${params.toString()}` };
        },
        providesTags: (result) =>
          result?.result?.data || result?.data || result
            ? [
                { type: "ContactMaster", id: "ALL" },
                ...(result?.result?.data || result?.data || result || []).map(
                  ({ id }) => ({
                    type: "ContactMaster",
                    id,
                  })
                ),
              ]
            : [{ type: "ContactMaster", id: "ALL" }],
      }),
      updateContact: build.mutation({
        query: ({ employeeId, contactId, ...data }) => ({
          url: `employees/${employeeId}/contacts/${contactId}`,
          method: "PATCH",
          body: data,
        }),
        invalidatesTags: (result, error, { contactId }) => [
          { type: "Contact", id: contactId },
          { type: "Contact", id: "LIST" },
          { type: "ContactMaster", id: "ALL" },
        ],
      }),
      deleteContact: build.mutation({
        query: ({ employeeId, contactId }) => ({
          url: `employees/${employeeId}/contacts/${contactId}`,
          method: "DELETE",
        }),
        invalidatesTags: (result, error, { contactId }) => [
          { type: "Contact", id: contactId },
          { type: "Contact", id: "LIST" },
          { type: "ContactMaster", id: "ALL" },
        ],
      }),
    }),
  });

export const {
  useGetContactsQuery,
  useGetAllContactsQuery,
  useUpdateContactMutation,
  useDeleteContactMutation,
} = contactsApi;

export default contactsApi;
