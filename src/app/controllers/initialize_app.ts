import User from "../models/entities/user";
import FetchableState from "../models/enums/fetchable_state";
import UserService from "../services/user";
import store from "../store";

export default () => {
    const { authentication } = store;
    authentication.fetchState = FetchableState.Fetching;

    UserService.fetchCurrentUser()
        .then((user: User) => {
            authentication.fetchState = FetchableState.Fetched;
            authentication.currentUser = user;
        })
        .catch((error: Error) => {
            authentication.fetchState = FetchableState.Error;
            authentication.fetchError = error.message;
        });
};
