import { sedarApi } from "..";

const contactsApi = sedarApi
  .enhanceEndpoints({ addTagTypes: ["Contact", "ContactMaster"] })
  .injectEndpoints({
    endpoints: (build) => ({
      // Fetch a paginated list of contacts
      getContacts: build.query({
        query: ({
          page = 1,
          per_page = 10,
          status = "active",
          search = "",
        }) => ({
          url: `employees/contacts?pagination=1&page=${page}&per_page=${per_page}&status=${status}&search=${search}`,
        }),
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

      // Get all contacts (for dropdowns, unpaginated or larger sets)
      getAllContacts: build.query({
        query: ({
          page = 1,
          per_page = 100,
          status = "active",
          search = "",
        } = {}) => ({
          url: `employees/contacts?pagination=1&page=${page}&per_page=${per_page}&status=${status}&search=${search}`,
        }),
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

      // Update contact using PATCH method
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

      // Delete a contact
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
