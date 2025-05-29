import { sedarApi } from "..";

const contactsApi = sedarApi
  .enhanceEndpoints({ addTagTypes: ["Contact"] })
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
          result && result.data
            ? [
                { type: "Contact", id: "LIST" },
                ...result.data.map(({ id }) => ({ type: "Contact", id })),
              ]
            : [{ type: "Contact", id: "LIST" }],
      }),

      updateContact: build.mutation({
        query: ({ id, ...data }) => ({
          url: `employees/contacts/${id}`,
          method: "PUT",
          body: data,
        }),
        invalidatesTags: (result, error, { id }) => [
          { type: "Contact", id },
          { type: "Contact", id: "LIST" },
        ],
      }),

      deleteContact: build.mutation({
        query: (id) => ({
          url: `employees/contacts/${id}`,
          method: "DELETE",
        }),
        invalidatesTags: (result, error, id) => [
          { type: "Contact", id },
          { type: "Contact", id: "LIST" },
        ],
      }),
    }),
  });

export const {
  useGetContactsQuery,
  useUpdateContactMutation,
  useDeleteContactMutation,
} = contactsApi;
