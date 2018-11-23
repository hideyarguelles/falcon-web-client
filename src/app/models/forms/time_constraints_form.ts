import { computed, observable } from "mobx";
import FacultyLoadingFacultyMember from "../entities/faculty_loading_faculty_member";
import TimeConstraint from "../entities/time_constraint";
import MeetingDays from "../enums/meeting_days";

export default class TimeConstraintsForm {
    @observable
    public timeConstraints: TimeConstraint[] = [];

    @observable
    public hasExternalLoad: boolean = false;

    @computed
    get mondayThursdayCount(): number {
        return this.timeConstraints.filter(
            tc => tc.meetingDays === MeetingDays.MondayThursday
        ).length;
    }

    @computed
    get tuesdayFridayCount(): number {
        return this.timeConstraints.filter(
            tc => tc.meetingDays === MeetingDays.TuesdayFriday
        ).length;
    }

    public prefillForm(flfm: FacultyLoadingFacultyMember) {
        this.timeConstraints = flfm.timeConstraints.map(tc => ({...tc}));
        this.hasExternalLoad = flfm.hasExternalLoad;
    }
}
