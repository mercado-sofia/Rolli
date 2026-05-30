type RpcError = {
  message?: string;
  details?: string;
  code?: string;
};

export function parseRpcError(error: RpcError): string {
  const message = error.message ?? error.details ?? "Something went wrong";

  if (message.includes("Only the Film Keeper can remove participants")) {
    return "Only the Film Keeper can remove someone from the hangout.";
  }

  if (message.includes("You cannot remove yourself from the hangout")) {
    return "You cannot remove yourself. Use Leave room instead.";
  }

  if (message.includes("Participant not found or already removed")) {
    return "That participant is no longer in the room.";
  }

  if (message.includes("Participants cannot be removed in this hangout phase")) {
    return "Participants cannot be removed at this stage.";
  }

  if (message.includes("Participant list is not available for this hangout phase")) {
    return "The participant list is not available right now.";
  }

  return message;
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
