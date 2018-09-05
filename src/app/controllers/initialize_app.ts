import { User } from "../models/entities";
import { FetchableState } from "../models/enums";
import { user as userAPI } from "../services";
import store from "../store";

export const initializeApp = () => {
    const { authentication } = store;
    authentication.fetchState = FetchableState.Fetching;

    userAPI
        .fetchCurrentUser()
        .then((user: User) => {
            authentication.fetchState = FetchableState.Fetched;
            authentication.currentUser = user;
        })
        .catch(error => {
            authentication.fetchState = FetchableState.Error;
            authentication.fetchError = error;
        });
};