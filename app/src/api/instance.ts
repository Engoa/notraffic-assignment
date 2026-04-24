import ky from "ky"

export const kyInstance = ky.create({
  prefix: import.meta.env.VITE_API_URL,
  hooks: {
    beforeRequest: [
      ({ request }) => {
        request.headers.set("accept", "application/json")
      },
    ],
  },
})
