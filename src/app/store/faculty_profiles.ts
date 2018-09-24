import { observable } from "mobx";
import FacultyMember from "../models/entities/faculty_member";
import FetchableState from "../models/enums/fetchable_state";

export class FacultyProfilesState {
    @observable
    public fetchState: FetchableState = FetchableState.Unfetched;

    @observable
    public facultyMembers?: FacultyMember[] = undefined;
}

export default new FacultyProfilesState();