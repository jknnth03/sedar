// import { sedarApi } from ".";

// const unitsApi = sedarApi
//   .enhanceEndpoints({ addTagTypes: ["units"] })
//   .injectEndpoints({
//     endpoints: (build) => ({
//       getUnits: build.query({
//         query: () => ({
//           url: "/units",
//         }),
//         providesTags: ["units"],
//       }),
//     }),
//   });

// export const { useGetUnitsQuery } = unitsApi;

import { sedarApi } from ".";

const unitsApi = sedarApi
  .enhanceEndpoints({ addTagTypes: ["units", "showUnits"] })
  .injectEndpoints({
    endpoints: (build) => ({
      postUnits: build.mutation({
        query: (body) => ({
          url: "units/sync",
          method: "POST",
          body: body,
        }),
        invalidatesTags: ["units"],
      }),

      getShowUnits: build.query({
        query: (params) => ({
          url: `units?page=${params.page}&per_page=${params.per_page}&status=${params.status}&search=${params.search}`,
        }),
        providesTags: ["showUnits"],
      }),
    }),
  });

export const { usePostUnitsMutation, useGetShowUnitsQuery } = unitsApi;
