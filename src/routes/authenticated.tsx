import type { LoaderArgs } from "@remix-run/node";

export const loader = ({ request }: LoaderArgs) => {
  return new Response(
    `
    <style>
      body {
        background-color: rgb(44, 44, 44);
      }
    </style>
    <script>
      window.location.href = new URL("${
        new URL(request.url).origin
      }/api/auth/callback?" + new URLSearchParams(window.location.hash.replace("#", "?")).toString());
    </script>
    `,
    {
      headers: new Headers({ "Content-Type": "text/html" }),
    }
  );
};
