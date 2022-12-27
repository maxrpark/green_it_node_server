import { UnauthorizedError } from "../errors";
import { UserPayload } from "../ts/interfaces/globalInterfaces";

const checkPermissions = (
  requestUser: UserPayload,
  resourceUserId?: Object
) => {
  if (
    requestUser.role === "admin" ||
    (resourceUserId && requestUser.userId === resourceUserId.toString()) ||
    requestUser.role === "supervisor"
  ) {
    return;
  } else {
    throw new UnauthorizedError(
      "Only administrator can perform this operations"
    );
  }
};

export default checkPermissions;
