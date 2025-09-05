import { sedarApi } from "..";

const statusApi = sedarApi
  .enhanceEndpoints({ addTagTypes: ["statuses"] })
  .injectEndpoints({
    endpoints: (build) => ({
      getStatuses: build.query({
        query: (params = {}) => {
          const {
            employeeId,
            pagination = 1,
            page = 1,
            per_page = 10,
            status,
            search,
            employment_status,
            ...otherParams
          } = params;

          const queryParams = new URLSearchParams();

          if (pagination) queryParams.append("pagination", pagination);
          if (page) queryParams.append("page", page);
          if (per_page) queryParams.append("per_page", per_page);
          if (status) queryParams.append("status", status);
          if (search) queryParams.append("search", search);

          if (employment_status) {
            if (Array.isArray(employment_status)) {
              employment_status.forEach((empStatus) => {
                queryParams.append("employment_status", empStatus);
              });
            } else {
              queryParams.append("employment_status", employment_status);
            }
          }

          Object.entries(otherParams).forEach(([key, value]) => {
            if (key !== "status" && value !== undefined && value !== null) {
              queryParams.append(key, value);
            }
          });

          const queryString = queryParams.toString();

          let url;
          if (employeeId) {
            url = queryString
              ? `employees/${employeeId}/statuses?${queryString}`
              : `employees/${employeeId}/statuses`;
          } else {
            url = queryString
              ? `employees/statuses?${queryString}`
              : `employees/statuses`;
          }

          return {
            url,
            method: "GET",
          };
        },
        providesTags: (result, error, { employeeId }) => [
          { type: "statuses", id: employeeId || "LIST" },
          "statuses",
        ],
      }),

      getFilteredStatuses: build.query({
        query: ({
          page = 1,
          per_page = 10,
          status = "active",
          search = "",
          status_type,
          employment_status,
        }) => {
          const params = new URLSearchParams({
            pagination: "1",
            page: page.toString(),
            per_page: per_page.toString(),
            status,
            search,
          });

          if (status_type) {
            params.append("status_type", status_type);
          }

          if (employment_status) {
            params.append("employment_status", employment_status);
          }

          return { url: `employees/statuses?${params.toString()}` };
        },
        providesTags: ["statuses"],
      }),

      getSingleStatus: build.query({
        query: ({ employeeId, statusId }) => {
          if (!employeeId) {
            throw new Error("employeeId is required");
          }

          return {
            url: `employees/${employeeId}/statuses`,
            method: "GET",
          };
        },
        transformResponse: (response, meta, { statusId }) => {
          if (response && response.data) {
            if (Array.isArray(response.data)) {
              const status = response.data.find(
                (item) => item.id == statusId || item.status_id == statusId
              );
              return status ? { data: status } : null;
            } else if (
              response.data.data &&
              Array.isArray(response.data.data)
            ) {
              const status = response.data.data.find(
                (item) => item.id == statusId || item.status_id == statusId
              );
              return status ? { data: status } : null;
            } else if (
              response.data.id == statusId ||
              response.data.status_id == statusId
            ) {
              return response;
            }
          }
          return null;
        },
        providesTags: (result, error, { employeeId, statusId }) => [
          { type: "statuses", id: `${employeeId}-${statusId}` },
          { type: "statuses", id: employeeId },
          "statuses",
        ],
      }),

      getStatusAttachment: build.query({
        query: (statusId) => ({
          url: `employees/statuses/${statusId}/attachment`,
          responseHandler: async (response) => {
            if (!response.ok) {
              throw new Error("Failed to fetch attachment");
            }
            return await response.blob();
          },
        }),
        providesTags: (result, error, statusId) => [
          { type: "statuses", id: statusId },
        ],
      }),

      createStatus: build.mutation({
        query: ({ employeeId, data }) => {
          if (!employeeId) {
            throw new Error("employeeId is required");
          }

          return {
            url: `employees/${employeeId}/statuses`,
            method: "POST",
            body: data,
          };
        },
        invalidatesTags: (result, error, { employeeId }) => [
          { type: "statuses", id: employeeId },
          "statuses",
        ],
      }),

      updateStatus: build.mutation({
        query: ({ employeeId, statusEntries, formData, ...otherFields }) => {
          if (!employeeId) {
            throw new Error("employeeId is required");
          }

          if (formData) {
            console.log("Using provided FormData");
            return {
              url: `employees/${employeeId}/statuses`,
              method: "POST",
              body: formData,
            };
          }

          const hasAttachmentFile =
            otherFields.employee_status_attachment instanceof File;

          const hasNewFiles =
            statusEntries &&
            statusEntries.some(
              (entry) => entry.employee_status_attachment instanceof File
            );

          if (hasNewFiles || hasAttachmentFile) {
            const formData = new FormData();

            formData.append("_method", "PATCH");

            Object.keys(otherFields).forEach((key) => {
              if (
                key !== "employee_status_attachment" &&
                otherFields[key] !== undefined &&
                otherFields[key] !== null
              ) {
                if (
                  typeof otherFields[key] === "object" &&
                  otherFields[key] !== null
                ) {
                  formData.append(key, JSON.stringify(otherFields[key]));
                } else {
                  formData.append(key, otherFields[key]);
                }
              }
            });

            if (otherFields.employee_status_attachment instanceof File) {
              formData.append(
                "employee_status_attachment",
                otherFields.employee_status_attachment
              );
            }

            if (statusEntries && Array.isArray(statusEntries)) {
              statusEntries.forEach((entry, index) => {
                Object.keys(entry).forEach((key) => {
                  if (
                    key === "employee_status_attachment" &&
                    entry[key] instanceof File
                  ) {
                    console.log(
                      `Adding new file for entry ${index}:`,
                      entry[key].name
                    );
                    formData.append(
                      `status_entries[${index}][${key}]`,
                      entry[key]
                    );
                  } else if (
                    entry[key] !== undefined &&
                    entry[key] !== null &&
                    key !== "employee_status_attachment" &&
                    key !== "employee_status_attachment_path" &&
                    key !== "isNew" &&
                    key !== "canRemove" &&
                    key !== "isEditable"
                  ) {
                    console.log(
                      `Adding field ${key} for entry ${index}:`,
                      entry[key]
                    );
                    if (typeof entry[key] === "object" && entry[key] !== null) {
                      formData.append(
                        `status_entries[${index}][${key}]`,
                        JSON.stringify(entry[key])
                      );
                    } else {
                      formData.append(
                        `status_entries[${index}][${key}]`,
                        entry[key]
                      );
                    }
                  }
                });
              });
            }

            for (let [key, value] of formData.entries()) {
              console.log(`${key}:`, value);
            }

            return {
              url: `employees/${employeeId}/statuses`,
              method: "POST",
              body: formData,
            };
          } else {
            const payload = { ...otherFields };

            if (statusEntries && Array.isArray(statusEntries)) {
              const cleanedEntries = statusEntries.map((entry) => {
                const cleanedEntry = { ...entry };

                delete cleanedEntry.employee_status_attachment;
                delete cleanedEntry.employee_status_attachment_path;
                delete cleanedEntry.isNew;
                delete cleanedEntry.canRemove;
                delete cleanedEntry.isEditable;

                return cleanedEntry;
              });

              payload.status_entries = cleanedEntries;
            }

            return {
              url: `employees/${employeeId}/statuses`,
              method: "PATCH",
              body: payload,
            };
          }
        },
        invalidatesTags: (result, error, { employeeId }) => [
          { type: "statuses", id: employeeId },
          "statuses",
        ],
      }),

      updateSingleStatus: build.mutation({
        query: ({ employeeId, statusId, data }) => {
          if (!employeeId || !statusId) {
            throw new Error("employeeId and statusId are required");
          }

          const hasFilesArray =
            data.files &&
            data.files.some((file) => file.file_attachment instanceof File);

          const hasAttachmentFile =
            data.employee_status_attachment instanceof File;

          if (hasFilesArray || hasAttachmentFile) {
            const formData = new FormData();

            formData.append("_method", "PATCH");

            Object.keys(data).forEach((key) => {
              if (
                key !== "files" &&
                key !== "employee_status_attachment" &&
                data[key] !== undefined &&
                data[key] !== null
              ) {
                if (typeof data[key] === "object" && data[key] !== null) {
                  formData.append(key, JSON.stringify(data[key]));
                } else {
                  formData.append(key, data[key]);
                }
              }
            });

            if (data.files && Array.isArray(data.files)) {
              data.files.forEach((file, index) => {
                Object.keys(file).forEach((fileKey) => {
                  if (
                    fileKey === "file_attachment" &&
                    file[fileKey] instanceof File
                  ) {
                    formData.append(
                      `files[${index}][${fileKey}]`,
                      file[fileKey]
                    );
                  } else if (
                    file[fileKey] !== undefined &&
                    file[fileKey] !== null
                  ) {
                    formData.append(
                      `files[${index}][${fileKey}]`,
                      file[fileKey]
                    );
                  }
                });
              });
            }

            if (data.employee_status_attachment instanceof File) {
              formData.append(
                "employee_status_attachment",
                data.employee_status_attachment
              );
            }

            return {
              url: `employees/${employeeId}/statuses/${statusId}`,
              method: "POST",
              body: formData,
            };
          } else {
            return {
              url: `employees/${employeeId}/statuses/${statusId}`,
              method: "PATCH",
              body: data,
            };
          }
        },
        invalidatesTags: (result, error, { employeeId, statusId }) => [
          { type: "statuses", id: `${employeeId}-${statusId}` },
          { type: "statuses", id: employeeId },
          "statuses",
        ],
      }),

      deleteStatus: build.mutation({
        query: ({ employeeId, statusId }) => {
          if (!employeeId || !statusId) {
            throw new Error("employeeId and statusId are required");
          }

          return {
            url: `employees/${employeeId}/statuses/${statusId}`,
            method: "DELETE",
          };
        },
        invalidatesTags: (result, error, { employeeId, statusId }) => [
          { type: "statuses", id: `${employeeId}-${statusId}` },
          { type: "statuses", id: employeeId },
          "statuses",
        ],
      }),
    }),
  });

export const {
  useGetStatusesQuery,
  useGetFilteredStatusesQuery,
  useGetSingleStatusQuery,
  useLazyGetSingleStatusQuery,
  useGetStatusAttachmentQuery,
  useCreateStatusMutation,
  useUpdateStatusMutation,
  useUpdateSingleStatusMutation,
  useDeleteStatusMutation,
} = statusApi;

export default statusApi;
