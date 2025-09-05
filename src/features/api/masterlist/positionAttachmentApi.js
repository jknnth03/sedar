import { sedarApi } from "..";

const positionAttachmentApi = sedarApi
  .enhanceEndpoints({ addTagTypes: ["PositionAttachment"] })
  .injectEndpoints({
    endpoints: (build) => ({
      getPositionAttachment: build.query({
        query: (positionId) => {
          if (
            !positionId ||
            positionId === "undefined" ||
            positionId === "null"
          ) {
            throw new Error("Invalid position ID provided");
          }

          return {
            url: `positions/${positionId}/attachment`,
            responseHandler: (response) => response.blob(),
          };
        },
        providesTags: (result, error, positionId) => [
          { type: "PositionAttachment", id: positionId },
        ],
        transformErrorResponse: (response, meta, arg) => {
          console.error(
            "Position attachment error:",
            response,
            "for positionId:",
            arg
          );
          return response;
        },
      }),
    }),
  });

export const { useGetPositionAttachmentQuery } = positionAttachmentApi;

export default positionAttachmentApi;
