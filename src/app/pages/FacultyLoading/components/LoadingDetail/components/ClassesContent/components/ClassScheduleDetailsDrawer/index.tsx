import Button from "@material-ui/core/Button";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import Divider from "@material-ui/core/Divider";
import Grid from "@material-ui/core/Grid";
import List from "@material-ui/core/List";
import Typography from "@material-ui/core/Typography";
import { inject, observer } from "mobx-react";
import * as React from "react";
import DetailItem from "../../../../../../../../components/reusable/DetailItem";
import DrawerForm from "../../../../../../../../components/reusable/DrawerForm";
import FacultyLoadingController from "../../../../../../../../controllers/faculty_loading";
import ClassSchedule from "../../../../../../../../models/entities/class_schedule";
import MeetingDays, {
    MeetingDaysReadable,
} from "../../../../../../../../models/enums/meeting_days";
import MeetingHours, {
    MeetingHoursReadable,
} from "../../../../../../../../models/enums/meeting_hours";
import TermStatus from "../../../../../../../../models/enums/term_status";
import UserType from "../../../../../../../../models/enums/user_type";
import { AuthenticationState } from "../../../../../../../../store/authentication";
import { FacultyLoadingState } from "../../../../../../../../store/faculty_loading";
import AssignAdjunctDialog from "./components/AssignAdjunctDialog";
import AssignFacultyDialog from "./components/AssignFacultyDialog";

interface IPropsType {
    authentication?: AuthenticationState;
    facultyLoading?: FacultyLoadingState;
}

@inject("facultyLoading", "authentication")
@observer
export default class ClassScheduleDetailsDrawer extends React.Component<
    IPropsType
> {
    public onClose = () => {
        FacultyLoadingController.toggleClassScheduleDetails(false);
    };

    public onRemoveClick = (classSchedule: ClassSchedule) => () => {
        if (confirm("Are you sure you want to delete this class?")) {
            FacultyLoadingController.removeClassSchedule(classSchedule).catch(
                (e: Error) =>
                    alert("An error occurred while deleting the class.")
            );
        }
    };

    public onAssignFacultyClick = (shouldShow: boolean) => () => {
        const { facultyLoading } = this.props;
        const { classesTabState } = facultyLoading!;
        const { activeClassSchedule } = classesTabState;
        if (activeClassSchedule!.forAdjunct) {
            FacultyLoadingController.toggleAssignAdjunctDialog(shouldShow);
        } else {
            FacultyLoadingController.toggleAssignFacultyDialog(shouldShow);
        }
    };

    public renderActiveClassSchedule = () => {
        const { facultyLoading, authentication } = this.props;
        const { classesTabState, activeTerm } = facultyLoading!;
        const { currentUser } = authentication!;
        const { activeClassSchedule } = classesTabState;
        let facultyName = "No assigned faculty member";
        if (activeClassSchedule!.facultyMember) {
            facultyName = `${activeClassSchedule!.facultyMember!.firstName} ${
                activeClassSchedule!.facultyMember!.lastName
            }`;
        }
        if (activeClassSchedule!.adjunctName) {
            facultyName = activeClassSchedule!.adjunctName!;
        }

        return (
            <Grid container direction="column" spacing={16} wrap="nowrap">
                <Grid item>
                    <List>
                        <DetailItem
                            field="Subject Code"
                            value={activeClassSchedule!.subjectCode}
                        />
                        <DetailItem
                            field="Subject Name"
                            value={activeClassSchedule!.subjectName}
                        />
                        <DetailItem
                            field="Subject Category"
                            value={activeClassSchedule!.subjectCategory}
                        />
                        <DetailItem
                            field="Meeting Days"
                            value={
                                MeetingDaysReadable.get(
                                    activeClassSchedule!.meetingDays
                                ) as MeetingDays
                            }
                        />
                        <DetailItem
                            field="Meeting Hours"
                            value={
                                MeetingHoursReadable.get(
                                    activeClassSchedule!.meetingHours
                                ) as MeetingHours
                            }
                        />
                        <DetailItem
                            field="Section"
                            value={activeClassSchedule!.shortTitle}
                        />
                        <DetailItem
                            field="Room"
                            value={activeClassSchedule!.room}
                        />
                        <DetailItem
                            field="Course"
                            value={activeClassSchedule!.course}
                        />
                        <DetailItem
                            field="For Adjunct"
                            value={
                                activeClassSchedule!.forAdjunct ? "Yes" : "No"
                            }
                        />
                    </List>
                </Grid>

                {activeTerm!.status === TermStatus.Initializing && (
                    <Grid item>
                        <CardActions>
                            <Button
                                variant="outlined"
                                color="secondary"
                                onClick={this.onRemoveClick(
                                    activeClassSchedule!
                                )}
                            >
                                Remove
                            </Button>
                        </CardActions>
                    </Grid>
                )}

                <Grid item>
                    <CardContent>
                        <Typography variant="overline">
                            Assigned Faculty Member
                        </Typography>
                        <Typography variant="h6">{facultyName}</Typography>
                    </CardContent>
                    {activeTerm!.status === TermStatus.Scheduling &&
                        currentUser!.authorization ===
                            UserType.AssociateDean && (
                            <CardActions>
                                <Button
                                    onClick={this.onAssignFacultyClick(true)}
                                    color="primary"
                                    variant="outlined"
                                >
                                    Choose Faculty Member
                                </Button>
                            </CardActions>
                        )}
                </Grid>
                <Grid item>
                    <Divider />
                </Grid>
                <AssignFacultyDialog />
                <AssignAdjunctDialog />
            </Grid>
        );
    };

    public render() {
        const { facultyLoading } = this.props;
        const { classesTabState } = facultyLoading!;
        const {
            classScheduleDetailsState,
            activeClassSchedule,
        } = classesTabState;
        return (
            <DrawerForm
                disablePadding
                open={classScheduleDetailsState.isShowing}
                onClose={this.onClose}
                formTitle={
                    activeClassSchedule
                        ? `${activeClassSchedule.subjectCode} ${
                              activeClassSchedule.section
                          }`
                        : "Class Details"
                }
            >
                {activeClassSchedule && this.renderActiveClassSchedule()}
            </DrawerForm>
        );
    }
}
