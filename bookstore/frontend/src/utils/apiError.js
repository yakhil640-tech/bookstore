export function getApiErrorDetails(error, fallbackMessage = "Something went wrong") {
  const responseBody = error?.response?.data;
  const status = error?.response?.status;
  const fieldErrors =
    responseBody?.data && typeof responseBody.data === "object" && !Array.isArray(responseBody.data)
      ? responseBody.data
      : {};

  if (error?.code === "ECONNABORTED") {
    return {
      message: "Request timed out. The server is taking too long to respond.",
      fieldErrors: {},
      status: null,
      code: "TIMEOUT",
    };
  }

  if (!error?.response) {
    return {
      message: "Backend is not reachable. Please start the server and try again.",
      fieldErrors: {},
      status: null,
      code: "NETWORK",
    };
  }

  if (status === 401) {
    return {
      message: responseBody?.message || "Invalid email or password.",
      fieldErrors: {},
      status,
      code: "UNAUTHORIZED",
    };
  }

  if (status === 403) {
    return {
      message: responseBody?.message || "You do not have permission to perform this action.",
      fieldErrors: {},
      status,
      code: "FORBIDDEN",
    };
  }

  if (Object.keys(fieldErrors).length > 0) {
    const firstValue = Object.values(fieldErrors)[0];
    return {
      message:
        responseBody?.message && responseBody.message !== "Validation failed"
          ? responseBody.message
          : typeof firstValue === "string" && firstValue.trim()
            ? firstValue
            : fallbackMessage,
      fieldErrors,
      status,
      code: "VALIDATION",
    };
  }

  if (typeof responseBody?.message === "string" && responseBody.message.trim()) {
    return {
      message: responseBody.message,
      fieldErrors: {},
      status,
      code: "API",
    };
  }

  if (typeof error?.message === "string" && error.message.trim()) {
    return {
      message: error.message,
      fieldErrors: {},
      status,
      code: "CLIENT",
    };
  }

  return {
    message: fallbackMessage,
    fieldErrors: {},
    status,
    code: "UNKNOWN",
  };
}

export function getApiErrorMessage(error, fallbackMessage = "Something went wrong") {
  return getApiErrorDetails(error, fallbackMessage).message;
}
