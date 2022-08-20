export const css = (...args) => {
  return args
    .map((arg) => {
      if (typeof arg === "string") {
        return arg;
      }

      if (typeof arg === "object") {
        return Object.entries(arg)
          .filter(([key, value]) => value)
          .map(([key]) => key)
          .join(" ");
      }
    })
    .join(" ");
};
