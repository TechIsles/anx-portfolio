import { describe, expect, it } from "vitest"

import nextConfig from "../../next.config"

describe("legacy redirects", () => {
  it("redirects only the discovered updater URL and preserves other missing URLs", async () => {
    const redirects = (await nextConfig.redirects?.()) ?? []

    expect(
      redirects.filter(({ source }) => source.startsWith("/scripts/"))
    ).toEqual([
      {
        source: "/scripts/update-skill.py",
        destination:
          "https://raw.githubusercontent.com/AnxForever/stylekit-skill/main/scripts/update-skill.py",
        permanent: true,
      },
    ])
    expect(redirects).toContainEqual({
      source: "/projects",
      destination: "/",
      permanent: true,
    })
    expect(redirects.some(({ source }) => source === "/status")).toBe(false)
  })
})
