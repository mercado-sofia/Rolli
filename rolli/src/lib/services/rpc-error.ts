type RpcError = {
  message?: string;
  details?: string;
  code?: string;
};

export function parseRpcError(error: RpcError): string {
  return error.message ?? error.details ?? "Something went wrong";
}

export function parseRevealRpcError(error: RpcError): string {
  const message = parseRpcError(error);

  if (
    error.code === "PGRST202" ||
    message.includes("schema cache") ||
    message.includes("Could not find the function")
  ) {
    return "Reveal is not set up on the database yet. Run migrations 007 and 013 in Supabase SQL Editor, then try again.";
  }

  return message;
}

export function parseGalleryRpcError(error: RpcError): string {
  const message = parseRpcError(error);

  if (
    error.code === "PGRST202" ||
    message.includes("schema cache") ||
    message.includes("Could not find the function")
  ) {
    return "Gallery is not set up on the database yet. Run migration 009 in Supabase SQL Editor, then try again.";
  }

  if (message.includes("Gallery is available after the hangout is completed")) {
    return "The memory gallery opens once everyone has finished guessing.";
  }

  return message;
}
