import { UserInterface } from "../../ts/interfaces/globalInterfaces";
const createToken = (user: UserInterface) => {
  return { name: user.name, userId: user._id, role: user.role };
};

export default createToken;
