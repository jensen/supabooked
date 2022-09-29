import type { LoaderArgs } from "@remix-run/node";

export const loader = ({ request }: LoaderArgs) => {
  return new Response(
    `
    <style>
      body {
        background-color: rgb(44, 44, 44);
      }
    </style>
    <form id="auth" action="/api/auth/callback" method="post">
      <input type="hidden" id="credentials" name="credentials" />
    </form>
    <script>
      document.getElementById("credentials").value = window.location.hash.replace("#", "");
      document.getElementById("auth").submit();
    </script>
    `,
    {
      headers: new Headers({ "Content-Type": "text/html" }),
    }
  );
};
