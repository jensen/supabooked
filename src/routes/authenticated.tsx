export const loader = () => {
  return new Response(
    `
  <style>
    body {
      background-color: rgb(44, 44, 44);
    }
  </style>
  <script>
    function signIn(body) {
      const data = new FormData();

      data.append("event", "SIGNED_IN");
  
      for (const key in body) {
        data.append(key, body[key]);
      }

      return fetch("/api/auth/callback", {
        method: "post",
        body: data,
      }).then((response) => response.json());
    }

    const params = new URLSearchParams(window.location.hash.replace("#", "?"));

    window.location.hash = "";

    signIn({
      access_token: params.get("access_token"),
      refresh_token: params.get("refresh_token"),
      provider_token: params.get("provider_token") || "",
    }).then(() => window.location = "/");
  </script>
  `,
    {
      headers: new Headers({ "Content-Type": "text/html" }),
    }
  );
};
